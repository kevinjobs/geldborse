import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const records = await prisma.record.findMany({
    include: { account: true },
    orderBy: { date: "desc" },
  })
  return NextResponse.json(records)
}

export async function POST(request: Request) {
  const { date, accountId, amount, type } = await request.json()
  let finalAmount = parseFloat(amount)
  if (type === "EXPENSE") {
    finalAmount = -Math.abs(finalAmount)
  } else {
    finalAmount = Math.abs(finalAmount)
  }
  const record = await prisma.record.create({
    data: {
      date: new Date(date),
      accountId,
      amount: finalAmount,
      type: type || "EXPENSE",
    },
    include: { account: true },
  })
  return NextResponse.json(record)
}
