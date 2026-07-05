import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request, { requiredScope: 'accounts:read' })
  if (auth instanceof NextResponse) return auth
  const { userId } = auth

  try {
    // 获取所有账户，包含完整的资产和余额数据
    const accounts = await prisma.account.findMany({
      where: {
        userId
      },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { records: true, assets: true },
        },
        assets: {
          orderBy: { createdAt: "asc" },
          include: {
            balances: {
              orderBy: { recordedAt: "desc" },
            },
          },
        },
        records: true,
      },
    })

    // 计算每个账户的总金额和其他统计数据
    const accountsWithTotal = accounts.map((account) => {
      let totalAmount = 0
      let recordsAfterBalanceTotal = 0
      let latestSnapshotTotal = 0

      if (account.assets.length > 0) {
        const activeAssetIds = new Set(account.assets.map((a) => a.id))

        for (let i = 0; i < account.assets.length; i++) {
          const asset = account.assets[i]
          const latestBalance = asset.balances[0]
          const baseAmount = latestBalance ? latestBalance.amount : 0
          const balanceDate = latestBalance ? new Date(latestBalance.recordedAt) : null

          latestSnapshotTotal += baseAmount

          let assetRecordsTotal = account.records
            .filter((r) => r.assetId === asset.id && (!balanceDate || new Date(r.date) > balanceDate))
            .reduce((sum, r) => sum + r.amount, 0)

          if (i === 0) {
            const unattributedTotal = account.records
              .filter((r) => (r.assetId === null || (r.assetId !== null && !activeAssetIds.has(r.assetId))) &&
                (!balanceDate || new Date(r.date) > balanceDate))
              .reduce((sum, r) => sum + r.amount, 0)
            assetRecordsTotal += unattributedTotal
          }

          recordsAfterBalanceTotal += assetRecordsTotal
          totalAmount += baseAmount + assetRecordsTotal
        }
      } else {
        const recordsTotal = account.records.reduce((sum, r) => sum + r.amount, 0)
        latestSnapshotTotal = recordsTotal
        recordsAfterBalanceTotal = recordsTotal
        totalAmount = recordsTotal
      }

      return {
        ...account,
        totalAmount,
        recordsAfterBalanceTotal,
        latestSnapshotTotal,
      }
    })

    return NextResponse.json(accountsWithTotal)
  } catch {
    return NextResponse.json({ error: "获取账户失败" }, { status: 500 })
  }
}
