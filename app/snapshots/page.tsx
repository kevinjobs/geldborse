"use client"

import { useState, useEffect, useMemo, Fragment } from "react"
import { api } from "@/lib/api-client"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveTable, ResponsiveTableBody, ResponsiveTableCell, ResponsiveTableHeader, ResponsiveTableRow } from "@/components/responsive-table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, ChevronDown, ChevronRight, Plus, Trash2, Zap, TrendingUp, TrendingDown, BarChart3 } from "lucide-react"
import { getAccountNameColor, getAccountTypeConfig, getAssetTypeConfig } from "@/lib/account-config"
import { getAccountLogo } from "@/lib/account-logos"
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import { formatAmount, formatAmountShort } from "@/lib/format"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
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

type PeriodType = "0.5" | "1" | "2" | "3" | "5" | "all"

export default function SnapshotsPage() {
  const [snapshots, setSnapshots] = useState<DailySnapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>("all")
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set())
  const [expandedSnapshots, setExpandedSnapshots] = useState<Set<string>>(new Set())
  const [chartPeriod, setChartPeriod] = useState<PeriodType>("1")
  const [generating, setGenerating] = useState(false)
  const [generateOpen, setGenerateOpen] = useState(false)
  const [selectedGenerateDate, setSelectedGenerateDate] = useState<Date>(new Date())
  const [visibleLines, setVisibleLines] = useState({ net: true, pos: false, neg: false })

  const now = new Date()
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
      const data = await api.get<{ success?: boolean; data?: DailySnapshot[] }>("/api/daily-snapshots")
      setSnapshots(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("获取快照失败:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateSnapshot = async () => {
    const time = new Date(selectedGenerateDate)
    time.setHours(now.getHours(), now.getMinutes(), 0, 0)
    setGenerating(true)
    try {
      await api.post("/api/daily-snapshots", { snapshotAt: time.toISOString() })
      await fetchSnapshots()
      setGenerateOpen(false)
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
        await api.delete(`/api/daily-snapshots/${deleteDialog.id}`)
        setSnapshots((prev) => prev.filter((s) => s.id !== deleteDialog.id))
      } catch (error) {
        console.error("删除快照失败:", error)
      }
    } else if (deleteDialog.type === "group" && deleteDialog.snapshotAt) {
      try {
        await api.delete(`/api/daily-snapshots?snapshotAt=${encodeURIComponent(deleteDialog.snapshotAt)}`)
        setSnapshots((prev) => prev.filter((s) => s.snapshotAt !== deleteDialog.snapshotAt))
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
    if (chartPeriod === "all") return null
    const now = new Date()
    if (chartPeriod === "5") {
      const startDate = new Date(now)
      startDate.setFullYear(startDate.getFullYear() - 5)
      return startDate
    }
    const years = parseFloat(chartPeriod)
    const startDate = new Date(now)
    startDate.setFullYear(startDate.getFullYear() - years)
    return startDate
  }

  const sparklineData = useMemo(() => {
    const dateTotals = new Map<string, number>()
    snapshots.forEach((s) => {
      const dateStr = s.snapshotAt
      dateTotals.set(dateStr, (dateTotals.get(dateStr) || 0) + s.amount)
    })
    return Array.from(dateTotals.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([date, total]) => ({ date, total }))
  }, [snapshots])

  const multiChartData = useMemo(() => {
    const startDate = getChartDateRange()
    const dateMap = new Map<string, { net: number; pos: number; neg: number }>()
    snapshots.forEach((s) => {
      const date = new Date(s.snapshotAt)
      if (!startDate || date >= startDate) {
        const dateStr = date.toISOString().slice(0, 10)
        const entry = dateMap.get(dateStr) || { net: 0, pos: 0, neg: 0 }
        entry.net += s.amount
        if (s.amount >= 0) entry.pos += s.amount
        else entry.neg += s.amount
        dateMap.set(dateStr, entry)
      }
    })

    const sortedDates = Array.from(dateMap.keys()).sort()
    return sortedDates.map(date => {
      const v = dateMap.get(date)!
      return { date, dateLabel: chartPeriod === "all" ? `${date.slice(0, 4)}/${date.slice(5, 7)}/${date.slice(8, 10)}` : `${date.slice(5, 7)}/${date.slice(8, 10)}`, net: v.net, pos: v.pos, neg: Math.abs(v.neg) }
    })
  }, [snapshots, chartPeriod])

  const posOpacity = visibleLines.pos ? 1 : 0
  const negOpacity = visibleLines.neg ? 1 : 0
  const netOpacity = visibleLines.net ? 1 : 0

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
        const key = snapshot.account.name
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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="border-l-[3px] border-l-primary">
                    <CardHeader className="pb-1">
                      <CardDescription className="flex items-center gap-2 text-xs uppercase tracking-wider">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        快照次数
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="font-mono text-lg md:text-2xl font-bold tracking-tight">{getUniqueSnapshotTimes().length}</div>
                      <p className="text-xs text-muted-foreground mt-1">共 {snapshots.length} 条记录</p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-[3px] border-l-success">
                    <CardHeader className="pb-1">
                      <CardDescription className="flex items-center gap-2 text-xs uppercase tracking-wider">
                        <Zap className="h-3.5 w-3.5 text-success" />
                        最新净资产
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className={`font-mono text-lg md:text-2xl font-bold tracking-tight ${getUniqueSnapshotTimes().length > 0 ? (getTotalByTime(getUniqueSnapshotTimes()[0]) >= 0 ? "text-success" : "text-destructive") : "text-muted-foreground"}`}>
                        {getUniqueSnapshotTimes().length > 0 ? formatAmount(getTotalByTime(getUniqueSnapshotTimes()[0])) : formatAmount(0)}
                      </div>
                      {getUniqueSnapshotTimes().length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">{formatDateTime(getUniqueSnapshotTimes()[0])}</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-l-[3px] border-l-secondary">
                    <CardHeader className="pb-1">
                      <CardDescription className="flex items-center gap-2 text-xs uppercase tracking-wider">
                        {getAssetChanges.fromFirst !== null && getAssetChanges.fromFirst >= 0 ? <TrendingUp className="h-3.5 w-3.5 text-success" /> : <TrendingDown className="h-3.5 w-3.5 text-destructive" />}
                        与首笔相比
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {getAssetChanges.fromFirst !== null ? (
                        <>
                          <div className={`font-mono text-lg md:text-2xl font-bold tracking-tight ${getAssetChanges.fromFirst >= 0 ? "text-success" : "text-destructive"}`}>
                            {getAssetChanges.fromFirst >= 0 ? "+" : ""}{formatAmount(getAssetChanges.fromFirst)}
                          </div>
                          <div className="h-7 w-full mt-1">
                            <ResponsiveContainer width="100%" height={28}>
                              <AreaChart data={sparklineData.slice(-30)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="spFirstGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--success)" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="var(--success)" stopOpacity={0.02} />
                                  </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="total" stroke="var(--success)" strokeWidth={1.5} fill="url(#spFirstGrad)" isAnimationActive={false} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                          <p className="text-xs text-muted-foreground">首笔: {getAssetChanges.firstTime ? formatDateTime(getAssetChanges.firstTime) : "-"}</p>
                        </>
                      ) : (
                        <div className="font-mono text-lg font-bold">-</div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-l-[3px] border-l-muted">
                    <CardHeader className="pb-1">
                      <CardDescription className="flex items-center gap-2 text-xs uppercase tracking-wider">
                        <BarChart3 className="h-3.5 w-3.5" />
                        与上月同期
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {getAssetChanges.fromLastMonth !== null ? (
                        <>
                          <div className={`font-mono text-lg md:text-2xl font-bold tracking-tight ${getAssetChanges.fromLastMonth >= 0 ? "text-success" : "text-destructive"}`}>
                            {getAssetChanges.fromLastMonth >= 0 ? "+" : ""}{formatAmount(getAssetChanges.fromLastMonth)}
                          </div>
                          <div className="h-7 w-full mt-1">
                            <ResponsiveContainer width="100%" height={28}>
                              <AreaChart data={sparklineData.slice(-30)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="spMonthGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--muted-foreground)" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="var(--muted-foreground)" stopOpacity={0.02} />
                                  </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="total" stroke="var(--muted-foreground)" strokeWidth={1.5} fill="url(#spMonthGrad)" isAnimationActive={false} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                          <p className="text-xs text-muted-foreground">上月: {getAssetChanges.lastMonthTime ? formatDateTime(getAssetChanges.lastMonthTime) : "-"}</p>
                        </>
                      ) : (
                        <div className="font-mono text-lg font-bold">-</div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle>资产变化趋势</CardTitle>
                        <CardDescription>快照总资产变化曲线</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs">
                          <button onClick={() => setVisibleLines(p => ({ ...p, net: !p.net }))} className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${visibleLines.net ? 'text-primary' : 'text-muted-foreground opacity-40'}`}>
                            <span className="w-2 h-2 rounded-full bg-primary inline-block mr-1"></span>净资产
                          </button>
                          <button onClick={() => setVisibleLines(p => ({ ...p, pos: !p.pos }))} className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${visibleLines.pos ? 'text-success' : 'text-muted-foreground opacity-40'}`}>
                            <span className="w-2 h-2 rounded-full bg-success inline-block mr-1"></span>总资产
                          </button>
                          <button onClick={() => setVisibleLines(p => ({ ...p, neg: !p.neg }))} className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${visibleLines.neg ? 'text-destructive' : 'text-muted-foreground opacity-40'}`}>
                            <span className="w-2 h-2 rounded-full bg-destructive inline-block mr-1"></span>负债
                          </button>
                        </div>
                        <Select value={chartPeriod} onValueChange={(v) => setChartPeriod(v as PeriodType)}>
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="选择周期" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0.5">半年</SelectItem>
                            <SelectItem value="1">一年</SelectItem>
                            <SelectItem value="2">二年</SelectItem>
                            <SelectItem value="3">三年</SelectItem>
                            <SelectItem value="5">五年</SelectItem>
                            <SelectItem value="all">全部</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                  </CardHeader>
                  <CardContent>
                    {multiChartData.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">暂无数据</div>
                    ) : (
                      <div className="h-[250px] md:h-[450px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={multiChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <defs>
                              <linearGradient id="snNetGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                              </linearGradient>
                              <linearGradient id="snPosGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--success)" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="var(--success)" stopOpacity={0.02} />
                              </linearGradient>
                              <linearGradient id="snNegGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--destructive)" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="var(--destructive)" stopOpacity={0.02} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="dateLabel" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" tickLine={false} interval="preserveStartEnd" />
                            <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" tickLine={false} tickFormatter={formatAmountShort} />
                            <Tooltip
                              formatter={(value: number, name: string) => [formatAmount(value), name === "net" ? "净资产" : name === "pos" ? "总资产" : "负债"]}
                              labelFormatter={(label) => {
                                const entry = multiChartData.find(e => e.dateLabel === label)
                                return entry ? `${entry.date.slice(0, 4)}/${label}` : label
                              }}
                              contentStyle={{
                                backgroundColor: "var(--card)",
                                border: "1px solid var(--border)",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                              }}
                            />
                            {visibleLines.net && <Area type="monotone" dataKey="net" name="net" stroke="var(--primary)" strokeWidth={2.5} fill="url(#snNetGrad)" dot={false} activeDot={{ r: 6, fill: "var(--primary)" }} opacity={netOpacity} />}
                            {visibleLines.pos && <Area type="monotone" dataKey="pos" name="pos" stroke="var(--success)" strokeWidth={2} fill="url(#snPosGrad)" dot={false} opacity={posOpacity} />}
                            {visibleLines.neg && <Area type="monotone" dataKey="neg" name="neg" stroke="var(--destructive)" strokeWidth={2} fill="url(#snNegGrad)" dot={false} opacity={negOpacity} />}
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3">
                    <div>
                      <CardTitle>资产快照记录</CardTitle>
                      <CardDescription>查看每次快照的账户资产记录</CardDescription>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <Popover open={generateOpen} onOpenChange={setGenerateOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="gap-1 shrink-0" size="sm">
                            <CalendarIcon className="h-4 w-4" />
                            {selectedGenerateDate.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <Calendar mode="single" selected={selectedGenerateDate} onSelect={(d) => d && setSelectedGenerateDate(d)} className="rounded-lg border" captionLayout="dropdown" />
                        </PopoverContent>
                      </Popover>
                      <Button onClick={generateSnapshot} disabled={generating} size="sm" className="gap-1">
                        <Plus className="h-4 w-4" />
                        {generating ? "生成中..." : "生成快照"}
                      </Button>
                      <Select value={selectedDate} onValueChange={setSelectedDate}>
                        <SelectTrigger className="w-[88px] sm:w-[88px]">
                          <SelectValue placeholder="选择日期" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部日期</SelectItem>
                          {getUniqueDates().map((date) => (
                            <SelectItem key={date} value={date}>{date}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {groupedSnapshots.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">暂无快照数据</div>
                    ) : (
                      <div className="relative">
                        {/* 背景连线 — 贯穿整个列表，圆点 z-10 覆盖其上 */}
                        <div className="absolute left-[6px] top-[22px] bottom-4 w-px bg-border pointer-events-none" />
                        {groupedSnapshots.map((group) => {
                          const isExpanded = expandedSnapshots.has(group.snapshotAt)
                          return (
                            <div key={group.snapshotAt} className="flex gap-3 mb-1">
                              <div className="flex flex-col items-center w-3 shrink-0">
                                <div className="w-3 h-3 rounded-full bg-primary ring-4 ring-background shrink-0 z-10 mt-[22px]" />
                              </div>
                              <div className="flex-1 min-w-0 space-y-2">
                                <div
                                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-[16px] border border-border bg-card cursor-pointer hover:bg-muted transition-all duration-200 gap-2 sm:gap-0"
                                  onClick={() => toggleSnapshotExpand(group.snapshotAt)}
                                >
                                  <div className="flex items-center gap-3">
                                    {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3">
                                      <span className="font-semibold text-sm">{formatDateTime(group.snapshotAt)}</span>
                                      <span className="text-xs text-muted-foreground">快照 {group.accounts.length} 个账户</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground text-xs">总计</span>
                                    <span className={`font-mono text-base sm:text-lg font-bold ${group.total >= 0 ? "text-success" : "text-destructive"}`}>
                                      {formatAmount(group.total)}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                      onClick={(e) => { e.stopPropagation(); confirmDeleteGroup(group.snapshotAt); }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                {isExpanded && (
                                  <>
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
                                                  className={`${hasMultipleAssets ? "cursor-pointer hover:brightness-110 transition-all duration-150" : ""}`}
                                                  onClick={() => hasMultipleAssets && toggleAccountExpand(accountKey)}
                                                >
                                                  <ResponsiveTableCell mobileLabel="账户" className="py-3">
                                                    <div className="flex items-center gap-2">
                                                      {hasMultipleAssets && (
                                                        <span className="w-4 h-4 flex items-center justify-center shrink-0">
                                                          {isAccountExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                                        </span>
                                                      )}
                                                      {!hasMultipleAssets && <span className="w-4" />}
                                                      {LogoComponent ? <LogoComponent size={16} className={nameColor.color} /> : <div className="w-3 h-3 rounded-full bg-muted" />}
                                                      <span className="font-medium">{accountData.account.name}</span>
                                                      {accountData.account.accountNumber && <span className="text-xs text-muted-foreground">({accountData.account.accountNumber})</span>}
                                                    </div>
                                                  </ResponsiveTableCell>
                                                  <ResponsiveTableCell mobileLabel="账户类型">
                                                    <Badge variant="outline" className="gap-1">
                                                      <TypeIcon className="h-3 w-3" />
                                                      {typeConfig.label}
                                                    </Badge>
                                                  </ResponsiveTableCell>
                                                  <ResponsiveTableCell mobileLabel="金额" className="text-right">
                                                    <span className={accountData.total >= 0 ? "text-success" : "text-destructive"}>{formatAmount(accountData.total)}</span>
                                                  </ResponsiveTableCell>
                                                  <ResponsiveTableCell mobileLabel="账户总计" className="text-right">
                                                    <span className={accountData.total >= 0 ? "text-success" : "text-destructive"}>{formatAmount(accountData.total)}</span>
                                                  </ResponsiveTableCell>
                                                  <ResponsiveTableCell mobileLabel="操作" className="text-right">
                                                    {!hasMultipleAssets && accountData.snapshots[0] && (
                                                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); confirmDeleteSingle(accountData.snapshots[0].id); }}>
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
                                                    <ResponsiveTableRow key={snapshot.id} className="bg-muted/50 hover:bg-muted/50 transition-colors">
                                                      <ResponsiveTableCell mobileLabel="资产" className="relative py-2">
                                                        {!isLastSnapshot && <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />}
                                                        {isLastSnapshot && <div className="absolute left-4 top-0 h-1/2 w-px bg-border" />}
                                                        <div className="absolute left-4 top-1/2 w-3 h-px bg-border" />
                                                        <div className="pl-10 flex items-center gap-2">
                                                          <span className="text-sm text-muted-foreground">{snapshot.asset?.name || "默认资产"}</span>
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
                                                        <span className={snapshot.amount >= 0 ? "text-success" : "text-destructive"}>{formatAmount(snapshot.amount)}</span>
                                                      </ResponsiveTableCell>
                                                      <ResponsiveTableCell />
                                                      <ResponsiveTableCell mobileLabel="操作" className="text-right">
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); confirmDeleteSingle(snapshot.id); }}>
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
                                    <div className="md:hidden border-t border-border">
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
                                            {/* 账户行 */}
                                            <div
                                              className={`flex items-center gap-2 pl-0 pr-3 py-2.5 border-b border-border ${hasMultipleAssets ? "cursor-pointer hover:bg-muted/50" : ""}`}
                                              onClick={() => hasMultipleAssets && toggleAccountExpand(accountKey)}
                                            >
                                              {hasMultipleAssets && (
                                                <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                                                  {isAccountExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                                </span>
                                              )}
                                              {!hasMultipleAssets && <span className="w-3.5 shrink-0" />}
                                              {LogoComponent ? <LogoComponent size={16} className={`${nameColor.color} shrink-0`} /> : <div className="w-3 h-3 rounded-full bg-muted shrink-0" />}
                                              <span className="text-xs font-medium truncate min-w-0">{accountData.account.name}</span>
                                              <Badge variant="outline" className="gap-1 text-[10px] px-1.5 py-0 h-5 shrink-0">
                                                <TypeIcon className="h-2.5 w-2.5" />
                                                {typeConfig.label}
                                              </Badge>
                                              <span className={`flex-1 text-right text-[12px] font-medium tabular-nums ${accountData.total >= 0 ? "text-success" : "text-destructive"}`}>
                                                {formatAmount(accountData.total)}
                                              </span>
                                              {!hasMultipleAssets && accountData.snapshots[0] && (
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0" onClick={(e) => { e.stopPropagation(); confirmDeleteSingle(accountData.snapshots[0].id); }}>
                                                  <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                              )}
                                            </div>
                                            {/* 资产子行 */}
                                            {isAccountExpanded && accountData.snapshots.map((snapshot) => {
                                              const assetTypeConfig = snapshot.asset ? getAssetTypeConfig(snapshot.asset.type) : null
                                              const AssetIcon = assetTypeConfig?.icon
                                              return (
                                                <div key={snapshot.id} className="flex items-center gap-2 pl-3 pr-3 py-2 bg-muted/30 border-b border-border">
                                                  <span className="w-3.5 shrink-0" />
                                                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                                    <span className="text-xs text-muted-foreground truncate">{snapshot.asset?.name || "默认资产"}</span>
                                                    {assetTypeConfig && (
                                                      <Badge className="gap-1 text-[10px] px-1.5 py-0 h-5 font-normal shrink-0">
                                                        {AssetIcon && <AssetIcon className="h-2.5 w-2.5" />}
                                                        {assetTypeConfig.label}
                                                      </Badge>
                                                    )}
                                                  </div>
                                                  <span className={`text-xs font-medium tabular-nums shrink-0 ${snapshot.amount >= 0 ? "text-success" : "text-destructive"}`}>
                                                    {formatAmount(snapshot.amount)}
                                                  </span>
                                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0" onClick={(e) => { e.stopPropagation(); confirmDeleteSingle(snapshot.id); }}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                  </Button>
                                                </div>
                                              )
                                            })}
                                          </Fragment>
                                        )
                                      })}
                                    </div>
                                  </>
                                )}
                              </div>
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
