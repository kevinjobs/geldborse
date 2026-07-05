"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Pencil, Trash2, XCircle, Zap, Banknote, Gauge, CalendarDays, ArrowLeftToLine, ArrowRightToLine, CalendarIcon } from "lucide-react"
import { AreaChart, Area, ResponsiveContainer } from "recharts"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ACCOUNT_TYPE_CONFIG,
  ASSET_TYPE_CONFIG,
} from "@/lib/account-config"
import { AccountCard } from "@/components/accounts/account-card"
import { AccountDetailModal } from "@/components/accounts/account-detail-modal"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { ProtectedRoute } from "@/components/protected-route"
import { toast } from "sonner"

interface Account {
  id: string
  name: string
  type: string
  accountNumber: string | null
  initialBalance: number
  archived?: boolean
  archivedAt?: string | null
  createdAt?: string
  updatedAt?: string
  _count?: {
    records: number
    assets: number
  }
}

interface Asset {
  id: string
  name: string
  type: string
  amount: number
  accountId: string
  createdAt?: string
  updatedAt?: string
  balances?: Balance[]
}

interface Balance {
  id: string
  amount: number
  recordedAt: string
  assetId: string
  asset?: Asset
  createdAt?: string
  updatedAt?: string
}

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
  const [saving, setSaving] = useState(false)

  const [accountAssets, setAccountAssets] = useState<Record<string, Asset[]>>({})
  const [assetBalances, setAssetBalances] = useState<Record<string, Balance[]>>({})

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [assets, setAssets] = useState<Asset[]>([])
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [assetName, setAssetName] = useState("")
  const [assetType, setAssetType] = useState("DEPOSIT")
  const [assetAmount, setAssetAmount] = useState("")

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [balances, setBalances] = useState<Balance[]>([])
  const [editingBalance, setEditingBalance] = useState<Balance | null>(null)
  const [balanceAmount, setBalanceAmount] = useState("")
  const [balanceDate, setBalanceDate] = useState("")
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
      const res = await fetch("/api/accounts/full", { credentials: 'include' })
      const data = await res.json()
      // 确保data是一个数组
      if (Array.isArray(data)) {
        setAccounts(data)

        // 整理资产和余额数据
        const newAccountAssets: { [key: string]: Asset[] } = {}
        const newAssetBalances: { [key: string]: Balance[] } = {}

        data.forEach((account) => {
          if (account.assets && Array.isArray(account.assets)) {
            newAccountAssets[account.id] = account.assets

            account.assets.forEach((asset: Asset) => {
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

  const fetchAssets = async (accountId: string) => {
    try {
      const res = await fetch(`/api/assets?accountId=${accountId}`, { credentials: 'include' })
      const data = await res.json()
      // 确保data是一个数组
      if (Array.isArray(data)) {
        setAssets(data)
      } else {
        console.error("获取资产列表失败: 响应数据不是数组")
        setAssets([])
      }
    } catch (error) {
      console.error("获取资产列表失败:", error)
      setAssets([])
    }
  }

  const fetchBalances = async (assetId: string) => {
    try {
      const res = await fetch(`/api/balances?assetId=${assetId}`, { credentials: 'include' })
      const data = await res.json()
      // 确保data是一个数组
      if (Array.isArray(data)) {
        setBalances(data)
      } else {
        console.error("获取余额快照列表失败: 响应数据不是数组")
        setBalances([])
      }
    } catch (error) {
      console.error("获取余额快照列表失败:", error)
      setBalances([])
    }
  }

  const handleAdd = () => {
    setEditingAccount(null)
    setAccountName("")
    setAccountType("CASH")
    setAccountNumber("")
    setAccountArchived(false)
    setDialogOpen(true)
  }

  const handleEdit = (account: Account) => {
    setEditingAccount(account)
    setAccountName(account.name)
    setAccountType(account.type)
    setAccountNumber(account.accountNumber || "")
    setAccountArchived(!!account.archived)
    setDialogOpen(true)
  }

  const handleDelete = (account: Account) => {
    setDeletingAccount(account)
    setDeleteDialogOpen(true)
  }

  const handleArchive = async (account: Account) => {
    const newArchived = !account.archived
    try {
      const res = await fetch(`/api/accounts/${account.id}`, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: account.name, type: account.type, accountNumber: account.accountNumber, archived: newArchived }),
      })
      if (res.ok) {
        // 乐观更新：即时切换 accounts 列表中的状态
        setAccounts(prev =>
          prev.map(a => a.id === account.id ? { ...a, archived: newArchived } : a)
        )
        // 乐观更新：即时切换 modal 中的账户状态
        setModalAccount(prev =>
          prev && prev.id === account.id ? { ...prev, archived: newArchived } : prev
        )
        toast.success(newArchived ? "已归档" : "已取消归档")
      } else {
        toast.error("操作失败")
      }
    } catch (error) {
      console.error("归档操作失败:", error)
      toast.error("操作失败")
    }
  }

  const handleSave = async () => {
    if (!accountName.trim()) {
      alert("请输入账户名称")
      return
    }

    setSaving(true)
    try {
      if (editingAccount) {
        const res = await fetch(`/api/accounts/${editingAccount.id}`, {
          method: "PUT",
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name: accountName, type: accountType, accountNumber, archived: accountArchived }),
        })
        if (res.ok) {
          fetchAccounts()
          setDialogOpen(false)
        } else {
          alert("更新失败")
        }
      } else {
        const res = await fetch("/api/accounts", {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: accountName,
            type: accountType,
            accountNumber,
          }),
        })
        if (res.ok) {
          fetchAccounts()
          setDialogOpen(false)
          alert("账户创建成功，请前往添加子资产")
        } else {
          alert("创建失败")
        }
      }
    } catch (error) {
      console.error("保存失败:", error)
      alert("保存失败")
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingAccount) return

    setSaving(true)
    try {
      const res = await fetch(`/api/accounts/${deletingAccount.id}`, {
        method: "DELETE",
        credentials: 'include',
      })
      if (res.ok) {
        fetchAccounts()
        setDeleteDialogOpen(false)
      } else {
        const data = await res.json()
        alert(data.error || "删除失败")
      }
    } catch (error) {
      console.error("删除失败:", error)
      alert("删除失败")
    } finally {
      setSaving(false)
    }
  }

  const handleViewAssets = (account: Account) => {
    setSelectedAccount(account)
    setSelectedAsset(null)
    fetchAssets(account.id)
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
      const res = await fetch(`/api/assets/${asset.id}`, {
        method: "DELETE",
        credentials: 'include',
      })
      if (res.ok) {
        // 更新本地状态，避免重新获取数据
        if (selectedAccount) {
          setAssets(prev => prev.filter(a => a.id !== asset.id))
        }
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
      } else {
        alert("删除失败")
      }
    } catch (error) {
      console.error("删除失败:", error)
      alert("删除失败")
    }
  }

  const handleSaveAsset = async () => {
    if (!assetName.trim()) {
      alert("请输入资产名称")
      return
    }
    if (!editingAsset && !assetAmount) {
      alert("请输入金额")
      return
    }

    setSaving(true)
    try {
      if (editingAsset) {
        const res = await fetch(`/api/assets/${editingAsset.id}`, {
          method: "PUT",
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name: assetName, type: assetType }),
        })
        if (res.ok) {
          const updatedAsset = await res.json()
          // 更新本地状态
          if (selectedAccount) {
            setAssets(prev => prev.map(a => a.id === editingAsset.id ? updatedAsset : a))
          }
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
          alert("更新失败")
        }
      } else {
        const res = await fetch("/api/assets", {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name: assetName, type: assetType, amount: assetAmount, accountId: selectedAccount!.id }),
        })
        if (res.ok) {
          const newAsset = await res.json()
          // 更新本地状态
          if (selectedAccount) {
            setAssets(prev => [...prev, newAsset])
          }
          setAccountAssets(prev => ({
            ...prev,
            [selectedAccount!.id]: [...(prev[selectedAccount!.id] || []), newAsset]
          }))
          // 重新获取账户列表，更新账户总额
          fetchAccounts()
          setAssetDialogOpen(false)
        } else {
          alert("创建失败")
        }
      }
    } catch (error) {
      console.error("保存失败:", error)
      alert("保存失败")
    } finally {
      setSaving(false)
    }
  }

  const handleViewBalances = (asset: Asset) => {
    setSelectedAsset(asset)
    fetchBalances(asset.id)
  }

  const handleAddBalance = () => {
    setEditingBalance(null)
    setBalanceAmount("")
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
    setBalanceDialogOpen(true)
  }

  const handleDeleteBalance = async (balance: Balance) => {
    if (!confirm("确定要删除此余额快照吗？")) return

    try {
      const res = await fetch(`/api/balances/${balance.id}`, {
        method: "DELETE",
        credentials: 'include',
      })
      if (res.ok) {
        if (selectedAsset) {
          fetchBalances(selectedAsset.id)
        }
        const balancesRes = await fetch(`/api/balances?assetId=${balance.assetId}`, { credentials: 'include' })
        const balancesData = await balancesRes.json()
        setAssetBalances((prev) => ({ ...prev, [balance.assetId]: balancesData }))
      } else {
        alert("删除失败")
      }
    } catch (error) {
      console.error("删除失败:", error)
      alert("删除失败")
    }
  }

  const handleSaveBalance = async () => {
    if (!balanceAmount || !balanceDate) {
      alert("请填写金额和时间")
      return
    }

    setSaving(true)
    try {
      if (editingBalance) {
        const res = await fetch(`/api/balances/${editingBalance.id}`, {
          method: "PUT",
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ amount: balanceAmount, recordedAt: new Date(balanceDate).toISOString() }),
        })
        if (res.ok) {
          const updatedBalance = await res.json()
          // 更新本地状态
          if (selectedAsset) {
            setBalances(prev => prev.map(b => b.id === editingBalance.id ? updatedBalance : b))
          }
          if (editingBalance.assetId) {
            setAssetBalances(prev => ({
              ...prev,
              [editingBalance.assetId]: prev[editingBalance.assetId]?.map(b => b.id === editingBalance.id ? updatedBalance : b) || []
            }))
            // 重新获取账户列表，更新账户总额
            fetchAccounts()
          }
          setBalanceDialogOpen(false)
        } else {
          alert("更新失败")
        }
      } else {
        const res = await fetch("/api/balances", {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ amount: balanceAmount, recordedAt: new Date(balanceDate).toISOString(), assetId: selectedAsset!.id }),
        })
        if (res.ok) {
          const newBalance = await res.json()
          // 更新本地状态
          if (selectedAsset) {
            setBalances(prev => [...prev, newBalance])
            setAssetBalances(prev => ({
              ...prev,
              [selectedAsset.id]: [...(prev[selectedAsset.id] || []), newBalance]
            }))
            // 重新获取账户列表，更新账户总额
            fetchAccounts()
          }
          setBalanceDialogOpen(false)
        } else {
          alert("创建失败")
        }
      }
    } catch (error) {
      console.error("保存失败:", error)
      alert("保存失败")
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("zh-CN")
  }

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("zh-CN")
  }

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("zh-CN", {
      style: "currency",
      currency: "CNY",
    })
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

    accounts.forEach((acct) => {
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

    allBalanceDates.forEach((date) => {
      let netSum = 0
      let posSum = 0
      let negSum = 0
      accounts.forEach((acct) => {
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
                  <div className="px-4 lg:px-6">
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      <Card className="border-l-[3px] border-l-primary">
                        <CardHeader className="pb-1">
                          <CardDescription className="flex items-center gap-2 text-xs uppercase tracking-wider">
                            <Banknote className="h-3.5 w-3.5 text-primary" />
                            净资产
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className={`font-mono text-lg md:text-2xl font-bold tracking-tight truncate max-w-full ${kpiData.totalNet < 0 ? "text-destructive" : "text-success"}`}>
                            {formatAmount(kpiData.totalNet)}
                          </div>
                          <div className="h-7 w-full mt-1 mb-1">
                            <ResponsiveContainer width="100%" height={28}>
                              <AreaChart data={kpiTrends.netTrend} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="kpiNetGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                                  </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={1.5} fill="url(#kpiNetGrad)" isAnimationActive={false} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {kpiData.posCount + kpiData.negCount} 个账户
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="border-l-[3px] border-l-success">
                        <CardHeader className="pb-1">
                          <CardDescription className="flex items-center gap-2 text-xs uppercase tracking-wider">
                            <Zap className="h-3.5 w-3.5 text-success" />
                            总资产
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="font-mono text-lg md:text-2xl font-bold tracking-tight truncate max-w-full text-success">
                            {formatAmount(kpiData.totalPos)}
                          </div>
                          <div className="h-7 w-full mt-1 mb-1">
                            <ResponsiveContainer width="100%" height={28}>
                              <AreaChart data={kpiTrends.assetTrend} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="kpiAssetGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0.02} />
                                  </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="total" stroke="var(--color-success)" strokeWidth={1.5} fill="url(#kpiAssetGrad)" isAnimationActive={false} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {kpiData.posCount} 个盈馀账户
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="border-l-[3px] border-l-destructive">
                        <CardHeader className="pb-1">
                          <CardDescription className="flex items-center gap-2 text-xs uppercase tracking-wider">
                            <Gauge className="h-3.5 w-3.5 text-destructive" />
                            总负债
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="font-mono text-lg md:text-2xl font-bold tracking-tight truncate max-w-full text-destructive">
                            {formatAmount(Math.abs(kpiData.totalNeg))}
                          </div>
                          <div className="h-7 w-full mt-1 mb-1">
                            <ResponsiveContainer width="100%" height={28}>
                              <AreaChart data={kpiTrends.liabilityTrend} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="kpiLiabilityGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--destructive)" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="var(--destructive)" stopOpacity={0.02} />
                                  </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="total" stroke="var(--destructive)" strokeWidth={1.5} fill="url(#kpiLiabilityGrad)" isAnimationActive={false} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {kpiData.negCount} 个负债账户
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="border-l-[3px] border-l-[#6366F1]">
                        <CardHeader className="pb-1">
                          <CardDescription className="flex items-center gap-2 text-xs uppercase tracking-wider">
                            <CalendarDays className="h-3.5 w-3.5 text-[#6366F1]" />
                            数据范围
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="font-mono text-xs md:text-sm font-bold tracking-tight text-foreground flex flex-col md:flex-row md:items-center md:gap-0.5 items-start">
                            <span>{kpiData.earliestDate ?? "-"}</span>
                            <span className="text-muted-foreground md:mx-1 text-[10px] leading-none my-0.5 md:my-0">↓</span>
                            <span>{kpiData.latestDate ?? "-"}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {allBalanceDates.length} 个数据点
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  <div className="px-4 lg:px-6">
                    <Card>
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                        <div>
                          <CardTitle>账户管理</CardTitle>
                          <CardDescription className="hidden md:block">管理您的财务账户、资产和余额快照</CardDescription>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Select value={`${sortBy}-${sortDir}`} onValueChange={(v) => {
                            const [by, dir] = v.split("-") as ["balanceAbs" | "lastUpdated", "desc" | "asc"]
                            setSortBy(by)
                            setSortDir(dir)
                          }}>
                            <SelectTrigger className="w-[110px] md:w-[130px] h-7 md:h-8 text-xs">
                              <SelectValue placeholder="排序方式" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="balanceAbs-desc">余额绝对值 ↓</SelectItem>
                              <SelectItem value="balanceAbs-asc">余额绝对值 ↑</SelectItem>
                              <SelectItem value="lastUpdated-desc">最近更新 ↓</SelectItem>
                              <SelectItem value="lastUpdated-asc">最近更新 ↑</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="hidden md:inline">查看日期:</span>
                            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-[120px] md:w-[150px] justify-start text-left font-normal h-7 md:h-8"
                                >
                                  <CalendarIcon className="h-4 w-4 shrink-0" />
                                  <span className="truncate">{snapshotDate || "选择日期"}</span>
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  captionLayout="dropdown"
                                  defaultMonth={new Date(snapshotDate || "2026-06-30" + "T00:00:00")}
                                  selected={snapshotDate ? new Date(snapshotDate + "T00:00:00") : undefined}
                                  onSelect={(date) => {
                                    if (date) {
                                      const y = date.getFullYear()
                                      const m = String(date.getMonth() + 1).padStart(2, "0")
                                      const d = String(date.getDate()).padStart(2, "0")
                                      setSnapshotDate(`${y}-${m}-${d}`)
                                    }
                                    setDatePickerOpen(false)
                                  }}
                                  modifiers={{ hasData: allBalanceDates.map((ds) => new Date(ds + "T00:00:00")) }}
                                  modifiersStyles={{ hasData: { fontWeight: "bold", textDecoration: "underline", textUnderlineOffset: 2 } }}
                                />
                              </PopoverContent>
                            </Popover>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 md:h-8 md:w-8"
                                onClick={() => setSnapshotDate(latestBalanceDate)}
                                title="跳转至最新数据日期"
                              >
                                <ArrowRightToLine className="h-3.5 w-3.5 md:h-4 md:w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 md:h-8 md:w-8"
                                onClick={() => setSnapshotDate(earliestBalanceDate)}
                                title="跳转至最早数据日期"
                              >
                                <ArrowLeftToLine className="h-3.5 w-3.5 md:h-4 md:w-4" />
                              </Button>
                            </div>
                            {snapshotDate && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 md:h-8 md:w-8 text-muted-foreground"
                                onClick={() => setSnapshotDate("")}
                                title="清除日期筛选"
                              >
                                <XCircle className="h-3.5 w-3.5 md:h-4 md:w-4" />
                              </Button>
                            )}
                          </div>
                          <Button onClick={handleAdd} size="sm" className="hidden md:inline-flex h-8">
                            <Plus className="h-4 w-4 mr-1.5" />
                            添加账户
                          </Button>
                        </div>
                      </div>
                      {/* ── Type filter tabs ── */}
                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
                        <button
                          onClick={() => setActiveTypeFilter("all")}
                          className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                            activeTypeFilter === "all"
                              ? "bg-primary text-primary-foreground font-medium"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          全部
                        </button>
                        {Object.entries(ACCOUNT_TYPE_CONFIG).map(([value, config]) => {
                          if (!typeCounts[value]) return null
                          const Icon = config.icon
                          const isActive = activeTypeFilter === value
                          return (
                            <button
                              key={value}
                              onClick={() => setActiveTypeFilter(value)}
                              className={`text-xs px-2.5 py-1 rounded-full transition-colors inline-flex items-center gap-1 ${
                                isActive
                                  ? "bg-primary text-primary-foreground font-medium"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                              }`}
                            >
                              <Icon className="h-3 w-3" />
                              {config.label}
                              <span className="opacity-60">({typeCounts[value]})</span>
                            </button>
                          )
                        })}
                        {archivedCount > 0 && (
                          <button
                            onClick={() => setShowArchived(!showArchived)}
                            className={`text-xs px-2.5 py-1 rounded-full transition-colors inline-flex items-center gap-1 ${
                              showArchived
                                ? "bg-muted-foreground text-background font-medium"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            {showArchived ? "隐藏" : "显示"}归档
                            <span className="opacity-60">({archivedCount})</span>
                          </button>
                        )}
                      </div>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xs max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAccount ? "编辑账户" : "添加账户"}</DialogTitle>
            <DialogDescription>
              {editingAccount ? "修改账户信息" : "创建一个新的财务账户"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accountName">账户名称</Label>
              <Input
                id="accountName"
                placeholder="如：支付宝、微信、中信银行"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountType">账户类型</Label>
              <Select value={accountType} onValueChange={setAccountType}>
                <SelectTrigger>
                  <SelectValue placeholder="选择账户类型" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ACCOUNT_TYPE_CONFIG).map(([value, config]) => {
                    const Icon = config.icon
                    return (
                      <SelectItem key={value} value={value}>
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {config.label}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">账户号码</Label>
              <Input
                id="accountNumber"
                placeholder="可选，如银行卡号"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>
            {editingAccount && (
              <label
                htmlFor="accountArchived"
                className="flex items-start gap-3 rounded-md border border-border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  id="accountArchived"
                  checked={accountArchived}
                  onCheckedChange={(v) => setAccountArchived(v === true)}
                  className="mt-0.5"
                />
                <div className="space-y-0.5">
                  <div className="text-sm font-medium leading-none">归档此账户</div>
                  <p className="text-xs text-muted-foreground">
                    归档后账户将在账户管理与添加收支页面默认隐藏，但不影响总览、快照和导出中的数据计算。
                  </p>
                </div>
              </label>
            )}

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除账户 &quot;{deletingAccount?.name}&quot; 吗？如果该账户有关联收支记录，将无法删除。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={saving}>
              {saving ? "删除中..." : "删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={assetDialogOpen} onOpenChange={setAssetDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAsset ? "编辑资产" : "添加资产"}</DialogTitle>
            <DialogDescription>
              {editingAsset ? "修改资产信息" : "为账户添加新资产"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assetName">资产名称</Label>
              <Input
                id="assetName"
                placeholder="如：活期存款、定期存款、基金"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assetType">资产类型</Label>
              <Select value={assetType} onValueChange={setAssetType}>
                <SelectTrigger>
                  <SelectValue placeholder="选择资产类型" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ASSET_TYPE_CONFIG).map(([value, config]) => {
                    const Icon = config.icon
                    return (
                      <SelectItem key={value} value={value}>
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {config.label}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            {!editingAsset && (
              <div className="space-y-2">
                <Label htmlFor="assetAmount">金额</Label>
                <Input
                  id="assetAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={assetAmount}
                  onChange={(e) => setAssetAmount(e.target.value)}
                />
              </div>
            )}
            {editingAsset && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>余额快照</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-primary hover:text-primary"
                    onClick={() => {
                      setSelectedAsset(editingAsset)
                      handleAddBalance()
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    添加快照
                  </Button>
                </div>
                <div className="border rounded-md max-h-40 overflow-y-auto">
                  {assetBalances[editingAsset.id] && assetBalances[editingAsset.id].length > 0 ? (
                    <div className="divide-y">
                      {[...assetBalances[editingAsset.id]]
                        .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
                        .map((balance) => (
                          <div key={balance.id} className="flex items-center justify-between p-2 hover:bg-muted">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {formatDateTime(balance.recordedAt)}
                              </span>
                              <span className="text-sm font-medium">{formatAmount(balance.amount)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => {
                                  setSelectedAsset(editingAsset)
                                  handleEditBalance(balance)
                                }}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteBalance(balance)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      暂无快照
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssetDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveAsset} disabled={saving}>
              {saving ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={balanceDialogOpen} onOpenChange={setBalanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBalance ? "编辑余额快照" : "添加余额快照"}</DialogTitle>
            <DialogDescription>
              {editingBalance ? "修改余额快照信息" : "记录当前资产余额"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="balanceAmount">金额</Label>
              <Input
                id="balanceAmount"
                type="number"
                step="0.01"
                placeholder="请输入当前资产余额"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="balanceDate">登记时间</Label>
              <Input
                id="balanceDate"
                type="datetime-local"
                value={balanceDate}
                onChange={(e) => setBalanceDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBalanceDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveBalance} disabled={saving}>
              {saving ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
