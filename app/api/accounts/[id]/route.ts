import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const account = await prisma.account.findUnique({
    where: { id },
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
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { name, type, accountNumber, initialBalance } = await request.json()

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "账户名称不能为空" }, { status: 400 })
  }

  try {
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
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

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
