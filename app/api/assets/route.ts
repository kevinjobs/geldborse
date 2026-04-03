import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUserId } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId(request)
  if (!userId) {
    return NextResponse.json({ error: "未授权" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const accountId = searchParams.get("accountId")

  if (accountId) {
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

    const assets = await prisma.asset.findMany({
      where: { accountId },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(assets)
  }

  const assets = await prisma.asset.findMany({
    where: {
      account: {
        userId
      }
    },
    include: { account: true },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(assets)
}

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId(request)
  if (!userId) {
    return NextResponse.json({ error: "未授权" }, { status: 401 })
  }

  const { name, type, amount, accountId } = await request.json()

  if (!name || !accountId) {
    return NextResponse.json({ error: "缺少必要字段" }, { status: 400 })
  }

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

  const asset = await prisma.asset.create({
    data: {
      name,
      type: type || "DEPOSIT",
      amount: parseFloat(amount) || 0,
      accountId,
    },
    include: { account: true },
  })
  return NextResponse.json(asset)
}
