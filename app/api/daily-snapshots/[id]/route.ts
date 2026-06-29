import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateRequest } from "@/lib/auth"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(request, { requiredScope: 'snapshots:write' })
    if (auth instanceof NextResponse) return auth
    const { userId } = auth

    const { id } = await params

    const snapshot = await prisma.dailySnapshot.findUnique({
      where: { id },
      include: { account: true }
    })

    if (!snapshot || snapshot.account.userId !== userId) {
      return NextResponse.json({ error: "快照不存在或无权操作" }, { status: 404 })
    }

    await prisma.dailySnapshot.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("删除快照失败:", error)
    return NextResponse.json({ error: "删除快照失败" }, { status: 500 })
  }
}
