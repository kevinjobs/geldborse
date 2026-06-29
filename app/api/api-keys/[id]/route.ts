import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateRequest } from "@/lib/auth"
import { validateScopes } from "@/lib/api-key"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request, { rejectApiKey: true })
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const existing = await prisma.apiKey.findFirst({ where: { id, userId: auth.userId } })
  if (!existing) {
    return NextResponse.json({ error: "API Key 不存在" }, { status: 404 })
  }

  const { name, scopes: rawScopes, isActive } = await request.json()
  const data: Record<string, unknown> = {}

  if (name !== undefined) {
    if (!name.trim()) return NextResponse.json({ error: "名称不能为空" }, { status: 400 })
    data.name = name.trim()
  }
  if (rawScopes !== undefined) {
    const err = validateScopes(rawScopes)
    if (err) return NextResponse.json({ error: err }, { status: 400 })
    data.scopes = JSON.stringify([...new Set(rawScopes)])
  }
  if (isActive !== undefined) data.isActive = isActive

  const updated = await prisma.apiKey.update({ where: { id }, data })
  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    prefix: updated.prefix,
    scopes: JSON.parse(updated.scopes),
    isActive: updated.isActive,
    expiresAt: updated.expiresAt,
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request, { rejectApiKey: true })
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const existing = await prisma.apiKey.findFirst({ where: { id, userId: auth.userId } })
  if (!existing) {
    return NextResponse.json({ error: "API Key 不存在" }, { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const permanent = searchParams.get("permanent") === "true"

  if (permanent) {
    await prisma.apiKey.delete({ where: { id } })
    return NextResponse.json({ success: true, message: "已永久删除" })
  }

  await prisma.apiKey.update({ where: { id }, data: { isActive: false } })
  return NextResponse.json({ success: true, message: "已撤销" })
}