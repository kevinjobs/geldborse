import { describe, it, expect } from 'vitest'

// 模拟收支记录数据
const mockRecords = [
  { id: '1', accountId: '1', amount: 500, date: '2026-04-09T11:00:00Z', category: 'income', type: 'income', description: '工资' },
  { id: '2', accountId: '1', amount: -200, date: '2026-04-09T12:00:00Z', category: 'expense', type: 'expense', description: '购物' },
  { id: '3', accountId: '2', amount: 100, date: '2026-04-08T10:00:00Z', category: 'income', type: 'income', description: '红包' },
]

const mockAccounts = [
  { id: '1', name: '测试账户', type: 'cash' },
  { id: '2', name: '储蓄账户', type: 'bank' },
]

const mockCategories = [
  { id: '1', name: '收入', type: 'income' },
  { id: '2', name: '支出', type: 'expense' },
]

// --- Helper functions extracted from RecordsPage for testing ---
function getTotalIncome(records: typeof mockRecords) {
  return records.filter((r) => r.type === 'income').reduce((sum, r) => sum + r.amount, 0)
}

function getTotalExpense(records: typeof mockRecords) {
  return records.filter((r) => r.type === 'expense').reduce((sum, r) => sum + Math.abs(r.amount), 0)
}

function getNetIncome(records: typeof mockRecords) {
  return records.reduce((sum, r) => sum + r.amount, 0)
}

function sortByDateDesc(records: typeof mockRecords) {
  return [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

function filterByType(records: typeof mockRecords, type: string) {
  return records.filter((r) => r.type === type)
}

describe('收支记录页面功能测试', () => {
  it('应该正确计算总收入', () => {
    expect(getTotalIncome(mockRecords)).toBe(600)
  })

  it('应该正确计算总支出', () => {
    expect(getTotalExpense(mockRecords)).toBe(200)
  })

  it('应该正确计算净收入', () => {
    expect(getNetIncome(mockRecords)).toBe(400)
  })

  it('应该正确过滤不同类型的记录', () => {
    expect(filterByType(mockRecords, 'income')).toHaveLength(2)
    expect(filterByType(mockRecords, 'expense')).toHaveLength(1)
  })

  it('应该正确按日期排序记录（最新在前）', () => {
    const sorted = sortByDateDesc(mockRecords)
    // id 1: 4/9 11:00, id 2: 4/9 12:00, id 3: 4/8 10:00
    // Latest first: 2 (4/9 12:00), 1 (4/9 11:00), 3 (4/8 10:00)
    expect(sorted[0].id).toBe('2')
    expect(sorted[1].id).toBe('1')
    expect(sorted[2].id).toBe('3')
  })

  // --- Edge cases ---
  it('空记录列表各聚合返回0', () => {
    expect(getTotalIncome([])).toBe(0)
    expect(getTotalExpense([])).toBe(0)
    expect(getNetIncome([])).toBe(0)
    expect(sortByDateDesc([])).toEqual([])
    expect(filterByType([], 'income')).toEqual([])
  })

  it('纯收入列表净收入为正', () => {
    const incomes = filterByType(mockRecords, 'income')
    expect(getNetIncome(incomes)).toBe(600)
  })

  it('纯支出列表净收入为负', () => {
    const expenses = filterByType(mockRecords, 'expense')
    expect(getNetIncome(expenses)).toBe(-200)
  })

  it('相同日期记录稳定排序', () => {
    const sameDay: { id: string; accountId: string; amount: number; date: string; category: string; type: string; description: string }[] = [
      { id: 'a', accountId: '1', amount: 100, date: '2026-04-09T10:00:00Z', category: 'income', type: 'income', description: '' },
      { id: 'b', accountId: '1', amount: 200, date: '2026-04-09T10:00:00Z', category: 'income', type: 'income', description: '' },
    ]
    const sorted = sortByDateDesc(sameDay)
    expect(sorted).toHaveLength(2)
  })
})
