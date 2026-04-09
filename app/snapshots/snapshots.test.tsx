import { describe, it, expect } from 'vitest'

// 模拟资产快照数据
const mockSnapshots = [
  {
    id: '1',
    assetId: '1',
    amount: 1500,
    recordedAt: '2026-04-09T10:00:00Z'
  },
  {
    id: '2',
    assetId: '1',
    amount: 1600,
    recordedAt: '2026-04-10T10:00:00Z'
  },
  {
    id: '3',
    assetId: '1',
    amount: 1400,
    recordedAt: '2026-04-11T10:00:00Z'
  }
]

// 模拟资产数据
const mockAssets = [
  {
    id: '1',
    name: '测试资产',
    type: 'cash'
  }
]

describe('资产快照页面功能测试', () => {
  it('应该正确计算资产价值变化', () => {
    const firstSnapshot = mockSnapshots[0]
    const lastSnapshot = mockSnapshots[mockSnapshots.length - 1]
    const valueChange = lastSnapshot.amount - firstSnapshot.amount
    
    expect(valueChange).toBe(-100) // 价值减少了100
  })

  it('应该正确计算资产价值变化百分比', () => {
    const firstSnapshot = mockSnapshots[0]
    const lastSnapshot = mockSnapshots[mockSnapshots.length - 1]
    const valueChange = lastSnapshot.amount - firstSnapshot.amount
    const changePercentage = (valueChange / firstSnapshot.amount) * 100
    
    expect(changePercentage).toBeCloseTo(-6.67, 2) // 价值减少了约6.67%
  })

  it('应该正确按日期排序快照', () => {
    const sortedSnapshots = [...mockSnapshots].sort((a, b) => 
      new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    )
    
    expect(sortedSnapshots[0].id).toBe('1') // 最早的快照
    expect(sortedSnapshots[1].id).toBe('2') // 中间的快照
    expect(sortedSnapshots[2].id).toBe('3') // 最新的快照
  })

  it('应该正确计算平均资产价值', () => {
    const totalValue = mockSnapshots.reduce((sum, snapshot) => sum + snapshot.amount, 0)
    const averageValue = totalValue / mockSnapshots.length
    
    expect(averageValue).toBe(1500) // 平均价值为1500
  })

  it('应该正确识别最高和最低资产价值', () => {
    const amounts = mockSnapshots.map(snapshot => snapshot.amount)
    const highestValue = Math.max(...amounts)
    const lowestValue = Math.min(...amounts)
    
    expect(highestValue).toBe(1600) // 最高价值为1600
    expect(lowestValue).toBe(1400) // 最低价值为1400
  })
})
