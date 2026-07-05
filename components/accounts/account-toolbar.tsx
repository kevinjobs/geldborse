"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Plus, XCircle, ArrowLeftToLine, ArrowRightToLine, CalendarIcon } from "lucide-react"
import { ACCOUNT_TYPE_CONFIG } from "@/lib/account-config"

interface AccountToolbarProps {
  sortBy: "balanceAbs" | "lastUpdated"
  sortDir: "desc" | "asc"
  onSortChange: (by: "balanceAbs" | "lastUpdated", dir: "desc" | "asc") => void
  snapshotDate: string
  datePickerOpen: boolean
  onDatePickerOpenChange: (open: boolean) => void
  onSnapshotDateChange: (date: string) => void
  allBalanceDates: string[]
  earliestBalanceDate: string
  latestBalanceDate: string
  onAdd: () => void
  activeTypeFilter: string
  onActiveTypeFilterChange: (filter: string) => void
  typeCounts: Record<string, number>
  showArchived: boolean
  onShowArchivedChange: (show: boolean) => void
  archivedCount: number
}

export function AccountToolbar({
  sortBy,
  sortDir,
  onSortChange,
  snapshotDate,
  datePickerOpen,
  onDatePickerOpenChange,
  onSnapshotDateChange,
  allBalanceDates,
  earliestBalanceDate,
  latestBalanceDate,
  onAdd,
  activeTypeFilter,
  onActiveTypeFilterChange,
  typeCounts,
  showArchived,
  onShowArchivedChange,
  archivedCount,
}: AccountToolbarProps) {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">账户管理</h2>
          <p className="text-sm text-muted-foreground hidden md:block">管理您的财务账户、资产和余额快照</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={`${sortBy}-${sortDir}`} onValueChange={(v) => {
            const [by, dir] = v.split("-") as ["balanceAbs" | "lastUpdated", "desc" | "asc"]
            onSortChange(by, dir)
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
            <Popover open={datePickerOpen} onOpenChange={onDatePickerOpenChange}>
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
                      onSnapshotDateChange(`${y}-${m}-${d}`)
                    }
                    onDatePickerOpenChange(false)
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
                onClick={() => onSnapshotDateChange(latestBalanceDate)}
                title="跳转至最新数据日期"
              >
                <ArrowRightToLine className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 md:h-8 md:w-8"
                onClick={() => onSnapshotDateChange(earliestBalanceDate)}
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
                onClick={() => onSnapshotDateChange("")}
                title="清除日期筛选"
              >
                <XCircle className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
            )}
          </div>
          <Button onClick={onAdd} size="sm" className="hidden md:inline-flex h-8">
            <Plus className="h-4 w-4 mr-1.5" />
            添加账户
          </Button>
        </div>
      </div>
      {/* ── Type filter tabs ── */}
      <div className="flex items-center gap-1.5 flex-wrap mt-1">
        <button
          onClick={() => onActiveTypeFilterChange("all")}
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
              onClick={() => onActiveTypeFilterChange(value)}
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
            onClick={() => onShowArchivedChange(!showArchived)}
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
    </>
  )
}
