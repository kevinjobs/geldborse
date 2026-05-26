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
    where: { id, userId }
  })

  if (!account) {
    return NextResponse.json({ error: "账户不存在或无权操作" }, { status: 404 })
  }

  const assets = await prisma.asset.findMany({
    where: { accountId: id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(assets)
}
