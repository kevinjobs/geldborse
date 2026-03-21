import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const assetId = searchParams.get("assetId")
  const accountId = searchParams.get("accountId")

  if (assetId) {
    const balances = await prisma.balance.findMany({
      where: { assetId },
      orderBy: { recordedAt: "desc" },
    })
    return NextResponse.json(balances)
  }

  if (accountId) {
    const balances = await prisma.balance.findMany({
      where: {
        asset: {
          accountId,
        },
      },
      include: { asset: true },
      orderBy: { recordedAt: "desc" },
    })
    return NextResponse.json(balances)
  }

  const balances = await prisma.balance.findMany({
    include: { asset: { include: { account: true } } },
    orderBy: { recordedAt: "desc" },
  })
  return NextResponse.json(balances)
}

export async function POST(request: Request) {
  const { amount, recordedAt, assetId } = await request.json()

  if (!assetId) {
    return NextResponse.json({ error: "缺少资产ID" }, { status: 400 })
  }

  const balance = await prisma.balance.create({
    data: {
      amount: parseFloat(amount),
      recordedAt: new Date(recordedAt),
      assetId,
    },
    include: { asset: true },
  })
  return NextResponse.json(balance)
}
