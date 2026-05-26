type RateLimitStore = Map<string, { count: number; resetAt: number }>

const store: RateLimitStore = new Map()
const WINDOW_MS = 15 * 60 * 1000
const MAX_REQUESTS = 10

export function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = store.get(ip)

  if (!record || now > record.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }

  if (record.count >= MAX_REQUESTS) {
    return false
  }

  record.count++
  return true
}

export function cleanupExpiredRecords(): void {
  const now = Date.now()
  for (const [key, record] of store.entries()) {
    if (now > record.resetAt) {
      store.delete(key)
    }
  }
}