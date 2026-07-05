import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

vi.mock('@/lib/auth', () => ({
  authenticateRequest: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    account: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}))

// Import after mocks are set up
const { authenticateRequest } = await import('@/lib/auth')
const { prisma } = await import('@/lib/prisma')
const { GET, POST } = await import('./route')

describe('GET /api/accounts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 when auth fails', async () => {
    authenticateRequest.mockResolvedValue(
      new NextResponse(JSON.stringify({ error: 'unauthorized' }), { status: 401 }),
    )

    const request = new Request('http://localhost/api/accounts')
    const response = await GET(request as any)

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe('unauthorized')
    expect(prisma.account.findMany).not.toHaveBeenCalled()
  })

  it('should return accounts array when auth succeeds', async () => {
    authenticateRequest.mockResolvedValue({
      userId: 'user-1',
      method: 'session',
      scopes: ['*'],
    })

    const mockAccounts = [
      {
        id: 'acc-1',
        name: 'Checking',
        type: 'CASH',
        accountNumber: '1234',
        initialBalance: 0,
        userId: 'user-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        _count: { records: 3, assets: 1 },
        assets: [
          {
            id: 'asset-1',
            name: 'USD',
            accountId: 'acc-1',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
            balances: [
              {
                id: 'bal-1',
                amount: 1000,
                assetId: 'asset-1',
                recordedAt: new Date('2024-06-01'),
                createdAt: new Date('2024-06-01'),
              },
            ],
          },
        ],
        records: [
          {
            id: 'rec-1',
            amount: -50,
            date: new Date('2024-06-15'),
            assetId: 'asset-1',
            accountId: 'acc-1',
            type: 'EXPENSE',
            note: null,
            userId: 'user-1',
            createdAt: new Date('2024-06-15'),
            updatedAt: new Date('2024-06-15'),
          },
        ],
      },
      {
        id: 'acc-2',
        name: 'Savings',
        type: 'CASH',
        accountNumber: null,
        initialBalance: 0,
        userId: 'user-1',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
        _count: { records: 0, assets: 0 },
        assets: [],
        records: [],
      },
    ]

    prisma.account.findMany.mockResolvedValue(mockAccounts)

    const request = new Request('http://localhost/api/accounts')
    const response = await GET(request as any)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveLength(2)
    expect(data[0].id).toBe('acc-1')
    expect(data[0].totalAmount).toBeDefined()
    expect(data[0].recordsAfterBalanceTotal).toBeDefined()
    expect(data[0].latestSnapshotTotal).toBeDefined()
  })

  it('should return empty array when no accounts', async () => {
    authenticateRequest.mockResolvedValue({
      userId: 'user-1',
      method: 'session',
      scopes: ['*'],
    })

    prisma.account.findMany.mockResolvedValue([])

    const request = new Request('http://localhost/api/accounts')
    const response = await GET(request as any)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toEqual([])
  })
})

describe('POST /api/accounts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 when auth fails', async () => {
    authenticateRequest.mockResolvedValue(
      new NextResponse(JSON.stringify({ error: 'unauthorized' }), { status: 401 }),
    )

    const request = new Request('http://localhost/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New Account' }),
    })
    const response = await POST(request as any)

    expect(response.status).toBe(401)
    expect(prisma.account.create).not.toHaveBeenCalled()
  })

  it('should return 400 when name is missing', async () => {
    authenticateRequest.mockResolvedValue({
      userId: 'user-1',
      method: 'session',
      scopes: ['*'],
    })

    const request = new Request('http://localhost/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'CASH' }),
    })
    const response = await POST(request as any)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('账户名称不能为空')
    expect(prisma.account.create).not.toHaveBeenCalled()
  })

  it('should return 400 when name is only whitespace', async () => {
    authenticateRequest.mockResolvedValue({
      userId: 'user-1',
      method: 'session',
      scopes: ['*'],
    })

    const request = new Request('http://localhost/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '   ' }),
    })
    const response = await POST(request as any)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('账户名称不能为空')
  })

  it('should return 201 and create account when valid', async () => {
    authenticateRequest.mockResolvedValue({
      userId: 'user-1',
      method: 'session',
      scopes: ['*'],
    })

    const mockCreatedAccount = {
      id: 'acc-new',
      name: 'New Account',
      type: 'CASH',
      accountNumber: '5678',
      initialBalance: 0,
      userId: 'user-1',
      createdAt: new Date('2024-07-01'),
      updatedAt: new Date('2024-07-01'),
    }

    prisma.account.create.mockResolvedValue(mockCreatedAccount)

    const request = new Request('http://localhost/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '  New Account  ', type: 'CASH', accountNumber: '5678' }),
    })
    const response = await POST(request as any)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.id).toBe('acc-new')
    expect(data.name).toBe('New Account')
    expect(prisma.account.create).toHaveBeenCalledWith({
      data: {
        name: 'New Account',
        type: 'CASH',
        accountNumber: '5678',
        excludeFromTotal: false,
        userId: 'user-1',
      },
    })
  })

  it('should return 200 with defaults when optional fields are omitted', async () => {
    authenticateRequest.mockResolvedValue({
      userId: 'user-1',
      method: 'session',
      scopes: ['*'],
    })

    const mockCreatedAccount = {
      id: 'acc-new',
      name: 'Wallet',
      type: 'CASH',
      accountNumber: null,
      initialBalance: 0,
      userId: 'user-1',
      createdAt: new Date('2024-07-01'),
      updatedAt: new Date('2024-07-01'),
    }

    prisma.account.create.mockResolvedValue(mockCreatedAccount)

    const request = new Request('http://localhost/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Wallet' }),
    })
    const response = await POST(request as any)

    expect(response.status).toBe(200)
    expect(prisma.account.create).toHaveBeenCalledWith({
      data: {
        name: 'Wallet',
        type: 'CASH',
        accountNumber: null,
        excludeFromTotal: false,
        userId: 'user-1',
      },
    })
  })

  it('should return 500 on database error', async () => {
    authenticateRequest.mockResolvedValue({
      userId: 'user-1',
      method: 'session',
      scopes: ['*'],
    })

    prisma.account.create.mockRejectedValue(new Error('DB connection failed'))

    const request = new Request('http://localhost/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Fail Account' }),
    })
    const response = await POST(request as any)

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('创建账户失败')
  })
})