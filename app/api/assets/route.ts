import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const accountId = searchParams.get("accountId")

  if (accountId) {
    const assets = await prisma.asset.findMany({
      where: { accountId },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(assets)
  }

  const assets = await prisma.asset.findMany({
    include: { account: true },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(assets)
}

export async function POST(request: Request) {
  const { name, type, amount, accountId } = await request.json()

  if (!name || !accountId) {
    return NextResponse.json({ error: "缺少必要字段" }, { status: 400 })
  }

  const asset = await prisma.asset.create({
    data: {
      name,
      type: type || "DEPOSIT",
      amount: parseFloat(amount) || 0,
      accountId,
    },
    include: { account: true },
  })
  return NextResponse.json(asset)
}
