"use client"

import { useState, useRef, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ResponsiveTable, ResponsiveTableBody, ResponsiveTableCell, ResponsiveTableHeader, ResponsiveTableRow } from "@/components/responsive-table"
import { getAccountNameColor } from "@/lib/account-config"
import { getAccountLogo } from "@/lib/account-logos"
import { DownloadSimpleIcon, FilePdfIcon, FileXlsIcon, ImageIcon, FileTextIcon } from "@phosphor-icons/react"
import { exportToXLSX, exportToCSV, exportToPDF, exportToJPG, type ExportFormat } from "@/lib/export-utils"
import { formatAmount } from "./format-helpers"
import type { Record } from "@/types"

interface RecordExportTabProps {
  records: Record[]
}

export function RecordExportTab({ records }: RecordExportTabProps) {
  const [recordFormat, setRecordFormat] = useState<ExportFormat>("xlsx")
  const [exporting, setExporting] = useState(false)
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")

  const recordPreviewRef = useRef<HTMLDivElement>(null)

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const recordDate = new Date(r.date)
      if (dateFrom && recordDate < new Date(dateFrom)) return false
      if (dateTo && recordDate > new Date(dateTo + 'T23:59:59')) return false
      return true
    })
  }, [records, dateFrom, dateTo])

  const incomeTotal = filteredRecords.filter((r) => r.type === "INCOME").reduce((sum, r) => sum + (r.amount || 0), 0)
  const expenseTotal = filteredRecords.filter((r) => r.type === "EXPENSE").reduce((sum, r) => sum + (r.amount || 0), 0)

  const buildRecordData = (): (string | number)[][] => {
    const data: (string | number)[][] = [["日期", "类型", "账户", "金额", "说明"]]

    filteredRecords.forEach((record) => {
      data.push([
        new Date(record.date).toLocaleDateString("zh-CN"),
        record.type === "INCOME" ? "收入" : "支出",
        record.account.name,
        record.amount || 0,
        record.note || "-",
      ])
    })

    data.push([])
    data.push(["收入总计", "", "", incomeTotal, ""])
    data.push(["支出总计", "", "", Math.abs(expenseTotal), ""])
    data.push(["净收入", "", "", incomeTotal + expenseTotal, ""])

    return data
  }

  const handleExportRecord = async () => {
    setExporting(true)
    try {
      switch (recordFormat) {
        case "xlsx":
          exportToXLSX(buildRecordData(), "收支记录", "收支数据")
          break
        case "csv":
          exportToCSV(buildRecordData(), "收支记录")
          break
        case "pdf":
          await exportToPDF(recordPreviewRef.current!, "收支记录")
          break
        case "jpg":
          await exportToJPG(recordPreviewRef.current!, "收支记录")
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
          <CardTitle>导出收支情况</CardTitle>
          <CardDescription>导出所有收支记录</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label>开始日期</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>结束日期</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>导出格式</Label>
            <RadioGroup
              value={recordFormat}
              onValueChange={(v) => setRecordFormat(v as ExportFormat)}
              className="flex flex-wrap gap-3 sm:gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="xlsx" id="record-xlsx" />
                <Label htmlFor="record-xlsx" className="flex items-center gap-1 cursor-pointer text-sm">
                  <FileXlsIcon className="h-4 w-4 text-success" />
                  Excel
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="record-pdf" />
                <Label htmlFor="record-pdf" className="flex items-center gap-1 cursor-pointer text-sm">
                  <FilePdfIcon className="h-4 w-4 text-destructive" />
                  PDF
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="jpg" id="record-jpg" />
                <Label htmlFor="record-jpg" className="flex items-center gap-1 cursor-pointer text-sm">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  图片
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="record-csv" />
                <Label htmlFor="record-csv" className="flex items-center gap-1 cursor-pointer text-sm">
                  <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                  CSV
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button onClick={handleExportRecord} className="w-full" disabled={exporting}>
            <DownloadSimpleIcon className="h-4 w-4 mr-2" />
            {exporting ? "导出中..." : "导出收支情况"}
          </Button>
        </CardContent>
      </Card>

      {recordFormat === "pdf" || recordFormat === "jpg" ? (
        <div className="space-y-2">
          <Label>预览</Label>
          <div
            ref={recordPreviewRef}
            className="w-full max-w-[800px] mx-auto bg-card p-6 rounded-[16px] border border-border"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">收支记录报告</h2>
              <p className="text-muted-foreground mt-1">
                生成时间：{new Date().toLocaleString("zh-CN")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
              <div className="bg-success/10 border border-success/30 rounded-[16px] p-3 sm:p-4 text-center">
                <p className="text-sm text-success mb-1">总收入</p>
                <p className="text-xl sm:text-2xl font-bold text-success">{formatAmount(incomeTotal)}</p>
              </div>
              <div className="bg-destructive/10 border border-destructive/30 rounded-[16px] p-3 sm:p-4 text-center">
                <p className="text-sm text-destructive mb-1">总支出</p>
                <p className="text-xl sm:text-2xl font-bold text-destructive">{formatAmount(Math.abs(expenseTotal))}</p>
              </div>
              <div className="bg-primary/10 border border-primary/30 rounded-[16px] p-3 sm:p-4 text-center">
                <p className="text-sm text-primary mb-1">净收入</p>
                <p className="text-xl sm:text-2xl font-bold text-primary">
                  {formatAmount(incomeTotal + expenseTotal)}
                </p>
              </div>
            </div>

            <ResponsiveTable>
              <thead>
                <ResponsiveTableRow>
                  <ResponsiveTableHeader>日期</ResponsiveTableHeader>
                  <ResponsiveTableHeader>类型</ResponsiveTableHeader>
                  <ResponsiveTableHeader>账户</ResponsiveTableHeader>
                  <ResponsiveTableHeader className="text-right">金额</ResponsiveTableHeader>
                  <ResponsiveTableHeader>说明</ResponsiveTableHeader>
                </ResponsiveTableRow>
              </thead>
              <ResponsiveTableBody>
                {filteredRecords.map((record, index) => {
                  const nameColor = getAccountNameColor(record.account.name)
                  const LogoComponent = getAccountLogo(record.account.name)
                  return (
                    <ResponsiveTableRow key={record.id} className={index % 2 === 0 ? "bg-card" : "bg-muted"}>
                      <ResponsiveTableCell mobileLabel="日期">
                        {new Date(record.date).toLocaleDateString("zh-CN")}
                      </ResponsiveTableCell>
                      <ResponsiveTableCell mobileLabel="类型">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${record.type === "INCOME" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                          {record.type === "INCOME" ? "收入" : "支出"}
                        </span>
                      </ResponsiveTableCell>
                      <ResponsiveTableCell mobileLabel="账户">
                        <div className="flex items-center gap-2">
                          {LogoComponent ? (
                            <LogoComponent size={16} className={nameColor.color} />
                          ) : (
                            <div
                              style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: nameColor.color }}
                            />
                          )}
                          {record.account.name}
                        </div>
                      </ResponsiveTableCell>
                      <ResponsiveTableCell mobileLabel="金额" className={`text-right font-medium ${record.type === "INCOME" ? "text-success" : "text-destructive"}`}>
                        {record.type === "INCOME" ? "+" : "-"}
                        {formatAmount(Math.abs(record.amount || 0))}
                      </ResponsiveTableCell>
                      <ResponsiveTableCell mobileLabel="说明">{record.note || "-"}</ResponsiveTableCell>
                    </ResponsiveTableRow>
                  )
                })}
              </ResponsiveTableBody>
            </ResponsiveTable>
          </div>
        </div>
      ) : null}
    </>
  )
}
