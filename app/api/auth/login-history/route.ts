import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const loginHistories = await prisma.loginHistory.findMany({
      where: { userId },
      orderBy: { loginAt: 'desc' },
      take: 20
    })

    return NextResponse.json(loginHistories, { status: 200 })
  } catch (error) {
    console.error('获取登录历史失败:', error)
    return NextResponse.json({ error: '获取登录历史失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { ip, userAgent, deviceInfo } = await request.json()

    await prisma.loginHistory.updateMany({
      where: { userId, isCurrent: true },
      data: { isCurrent: false }
    })

    const loginHistory = await prisma.loginHistory.create({
      data: {
        userId,
        ip,
        userAgent,
        deviceInfo,
        isCurrent: true
      }
    })

    return NextResponse.json(loginHistory, { status: 201 })
  } catch (error) {
    console.error('创建登录历史失败:', error)
    return NextResponse.json({ error: '创建登录历史失败' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await request.json()

    const loginHistory = await prisma.loginHistory.findUnique({
      where: { id }
    })

    if (!loginHistory || loginHistory.userId !== userId) {
      return NextResponse.json({ error: '登录历史不存在' }, { status: 404 })
    }

    await prisma.loginHistory.delete({
      where: { id }
    })

    return NextResponse.json({ message: '登出成功' }, { status: 200 })
  } catch (error) {
    console.error('登出失败:', error)
    return NextResponse.json({ error: '登出失败' }, { status: 500 })
  }
}