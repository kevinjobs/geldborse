import { describe, it, expect } from 'vitest'

// 模拟导出数据
const mockExportData = {
  accounts: [
    { id: '1', name: '测试账户', type: 'cash', totalAmount: 1000 },
    { id: '2', name: '储蓄账户', type: 'bank', totalAmount: 5000 },
  ],
  records: [
    { id: '1', accountId: '1', amount: 500, date: '2026-04-09T11:00:00Z', category: 'income', type: 'income', description: '工资' },
    { id: '2', accountId: '1', amount: -200, date: '2026-04-15T12:00:00Z', category: 'expense', type: 'expense', description: '购物' },
    { id: '3', accountId: '2', amount: 1000, date: '2026-04-10T08:00:00Z', category: 'income', type: 'income', description: '利息' },
  ],
  assets: [
    { id: '1', accountId: '1', name: '测试资产', amount: 1500, type: 'cash' },
    { id: '2', accountId: '2', name: '定期存款', amount: 10000, type: 'deposit' },
  ],
}

// --- Helper functions extracted from ExportPage for testing ---

function getIncomeTotal(records: typeof mockExportData.records) {
  return records.filter((r) => r.type === 'income').reduce((sum, r) => sum + r.amount, 0)
}

function getExpenseTotal(records: typeof mockExportData.records) {
  return records.filter((r) => r.type === 'expense').reduce((sum, r) => sum + Math.abs(r.amount), 0)
}

function getNetIncome(records: typeof mockExportData.records) {
  return records.reduce((sum, r) => sum + r.amount, 0)
}

function getTotalAssets(accounts: typeof mockExportData.accounts) {
  return accounts.reduce((sum, a) => sum + (a.totalAmount || 0), 0)
}

function filterRecordsByAccount(records: typeof mockExportData.records, accountId: string) {
  return records.filter((r) => r.accountId === accountId)
}

function filterRecordsByDateRange(records: typeof mockExportData.records, start: string, end: string) {
  const startDate = new Date(start)
  const endDate = new Date(end)
  return records.filter((r) => {
    const d = new Date(r.date)
    return d >= startDate && d <= endDate
  })
}


describe('数据导出页面功能测试', () => {
  // --- Original mock-data tests ---
  it('应该正确准备导出数据', () => {
    expect(mockExportData.accounts).toBeTruthy()
    expect(mockExportData.records).toBeTruthy()
    expect(mockExportData.assets).toBeTruthy()
  })

  it('应该正确计算导出数据的数量', () => {
    expect(mockExportData.accounts.length).toBe(2)
    expect(mockExportData.records.length).toBe(3)
    expect(mockExportData.assets.length).toBe(2)
  })

  it('应该正确处理日期范围', () => {
    const recordDate = new Date(mockExportData.records[0].date)
    expect(recordDate >= new Date('2026-04-01')).toBe(true)
    expect(recordDate <= new Date('2026-04-30')).toBe(true)
  })

  it('应该正确处理账户筛选', () => {
    const filtered = mockExportData.records.filter((r) => r.accountId === '1')
    expect(filtered).toHaveLength(2)
  })

  // --- Logic function tests ---
  describe('聚合计算', () => {
    it('getIncomeTotal 正确计算总收入', () => {
      expect(getIncomeTotal(mockExportData.records)).toBe(1500)
    })

    it('getExpenseTotal 正确计算总支出（绝对值）', () => {
      expect(getExpenseTotal(mockExportData.records)).toBe(200)
    })

    it('getNetIncome 正确计算净收入', () => {
      expect(getNetIncome(mockExportData.records)).toBe(1300)
    })

    it('getTotalAssets 汇总所有账户总额', () => {
      expect(getTotalAssets(mockExportData.accounts)).toBe(6000)
    })

    it('getTotalAssets 空账户数组返回0', () => {
      expect(getTotalAssets([])).toBe(0)
    })
  })

  describe('记录筛选', () => {
    it('filterRecordsByAccount 精确匹配', () => {
      expect(filterRecordsByAccount(mockExportData.records, '1')).toHaveLength(2)
      expect(filterRecordsByAccount(mockExportData.records, '2')).toHaveLength(1)
    })

    it('filterRecordsByAccount 不匹配时返回空数组', () => {
      expect(filterRecordsByAccount(mockExportData.records, 'nonexistent')).toHaveLength(0)
    })

    it('filterRecordsByDateRange 正确过滤日期区间', () => {
      // Include full day range (end of day inclusive) for proper matching
      const result = filterRecordsByDateRange(mockExportData.records, '2026-04-09T00:00:00Z', '2026-04-10T23:59:59Z')
      // record 1: 4/9 11:00 ✓, record 3: 4/10 08:00 ✓, record 2: 4/15 ✗
      expect(result).toHaveLength(2)
    })
  })

  describe('空数据处理', () => {
    it('空记录列表返回0', () => {
      expect(getIncomeTotal([])).toBe(0)
      expect(getExpenseTotal([])).toBe(0)
      expect(getNetIncome([])).toBe(0)
    })
  })
})
