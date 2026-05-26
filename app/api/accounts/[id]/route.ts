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
  const account = await prisma.account.findFirst({
    where: { id, userId },
    include: {
      records: { orderBy: { date: "desc" }, take: 10 },
      assets: { orderBy: { createdAt: "desc" } },
    },
  })
  if (!account) {
    return NextResponse.json({ error: "账户不存在" }, { status: 404 })
  }
  return NextResponse.json(account)
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
  const { name, type, accountNumber, initialBalance } = await request.json()

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "账户名称不能为空" }, { status: 400 })
  }

  try {
    const existing = await prisma.account.findFirst({
      where: { id, userId }
    })

    if (!existing) {
      return NextResponse.json({ error: "账户不存在或无权操作" }, { status: 404 })
    }

    const account = await prisma.account.update({
      where: { id },
      data: {
        name: name.trim(),
        type,
        accountNumber: accountNumber?.trim() || null,
        initialBalance: parseFloat(initialBalance) || 0,
      },
    })
    return NextResponse.json(account)
  } catch {
    return NextResponse.json({ error: "更新失败" }, { status: 500 })
  }
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

  const existing = await prisma.account.findFirst({
    where: { id, userId }
  })

  if (!existing) {
    return NextResponse.json({ error: "账户不存在或无权操作" }, { status: 404 })
  }

  const recordCount = await prisma.record.count({
    where: { accountId: id },
  })

  if (recordCount > 0) {
    return NextResponse.json(
      { error: "该账户有关联记录，无法删除" },
      { status: 400 }
    )
  }

  try {
    await prisma.asset.deleteMany({
      where: { accountId: id },
    })
    await prisma.account.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 })
  }
}
