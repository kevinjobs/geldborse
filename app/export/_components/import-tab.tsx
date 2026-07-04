"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ImportStats {
  accounts: number
  assets: number
  records: number
  balances: number
  snapshots: number
  duplicates: number
  invalid: number
}

interface ImportPreviewData {
  data: {
    version: string
    data: {
      accounts: Array<{
        id: string
        name: string
        type: string
        accountNumber: string | null
        initialBalance: number
        assets: Array<{
          id: string
          name: string
          type: string
          amount: number
          accountId: string
          balances: Array<{ amount: number; recordedAt: string }>
        }>
      }>
      snapshots?: unknown[]
      records?: Array<{
        id: string
        date: string
        type: string
        amount: number
        note: string | null
        accountId: string
        assetId: string | null
        account: { name: string } | null
        asset: { name: string } | null
      }>
    }
  }
  stats: {
    accounts: number
    assets: number
    records: number
    snapshots: number
    balances: number
  }
}

interface ImportTabProps {
  onImportComplete: () => void
}

export function ImportTab({ onImportComplete }: ImportTabProps) {
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'preview' | 'success' | 'error'>('idle')
  const [importError, setImportError] = useState<string>('')
  const [importStats, setImportStats] = useState<ImportStats>({ accounts: 0, assets: 0, records: 0, balances: 0, snapshots: 0, duplicates: 0, invalid: 0 })
  const [previewData, setPreviewData] = useState<ImportPreviewData | null>(null)

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 文件大小限制 (10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_FILE_SIZE) {
      setImportError('文件大小不能超过 10MB')
      setImportStatus('error')
      return
    }

    setImportStatus('loading')
    setImportError('')
    setImportStats({ accounts: 0, assets: 0, records: 0, balances: 0, snapshots: 0, duplicates: 0, invalid: 0 })

    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const jsonString = event.target?.result as string
          const importData = JSON.parse(jsonString)

          // 验证数据结构
          if (!importData.data || !importData.data.accounts) {
            throw new Error('无效的文件格式')
          }

          // 计算数据统计
          const stats = {
            accounts: importData.data.accounts?.length || 0,
            assets: importData.data.accounts?.reduce((total: number, account: { assets?: unknown[] }) => {
              return total + (account.assets?.length || 0)
            }, 0) || 0,
            records: importData.data.records?.length || 0,
            snapshots: importData.data.snapshots?.length || 0,
            balances: importData.data.accounts?.reduce((total: number, account: { assets?: Array<{ balances?: unknown[] }> }) => {
              return total + (account.assets?.reduce((sum: number, asset: { balances?: unknown[] }) => {
                return sum + (asset.balances?.length || 0)
              }, 0) || 0)
            }, 0) || 0
          }

          setPreviewData({
            data: importData,
            stats
          })
          setImportStatus('preview')
        } catch (error) {
          setImportError((error as Error).message)
          setImportStatus('error')
        }
      }
      reader.onerror = () => {
        setImportError('文件读取失败')
        setImportStatus('error')
      }
      reader.readAsText(file)
    } catch (error) {
      setImportError((error as Error).message)
      setImportStatus('error')
    }
  }

  const handleConfirmImport = async () => {
    if (!previewData) return

    setImportStatus('loading')
    try {
      // 发送到API
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(previewData.data)
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || '导入失败')
      }

      const result = await res.json()
      setImportStats({
        accounts: result.accounts || 0,
        assets: result.assets || 0,
        records: result.records || 0,
        balances: result.balances || 0,
        snapshots: result.snapshots || 0,
        duplicates: result.duplicates || 0,
        invalid: result.invalid || 0
      })
      setImportStatus('success')

      // 重新获取数据
      onImportComplete()
    } catch (error) {
      setImportError((error as Error).message)
      setImportStatus('error')
    }
  }

  const handleCancelImport = () => {
    setImportStatus('idle')
    setPreviewData(null)
    setImportError('')
    setImportStats({ accounts: 0, assets: 0, records: 0, balances: 0, snapshots: 0, duplicates: 0, invalid: 0 })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>导入数据</CardTitle>
        <CardDescription>通过导出的打包文件批量导入数据</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {importStatus === 'idle' && (
            <>
              <div className="p-4 bg-primary/10 rounded-[16px] border border-primary/30">
                <p className="text-sm text-primary">
                  请选择从其他用户导出的 .json 数据文件
                </p>
                <ul className="mt-2 space-y-1 text-sm text-primary">
                  <li>• 支持导入账户、资产、快照和收支记录</li>
                  <li>• 导入时会自动处理重复数据</li>
                  <li>• 导入过程可能需要几秒钟时间</li>
                </ul>
              </div>

              <input
                type="file"
                accept=".json"
                className="w-full border border-border rounded-[16px] p-2"
                onChange={handleFileImport}
              />
            </>
          )}

          {importStatus === 'loading' && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">正在处理数据...</p>
            </div>
          )}

          {importStatus === 'preview' && previewData && (
            <div className="space-y-4">
              <div className="p-4 bg-warning/10 border border-warning/30">
                <h3 className="font-medium text-warning mb-2">数据预览</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">账户数量: <span className="font-medium">{previewData.stats.accounts}</span></p>
                    <p className="text-sm text-muted-foreground">资产数量: <span className="font-medium">{previewData.stats.assets}</span></p>
                    <p className="text-sm text-muted-foreground">余额记录: <span className="font-medium">{previewData.stats.balances || 0}</span></p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">收支记录: <span className="font-medium">{previewData.stats.records}</span></p>
                    <p className="text-sm text-muted-foreground">资产快照: <span className="font-medium">{previewData.stats.snapshots}</span></p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-warning">
                  点击&ldquo;确认导入&rdquo;将开始导入以上数据，导入过程中会自动处理重复数据。
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="default"
                  onClick={handleConfirmImport}
                  className="flex-1"
                >
                  确认导入
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelImport}
                >
                  取消
                </Button>
              </div>
            </div>
          )}

          {importStatus === 'success' && (
            <div className="p-4 bg-success/10 rounded-[16px] border border-success/30">
              <p className="text-sm text-success font-medium">
                数据导入成功！
              </p>
              <div className="mt-3 space-y-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">成功导入：</span>
                  {importStats.accounts} 个账户，{importStats.assets} 个资产，{importStats.balances} 条余额记录，{importStats.records} 条收支记录，{importStats.snapshots} 条快照记录
                </p>
                {importStats.duplicates > 0 && (
                  <p className="text-sm text-warning">
                    <span className="font-medium">重复数据：</span>
                    {importStats.duplicates} 条（已自动处理）
                  </p>
                )}
                {importStats.invalid > 0 && (
                  <p className="text-sm text-destructive">
                    <span className="font-medium">无效数据：</span>
                    {importStats.invalid} 条（已跳过）
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                onClick={handleCancelImport}
                className="mt-4"
              >
                继续导入
              </Button>
            </div>
          )}

          {importStatus === 'error' && (
            <div className="p-4 bg-destructive/10 rounded-[16px] border border-destructive/30">
              <p className="text-sm text-destructive">
                导入失败：{importError}
              </p>
              <Button
                variant="outline"
                onClick={handleCancelImport}
                className="mt-3"
              >
                重新尝试
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
