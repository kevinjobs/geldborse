import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUserId } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId(request)
  if (!userId) {
    return NextResponse.json({ error: "未授权" }, { status: 401 })
  }

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

    if (account.assets.length > 0) {
      for (const asset of account.assets) {
        const latestBalance = asset.balances[0]
        if (latestBalance) {
          totalAmount += latestBalance.amount
        } else {
          totalAmount += asset.amount || 0
        }
      }
      const recordsTotal = account.records.reduce((sum, r) => sum + r.amount, 0)
      totalAmount += recordsTotal
    } else {
      const recordsTotal = account.records.reduce((sum, r) => sum + r.amount, 0)
      totalAmount = account.initialBalance + recordsTotal
    }

    return {
      ...account,
      totalAmount,
    }
  })
  return NextResponse.json(accountsWithTotal)
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request)
    if (!userId) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const { name, type, accountNumber, initialBalance, assets } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "账户名称不能为空" }, { status: 400 })
    }

    // 检查是否提供了资产信息
    if (!assets || !Array.isArray(assets) || assets.length === 0) {
      return NextResponse.json({ error: "必须至少添加一个资产" }, { status: 400 })
    }

    // 验证资产信息
    for (const asset of assets) {
      if (!asset.name || !asset.name.trim()) {
        return NextResponse.json({ error: "资产名称不能为空" }, { status: 400 })
      }
    }

    // 使用事务创建账户和资产
    const result = await prisma.$transaction(async (tx) => {
      // 创建账户
      const account = await tx.account.create({
        data: {
          name: name.trim(),
          type: type || "CASH",
          accountNumber: accountNumber?.trim() || null,
          initialBalance: parseFloat(initialBalance) || 0,
          userId,
        },
      })

      // 创建资产
      for (const assetData of assets) {
        await tx.asset.create({
          data: {
            name: assetData.name.trim(),
            type: assetData.type || "DEPOSIT",
            amount: parseFloat(assetData.amount) || 0,
            accountId: account.id,
          },
        })
      }

      return account
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('创建账户失败:', error)
    return NextResponse.json({ error: "创建账户失败" }, { status: 500 })
  }
}
