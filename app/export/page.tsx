"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ResponsiveTable, ResponsiveTableBody, ResponsiveTableCell, ResponsiveTableHeader, ResponsiveTableRow } from "@/components/responsive-table"
import { getAccountNameColor, getAccountTypeConfig, getAssetTypeConfig } from "@/lib/account-config"
import { getAccountLogo } from "@/lib/account-logos"
import { DownloadSimpleIcon, FilePdfIcon, FileXlsIcon, ImageIcon, CameraIcon, WalletIcon, ListIcon } from "@phosphor-icons/react"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import { domToPng, domToJpeg } from "modern-screenshot"

interface Account {
  id: string
  name: string
  type: string
  accountNumber: string | null
  assets?: Asset[]
}

interface Asset {
  id: string
  name: string
  type: string
  accountId: string
  amount: number | null
  balances: { amount: number }[]
}

interface DailySnapshot {
  id: string
  snapshotAt: string
  accountId: string
  assetId: string | null
  amount: number
  account: Account
  asset: Asset | null
}

interface Record {
  id: string
  date: string
  type: string
  amount: number
  description: string | null
  accountId: string
  account: Account
}

type ExportFormat = "pdf" | "xlsx" | "jpg"

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
  }).format(amount)
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

export default function ExportPage() {
  const [snapshots, setSnapshots] = useState<DailySnapshot[]>([])
  const [accounts, setAccounts] = useState<(Account & { assets: Asset[]; totalAmount: number })[]>([])
  const [records, setRecords] = useState<Record[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedSnapshot, setSelectedSnapshot] = useState<string>("all")
  const [snapshotFormat, setSnapshotFormat] = useState<ExportFormat>("xlsx")
  const [accountFormat, setAccountFormat] = useState<ExportFormat>("xlsx")
  const [recordFormat, setRecordFormat] = useState<ExportFormat>("xlsx")

  const snapshotPreviewRef = useRef<HTMLDivElement>(null)
  const accountPreviewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [snapshotsRes, accountsRes, recordsRes] = await Promise.all([
        fetch("/api/daily-snapshots"),
        fetch("/api/accounts"),
        fetch("/api/records"),
      ])
      const snapshotsData = await snapshotsRes.json()
      const accountsData = await accountsRes.json()
      const recordsData = await recordsRes.json()
      setSnapshots(Array.isArray(snapshotsData) ? snapshotsData : [])
      setAccounts(Array.isArray(accountsData) ? accountsData : [])
      setRecords(Array.isArray(recordsData) ? recordsData : [])
    } catch (error) {
      console.error("获取数据失败:", error)
    } finally {
      setLoading(false)
    }
  }

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

  const exportToXLSX = (data: any[][], fileName: string, sheetName: string = "Sheet1") => {
    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
    XLSX.writeFile(wb, `${fileName}.xlsx`)
  }

  const exportToPDF = async (elementRef: HTMLElement | null, fileName: string) => {
    if (!elementRef) return
    const dataUrl = await domToPng(elementRef, {
      scale: 2,
      backgroundColor: "#ffffff",
    })
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })
    const imgWidth = 210
    const img = new Image()
    img.src = dataUrl
    await new Promise((resolve) => {
      img.onload = resolve
    })
    const imgHeight = (img.height * imgWidth) / img.width
    pdf.addImage(dataUrl, "PNG", 0, 0, imgWidth, imgHeight)
    pdf.save(`${fileName}.pdf`)
  }

  const exportToJPG = async (elementRef: HTMLDivElement | null, fileName: string) => {
    if (!elementRef) return
    const dataUrl = await domToJpeg(elementRef, {
      scale: 2,
      backgroundColor: "#ffffff",
      quality: 0.95,
    })
    const link = document.createElement("a")
    link.download = `${fileName}.jpg`
    link.href = dataUrl
    link.click()
  }

  const exportSnapshotXLSX = () => {
    const data: any[][] = [["快照时间", "账户名称", "账户类型", "资产名称", "资产类型", "金额"]]

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

    exportToXLSX(data, "资产快照", "快照数据")
  }

  const exportSnapshotPDF = async () => {
    await exportToPDF(snapshotPreviewRef.current, "资产快照")
  }

  const exportSnapshotJPG = async () => {
    await exportToJPG(snapshotPreviewRef.current, "资产快照")
  }

  const handleExportSnapshot = async () => {
    switch (snapshotFormat) {
      case "xlsx":
        exportSnapshotXLSX()
        break
      case "pdf":
        await exportSnapshotPDF()
        break
      case "jpg":
        await exportSnapshotJPG()
        break
    }
  }

  const exportAccountXLSX = () => {
    const data: any[][] = [["账户名称", "账户类型", "账户号码", "资产名称", "资产类型", "金额", "账户总计"]]

    accounts.forEach((account) => {
      const accountTypeConfig = getAccountTypeConfig(account.type)
      if (account.assets && account.assets.length > 0) {
        account.assets.forEach((asset, index) => {
          const assetTypeConfig = getAssetTypeConfig(asset.type)
          const assetAmount = asset.balances?.[0]?.amount ?? asset.amount ?? 0
          data.push([
            index === 0 ? account.name : "",
            index === 0 ? accountTypeConfig.label : "",
            index === 0 ? account.accountNumber || "-" : "",
            asset.name,
            assetTypeConfig.label,
            assetAmount,
            index === 0 ? account.totalAmount : "",
          ])
        })
      } else {
        data.push([
          account.name,
          accountTypeConfig.label,
          account.accountNumber || "-",
          "-",
          "-",
          account.totalAmount,
          account.totalAmount,
        ])
      }
    })

    const totalAmount = accounts.reduce((sum, a) => sum + (a.totalAmount || 0), 0)
    data.push([])
    data.push(["总资产", "", "", "", "", "", totalAmount])

    exportToXLSX(data, "账户明细", "账户数据")
  }

  const exportAccountPDF = async () => {
    await exportToPDF(accountPreviewRef.current, "账户明细")
  }

  const exportAccountJPG = async () => {
    await exportToJPG(accountPreviewRef.current, "账户明细")
  }

  const handleExportAccount = async () => {
    switch (accountFormat) {
      case "xlsx":
        exportAccountXLSX()
        break
      case "pdf":
        await exportAccountPDF()
        break
      case "jpg":
        await exportAccountJPG()
        break
    }
  }

  const exportRecordXLSX = () => {
    const data: any[][] = [["日期", "类型", "账户", "金额", "说明"]]

    records.forEach((record) => {
      data.push([
        new Date(record.date).toLocaleDateString("zh-CN"),
        record.type === "INCOME" ? "收入" : "支出",
        record.account.name,
        record.amount || 0,
        record.description || "-",
      ])
    })

    const incomeTotal = records.filter((r) => r.type === "INCOME").reduce((sum, r) => sum + (r.amount || 0), 0)
    const expenseTotal = records.filter((r) => r.type === "EXPENSE").reduce((sum, r) => sum + (r.amount || 0), 0)

    data.push([])
    data.push(["收入总计", "", "", incomeTotal, ""])
    data.push(["支出总计", "", "", Math.abs(expenseTotal), ""])
    data.push(["净收入", "", "", incomeTotal + expenseTotal, ""])

    exportToXLSX(data, "收支记录", "收支数据")
  }

  const exportRecordPDF = async () => {
    const element = document.getElementById("record-preview")
    if (!element) return
    await exportToPDF(element, "收支记录")
  }

  const handleExportRecord = async () => {
    switch (recordFormat) {
      case "xlsx":
        exportRecordXLSX()
        break
      case "pdf":
        await exportRecordPDF()
        break
    }
  }

  const totalAssets = accounts.reduce((sum, a) => sum + (a.totalAmount || 0), 0)
  const incomeTotal = records.filter((r) => r.type === "INCOME").reduce((sum, r) => sum + (r.amount || 0), 0)
  const expenseTotal = records.filter((r) => r.type === "EXPENSE").reduce((sum, r) => sum + (r.amount || 0), 0)

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col gap-4 p-6">
            <div className="text-center text-muted-foreground">加载中...</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-6 p-6">
          <Tabs defaultValue="snapshot" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="snapshot" className="flex items-center gap-2">
                <CameraIcon className="h-4 w-4" />
                导出快照
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2">
                <WalletIcon className="h-4 w-4" />
                导出账户明细
              </TabsTrigger>
              <TabsTrigger value="record" className="flex items-center gap-2">
                <ListIcon className="h-4 w-4" />
                导出收支情况
              </TabsTrigger>
            </TabsList>

            <TabsContent value="snapshot" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>导出资产快照</CardTitle>
                  <CardDescription>选择要导出的快照和导出格式</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
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
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="xlsx" id="snapshot-xlsx" />
                          <Label htmlFor="snapshot-xlsx" className="flex items-center gap-1 cursor-pointer">
                            <FileXlsIcon className="h-4 w-4 text-green-600" />
                            Excel
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="pdf" id="snapshot-pdf" />
                          <Label htmlFor="snapshot-pdf" className="flex items-center gap-1 cursor-pointer">
                            <FilePdfIcon className="h-4 w-4 text-red-600" />
                            PDF
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="jpg" id="snapshot-jpg" />
                          <Label htmlFor="snapshot-jpg" className="flex items-center gap-1 cursor-pointer">
                            <ImageIcon className="h-4 w-4 text-blue-600" />
                            图片
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  <Button onClick={handleExportSnapshot} className="w-full">
                    <DownloadSimpleIcon className="h-4 w-4 mr-2" />
                    导出快照
                  </Button>
                </CardContent>
              </Card>

              {(snapshotFormat === "pdf" || snapshotFormat === "jpg") && (
                <div className="space-y-2">
                  <Label>预览</Label>
                  <div
                    ref={snapshotPreviewRef}
                    style={{ width: "100%", maxWidth: "800px", margin: "0 auto", backgroundColor: "#ffffff", padding: "24px", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                  >
                    <div style={{ textAlign: "center", marginBottom: "24px" }}>
                      <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#1f2937" }}>资产快照报告</h2>
                      <p style={{ color: "#6b7280", marginTop: "4px" }}>
                        生成时间：{new Date().toLocaleString("zh-CN")}
                      </p>
                    </div>

                    {snapshotGroups
                      .filter((g) => selectedSnapshot === "all" || g.snapshotAt === selectedSnapshot)
                      .map((group) => (
                        <div key={group.snapshotAt} style={{ marginBottom: "24px" }}>
                          <div style={{ background: "linear-gradient(to right, #3b82f6, #8b5cf6)", color: "#ffffff", padding: "12px", borderRadius: "8px 8px 0 0" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontWeight: "600" }}>{formatDateTime(group.snapshotAt)}</span>
                              <span style={{ fontSize: "18px", fontWeight: "bold" }}>
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
                                  <ResponsiveTableRow key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
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
                                    <ResponsiveTableCell mobileLabel="金额" className="text-right font-medium text-green-600 dark:text-green-400">
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
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>导出账户明细</CardTitle>
                  <CardDescription>导出所有账户及其资产详情</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>导出格式</Label>
                    <RadioGroup
                      value={accountFormat}
                      onValueChange={(v) => setAccountFormat(v as ExportFormat)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="xlsx" id="account-xlsx" />
                        <Label htmlFor="account-xlsx" className="flex items-center gap-1 cursor-pointer">
                          <FileXlsIcon className="h-4 w-4 text-green-600" />
                          Excel
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pdf" id="account-pdf" />
                        <Label htmlFor="account-pdf" className="flex items-center gap-1 cursor-pointer">
                          <FilePdfIcon className="h-4 w-4 text-red-600" />
                          PDF
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="jpg" id="account-jpg" />
                        <Label htmlFor="account-jpg" className="flex items-center gap-1 cursor-pointer">
                          <ImageIcon className="h-4 w-4 text-blue-600" />
                          图片
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button onClick={handleExportAccount} className="w-full">
                    <DownloadSimpleIcon className="h-4 w-4 mr-2" />
                    导出账户明细
                  </Button>
                </CardContent>
              </Card>

              {(accountFormat === "pdf" || accountFormat === "jpg") && (
                <div className="space-y-2">
                  <Label>预览</Label>
                  <div
                    ref={accountPreviewRef}
                    style={{ width: "100%", maxWidth: "800px", margin: "0 auto", backgroundColor: "#ffffff", padding: "24px", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                  >
                    <div style={{ textAlign: "center", marginBottom: "24px" }}>
                      <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#1f2937" }}>账户明细报告</h2>
                      <p style={{ color: "#6b7280", marginTop: "4px" }}>
                        生成时间：{new Date().toLocaleString("zh-CN")}
                      </p>
                    </div>

                    <div style={{ background: "linear-gradient(to right, #10b981, #14b8a6)", color: "#ffffff", padding: "16px", borderRadius: "8px", marginBottom: "24px" }}>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "14px", opacity: "0.8" }}>总资产</p>
                        <p style={{ fontSize: "30px", fontWeight: "bold" }}>{formatAmount(totalAssets)}</p>
                        <p style={{ fontSize: "14px", opacity: "0.8", marginTop: "4px" }}>共 {accounts.length} 个账户</p>
                      </div>
                    </div>

                    <ResponsiveTable>
                      <thead>
                        <ResponsiveTableRow>
                          <ResponsiveTableHeader>账户</ResponsiveTableHeader>
                          <ResponsiveTableHeader>账户类型</ResponsiveTableHeader>
                          <ResponsiveTableHeader>账户号码</ResponsiveTableHeader>
                          <ResponsiveTableHeader>资产</ResponsiveTableHeader>
                          <ResponsiveTableHeader>资产类型</ResponsiveTableHeader>
                          <ResponsiveTableHeader className="text-right">金额</ResponsiveTableHeader>
                          <ResponsiveTableHeader className="text-right">账户总计</ResponsiveTableHeader>
                        </ResponsiveTableRow>
                      </thead>
                      <ResponsiveTableBody>
                        {accounts.map((account, accountIndex) => {
                          const nameColor = getAccountNameColor(account.name)
                          const accountTypeConfig = getAccountTypeConfig(account.type)
                          const assets = account.assets || []
                          const LogoComponent = getAccountLogo(account.name)

                          if (assets.length === 0) {
                            return (
                              <ResponsiveTableRow key={account.id} className={accountIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                <ResponsiveTableCell mobileLabel="账户">
                                  <div className="flex items-center gap-2">
                                    {LogoComponent ? (
                                      <LogoComponent size={16} className={nameColor.color} />
                                    ) : (
                                      <div
                                        style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: nameColor.color }}
                                      />
                                    )}
                                    {account.name}
                                  </div>
                                </ResponsiveTableCell>
                                <ResponsiveTableCell mobileLabel="账户类型">{accountTypeConfig.label}</ResponsiveTableCell>
                                <ResponsiveTableCell mobileLabel="账户号码">{account.accountNumber || "-"}</ResponsiveTableCell>
                                <ResponsiveTableCell mobileLabel="资产">-</ResponsiveTableCell>
                                <ResponsiveTableCell mobileLabel="资产类型">-</ResponsiveTableCell>
                                <ResponsiveTableCell mobileLabel="金额" className="text-right font-medium text-green-600 dark:text-green-400">
                                  {formatAmount(account.totalAmount)}
                                </ResponsiveTableCell>
                                <ResponsiveTableCell mobileLabel="账户总计" className="text-right font-bold text-green-600 dark:text-green-400">
                                  {formatAmount(account.totalAmount)}
                                </ResponsiveTableCell>
                              </ResponsiveTableRow>
                            )
                          }

                          return assets.map((asset, assetIndex) => {
                            const assetTypeConfig = getAssetTypeConfig(asset.type)
                            const assetAmount = asset.balances?.[0]?.amount ?? asset.amount ?? 0
                            return (
                              <ResponsiveTableRow
                                key={`${account.id}-${asset.id}`}
                                className={accountIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
                              >
                                {assetIndex === 0 && (
                                  <>
                                    <ResponsiveTableCell mobileLabel="账户">
                                      <div className="flex items-center gap-2">
                                        {LogoComponent ? (
                                          <LogoComponent size={16} className={nameColor.color} />
                                        ) : (
                                          <div
                                            style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: nameColor.color }}
                                          />
                                        )}
                                        {account.name}
                                      </div>
                                    </ResponsiveTableCell>
                                    <ResponsiveTableCell mobileLabel="账户类型">{accountTypeConfig.label}</ResponsiveTableCell>
                                    <ResponsiveTableCell mobileLabel="账户号码">{account.accountNumber || "-"}</ResponsiveTableCell>
                                  </>
                                )}
                                {assetIndex > 0 && (
                                  <>
                                    <ResponsiveTableCell mobileLabel="账户"></ResponsiveTableCell>
                                    <ResponsiveTableCell mobileLabel="账户类型"></ResponsiveTableCell>
                                    <ResponsiveTableCell mobileLabel="账户号码"></ResponsiveTableCell>
                                  </>
                                )}
                                <ResponsiveTableCell mobileLabel="资产" className="pl-6">{asset.name}</ResponsiveTableCell>
                                <ResponsiveTableCell mobileLabel="资产类型">{assetTypeConfig.label}</ResponsiveTableCell>
                                <ResponsiveTableCell mobileLabel="金额" className="text-right font-medium text-green-600 dark:text-green-400">
                                  {formatAmount(assetAmount)}
                                </ResponsiveTableCell>
                                {assetIndex === 0 && (
                                  <ResponsiveTableCell mobileLabel="账户总计" className="text-right font-bold text-green-600 dark:text-green-400">
                                    {formatAmount(account.totalAmount)}
                                  </ResponsiveTableCell>
                                )}
                                {assetIndex > 0 && (
                                  <ResponsiveTableCell mobileLabel="账户总计"></ResponsiveTableCell>
                                )}
                              </ResponsiveTableRow>
                            )
                          })
                        })}
                      </ResponsiveTableBody>
                    </ResponsiveTable>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="record" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>导出收支情况</CardTitle>
                  <CardDescription>导出所有收支记录</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>导出格式</Label>
                    <RadioGroup
                      value={recordFormat}
                      onValueChange={(v) => setRecordFormat(v as ExportFormat)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="xlsx" id="record-xlsx" />
                        <Label htmlFor="record-xlsx" className="flex items-center gap-1 cursor-pointer">
                          <FileXlsIcon className="h-4 w-4 text-green-600" />
                          Excel
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pdf" id="record-pdf" />
                        <Label htmlFor="record-pdf" className="flex items-center gap-1 cursor-pointer">
                          <FilePdfIcon className="h-4 w-4 text-red-600" />
                          PDF
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button onClick={handleExportRecord} className="w-full">
                    <DownloadSimpleIcon className="h-4 w-4 mr-2" />
                    导出收支情况
                  </Button>
                </CardContent>
              </Card>

              {recordFormat === "pdf" && (
                <div className="space-y-2">
                  <Label>预览</Label>
                  <div
                    id="record-preview"
                    style={{ width: "100%", maxWidth: "800px", margin: "0 auto", backgroundColor: "#ffffff", padding: "24px", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                  >
                    <div style={{ textAlign: "center", marginBottom: "24px" }}>
                      <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#1f2937" }}>收支记录报告</h2>
                      <p style={{ color: "#6b7280", marginTop: "4px" }}>
                        生成时间：{new Date().toLocaleString("zh-CN")}
                      </p>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
                      <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "16px", textAlign: "center" }}>
                        <p style={{ fontSize: "14px", color: "#16a34a" }}>总收入</p>
                        <p style={{ fontSize: "24px", fontWeight: "bold", color: "#16a34a" }}>{formatAmount(incomeTotal)}</p>
                      </div>
                      <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "16px", textAlign: "center" }}>
                        <p style={{ fontSize: "14px", color: "#dc2626" }}>总支出</p>
                        <p style={{ fontSize: "24px", fontWeight: "bold", color: "#dc2626" }}>{formatAmount(Math.abs(expenseTotal))}</p>
                      </div>
                      <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "16px", textAlign: "center" }}>
                        <p style={{ fontSize: "14px", color: "#2563eb" }}>净收入</p>
                        <p style={{ fontSize: "24px", fontWeight: "bold", color: "#2563eb" }}>
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
                        {records.map((record, index) => {
                          const nameColor = getAccountNameColor(record.account.name)
                          const LogoComponent = getAccountLogo(record.account.name)
                          return (
                            <ResponsiveTableRow key={record.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                              <ResponsiveTableCell mobileLabel="日期">
                                {new Date(record.date).toLocaleDateString("zh-CN")}
                              </ResponsiveTableCell>
                              <ResponsiveTableCell mobileLabel="类型">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${record.type === "INCOME" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
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
                              <ResponsiveTableCell mobileLabel="金额" className={`text-right font-medium ${record.type === "INCOME" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                {record.type === "INCOME" ? "+" : "-"}
                                {formatAmount(Math.abs(record.amount || 0))}
                              </ResponsiveTableCell>
                              <ResponsiveTableCell mobileLabel="说明">{record.description || "-"}</ResponsiveTableCell>
                            </ResponsiveTableRow>
                          )
                        })}
                      </ResponsiveTableBody>
                    </ResponsiveTable>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
