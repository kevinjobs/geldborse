import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const record = await prisma.record.findUnique({
    where: { id },
    include: { account: true },
  })
  if (!record) {
    return NextResponse.json({ error: "记录不存在" }, { status: 404 })
  }
  return NextResponse.json(record)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { date, accountId, assetId, amount, type, note } = await request.json()
  
  // 验证账户是否存在
  const account = await prisma.account.findUnique({
    where: { id: accountId }
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
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.record.delete({
    where: { id },
  })
  return NextResponse.json({ success: true })
}
