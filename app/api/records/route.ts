import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request, { requiredScope: 'records:read' })
    if (auth instanceof NextResponse) return auth
    const { userId } = auth

    const records = await prisma.record.findMany({
      where: {
        account: {
          userId
        }
      },
      include: { account: true, asset: true },
      orderBy: { date: "desc" },
    })
    return NextResponse.json(records)
  } catch (error) {
    console.error('获取记录失败:', error)
    return NextResponse.json({ error: "获取记录失败" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request, { requiredScope: 'records:write' })
    if (auth instanceof NextResponse) return auth
    const { userId } = auth

    const { date, accountId, assetId, amount, type, note } = await request.json()

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

    // 如果提供了assetId，验证资产是否属于该账户
    if (assetId) {
      const asset = await prisma.asset.findFirst({
        where: {
          id: assetId,
          accountId
        }
      })

      if (!asset) {
        return NextResponse.json({ error: "资产不存在或不属于该账户" }, { status: 400 })
      }
    }

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || !isFinite(parsedAmount)) {
      return NextResponse.json({ error: "金额无效" }, { status: 400 })
    }
    let finalAmount = parsedAmount
    if (type === "EXPENSE") {
      finalAmount = -Math.abs(finalAmount)
    } else {
      finalAmount = Math.abs(finalAmount)
    }
    const record = await prisma.record.create({
      data: {
        date: new Date(date),
        accountId,
        assetId: assetId || null,
        amount: finalAmount,
        type: type || "EXPENSE",
        note: note || null,
      },
      include: { account: true },
    })
    return NextResponse.json(record)
  } catch (error) {
    console.error('创建记录失败:', error)
    const errorMessage = error instanceof Error ? error.message : '创建记录失败'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
