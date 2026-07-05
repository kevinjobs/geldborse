"use client"

import React, { useState, useEffect, useCallback, useMemo, Fragment } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveTable, ResponsiveTableBody, ResponsiveTableCell, ResponsiveTableHeader, ResponsiveTableRow } from "@/components/responsive-table"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, Zap, PlugZap, Gauge, Banknote, CalendarDays } from "lucide-react"
import {
  getAccountNameColor,
  getAssetTypeConfig,
  AccountDisplay
} from "@/lib/account-config"
import { useAuth } from "@/lib/auth-context"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Account {
  id: string
  name: string
  type: string
  initialBalance: number
  accountNumber?: string
  createdAt: string
  updatedAt: string
  userId: string
}

interface Asset {
  id: string
  name: string
  type: string
  amount: number
  accountId: string
  createdAt: string
  updatedAt: string
}

interface Record {
  id: string
  date: string
  amount: number
  type: string
  accountId: string
  assetId: string | null
  createdAt: string
  updatedAt: string
  account: Account
}

interface Balance {
  id: string
  amount: number
  recordedAt: string
  assetId: string
  asset?: Asset
  createdAt: string
  updatedAt: string
}

interface DailySnapshot {
  id: string
  snapshotAt: string
  accountId: string
  assetId: string | null
  amount: number
  account: Account
  asset: Asset | null
  createdAt: string
  updatedAt: string
}

import { ProtectedRoute } from "@/components/protected-route"

function OverviewPageContent() {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [records, setRecords] = useState<Record[]>([])
  const [balances, setBalances] = useState<Balance[]>([])
  const [snapshots, setSnapshots] = useState<DailySnapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set())
  const [chartPeriod, setChartPeriod] = useState<string>("3")
  const [visibleLines, setVisibleLines] = useState({ net: true, pos: true, neg: false })

  const fetchData = useCallback(async () => {
    try {
      const [accountsRes, assetsRes, recordsRes, balancesRes, snapshotsRes] = await Promise.all([
        fetch("/api/accounts"),
        fetch("/api/assets"),
        fetch("/api/records"),
        fetch("/api/balances"),
        fetch("/api/daily-snapshots"),
      ])

      if (!accountsRes.ok) throw new Error(`Accounts API error: ${accountsRes.status}`)
      if (!assetsRes.ok) throw new Error(`Assets API error: ${assetsRes.status}`)
      if (!recordsRes.ok) throw new Error(`Records API error: ${recordsRes.status}`)
      if (!balancesRes.ok) throw new Error(`Balances API error: ${balancesRes.status}`)
      if (!snapshotsRes.ok) throw new Error(`Snapshots API error: ${snapshotsRes.status}`)

      const accountsData = await accountsRes.json()
      const assetsData = await assetsRes.json()
      const recordsData = await recordsRes.json()
      const balancesData = await balancesRes.json()
      const snapshotsData = await snapshotsRes.json()

      const userAccounts = accountsData.filter((account: Account) => account.userId === user?.id)
      const userAccountIds = new Set(userAccounts.map((account: Account) => account.id))
      const userAssets = assetsData.filter((asset: Asset) => userAccountIds.has(asset.accountId))
      const userAssetIds = new Set(userAssets.map((asset: Asset) => asset.id))
      const userRecords = recordsData.filter((record: Record) => userAccountIds.has(record.accountId))
      const userBalances = balancesData.filter((balance: Balance) => userAssetIds.has(balance.assetId))

      setAccounts(userAccounts)
      setAssets(userAssets)
      setRecords(userRecords)
      setBalances(userBalances)
      setSnapshots(Array.isArray(snapshotsData) ? snapshotsData : [])
    } catch (error) {
      console.error("获取数据失败:", error)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user) {
      fetchData()
    } else {
      setLoading(false)
    }
  }, [user, fetchData])

  const toggleAccountExpand = (accountId: string) => {
    setExpandedAccounts((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(accountId)) {
        newSet.delete(accountId)
      } else {
        newSet.add(accountId)
      }
      return newSet
    })
  }

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("zh-CN", {
      style: "currency",
      currency: "CNY",
    })
  }

  const formatAmountShort = (amount: number) => {
    if (Math.abs(amount) >= 10000) {
      return `${(amount / 10000).toFixed(1)}万`
    }
    return amount.toFixed(0)
  }

  const getAssetsByAccount = (accountId: string): Asset[] => {
    return assets.filter((a) => a.accountId === accountId)
  }

  const getLatestBalanceByAsset = (assetId: string): Balance | null => {
    const assetBalances = balances
      .filter((b) => b.assetId === assetId)
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
    return assetBalances.length > 0 ? assetBalances[0] : null
  }

  const getRecordsByAccount = (accountId: string): Record[] => {
    return records.filter((r) => r.accountId === accountId)
  }

  const getAssetRealTimeTotal = (assetId: string): {
    total: number
    baseType: "balance" | "initial"
    baseAmount: number
    balanceDate: Date | null
  } => {
    const asset = assets.find((a) => a.id === assetId)
    if (!asset) {
      return { total: 0, baseType: "initial", baseAmount: 0, balanceDate: null }
    }

    const latestBalance = getLatestBalanceByAsset(assetId)
    const accountAssets = getAssetsByAccount(asset.accountId).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    const activeAssetIds = new Set(accountAssets.map((a) => a.id))
    const isFirstAsset = accountAssets.length > 0 && accountAssets[0].id === assetId
    const accountRecords = getRecordsByAccount(asset.accountId)

    if (latestBalance) {
      const balanceDate = new Date(latestBalance.recordedAt)
      let recordsAfterBalance = accountRecords
        .filter((r) => r.assetId === assetId && new Date(r.date) > balanceDate)
        .reduce((sum, r) => sum + r.amount, 0)

      if (isFirstAsset) {
        const unattributedSum = accountRecords
          .filter((r) => (r.assetId === null || (r.assetId !== null && !activeAssetIds.has(r.assetId))) &&
            (!balanceDate || new Date(r.date) > balanceDate))
          .reduce((sum, r) => sum + r.amount, 0)
        recordsAfterBalance += unattributedSum
      }

      return {
        total: latestBalance.amount + recordsAfterBalance,
        baseType: "balance",
        baseAmount: latestBalance.amount,
        balanceDate,
      }
    }

    let recordsTotal = accountRecords
      .filter((r) => r.assetId === assetId)
      .reduce((sum, r) => sum + r.amount, 0)

    if (isFirstAsset) {
      const unattributedSum = accountRecords
        .filter((r) => r.assetId === null || (r.assetId !== null && !activeAssetIds.has(r.assetId)))
        .reduce((sum, r) => sum + r.amount, 0)
      recordsTotal += unattributedSum
    }

    return {
      total: recordsTotal,
      baseType: "initial",
      baseAmount: 0,
      balanceDate: null,
    }
  }

  const getAccountTotal = (accountId: string): {
    total: number
    hasBalance: boolean
    baseAmount: number
    recordsTotal: number
  } => {
    const accountAssets = getAssetsByAccount(accountId).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    const accountRecords = getRecordsByAccount(accountId)

    if (accountAssets.length > 0) {
      let baseAmount = 0
      let recordsAfterBalanceTotal = 0
      let hasBalance = false
      const activeAssetIds = new Set(accountAssets.map((a) => a.id))

      for (let i = 0; i < accountAssets.length; i++) {
        const asset = accountAssets[i]
        const latestBalance = getLatestBalanceByAsset(asset.id)
        const balanceDate = latestBalance ? new Date(latestBalance.recordedAt) : null

        if (latestBalance) {
          baseAmount += latestBalance.amount
          hasBalance = true
        }

        let assetRecords = accountRecords
          .filter((r) => r.assetId === asset.id && (!balanceDate || new Date(r.date) > balanceDate))
          .reduce((sum, r) => sum + r.amount, 0)

        if (i === 0) {
          const unattributedSum = accountRecords
            .filter((r) => (r.assetId === null || (r.assetId !== null && !activeAssetIds.has(r.assetId))) &&
              (!balanceDate || new Date(r.date) > balanceDate))
            .reduce((sum, r) => sum + r.amount, 0)
          assetRecords += unattributedSum
        }

        recordsAfterBalanceTotal += assetRecords
      }

      return {
        total: baseAmount + recordsAfterBalanceTotal,
        hasBalance,
        baseAmount,
        recordsTotal: accountRecords.reduce((sum, r) => sum + r.amount, 0),
      }
    }

    const recordsTotal = accountRecords.reduce((sum, r) => sum + r.amount, 0)

    return {
      total: recordsTotal,
      hasBalance: false,
      baseAmount: 0,
      recordsTotal,
    }
  }

  const totalAssets = accounts.reduce((sum, account) => sum + getAccountTotal(account.id).total, 0)
  const totalRecords = records.length
  const totalAccounts = accounts.length

  const snapshotChartData = React.useMemo(() => {
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    const timeMap = new Map<string, number>()
    snapshots
      .filter((s) => new Date(s.snapshotAt) >= oneYearAgo)
      .forEach((s) => {
        timeMap.set(s.snapshotAt, (timeMap.get(s.snapshotAt) || 0) + s.amount)
      })

    return Array.from(timeMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, total]) => ({
        date,
        total,
      }))
  }, [snapshots])

  // ── Compute account total at a given date ──
  const getAccountTotalAtDate = (accountId: string, upToDate: Date): number => {
    const accountAssetsList = getAssetsByAccount(accountId).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    const accountRecordsUpTo = getRecordsByAccount(accountId).filter((r) => new Date(r.date) <= upToDate)
    const activeAssetIds = new Set(accountAssetsList.map((a) => a.id))

    if (accountAssetsList.length > 0) {
      let total = 0
      for (let i = 0; i < accountAssetsList.length; i++) {
        const asset = accountAssetsList[i]
        const assetBals = balances
          .filter((b) => b.assetId === asset.id)
          .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
        const balAtDate = assetBals.find((b) => new Date(b.recordedAt) <= upToDate)
        const baseAmt = balAtDate ? balAtDate.amount : 0
        const balDate = balAtDate ? new Date(balAtDate.recordedAt) : null

        let assetRecs = accountRecordsUpTo
          .filter((r) => r.assetId === asset.id && (!balDate || new Date(r.date) > balDate))
          .reduce((sum, r) => sum + r.amount, 0)

        if (i === 0) {
          const unattributed = accountRecordsUpTo
            .filter((r) =>
              (r.assetId === null || (r.assetId !== null && !activeAssetIds.has(r.assetId))) &&
              (!balDate || new Date(r.date) > balDate)
            )
            .reduce((sum, r) => sum + r.amount, 0)
          assetRecs += unattributed
        }

        total += baseAmt + assetRecs
      }
      return total
    }

    return accountRecordsUpTo.reduce((sum, r) => sum + r.amount, 0)
  }

  // ── Global trend data (full account total per date, forward-filled) ──
  const globalTrend = useMemo(() => {
    // Collect all unique dates from all balance snapshots
    const allDates = new Set<string>()
    assets.forEach((asset) => {
      balances.filter((b) => b.assetId === asset.id).forEach((b) => {
        allDates.add(b.recordedAt.slice(0, 10))
      })
    })
    const sortedDates = Array.from(allDates).sort()

    const lastValues: { [key: string]: number | null } = {}
    const net: Array<{ date: string; total: number }> = []
    const pos: Array<{ date: string; total: number }> = []
    const neg: Array<{ date: string; total: number }> = []

    sortedDates.forEach((dateStr) => {
      const upToDate = new Date(dateStr + "T23:59:59.999")
      let netSum = 0
      let posSum = 0
      let negSum = 0

      accounts.forEach((acct) => {
        const accountAssetsList = getAssetsByAccount(acct.id)
        if (accountAssetsList.length === 0) return
        const val = getAccountTotalAtDate(acct.id, upToDate)
        if (val !== 0 || accountAssetsList.some(a => balances.some(b => b.assetId === a.id && b.recordedAt.slice(0, 10) === dateStr))) {
          lastValues[acct.id] = val
        }
        const lastVal = lastValues[acct.id]
        if (lastVal != null) {
          netSum += lastVal
          if (lastVal >= 0) posSum += lastVal
          else negSum += lastVal
        }
      })

      net.push({ date: dateStr, total: netSum })
      pos.push({ date: dateStr, total: posSum })
      neg.push({ date: dateStr, total: Math.abs(negSum) })
    })

    return { net, pos, neg }
  }, [accounts, assets, balances])

  // ── Monthly change (latest balance - ~30 days ago, based on local date) ──
  const getMonthlyChange = (): { value: number; percent: number; isPositive: boolean } => {
    const trend = globalTrend.net
    if (trend.length < 2) return { value: 0, percent: 0, isPositive: true }
    const latest = trend[trend.length - 1].total
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)
    const thirtyDaysAgoStr = thirtyDaysAgo.toLocaleDateString("zh-CN").replace(/\//g, "-")
    let prevTotal = latest
    for (let i = trend.length - 2; i >= 0; i--) {
      if (trend[i].date <= thirtyDaysAgoStr) {
        prevTotal = trend[i].total
        break
      }
    }
    const value = latest - prevTotal
    return {
      value,
      percent: prevTotal !== 0 ? (value / prevTotal) * 100 : 0,
      isPositive: value >= 0,
    }
  }

  const monthlyChange = getMonthlyChange()

  // ── Total assets / liabilities for KPI ──
  const totalNet = accounts.reduce((sum, acct) => sum + getAccountTotal(acct.id).total, 0)
  const posAccounts = accounts.filter(a => getAccountTotal(a.id).total >= 0)
  const negAccounts = accounts.filter(a => getAccountTotal(a.id).total < 0)
  const posAccountCount = posAccounts.length
  const negAccountCount = negAccounts.length
  const totalPos = posAccounts.reduce((sum, acct) => sum + getAccountTotal(acct.id).total, 0)
  const totalNeg = Math.abs(negAccounts.reduce((sum, acct) => sum + getAccountTotal(acct.id).total, 0))

  // ── Year-to-date change (vs Jan 1 net worth) ──
  const currentYear = new Date().getFullYear().toString()
  const jan1Date = new Date(currentYear + "-01-01T23:59:59.999")
  const ytdStartNet = accounts.reduce((sum, acct) => sum + getAccountTotalAtDate(acct.id, jan1Date), 0)
  const ytdNetChange = totalNet - ytdStartNet
  const ytdNetPercent = ytdStartNet !== 0 ? (ytdNetChange / ytdStartNet) * 100 : 0
  const ytdTrend = globalTrend.net.filter(d => d.date >= currentYear + "-01-01")

  // ── Merged chart data (3 lines combined, filtered by period) ──
  const mergedChartData = useMemo(() => {
    const now = new Date()
    let startDate: Date | null = null
    if (chartPeriod === "0.5") { startDate = new Date(now); startDate.setMonth(startDate.getMonth() - 6) }
    else if (chartPeriod === "1") { startDate = new Date(now); startDate.setFullYear(startDate.getFullYear() - 1) }
    else if (chartPeriod === "2") { startDate = new Date(now); startDate.setFullYear(startDate.getFullYear() - 2) }
    else if (chartPeriod === "3") { startDate = new Date(now); startDate.setFullYear(startDate.getFullYear() - 3) }

    const dateMap = new Map<string, { net: number; pos: number; neg: number }>()
    const addToMap = (arr: Array<{ date: string; total: number }>, key: "net" | "pos" | "neg") => {
      arr.forEach(d => {
        if (startDate && new Date(d.date) < startDate) return
        const entry = dateMap.get(d.date) || { net: 0, pos: 0, neg: 0 }
        entry[key] = d.total
        dateMap.set(d.date, entry)
      })
    }
    addToMap(globalTrend.net, "net")
    addToMap(globalTrend.pos, "pos")
    addToMap(globalTrend.neg, "neg")
    return Array.from(dateMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, v]) => ({ date, ...v }))
  }, [globalTrend, chartPeriod])

  // ── Earliest/latest date helpers ──
  const allBalanceDates = globalTrend.net.map(d => d.date)
  const earliestDate = allBalanceDates[0] || ""
  const latestDate = allBalanceDates[allBalanceDates.length - 1] || ""

  return (
    <SidebarProvider>
      <AppSidebar variant="sidebar" />
      <SidebarInset className="flex flex-col h-svh">
        <SiteHeader />
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-muted-foreground font-mono text-sm">加载中...</p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-y-auto" style={{ scrollbarGutter: "stable" }}>
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

                {/* ── 4-column KPI Cards ── */}
                <div className="px-4 lg:px-6">
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                    <Card className="border-l-[3px] border-l-primary">
                      <CardHeader className="pb-1">
                        <CardDescription className="flex items-center gap-2 text-xs uppercase tracking-wider">
                          <Zap className="h-3.5 w-3.5 text-primary" />
                          净资产
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className={`font-mono text-lg md:text-2xl font-bold tracking-tight truncate max-w-full ${totalNet < 0 ? "text-destructive" : "text-success"}`}>
                          {formatAmount(totalNet)}
                        </div>
                        <div className="h-7 w-full mt-1 mb-1">
                          <ResponsiveContainer width="100%" height={28}>
                            <AreaChart data={globalTrend.net} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                              <defs>
                                <linearGradient id="ovNetGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                                </linearGradient>
                              </defs>
                              <Area type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={1.5} fill="url(#ovNetGrad)" isAnimationActive={false} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                        <p className="text-xs text-muted-foreground">{totalAccounts} 个账户</p>
                      </CardContent>
                    </Card>
                    <Card className="border-l-[3px] border-l-success">
                      <CardHeader className="pb-1">
                        <CardDescription className="flex items-center gap-2 text-xs uppercase tracking-wider">
                          <Banknote className="h-3.5 w-3.5 text-success" />
                          总资产
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="font-mono text-lg md:text-2xl font-bold tracking-tight truncate max-w-full text-success">
                          {formatAmount(totalPos)}
                        </div>
                        <div className="h-7 w-full mt-1 mb-1">
                          <ResponsiveContainer width="100%" height={28}>
                            <AreaChart data={globalTrend.pos} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                              <defs>
                                <linearGradient id="ovPosGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.3} />
                                  <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0.02} />
                                </linearGradient>
                              </defs>
                              <Area type="monotone" dataKey="total" stroke="var(--color-success)" strokeWidth={1.5} fill="url(#ovPosGrad)" isAnimationActive={false} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                        <p className="text-xs text-muted-foreground">{posAccountCount} 个盈馀账户</p>
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
                          {formatAmount(totalNeg)}
                        </div>
                        <div className="h-7 w-full mt-1 mb-1">
                          <ResponsiveContainer width="100%" height={28}>
                            <AreaChart data={globalTrend.neg} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                              <defs>
                                <linearGradient id="ovNegGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="var(--destructive)" stopOpacity={0.3} />
                                  <stop offset="100%" stopColor="var(--destructive)" stopOpacity={0.02} />
                                </linearGradient>
                              </defs>
                              <Area type="monotone" dataKey="total" stroke="var(--destructive)" strokeWidth={1.5} fill="url(#ovNegGrad)" isAnimationActive={false} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                        <p className="text-xs text-muted-foreground">{negAccountCount} 个负债账户</p>
                      </CardContent>
                    </Card>
                    <Card className="border-l-[3px] border-l-warning">
                      <CardHeader className="pb-1">
                        <CardDescription className="flex items-center gap-2 text-xs uppercase tracking-wider">
                          <PlugZap className="h-3.5 w-3.5 text-warning" />
                          近一月变化
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className={`font-mono text-lg md:text-2xl font-bold tracking-tight truncate ${monthlyChange.isPositive ? "text-success" : "text-destructive"}`}>
                            {monthlyChange.isPositive ? "+" : ""}{formatAmount(monthlyChange.value)}
                          </div>
                          {monthlyChange.value !== 0 && (
                            <span className={`inline-flex items-center gap-1 font-mono text-xs font-semibold px-1.5 py-0.5 rounded-[4px] flex-shrink-0 whitespace-nowrap ${
                              monthlyChange.isPositive ? "text-success bg-success/10" : "text-destructive bg-destructive/10"
                            }`}>
                              {monthlyChange.isPositive ? "↑" : "↓"} {Math.abs(monthlyChange.percent).toFixed(1)}%
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">较 30 天前</p>
                      </CardContent>
                    </Card>
                    <Card className="border-l-[3px] border-l-[#6366F1]">
                      <CardHeader className="pb-1">
                        <CardDescription className="flex items-center gap-2 text-xs uppercase tracking-wider">
                          <CalendarDays className="h-3.5 w-3.5 text-[#6366F1]" />
                          年初至今
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className={`font-mono text-lg md:text-2xl font-bold tracking-tight truncate ${ytdNetChange >= 0 ? "text-success" : "text-destructive"}`}>
                            {ytdNetChange >= 0 ? "+" : ""}{formatAmount(ytdNetChange)}
                          </div>
                          {ytdNetChange !== 0 && (
                            <span className={`inline-flex items-center gap-1 font-mono text-xs font-semibold px-1.5 py-0.5 rounded-[4px] flex-shrink-0 whitespace-nowrap ${
                              ytdNetChange > 0 ? "text-success bg-success/10" : "text-destructive bg-destructive/10"
                            }`}>
                              {ytdNetChange > 0 ? "↑" : "↓"} {Math.abs(ytdNetPercent).toFixed(1)}%
                            </span>
                          )}
                        </div>
                        {ytdTrend.length >= 2 && (
                          <div className="h-7 w-full mt-1 mb-1">
                            <ResponsiveContainer width="100%" height={28}>
                              <AreaChart data={ytdTrend} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="ovYtdGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                                  </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={1.5} fill="url(#ovYtdGrad)" isAnimationActive={false} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">{currentYear} 年 1 月 1 日起</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* ── Asset Trend Chart ── */}
                <div className="px-4 lg:px-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>资产趋势</CardTitle>
                          <CardDescription>基于余额记录的总资产变化趋势</CardDescription>
                        </div>
                        <Select value={chartPeriod} onValueChange={setChartPeriod}>
                          <SelectTrigger className="w-[100px] h-8">
                            <SelectValue placeholder="选择周期" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0.5">半年</SelectItem>
                            <SelectItem value="1">一年</SelectItem>
                            <SelectItem value="2">二年</SelectItem>
                            <SelectItem value="3">三年</SelectItem>
                            <SelectItem value="all">全部</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Clickable legend */}
                      <div className="flex items-center gap-4 mb-3 flex-wrap">
                        {[
                          { key: "net" as const, label: "净资产", color: "var(--primary)" },
                          { key: "pos" as const, label: "总资产", color: "var(--color-success)" },
                          { key: "neg" as const, label: "总负债", color: "var(--destructive)" },
                        ].map((item) => (
                          <button
                            key={item.key}
                            onClick={() => setVisibleLines(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                            className={`inline-flex items-center gap-1.5 text-xs transition-opacity ${
                              visibleLines[item.key] ? "opacity-100" : "opacity-30 hover:opacity-60"
                            }`}
                          >
                            <span className="w-3 h-0.5 rounded-full" style={{ backgroundColor: item.color }} />
                            {item.label}
                          </button>
                        ))}
                      </div>
                      {mergedChartData.length === 0 ? (
                        <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                          暂无数据
                        </div>
                      ) : (
                        <div className="h-[250px] md:h-[450px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mergedChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                              <defs>
                                <linearGradient id="areaNetGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.05} />
                                </linearGradient>
                                <linearGradient id="areaPosGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.25} />
                                  <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0.03} />
                                </linearGradient>
                                <linearGradient id="areaNegGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="var(--destructive)" stopOpacity={0.25} />
                                  <stop offset="95%" stopColor="var(--destructive)" stopOpacity={0.03} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="3 3" />
                              <XAxis
                                dataKey="date"
                                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                                tickLine={false}
                                axisLine={false}
                                interval="preserveStartEnd"
                                tickFormatter={(v) => {
                                  const d = new Date(v)
                                  return `${d.getMonth() + 1}/${d.getDate()}`
                                }}
                              />
                              <YAxis
                                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={formatAmountShort}
                                width={50}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "var(--card)",
                                  border: "1px solid var(--border)",
                                  borderRadius: "8px",
                                  fontSize: "12px",
                                }}
                                labelStyle={{ color: "var(--muted-foreground)" }}
                                formatter={(value: number, name: string) => {
                                  const m: { [k: string]: string } = { net: "净资产", pos: "总资产", neg: "总负债" }
                                  return [formatAmount(value), m[name] || name]
                                }}
                                labelFormatter={(label) => {
                                  const d = new Date(label)
                                  return d.toLocaleString("zh-CN", {
                                    year: "numeric", month: "2-digit", day: "2-digit",
                                    hour: "2-digit", minute: "2-digit",
                                  })
                                }}
                              />
                              {visibleLines.net && (
                                <Area type="monotone" dataKey="net" stroke="var(--primary)" strokeWidth={2} fill="url(#areaNetGrad)" dot={false} isAnimationActive={false} />
                              )}
                              {visibleLines.pos && (
                                <Area type="monotone" dataKey="pos" stroke="var(--color-success)" strokeWidth={1.5} fill="url(#areaPosGrad)" dot={false} isAnimationActive={false} />
                              )}
                              {visibleLines.neg && (
                                <Area type="monotone" dataKey="neg" stroke="var(--destructive)" strokeWidth={1.5} fill="url(#areaNegGrad)" dot={false} isAnimationActive={false} />
                              )}
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                </div>
            </div>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function OverviewPage() {
  return (
    <ProtectedRoute>
      <OverviewPageContent />
    </ProtectedRoute>
  )
}
