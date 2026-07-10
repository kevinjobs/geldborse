"use client"

import { Fragment, useMemo } from "react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getAccountNameColor, getAccountTypeConfig, getAssetTypeConfig } from "@/lib/account-config"
import { formatAmount } from "@/lib/format"
import { getAccountLogo } from "@/lib/account-logos"
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2, XCircle, Archive, ArchiveX, X } from "lucide-react"
import { EyeSlash } from "@phosphor-icons/react"
import { AreaChart, Area, ResponsiveContainer, ReferenceLine } from "recharts"

interface Account {
  id: string
  name: string
  type: string
  accountNumber: string | null
  initialBalance: number
  archived?: boolean
  excludeFromTotal?: boolean
}

interface Asset {
  id: string
  name: string
  type: string
  amount: number
  accountId: string
  createdAt?: string
}

interface Balance {
  id: string
  amount: number
  recordedAt: string
  assetId: string
}

interface AccountDetailModalProps {
  account: Account
  open: boolean
  onOpenChange: (open: boolean) => void
  assets: Asset[]
  balances: Record<string, Balance[]>
  snapshotDate: string
  expandedAssets: Set<string>
  onToggleAssetExpand: (assetId: string) => void
  onAddAsset: () => void
  onAddBalance: (asset: Asset) => void
  onEditAsset: (asset: Asset) => void
  onDeleteAsset: (asset: Asset) => void
  onEditBalance: (balance: Balance) => void
  onDeleteBalance: (balance: Balance) => void
  onArchive: () => void
  getBalanceAtDate: (assetId: string, defaultAmount: number) => number
  getAccountTotal: (account: Account) => number
}

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  const hours = String(d.getHours()).padStart(2, "0")
  const minutes = String(d.getMinutes()).padStart(2, "0")
  return `${year}/${month}/${day} ${hours}:${minutes}`
}

export function AccountDetailModal({
  account,
  open,
  onOpenChange,
  assets,
  balances,
  snapshotDate,
  expandedAssets,
  onToggleAssetExpand,
  onAddAsset,
  onAddBalance,
  onEditAsset,
  onDeleteAsset,
  onEditBalance,
  onDeleteBalance,
  onArchive,
  getBalanceAtDate,
}: AccountDetailModalProps) {
  if (!account) return null
  const nameColor = getAccountNameColor(account.name)
  const typeConfig = getAccountTypeConfig(account.type)
  const TypeIcon = typeConfig.icon
  const LogoComponent = getAccountLogo(account.name)
  const totalBalance = getBalanceAtDate("__account_total__", 0) || assets.reduce((sum, a) => sum + getBalanceAtDate(a.id, 0), 0)

  // ── Compute account trend for sparkline ──
  const accountTrendData = useMemo(() => {
    const dateMap = new Map<string, number>()
    assets.forEach((asset) => {
      const assetBalances = balances[asset.id] || []
      assetBalances.forEach((b) => {
        const dateKey = b.recordedAt.slice(0, 10)
        dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + b.amount)
      })
    })
    return Array.from(dateMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, total]) => ({ date, total }))
  }, [assets, balances])

  const totalBalanceChange = useMemo(() => {
    if (accountTrendData.length < 2) return null
    return accountTrendData[accountTrendData.length - 1].total - accountTrendData[accountTrendData.length - 2].total
  }, [accountTrendData])

  const totalTrendPercent = useMemo(() => {
    if (totalBalanceChange == null || totalBalance - totalBalanceChange === 0) return null
    return (totalBalanceChange / (totalBalance - totalBalanceChange)) * 100
  }, [totalBalanceChange, totalBalance])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col" showCloseButton={false}>
        {/* Fixed header section */}
        <div className="shrink-0">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                {LogoComponent && <LogoComponent size={22} className={nameColor.darkColor} />}
                <DialogTitle className="text-xl">{account.name}</DialogTitle>
                {account.excludeFromTotal && (
                  <span title="不计入总额"><EyeSlash className="h-4 w-4 text-muted-foreground shrink-0" /></span>
                )}
                {account.archived && (
                  <span title="已归档"><ArchiveX className="h-4 w-4 text-muted-foreground shrink-0" /></span>
                )}
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal gap-0.5 h-5">
                  <TypeIcon className="h-2.5 w-2.5" />
                  {typeConfig.label}
                </Badge>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className={account.archived ? "text-primary border-primary/30" : "text-muted-foreground border-border"}
                  onClick={onArchive}
                  title={account.archived ? "取消归档" : "归档账户"}
                >
                  {account.archived ? (
                    <ArchiveX className="h-3.5 w-3.5 mr-1" />
                  ) : (
                    <Archive className="h-3.5 w-3.5 mr-1" />
                  )}
                  {account.archived ? "取消归档" : "归档"}
                </Button>
                <DialogClose asChild>
                  <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </Button>
                </DialogClose>
              </div>
            </div>
            <DialogDescription className="flex items-center gap-2 mt-1">
              {account.accountNumber && <span className="text-xs">{account.accountNumber}</span>}
            </DialogDescription>
            {snapshotDate && (
              <Badge variant="outline" className="mt-2 text-xs w-fit gap-1">
                <XCircle className="h-3 w-3" />
                查看日期: {new Date(snapshotDate).toLocaleDateString("zh-CN")}
              </Badge>
            )}
          </DialogHeader>

          {/* KPI Summary */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-card border border-border rounded-[12px] p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">当前余额</p>
              <div className="flex items-center gap-2 flex-wrap">
                <p className={`font-mono text-xl font-bold ${totalBalance < 0 ? "text-destructive" : "text-success"}`}>
                  {formatAmount(totalBalance)}
                </p>
                {totalTrendPercent != null && (
                  <span className={`inline-flex items-center gap-1 font-mono text-xs font-semibold px-1.5 py-0.5 rounded-[4px] flex-shrink-0 whitespace-nowrap ${
                    totalBalanceChange! > 0 ? "text-success bg-success/10" : "text-destructive bg-destructive/10"
                  }`}
                  title="较上次余额变化">
                    {totalBalanceChange! > 0 ? "↑" : "↓"} {Math.abs(totalTrendPercent).toFixed(1)}%
                    <span className="text-[10px] font-normal opacity-60">环比</span>
                  </span>
                )}
              </div>
              {/* Account total trend sparkline */}
              {accountTrendData.length >= 2 && (
                <div className="h-7 w-full mt-1">
                  <ResponsiveContainer width="100%" height={28}>
                    <AreaChart data={accountTrendData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="modalTotalGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={1.5} fill="url(#modalTotalGrad)" isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            <div className="bg-card border border-border rounded-[12px] p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">资产数</p>
              <p className="font-mono text-xl font-bold text-foreground">{assets.length}</p>
            </div>
          </div>

          {/* Assets Section Header */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground">资产明细</h3>
            <Button variant="outline" size="sm" className="text-primary border-primary/30 hover:bg-primary/10" onClick={onAddAsset}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              添加资产
            </Button>
          </div>
        </div>

        {/* Scrollable assets area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {assets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-[12px]">
            此账户暂无资产
            <br />
            <Button variant="link" className="text-primary mt-1" onClick={onAddAsset}>
              点击添加
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {assets.map((asset, assetIndex) => {
              const assetTypeConfig = getAssetTypeConfig(asset.type)
              const AssetIcon = assetTypeConfig.icon
              const isExpanded = expandedAssets.has(asset.id)
              const assetBalanceList = balances[asset.id] || []
              const balanceAmount = getBalanceAtDate(asset.id, 0)
              const isLastAsset = assetIndex === assets.length - 1

              // Sparkline data sorted ascending
              const sparklineData = [...assetBalanceList]
                .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
              const showSparkline = sparklineData.length >= 2
              const sparklineAmounts = sparklineData.map((b) => b.amount)
              const crossesZero =
                showSparkline &&
                Math.min(...sparklineAmounts) < 0 &&
                Math.max(...sparklineAmounts) > 0

              return (
                <Fragment key={asset.id}>
                  {/* Asset Row */}
                  <div
                    className="p-3 rounded-[8px] bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => onToggleAssetExpand(asset.id)}
                  >
            <div className="flex items-center justify-between pr-12">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="w-4 h-4 flex items-center justify-center shrink-0">
                          {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        </span>
                        <span className="text-sm text-foreground truncate">{asset.name}</span>
                        <Badge className="gap-1 text-xs font-normal shrink-0 hidden sm:inline-flex">
                          {AssetIcon && <AssetIcon className="h-3 w-3" />}
                          {assetTypeConfig.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className={`font-mono text-sm font-medium ${balanceAmount < 0 ? "text-destructive" : "text-success"}`}>
                          {formatAmount(balanceAmount)}
                        </span>
                        {/* Desktop buttons */}
                        <div className="hidden md:flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-primary hover:text-primary"
                            onClick={(e) => { e.stopPropagation(); onAddBalance(asset) }}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => { e.stopPropagation(); onEditAsset(asset) }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={(e) => { e.stopPropagation(); onDeleteAsset(asset) }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {/* Mobile buttons (second row) */}
                    <div className="flex items-center gap-1 mt-2 md:hidden">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary h-7"
                        onClick={(e) => { e.stopPropagation(); onAddBalance(asset) }}
                      >
                        <Plus className="h-3.5 w-3.5 shrink-0" /><span className="hidden md:inline ml-1.5">添加快照</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7"
                        onClick={(e) => { e.stopPropagation(); onEditAsset(asset) }}
                      >
                        <Pencil className="h-3.5 w-3.5 shrink-0" /><span className="hidden md:inline ml-1.5">编辑</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-destructive hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); onDeleteAsset(asset) }}
                      >
                        <Trash2 className="h-3.5 w-3.5 shrink-0" /><span className="hidden md:inline ml-1.5">删除</span>
                      </Button>
                    </div>
                  </div>

                  {/* Balance Snapshots (expanded) */}
                  {isExpanded && (
                    <div className="ml-6 pl-4 border-l border-border data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-left-1 duration-200 space-y-0.5">
                      {/* Sparkline */}
                      {showSparkline && (
                        <div className="px-3 py-1">
                          <ResponsiveContainer width="100%" height={60}>
                            <AreaChart data={sparklineData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                              <defs>
                                <linearGradient id={`sparkGrad-${asset.id}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              {crossesZero && (
                                <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="2 2" strokeWidth={1} />
                              )}
                              <Area
                                type="monotone"
                                dataKey="amount"
                                stroke="var(--primary)"
                                strokeWidth={1.5}
                                fill={`url(#sparkGrad-${asset.id})`}
                                isAnimationActive={false}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {assetBalanceList.length === 0 ? (
                        <div className="flex items-center justify-between py-2 px-3 text-xs text-muted-foreground">
                          <span>暂无快照</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-primary hover:text-primary"
                            onClick={(e) => { e.stopPropagation(); onAddBalance(asset) }}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            添加
                          </Button>
                        </div>
                      ) : (
                        [...assetBalanceList]
                          .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
                          .map((balance) => (
                            <div
                              key={balance.id}
                              className="group flex items-center py-2 px-3 border-b border-border/40 last:border-b-0 rounded-[6px] hover:bg-muted/20 transition-colors"
                            >
                              <span className="text-xs text-muted-foreground">
                                {formatDateTime(balance.recordedAt)}
                              </span>
                              <div className="ml-auto flex items-center gap-3">
                                <span className={`font-mono text-sm ${balance.amount < 0 ? "text-destructive" : "text-success"}`}>
                                  {formatAmount(balance.amount)}
                                </span>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={(e) => { e.stopPropagation(); onEditBalance(balance) }}
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-destructive hover:text-destructive"
                                    onClick={(e) => { e.stopPropagation(); onDeleteBalance(balance) }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  )}
                </Fragment>
              )
            })}
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  )
}