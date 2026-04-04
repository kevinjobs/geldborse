import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const assets = await prisma.asset.findMany({
    where: { accountId: id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(assets)
}
