"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ResponsiveTable, ResponsiveTableBody, ResponsiveTableCell, ResponsiveTableHeader, ResponsiveTableRow } from "@/components/responsive-table"
import { getAccountNameColor, getAccountTypeConfig, getAssetTypeConfig } from "@/lib/account-config"
import { getAccountLogo } from "@/lib/account-logos"
import { DownloadSimpleIcon, FilePdfIcon, FileXlsIcon, ImageIcon, FileTextIcon } from "@phosphor-icons/react"
import { exportToXLSX, exportToCSV, exportToPDF, exportToJPG, type ExportFormat } from "@/lib/export-utils"
import { formatAmount } from "./format-helpers"
import type { Account, Asset } from "@/types"

interface AccountExportTabProps {
  accounts: (Account & { assets: Asset[]; totalAmount: number })[]
}

export function AccountExportTab({ accounts }: AccountExportTabProps) {
  const [accountFormat, setAccountFormat] = useState<ExportFormat>("xlsx")
  const [exporting, setExporting] = useState(false)

  const accountPreviewRef = useRef<HTMLDivElement>(null)

  const totalAssets = accounts.filter(a => !a.excludeFromTotal).reduce((sum, a) => sum + (a.totalAmount || 0), 0)

  const buildAccountData = (): (string | number)[][] => {
    const data: (string | number)[][] = [["账户名称", "账户类型", "账户号码", "资产名称", "资产类型", "金额", "账户总计"]]

    accounts.forEach((account) => {
      const accountTypeConfig = getAccountTypeConfig(account.type)
      if (account.assets && account.assets.length > 0) {
        account.assets.forEach((asset, index) => {
          const assetTypeConfig = getAssetTypeConfig(asset.type)
          const assetAmount = asset.balances?.[0]?.amount ?? 0
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

    const totalAmount = accounts.filter(a => !a.excludeFromTotal).reduce((sum, a) => sum + (a.totalAmount || 0), 0)
    data.push([])
    data.push(["总资产", "", "", "", "", "", totalAmount])

    return data
  }

  const handleExportAccount = async () => {
    setExporting(true)
    try {
      switch (accountFormat) {
        case "xlsx":
          exportToXLSX(buildAccountData(), "账户明细", "账户数据")
          break
        case "csv":
          exportToCSV(buildAccountData(), "账户明细")
          break
        case "pdf":
          await exportToPDF(accountPreviewRef.current!, "账户明细")
          break
        case "jpg":
          await exportToJPG(accountPreviewRef.current!, "账户明细")
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
          <CardTitle>导出账户明细</CardTitle>
          <CardDescription>导出所有账户及其资产详情</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>导出格式</Label>
            <RadioGroup
              value={accountFormat}
              onValueChange={(v) => setAccountFormat(v as ExportFormat)}
              className="flex flex-wrap gap-3 sm:gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="xlsx" id="account-xlsx" />
                <Label htmlFor="account-xlsx" className="flex items-center gap-1 cursor-pointer text-sm">
                  <FileXlsIcon className="h-4 w-4 text-success" />
                  Excel
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="account-pdf" />
                <Label htmlFor="account-pdf" className="flex items-center gap-1 cursor-pointer text-sm">
                  <FilePdfIcon className="h-4 w-4 text-destructive" />
                  PDF
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="jpg" id="account-jpg" />
                <Label htmlFor="account-jpg" className="flex items-center gap-1 cursor-pointer text-sm">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  图片
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="account-csv" />
                <Label htmlFor="account-csv" className="flex items-center gap-1 cursor-pointer text-sm">
                  <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                  CSV
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button onClick={handleExportAccount} className="w-full" disabled={exporting}>
            <DownloadSimpleIcon className="h-4 w-4 mr-2" />
            {exporting ? "导出中..." : "导出账户明细"}
          </Button>
        </CardContent>
      </Card>

      {(accountFormat === "pdf" || accountFormat === "jpg") && (
        <div className="space-y-2">
          <Label>预览</Label>
          <div
            ref={accountPreviewRef}
            className="w-full max-w-[800px] mx-auto bg-card p-6 rounded-[16px] border border-border"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">账户明细报告</h2>
              <p className="text-muted-foreground mt-1">
                生成时间：{new Date().toLocaleString("zh-CN")}
              </p>
            </div>

            <div className="bg-gradient-to-r from-[#00E5FF] to-[#32D74B] text-foreground p-4 rounded-[16px] mb-6">
              <div className="text-center">
                <p className="text-sm opacity-80">总资产</p>
                <p className="text-3xl font-bold">{formatAmount(totalAssets)}</p>
                <p className="text-sm opacity-80 mt-1">共 {accounts.length} 个账户</p>
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
                      <ResponsiveTableRow key={account.id} className={accountIndex % 2 === 0 ? "bg-card" : "bg-muted"}>
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
                        <ResponsiveTableCell mobileLabel="金额" className="text-right font-medium text-success">
                          {formatAmount(account.totalAmount)}
                        </ResponsiveTableCell>
                        <ResponsiveTableCell mobileLabel="账户总计" className="text-right font-bold text-success">
                          {formatAmount(account.totalAmount)}
                        </ResponsiveTableCell>
                      </ResponsiveTableRow>
                    )
                  }

                  return assets.map((asset, assetIndex) => {
                    const assetTypeConfig = getAssetTypeConfig(asset.type)
                    const assetAmount = asset.balances?.[0]?.amount ?? 0
                    return (
                      <ResponsiveTableRow
                        key={`${account.id}-${asset.id}`}
                        className={accountIndex % 2 === 0 ? "bg-card" : "bg-muted"}
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
                        <ResponsiveTableCell mobileLabel="金额" className="text-right font-medium text-success">
                          {formatAmount(assetAmount)}
                        </ResponsiveTableCell>
                        {assetIndex === 0 && (
                          <ResponsiveTableCell mobileLabel="账户总计" className="text-right font-bold text-success">
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
    </>
  )
}
