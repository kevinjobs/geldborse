import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Mock auth and prisma before importing the route
vi.mock('@/lib/auth', () => ({
  authenticateRequest: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    balance: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    asset: {
      findFirst: vi.fn(),
    },
    account: {
      findFirst: vi.fn(),
    },
  },
}))

// Import mocks and route after mocking
import { authenticateRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GET, POST } from './route'

const mockAuthenticateRequest = authenticateRequest as ReturnType<typeof vi.fn>
const mockPrismaBalanceFindMany = prisma.balance.findMany as ReturnType<typeof vi.fn>
const mockPrismaBalanceCreate = prisma.balance.create as ReturnType<typeof vi.fn>
const mockPrismaAssetFindFirst = prisma.asset.findFirst as ReturnType<typeof vi.fn>
const mockPrismaAccountFindFirst = prisma.account.findFirst as ReturnType<typeof vi.fn>

function createRequest(url: string, init?: RequestInit): NextRequest {
  return new Request(url, init) as unknown as NextRequest
}

describe('GET /api/balances', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when auth fails', async () => {
    const unauthorized = NextResponse.json({ error: '未授权' }, { status: 401 })
    mockAuthenticateRequest.mockResolvedValue(unauthorized)

    const response = await GET(createRequest('http://localhost/api/balances'))
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('未授权')
    expect(mockPrismaBalanceFindMany).not.toHaveBeenCalled()
  })

  it('returns balances filtered by assetId', async () => {
    mockAuthenticateRequest.mockResolvedValue({ userId: 'user-1' })
    mockPrismaAssetFindFirst.mockResolvedValue({ id: 'asset-1', name: '现金' })

    const mockBalances = [
      { id: 'bal-1', amount: 100, assetId: 'asset-1', recordedAt: '2024-01-02T00:00:00.000Z' },
      { id: 'bal-2', amount: 50, assetId: 'asset-1', recordedAt: '2024-01-01T00:00:00.000Z' },
    ]
    mockPrismaBalanceFindMany.mockResolvedValue(mockBalances)

    const response = await GET(createRequest('http://localhost/api/balances?assetId=asset-1'))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockBalances)
    expect(mockPrismaAssetFindFirst).toHaveBeenCalledWith({
      where: { id: 'asset-1', account: { userId: 'user-1' } },
    })
    expect(mockPrismaBalanceFindMany).toHaveBeenCalledWith({
      where: { assetId: 'asset-1' },
      orderBy: { recordedAt: 'desc' },
    })
  })

  it('returns 400 when assetId does not belong to user', async () => {
    mockAuthenticateRequest.mockResolvedValue({ userId: 'user-1' })
    mockPrismaAssetFindFirst.mockResolvedValue(null)

    const response = await GET(createRequest('http://localhost/api/balances?assetId=asset-1'))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('资产不存在或不属于当前用户')
    expect(mockPrismaBalanceFindMany).not.toHaveBeenCalled()
  })

  it('returns balances filtered by accountId', async () => {
    mockAuthenticateRequest.mockResolvedValue({ userId: 'user-1' })
    mockPrismaAccountFindFirst.mockResolvedValue({ id: 'acct-1', name: '钱包' })

    const mockBalances = [
      { id: 'bal-1', amount: 100, asset: { id: 'asset-1', accountId: 'acct-1' } },
    ]
    mockPrismaBalanceFindMany.mockResolvedValue(mockBalances)

    const response = await GET(createRequest('http://localhost/api/balances?accountId=acct-1'))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockBalances)
    expect(mockPrismaAccountFindFirst).toHaveBeenCalledWith({
      where: { id: 'acct-1', userId: 'user-1' },
    })
    expect(mockPrismaBalanceFindMany).toHaveBeenCalledWith({
      where: { asset: { accountId: 'acct-1' } },
      include: { asset: true },
      orderBy: { recordedAt: 'desc' },
    })
  })

  it('returns 400 when accountId does not belong to user', async () => {
    mockAuthenticateRequest.mockResolvedValue({ userId: 'user-1' })
    mockPrismaAccountFindFirst.mockResolvedValue(null)

    const response = await GET(createRequest('http://localhost/api/balances?accountId=acct-1'))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('账户不存在或不属于当前用户')
    expect(mockPrismaBalanceFindMany).not.toHaveBeenCalled()
  })

  it('returns all balances when no filters', async () => {
    mockAuthenticateRequest.mockResolvedValue({ userId: 'user-1' })

    const mockBalances = [
      { id: 'bal-1', amount: 100, asset: { id: 'asset-1', account: { id: 'acct-1' } } },
      { id: 'bal-2', amount: 200, asset: { id: 'asset-2', account: { id: 'acct-1' } } },
    ]
    mockPrismaBalanceFindMany.mockResolvedValue(mockBalances)

    const response = await GET(createRequest('http://localhost/api/balances'))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockBalances)
    expect(mockPrismaBalanceFindMany).toHaveBeenCalledWith({
      where: { asset: { account: { userId: 'user-1' } } },
      include: { asset: { include: { account: true } } },
      orderBy: { recordedAt: 'desc' },
    })
  })
})

describe('POST /api/balances', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when auth fails', async () => {
    const unauthorized = NextResponse.json({ error: '未授权' }, { status: 401 })
    mockAuthenticateRequest.mockResolvedValue(unauthorized)

    const response = await POST(
      createRequest('http://localhost/api/balances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: 'asset-1', amount: '100', recordedAt: '2024-01-01' }),
      }),
    )
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('未授权')
    expect(mockPrismaBalanceCreate).not.toHaveBeenCalled()
  })

  it('returns 400 when assetId is missing', async () => {
    mockAuthenticateRequest.mockResolvedValue({ userId: 'user-1' })

    const response = await POST(
      createRequest('http://localhost/api/balances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: '100', recordedAt: '2024-01-01' }),
      }),
    )
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('缺少资产ID')
    expect(mockPrismaAssetFindFirst).not.toHaveBeenCalled()
    expect(mockPrismaBalanceCreate).not.toHaveBeenCalled()
  })

  it('returns 400 when asset does not belong to user', async () => {
    mockAuthenticateRequest.mockResolvedValue({ userId: 'user-1' })
    mockPrismaAssetFindFirst.mockResolvedValue(null)

    const response = await POST(
      createRequest('http://localhost/api/balances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: 'asset-1', amount: '100', recordedAt: '2024-01-01' }),
      }),
    )
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('资产不存在或不属于当前用户')
    expect(mockPrismaAssetFindFirst).toHaveBeenCalledWith({
      where: { id: 'asset-1', account: { userId: 'user-1' } },
    })
    expect(mockPrismaBalanceCreate).not.toHaveBeenCalled()
  })

  it('creates balance and returns it', async () => {
    mockAuthenticateRequest.mockResolvedValue({ userId: 'user-1' })
    mockPrismaAssetFindFirst.mockResolvedValue({ id: 'asset-1', name: '现金' })

    const createdBalance = {
      id: 'bal-1',
      amount: 100,
      recordedAt: new Date('2024-01-01'),
      assetId: 'asset-1',
      asset: { id: 'asset-1', name: '现金' },
    }
    mockPrismaBalanceCreate.mockResolvedValue(createdBalance)

    // NextResponse.json serializes Dates to strings, so we match the serialized form
    const expectedBalance = {
      ...createdBalance,
      recordedAt: createdBalance.recordedAt.toISOString(),
    }

    const response = await POST(
      createRequest('http://localhost/api/balances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: 'asset-1', amount: '100', recordedAt: '2024-01-01' }),
      }),
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(expectedBalance)
    expect(mockPrismaAssetFindFirst).toHaveBeenCalledWith({
      where: { id: 'asset-1', account: { userId: 'user-1' } },
    })
    expect(mockPrismaBalanceCreate).toHaveBeenCalledWith({
      data: {
        amount: 100,
        recordedAt: new Date('2024-01-01'),
        assetId: 'asset-1',
      },
      include: { asset: true },
    })
  })
})