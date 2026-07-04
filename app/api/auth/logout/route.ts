import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Best-effort: clear isCurrent flag for this user's sessions
    const userId = await getCurrentUserId(request)
    if (userId) {
      prisma.loginHistory.updateMany({
        where: { userId, isCurrent: true },
        data: { isCurrent: false }
      }).catch(() => {})
    }

    const response = NextResponse.json({ message: 'Logout successful' }, { status: 200 })
    response.cookies.set('auth_token', '', {
      maxAge: 0,
      path: '/'
    })
    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
