import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock next/headers so we can control cookies() return value.
// This is safe: next/headers is only used by lib/auth.ts and lib/jwt.ts,
// and route tests mock @/lib/auth so they never call the real cookies().
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

// Mock project-specific modules that getCurrentUserId depends on.
vi.mock('@/lib/jwt', () => ({
  signToken: vi.fn(),
  verifyToken: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    apiKey: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

// Note: next/server is NOT mocked here. The real NextResponse class is needed
// by route tests that use `auth instanceof NextResponse`. The auth test only
// needs NextRequest, which works fine as the real class.

import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'
import { getCurrentUserId } from './auth'

function createMockCookieStore(entries: Record<string, string>) {
  return {
    get: vi.fn((name: string) => {
      const value = entries[name]
      return value !== undefined ? { name, value } : undefined
    }),
  }
}

describe('getCurrentUserId', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns userId from cookie when auth_token cookie exists and is valid', async () => {
    const cookieStore = createMockCookieStore({ auth_token: 'valid-token' })
    ;(cookies as any).mockResolvedValue(cookieStore)
    ;(verifyToken as any).mockResolvedValue('user-123')

    const request = new NextRequest('http://localhost')
    const result = await getCurrentUserId(request)

    expect(result).toBe('user-123')
    expect(cookies).toHaveBeenCalled()
    expect(cookieStore.get).toHaveBeenCalledWith('auth_token')
    expect(verifyToken).toHaveBeenCalledWith('valid-token')
  })

  it('returns userId from Bearer header when no cookie', async () => {
    const cookieStore = createMockCookieStore({})
    ;(cookies as any).mockResolvedValue(cookieStore)
    ;(verifyToken as any).mockResolvedValue('user-456')

    const request = new NextRequest('http://localhost', {
      headers: { Authorization: 'Bearer header-token' },
    })
    const result = await getCurrentUserId(request)

    expect(result).toBe('user-456')
    expect(cookieStore.get).toHaveBeenCalledWith('auth_token')
    expect(verifyToken).toHaveBeenCalledWith('header-token')
  })

  it('returns null when no auth token exists', async () => {
    const cookieStore = createMockCookieStore({})
    ;(cookies as any).mockResolvedValue(cookieStore)

    const request = new NextRequest('http://localhost')
    const result = await getCurrentUserId(request)

    expect(result).toBeNull()
    expect(verifyToken).not.toHaveBeenCalled()
  })

  it('returns null when token is invalid', async () => {
    const cookieStore = createMockCookieStore({ auth_token: 'invalid-token' })
    ;(cookies as any).mockResolvedValue(cookieStore)
    ;(verifyToken as any).mockResolvedValue(null)

    const request = new NextRequest('http://localhost')
    const result = await getCurrentUserId(request)

    expect(result).toBeNull()
    expect(verifyToken).toHaveBeenCalledWith('invalid-token')
  })
})