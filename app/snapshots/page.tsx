"use client"

import React, { useState, useEffect, Fragment, useMemo } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveTable, ResponsiveTableBody, ResponsiveTableCell, ResponsiveTableHeader, ResponsiveTableRow } from "@/components/responsive-table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react"
import { getAccountNameColor, getAccountTypeConfig, getAssetTypeConfig } from "@/lib/account-config"
import { getAccountLogo } from "@/lib/account-logos"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Account {
  id: string
  name: string
  type: string
  accountNumber: string | null
}

interface Asset {
  id: string
  name: string
  type: string
  amount: number
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

type PeriodType = "0.5" | "1" | "2" | "3"

export default function SnapshotsPage() {
  const [snapshots, setSnapshots] = useState<DailySnapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>("all")
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set())
  const [expandedSnapshots, setExpandedSnapshots] = useState<Set<string>>(new Set())
  const [chartPeriod, setChartPeriod] = useState<PeriodType>("1")
  const [generating, setGenerating] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    type: "single" | "group"
    id?: string
    snapshotAt?: string
  }>({ open: false, type: "single" })

  useEffect(() => {
    fetchSnapshots()
  }, [])

  const fetchSnapshots = async () => {
    try {
      const res = await fetch("/api/daily-snapshots")
      const data = await res.json()
      setSnapshots(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("获取快照失败:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateSnapshot = async () => {
    setGenerating(true)
    try {
      const res = await fetch("/api/daily-snapshots", { method: "POST" })
      const data = await res.json()
      if (data.success) {
        await fetchSnapshots()
      }
    } catch (error) {
      console.error("生成快照失败:", error)
    } finally {
      setGenerating(false)
    }
  }

  const confirmDeleteSingle = (id: string) => {
    setDeleteDialog({ open: true, type: "single", id })
  }

  const confirmDeleteGroup = (snapshotAt: string) => {
    setDeleteDialog({ open: true, type: "group", snapshotAt })
  }

  const executeDelete = async () => {
    if (deleteDialog.type === "single" && deleteDialog.id) {
      try {
        const res = await fetch(`/api/daily-snapshots/${deleteDialog.id}`, { method: "DELETE" })
        const data = await res.json()
        if (data.success) {
          setSnapshots((prev) => prev.filter((s) => s.id !== deleteDialog.id))
        }
      } catch (error) {
        console.error("删除快照失败:", error)
      }
    } else if (deleteDialog.type === "group" && deleteDialog.snapshotAt) {
      try {
        const res = await fetch(`/api/daily-snapshots?snapshotAt=${encodeURIComponent(deleteDialog.snapshotAt)}`, { method: "DELETE" })
        const data = await res.json()
        if (data.success) {
          setSnapshots((prev) => prev.filter((s) => s.snapshotAt !== deleteDialog.snapshotAt))
        }
      } catch (error) {
        console.error("删除快照组失败:", error)
      }
    }
    setDeleteDialog({ open: false, type: "single" })
  }

  const toggleAccountExpand = (accountKey: string) => {
    setExpandedAccounts((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(accountKey)) {
        newSet.delete(accountKey)
      } else {
        newSet.add(accountKey)
      }
      return newSet
    })
  }

  const toggleSnapshotExpand = (snapshotAt: string) => {
    setExpandedSnapshots((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(snapshotAt)) {
        newSet.delete(snapshotAt)
      } else {
        newSet.add(snapshotAt)
      }
      return newSet
    })
  }

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
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

  const getUniqueSnapshotTimes = () => {
    const times = [...new Set(snapshots.map((s) => s.snapshotAt))]
    return times.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  }

  const getUniqueDates = () => {
    const dates = [...new Set(snapshots.map((s) => {
      const d = new Date(s.snapshotAt)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    }))]
    return dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  }

  const getSnapshotsByTime = (snapshotAt: string) => {
    return snapshots.filter((s) => s.snapshotAt === snapshotAt)
  }

  const getTotalByTime = (snapshotAt: string) => {
    return getSnapshotsByTime(snapshotAt).reduce((sum, s) => sum + s.amount, 0)
  }

  const getAssetChanges = useMemo(() => {
    const times = getUniqueSnapshotTimes()
    if (times.length < 2) return { fromFirst: null, fromLastMonth: null, firstTime: null, lastMonthTime: null }

    const latestTime = times[0]
    const latestTotal = getTotalByTime(latestTime)

    const firstTime = times[times.length - 1]
    const firstTotal = getTotalByTime(firstTime)
    const fromFirst = latestTotal - firstTotal

    const latestDate = new Date(latestTime)
    const lastMonthYear = latestDate.getFullYear()
    const lastMonthMonth = latestDate.getMonth() - 1
    let lastMonthTime: string | null = null

    if (lastMonthMonth < 0) {
      const candidateTimes = times.filter(t => {
        const d = new Date(t)
        return d.getFullYear() === lastMonthYear - 1 && d.getMonth() === 11
      })
      if (candidateTimes.length > 0) {
        lastMonthTime = candidateTimes[0]
      }
    } else {
      const candidateTimes = times.filter(t => {
        const d = new Date(t)
        return d.getFullYear() === lastMonthYear && d.getMonth() === lastMonthMonth
      })
      if (candidateTimes.length > 0) {
        lastMonthTime = candidateTimes[0]
      }
    }

    const fromLastMonth = lastMonthTime ? latestTotal - getTotalByTime(lastMonthTime) : null

    return { fromFirst, fromLastMonth, firstTime, lastMonthTime }
  }, [snapshots])

  const getChartDateRange = () => {
    const now = new Date()
    const years = parseFloat(chartPeriod)
    const startDate = new Date(now)
    startDate.setFullYear(startDate.getFullYear() - years)
    return startDate
  }

  const chartData = useMemo(() => {
    const startDate = getChartDateRange()
    const dateTotals = new Map<string, number>()

    snapshots.forEach((s) => {
      const date = new Date(s.snapshotAt)
      if (date >= startDate) {
        const dateStr = s.snapshotAt
        dateTotals.set(dateStr, (dateTotals.get(dateStr) || 0) + s.amount)
      }
    })

    const sortedDates = Array.from(dateTotals.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())

    return sortedDates.map(([date, total]) => ({
      date,
      label: formatDateShort(date),
      total,
    }))
  }, [snapshots, chartPeriod])

  const getGroupedSnapshots = () => {
    let times = getUniqueSnapshotTimes()

    if (selectedDate !== "all") {
      times = times.filter((t) => {
        const d = new Date(t)
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
        return dateStr === selectedDate
      })
    }

    return times.map((snapshotAt) => {
      const timeSnapshots = getSnapshotsByTime(snapshotAt)
      const accountMap = new Map<string, { account: Account; snapshots: DailySnapshot[]; total: number }>()

      timeSnapshots.forEach((snapshot) => {
        const key = snapshot.account.name // 按账户名称分组，而不是accountId
        if (!accountMap.has(key)) {
          accountMap.set(key, {
            account: snapshot.account,
            snapshots: [],
            total: 0,
          })
        }
        const entry = accountMap.get(key)!
        entry.snapshots.push(snapshot)
        entry.total += snapshot.amount
      })

      const accounts = Array.from(accountMap.values())
      return {
        snapshotAt,
        accounts,
        total: getTotalByTime(snapshotAt),
      }
    })
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="sidebar" />
        <SidebarInset className="flex flex-col h-svh">
          <SiteHeader />
          <div className="flex flex-1 items-center justify-center">
            <p>加载中...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  const groupedSnapshots = getGroupedSnapshots()

  return (
    <SidebarProvider>
      <AppSidebar variant="sidebar" />
      <SidebarInset className="flex flex-col h-svh">
        <SiteHeader />
        <div className="flex flex-1 flex-col overflow-y-auto" style={{ scrollbarGutter: "stable" }}>
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">快照次数</CardTitle>
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{getUniqueSnapshotTimes().length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">快照记录数</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{snapshots.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">最新总资产</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {getUniqueSnapshotTimes().length > 0
                          ? formatAmount(getTotalByTime(getUniqueSnapshotTimes()[0]))
                          : formatAmount(0)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">与首笔相比</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {getAssetChanges.fromFirst !== null ? (
                        <div className="text-2xl font-bold">
                          <span className={getAssetChanges.fromFirst >= 0 ? "text-[#32D74B]" : "text-[#FF453A]"}>
                            {getAssetChanges.fromFirst >= 0 ? "+" : ""}
                            {formatAmount(getAssetChanges.fromFirst)}
                          </span>
                        </div>
                      ) : (
                        <div className="text-2xl font-bold">-</div>
                      )}
                      {getAssetChanges.firstTime && (
                        <p className="text-xs text-muted-foreground mt-1">
                          首笔: {formatDateShort(getAssetChanges.firstTime)}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">与上月同期相比</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {getAssetChanges.fromLastMonth !== null ? (
                        <div className="text-2xl font-bold">
                          <span className={getAssetChanges.fromLastMonth >= 0 ? "text-[#32D74B]" : "text-[#FF453A]"}>
                            {getAssetChanges.fromLastMonth >= 0 ? "+" : ""}
                            {formatAmount(getAssetChanges.fromLastMonth)}
                          </span>
                        </div>
                      ) : (
                        <div className="text-2xl font-bold">-</div>
                      )}
                      {getAssetChanges.lastMonthTime && (
                        <p className="text-xs text-muted-foreground mt-1">
                          上月: {formatDateShort(getAssetChanges.lastMonthTime)}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>资产变化趋势</CardTitle>
                        <CardDescription>每次快照的总资产变化曲线</CardDescription>
                      </div>
                      <Select value={chartPeriod} onValueChange={(v) => setChartPeriod(v as PeriodType)}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="选择周期" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0.5">半年</SelectItem>
                          <SelectItem value="1">一年</SelectItem>
                          <SelectItem value="2">二年</SelectItem>
                          <SelectItem value="3">三年</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {chartData.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">暂无数据</div>
                    ) : (
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" />
                            <XAxis
                              dataKey="label"
                              tick={{ fontSize: 12 }}
                              stroke="#98989D"
                              tickLine={false}
                            />
                            <YAxis
                              tick={{ fontSize: 12 }}
                              stroke="#98989D"
                              tickLine={false}
                              tickFormatter={formatAmountShort}
                            />
                            <Tooltip
                              formatter={(value: number) => [formatAmount(value), "总资产"]}
                              labelFormatter={(label, payload) => {
                                if (payload && payload[0]) {
                                  return formatDateTime((payload[0].payload as { date: string }).date)
                                }
                                return label
                              }}
                              contentStyle={{
                                backgroundColor: "#1E1E1E",
                                border: "1px solid #2C2C2E",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="total"
                              stroke="#00E5FF"
                              strokeWidth={2}
                              dot={false}
                              activeDot={{ r: 6, fill: "#00E5FF" }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle>资产快照记录</CardTitle>
                        <CardDescription>查看每次快照的账户资产记录</CardDescription>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          onClick={generateSnapshot}
                          disabled={generating}
                          size="sm"
                          className="gap-1"
                        >
                          <Plus className="h-4 w-4" />
                          {generating ? "生成中..." : "生成快照"}
                        </Button>
                        <Select value={selectedDate} onValueChange={setSelectedDate}>
                          <SelectTrigger className="w-[140px] sm:w-[180px]">
                            <SelectValue placeholder="选择日期" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">全部日期</SelectItem>
                            {getUniqueDates().map((date) => (
                              <SelectItem key={date} value={date}>
                                {date}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {groupedSnapshots.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">暂无快照数据</div>
                    ) : (
                      <div className="space-y-4">
                        {groupedSnapshots.map((group) => {
                          const isExpanded = expandedSnapshots.has(group.snapshotAt)
                          return (
                            <div key={group.snapshotAt} className="border rounded-[16px] overflow-hidden">
                              <div
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-[#252525] cursor-pointer hover:bg-[#252525] transition-colors gap-2 sm:gap-0"
                                onClick={() => toggleSnapshotExpand(group.snapshotAt)}
                              >
                                <div className="flex items-center gap-2">
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                  <h3 className="font-semibold">{formatDateTime(group.snapshotAt)}</h3>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-4 pl-6 sm:pl-0">
                                  <div className="text-base sm:text-lg font-bold">
                                    总计: <span className={group.total >= 0 ? "text-[#32D74B]" : "text-[#FF453A]"}>{formatAmount(group.total)}</span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      confirmDeleteGroup(group.snapshotAt)
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              {isExpanded && (
                                <>
                                  {/* 桌面端表格视图 */}
                                  <div className="hidden md:block">
                                    <ResponsiveTable className="select-none">
                                      <thead>
                                        <ResponsiveTableRow>
                                          <ResponsiveTableHeader>账户</ResponsiveTableHeader>
                                          <ResponsiveTableHeader>账户类型</ResponsiveTableHeader>
                                          <ResponsiveTableHeader className="text-right">金额</ResponsiveTableHeader>
                                          <ResponsiveTableHeader className="text-right">账户总计</ResponsiveTableHeader>
                                          <ResponsiveTableHeader className="text-right">操作</ResponsiveTableHeader>
                                        </ResponsiveTableRow>
                                      </thead>
                                      <ResponsiveTableBody>
                                        {group.accounts.map((accountData) => {
                                          const nameColor = getAccountNameColor(accountData.account.name)
                                          const typeConfig = getAccountTypeConfig(accountData.account.type)
                                          const TypeIcon = typeConfig.icon
                                          const LogoComponent = getAccountLogo(accountData.account.name)
                                          const accountKey = `${group.snapshotAt}-${accountData.account.name}`
                                          const isAccountExpanded = expandedAccounts.has(accountKey)
                                          const hasMultipleAssets = accountData.snapshots.length > 1

                                          return (
                                            <Fragment key={accountKey}>
                                              <ResponsiveTableRow
                                                className={`${nameColor.bgColor} dark:${nameColor.darkBgColor} ${hasMultipleAssets ? "cursor-pointer hover:brightness-95 transition-all" : ""}`}
                                                onClick={() => hasMultipleAssets && toggleAccountExpand(accountKey)}
                                              >
                                                <ResponsiveTableCell mobileLabel="账户" className="py-3">
                                                  <div className="flex items-center gap-2">
                                                    {hasMultipleAssets && (
                                                      <span className="w-4 h-4 flex items-center justify-center shrink-0">
                                                        {isAccountExpanded ? (
                                                          <ChevronDown className="h-3 w-3" />
                                                        ) : (
                                                          <ChevronRight className="h-3 w-3" />
                                                        )}
                                                      </span>
                                                    )}
                                                    {!hasMultipleAssets && <span className="w-4" />}
                                                    {LogoComponent ? (
                                                      <LogoComponent size={16} className={nameColor.color} />
                                                    ) : (
                                                      <div className={`w-3 h-3 rounded-full ${nameColor.bgColor} dark:${nameColor.darkBgColor}`} />
                                                    )}
                                                    <span className="font-medium">{accountData.account.name}</span>
                                                    {accountData.account.accountNumber && (
                                                      <span className="text-xs text-muted-foreground">
                                                        ({accountData.account.accountNumber})
                                                      </span>
                                                    )}
                                                  </div>
                                                </ResponsiveTableCell>
                                                <ResponsiveTableCell mobileLabel="账户类型">
                                                  <Badge variant="outline" className="gap-1">
                                                    <TypeIcon className="h-3 w-3" />
                                                    {typeConfig.label}
                                                  </Badge>
                                                </ResponsiveTableCell>
                                                <ResponsiveTableCell mobileLabel="金额" className="text-right">
                                                  <span className={accountData.total >= 0 ? "text-[#32D74B]" : "text-[#FF453A]"}>
                                                    {formatAmount(accountData.total)}
                                                  </span>
                                                </ResponsiveTableCell>
                                                <ResponsiveTableCell mobileLabel="账户总计" className="text-right">
                                                  <span className={accountData.total >= 0 ? "text-[#32D74B]" : "text-[#FF453A]"}>
                                                    {formatAmount(accountData.total)}
                                                  </span>
                                                </ResponsiveTableCell>
                                                <ResponsiveTableCell mobileLabel="操作" className="text-right">
                                                  {!hasMultipleAssets && accountData.snapshots[0] && (
                                                    <Button
                                                      variant="ghost"
                                                      size="icon"
                                                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                      onClick={(e) => {
                                                        e.stopPropagation()
                                                        confirmDeleteSingle(accountData.snapshots[0].id)
                                                      }}
                                                    >
                                                      <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                  )}
                                                </ResponsiveTableCell>
                                              </ResponsiveTableRow>
                                              {isAccountExpanded && accountData.snapshots.map((snapshot, snapshotIndex) => {
                                                const isLastSnapshot = snapshotIndex === accountData.snapshots.length - 1
                                                const assetTypeConfig = snapshot.asset ? getAssetTypeConfig(snapshot.asset.type) : null
                                                const AssetIcon = assetTypeConfig?.icon

                                                return (
                                                  <ResponsiveTableRow key={snapshot.id} className="bg-[#252525]/50 hover:bg-[#252525]/50 transition-colors">
                                                    <ResponsiveTableCell mobileLabel="资产" className="relative py-2">
                                                      {!isLastSnapshot && (
                                                        <div className="absolute left-4 top-0 bottom-0 w-px bg-[#2C2C2E]" />
                                                      )}
                                                      {isLastSnapshot && (
                                                        <div className="absolute left-4 top-0 h-1/2 w-px bg-[#2C2C2E]" />
                                                      )}
                                                      <div className="absolute left-4 top-1/2 w-3 h-px bg-[#2C2C2E]" />
                                                      <div className="pl-10 flex items-center gap-2">
                                                        <span className="text-sm text-[#98989D]">
                                                          {snapshot.asset?.name || "默认资产"}
                                                        </span>
                                                        {assetTypeConfig && (
                                                          <Badge className="gap-1 text-xs font-normal">
                                                            {AssetIcon && <AssetIcon className="h-3 w-3" />}
                                                            {assetTypeConfig.label}
                                                          </Badge>
                                                        )}
                                                      </div>
                                                    </ResponsiveTableCell>
                                                    <ResponsiveTableCell />
                                                    <ResponsiveTableCell mobileLabel="金额" className="text-right text-sm">
                                                      <span className={snapshot.amount >= 0 ? "text-[#32D74B]" : "text-[#FF453A]"}>
                                                        {formatAmount(snapshot.amount)}
                                                      </span>
                                                    </ResponsiveTableCell>
                                                    <ResponsiveTableCell />
                                                    <ResponsiveTableCell mobileLabel="操作" className="text-right">
                                                      <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                        onClick={(e) => {
                                                          e.stopPropagation()
                                                          confirmDeleteSingle(snapshot.id)
                                                        }}
                                                      >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                      </Button>
                                                    </ResponsiveTableCell>
                                                  </ResponsiveTableRow>
                                                )
                                              })}
                                            </Fragment>
                                          )
                                        })}
                                      </ResponsiveTableBody>
                                    </ResponsiveTable>
                                  </div>
                                  {/* 移动端卡片视图 */}
                                  <div className="md:hidden space-y-3 p-4">
                                    {group.accounts.map((accountData) => {
                                      const nameColor = getAccountNameColor(accountData.account.name)
                                      const typeConfig = getAccountTypeConfig(accountData.account.type)
                                      const TypeIcon = typeConfig.icon
                                      const LogoComponent = getAccountLogo(accountData.account.name)
                                      const accountKey = `${group.snapshotAt}-${accountData.account.name}`
                                      const hasMultipleAssets = accountData.snapshots.length > 1
                                      const bgColor = nameColor.darkBgColor

                                      return (
                                        <div key={accountKey} className={`rounded-[16px] ${bgColor} border border-[#2C2C2E] shadow-sm overflow-hidden`}>
                                          {/* 账户卡片 */}
                                          <div className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                              <div className="flex items-center gap-2">
                                                {LogoComponent ? (
                                                  <LogoComponent size={20} className={nameColor.color} />
                                                ) : (
                                                  <div className={`w-4 h-4 rounded-full ${nameColor.bgColor} dark:${nameColor.darkBgColor}`} />
                                                )}
                                                <div>
                                                  <div className="font-medium">{accountData.account.name}</div>
                                                  {accountData.account.accountNumber && (
                                                    <div className="text-xs text-muted-foreground">
                                                      {accountData.account.accountNumber}
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                              <div className={`text-lg font-medium ${accountData.total >= 0 ? "text-[#32D74B]" : "text-[#FF453A]"}`}>
                                                {formatAmount(accountData.total)}
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Badge variant="outline" className="gap-1">
                                                <TypeIcon className="h-3 w-3" />
                                                {typeConfig.label}
                                              </Badge>
                                              {hasMultipleAssets && (
                                                <span className="text-xs text-muted-foreground">
                                                  {accountData.snapshots.length} 个资产
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                          {/* 资产列表 */}
                                          {hasMultipleAssets && (
                                            <div className="border-t border-[#2C2C2E]">
                                              {accountData.snapshots.map((snapshot, snapshotIndex) => {
                                                const assetTypeConfig = snapshot.asset ? getAssetTypeConfig(snapshot.asset.type) : null
                                                const AssetIcon = assetTypeConfig?.icon
                                                const isLast = snapshotIndex === accountData.snapshots.length - 1

                                                return (
                                                  <div key={snapshot.id} className={`p-3 ${!isLast ? "border-b border-[#2C2C2E]" : ""}`}>
                                                    <div className="flex justify-between items-center">
                                                      <div className="flex items-center gap-2">
                                                        <span className="text-sm text-[#98989D]">
                                                          {snapshot.asset?.name || "默认资产"}
                                                        </span>
                                                        {assetTypeConfig && (
                                                          <Badge className="gap-1 text-xs font-normal">
                                                            {AssetIcon && <AssetIcon className="h-3 w-3" />}
                                                            {assetTypeConfig.label}
                                                          </Badge>
                                                        )}
                                                      </div>
                                                      <div className="flex items-center gap-2">
                                                        <div className={`text-sm font-medium ${snapshot.amount >= 0 ? "text-[#32D74B]" : "text-[#FF453A]"}`}>
                                                          {formatAmount(snapshot.amount)}
                                                        </div>
                                                        <Button
                                                          variant="ghost"
                                                          size="icon"
                                                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                          onClick={(e) => {
                                                            e.stopPropagation()
                                                            confirmDeleteSingle(snapshot.id)
                                                          }}
                                                        >
                                                          <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                      </div>
                                                    </div>
                                                  </div>
                                                )
                                              })}
                                            </div>
                                          )}
                                        </div>
                                      )
                                    })}
                                  </div>
                                </>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.type === "group"
                ? "确定要删除该次快照的所有记录吗？此操作无法撤销。"
                : "确定要删除该条快照记录吗？此操作无法撤销。"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  )
}
