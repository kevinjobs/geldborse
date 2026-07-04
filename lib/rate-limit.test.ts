import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { checkRateLimit, cleanupExpiredRecords } from './rate-limit'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('checkRateLimit', () => {
  it('first call returns true (allows request)', () => {
    expect(checkRateLimit('10.0.0.1')).toBe(true)
  })

  it('allows up to 10 requests from same IP', () => {
    const ip = '10.0.0.2'
    for (let i = 0; i < 10; i++) {
      expect(checkRateLimit(ip)).toBe(true)
    }
  })

  it('blocks 11th request from same IP', () => {
    const ip = '10.0.0.3'
    for (let i = 0; i < 10; i++) {
      checkRateLimit(ip)
    }
    expect(checkRateLimit(ip)).toBe(false)
  })

  it('different IPs have independent counters', () => {
    const ip1 = '10.0.0.4'
    const ip2 = '10.0.0.5'

    // Exhaust ip1's allowance
    for (let i = 0; i < 10; i++) {
      checkRateLimit(ip1)
    }
    expect(checkRateLimit(ip1)).toBe(false)

    // ip2 should still have a fresh counter
    for (let i = 0; i < 10; i++) {
      expect(checkRateLimit(ip2)).toBe(true)
    }
  })

  it('after window expires, counter resets', () => {
    const ip = '10.0.0.6'

    // Exhaust allowance
    for (let i = 0; i < 10; i++) {
      checkRateLimit(ip)
    }
    expect(checkRateLimit(ip)).toBe(false)

    // Advance past the 15-minute window
    vi.advanceTimersByTime(15 * 60 * 1000 + 1)

    // Should be allowed again
    expect(checkRateLimit(ip)).toBe(true)
  })
})

describe('cleanupExpiredRecords', () => {
  it('removes expired entries', () => {
    const ip = '10.0.0.7'
    checkRateLimit(ip)

    // Advance past the window
    vi.advanceTimersByTime(15 * 60 * 1000 + 1)

    cleanupExpiredRecords()

    // After cleanup, a new request should start fresh
    expect(checkRateLimit(ip)).toBe(true)
  })
})