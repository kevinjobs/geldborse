"use client"

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Banknote, Zap, Gauge, CalendarDays } from "lucide-react"
import { AreaChart, Area, ResponsiveContainer } from "recharts"
import { formatAmount } from "@/lib/format"

interface KpiSummaryRowProps {
  kpiData: {
    totalNet: number
    totalPos: number
    totalNeg: number
    posCount: number
    negCount: number
    earliestDate: string | null
    latestDate: string | null
  }
  kpiTrends: {
    netTrend: Array<{ date: string; total: number }>
    assetTrend: Array<{ date: string; total: number }>
    liabilityTrend: Array<{ date: string; total: number }>
  }
  allBalanceDatesCount: number
}

export function KpiSummaryRow({ kpiData, kpiTrends, allBalanceDatesCount }: KpiSummaryRowProps) {
  return (
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
              {allBalanceDatesCount} 个数据点
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
