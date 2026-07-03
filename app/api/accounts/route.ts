import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request, { requiredScope: 'accounts:read' })
  if (auth instanceof NextResponse) return auth
  const { userId } = auth

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
  const accountsWithTotal = accounts.map((account) => {
    let totalAmount = 0
    let recordsAfterBalanceTotal = 0
    let latestSnapshotTotal = 0

    if (account.assets.length > 0) {
      const sortedAssets = [...account.assets].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      const activeAssetIds = new Set(sortedAssets.map((a) => a.id))

      for (let i = 0; i < sortedAssets.length; i++) {
        const asset = sortedAssets[i]
        const latestBalance = asset.balances[0]
        const baseAmount = latestBalance ? latestBalance.amount : (asset.amount || 0)
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
      latestSnapshotTotal = account.initialBalance
      const recordsTotal = account.records.reduce((sum, r) => sum + r.amount, 0)
      recordsAfterBalanceTotal = recordsTotal
      totalAmount = account.initialBalance + recordsTotal
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

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request, { requiredScope: 'accounts:write' })
    if (auth instanceof NextResponse) return auth
    const { userId } = auth

    const { name, type, accountNumber } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "账户名称不能为空" }, { status: 400 })
    }

    const account = await prisma.account.create({
      data: {
        name: name.trim(),
        type: type || "CASH",
        accountNumber: accountNumber?.trim() || null,
        userId,
      },
    })

    return NextResponse.json(account)
  } catch (error) {
    console.error('创建账户失败:', error)
    return NextResponse.json({ error: "创建账户失败" }, { status: 500 })
  }
}
