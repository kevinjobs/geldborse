"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DownloadSimpleIcon } from "@phosphor-icons/react"

export function AllDataTab() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const exportAllData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/export', { credentials: 'include' })
      if (!response.ok) {
        throw new Error(`导出失败: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `geldborse-all-data-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('导出全部数据失败:', err)
      setError(err instanceof Error ? err.message : '导出失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>导出全部数据</CardTitle>
        <CardDescription>导出所有账户、资产、快照和收支记录的完整数据，用于批量导入</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="p-4 bg-primary/10 rounded-[16px] border border-primary/30">
            <p className="text-sm text-primary">
              导出的文件包含以下数据：
            </p>
            <ul className="mt-2 space-y-1 text-sm text-primary">
              <li>• 所有账户信息（名称、类型、账户号码）</li>
              <li>• 所有资产信息（名称、类型、金额）</li>
              <li>• 所有资产快照记录</li>
              <li>• 所有收支记录（包括备注）</li>
            </ul>
          </div>

          {error && (
            <div className="p-4 rounded-[16px] border border-destructive/30 bg-destructive/10 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            className="w-full"
            onClick={exportAllData}
            disabled={loading}
          >
            <DownloadSimpleIcon className="mr-2 h-4 w-4" />
            {loading ? '导出中...' : '导出全部数据'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
