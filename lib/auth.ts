import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './jwt'
import { cookies } from 'next/headers'
import { createHash } from 'node:crypto'
import { prisma } from './prisma'
import { hasScope } from './api-key'

const API_KEY_PREFIX = 'gb_'
const lastUsedCache = new Map<string, number>()
const LAST_USED_THROTTLE = 60 * 60 * 1000

export type AuthResult = {
  userId: string
  method: 'session' | 'apikey'
  scopes: string[]
}

export async function getCurrentUserId(request: NextRequest): Promise<string | null> {
  try {
    let token: string | null = null

    const cookieStore = await cookies()
    const authCookie = cookieStore.get('auth_token')
    if (authCookie?.value) {
      token = authCookie.value
    }

    if (!token) {
      const authHeader = request.headers.get('Authorization')
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7)
      }
    }

    if (!token) {
      return null
    }

    return await verifyToken(token)
  } catch (error) {
    console.error('获取用户ID失败:', error)
    return null
  }
}

export async function authenticateRequest(
  request: NextRequest,
  options?: { requiredScope?: string; rejectApiKey?: boolean }
): Promise<AuthResult | NextResponse<{ error: string }>> {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('auth_token')
  if (authCookie?.value) {
    const userId = await verifyToken(authCookie.value)
    if (userId) {
      return { userId, method: 'session', scopes: ['*'] }
    }
  }

  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }
  const token = authHeader.slice(7)

  if (token.startsWith(API_KEY_PREFIX)) {
    if (options?.rejectApiKey) {
      return NextResponse.json({ error: '此操作不支持 API Key 认证' }, { status: 403 })
    }

    const keyHash = createHash('sha256').update(token).digest('hex')
    const apiKey = await prisma.apiKey.findUnique({ where: { keyHash } })

    if (!apiKey || !apiKey.isActive) {
      return NextResponse.json({ error: 'API Key 无效或已停用' }, { status: 401 })
    }
    if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
      return NextResponse.json({ error: 'API Key 已过期' }, { status: 401 })
    }

    let scopes: string[]
    try {
      scopes = JSON.parse(apiKey.scopes)
      if (!Array.isArray(scopes)) throw new Error()
    } catch {
      return NextResponse.json({ error: 'API Key 数据异常' }, { status: 500 })
    }

    if (options?.requiredScope && !hasScope(scopes, options.requiredScope)) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    const now = Date.now()
    if ((lastUsedCache.get(apiKey.id) ?? 0) + LAST_USED_THROTTLE < now) {
      lastUsedCache.set(apiKey.id, now)
      prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } }).catch(() => {})
    }

    return { userId: apiKey.userId, method: 'apikey', scopes }
  }

  const userId = await verifyToken(token)
  if (!userId) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }
  return { userId, method: 'session', scopes: ['*'] }
}