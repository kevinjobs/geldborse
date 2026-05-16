"use client"

import React, { useState, useEffect, Fragment } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveTable, ResponsiveTableBody, ResponsiveTableCell, ResponsiveTableHeader, ResponsiveTableRow } from "@/components/responsive-table"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, Zap, PlugZap, Gauge, TriangleAlert } from "lucide-react"
import {
  getAccountNameColor,
  getAssetTypeConfig,
  AccountDisplay
} from "@/lib/account-config"
import { useAuth } from "@/lib/auth-context"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

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

import { ProtectedRoute } from "@/components/protected-route"

function OverviewPageContent() {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [records, setRecords] = useState<Record[]>([])
  const [balances, setBalances] = useState<Balance[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (user) {
      fetchData()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchData = async () => {
    try {
      const headers = user?.id ? { 'Authorization': `Bearer ${user.id}` } : undefined

      const [accountsRes, assetsRes, recordsRes, balancesRes] = await Promise.all([
        fetch("/api/accounts", headers ? { headers } : {}),
        fetch("/api/assets", headers ? { headers } : {}),
        fetch("/api/records", headers ? { headers } : {}),
        fetch("/api/balances", headers ? { headers } : {}),
      ])

      if (!accountsRes.ok) throw new Error(`Accounts API error: ${accountsRes.status}`)
      if (!assetsRes.ok) throw new Error(`Assets API error: ${assetsRes.status}`)
      if (!recordsRes.ok) throw new Error(`Records API error: ${recordsRes.status}`)
      if (!balancesRes.ok) throw new Error(`Balances API error: ${balancesRes.status}`)

      const accountsData = await accountsRes.json()
      const assetsData = await assetsRes.json()
      const recordsData = await recordsRes.json()
      const balancesData = await balancesRes.json()

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
    } catch (error) {
      console.error("获取数据失败:", error)
    } finally {
      setLoading(false)
    }
  }

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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("zh-CN")
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
    const accountRecords = getRecordsByAccount(asset.accountId)

    if (latestBalance) {
      const balanceDate = new Date(latestBalance.recordedAt)
      const recordsAfterBalance = accountRecords
        .filter((r) => new Date(r.date) > balanceDate)
        .reduce((sum, r) => sum + r.amount, 0)

      return {
        total: latestBalance.amount + recordsAfterBalance,
        baseType: "balance",
        baseAmount: latestBalance.amount,
        balanceDate,
      }
    }

    const recordsTotal = accountRecords.reduce((sum, r) => sum + r.amount, 0)
    return {
      total: asset.amount + recordsTotal,
      baseType: "initial",
      baseAmount: asset.amount,
      balanceDate: null,
    }
  }

  const getAccountTotal = (accountId: string): {
    total: number
    hasBalance: boolean
    baseAmount: number
    recordsTotal: number
  } => {
    const accountAssets = getAssetsByAccount(accountId)
    const accountRecords = getRecordsByAccount(accountId)

    if (accountAssets.length > 0) {
      let baseAmount = 0
      let latestBalanceDate: Date | null = null
      let hasBalance = false

      for (const asset of accountAssets) {
        const latestBalance = getLatestBalanceByAsset(asset.id)
        if (latestBalance) {
          baseAmount += latestBalance.amount
          hasBalance = true
          const balanceDate = new Date(latestBalance.recordedAt)
          if (!latestBalanceDate || balanceDate > latestBalanceDate) {
            latestBalanceDate = balanceDate
          }
        } else {
          baseAmount += asset.amount
        }
      }

      let recordsAfterBalance = 0
      if (latestBalanceDate) {
        recordsAfterBalance = accountRecords
          .filter((r) => new Date(r.date) > latestBalanceDate!)
          .reduce((sum, r) => sum + r.amount, 0)
      } else {
        recordsAfterBalance = accountRecords.reduce((sum, r) => sum + r.amount, 0)
      }

      return {
        total: baseAmount + recordsAfterBalance,
        hasBalance,
        baseAmount,
        recordsTotal: accountRecords.reduce((sum, r) => sum + r.amount, 0),
      }
    }

    const account = accounts.find((a) => a.id === accountId)
    const initialBalance = account?.initialBalance || 0
    const recordsTotal = accountRecords.reduce((sum, r) => sum + r.amount, 0)

    return {
      total: initialBalance + recordsTotal,
      hasBalance: false,
      baseAmount: initialBalance,
      recordsTotal,
    }
  }

  const totalAssets = accounts.reduce((sum, account) => sum + getAccountTotal(account.id).total, 0)
  const totalRecords = records.length
  const totalAccounts = accounts.length
  const latestRecords = records.slice(0, 5)

  const chartData = React.useMemo(() => {
    const dateMap = new Map<string, number>()
    records.forEach((r) => {
      const day = r.date.slice(0, 10)
      dateMap.set(day, (dateMap.get(day) || 0) + r.amount)
    })
    return Array.from(dateMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-30)
      .map(([date, amount]) => ({
        date,
        amount,
      }))
  }, [records])

  const getChangeTrend = (): { value: number; isPositive: boolean } => {
    const sortedRecords = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const now = new Date()
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const recentRecords = sortedRecords.filter((r) => new Date(r.date) >= monthAgo)
    const recentTotal = recentRecords.reduce((sum, r) => sum + r.amount, 0)
    return {
      value: recentTotal,
      isPositive: recentTotal >= 0,
    }
  }

  const trend = getChangeTrend()

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

                {/* 3-column KPI Cards */}
                <div className="px-4 lg:px-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card className="border-l-[3px] border-l-[#00E5FF]">
                      <CardHeader className="pb-1">
                        <CardDescription className="flex items-center gap-2 text-xs uppercase tracking-wider">
                          <Zap className="h-3.5 w-3.5 text-[#00E5FF]" />
                          总资产
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="font-mono text-3xl font-bold tracking-tight text-white">
                          {formatAmount(totalAssets)}
                        </div>
                        <p className="text-xs text-[#98989D] mt-1">
                          {totalAccounts} 个账户
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-l-[3px] border-l-[#32D74B]">
                      <CardHeader className="pb-1">
                        <CardDescription className="flex items-center gap-2 text-xs uppercase tracking-wider">
                          <Gauge className="h-3.5 w-3.5 text-[#32D74B]" />
                          近一月变化
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className={`font-mono text-3xl font-bold tracking-tight ${trend.isPositive ? "text-[#32D74B]" : "text-[#FF453A]"}`}>
                          {trend.isPositive ? "+" : ""}{formatAmount(trend.value)}
                        </div>
                        <p className="text-xs text-[#98989D] mt-1">
                          {trend.isPositive ? "↑ 净增长" : "↓ 净减少"}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-l-[3px] border-l-[#FFD60A]">
                      <CardHeader className="pb-1">
                        <CardDescription className="flex items-center gap-2 text-xs uppercase tracking-wider">
                          <PlugZap className="h-3.5 w-3.5 text-[#FFD60A]" />
                          收支笔数
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="font-mono text-3xl font-bold tracking-tight text-white">
                          {totalRecords}
                        </div>
                        <p className="text-xs text-[#98989D] mt-1">
                          累计记录
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Main Chart (8 cols) + Alerts Panel (4 cols) */}
                <div className="px-4 lg:px-6">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                    {/* Chart - 8 columns */}
                    <div className="lg:col-span-8">
                      <Card className="h-full">
                        <CardHeader>
                          <CardTitle>资产趋势</CardTitle>
                          <CardDescription>近30天收支变化</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {chartData.length === 0 ? (
                            <div className="flex items-center justify-center h-[250px] text-[#98989D] text-sm">
                              暂无数据
                            </div>
                          ) : (
                            <div className="h-[250px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                  <defs>
                                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.3} />
                                      <stop offset="95%" stopColor="#00E5FF" stopOpacity={0.05} />
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid stroke="#2C2C2E" vertical={false} strokeDasharray="3 3" />
                                  <XAxis
                                    dataKey="date"
                                    tick={{ fill: "#98989D", fontSize: 11 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(v) => {
                                      const d = new Date(v)
                                      return `${d.getMonth() + 1}/${d.getDate()}`
                                    }}
                                  />
                                  <YAxis
                                    tick={{ fill: "#98989D", fontSize: 11 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={formatAmountShort}
                                    width={50}
                                  />
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: "#1E1E1E",
                                      border: "1px solid #2C2C2E",
                                      borderRadius: "8px",
                                      fontSize: "12px",
                                    }}
                                    labelStyle={{ color: "#98989D" }}
                                    formatter={(value: number) => [formatAmount(value), "金额"]}
                                    labelFormatter={(label) => `日期: ${label}`}
                                  />
                                  <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#00E5FF"
                                    strokeWidth={2}
                                    fill="url(#areaGradient)"
                                    dot={false}
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Alert Panel - 4 columns */}
                    <div className="lg:col-span-4">
                      <Card className="h-full">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <TriangleAlert className="h-4 w-4 text-[#FF453A]" />
                            最近收支
                          </CardTitle>
                          <CardDescription>最新5条记录</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                          {latestRecords.length === 0 ? (
                            <div className="flex items-center justify-center h-[200px] text-[#98989D] text-sm">
                              暂无记录
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              {latestRecords.map((record) => (
                                <div
                                  key={record.id}
                                  className="border-l-[3px] border-l-[#FF453A] bg-[#3A1C1C]/50 px-4 py-3 mx-5 mb-2 rounded-r-[4px] last:mb-5"
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-[#98989D]">{formatDate(record.date)}</span>
                                    <Badge
                                      variant="outline"
                                      className={`text-[10px] px-1.5 py-0 h-5 border-none font-normal ${
                                        record.type === "INCOME"
                                          ? "bg-[#32D74B]/10 text-[#32D74B]"
                                          : "bg-[#FF453A]/10 text-[#FF453A]"
                                      }`}
                                    >
                                      {record.type === "INCOME" ? "收入" : "支出"}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-[#98989D] truncate max-w-[100px]">
                                      {record.account.name}
                                    </span>
                                    <span className={`font-mono text-sm font-semibold ${
                                      record.amount >= 0 ? "text-[#32D74B]" : "text-[#FF453A]"
                                    }`}>
                                      {record.amount >= 0 ? "+" : ""}{formatAmount(record.amount)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>

                {/* Account Summary Table */}
                <div className="px-4 lg:px-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>账户汇总</CardTitle>
                      <CardDescription>各账户及资产余额统计</CardDescription>
                    </CardHeader>
                    <CardContent className="min-h-[300px] p-0">
                      <div className="hidden md:block">
                        <ResponsiveTable className="select-none">
                          <thead>
                            <ResponsiveTableRow>
                              <ResponsiveTableHeader className="text-[#98989D] font-normal text-xs uppercase tracking-wider">名称</ResponsiveTableHeader>
                              <ResponsiveTableHeader className="text-[#98989D] font-normal text-xs uppercase tracking-wider">账户号码</ResponsiveTableHeader>
                              <ResponsiveTableHeader className="text-right text-[#98989D] font-normal text-xs uppercase tracking-wider">总资产</ResponsiveTableHeader>
                              <ResponsiveTableHeader className="text-right text-[#98989D] font-normal text-xs uppercase tracking-wider">最新快照总额</ResponsiveTableHeader>
                              <ResponsiveTableHeader className="text-right text-[#98989D] font-normal text-xs uppercase tracking-wider">收支总额</ResponsiveTableHeader>
                              <ResponsiveTableHeader className="text-center text-[#98989D] font-normal text-xs uppercase tracking-wider">收支数</ResponsiveTableHeader>
                              <ResponsiveTableHeader className="text-center text-[#98989D] font-normal text-xs uppercase tracking-wider">资产数</ResponsiveTableHeader>
                            </ResponsiveTableRow>
                          </thead>
                          <ResponsiveTableBody>
                            {accounts.length === 0 ? (
                              <ResponsiveTableRow>
                                <ResponsiveTableCell colSpan={7} className="text-center text-[#98989D] py-8">
                                  暂无账户
                                </ResponsiveTableCell>
                              </ResponsiveTableRow>
                            ) : (
                              accounts.map((account, index) => {
                                const { total, hasBalance, baseAmount, recordsTotal } = getAccountTotal(account.id)
                                const accountAssets = getAssetsByAccount(account.id)
                                const nameColor = getAccountNameColor(account.name)
                                const isExpanded = expandedAccounts.has(account.id)
                                const hasAssets = accountAssets.length > 0
                                const isNegative = total < 0
                                const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
                                const bgColor = isDarkMode ? nameColor.darkBgColor : nameColor.bgColor
                                return (
                                  <Fragment key={account.id}>
                                    <ResponsiveTableRow
                                      className={`${bgColor} ${hasAssets ? "cursor-pointer" : ""} transition-colors`}
                                      style={{ animationDelay: `${index * 0.1}s` }}
                                      onClick={() => hasAssets && toggleAccountExpand(account.id)}
                                    >
                                      <ResponsiveTableCell mobileLabel="名称" className="py-3">
                                        <div className="flex items-center gap-2">
                                          {hasAssets && (
                                            <span className="w-4 h-4 flex items-center justify-center shrink-0">
                                              {isExpanded ? (
                                                <ChevronDown className="h-4 w-4 text-[#00E5FF]" />
                                              ) : (
                                                <ChevronRight className="h-4 w-4 text-[#00E5FF]" />
                                              )}
                                            </span>
                                          )}
                                          {!hasAssets && <span className="w-4 shrink-0" />}
                                          <AccountDisplay name={account.name} type={account.type} variant="table" />
                                        </div>
                                      </ResponsiveTableCell>
                                      <ResponsiveTableCell mobileLabel="账户号码">{account.accountNumber || "-"}</ResponsiveTableCell>
                                      <ResponsiveTableCell mobileLabel="总资产" className={`text-right font-mono font-semibold ${isNegative ? "text-[#FF453A]" : "text-[#32D74B]"}`}>
                                        {formatAmount(total)}
                                      </ResponsiveTableCell>
                                      <ResponsiveTableCell mobileLabel="最新快照总额" className="text-right text-[#98989D] font-mono">
                                        {formatAmount(baseAmount)}
                                      </ResponsiveTableCell>
                                      <ResponsiveTableCell mobileLabel="收支总额" className={`text-right font-mono ${recordsTotal < 0 ? "text-[#FF453A]" : "text-[#32D74B]"}`}>
                                        {formatAmount(recordsTotal)}
                                      </ResponsiveTableCell>
                                      <ResponsiveTableCell mobileLabel="收支数" className="text-center text-[#98989D]">{records.filter((r) => r.accountId === account.id).length}</ResponsiveTableCell>
                                      <ResponsiveTableCell mobileLabel="资产数" className="text-center text-[#98989D]">{accountAssets.length}</ResponsiveTableCell>
                                    </ResponsiveTableRow>
                                    {isExpanded && accountAssets.map((asset, assetIndex) => {
                                      const assetTotal = getAssetRealTimeTotal(asset.id)
                                      const assetTypeConfig = getAssetTypeConfig(asset.type)
                                      const AssetIcon = assetTypeConfig.icon
                                      const isLast = assetIndex === accountAssets.length - 1
                                      return (
                                        <ResponsiveTableRow key={asset.id} className="bg-[#252525]/30 hover:bg-[#252525]/50 transition-colors">
                                          <ResponsiveTableCell mobileLabel="名称" className="relative py-3">
                                            {!isLast && (
                                              <div className="absolute left-4 top-0 bottom-0 w-px bg-[#2C2C2E]" />
                                            )}
                                            {isLast && (
                                              <div className="absolute left-4 top-0 h-1/2 w-px bg-[#2C2C2E]" />
                                            )}
                                            <div className="absolute left-4 top-1/2 w-3 h-px bg-[#2C2C2E]" />
                                            <div className="pl-10">
                                              <span className="text-sm text-[#98989D]">{asset.name}</span>
                                            </div>
                                          </ResponsiveTableCell>
                                          <ResponsiveTableCell mobileLabel="类型" className="py-3">
                                            <Badge className="gap-1 text-xs font-normal bg-[#2C2C2E] text-[#98989D] hover:bg-[#2C2C2E] border-none">
                                              <AssetIcon className="h-3 w-3" />
                                              {assetTypeConfig.label}
                                            </Badge>
                                          </ResponsiveTableCell>
                                          <ResponsiveTableCell mobileLabel="基准金额" className="text-right py-3">
                                            <span className="text-xs text-[#98989D] mr-1">
                                              {assetTotal.baseType === "balance" ? "(快照)" : "(初始)"}
                                            </span>
                                            <span className="font-mono text-[#98989D]">{formatAmount(assetTotal.baseAmount)}</span>
                                          </ResponsiveTableCell>
                                          <ResponsiveTableCell mobileLabel="实时余额" className={`text-right font-mono font-semibold py-3 ${assetTotal.total >= 0 ? "text-[#32D74B]" : "text-[#FF453A]"}`}>
                                            {formatAmount(assetTotal.total)}
                                          </ResponsiveTableCell>
                                        </ResponsiveTableRow>
                                      )
                                    })}
                                  </Fragment>
                                )
                              })
                            )}
                          </ResponsiveTableBody>
                        </ResponsiveTable>
                      </div>
                      <div className="md:hidden space-y-3 px-5 pb-5">
                        {accounts.length === 0 ? (
                          <div className="text-center text-[#98989D] py-8">暂无账户</div>
                        ) : (
                          accounts.map((account) => {
                            const { total, hasBalance, baseAmount, recordsTotal } = getAccountTotal(account.id)
                            const accountAssets = getAssetsByAccount(account.id)
                            const nameColor = getAccountNameColor(account.name)
                            const isExpanded = expandedAccounts.has(account.id)
                            const hasAssets = accountAssets.length > 0
                            const isNegative = total < 0
                            const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
                            const bgColor = isDarkMode ? nameColor.darkBgColor : nameColor.bgColor
                            return (
                              <div key={account.id} className={`rounded-[16px] ${bgColor} border border-[#2C2C2E] overflow-hidden`}>
                                <div className={`p-4 ${hasAssets ? "cursor-pointer" : ""}`} onClick={() => hasAssets && toggleAccountExpand(account.id)}>
                                  <div className="flex justify-between items-start mb-3">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        {hasAssets && (
                                          <span className="w-4 h-4 flex items-center justify-center shrink-0">
                                            {isExpanded ? (
                                              <ChevronDown className="h-4 w-4 text-[#00E5FF]" />
                                            ) : (
                                              <ChevronRight className="h-4 w-4 text-[#00E5FF]" />
                                            )}
                                          </span>
                                        )}
                                        <AccountDisplay name={account.name} type={account.type} variant="card" />
                                      </div>
                                      <div className="text-sm text-[#98989D] mt-1">
                                        账户号码: {account.accountNumber || "-"}
                                      </div>
                                    </div>
                                    <div className={`font-mono text-lg font-semibold ${isNegative ? "text-[#FF453A]" : "text-[#32D74B]"}`}>
                                      {formatAmount(total)}
                                    </div>
                                  </div>
                                  <div className="flex justify-between text-sm text-[#98989D]">
                                    <span>最新快照总额:</span>
                                    <span className="font-mono">{formatAmount(baseAmount)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-[#98989D]">收支总额:</span>
                                    <span className={`font-mono ${recordsTotal < 0 ? "text-[#FF453A]" : "text-[#32D74B]"}`}>
                                      {formatAmount(recordsTotal)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm text-[#98989D]">
                                    <span>收支数: {records.filter((r) => r.accountId === account.id).length}</span>
                                    <span>资产数: {accountAssets.length}</span>
                                  </div>
                                </div>
                                {isExpanded && hasAssets && (
                                  <div className="border-t border-[#2C2C2E]">
                                    {accountAssets.map((asset, index) => {
                                      const assetTotal = getAssetRealTimeTotal(asset.id)
                                      const assetTypeConfig = getAssetTypeConfig(asset.type)
                                      const AssetIcon = assetTypeConfig.icon
                                      const isLast = index === accountAssets.length - 1
                                      return (
                                        <div key={asset.id} className={`p-4 ${!isLast ? "border-b border-[#2C2C2E]" : ""}`}>
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <div className="flex items-center gap-2">
                                                <span className="text-sm text-[#98989D]">{asset.name}</span>
                                                <Badge className="gap-1 text-xs font-normal bg-[#2C2C2E] text-[#98989D] hover:bg-[#2C2C2E] border-none">
                                                  <AssetIcon className="h-3 w-3" />
                                                  {assetTypeConfig.label}
                                                </Badge>
                                              </div>
                                              <div className="text-xs text-[#98989D] mt-1">
                                                基准: {assetTotal.baseType === "balance" ? "(快照) " : "(初始) "}
                                                <span className="font-mono">{formatAmount(assetTotal.baseAmount)}</span>
                                              </div>
                                            </div>
                                            <div className={`font-mono text-sm font-semibold ${assetTotal.total >= 0 ? "text-[#32D74B]" : "text-[#FF453A]"}`}>
                                              {formatAmount(assetTotal.total)}
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            )
                          })
                        )}
                      </div>
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
