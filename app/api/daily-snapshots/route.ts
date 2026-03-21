import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const snapshots = await prisma.dailySnapshot.findMany({
      orderBy: [{ snapshotAt: "desc" }, { accountId: "asc" }],
      include: {
        account: {
          include: {
            _count: {
              select: { assets: true },
            },
          },
        },
      },
    })

    const assetIds = snapshots.filter((s) => s.assetId).map((s) => s.assetId as string)
    const uniqueAssetIds = [...new Set(assetIds)]

    const assets = await prisma.asset.findMany({
      where: { id: { in: uniqueAssetIds } },
    })

    const assetMap = new Map(assets.map((a) => [a.id, a]))

    const snapshotsWithAssets = snapshots.map((s) => ({
      ...s,
      asset: s.assetId ? assetMap.get(s.assetId) || null : null,
      account: {
        ...s.account,
        assets: Array(s.account._count.assets).fill({ id: "" }),
      },
    }))

    return NextResponse.json(snapshotsWithAssets)
  } catch (error) {
    console.error("获取每日快照失败:", error)
    return NextResponse.json({ error: "获取每日快照失败" }, { status: 500 })
  }
}

export async function POST() {
  try {
    const now = new Date()

    const accounts = await prisma.account.findMany({
      include: {
        assets: {
          include: {
            balances: {
              orderBy: { recordedAt: "desc" },
              take: 1,
            },
          },
        },
        records: true,
      },
    })

    const snapshots = []

    for (const account of accounts) {
      if (account.assets.length > 0) {
        let latestBalanceDate: Date | null = null
        for (const asset of account.assets) {
          const latestBalance = asset.balances[0]
          if (latestBalance) {
            const balanceDate = new Date(latestBalance.recordedAt)
            if (!latestBalanceDate || balanceDate > latestBalanceDate) {
              latestBalanceDate = balanceDate
            }
          }
        }

        let recordsAfterBalance = 0
        if (latestBalanceDate) {
          recordsAfterBalance = account.records
            .filter((r) => new Date(r.date) > latestBalanceDate)
            .reduce((sum, r) => sum + r.amount, 0)
        } else {
          recordsAfterBalance = account.records.reduce((sum, r) => sum + r.amount, 0)
        }

        for (const asset of account.assets) {
          const latestBalance = asset.balances[0]
          const baseAmount = latestBalance ? latestBalance.amount : (asset.amount || 0)

          const snapshot = await prisma.dailySnapshot.create({
            data: {
              snapshotAt: now,
              accountId: account.id,
              assetId: asset.id,
              amount: baseAmount,
            },
          })
          snapshots.push(snapshot)
        }

        if (recordsAfterBalance !== 0) {
          const recordSnapshot = await prisma.dailySnapshot.create({
            data: {
              snapshotAt: now,
              accountId: account.id,
              assetId: null,
              amount: recordsAfterBalance,
            },
          })
          snapshots.push(recordSnapshot)
        }
      } else {
        const recordsTotal = account.records.reduce((sum, r) => sum + r.amount, 0)
        const realTimeAmount = account.initialBalance + recordsTotal

        const snapshot = await prisma.dailySnapshot.create({
          data: {
            snapshotAt: now,
            accountId: account.id,
            assetId: null,
            amount: realTimeAmount,
          },
        })
        snapshots.push(snapshot)
      }
    }

    return NextResponse.json({
      success: true,
      message: `已创建 ${snapshots.length} 条快照`,
      snapshotAt: now.toISOString(),
    })
  } catch (error) {
    console.error("创建每日快照失败:", error)
    return NextResponse.json({ error: "创建每日快照失败" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const snapshotAt = searchParams.get("snapshotAt")

    if (!snapshotAt) {
      return NextResponse.json({ error: "缺少快照时间参数" }, { status: 400 })
    }

    const result = await prisma.dailySnapshot.deleteMany({
      where: {
        snapshotAt: new Date(snapshotAt),
      },
    })

    return NextResponse.json({
      success: true,
      message: `已删除 ${result.count} 条快照`,
    })
  } catch (error) {
    console.error("删除快照失败:", error)
    return NextResponse.json({ error: "删除快照失败" }, { status: 500 })
  }
}
