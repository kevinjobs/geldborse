import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request, { requiredScope: 'import' })
    if (auth instanceof NextResponse) return auth
    const { userId } = auth

    const [accounts, snapshots, records] = await Promise.all([
      prisma.account.findMany({
        where: { userId },
        include: {
          assets: {
            include: {
              balances: { orderBy: { recordedAt: 'asc' } },
            },
          },
        },
      }),
      prisma.dailySnapshot.findMany({
        where: { account: { userId } },
      }),
      prisma.record.findMany({
        where: { account: { userId } },
        include: {
          account: { select: { name: true } },
          asset: { select: { name: true } },
        },
      }),
    ])

    const data = {
      exportDate: new Date().toISOString(),
      version: '1.1',
      data: {
        accounts: accounts.map((account) => ({
          id: account.id,
          name: account.name,
          type: account.type,
          accountNumber: account.accountNumber,
          initialBalance: account.initialBalance ?? 0,
          assets: account.assets.map((asset) => ({
            id: asset.id,
            name: asset.name,
            type: asset.type,
            amount: asset.amount ?? 0,
            accountId: asset.accountId,
              balances: asset.balances.map((b) => ({
                amount: b.amount,
                recordedAt: b.recordedAt.toISOString(),
                note: b.note || null,
              })),
          })),
        })),
        snapshots: snapshots.map((s) => ({
          ...s,
          snapshotAt: s.snapshotAt.toISOString(),
        })),
        records: records.map((r) => ({
          id: r.id,
          date: r.date.toISOString(),
          type: r.type,
          amount: r.amount,
          note: r.note || null,
          accountId: r.accountId,
          assetId: r.assetId || null,
          account: r.account ? { name: r.account.name } : null,
          asset: r.asset ? { name: r.asset.name } : null,
        })),
      },
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('导出数据失败:', error)
    return NextResponse.json({ error: '导出数据失败' }, { status: 500 })
  }
}
