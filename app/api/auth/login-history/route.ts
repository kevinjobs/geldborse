import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // 从请求头获取认证信息
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: '未提供认证信息' }, { status: 401 })
    }

    // 验证用户身份
    const user = await prisma.user.findUnique({
      where: { id: token }
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 401 })
    }

    // 获取用户的登录历史
    const loginHistories = await prisma.loginHistory.findMany({
      where: { userId: user.id },
      orderBy: { loginAt: 'desc' },
      take: 20 // 只获取最近20条记录
    })

    console.log('登录历史查询结果:', loginHistories)
    console.log('登录历史类型:', Array.isArray(loginHistories))

    return NextResponse.json(loginHistories, { status: 200 })
  } catch (error) {
    console.error('获取登录历史失败:', error)
    return NextResponse.json({ error: '获取登录历史失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // 从请求头获取认证信息
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: '未提供认证信息' }, { status: 401 })
    }

    // 验证用户身份
    const user = await prisma.user.findUnique({
      where: { id: token }
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 401 })
    }

    // 解析请求体
    const { ip, userAgent, deviceInfo } = await request.json()

    // 首先将所有登录历史标记为非当前
    await prisma.loginHistory.updateMany({
      where: { userId: user.id, isCurrent: true },
      data: { isCurrent: false }
    })

    // 创建新的登录历史记录
    const loginHistory = await prisma.loginHistory.create({
      data: {
        userId: user.id,
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
    // 从请求头获取认证信息
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: '未提供认证信息' }, { status: 401 })
    }

    // 验证用户身份
    const user = await prisma.user.findUnique({
      where: { id: token }
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 401 })
    }

    // 解析请求体
    const { id } = await request.json()

    // 检查登录历史是否属于当前用户
    const loginHistory = await prisma.loginHistory.findUnique({
      where: { id }
    })

    if (!loginHistory || loginHistory.userId !== user.id) {
      return NextResponse.json({ error: '登录历史不存在' }, { status: 404 })
    }

    // 删除登录历史
    await prisma.loginHistory.delete({
      where: { id }
    })

    return NextResponse.json({ message: '登出成功' }, { status: 200 })
  } catch (error) {
    console.error('登出失败:', error)
    return NextResponse.json({ error: '登出失败' }, { status: 500 })
  }
}