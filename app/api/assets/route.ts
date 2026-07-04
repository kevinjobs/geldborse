import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request, { requiredScope: 'assets:read' })
  if (auth instanceof NextResponse) return auth
  const { userId } = auth

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
  const auth = await authenticateRequest(request, { requiredScope: 'assets:write' })
  if (auth instanceof NextResponse) return auth
  const { userId } = auth

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

  const parsedAmount = parseFloat(amount)
  if (isNaN(parsedAmount) || !isFinite(parsedAmount)) {
    return NextResponse.json({ error: "金额无效" }, { status: 400 })
  }

  const { id: assetId } = await prisma.$transaction(async (tx) => {
    const newAsset = await tx.asset.create({
      data: {
        name,
        type: type || "DEPOSIT",
        amount: parsedAmount,
        accountId,
      },
    })

    await tx.balance.create({
      data: {
        amount: parsedAmount,
        recordedAt: new Date(),
        assetId: newAsset.id,
      },
    })

    return newAsset
  })

  const assetWithBalances = await prisma.asset.findUnique({
    where: { id: assetId },
    include: { account: true, balances: { orderBy: { recordedAt: "desc" } } },
  })

  return NextResponse.json(assetWithBalances)
}
