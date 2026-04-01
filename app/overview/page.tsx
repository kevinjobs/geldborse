"use client"

import React, { useState, useEffect, Fragment } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight } from "lucide-react"
import {
  getAccountNameColor,
  getAssetTypeConfig,
  AccountDisplay
} from "@/lib/account-config"

interface Account {
  id: string
  name: string
  type: string
  initialBalance: number
  createdAt: string
  updatedAt: string
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
  const [accounts, setAccounts] = useState<Account[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [records, setRecords] = useState<Record[]>([])
  const [balances, setBalances] = useState<Balance[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [accountsRes, assetsRes, recordsRes, balancesRes] = await Promise.all([
        fetch("/api/accounts"),
        fetch("/api/assets"),
        fetch("/api/records"),
        fetch("/api/balances"),
      ])
      const accountsData = await accountsRes.json()
      const assetsData = await assetsRes.json()
      const recordsData = await recordsRes.json()
      const balancesData = await balancesRes.json()
      setAccounts(accountsData)
      setAssets(assetsData)
      setRecords(recordsData)
      setBalances(balancesData)
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
                      return (
                        <Card key={account.id} className={`border-l-4 ${nameColor.borderColor} ${nameColor.bgColor}`}>
                          <CardHeader className="pb-2">
                            <AccountDisplay name={account.name} type={account.type} variant="card" />
                            <CardTitle className="text-2xl">
                              {formatAmount(total)}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-muted-foreground">
                              {accountAssets.length > 0
                                ? `${accountAssets.length} 个资产`
                                : `${hasBalance ? "快照基准" : "初始资金"}: ${formatAmount(baseAmount)}`
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
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>日期</TableHead>
                            <TableHead>类型</TableHead>
                            <TableHead>账户</TableHead>
                            <TableHead className="text-right">金额</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {latestRecords.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center text-muted-foreground">
                                暂无收支记录
                              </TableCell>
                            </TableRow>
                          ) : (
                            latestRecords.map((record) => (
                              <TableRow key={record.id}>
                                <TableCell>{formatDate(record.date)}</TableCell>
                                <TableCell>
                                  <Badge variant={record.type === "INCOME" ? "default" : "destructive"}>
                                    {record.type === "INCOME" ? "收入" : "支出"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <AccountDisplay name={record.account.name} type={record.account.type} variant="compact" />
                                </TableCell>
                                <TableCell className={`text-right font-medium ${record.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                                  {formatAmount(record.amount)}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
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
                      <Table className="table-fixed select-none">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[35%]">名称</TableHead>
                            <TableHead className="w-[20%]">类型</TableHead>
                            <TableHead className="w-[22.5%] text-right">基准金额</TableHead>
                            <TableHead className="w-[22.5%] text-right">实时余额</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {accounts.map((account) => {
                            const { total, hasBalance, baseAmount } = getAccountTotal(account.id)
                            const accountAssets = getAssetsByAccount(account.id)
                            const nameColor = getAccountNameColor(account.name)
                            const isExpanded = expandedAccounts.has(account.id)
                            const hasAssets = accountAssets.length > 0
                            return (
                              <Fragment key={account.id}>
                                <TableRow
                                  className={`${nameColor.bgColor} ${hasAssets ? "cursor-pointer hover:brightness-95 transition-all" : ""}`}
                                  onClick={() => hasAssets && toggleAccountExpand(account.id)}
                                >
                                  <TableCell className="py-3">
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
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-xs text-muted-foreground">
                                      {hasAssets ? `${accountAssets.length} 个资产` : "无资产"}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right">
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
                                  </TableCell>
                                  <TableCell className={`text-right font-bold ${total >= 0 ? "text-green-600" : "text-red-600"}`}>
                                    {formatAmount(total)}
                                  </TableCell>
                                </TableRow>
                                {isExpanded && accountAssets.map((asset, index) => {
                                  const assetTotal = getAssetRealTimeTotal(asset.id)
                                  const assetTypeConfig = getAssetTypeConfig(asset.type)
                                  const AssetIcon = assetTypeConfig.icon
                                  const isLast = index === accountAssets.length - 1
                                  return (
                                    <TableRow key={asset.id} className="bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                                      <TableCell className="relative py-3">
                                        {!isLast && (
                                          <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />
                                        )}
                                        {isLast && (
                                          <div className="absolute left-4 top-0 h-1/2 w-px bg-slate-200" />
                                        )}
                                        <div className="absolute left-4 top-1/2 w-3 h-px bg-slate-200" />
                                        <div className="pl-10">
                                          <span className="text-sm text-slate-600">{asset.name}</span>
                                        </div>
                                      </TableCell>
                                      <TableCell className="py-3">
                                        <Badge className="gap-1 text-xs font-normal">
                                          <AssetIcon className="h-3 w-3" />
                                          {assetTypeConfig.label}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-right py-3">
                                        <span className="text-xs text-muted-foreground mr-1">
                                          {assetTotal.baseType === "balance" ? "(快照)" : "(初始)"}
                                        </span>
                                        {formatAmount(assetTotal.baseAmount)}
                                      </TableCell>
                                      <TableCell className={`text-right font-medium py-3 ${assetTotal.total >= 0 ? "text-green-600" : "text-red-600"}`}>
                                        {formatAmount(assetTotal.total)}
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </Fragment>
                            )
                          })}
                        </TableBody>
                      </Table>
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
