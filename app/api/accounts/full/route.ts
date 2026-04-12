import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUserId } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId(request)
  if (!userId) {
    return NextResponse.json({ error: "未授权" }, { status: 401 })
  }

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
        orderBy: { createdAt: "desc" },
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
    let latestBalanceTime: Date | null = null
    let recordsAfterBalanceTotal = 0
    let latestSnapshotTotal = 0

    if (account.assets.length > 0) {
      // 计算所有资产的最新余额总和，并找到最新的余额时间
      for (const asset of account.assets) {
        const latestBalance = asset.balances[0]
        if (latestBalance) {
          latestSnapshotTotal += latestBalance.amount
          totalAmount += latestBalance.amount
          const balanceTime = new Date(latestBalance.recordedAt)
          if (!latestBalanceTime || balanceTime > latestBalanceTime) {
            latestBalanceTime = balanceTime
          }
        } else {
          latestSnapshotTotal += asset.amount || 0
          totalAmount += asset.amount || 0
        }
      }
      
      // 计算在最新余额时间之后的收支记录
      if (latestBalanceTime) {
        const latestBalanceTimeSec = Math.floor(latestBalanceTime.getTime() / 1000)
        
        const recordsAfterBalance = account.records.filter(record => {
          const recordTimeSec = Math.floor(new Date(record.date).getTime() / 1000)
          return recordTimeSec > latestBalanceTimeSec
        })
        
        recordsAfterBalanceTotal = recordsAfterBalance.reduce((sum, r) => sum + r.amount, 0)
        totalAmount += recordsAfterBalanceTotal
      } else {
        // 对于没有余额记录的资产，计算所有收支记录
        recordsAfterBalanceTotal = account.records.reduce((sum, r) => sum + r.amount, 0)
        totalAmount += recordsAfterBalanceTotal
      }
    } else {
      // 对于没有资产的账户，使用初始余额 + 所有收支
      latestSnapshotTotal = account.initialBalance
      totalAmount = account.initialBalance
      
      recordsAfterBalanceTotal = account.records.reduce((sum, r) => sum + r.amount, 0)
      totalAmount += recordsAfterBalanceTotal
    }

    return {
      ...account,
      totalAmount,
      recordsAfterBalanceTotal,
      latestSnapshotTotal,
    }
  })

  return NextResponse.json(accountsWithTotal)
}
