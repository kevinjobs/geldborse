"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getAccountNameColor, getAccountTypeConfig } from "@/lib/account-config"
import { getAccountLogo } from "@/lib/account-logos"
import { Plus, Pencil, Trash2, Archive, ArchiveX } from "lucide-react"
import { EyeSlash } from "@phosphor-icons/react"
import { AreaChart, Area, ResponsiveContainer } from "recharts"

interface AccountCardAccount {
  id: string
  name: string
  type: string
  accountNumber: string | null
  archived?: boolean
  excludeFromTotal?: boolean
  _count?: { assets: number }
}

interface AccountCardProps {
  account: AccountCardAccount
  currentBalance: number
  trendData: Array<{ date: string; total: number }>
  balanceChange: number | null
  lastUpdated: string | null
  onOpenDetail: () => void
  onAddAsset: () => void
  onEdit: () => void
  onDelete: () => void
  onArchive: () => void
}

export function AccountCard({
  account,
  currentBalance,
  trendData,
  balanceChange,
  lastUpdated,
  onOpenDetail,
  onAddAsset,
  onEdit,
  onDelete,
  onArchive,
}: AccountCardProps) {
  const nameColor = getAccountNameColor(account.name)
  const isNegative = currentBalance < 0
  const LogoComponent = getAccountLogo(account.name)
  const typeConfig = getAccountTypeConfig(account.type)
  const TypeIcon = typeConfig.icon
  const isArchived = !!account.archived

  // ── Trend indicator ──────────────────────────────────────────
  const trendPercent =
    balanceChange != null && balanceChange !== 0 && currentBalance - balanceChange !== 0
      ? (balanceChange / (currentBalance - balanceChange)) * 100
      : null

  const isTrendUp = trendPercent != null && trendPercent > 0
  const isTrendDown = trendPercent != null && trendPercent < 0

  // ── Sparkline gradient colour ────────────────────────────────
  const hasSparkline = trendData.length >= 2
  const sparklineIsUp =
    hasSparkline &&
    trendData[trendData.length - 1].total >= trendData[0].total

  const sparklineColor = sparklineIsUp ? "var(--primary)" : "var(--destructive)"

  return (
    <Card
      className={`rounded-[16px] overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:brightness-110 transition-all duration-200 dark:bg-[#252525] ${isArchived ? "opacity-60 border-dashed border-muted-foreground/40" : ""
        }`}
      onClick={onOpenDetail}
    >
      <CardContent className="px-4 py-0">
        {/* Row 1: Logo + Name */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 min-w-0">
            {LogoComponent && <LogoComponent size={16} className={nameColor.darkColor} />}
            <span className="font-semibold text-foreground truncate">{account.name}</span>
            {account.excludeFromTotal && (
              <span title="不计入总额">
                <EyeSlash className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </span>
            )}
            {isArchived && (
              <span title="已归档">
                <ArchiveX className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </span>
            )}
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal shrink-0 gap-0.5 h-5">
              <TypeIcon className="h-2.5 w-2.5" />
              {typeConfig.label}
            </Badge>
          </div>
          {lastUpdated && (
            <span className="text-[10px] text-muted-foreground shrink-0 ml-2">最近更新: {lastUpdated}</span>
          )}
        </div>

        {/* Row 2: Account Number */}
        {account.accountNumber && (
          <p className="text-xs text-muted-foreground mb-1">{account.accountNumber}</p>
        )}

        {/* Row 3: Balance + Trend Indicator */}
        <div className="flex items-center justify-between mb-0">
          <div className="flex items-center gap-3 flex-nowrap">
            <div className="truncate max-w-full">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">当前余额</p>
              <p
                className={`font-mono text-base md:text-xl font-bold ${isNegative ? "text-destructive" : "text-success"}`}
              >
                {currentBalance.toLocaleString("zh-CN", {
                  style: "currency",
                  currency: "CNY",
                })}
              </p>
            </div>
            {trendPercent != null && (
              <span
                title="较上次余额变化"
                className={`inline-flex items-center gap-1 font-mono text-xs font-semibold px-1.5 py-0.5 rounded-[4px] flex-shrink-0 whitespace-nowrap ${isTrendUp
                  ? "text-success bg-success/10"
                  : "text-destructive bg-destructive/10"
                  }`}
              >
                {isTrendUp ? "↑" : "↓"} {Math.abs(trendPercent).toFixed(1)}%
                <span className="text-[10px] font-normal opacity-60">环比</span>
              </span>
            )}
          </div>

          {/* Row 4: Asset count + Last updated (right column) */}
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">资产数</p>
            <p className="font-mono text-base md:text-xl font-bold text-foreground">
              {account._count?.assets ?? 0}
            </p>
          </div>
        </div>

        {/* Row 5: Sparkline */}
        {hasSparkline && (
          <div className="mt-1 mb-4">
            <ResponsiveContainer width="100%" height={36}>
              <AreaChart data={trendData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`sparkGrad-${account.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={sparklineColor} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={sparklineColor} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke={sparklineColor}
                  strokeWidth={2}
                  fill={`url(#sparkGrad-${account.id})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Row 6: Action Buttons */}
        <div
          className="flex flex-wrap gap-1.5 mt-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="outline"
            size="sm"
            className="text-primary border-primary/30 hover:bg-primary/10 hover:text-primary"
            onClick={onAddAsset}
          >
            <Plus className="h-3.5 w-3.5 shrink-0" /><span className="hidden md:inline ml-1.5">添加资产</span>
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5 shrink-0" /><span className="hidden md:inline ml-1.5">编辑</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={isArchived ? "text-primary border-primary/30 hover:bg-primary/10" : "text-muted-foreground border-border hover:text-foreground"}
            onClick={onArchive}
            title={isArchived ? "取消归档" : "归档账户"}
          >
            {isArchived ? (
              <ArchiveX className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <Archive className="h-3.5 w-3.5 shrink-0" />
            )}
            <span className="hidden md:inline ml-1.5">{isArchived ? "取消归档" : "归档"}</span>
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5 shrink-0" /><span className="hidden md:inline ml-1.5">删除</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}