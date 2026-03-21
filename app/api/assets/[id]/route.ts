import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: { account: true },
  })
  if (!asset) {
    return NextResponse.json({ error: "资产不存在" }, { status: 404 })
  }
  return NextResponse.json(asset)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { name, type, amount } = await request.json()

  try {
    const existingBalances = await prisma.balance.findMany({
      where: { assetId: id },
    })

    if (existingBalances.length === 0) {
      const asset = await prisma.asset.update({
        where: { id },
        data: {
          name,
          type,
          amount: parseFloat(amount) || 0,
        },
        include: { account: true },
      })
      return NextResponse.json(asset)
    } else {
      await prisma.asset.update({
        where: { id },
        data: {
          name,
          type,
        },
      })

      const balance = await prisma.balance.create({
        data: {
          amount: parseFloat(amount) || 0,
          recordedAt: new Date(),
          assetId: id,
        },
      })

      const asset = await prisma.asset.findUnique({
        where: { id },
        include: { account: true },
      })

      return NextResponse.json({ ...asset, newBalance: balance })
    }
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
    await prisma.asset.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 })
  }
}
