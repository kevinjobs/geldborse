import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

vi.mock('@/lib/auth', () => ({
  authenticateRequest: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    asset: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    balance: {
      create: vi.fn(),
    },
    account: {
      findFirst: vi.fn(),
    },
  },
}))

import { authenticateRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GET, POST } from './route'

const mockAuthenticateRequest = authenticateRequest as ReturnType<typeof vi.fn>
const mockPrismaAssetFindMany = prisma.asset.findMany as ReturnType<typeof vi.fn>
const mockPrismaAssetFindUnique = prisma.asset.findUnique as ReturnType<typeof vi.fn>
const mockPrismaAssetCreate = prisma.asset.create as ReturnType<typeof vi.fn>
const mockPrismaBalanceCreate = prisma.balance.create as ReturnType<typeof vi.fn>
const mockPrismaAccountFindFirst = prisma.account.findFirst as ReturnType<typeof vi.fn>

function createRequest(url: string, init?: RequestInit): NextRequest {
  return new Request(url, init) as unknown as NextRequest
}

describe('GET /api/assets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when auth fails', async () => {
    const unauthorized = NextResponse.json({ error: '未授权' }, { status: 401 })
    mockAuthenticateRequest.mockResolvedValue(unauthorized)

    const response = await GET(createRequest('http://localhost/api/assets'))
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('未授权')
    expect(mockPrismaAssetFindMany).not.toHaveBeenCalled()
  })

  it('returns all assets', async () => {
    mockAuthenticateRequest.mockResolvedValue({ userId: 'user-1' })

    const mockAssets = [
      { id: 'asset-1', name: '现金', type: 'DEPOSIT', accountId: 'acct-1', account: { id: 'acct-1' } },
      { id: 'asset-2', name: '基金', type: 'INVESTMENT', accountId: 'acct-1', account: { id: 'acct-1' } },
    ]
    mockPrismaAssetFindMany.mockResolvedValue(mockAssets)

    const response = await GET(createRequest('http://localhost/api/assets'))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockAssets)
    expect(mockPrismaAssetFindMany).toHaveBeenCalledWith({
      where: { account: { userId: 'user-1' } },
      include: { account: true },
      orderBy: { createdAt: 'desc' },
    })
  })

  it('filters assets by accountId', async () => {
    mockAuthenticateRequest.mockResolvedValue({ userId: 'user-1' })
    mockPrismaAccountFindFirst.mockResolvedValue({ id: 'acct-1', userId: 'user-1' })

    const mockAssets = [
      { id: 'asset-1', name: '现金', type: 'DEPOSIT', accountId: 'acct-1' },
    ]
    mockPrismaAssetFindMany.mockResolvedValue(mockAssets)

    const response = await GET(createRequest('http://localhost/api/assets?accountId=acct-1'))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockAssets)
    expect(mockPrismaAccountFindFirst).toHaveBeenCalledWith({
      where: { id: 'acct-1', userId: 'user-1' },
    })
    expect(mockPrismaAssetFindMany).toHaveBeenCalledWith({
      where: { accountId: 'acct-1' },
      orderBy: { createdAt: 'desc' },
    })
  })

  it('returns 400 when accountId does not belong to user', async () => {
    mockAuthenticateRequest.mockResolvedValue({ userId: 'user-1' })
    mockPrismaAccountFindFirst.mockResolvedValue(null)

    const response = await GET(createRequest('http://localhost/api/assets?accountId=acct-1'))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('账户不存在或不属于当前用户')
    expect(mockPrismaAssetFindMany).not.toHaveBeenCalled()
  })
})

describe('POST /api/assets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when auth fails', async () => {
    const unauthorized = NextResponse.json({ error: '未授权' }, { status: 401 })
    mockAuthenticateRequest.mockResolvedValue(unauthorized)

    const response = await POST(
      createRequest('http://localhost/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '现金', accountId: 'acct-1', amount: '100' }),
      }),
    )
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('未授权')
    expect(mockPrismaAssetCreate).not.toHaveBeenCalled()
  })

  it('returns 400 when name is missing', async () => {
    mockAuthenticateRequest.mockResolvedValue({ userId: 'user-1' })

    const response = await POST(
      createRequest('http://localhost/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: 'acct-1' }),
      }),
    )
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('缺少必要字段')
    expect(mockPrismaAccountFindFirst).not.toHaveBeenCalled()
    expect(mockPrismaAssetCreate).not.toHaveBeenCalled()
  })

  it('returns 400 when accountId is missing', async () => {
    mockAuthenticateRequest.mockResolvedValue({ userId: 'user-1' })

    const response = await POST(
      createRequest('http://localhost/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '现金' }),
      }),
    )
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('缺少必要字段')
    expect(mockPrismaAccountFindFirst).not.toHaveBeenCalled()
    expect(mockPrismaAssetCreate).not.toHaveBeenCalled()
  })

  it('returns 400 when accountId does not belong to user', async () => {
    mockAuthenticateRequest.mockResolvedValue({ userId: 'user-1' })
    mockPrismaAccountFindFirst.mockResolvedValue(null)

    const response = await POST(
      createRequest('http://localhost/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '现金', accountId: 'acct-1', amount: '100' }),
      }),
    )
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('账户不存在或不属于当前用户')
    expect(mockPrismaAccountFindFirst).toHaveBeenCalledWith({
      where: { id: 'acct-1', userId: 'user-1' },
    })
    expect(mockPrismaAssetCreate).not.toHaveBeenCalled()
  })

  it('creates asset and initial balance, returns asset with balances', async () => {
    mockAuthenticateRequest.mockResolvedValue({ userId: 'user-1' })
    mockPrismaAccountFindFirst.mockResolvedValue({ id: 'acct-1', userId: 'user-1' })

    const createdAsset = {
      id: 'asset-1',
      name: '现金',
      type: 'DEPOSIT',
      amount: 100,
      accountId: 'acct-1',
      account: { id: 'acct-1' },
    }
    mockPrismaAssetCreate.mockResolvedValue(createdAsset)

    const createdBalance = {
      id: 'bal-1',
      amount: 100,
      recordedAt: new Date(),
      assetId: 'asset-1',
    }
    mockPrismaBalanceCreate.mockResolvedValue(createdBalance)

    const balancesRecordedAt = new Date()
    const assetWithBalances = {
      ...createdAsset,
      balances: [
        { id: 'bal-1', amount: 100, recordedAt: balancesRecordedAt, assetId: 'asset-1' },
      ],
    }
    mockPrismaAssetFindUnique.mockResolvedValue(assetWithBalances)

    // NextResponse.json serializes Dates to strings, so we match the serialized form
    const expectedAsset = {
      ...assetWithBalances,
      balances: assetWithBalances.balances.map(b => ({ ...b, recordedAt: b.recordedAt.toISOString() })),
    }

    const response = await POST(
      createRequest('http://localhost/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '现金', accountId: 'acct-1', amount: '100' }),
      }),
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(expectedAsset)
    expect(mockPrismaAccountFindFirst).toHaveBeenCalledWith({
      where: { id: 'acct-1', userId: 'user-1' },
    })
    expect(mockPrismaAssetCreate).toHaveBeenCalledWith({
      data: {
        name: '现金',
        type: 'DEPOSIT',
        amount: 100,
        accountId: 'acct-1',
      },
      include: { account: true },
    })
    expect(mockPrismaBalanceCreate).toHaveBeenCalledWith({
      data: {
        amount: 100,
        recordedAt: expect.any(Date),
        assetId: 'asset-1',
      },
    })
    expect(mockPrismaAssetFindUnique).toHaveBeenCalledWith({
      where: { id: 'asset-1' },
      include: { account: true, balances: { orderBy: { recordedAt: 'desc' } } },
    })
  })
})