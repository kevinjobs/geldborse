// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest'
import { signToken, verifyToken } from './jwt'

beforeEach(() => {
  process.env.JWT_SECRET = 'test-secret-key-that-is-long-enough-for-hs256'
})

describe('signToken', () => {
  it('returns a string token', async () => {
    const token = await signToken('user-123')
    expect(token).toBeDefined()
    expect(typeof token).toBe('string')
    expect(token.length).toBeGreaterThan(0)
  })
})

describe('verifyToken', () => {
  it('returns userId for a valid token', async () => {
    const token = await signToken('user-123')
    const userId = await verifyToken(token)
    expect(userId).toBe('user-123')
  })

  it('returns null for an invalid/malformed token', async () => {
    const result = await verifyToken('this-is-not-a-valid-jwt-token')
    expect(result).toBeNull()
  })

  it('returns null for empty string', async () => {
    const result = await verifyToken('')
    expect(result).toBeNull()
  })
})

describe('sign + verify roundtrip', () => {
  it('works correctly', async () => {
    const token = await signToken('user-456')
    const userId = await verifyToken(token)
    expect(userId).toBe('user-456')
  })
})