import { describe, it, expect } from 'vitest'
import { testGetAccountTotal } from './account-total'

const mockAssets = [
  {
    id: '1', accountId: '1', name: '测试资产', amount: 1000, type: 'cash',
    balances: [{ id: '1', assetId: '1', amount: 1500, recordedAt: '2026-04-09T10:00:00Z' }],
  },
]

const mockRecords = [
  { id: '1', accountId: '1', amount: 500, date: '2026-04-09T11:00:00Z', category: 'income', type: 'income' },
  { id: '2', accountId: '1', amount: -200, date: '2026-04-09T12:00:00Z', category: 'expense', type: 'expense' },
]

describe('testGetAccountTotal', () => {
  it('正常计算资产+收支', () => {
    const result = testGetAccountTotal(mockAssets, mockRecords)
    expect(result.total).toBe(1800)
    expect(result.baseAmount).toBe(1500)
    expect(result.recordsTotal).toBe(300)
    expect(result.hasBalance).toBe(true)
  })

  it('没有资产时只计算收支', () => {
    const result = testGetAccountTotal([], mockRecords)
    expect(result.total).toBe(300)
    expect(result.baseAmount).toBe(0)
    expect(result.recordsTotal).toBe(300)
    expect(result.hasBalance).toBe(false)
  })

  it('没有收支记录时只取资产快照', () => {
    const result = testGetAccountTotal(mockAssets, [])
    expect(result.total).toBe(1500)
    expect(result.baseAmount).toBe(1500)
    expect(result.recordsTotal).toBe(0)
  })

  it('资产没有快照时使用初始金额', () => {
    const assets = [{ id: '1', accountId: '1', name: '测试资产', amount: 1000, type: 'cash', balances: [] }]
    const result = testGetAccountTotal(assets, mockRecords)
    expect(result.total).toBe(1300)
    expect(result.baseAmount).toBe(1000)
    expect(result.recordsTotal).toBe(300)
  })

  it('收支与快照同时发布不重复计算', () => {
    const records = [{ id: '1', accountId: '1', amount: 500, date: '2026-04-09T10:00:00Z', category: 'income', type: 'income' }]
    const result = testGetAccountTotal(mockAssets, records)
    expect(result.total).toBe(1500)
    expect(result.recordsTotal).toBe(0)
  })

  it('资产有初始金额但无快照，hasBalance 为 false', () => {
    const assets = [{ id: '1', accountId: '1', name: '测试资产', amount: 500, type: 'cash', balances: [] }]
    const result = testGetAccountTotal(assets, [])
    expect(result.hasBalance).toBe(false)
    expect(result.total).toBe(500)
  })

  it('多个资产混合快照和无快照', () => {
    const assets = [
      { id: '1', accountId: '1', name: 'A', amount: 200, type: 'cash', balances: [{ id: 'b1', assetId: '1', amount: 300, recordedAt: '2026-04-09T10:00:00Z' }] },
      { id: '2', accountId: '1', name: 'B', amount: 500, type: 'cash', balances: [] },
    ]
    const records = [{ id: '1', accountId: '1', amount: 100, date: '2026-04-10T10:00:00Z', category: 'income', type: 'income' }]
    const result = testGetAccountTotal(assets, records)
    expect(result.total).toBe(900)
    expect(result.baseAmount).toBe(800)
    expect(result.recordsTotal).toBe(100)
  })

  it('空资产和空收支', () => {
    const result = testGetAccountTotal([], [])
    expect(result.total).toBe(0)
    expect(result.baseAmount).toBe(0)
    expect(result.recordsTotal).toBe(0)
    expect(result.hasBalance).toBe(false)
  })
})