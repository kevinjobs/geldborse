import { describe, it, expect } from 'vitest'

// 模拟账户总额计算函数
function testGetAccountTotal(assets: any[], records: any[]) {
  let total = 0
  let baseAmount = 0
  let recordsTotal = 0
  let hasBalance = false

  if (assets.length > 0) {
    // 计算所有资产的最新余额总和
    for (const asset of assets) {
      if (asset.balances && asset.balances.length > 0) {
        const latestBalance = asset.balances[0]
        baseAmount += latestBalance.amount
        hasBalance = true
      } else {
        baseAmount += asset.amount || 0
      }
    }

    // 找到最新的余额时间
    let latestBalanceTime: Date | null = null
    for (const asset of assets) {
      if (asset.balances && asset.balances.length > 0) {
        const balanceTime = new Date(asset.balances[0].recordedAt)
        if (!latestBalanceTime || balanceTime > latestBalanceTime) {
          latestBalanceTime = balanceTime
        }
      }
    }

    // 只计算在最新余额时间之后的收支记录
    if (latestBalanceTime) {
      const latestBalanceTimeSec = Math.floor(latestBalanceTime.getTime() / 1000)
      const recordsAfterBalance = records.filter(record => {
        const recordTimeSec = Math.floor(new Date(record.date).getTime() / 1000)
        return recordTimeSec > latestBalanceTimeSec
      })
      
      recordsTotal = recordsAfterBalance.reduce((sum, r) => sum + r.amount, 0)
    } else {
      // 对于没有余额记录的资产，计算所有收支记录
      recordsTotal = records.reduce((sum, r) => sum + r.amount, 0)
    }
  } else {
    // 对于没有资产的账户，计算所有收支记录
    recordsTotal = records.reduce((sum, r) => sum + r.amount, 0)
  }

  total = baseAmount + recordsTotal

  return { total, baseAmount, recordsTotal, hasBalance }
}

// 模拟资产数据
const mockAssets = [
  {
    id: '1',
    accountId: '1',
    name: '测试资产',
    amount: 1000,
    type: 'cash',
    balances: [
      {
        id: '1',
        assetId: '1',
        amount: 1500,
        recordedAt: '2026-04-09T10:00:00Z'
      }
    ]
  }
]

// 模拟收支记录数据
const mockRecords = [
  {
    id: '1',
    accountId: '1',
    amount: 500,
    date: '2026-04-09T11:00:00Z',
    category: 'income',
    type: 'income'
  },
  {
    id: '2',
    accountId: '1',
    amount: -200,
    date: '2026-04-09T12:00:00Z',
    category: 'expense',
    type: 'expense'
  }
]

describe('账户管理功能测试', () => {
  it('应该正确计算账户总额（包含资产快照和后续收支）', () => {
    // 测试账户总额计算
    const result = testGetAccountTotal(mockAssets, mockRecords)
    
    // 最新快照总额：1500
    // 后续收支：500 - 200 = 300
    // 总账户额：1500 + 300 = 1800
    expect(result.total).toBe(1800)
    expect(result.baseAmount).toBe(1500)
    expect(result.recordsTotal).toBe(300)
  })

  it('应该正确处理没有资产的账户', () => {
    // 测试没有资产的账户
    const result = testGetAccountTotal([], mockRecords)
    
    // 初始余额：0
    // 收支总额：500 - 200 = 300
    // 总账户额：0 + 300 = 300
    expect(result.total).toBe(300)
    expect(result.baseAmount).toBe(0)
    expect(result.recordsTotal).toBe(300)
  })

  it('应该正确处理没有收支记录的账户', () => {
    // 测试没有收支记录的账户
    const result = testGetAccountTotal(mockAssets, [])
    
    // 最新快照总额：1500
    // 后续收支：0
    // 总账户额：1500 + 0 = 1500
    expect(result.total).toBe(1500)
    expect(result.baseAmount).toBe(1500)
    expect(result.recordsTotal).toBe(0)
  })

  it('应该正确处理资产没有快照的情况', () => {
    // 模拟资产没有快照的情况
    const assetsWithoutBalances = [
      {
        id: '1',
        accountId: '1',
        name: '测试资产',
        amount: 1000,
        type: 'cash',
        balances: []
      }
    ]

    // 测试资产没有快照的情况
    const result = testGetAccountTotal(assetsWithoutBalances, mockRecords)
    
    // 资产初始金额：1000
    // 收支总额：500 - 200 = 300
    // 总账户额：1000 + 300 = 1300
    expect(result.total).toBe(1300)
    expect(result.baseAmount).toBe(1000)
    expect(result.recordsTotal).toBe(300)
  })

  it('应该正确处理资产快照时间与收支记录时间相同的情况', () => {
    // 模拟资产快照时间与收支记录时间相同的情况
    const recordsWithSameTime = [
      {
        id: '1',
        accountId: '1',
        amount: 500,
        date: '2026-04-09T10:00:00Z', // 与快照时间相同
        category: 'income',
        type: 'income'
      }
    ]

    // 测试资产快照时间与收支记录时间相同的情况
    const result = testGetAccountTotal(mockAssets, recordsWithSameTime)
    
    // 最新快照总额：1500
    // 后续收支：0（因为时间相同，不包含在内）
    // 总账户额：1500 + 0 = 1500
    expect(result.total).toBe(1500)
    expect(result.baseAmount).toBe(1500)
    expect(result.recordsTotal).toBe(0)
  })
})
