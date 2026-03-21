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
  const { date, accountId, amount, type } = await request.json()
  
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
      amount: finalAmount,
      type: type || "EXPENSE",
    },
    include: { account: true },
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
