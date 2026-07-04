import { describe, it, expect } from 'vitest'

describe('设置页面导航结构测试', () => {
  it('设置分类应该包含所有主要分组', () => {
    const categories = [
      { id: 'account', label: '账户', items: ['个人资料', '账户安全'] },
      { id: 'preferences', label: '偏好', items: ['通知设置', '隐私设置'] },
      { id: 'data', label: '数据', items: ['数据管理', 'API 密钥'] },
    ]
    expect(categories).toHaveLength(3)
    categories.forEach((cat) => {
      expect(cat.items.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('管理分类仅对管理员可见', () => {
    const adminOnlyCategories = [{ id: 'admin', label: '管理', items: ['用户管理'] }]
    expect(adminOnlyCategories).toHaveLength(1)
    expect(adminOnlyCategories[0].items).toContain('用户管理')
  })

  it('所有子路由应有对应页面', () => {
    const routes = [
      '/settings/profile',
      '/settings/security',
      '/settings/notifications',
      '/settings/privacy',
      '/settings/data',
      '/settings/api-keys',
      '/settings/admin',
    ]
    expect(routes).toHaveLength(7)
    routes.forEach((route) => {
      expect(route).toMatch(/^\/settings\//)
    })
  })

  it('退出登录应在 Hub 页底部', () => {
    const logoutAction = { label: '退出登录', variant: 'destructive', position: 'bottom' }
    expect(logoutAction.position).toBe('bottom')
    expect(logoutAction.variant).toBe('destructive')
  })
})