"use client"

import React, { useState, useRef, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ResponsiveTable, ResponsiveTableBody, ResponsiveTableCell, ResponsiveTableHeader, ResponsiveTableRow } from "@/components/responsive-table"
import { getAccountNameColor, getAccountTypeConfig, getAssetTypeConfig } from "@/lib/account-config"
import { getAccountLogo } from "@/lib/account-logos"
import { DownloadSimpleIcon, FilePdfIcon, FileXlsIcon, ImageIcon, FileTextIcon } from "@phosphor-icons/react"
import { exportToXLSX, exportToCSV, exportToPDF, exportToJPG, type ExportFormat } from "@/lib/export-utils"
import { formatAmount, formatDateTime } from "./format-helpers"
import type { DailySnapshot } from "@/types"

interface SnapshotExportTabProps {
  snapshots: DailySnapshot[]
}

export function SnapshotExportTab({ snapshots }: SnapshotExportTabProps) {
  const [selectedSnapshot, setSelectedSnapshot] = useState<string>("all")
  const [snapshotFormat, setSnapshotFormat] = useState<ExportFormat>("xlsx")
  const [exporting, setExporting] = useState(false)

  const snapshotPreviewRef = useRef<HTMLDivElement>(null)

  const snapshotGroups = useMemo(() => {
    const groups: { [key: string]: DailySnapshot[] } = {}
    snapshots.forEach((snapshot) => {
      if (!groups[snapshot.snapshotAt]) {
        groups[snapshot.snapshotAt] = []
      }
      groups[snapshot.snapshotAt].push(snapshot)
    })
    return Object.entries(groups)
      .map(([snapshotAt, items]) => ({
        snapshotAt,
        items,
        total: items.reduce((sum, item) => sum + item.amount, 0),
      }))
      .sort((a, b) => new Date(b.snapshotAt).getTime() - new Date(a.snapshotAt).getTime())
  }, [snapshots])

  const uniqueSnapshotTimes = useMemo(() => {
    return [...new Set(snapshots.map((s) => s.snapshotAt))].sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    )
  }, [snapshots])

  const filteredSnapshots = useMemo(() => {
    if (selectedSnapshot === "all") return snapshots
    return snapshots.filter((s) => s.snapshotAt === selectedSnapshot)
  }, [snapshots, selectedSnapshot])

  const buildSnapshotData = (): (string | number)[][] => {
    const data: (string | number)[][] = [["快照时间", "账户名称", "账户类型", "资产名称", "资产类型", "金额"]]

    filteredSnapshots.forEach((snapshot) => {
      const accountTypeConfig = getAccountTypeConfig(snapshot.account.type)
      const assetTypeConfig = snapshot.asset ? getAssetTypeConfig(snapshot.asset.type) : null
      const isRecordAdjustment = !snapshot.assetId && (snapshot.account.assets?.length ?? 0) > 0
      data.push([
        formatDateTime(snapshot.snapshotAt),
        snapshot.account.name,
        accountTypeConfig.label,
        isRecordAdjustment ? "(收支调整)" : (snapshot.asset?.name || "-"),
        isRecordAdjustment ? "-" : (assetTypeConfig?.label || "-"),
        snapshot.amount,
      ])
    })

    const totals: { [key: string]: number } = {}
    filteredSnapshots.forEach((s) => {
      const key = formatDateTime(s.snapshotAt)
      totals[key] = (totals[key] || 0) + s.amount
    })

    data.push([])
    data.push(["快照时间", "总计"])
    Object.entries(totals).forEach(([time, total]) => {
      data.push([time, total])
    })

    return data
  }

  const handleExportSnapshot = async () => {
    setExporting(true)
    try {
      switch (snapshotFormat) {
        case "xlsx":
          exportToXLSX(buildSnapshotData(), "资产快照", "快照数据")
          break
        case "csv":
          exportToCSV(buildSnapshotData(), "资产快照")
          break
        case "pdf":
          await exportToPDF(snapshotPreviewRef.current!, "资产快照")
          break
        case "jpg":
          await exportToJPG(snapshotPreviewRef.current!, "资产快照")
          break
      }
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>导出资产快照</CardTitle>
          <CardDescription>选择要导出的快照和导出格式</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label>选择快照</Label>
              <Select value={selectedSnapshot} onValueChange={setSelectedSnapshot}>
                <SelectTrigger>
                  <SelectValue placeholder="选择快照" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部快照</SelectItem>
                  {uniqueSnapshotTimes.map((time) => (
                    <SelectItem key={time} value={time}>
                      {formatDateTime(time)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>导出格式</Label>
              <RadioGroup
                value={snapshotFormat}
                onValueChange={(v) => setSnapshotFormat(v as ExportFormat)}
                className="flex flex-wrap gap-3 sm:gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="xlsx" id="snapshot-xlsx" />
                  <Label htmlFor="snapshot-xlsx" className="flex items-center gap-1 cursor-pointer text-sm">
                    <FileXlsIcon className="h-4 w-4 text-success" />
                    Excel
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pdf" id="snapshot-pdf" />
                  <Label htmlFor="snapshot-pdf" className="flex items-center gap-1 cursor-pointer text-sm">
                    <FilePdfIcon className="h-4 w-4 text-destructive" />
                    PDF
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="jpg" id="snapshot-jpg" />
                  <Label htmlFor="snapshot-jpg" className="flex items-center gap-1 cursor-pointer text-sm">
                    <ImageIcon className="h-4 w-4 text-primary" />
                    图片
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="csv" id="snapshot-csv" />
                  <Label htmlFor="snapshot-csv" className="flex items-center gap-1 cursor-pointer text-sm">
                    <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                    CSV
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <Button onClick={handleExportSnapshot} className="w-full" disabled={exporting}>
            <DownloadSimpleIcon className="h-4 w-4 mr-2" />
            {exporting ? "导出中..." : "导出快照"}
          </Button>
        </CardContent>
      </Card>

      {(snapshotFormat === "pdf" || snapshotFormat === "jpg") && (
        <div className="space-y-2">
          <Label>预览</Label>
          <div
            ref={snapshotPreviewRef}
            className="w-full max-w-[800px] mx-auto bg-card p-6 rounded-[16px] border border-border"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">资产快照报告</h2>
              <p className="text-muted-foreground mt-1">
                生成时间：{new Date().toLocaleString("zh-CN")}
              </p>
            </div>

            {snapshotGroups
              .filter((g) => selectedSnapshot === "all" || g.snapshotAt === selectedSnapshot)
              .map((group) => (
                <div key={group.snapshotAt} className="mb-6">
                  <div className="bg-gradient-to-r from-[#00E5FF] to-[#32D74B] text-foreground p-3 rounded-t-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{formatDateTime(group.snapshotAt)}</span>
                      <span className="text-lg font-bold">
                        总计: {formatAmount(group.total)}
                      </span>
                    </div>
                  </div>
                  <ResponsiveTable>
                    <thead>
                      <ResponsiveTableRow>
                        <ResponsiveTableHeader>账户</ResponsiveTableHeader>
                        <ResponsiveTableHeader>账户类型</ResponsiveTableHeader>
                        <ResponsiveTableHeader>资产</ResponsiveTableHeader>
                        <ResponsiveTableHeader>资产类型</ResponsiveTableHeader>
                        <ResponsiveTableHeader className="text-right">金额</ResponsiveTableHeader>
                      </ResponsiveTableRow>
                    </thead>
                    <ResponsiveTableBody>
                      {group.items.map((item, index) => {
                        const nameColor = getAccountNameColor(item.account.name)
                        const accountTypeConfig = getAccountTypeConfig(item.account.type)
                        const assetTypeConfig = item.asset ? getAssetTypeConfig(item.asset.type) : null
                        const isRecordAdjustment = !item.assetId && (item.account.assets?.length ?? 0) > 0
                        const LogoComponent = getAccountLogo(item.account.name)
                        return (
                          <ResponsiveTableRow key={item.id} className={index % 2 === 0 ? "bg-card" : "bg-muted"}>
                            <ResponsiveTableCell mobileLabel="账户">
                              <div className="flex items-center gap-2">
                                {LogoComponent ? (
                                  <LogoComponent size={16} className={nameColor.color} />
                                ) : (
                                  <div
                                    style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: nameColor.color }}
                                  />
                                )}
                                {item.account.name}
                              </div>
                            </ResponsiveTableCell>
                            <ResponsiveTableCell mobileLabel="账户类型">{accountTypeConfig.label}</ResponsiveTableCell>
                            <ResponsiveTableCell mobileLabel="资产">
                              {isRecordAdjustment ? "(收支调整)" : (item.asset?.name || "-")}
                            </ResponsiveTableCell>
                            <ResponsiveTableCell mobileLabel="资产类型">
                              {isRecordAdjustment ? "-" : (assetTypeConfig?.label || "-")}
                            </ResponsiveTableCell>
                            <ResponsiveTableCell mobileLabel="金额" className="text-right font-medium text-success">
                              {formatAmount(item.amount)}
                            </ResponsiveTableCell>
                          </ResponsiveTableRow>
                        )
                      })}
                    </ResponsiveTableBody>
                  </ResponsiveTable>
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  )
}
