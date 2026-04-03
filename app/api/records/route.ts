import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUserId } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId(request)
  if (!userId) {
    return NextResponse.json({ error: "未授权" }, { status: 401 })
  }

  const records = await prisma.record.findMany({
    where: {
      account: {
        userId
      }
    },
    include: { account: true },
    orderBy: { date: "desc" },
  })
  return NextResponse.json(records)
}

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId(request)
  if (!userId) {
    return NextResponse.json({ error: "未授权" }, { status: 401 })
  }

  const { date, accountId, amount, type } = await request.json()

  // 验证账户是否属于当前用户
  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      userId
    }
  })

  if (!account) {
    return NextResponse.json({ error: "账户不存在或不属于当前用户" }, { status: 400 })
  }

  let finalAmount = parseFloat(amount)
  if (type === "EXPENSE") {
    finalAmount = -Math.abs(finalAmount)
  } else {
    finalAmount = Math.abs(finalAmount)
  }
  const record = await prisma.record.create({
    data: {
      date: new Date(date),
      accountId,
      amount: finalAmount,
      type: type || "EXPENSE",
    },
    include: { account: true },
  })
  return NextResponse.json(record)
}
