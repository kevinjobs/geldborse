"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DownloadSimpleIcon } from "@phosphor-icons/react"
import type { Account, Asset, DailySnapshot, Record, Balance } from "@/types"

interface AllDataTabProps {
  accounts: (Account & { assets: Asset[]; totalAmount: number })[]
  snapshots: DailySnapshot[]
  records: Record[]
  balances: Balance[]
  loading: boolean
}

export function AllDataTab({ accounts, snapshots, records, balances, loading }: AllDataTabProps) {
  const exportAllData = () => {
    // 构建 assetId → 全部余额记录的映射
    const balancesByAssetId = new Map<string, { amount: number; recordedAt: string }[]>()
    balances.forEach(b => {
      const list = balancesByAssetId.get(b.assetId) || []
      list.push({ amount: b.amount, recordedAt: b.recordedAt })
      balancesByAssetId.set(b.assetId, list)
    })

    const allData = {
      exportDate: new Date().toISOString(),
      version: "1.1",
      data: {
        accounts: accounts.map(account => ({
          id: account.id,
          name: account.name,
          type: account.type,
          accountNumber: account.accountNumber,
          initialBalance: account.initialBalance || 0,
          assets: account.assets.map(asset => ({
            id: asset.id,
            name: asset.name,
            type: asset.type,
            amount: asset.amount || 0,
            accountId: asset.accountId,
            balances: balancesByAssetId.get(asset.id) || [],
          }))
        })),
        snapshots: snapshots,
        records: records.map(r => ({
          id: r.id,
          date: r.date,
          type: r.type,
          amount: r.amount,
          note: r.note || null,
          accountId: r.accountId,
          assetId: r.assetId || null,
          account: r.account ? { name: r.account.name } : null,
          asset: r.asset ? { name: r.asset.name } : null,
        })),
      }
    }

    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `geldborse-all-data-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
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

          <Button
            className="w-full"
            onClick={exportAllData}
            disabled={loading}
          >
            <DownloadSimpleIcon className="mr-2 h-4 w-4" />
            导出全部数据
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
