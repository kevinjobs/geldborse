import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateRequest } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request, { requiredScope: 'assets:read' })
  if (auth instanceof NextResponse) return auth
  const { userId } = auth

  const { id } = await params
  const balance = await prisma.balance.findFirst({
    where: {
      id,
      asset: {
        account: { userId }
      }
    },
    include: { asset: { include: { account: true } } },
  })
  if (!balance) {
    return NextResponse.json({ error: "余额快照不存在" }, { status: 404 })
  }
  return NextResponse.json(balance)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request, { requiredScope: 'assets:write' })
  if (auth instanceof NextResponse) return auth
  const { userId } = auth

  const { id } = await params
  const { amount, recordedAt, note } = await request.json()

  try {
    const existing = await prisma.balance.findFirst({
      where: {
        id,
        asset: {
          account: { userId }
        }
      }
    })

    if (!existing) {
      return NextResponse.json({ error: "余额快照不存在或无权操作" }, { status: 404 })
    }

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || !isFinite(parsedAmount)) {
      return NextResponse.json({ error: "金额无效" }, { status: 400 })
    }

    const balance = await prisma.balance.update({
      where: { id },
      data: {
        amount: parsedAmount,
        recordedAt: new Date(recordedAt),
        note: note || null,
      },
      include: { asset: true },
    })
    return NextResponse.json(balance)
  } catch (error) {
    console.error("更新失败:", error)
    return NextResponse.json({ error: "更新失败" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request, { requiredScope: 'assets:write' })
  if (auth instanceof NextResponse) return auth
  const { userId } = auth

  const { id } = await params

  try {
    const existing = await prisma.balance.findFirst({
      where: {
        id,
        asset: {
          account: { userId }
        }
      }
    })

    if (!existing) {
      return NextResponse.json({ error: "余额快照不存在或无权操作" }, { status: 404 })
    }

    await prisma.balance.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("删除失败:", error)
    return NextResponse.json({ error: "删除失败" }, { status: 500 })
  }
}
