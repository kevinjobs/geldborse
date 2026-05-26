import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUserId } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId(request)
  if (!userId) {
    return NextResponse.json({ error: "未授权" }, { status: 401 })
  }

  const { id } = await params
  const record = await prisma.record.findFirst({
    where: {
      id,
      account: { userId }
    },
    include: { account: true },
  })
  if (!record) {
    return NextResponse.json({ error: "记录不存在" }, { status: 404 })
  }
  return NextResponse.json(record)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId(request)
  if (!userId) {
    return NextResponse.json({ error: "未授权" }, { status: 401 })
  }

  const { id } = await params

  const existing = await prisma.record.findFirst({
    where: {
      id,
      account: { userId }
    }
  })

  if (!existing) {
    return NextResponse.json({ error: "记录不存在或无权操作" }, { status: 404 })
  }

  const { date, accountId, assetId, amount, type, note } = await request.json()
  
  // 验证账户是否属于当前用户
  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      userId
    }
  })

  if (!account) {
    return NextResponse.json({ error: "账户不存在" }, { status: 400 })
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
  
  let finalAmount = parseFloat(amount)
  if (type === "EXPENSE") {
    finalAmount = -Math.abs(finalAmount)
  } else {
    finalAmount = Math.abs(finalAmount)
  }
  
  const record = await prisma.record.update({
    where: { id },
    data: {
      date: new Date(date),
      accountId,
      assetId: assetId || null,
      amount: finalAmount,
      type: type || "EXPENSE",
      note: note || null,
    },
    include: { account: true, asset: true },
  })
  return NextResponse.json(record)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId(request)
  if (!userId) {
    return NextResponse.json({ error: "未授权" }, { status: 401 })
  }

  const { id } = await params

  const existing = await prisma.record.findFirst({
    where: {
      id,
      account: { userId }
    }
  })

  if (!existing) {
    return NextResponse.json({ error: "记录不存在或无权操作" }, { status: 404 })
  }

  await prisma.record.delete({
    where: { id },
  })
  return NextResponse.json({ success: true })
}
