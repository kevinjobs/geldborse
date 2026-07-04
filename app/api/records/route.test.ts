import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

vi.mock('@/lib/auth', () => ({
  authenticateRequest: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    account: {
      findFirst: vi.fn(),
    },
    asset: {
      findFirst: vi.fn(),
    },
    record: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}))

// Import after mocks are set up
const { authenticateRequest } = await import('@/lib/auth')
const { prisma } = await import('@/lib/prisma')
const { GET, POST } = await import('./route')

describe('GET /api/records', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 when auth fails', async () => {
    authenticateRequest.mockResolvedValue(
      new NextResponse(JSON.stringify({ error: 'unauthorized' }), { status: 401 }),
    )

    const request = new Request('http://localhost/api/records')
    const response = await GET(request as any)

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe('unauthorized')
    expect(prisma.record.findMany).not.toHaveBeenCalled()
  })

  it('should return records array when auth succeeds', async () => {
    authenticateRequest.mockResolvedValue({
      userId: 'user-1',
      method: 'session',
      scopes: ['*'],
    })

    const mockRecords = [
      {
        id: 'rec-1',
        date: new Date('2024-06-15'),
        accountId: 'acc-1',
        assetId: 'asset-1',
        amount: -50,
        type: 'EXPENSE',
        note: 'Groceries',
        userId: 'user-1',
        createdAt: new Date('2024-06-15'),
        updatedAt: new Date('2024-06-15'),
        account: { id: 'acc-1', name: 'Checking' },
        asset: { id: 'asset-1', name: 'USD' },
      },
      {
        id: 'rec-2',
        date: new Date('2024-06-14'),
        accountId: 'acc-1',
        assetId: null,
        amount: 2000,
        type: 'INCOME',
        note: 'Salary',
        userId: 'user-1',
        createdAt: new Date('2024-06-14'),
        updatedAt: new Date('2024-06-14'),
        account: { id: 'acc-1', name: 'Checking' },
        asset: null,
      },
    ]

    prisma.record.findMany.mockResolvedValue(mockRecords)

    const request = new Request('http://localhost/api/records')
    const response = await GET(request as any)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveLength(2)
    expect(data[0].id).toBe('rec-1')
    expect(data[0].account).toBeDefined()
    expect(data[0].asset).toBeDefined()
  })

  it('should return empty array when no records', async () => {
    authenticateRequest.mockResolvedValue({
      userId: 'user-1',
      method: 'session',
      scopes: ['*'],
    })

    prisma.record.findMany.mockResolvedValue([])

    const request = new Request('http://localhost/api/records')
    const response = await GET(request as any)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toEqual([])
  })

  it('should return 500 on database error during GET', async () => {
    authenticateRequest.mockResolvedValue({
      userId: 'user-1',
      method: 'session',
      scopes: ['*'],
    })

    prisma.record.findMany.mockRejectedValue(new Error('DB error'))

    const request = new Request('http://localhost/api/records')
    const response = await GET(request as any)

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('获取记录失败')
  })
})

describe('POST /api/records', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 when auth fails', async () => {
    authenticateRequest.mockResolvedValue(
      new NextResponse(JSON.stringify({ error: 'unauthorized' }), { status: 401 }),
    )

    const request = new Request('http://localhost/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId: 'acc-1', amount: 100, date: '2024-07-01' }),
    })
    const response = await POST(request as any)

    expect(response.status).toBe(401)
    expect(prisma.account.findFirst).not.toHaveBeenCalled()
    expect(prisma.record.create).not.toHaveBeenCalled()
  })

  it('should return 400 when accountId is missing', async () => {
    authenticateRequest.mockResolvedValue({
      userId: 'user-1',
      method: 'session',
      scopes: ['*'],
    })

    const request = new Request('http://localhost/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 100, date: '2024-07-01' }),
    })
    const response = await POST(request as any)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('账户不存在或不属于当前用户')
    expect(prisma.record.create).not.toHaveBeenCalled()
  })

  it('should return 400 when account does not belong to user', async () => {
    authenticateRequest.mockResolvedValue({
      userId: 'user-1',
      method: 'session',
      scopes: ['*'],
    })

    prisma.account.findFirst.mockResolvedValue(null)

    const request = new Request('http://localhost/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId: 'acc-999', amount: 100, date: '2024-07-01' }),
    })
    const response = await POST(request as any)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('账户不存在或不属于当前用户')
    expect(prisma.record.create).not.toHaveBeenCalled()
  })

  it('should return 400 when asset does not belong to the account', async () => {
    authenticateRequest.mockResolvedValue({
      userId: 'user-1',
      method: 'session',
      scopes: ['*'],
    })

    prisma.account.findFirst.mockResolvedValue({
      id: 'acc-1',
      name: 'Checking',
      userId: 'user-1',
    } as any)

    prisma.asset.findFirst.mockResolvedValue(null)

    const request = new Request('http://localhost/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId: 'acc-1', assetId: 'asset-999', amount: 100, date: '2024-07-01' }),
    })
    const response = await POST(request as any)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('资产不存在或不属于该账户')
    expect(prisma.record.create).not.toHaveBeenCalled()
  })

  it('should create EXPENSE record with negative amount', async () => {
    authenticateRequest.mockResolvedValue({
      userId: 'user-1',
      method: 'session',
      scopes: ['*'],
    })

    prisma.account.findFirst.mockResolvedValue({
      id: 'acc-1',
      name: 'Checking',
      userId: 'user-1',
    } as any)

    const mockRecord = {
      id: 'rec-new',
      date: new Date('2024-07-01'),
      accountId: 'acc-1',
      assetId: null,
      amount: -75,
      type: 'EXPENSE',
      note: 'Coffee',
      userId: 'user-1',
      createdAt: new Date('2024-07-01'),
      updatedAt: new Date('2024-07-01'),
      account: { id: 'acc-1', name: 'Checking' },
    }

    prisma.record.create.mockResolvedValue(mockRecord)

    const request = new Request('http://localhost/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: '2024-07-01', accountId: 'acc-1', amount: 75, type: 'EXPENSE', note: 'Coffee' }),
    })
    const response = await POST(request as any)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.amount).toBe(-75)
    expect(data.type).toBe('EXPENSE')
    expect(prisma.record.create).toHaveBeenCalledWith({
      data: {
        date: expect.any(Date),
        accountId: 'acc-1',
        assetId: null,
        amount: -75,
        type: 'EXPENSE',
        note: 'Coffee',
      },
      include: { account: true },
    })
  })

  it('should create INCOME record with positive amount', async () => {
    authenticateRequest.mockResolvedValue({
      userId: 'user-1',
      method: 'session',
      scopes: ['*'],
    })

    prisma.account.findFirst.mockResolvedValue({
      id: 'acc-1',
      name: 'Checking',
      userId: 'user-1',
    } as any)

    prisma.asset.findFirst.mockResolvedValue({
      id: 'asset-1',
      name: 'Freelance Income',
      accountId: 'acc-1',
    } as any)

    const mockRecord = {
      id: 'rec-new',
      date: new Date('2024-07-01'),
      accountId: 'acc-1',
      assetId: 'asset-1',
      amount: 5000,
      type: 'INCOME',
      note: 'Freelance',
      userId: 'user-1',
      createdAt: new Date('2024-07-01'),
      updatedAt: new Date('2024-07-01'),
      account: { id: 'acc-1', name: 'Checking' },
    }

    prisma.record.create.mockResolvedValue(mockRecord)

    const request = new Request('http://localhost/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: '2024-07-01', accountId: 'acc-1', assetId: 'asset-1', amount: 5000, type: 'INCOME', note: 'Freelance' }),
    })
    const response = await POST(request as any)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.amount).toBe(5000)
    expect(data.type).toBe('INCOME')
    expect(prisma.record.create).toHaveBeenCalledWith({
      data: {
        date: expect.any(Date),
        accountId: 'acc-1',
        assetId: 'asset-1',
        amount: 5000,
        type: 'INCOME',
        note: 'Freelance',
      },
      include: { account: true },
    })
  })

  it('should default to EXPENSE when type is not provided', async () => {
    authenticateRequest.mockResolvedValue({
      userId: 'user-1',
      method: 'session',
      scopes: ['*'],
    })

    prisma.account.findFirst.mockResolvedValue({
      id: 'acc-1',
      name: 'Checking',
      userId: 'user-1',
    } as any)

    const mockRecord = {
      id: 'rec-new',
      date: new Date('2024-07-01'),
      accountId: 'acc-1',
      assetId: null,
      amount: -30,
      type: 'EXPENSE',
      note: null,
      userId: 'user-1',
      createdAt: new Date('2024-07-01'),
      updatedAt: new Date('2024-07-01'),
      account: { id: 'acc-1', name: 'Checking' },
    }

    prisma.record.create.mockResolvedValue(mockRecord)

    const request = new Request('http://localhost/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: '2024-07-01', accountId: 'acc-1', amount: 30 }),
    })
    const response = await POST(request as any)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.amount).toBe(-30)
    expect(data.type).toBe('EXPENSE')
  })

  it('should return 500 on database error during POST', async () => {
    authenticateRequest.mockResolvedValue({
      userId: 'user-1',
      method: 'session',
      scopes: ['*'],
    })

    prisma.account.findFirst.mockResolvedValue({
      id: 'acc-1',
      name: 'Checking',
      userId: 'user-1',
    } as any)

    prisma.record.create.mockRejectedValue(new Error('DB error'))

    const request = new Request('http://localhost/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: '2024-07-01', accountId: 'acc-1', amount: 100, type: 'EXPENSE' }),
    })
    const response = await POST(request as any)

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('DB error')
  })
})