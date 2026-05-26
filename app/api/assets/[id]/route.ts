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
  const asset = await prisma.asset.findFirst({
    where: {
      id,
      account: { userId }
    },
    include: { account: true },
  })
  if (!asset) {
    return NextResponse.json({ error: "资产不存在" }, { status: 404 })
  }
  return NextResponse.json(asset)
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
  const { name, type, amount } = await request.json()

  try {
    const existing = await prisma.asset.findFirst({
      where: {
        id,
        account: { userId }
      }
    })

    if (!existing) {
      return NextResponse.json({ error: "资产不存在或无权操作" }, { status: 404 })
    }

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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId(request)
  if (!userId) {
    return NextResponse.json({ error: "未授权" }, { status: 401 })
  }

  const { id } = await params

  try {
    const existing = await prisma.asset.findFirst({
      where: {
        id,
        account: { userId }
      }
    })

    if (!existing) {
      return NextResponse.json({ error: "资产不存在或无权操作" }, { status: 404 })
    }

    await prisma.asset.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 })
  }
}
