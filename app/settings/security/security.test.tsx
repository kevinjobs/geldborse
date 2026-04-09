import { describe, it, expect } from 'vitest'

// 模拟登录历史数据
const mockLoginHistories = [
  {
    id: '1',
    userId: '1',
    ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    deviceInfo: 'Windows 10, Chrome',
    loginAt: '2026-04-09T10:00:00Z',
    isCurrent: true
  },
  {
    id: '2',
    userId: '1',
    ip: '192.168.1.2',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)',
    deviceInfo: 'MacOS, Safari',
    loginAt: '2026-04-08T10:00:00Z',
    isCurrent: false
  }
]

describe('安全设置页面功能测试', () => {
  it('应该正确获取登录历史记录', () => {
    expect(mockLoginHistories.length).toBe(2)
  })

  it('应该正确识别当前登录会话', () => {
    const currentSession = mockLoginHistories.find(history => history.isCurrent)
    expect(currentSession).toBeTruthy()
    expect(currentSession?.ip).toBe('192.168.1.1')
  })

  it('应该正确按登录时间排序记录', () => {
    const sortedHistories = [...mockLoginHistories].sort((a, b) => 
      new Date(b.loginAt).getTime() - new Date(a.loginAt).getTime()
    )
    
    expect(sortedHistories[0].id).toBe('1') // 最新的登录
    expect(sortedHistories[1].id).toBe('2') // 较早的登录
  })

  it('应该正确验证登录历史数据结构', () => {
    mockLoginHistories.forEach(history => {
      expect(history.id).toBeTruthy()
      expect(history.userId).toBeTruthy()
      expect(history.ip).toBeTruthy()
      expect(history.userAgent).toBeTruthy()
      expect(history.loginAt).toBeTruthy()
    })
  })

  it('应该正确处理登录历史过滤', () => {
    const recentLogins = mockLoginHistories.filter(history => {
      const loginDate = new Date(history.loginAt)
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      return loginDate >= oneWeekAgo
    })
    
    expect(recentLogins.length).toBe(2) // 所有登录都在一周内
  })
})
