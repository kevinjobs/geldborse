import { NextRequest } from 'next/server'
import { verifyToken } from './jwt'
import { cookies } from 'next/headers'

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