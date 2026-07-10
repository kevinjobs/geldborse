"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ACCOUNT_TYPE_CONFIG } from "@/lib/account-config"
import { AccountCard } from "@/components/accounts/account-card"
import { AccountDetailModal } from "@/components/accounts/account-detail-modal"
import { ProtectedRoute } from "@/components/protected-route"
import { toast } from "sonner"
import { formatAmount, formatDateTime } from "@/lib/format"
import { api } from "@/lib/api-client"

import { KpiSummaryRow } from "@/components/accounts/kpi-summary-row"
import { AccountToolbar } from "@/components/accounts/account-toolbar"
import { AccountFormDialog, AccountDeleteDialog } from "@/components/accounts/account-form-dialog"
import { AssetFormDialog } from "@/components/accounts/asset-form-dialog"
import { BalanceFormDialog } from "@/components/accounts/balance-form-dialog"
import type { Account, Asset, Balance } from "@/components/accounts/types"

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [assetDialogOpen, setAssetDialogOpen] = useState(false)
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null)
  const [accountName, setAccountName] = useState("")
  const [accountType, setAccountType] = useState("CASH")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountArchived, setAccountArchived] = useState(false)
  const [accountExcludeFromTotal, setAccountExcludeFromTotal] = useState(false)
  const [saving, setSaving] = useState(false)

  const [accountAssets, setAccountAssets] = useState<Record<string, Asset[]>>({})
  const [assetBalances, setAssetBalances] = useState<Record<string, Balance[]>>({})

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [assetName, setAssetName] = useState("")
  const [assetType, setAssetType] = useState("DEPOSIT")
  const [assetAmount, setAssetAmount] = useState("")

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [editingBalance, setEditingBalance] = useState<Balance | null>(null)
  const [balanceAmount, setBalanceAmount] = useState("")
  const [balanceDate, setBalanceDate] = useState("")
  const [balanceNote, setBalanceNote] = useState("")
  const [snapshotDate, setSnapshotDate] = useState<string>("") // "" = current, no filter
  const [modalAccount, setModalAccount] = useState<Account | null>(null)
  const [modalExpandedAssets, setModalExpandedAssets] = useState<Set<string>>(new Set())
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [activeTypeFilter, setActiveTypeFilter] = useState("all")
  const [sortBy, setSortBy] = useState<"balanceAbs" | "lastUpdated">("balanceAbs")
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc")
  const [showArchived, setShowArchived] = useState(false)

  const toggleModalAssetExpand = (assetId: string) => {
    setModalExpandedAssets((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(assetId)) newSet.delete(assetId)
      else newSet.add(assetId)
      return newSet
    })
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      // 使用新的API端点一次性获取所有数据
      const data = await api.get<Account[]>("/api/accounts/full")
      // 确保data是一个数组
      if (Array.isArray(data)) {
        setAccounts(data)

        // 整理资产和余额数据
        const newAccountAssets: { [key: string]: Asset[] } = {}
        const newAssetBalances: { [key: string]: Balance[] } = {}

        data.forEach((account) => {
          if ((account as Account & { assets?: Asset[] }).assets && Array.isArray((account as Account & { assets?: Asset[] }).assets)) {
            const accountWithAssets = account as Account & { assets: Asset[] }
            newAccountAssets[account.id] = accountWithAssets.assets

            accountWithAssets.assets.forEach((asset: Asset) => {
              if (asset.balances && Array.isArray(asset.balances)) {
                newAssetBalances[asset.id] = asset.balances
              }
            })
          }
        })

        // 更新状态
        setAccountAssets(newAccountAssets)
        setAssetBalances(newAssetBalances)
      } else {
        console.error("获取账户列表失败: 响应数据不是数组")
        setAccounts([])
      }
    } catch (error) {
      console.error("获取账户列表失败:", error)
      setAccounts([])
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingAccount(null)
    setAccountName("")
    setAccountType("CASH")
    setAccountNumber("")
    setAccountArchived(false)
    setAccountExcludeFromTotal(false)
    setDialogOpen(true)
  }

  const handleEdit = (account: Account) => {
    setEditingAccount(account)
    setAccountName(account.name)
    setAccountType(account.type)
    setAccountNumber(account.accountNumber || "")
    setAccountArchived(!!account.archived)
    setAccountExcludeFromTotal(!!account.excludeFromTotal)
    setDialogOpen(true)
  }

  const handleDelete = (account: Account) => {
    setDeletingAccount(account)
    setDeleteDialogOpen(true)
  }

  const handleArchive = async (account: Account) => {
    const newArchived = !account.archived
    try {
      await api.put(`/api/accounts/${account.id}`, { name: account.name, type: account.type, accountNumber: account.accountNumber, archived: newArchived })
      // 乐观更新：即时切换 accounts 列表中的状态
      setAccounts(prev =>
        prev.map(a => a.id === account.id ? { ...a, archived: newArchived } : a)
      )
      // 乐观更新：即时切换 modal 中的账户状态
      setModalAccount(prev =>
        prev && prev.id === account.id ? { ...prev, archived: newArchived } : prev
      )
      toast.success(newArchived ? "已归档" : "已取消归档")
    } catch (error) {
      console.error("归档操作失败:", error)
      toast.error("操作失败")
    }
  }

  const handleSave = async () => {
    if (!accountName.trim()) {
      toast.error("请输入账户名称")
      return
    }

    setSaving(true)
    try {
      if (editingAccount) {
        await api.put(`/api/accounts/${editingAccount.id}`, { name: accountName, type: accountType, accountNumber: accountNumber || undefined, archived: accountArchived, excludeFromTotal: accountExcludeFromTotal })
        fetchAccounts()
        setDialogOpen(false)
      } else {
        await api.post("/api/accounts", { name: accountName, type: accountType, accountNumber: accountNumber || undefined, excludeFromTotal: accountExcludeFromTotal })
        fetchAccounts()
        setDialogOpen(false)
        toast.success("账户创建成功，请前往添加子资产")
      }
    } catch (error) {
      console.error("保存失败:", error)
      toast.error("保存失败")
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingAccount) return

    setSaving(true)
    try {
      await api.delete(`/api/accounts/${deletingAccount.id}`)
      fetchAccounts()
      setDeleteDialogOpen(false)
    } catch (e) {
      console.error("删除失败:", e)
      toast.error((e as Error).message || "删除失败")
    } finally {
      setSaving(false)
    }
  }

  const handleAddAsset = () => {
    setEditingAsset(null)
    setAssetName("")
    setAssetType("DEPOSIT")
    setAssetAmount("")
    setAssetDialogOpen(true)
  }

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset)
    setAssetName(asset.name)
    setAssetType(asset.type)
    setAssetDialogOpen(true)
  }

  const handleDeleteAsset = async (asset: Asset) => {
    if (!confirm(`确定要删除资产 "${asset.name}" 吗？`)) return

    try {
      await api.delete(`/api/assets/${asset.id}`)
      // 更新accountAssets
      setAccountAssets(prev => ({
        ...prev,
        [asset.accountId]: prev[asset.accountId]?.filter(a => a.id !== asset.id) || []
      }))
      // 更新assetBalances
      setAssetBalances(prev => {
        const newBalances = { ...prev }
        delete newBalances[asset.id]
        return newBalances
      })
      // 重新获取账户列表，更新账户总额
      fetchAccounts()
      if (selectedAsset?.id === asset.id) {
        setSelectedAsset(null)
      }
    } catch (error) {
      console.error("删除失败:", error)
      toast.error("删除失败")
    }
  }

  const handleSaveAsset = async () => {
    if (!assetName.trim()) {
      toast.error("请输入资产名称")
      return
    }
    if (!editingAsset && !assetAmount) {
      toast.error("请输入金额")
      return
    }

    setSaving(true)
    try {
      if (editingAsset) {
        const updatedAsset = await api.put<Asset>(`/api/assets/${editingAsset.id}`, { name: assetName, type: assetType })
        if (editingAsset.accountId) {
          setAccountAssets(prev => ({
            ...prev,
            [editingAsset.accountId]: prev[editingAsset.accountId]?.map(a => a.id === editingAsset.id ? updatedAsset : a) || []
          }))
        }
        // 重新获取账户列表，更新账户总额
        fetchAccounts()
        setAssetDialogOpen(false)
      } else {
        const newAsset = await api.post<Asset>("/api/assets", { name: assetName, type: assetType, amount: parseFloat(assetAmount) || 0, accountId: selectedAccount!.id })
        setAccountAssets(prev => ({
          ...prev,
          [selectedAccount!.id]: [...(prev[selectedAccount!.id] || []), newAsset]
        }))
        // 重新获取账户列表，更新账户总额
        fetchAccounts()
        setAssetDialogOpen(false)
      }
    } catch (error) {
      console.error("保存失败:", error)
      toast.error("保存失败")
    } finally {
      setSaving(false)
    }
  }

  const handleAddBalance = () => {
    setEditingBalance(null)
    setBalanceAmount("")
    setBalanceNote("")
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    setBalanceDate(`${year}-${month}-${day}T${hours}:${minutes}`)
    setBalanceDialogOpen(true)
  }

  const handleEditBalance = (balance: Balance) => {
    setEditingBalance(balance)
    setBalanceAmount(balance.amount.toString())
    const date = new Date(balance.recordedAt)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    setBalanceDate(`${year}-${month}-${day}T${hours}:${minutes}`)
    setBalanceNote(balance.note || "")
    setBalanceDialogOpen(true)
  }

  const handleDeleteBalance = async (balance: Balance) => {
    if (!confirm("确定要删除此余额快照吗？")) return

    try {
      await api.delete(`/api/balances/${balance.id}`)
      const updatedBalances = await api.get<Balance[]>(`/api/balances?assetId=${balance.assetId}`)
      setAssetBalances((prev) => ({ ...prev, [balance.assetId]: Array.isArray(updatedBalances) ? updatedBalances : [] }))
    } catch (error) {
      console.error("删除失败:", error)
      toast.error("删除失败")
    }
  }

  const handleSaveBalance = async () => {
    if (!balanceAmount || !balanceDate) {
      toast.error("请填写金额和时间")
      return
    }

    setSaving(true)
    try {
      if (editingBalance) {
        const updatedBalance = await api.put<Balance>(`/api/balances/${editingBalance.id}`, { amount: parseFloat(balanceAmount), recordedAt: new Date(balanceDate).toISOString(), note: balanceNote || null })
        if (editingBalance.assetId) {
          setAssetBalances(prev => ({
            ...prev,
            [editingBalance.assetId]: prev[editingBalance.assetId]?.map(b => b.id === editingBalance.id ? updatedBalance : b) || []
          }))
          fetchAccounts()
        }
        setBalanceNote("")
        setBalanceDialogOpen(false)
      } else {
        const newBalance = await api.post<Balance>("/api/balances", { amount: parseFloat(balanceAmount), recordedAt: new Date(balanceDate).toISOString(), assetId: selectedAsset!.id, note: balanceNote || null })
        if (selectedAsset) {
          setAssetBalances(prev => ({
            ...prev,
            [selectedAsset.id]: [...(prev[selectedAsset.id] || []), newBalance]
          }))
          fetchAccounts()
        }
        setBalanceNote("")
        setBalanceDialogOpen(false)
      }
    } catch (error) {
      console.error("保存失败:", error)
      toast.error("保存失败")
    } finally {
      setSaving(false)
    }
  }

  const getLatestBalanceAmount = (assetId: string, defaultAmount: number): number => {
    const balanceList = assetBalances[assetId] || []
    if (balanceList.length === 0) return defaultAmount
    const sortedBalances = [...balanceList].sort(
      (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    )
    return sortedBalances[0].amount
  }

  const getBalanceAtDate = (assetId: string, defaultAmount: number): number => {
    if (!snapshotDate) return getLatestBalanceAmount(assetId, defaultAmount)
    const balanceList = assetBalances[assetId] || []
    if (balanceList.length === 0) return defaultAmount
    const targetDate = new Date(snapshotDate)
    targetDate.setHours(23, 59, 59, 999)
    const sorted = [...balanceList].sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
    const atDate = sorted.find(b => new Date(b.recordedAt) <= targetDate)
    return atDate ? atDate.amount : defaultAmount
  }

  const getAccountTotalAtDate = (account: Account): number => {
    if (!snapshotDate) {
      return (account as { totalAmount?: number }).totalAmount || 0
    }
    const targetDate = new Date(snapshotDate + "T23:59:59.999")
    return computeAccountTotalUpTo(account, targetDate)
  }

  // ── Compute account total at a point in time ──
  const computeAccountTotalUpTo = useCallback((acct: Account, upToDate: Date): number => {
    const assets: Asset[] = accountAssets[acct.id] || []
    const accountRecords: Array<{ id: string; amount: number; date: string; assetId: string | null }> =
      ((acct as Account & { records?: Array<{ id: string; amount: number; date: string; assetId: string | null }> }).records) || []
    const recordsUpToDate = accountRecords.filter((r) => new Date(r.date) <= upToDate)

    if (assets.length > 0) {
      const sortedAssets = [...assets].sort(
        (a, b) => new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime()
      )
      const activeAssetIds = new Set(sortedAssets.map((a) => a.id))
      let total = 0

      for (let i = 0; i < sortedAssets.length; i++) {
        const asset = sortedAssets[i]
        const balanceList = assetBalances[asset.id] || []
        const sortedBalances = [...balanceList].sort(
          (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
        )
        const balanceAtDate = sortedBalances.find((b) => new Date(b.recordedAt) <= upToDate)
        const baseAmount = balanceAtDate
          ? balanceAtDate.amount
          : 0
        const balanceDate = balanceAtDate ? new Date(balanceAtDate.recordedAt) : null

        let assetRecords = recordsUpToDate
          .filter((r) => r.assetId === asset.id && (!balanceDate || new Date(r.date) > balanceDate))
          .reduce((sum, r) => sum + r.amount, 0)

        if (i === 0) {
          const unattributed = recordsUpToDate
            .filter((r) =>
              (r.assetId === null || (r.assetId !== null && !activeAssetIds.has(r.assetId))) &&
              (!balanceDate || new Date(r.date) > balanceDate)
            )
            .reduce((sum, r) => sum + r.amount, 0)
          assetRecords += unattributed
        }

        total += baseAmount + assetRecords
      }
      return total
    }

    const recordsTotal = recordsUpToDate.reduce((sum, r) => sum + r.amount, 0)
    return recordsTotal
  }, [accountAssets, assetBalances])

  // ── Memoized trend data per account (full total per date) ──
  const accountTrends = useMemo(() => {
    const result: Record<string, Array<{ date: string; total: number }>> = {}
    accounts.forEach((acct) => {
      const assets: Asset[] = accountAssets[acct.id] || []

      // Collect all unique dates from this account's balance snapshots
      const dateSet = new Set<string>()
      assets.forEach((asset) => {
        const balances = assetBalances[asset.id] || []
        balances.forEach((b) => {
          dateSet.add(b.recordedAt.slice(0, 10))
        })
      })

      if (dateSet.size === 0) {
        result[acct.id] = []
        return
      }

      const sortedDates = Array.from(dateSet).sort()
      result[acct.id] = sortedDates.map((dateStr) => {
        const targetDate = new Date(dateStr + "T23:59:59.999")
        return { date: dateStr, total: computeAccountTotalUpTo(acct, targetDate) }
      })
    })
    return result
  }, [accounts, accountAssets, assetBalances, computeAccountTotalUpTo])

  // ── Balance change (latest trend point - previous) ──
  const accountBalanceChanges = useMemo(() => {
    const result: Record<string, number | null> = {}
    for (const [id, trend] of Object.entries(accountTrends)) {
      result[id] = trend.length >= 2
        ? trend[trend.length - 1].total - trend[trend.length - 2].total
        : null
    }
    return result
  }, [accountTrends])

  // ── Latest update date per account ──
  const accountLastUpdated = useMemo(() => {
    const result: Record<string, string | null> = {}
    for (const [id, trend] of Object.entries(accountTrends)) {
      result[id] = trend.length > 0 ? trend[trend.length - 1].date : null
    }
    return result
  }, [accountTrends])

  // ── KPI summary data ──
  interface KpiData {
    totalNet: number; totalPos: number; totalNeg: number
    posCount: number; negCount: number
    earliestDate: string | null; latestDate: string | null
  }
  // ── Accounts visible under current archive filter ──
  const visibleAccounts = useMemo(() => {
    return showArchived ? accounts : accounts.filter(a => !a.archived)
  }, [accounts, showArchived])

  const kpiData = useMemo((): KpiData => {
    let totalNet = 0
    let totalPos = 0
    let totalNeg = 0
    let posCount = 0
    let negCount = 0
    let earliestDate: string | null = null
    let latestDate: string | null = null
    const includedAccounts = accounts.filter(a => !a.excludeFromTotal)

    includedAccounts.forEach((acct) => {
      const balance = getAccountTotalAtDate(acct)
      totalNet += balance
      if (balance >= 0) { totalPos += balance; posCount++ }
      else { totalNeg += balance; negCount++ }

      const trend = accountTrends[acct.id]
      if (trend && trend.length > 0) {
        const first = trend[0].date
        const last = trend[trend.length - 1].date
        if (!earliestDate || first < earliestDate) earliestDate = first
        if (!latestDate || last > latestDate) latestDate = last
      }
    })
    return { totalNet, totalPos, totalNeg, posCount, negCount, earliestDate, latestDate }
  }, [accounts, accountTrends, getAccountTotalAtDate])

  // ── Earliest / latest date helpers for quick jump ──
  const allBalanceDates = useMemo(() => {
    const dates = new Set<string>()
    accounts.forEach((acct) => {
      const trend = accountTrends[acct.id]
      if (trend) trend.forEach((p) => dates.add(p.date))
    })
    return Array.from(dates).sort()
  }, [accounts, accountTrends])

  const earliestBalanceDate = allBalanceDates[0] || ""
  const latestBalanceDate = allBalanceDates[allBalanceDates.length - 1] || ""

  // ── KPI trend data (net / assets / liabilities, forward-filled) ──
  const kpiTrends = useMemo(() => {
    const netTrend: Array<{ date: string; total: number }> = []
    const assetTrend: Array<{ date: string; total: number }> = []
    const liabilityTrend: Array<{ date: string; total: number }> = []
    const lastValues: Record<string, number | null> = {}
    const includedAccounts = accounts.filter(a => !a.excludeFromTotal)

    allBalanceDates.forEach((date) => {
      let netSum = 0
      let posSum = 0
      let negSum = 0
      includedAccounts.forEach((acct) => {
        const trend = accountTrends[acct.id]
        if (trend && trend.length > 0) {
          const point = trend.find((p) => p.date === date)
          if (point) lastValues[acct.id] = point.total
          const val = lastValues[acct.id]
          if (val != null) {
            netSum += val
            if (val >= 0) posSum += val
            else negSum += val
          }
        }
      })
      netTrend.push({ date, total: netSum })
      assetTrend.push({ date, total: posSum })
      liabilityTrend.push({ date, total: negSum })
    })
    return { netTrend, assetTrend, liabilityTrend }
  }, [allBalanceDates, accounts, accountTrends])

  // ── Type counts for filter tabs ──
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    visibleAccounts.forEach(a => { counts[a.type] = (counts[a.type] || 0) + 1 })
    return counts
  }, [visibleAccounts])

  // ── Archived account count ──
  const archivedCount = useMemo(() => {
    return accounts.filter(a => a.archived).length
  }, [accounts])

  // ── Filtered and sorted accounts ──
  const filteredAndSortedAccounts = useMemo(() => {
    let result = [...visibleAccounts]
    if (activeTypeFilter !== "all") {
      result = result.filter(a => a.type === activeTypeFilter)
    }
    result.sort((a, b) => {
      if (sortBy === "balanceAbs") {
        const va = Math.abs(getAccountTotalAtDate(a))
        const vb = Math.abs(getAccountTotalAtDate(b))
        return sortDir === "desc" ? vb - va : va - vb
      } else {
        const da = accountLastUpdated[a.id] || ""
        const db = accountLastUpdated[b.id] || ""
        return sortDir === "desc" ? db.localeCompare(da) : da.localeCompare(db)
      }
    })
    return result
  }, [visibleAccounts, activeTypeFilter, sortBy, sortDir, getAccountTotalAtDate, accountLastUpdated])

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar variant="sidebar" />
        <SidebarInset className="flex flex-col h-svh">
          <SiteHeader />
          {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <p>加载中...</p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-y-auto" style={{ scrollbarGutter: "stable" }}>
            <div className="@container/main flex flex-1 flex-col gap-2">
<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                  {/* ── KPI Summary Row ── */}
                  <KpiSummaryRow
                    kpiData={kpiData}
                    kpiTrends={kpiTrends}
                    allBalanceDatesCount={allBalanceDates.length}
                  />
                  <div className="px-4 lg:px-6">
                    <Card>
                    <CardHeader>
                      <AccountToolbar
                        sortBy={sortBy}
                        sortDir={sortDir}
                        onSortChange={(by, dir) => { setSortBy(by); setSortDir(dir) }}
                        snapshotDate={snapshotDate}
                        datePickerOpen={datePickerOpen}
                        onDatePickerOpenChange={setDatePickerOpen}
                        onSnapshotDateChange={setSnapshotDate}
                        allBalanceDates={allBalanceDates}
                        earliestBalanceDate={earliestBalanceDate}
                        latestBalanceDate={latestBalanceDate}
                        onAdd={handleAdd}
                        activeTypeFilter={activeTypeFilter}
                        onActiveTypeFilterChange={setActiveTypeFilter}
                        typeCounts={typeCounts}
                        showArchived={showArchived}
                        onShowArchivedChange={setShowArchived}
                        archivedCount={archivedCount}
                      />
                    </CardHeader>
                    <CardContent className="min-h-[300px]">
                      {filteredAndSortedAccounts.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          {accounts.length === 0 ? "暂无账户" : "没有匹配的账户"}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {filteredAndSortedAccounts.map((account) => (
                            <AccountCard
                              key={account.id}
                              account={account}
                              currentBalance={getAccountTotalAtDate(account)}
                              trendData={accountTrends[account.id] || []}
                              balanceChange={accountBalanceChanges[account.id] ?? null}
                              lastUpdated={accountLastUpdated[account.id] ?? null}
                              onOpenDetail={() => setModalAccount(account)}
                              onAddAsset={() => { setSelectedAccount(account); handleAddAsset() }}
                              onEdit={() => handleEdit(account)}
                              onDelete={() => handleDelete(account)}
                              onArchive={() => handleArchive(account)}
                            />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Floating action button: 添加账户 (mobile only) */}
        <Button
          onClick={handleAdd}
          className="fixed bottom-6 right-6 z-50 h-10 w-10 rounded-full shadow-2xl md:hidden bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </SidebarInset>

      <AccountFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingAccount={editingAccount}
        accountName={accountName}
        onAccountNameChange={setAccountName}
        accountType={accountType}
        onAccountTypeChange={setAccountType}
        accountNumber={accountNumber}
        onAccountNumberChange={setAccountNumber}
        accountArchived={accountArchived}
        onAccountArchivedChange={setAccountArchived}
        accountExcludeFromTotal={accountExcludeFromTotal}
        onAccountExcludeFromTotalChange={setAccountExcludeFromTotal}
        saving={saving}
        onSave={handleSave}
      />

      <AccountDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        deletingAccount={deletingAccount}
        saving={saving}
        onConfirmDelete={handleConfirmDelete}
      />

      <AssetFormDialog
        open={assetDialogOpen}
        onOpenChange={setAssetDialogOpen}
        editingAsset={editingAsset}
        assetName={assetName}
        onAssetNameChange={setAssetName}
        assetType={assetType}
        onAssetTypeChange={setAssetType}
        assetAmount={assetAmount}
        onAssetAmountChange={setAssetAmount}
        assetBalances={assetBalances}
        saving={saving}
        onSave={handleSaveAsset}
        onAddBalance={(asset) => {
          setSelectedAsset(asset)
          handleAddBalance()
        }}
        onEditBalance={(asset, balance) => {
          setSelectedAsset(asset)
          handleEditBalance(balance)
        }}
        onDeleteBalance={(balance) => {
          handleDeleteBalance(balance)
        }}
        formatDateTime={formatDateTime}
        formatAmount={formatAmount}
      />

      <BalanceFormDialog
        open={balanceDialogOpen}
        onOpenChange={setBalanceDialogOpen}
        editingBalance={editingBalance}
        balanceAmount={balanceAmount}
        onBalanceAmountChange={setBalanceAmount}
        balanceDate={balanceDate}
        onBalanceDateChange={setBalanceDate}
        balanceNote={balanceNote}
        onBalanceNoteChange={setBalanceNote}
        saving={saving}
        onSave={handleSaveBalance}
      />

      <AccountDetailModal
        account={modalAccount!}
        open={!!modalAccount}
        onOpenChange={(open) => { if (!open) setModalAccount(null) }}
        assets={modalAccount ? (accountAssets[modalAccount.id] || []) : []}
        balances={assetBalances}
        snapshotDate={snapshotDate}
        expandedAssets={modalExpandedAssets}
        onToggleAssetExpand={toggleModalAssetExpand}
        onAddAsset={() => { if (modalAccount) { setSelectedAccount(modalAccount); handleAddAsset() } }}
        onAddBalance={(asset) => { setSelectedAsset(asset); handleAddBalance() }}
        onEditAsset={(asset) => { if (modalAccount) { setSelectedAccount(modalAccount); handleEditAsset(asset) } }}
        onDeleteAsset={(asset) => handleDeleteAsset(asset)}
        onEditBalance={(balance) => handleEditBalance(balance)}
        onDeleteBalance={(balance) => handleDeleteBalance(balance)}
        onArchive={() => modalAccount && handleArchive(modalAccount)}
        getBalanceAtDate={(assetId, defaultAmount) => getBalanceAtDate(assetId, defaultAmount)}
        getAccountTotal={(acct) => getAccountTotalAtDate(acct)}
      />
    </SidebarProvider>
    </ProtectedRoute>
  )
}
