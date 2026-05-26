import { prisma } from './prisma'
import { Role } from '@prisma/client'

export async function checkAccountAccess(
  userId: string,
  accountId: string,
  requiredRoles?: Role[]
): Promise<boolean> {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: { userId: true }
  })

  if (account?.userId === userId) {
    return true
  }

  if (requiredRoles) {
    const membership = await prisma.accountMember.findFirst({
      where: { accountId, userId, role: { in: requiredRoles } }
    })
    return !!membership
  }

  const anyMembership = await prisma.accountMember.findFirst({
    where: { accountId, userId }
  })
  return !!anyMembership
}

export async function getAccountRole(userId: string, accountId: string): Promise<Role | null> {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: { userId: true }
  })

  if (account?.userId === userId) {
    return 'OWNER'
  }

  const membership = await prisma.accountMember.findUnique({
    where: { accountId_userId: { accountId, userId } }
  })

  return membership?.role || null
}

export async function canEditAccount(userId: string, accountId: string): Promise<boolean> {
  return checkAccountAccess(userId, accountId, ['OWNER', 'EDITOR'])
}

export async function canDeleteAccount(userId: string, accountId: string): Promise<boolean> {
  return checkAccountAccess(userId, accountId, ['OWNER'])
}

export async function canViewAccount(userId: string, accountId: string): Promise<boolean> {
  return checkAccountAccess(userId, accountId)
}