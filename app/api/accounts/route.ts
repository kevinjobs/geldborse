import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Mock user ID for testing purposes
const MOCK_USER_ID = "cmniu7l7u0000k6lyrogpnkt5"

export async function GET() {
  const accounts = await prisma.account.findMany({
    where: {
      userId: MOCK_USER_ID
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
      let latestBalanceDate: Date | null = null
      for (const asset of account.assets) {
        const latestBalance = asset.balances[0]
        if (latestBalance) {
          const balanceDate = new Date(latestBalance.recordedAt)
          if (!latestBalanceDate || balanceDate > latestBalanceDate) {
            latestBalanceDate = balanceDate
          }
        }
        const baseAmount = latestBalance ? latestBalance.amount : (asset.amount || 0)
        totalAmount += baseAmount
      }

      let recordsAfterBalance = 0
      if (latestBalanceDate) {
        recordsAfterBalance = account.records
          .filter((r) => new Date(r.date) > latestBalanceDate!)
          .reduce((sum, r) => sum + r.amount, 0)
      } else {
        recordsAfterBalance = account.records.reduce((sum, r) => sum + r.amount, 0)
      }
      totalAmount += recordsAfterBalance
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

export async function POST(request: Request) {
  const { name, type, accountNumber, initialBalance } = await request.json()

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "账户名称不能为空" }, { status: 400 })
  }

  const account = await prisma.account.create({
    data: {
      name: name.trim(),
      type: type || "CASH",
      accountNumber: accountNumber?.trim() || null,
      initialBalance: parseFloat(initialBalance) || 0,
      userId: MOCK_USER_ID,
    },
  })
  return NextResponse.json(account)
}
