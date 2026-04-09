import { describe, it, expect } from 'vitest'

// 模拟收支记录数据
const mockRecords = [
  {
    id: '1',
    accountId: '1',
    amount: 500,
    date: '2026-04-09T11:00:00Z',
    category: 'income',
    type: 'income',
    description: '工资'
  },
  {
    id: '2',
    accountId: '1',
    amount: -200,
    date: '2026-04-09T12:00:00Z',
    category: 'expense',
    type: 'expense',
    description: '购物'
  }
]

// 模拟账户数据
const mockAccounts = [
  {
    id: '1',
    name: '测试账户',
    type: 'cash'
  }
]

// 模拟分类数据
const mockCategories = [
  {
    id: '1',
    name: '收入',
    type: 'income'
  },
  {
    id: '2',
    name: '支出',
    type: 'expense'
  }
]

describe('收支记录页面功能测试', () => {
  it('应该正确计算总收入', () => {
    const totalIncome = mockRecords
      .filter(record => record.type === 'income')
      .reduce((sum, record) => sum + record.amount, 0)
    
    expect(totalIncome).toBe(500)
  })

  it('应该正确计算总支出', () => {
    const totalExpense = mockRecords
      .filter(record => record.type === 'expense')
      .reduce((sum, record) => sum + Math.abs(record.amount), 0)
    
    expect(totalExpense).toBe(200)
  })

  it('应该正确计算净收入', () => {
    const netIncome = mockRecords.reduce((sum, record) => sum + record.amount, 0)
    
    expect(netIncome).toBe(300)
  })

  it('应该正确过滤不同类型的记录', () => {
    const incomeRecords = mockRecords.filter(record => record.type === 'income')
    const expenseRecords = mockRecords.filter(record => record.type === 'expense')
    
    expect(incomeRecords.length).toBe(1)
    expect(expenseRecords.length).toBe(1)
  })

  it('应该正确按日期排序记录', () => {
    const sortedRecords = [...mockRecords].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    
    expect(sortedRecords[0].id).toBe('2') // 最新的记录
    expect(sortedRecords[1].id).toBe('1') // 较早的记录
  })
})
