import { randomBytes, createHash } from 'node:crypto'

export const API_KEY_SCOPES = {
  'accounts:read':   { label: '查看账户',    groupLabel: '账户管理' },
  'accounts:write':  { label: '管理账户',    groupLabel: '账户管理' },
  'records:read':    { label: '查看收支记录', groupLabel: '收支记录' },
  'records:write':   { label: '管理收支记录', groupLabel: '收支记录' },
  'snapshots:read':  { label: '查看快照',    groupLabel: '快照与资产' },
  'snapshots:write': { label: '管理快照',    groupLabel: '快照与资产' },
  'assets:read':     { label: '查看资产',    groupLabel: '快照与资产' },
  'assets:write':    { label: '管理资产',    groupLabel: '快照与资产' },
  'export':          { label: '导出数据',    groupLabel: '系统' },
  'settings:read':   { label: '查看设置',    groupLabel: '系统' },
  'settings:write':  { label: '修改设置',    groupLabel: '系统' },
  'import':          { label: '导入数据',    groupLabel: '系统' },
} as const

export type ScopeKey = keyof typeof API_KEY_SCOPES

export const SCOPE_GROUPS = [
  { key: 'accounts',   label: '账户管理',   scopes: ['accounts:read', 'accounts:write'] as ScopeKey[] },
  { key: 'records',    label: '收支记录',   scopes: ['records:read', 'records:write'] as ScopeKey[] },
  { key: 'snapshots',  label: '快照与资产', scopes: ['snapshots:read', 'snapshots:write', 'assets:read', 'assets:write'] as ScopeKey[] },
  { key: 'system',     label: '系统',       scopes: ['export', 'settings:read', 'settings:write', 'import'] as ScopeKey[] },
] as const

export const SCOPE_PRESETS = {
  'read-only':   { label: '只读访问',   scopes: ['read:*', 'export', 'settings:read'] },
  'full-access': { label: '完全访问',   scopes: ['read:*', 'write:*', 'export', 'settings:read', 'settings:write', 'import'] },
} as const

export const EXPIRES_IN_MS = {
  '24h':   86_400_000,
  '7d':    604_800_000,
  '30d':   2_592_000_000,
  '90d':   7_776_000_000,
  'never': null,
} as const

export type ExpiresInOption = keyof typeof EXPIRES_IN_MS

export function hasScope(userScopes: string[], requiredScope: string): boolean {
  if (userScopes.includes('*')) return true

  for (const s of userScopes) {
    if (s === requiredScope) return true
    if (s === 'read:*'  && /^[a-z]+:read$/.test(requiredScope))  return true
    if (s === 'write:*' && /^[a-z]+:write$/.test(requiredScope)) return true
  }
  return false
}

export function validateScopes(input: string[]): string | null {
  const scopes = [...new Set(input)]
  if (scopes.length === 0) return '至少需要一个作用域'
  if (scopes.includes('*')) return '通配符 * 仅用于 Session 认证'
  for (const s of scopes) {
    if (!(s in API_KEY_SCOPES) && s !== 'read:*' && s !== 'write:*') {
      return `无效的作用域: ${s}`
    }
  }
  return null
}

export function generateApiKey(): { fullKey: string; prefix: string; keyHash: string } {
  const raw = randomBytes(24).toString('hex')
  const fullKey = 'gb_' + raw
  const prefix = fullKey.slice(0, 10)
  const keyHash = createHash('sha256').update(fullKey).digest('hex')
  return { fullKey, prefix, keyHash }
}