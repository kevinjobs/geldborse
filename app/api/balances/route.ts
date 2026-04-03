import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUserId } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId(request)
  if (!userId) {
    return NextResponse.json({ error: "未授权" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const assetId = searchParams.get("assetId")
  const accountId = searchParams.get("accountId")

  if (assetId) {
    // 验证资产是否属于当前用户
    const asset = await prisma.asset.findFirst({
      where: {
        id: assetId,
        account: {
          userId
        }
      }
    })

    if (!asset) {
      return NextResponse.json({ error: "资产不存在或不属于当前用户" }, { status: 400 })
    }

    const balances = await prisma.balance.findMany({
      where: { assetId },
      orderBy: { recordedAt: "desc" },
    })
    return NextResponse.json(balances)
  }

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

    const balances = await prisma.balance.findMany({
      where: {
        asset: {
          accountId,
        },
      },
      include: { asset: true },
      orderBy: { recordedAt: "desc" },
    })
    return NextResponse.json(balances)
  }

  const balances = await prisma.balance.findMany({
    where: {
      asset: {
        account: {
          userId
        }
      }
    },
    include: { asset: { include: { account: true } } },
    orderBy: { recordedAt: "desc" },
  })
  return NextResponse.json(balances)
}

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId(request)
  if (!userId) {
    return NextResponse.json({ error: "未授权" }, { status: 401 })
  }

  const { amount, recordedAt, assetId } = await request.json()

  if (!assetId) {
    return NextResponse.json({ error: "缺少资产ID" }, { status: 400 })
  }

  // 验证资产是否属于当前用户
  const asset = await prisma.asset.findFirst({
    where: {
      id: assetId,
      account: {
        userId
      }
    }
  })

  if (!asset) {
    return NextResponse.json({ error: "资产不存在或不属于当前用户" }, { status: 400 })
  }

  const balance = await prisma.balance.create({
    data: {
      amount: parseFloat(amount),
      recordedAt: new Date(recordedAt),
      assetId,
    },
    include: { asset: true },
  })
  return NextResponse.json(balance)
}
