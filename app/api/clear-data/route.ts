import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'
import bcrypt from 'bcrypt'

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request)
    if (!userId) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const { password } = await request.json()
    if (!password) {
      return NextResponse.json({ error: "请输入密码" }, { status: 400 })
    }

    // 验证用户密码
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return NextResponse.json({ error: "密码错误" }, { status: 401 })
    }

    // 使用事务清空数据
    await prisma.$transaction(async (tx) => {
      // 清空收支记录
      await tx.record.deleteMany({
        where: {
          account: {
            userId
          }
        }
      })

      // 清空资产快照
      await tx.dailySnapshot.deleteMany({
        where: {
          account: {
            userId
          }
        }
      })

      // 清空Balance记录（先于资产删除）
      await tx.balance.deleteMany({
        where: {
          asset: {
            account: {
              userId
            }
          }
        }
      })

      // 清空资产
      await tx.asset.deleteMany({
        where: {
          account: {
            userId
          }
        }
      })

      // 清空账户
      await tx.account.deleteMany({
        where: {
          userId
        }
      })
    })

    return NextResponse.json({ message: "数据已清空" })
  } catch (error) {
    console.error('清空数据失败:', error)
    return NextResponse.json({ error: "清空数据失败" }, { status: 500 })
  }
}
