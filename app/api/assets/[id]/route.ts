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
  const auth = await authenticateRequest(request, { requiredScope: 'assets:write' })
  if (auth instanceof NextResponse) return auth
  const { userId } = auth

  const { id } = await params
  const { name, type } = await request.json()

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

    const asset = await prisma.asset.update({
      where: { id },
      data: {
        name,
        type,
      },
      include: { account: true },
    })
    return NextResponse.json(asset)
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
  } catch (error) {
    console.error("删除失败:", error)
    return NextResponse.json({ error: "删除失败" }, { status: 500 })
  }
}
