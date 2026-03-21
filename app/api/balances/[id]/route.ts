import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const balance = await prisma.balance.findUnique({
    where: { id },
    include: { asset: { include: { account: true } } },
  })
  if (!balance) {
    return NextResponse.json({ error: "余额快照不存在" }, { status: 404 })
  }
  return NextResponse.json(balance)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { amount, recordedAt } = await request.json()

  try {
    const balance = await prisma.balance.update({
      where: { id },
      data: {
        amount: parseFloat(amount),
        recordedAt: new Date(recordedAt),
      },
      include: { asset: true },
    })
    return NextResponse.json(balance)
  } catch {
    return NextResponse.json({ error: "更新失败" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    await prisma.balance.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 })
  }
}
