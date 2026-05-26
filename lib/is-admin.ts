import { NextRequest } from 'next/server'
import { getCurrentUserId } from './auth'
import { prisma } from './prisma'

export async function isAdminUser(request: NextRequest): Promise<boolean> {
  const userId = await getCurrentUserId(request)
  if (!userId) return false

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true }
  })

  return user?.isAdmin ?? false
}

export async function requireAdmin(request: NextRequest): Promise<{ authorized: boolean; userId: string | null; error?: string }> {
  const userId = await getCurrentUserId(request)
  if (!userId) {
    return { authorized: false, userId: null, error: 'Unauthorized' }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true }
  })

  if (!user?.isAdmin) {
    return { authorized: false, userId, error: 'Forbidden' }
  }

  return { authorized: true, userId }
}