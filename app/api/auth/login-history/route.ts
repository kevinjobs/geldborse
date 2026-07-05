import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'
import { parseUserAgent } from '@/lib/ua-parser'
import { getLocationFromIP } from '@/lib/ip-geo'

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get records from the last 90 days
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    // 惰性清理：删除 90 天前的非当前登录记录
    await prisma.loginHistory.deleteMany({
      where: {
        userId,
        loginAt: { lt: ninetyDaysAgo },
        isCurrent: false
      }
    })

    const records = await prisma.loginHistory.findMany({
      where: {
        userId,
        loginAt: { gte: ninetyDaysAgo }
      },
      orderBy: { loginAt: 'desc' }
    })

    // Group by deviceFingerprint (null fingerprints get their own group)
    const grouped = new Map<string | null, typeof records>()
    for (const record of records) {
      const key = record.deviceFingerprint ?? null
      const group = grouped.get(key)
      if (group) {
        group.push(record)
      } else {
        grouped.set(key, [record])
      }
    }

    const devices = Array.from(grouped.entries()).map(([fingerprint, group]) => {
      const mostRecent = group[0]
      // Parse browser and os from fingerprint string (format: browser-version-os-deviceType)
      const parts = (fingerprint ?? '').split('-')
      const browser = parts[0] || 'unknown'
      const os = parts[2] || 'unknown'

      return {
        fingerprint,
        deviceName: mostRecent.deviceInfo,
        browser,
        os,
        location: mostRecent.location,
        lastLoginAt: mostRecent.loginAt,
        isCurrent: group.some(s => s.isCurrent),
        sessions: group.map(s => ({
          id: s.id,
          ip: s.ip,
          loginAt: s.loginAt,
          isCurrent: s.isCurrent
        }))
      }
    })

    return NextResponse.json({ devices }, { status: 200 })
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

    const { ip, userAgent, deviceInfo, deviceFingerprint, location } = await request.json()

    // Compute fingerprint and location server-side when not provided
    const parsed = deviceFingerprint ? null : parseUserAgent(userAgent || '')
    const computedFingerprint = deviceFingerprint ?? parsed?.fingerprint ?? null
    const computedDeviceInfo = deviceInfo ?? parsed?.deviceName ?? 'Unknown'
    const computedLocation = location ?? (ip ? await getLocationFromIP(ip) : null)

    await prisma.loginHistory.updateMany({
      where: { userId, isCurrent: true },
      data: { isCurrent: false }
    })

    const loginHistory = await prisma.loginHistory.create({
      data: {
        userId,
        ip,
        userAgent,
        deviceInfo: computedDeviceInfo,
        deviceFingerprint: computedFingerprint,
        location: computedLocation,
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

    const body = await request.json()

    // Mode: delete all non-current sessions
    if (body.all === true) {
      const result = await prisma.loginHistory.deleteMany({
        where: { userId, isCurrent: false }
      })
      return NextResponse.json({
        message: '已登出所有其他设备',
        count: result.count
      }, { status: 200 })
    }

    // Mode: delete a single session by id
    const { id } = body
    if (!id) {
      return NextResponse.json({ error: 'Missing id or all flag' }, { status: 400 })
    }

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
