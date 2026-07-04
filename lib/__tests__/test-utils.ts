/**
 * Shared test utilities for API route tests.
 *
 * Two patterns are available:
 *
 * ## Pattern A: Vitest mocks (clean, preferred)
 * Mock `@/lib/auth` and `@/lib/prisma` per test file.
 * Used by: accounts, records, balances, assets route tests.
 *
 * ```ts
 * import { mockAuthSuccess, mockAuthFailure } from '@/lib/__tests__/test-utils'
 *
 * vi.mock('@/lib/auth', () => ({
 *   authenticateRequest: vi.fn(),
 * }))
 *
 * // then in individual tests:
 * mockAuthSuccess(authenticateRequest) // → { userId: 'user-1', method: 'session', scopes: ['*'] }
 * mockAuthFailure(authenticateRequest) // → NextResponse with 401
 * ```
 *
 * ## Pattern B: Global test-mode setters (legacy)
 * Mutate module-level variables in the route file.
 * Used by: login, register routes.
 *
 * ```ts
 * import { setupTestMode, teardownTestMode } from '@/lib/__tests__/test-utils'
 *
 * // Route file exports setTestMode/setTestUser/etc. that wrap these.
 * ```
 */
import { NextResponse } from 'next/server'

// ── Pattern A helpers ──

export function mockAuthSuccess(
  mockFn: ReturnType<typeof vi.fn>,
  overrides?: Partial<{ userId: string; method: 'session' | 'apikey'; scopes: string[] }>
) {
  mockFn.mockResolvedValue({
    userId: 'test-user-id',
    method: 'session' as const,
    scopes: ['*'],
    ...overrides,
  })
}

export function mockAuthFailure(
  mockFn: ReturnType<typeof vi.fn>,
  status = 401,
  error = '未授权'
) {
  mockFn.mockResolvedValue(
    NextResponse.json({ error }, { status })
  )
}

export function createMockRequest(
  url: string,
  options?: { method?: string; body?: unknown; headers?: Record<string, string> }
): Request {
  return new Request(url, {
    method: options?.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  })
}

// ── Pattern B helpers (for legacy route test-modes) ──

interface TestModeController {
  setMode: (enabled: boolean) => void
  setUser: (user: unknown) => void
  setError: (error: unknown) => void
  reset: () => void
}

/**
 * Creates a controlled test-mode wrapper for a route that exposes
 * `setTestMode`, `setTestUser`, `setTestError`, etc.
 *
 * Usage in the route file:
 * ```ts
 * export const testMode = createTestModeController()
 *
 * // In the route handler:
 * if (testMode.isEnabled) {
 *   if (testMode.error) throw testMode.error
 *   user = testMode.user
 * }
 * ```
 *
 * Usage in tests:
 * ```ts
 * import { testMode, setTestMode, setTestUser, setTestError } from './route'
 * ```
 */
export function createTestModeController<TUser = unknown>() {
  let enabled = false
  let user: TUser | null = null
  let error: Error | null = null

  return {
    get isEnabled() { return enabled },
    get user() { return user },
    get error() { return error },

    setEnabled(e: boolean) { enabled = e },
    setUser(u: TUser | null) { user = u },
    setError(e: Error | null) { error = e },
    reset() { enabled = false; user = null; error = null },
  }
}