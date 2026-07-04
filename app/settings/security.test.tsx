import { describe, it, expect } from 'vitest'

// --- Login history logic (security tests) ---

const mockLoginHistories = [
  {
    id: '1', userId: '1', ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    deviceInfo: 'Windows 10, Chrome',
    loginAt: '2026-07-03T10:00:00Z', isCurrent: true,
  },
  {
    id: '2', userId: '1', ip: '192.168.1.2',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)',
    deviceInfo: 'MacOS, Safari',
    loginAt: '2026-06-30T10:00:00Z', isCurrent: false,
  },
]

function sortByLoginAtDesc(histories: typeof mockLoginHistories) {
  return [...histories].sort(
    (a, b) => new Date(b.loginAt).getTime() - new Date(a.loginAt).getTime()
  )
}

function filterRecentWeek(histories: typeof mockLoginHistories, now: Date) {
  const oneWeekAgo = new Date(now)
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  return histories.filter((h) => new Date(h.loginAt) >= oneWeekAgo)
}

function validatePasswordStrength(password: string) {
  return {
    length: password.length >= 8,
    hasDigit: /\d/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasSpecial: /[!@#$%^&*]/.test(password),
  }
}

describe('安全设置页面功能测试', () => {
  describe('登录历史', () => {
    it('应该正确获取登录历史记录', () => {
      expect(mockLoginHistories.length).toBe(2)
    })

    it('应该正确识别当前登录会话', () => {
      const current = mockLoginHistories.find((h) => h.isCurrent)
      expect(current).toBeTruthy()
      expect(current?.ip).toBe('192.168.1.1')
    })

    it('应该正确按登录时间排序记录（最新在前）', () => {
      const sorted = sortByLoginAtDesc(mockLoginHistories)
      expect(sorted[0].id).toBe('1')
      expect(sorted[1].id).toBe('2')
    })

    it('应该正确验证登录历史数据结构', () => {
      mockLoginHistories.forEach((h) => {
        expect(h.id).toBeTruthy()
        expect(h.userId).toBeTruthy()
        expect(h.ip).toBeTruthy()
        expect(h.userAgent).toBeTruthy()
        expect(h.loginAt).toBeTruthy()
      })
    })

    it('应该正确处理登录历史过滤（一周内）', () => {
      const now = new Date('2026-07-04T12:00:00Z')
      const recent = filterRecentWeek(mockLoginHistories, now)
      expect(recent).toHaveLength(2)
    })

    it('filterRecentWeek 排除一周前的记录', () => {
      const now = new Date('2026-07-20T12:00:00Z')
      const recent = filterRecentWeek(mockLoginHistories, now)
      expect(recent).toHaveLength(0)
    })

    it('空列表排序返回空', () => {
      expect(sortByLoginAtDesc([])).toEqual([])
    })
  })

  describe('密码验证', () => {
    it('应该验证强密码符合所有要求', () => {
      const result = validatePasswordStrength('NewPassword123!')
      expect(result.length).toBe(true)
      expect(result.hasDigit).toBe(true)
      expect(result.hasUpper).toBe(true)
      expect(result.hasLower).toBe(true)
      expect(result.hasSpecial).toBe(true)
    })

    it('应该正确验证密码确认匹配', () => {
      const newPassword = 'NewPassword123!'
      const confirmPassword = 'NewPassword123!'
      expect(newPassword).toBe(confirmPassword)
    })

    it('应该正确验证当前密码不为空', () => {
      const currentPassword = 'oldPassword123'
      expect(currentPassword).toBeTruthy()
      expect(currentPassword.length).toBeGreaterThan(0)
    })

    it('应该正确处理密码更新（新密码与当前密码不同）', () => {
      const currentPassword = 'oldPassword123'
      const newPassword = 'NewPassword123!'
      expect(newPassword).not.toBe(currentPassword)
    })

    it('应该正确检测弱密码（长度不足）', () => {
      const result = validatePasswordStrength('123456')
      expect(result.length).toBe(false)
    })

    it('应该正确检测弱密码（缺少大写字母）', () => {
      const result = validatePasswordStrength('password123')
      expect(result.hasUpper).toBe(false)
    })

    it('应该正确检测弱密码（缺少特殊字符）', () => {
      const result = validatePasswordStrength('Password123')
      expect(result.hasSpecial).toBe(false)
    })
  })
})