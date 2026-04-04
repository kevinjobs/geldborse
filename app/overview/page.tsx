"use client"

import React, { useState, useEffect, Fragment } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveTable, ResponsiveTableBody, ResponsiveTableCell, ResponsiveTableHeader, ResponsiveTableRow } from "@/components/responsive-table"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight } from "lucide-react"
import {
  getAccountNameColor,
  getAssetTypeConfig,
  AccountDisplay
} from "@/lib/account-config"
import { useAuth } from "@/lib/auth-context"

interface Account {
  id: string
  name: string
  type: string
  initialBalance: number
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
      // 获取用户认证信息
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('geldborse_user') : null
      const userData = storedUser ? JSON.parse(storedUser) : null
      const authToken = userData?.id // 使用用户ID作为临时token

      // 构建请求头
      const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : undefined

      const [accountsRes, assetsRes, recordsRes, balancesRes] = await Promise.all([
        fetch("/api/accounts", headers ? { headers } : {}),
        fetch("/api/assets", headers ? { headers } : {}),
        fetch("/api/records", headers ? { headers } : {}),
        fetch("/api/balances", headers ? { headers } : {}),
      ])
      const accountsData = await accountsRes.json()
      const assetsData = await assetsRes.json()
      const recordsData = await recordsRes.json()
      const balancesData = await balancesRes.json()

      // 过滤出当前用户的账户
      const userAccounts = accountsData.filter((account: Account) => account.userId === user?.id)
      const userAccountIds = new Set(userAccounts.map((account: Account) => account.id))

      // 过滤出当前用户账户相关的资产
      const userAssets = assetsData.filter((asset: Asset) => userAccountIds.has(asset.accountId))
      const userAssetIds = new Set(userAssets.map((asset: Asset) => asset.id))

      // 过滤出当前用户账户相关的记录
      const userRecords = recordsData.filter((record: Record) => userAccountIds.has(record.accountId))

      // 过滤出当前用户资产相关的余额
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

  const latestRecords = records.slice(0, 10)

  return (
    <SidebarProvider>
      <AppSidebar variant="sidebar" />
      <SidebarInset>
        <SiteHeader />
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <p>加载中...</p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-y-auto" style={{ scrollbarGutter: "stable" }}>
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-4 lg:px-6">
                  <Card className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-white/80">我的总资产</CardDescription>
                      <CardTitle className="text-4xl font-bold">
                        {formatAmount(accounts.reduce((sum, account) => sum + getAccountTotal(account.id).total, 0))}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-white/80">
                        {accounts.length} 个账户 · {records.length} 条收支
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="px-4 lg:px-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {accounts.map((account) => {
                      const { total, hasBalance, baseAmount } = getAccountTotal(account.id)
                      const accountAssets = getAssetsByAccount(account.id)
                      const nameColor = getAccountNameColor(account.name)
                      const cardClassName = "border-l-4 " + nameColor.borderColor + ' ' + nameColor.darkBorderColor + ' ' + nameColor.bgColor + ' ' + nameColor.darkBgColor
                      return (
                        <Card key={account.id} className={cardClassName}>
                          <CardHeader className="pb-2">
                            <AccountDisplay name={account.name} type={account.type} variant="card" />
                            <CardTitle className="text-2xl">
                              {formatAmount(total)}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-muted-foreground">
                              {accountAssets.length > 0
                                ? accountAssets.length + ' 个资产'
                                : (hasBalance ? "快照基准" : "初始资金") + ': ' + formatAmount(baseAmount)
                              } · {records.filter((r) => r.accountId === account.id).length} 条收支
                            </p>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>

                <div className="px-4 lg:px-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>最近收支</CardTitle>
                      <CardDescription>最近10条收支记录</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* 桌面端表格视图 */}
                      <div className="hidden md:block">
                        <ResponsiveTable>
                          <thead>
                            <ResponsiveTableRow>
                              <ResponsiveTableHeader>日期</ResponsiveTableHeader>
                              <ResponsiveTableHeader>类型</ResponsiveTableHeader>
                              <ResponsiveTableHeader>账户</ResponsiveTableHeader>
                              <ResponsiveTableHeader className="text-right">金额</ResponsiveTableHeader>
                            </ResponsiveTableRow>
                          </thead>
                          <ResponsiveTableBody>
                            {latestRecords.length === 0 ? (
                              <ResponsiveTableRow>
                                <ResponsiveTableCell colSpan={4} className="text-center text-muted-foreground">
                                  暂无收支记录
                                </ResponsiveTableCell>
                              </ResponsiveTableRow>
                            ) : (
                              latestRecords.map((record) => (
                                <ResponsiveTableRow key={record.id}>
                                  <ResponsiveTableCell mobileLabel="日期">{formatDate(record.date)}</ResponsiveTableCell>
                                  <ResponsiveTableCell mobileLabel="类型">
                                    <Badge variant={record.type === "INCOME" ? "default" : "destructive"}>
                                      {record.type === "INCOME" ? "收入" : "支出"}
                                    </Badge>
                                  </ResponsiveTableCell>
                                  <ResponsiveTableCell mobileLabel="账户">
                                    <AccountDisplay name={record.account.name} type={record.account.type} variant="compact" />
                                  </ResponsiveTableCell>
                                  <ResponsiveTableCell mobileLabel="金额" className={"text-right font-medium " + (record.amount >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                                    {formatAmount(record.amount)}
                                  </ResponsiveTableCell>
                                </ResponsiveTableRow>
                              ))
                            )}
                          </ResponsiveTableBody>
                        </ResponsiveTable>
                      </div>
                      {/* 移动端卡片视图 */}
                      <div className="md:hidden space-y-3">
                        {latestRecords.length === 0 ? (
                          <div className="text-center text-muted-foreground py-8">
                            暂无收支记录
                          </div>
                        ) : (
                          latestRecords.map((record) => (
                            <div key={record.id} className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant={record.type === "INCOME" ? "default" : "destructive"}>
                                    {record.type === "INCOME" ? "收入" : "支出"}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">{formatDate(record.date)}</span>
                                </div>
                                <div className={"text-lg font-medium " + (record.amount >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                                  {formatAmount(record.amount)}
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                <AccountDisplay name={record.account.name} type={record.account.type} variant="compact" />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="px-4 lg:px-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>账户汇总</CardTitle>
                      <CardDescription>各账户及资产余额统计</CardDescription>
                    </CardHeader>
                    <CardContent className="min-h-[300px]">
                      {/* 桌面端表格视图 */}
                      <div className="hidden md:block">
                        <ResponsiveTable className="select-none">
                          <thead>
                            <ResponsiveTableRow>
                              <ResponsiveTableHeader>名称</ResponsiveTableHeader>
                              <ResponsiveTableHeader>类型</ResponsiveTableHeader>
                              <ResponsiveTableHeader className="text-right">基准金额</ResponsiveTableHeader>
                              <ResponsiveTableHeader className="text-right">实时余额</ResponsiveTableHeader>
                            </ResponsiveTableRow>
                          </thead>
                          <ResponsiveTableBody>
                            {accounts.map((account) => {
                              const { total, hasBalance, baseAmount } = getAccountTotal(account.id)
                              const accountAssets = getAssetsByAccount(account.id)
                              const nameColor = getAccountNameColor(account.name)
                              const isExpanded = expandedAccounts.has(account.id)
                              const hasAssets = accountAssets.length > 0
                              // 检测当前是否为深色模式
                              const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
                              // 根据主题选择背景颜色
                              const bgColor = isDarkMode ? nameColor.darkBgColor : nameColor.bgColor
                              const rowClassName = bgColor + ' ' + (hasAssets ? "cursor-pointer hover:brightness-95 transition-all" : "")
                              return (
                                <Fragment key={account.id}>
                                  <ResponsiveTableRow
                                    className={rowClassName}
                                    onClick={() => hasAssets && toggleAccountExpand(account.id)}
                                  >
                                    <ResponsiveTableCell mobileLabel="名称" className="py-3">
                                      <div className="flex items-center gap-2">
                                        {hasAssets && (
                                          <span className="w-4 h-4 flex items-center justify-center shrink-0">
                                            {isExpanded ? (
                                              <ChevronDown className="h-4 w-4" />
                                            ) : (
                                              <ChevronRight className="h-4 w-4" />
                                            )}
                                          </span>
                                        )}
                                        {!hasAssets && <span className="w-4 shrink-0" />}
                                        <AccountDisplay name={account.name} type={account.type} variant="table" />
                                      </div>
                                    </ResponsiveTableCell>
                                    <ResponsiveTableCell mobileLabel="类型">
                                      <span className="text-xs text-muted-foreground">
                                        {hasAssets ? accountAssets.length + ' 个资产' : "无资产"}
                                      </span>
                                    </ResponsiveTableCell>
                                    <ResponsiveTableCell mobileLabel="基准金额" className="text-right">
                                      {hasAssets ? (
                                        <span className="text-xs text-muted-foreground">资产汇总</span>
                                      ) : (
                                        <>
                                          <span className="text-xs text-muted-foreground mr-1">
                                            {hasBalance ? "(快照)" : "(初始)"}
                                          </span>
                                          {formatAmount(baseAmount)}
                                        </>
                                      )}
                                    </ResponsiveTableCell>
                                    <ResponsiveTableCell mobileLabel="实时余额" className={"text-right font-bold " + (total >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                                      {formatAmount(total)}
                                    </ResponsiveTableCell>
                                  </ResponsiveTableRow>
                                  {isExpanded && accountAssets.map((asset, index) => {
                                    const assetTotal = getAssetRealTimeTotal(asset.id)
                                    const assetTypeConfig = getAssetTypeConfig(asset.type)
                                    const AssetIcon = assetTypeConfig.icon
                                    const isLast = index === accountAssets.length - 1
                                    return (
                                      <ResponsiveTableRow key={asset.id} className="bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors">
                                        <ResponsiveTableCell mobileLabel="名称" className="relative py-3">
                                          {!isLast && (
                                            <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />
                                          )}
                                          {isLast && (
                                            <div className="absolute left-4 top-0 h-1/2 w-px bg-slate-200 dark:bg-slate-700" />
                                          )}
                                          <div className="absolute left-4 top-1/2 w-3 h-px bg-slate-200 dark:bg-slate-700" />
                                          <div className="pl-10">
                                            <span className="text-sm text-slate-600 dark:text-slate-300">{asset.name}</span>
                                          </div>
                                        </ResponsiveTableCell>
                                        <ResponsiveTableCell mobileLabel="类型" className="py-3">
                                          <Badge className="gap-1 text-xs font-normal">
                                            <AssetIcon className="h-3 w-3" />
                                            {assetTypeConfig.label}
                                          </Badge>
                                        </ResponsiveTableCell>
                                        <ResponsiveTableCell mobileLabel="基准金额" className="text-right py-3">
                                          <span className="text-xs text-muted-foreground mr-1">
                                            {assetTotal.baseType === "balance" ? "(快照)" : "(初始)"}
                                          </span>
                                          {formatAmount(assetTotal.baseAmount)}
                                        </ResponsiveTableCell>
                                        <ResponsiveTableCell mobileLabel="实时余额" className={"text-right font-medium py-3 " + (assetTotal.total >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                                          {formatAmount(assetTotal.total)}
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
                      <div className="md:hidden space-y-4">
                        {accounts.map((account) => {
                          const { total, hasBalance, baseAmount } = getAccountTotal(account.id)
                          const accountAssets = getAssetsByAccount(account.id)
                          const nameColor = getAccountNameColor(account.name)
                          const isExpanded = expandedAccounts.has(account.id)
                          const hasAssets = accountAssets.length > 0
                          // 检测当前是否为深色模式
                          const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
                          // 根据主题选择背景颜色
                          const bgColor = isDarkMode ? nameColor.darkBgColor : nameColor.bgColor
                          return (
                            <div key={account.id} className={`rounded-lg ${bgColor} border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden`}>
                              {/* 账户卡片 */}
                              <div className={`p-4 ${hasAssets ? "cursor-pointer hover:brightness-95 transition-all" : ""}`} onClick={() => hasAssets && toggleAccountExpand(account.id)}>
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      {hasAssets && (
                                        <span className="w-4 h-4 flex items-center justify-center shrink-0">
                                          {isExpanded ? (
                                            <ChevronDown className="h-4 w-4" />
                                          ) : (
                                            <ChevronRight className="h-4 w-4" />
                                          )}
                                        </span>
                                      )}
                                      <AccountDisplay name={account.name} type={account.type} variant="card" />
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                      {hasAssets ? accountAssets.length + ' 个资产' : "无资产"}
                                    </div>
                                  </div>
                                  <div className={`text-lg font-medium ${total >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                    {formatAmount(total)}
                                  </div>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  基准金额: {hasAssets ? "资产汇总" : formatAmount(baseAmount)}
                                </div>
                              </div>
                              {/* 资产列表 */}
                              {isExpanded && hasAssets && (
                                <div className="border-t border-slate-200 dark:border-slate-700">
                                  {accountAssets.map((asset, index) => {
                                    const assetTotal = getAssetRealTimeTotal(asset.id)
                                    const assetTypeConfig = getAssetTypeConfig(asset.type)
                                    const AssetIcon = assetTypeConfig.icon
                                    const isLast = index === accountAssets.length - 1
                                    return (
                                      <div key={asset.id} className={`p-4 ${!isLast ? "border-b border-slate-200 dark:border-slate-700" : ""}`}>
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm text-slate-600 dark:text-slate-300">{asset.name}</span>
                                              <Badge className="gap-1 text-xs font-normal">
                                                <AssetIcon className="h-3 w-3" />
                                                {assetTypeConfig.label}
                                              </Badge>
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                              基准金额: {assetTotal.baseType === "balance" ? "(快照) " : "(初始) "}{formatAmount(assetTotal.baseAmount)}
                                            </div>
                                          </div>
                                          <div className={`text-sm font-medium ${assetTotal.total >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
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
                        })}
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
