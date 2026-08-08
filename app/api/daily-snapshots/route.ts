import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request, { requiredScope: 'snapshots:read' })
    if (auth instanceof NextResponse) return auth
    const { userId } = auth

    const snapshots = await prisma.dailySnapshot.findMany({
      where: {
        assetId: { not: null },
        account: {
          userId
        }
      },
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

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request, { requiredScope: 'snapshots:write' })
    if (auth instanceof NextResponse) return auth
    const { userId } = auth

    const body = await request.json().catch(() => ({}))
    const snapshotAtStr: string | undefined = body?.snapshotAt

    let snapshotAt: Date | undefined
    if (snapshotAtStr) {
      snapshotAt = new Date(snapshotAtStr)
      if (isNaN(snapshotAt.getTime())) {
        return NextResponse.json({ error: "无效的日期时间" }, { status: 400 })
      }
      if (snapshotAt > new Date()) {
        return NextResponse.json({ error: "快照时间不能为未来" }, { status: 400 })
      }
    }

    const snapshotTime = snapshotAt || new Date()

    const accounts = await prisma.account.findMany({
      where: { userId },
      include: {
        assets: {
          orderBy: { createdAt: "asc" },
          include: {
            balances: {
              orderBy: { recordedAt: "desc" },
              take: 1,
              ...(snapshotAt ? { where: { recordedAt: { lte: snapshotAt } } } : {}),
            },
          },
        },
        records: snapshotAt ? { where: { date: { lte: snapshotAt } } } : true,
      },
    })

    const snapshots = await prisma.$transaction(async (tx) => {
      const results = []

      for (const account of accounts) {
        if (account.assets.length > 0) {
          const activeAssetIds = new Set(account.assets.map((a) => a.id))

          for (let i = 0; i < account.assets.length; i++) {
            const asset = account.assets[i]
            const latestBalance = asset.balances[0]
            const baseAmount = latestBalance ? latestBalance.amount : 0
            const balanceDate = latestBalance ? new Date(latestBalance.recordedAt) : null

            let delta = 0
            for (const record of account.records) {
              if (record.assetId === asset.id) {
                if (!balanceDate || new Date(record.date) > balanceDate) {
                  delta += record.amount
                }
              }
            }

            if (i === 0) {
              let unattributedDelta = 0
              for (const record of account.records) {
                if ((record.assetId === null || (record.assetId !== null && !activeAssetIds.has(record.assetId))) &&
                    (!balanceDate || new Date(record.date) > balanceDate)) {
                  unattributedDelta += record.amount
                }
              }
              delta += unattributedDelta
            }

            const total = baseAmount + delta

            const existing = await tx.dailySnapshot.findFirst({
              where: {
                accountId: account.id,
                assetId: asset.id,
                snapshotAt: snapshotTime,
              },
            })

            if (existing) {
              await tx.dailySnapshot.update({
                where: { id: existing.id },
                data: { amount: total },
              })
              results.push(existing)
            } else {
              const snapshot = await tx.dailySnapshot.create({
                data: {
                  snapshotAt: snapshotTime,
                  accountId: account.id,
                  assetId: asset.id,
                  amount: total,
                },
              })
              results.push(snapshot)
            }
          }
        } else {
          // DEDUP: check for existing BALANCE asset before creating
          let defaultAsset = await tx.asset.findFirst({
            where: { accountId: account.id, type: "BALANCE" }
          })
          if (!defaultAsset) {
            defaultAsset = await tx.asset.create({
              data: {
                name: account.name,
                type: "BALANCE",
                amount: 0,
                accountId: account.id,
              },
            })

            await tx.balance.create({
              data: {
                amount: 0,
                recordedAt: snapshotTime,
                assetId: defaultAsset.id,
              },
            })
          }

          const recordsTotal = account.records.reduce((sum, r) => sum + r.amount, 0)
          const total = recordsTotal

          const existing = await tx.dailySnapshot.findFirst({
            where: {
              accountId: account.id,
              assetId: defaultAsset.id,
              snapshotAt: snapshotTime,
            },
          })

          if (existing) {
            await tx.dailySnapshot.update({
              where: { id: existing.id },
              data: { amount: total },
            })
            results.push(existing)
          } else {
            const snapshot = await tx.dailySnapshot.create({
              data: {
                snapshotAt: snapshotTime,
                accountId: account.id,
                assetId: defaultAsset.id,
                amount: total,
              },
            })
            results.push(snapshot)
          }
        }
      }
      return results
    }, { timeout: 15000 })

    return NextResponse.json({
      success: true,
      message: `已创建 ${snapshots.length} 条快照`,
      snapshotAt: snapshotTime.toISOString(),
    })
  } catch (error) {
    console.error("创建每日快照失败:", error)
    return NextResponse.json({ error: "创建每日快照失败" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request, { requiredScope: 'snapshots:write' })
    if (auth instanceof NextResponse) return auth
    const { userId } = auth

    const { searchParams } = new URL(request.url)
    const snapshotAt = searchParams.get("snapshotAt")

    if (!snapshotAt) {
      return NextResponse.json({ error: "缺少快照时间参数" }, { status: 400 })
    }

    const result = await prisma.dailySnapshot.deleteMany({
      where: {
        snapshotAt: new Date(snapshotAt),
        account: {
          userId
        }
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
