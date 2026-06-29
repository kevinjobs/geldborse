import { describe, it, expect } from 'vitest'
import { hasScope, validateScopes, generateApiKey } from './api-key'

describe('generateApiKey', () => {
  it('should generate a key with gb_ prefix', () => {
    const { fullKey } = generateApiKey()
    expect(fullKey.startsWith('gb_')).toBe(true)
  })

  it('should generate a key of correct length', () => {
    const { fullKey } = generateApiKey()
    expect(fullKey.length).toBe(51)
  })

  it('should generate unique keys on successive calls', () => {
    const k1 = generateApiKey()
    const k2 = generateApiKey()
    expect(k1.fullKey).not.toBe(k2.fullKey)
    expect(k1.keyHash).not.toBe(k2.keyHash)
  })

  it('should extract prefix correctly', () => {
    const { fullKey, prefix } = generateApiKey()
    expect(prefix).toBe(fullKey.slice(0, 10))
  })

  it('should produce a hex keyHash of length 64', () => {
    const { keyHash } = generateApiKey()
    expect(keyHash.length).toBe(64)
    expect(/^[0-9a-f]+$/.test(keyHash)).toBe(true)
  })
})

describe('hasScope', () => {
  it('should allow * to match anything', () => {
    expect(hasScope(['*'], 'accounts:read')).toBe(true)
    expect(hasScope(['*'], 'anything:write')).toBe(true)
  })

  it('should match exact scopes', () => {
    expect(hasScope(['accounts:read'], 'accounts:read')).toBe(true)
    expect(hasScope(['accounts:read'], 'records:read')).toBe(false)
  })

  it('should match read:* wildcard', () => {
    expect(hasScope(['read:*'], 'accounts:read')).toBe(true)
    expect(hasScope(['read:*'], 'records:read')).toBe(true)
    expect(hasScope(['read:*'], 'snapshots:read')).toBe(true)
    expect(hasScope(['read:*'], 'assets:read')).toBe(true)
  })

  it('should not match write scopes with read:*', () => {
    expect(hasScope(['read:*'], 'accounts:write')).toBe(false)
    expect(hasScope(['read:*'], 'records:write')).toBe(false)
  })

  it('should match write:* wildcard', () => {
    expect(hasScope(['write:*'], 'accounts:write')).toBe(true)
    expect(hasScope(['write:*'], 'records:write')).toBe(true)
    expect(hasScope(['write:*'], 'snapshots:write')).toBe(true)
  })

  it('should not match read scopes with write:*', () => {
    expect(hasScope(['write:*'], 'accounts:read')).toBe(false)
    expect(hasScope(['write:*'], 'records:read')).toBe(false)
  })

  it('should not match export with read:* or write:*', () => {
    expect(hasScope(['read:*'], 'export')).toBe(false)
    expect(hasScope(['write:*'], 'export')).toBe(false)
  })

  it('should not match import with read:* or write:*', () => {
    expect(hasScope(['read:*'], 'import')).toBe(false)
    expect(hasScope(['write:*'], 'import')).toBe(false)
  })

  it('should handle empty scopes', () => {
    expect(hasScope([], 'accounts:read')).toBe(false)
  })

  it('should not match malformed read scopes', () => {
    expect(hasScope(['read:*'], 'special:audit-read')).toBe(false)
    expect(hasScope(['read:*'], 'read:admin')).toBe(false)
  })

  it('should support multiple scopes', () => {
    expect(hasScope(['accounts:read', 'records:write'], 'accounts:read')).toBe(true)
    expect(hasScope(['accounts:read', 'records:write'], 'records:write')).toBe(true)
    expect(hasScope(['accounts:read', 'records:write'], 'snapshots:read')).toBe(false)
  })

  it('should support combined read:* and specific write scopes', () => {
    expect(hasScope(['read:*', 'accounts:write'], 'accounts:read')).toBe(true)
    expect(hasScope(['read:*', 'accounts:write'], 'accounts:write')).toBe(true)
    expect(hasScope(['read:*', 'accounts:write'], 'records:write')).toBe(false)
  })
})

describe('validateScopes', () => {
  it('should reject empty array', () => {
    expect(validateScopes([])).not.toBeNull()
  })

  it('should reject wildcard *', () => {
    expect(validateScopes(['*'])).not.toBeNull()
    expect(validateScopes(['accounts:read', '*'])).not.toBeNull()
  })

  it('should reject invalid scopes', () => {
    expect(validateScopes(['invalid:scope'])).not.toBeNull()
    expect(validateScopes(['nope'])).not.toBeNull()
    expect(validateScopes([''])).not.toBeNull()
  })

  it('should accept valid scopes', () => {
    expect(validateScopes(['accounts:read'])).toBeNull()
    expect(validateScopes(['accounts:write'])).toBeNull()
    expect(validateScopes(['records:read', 'records:write'])).toBeNull()
    expect(validateScopes(['read:*'])).toBeNull()
    expect(validateScopes(['write:*'])).toBeNull()
    expect(validateScopes(['export', 'import'])).toBeNull()
  })

  it('should accept all defined scopes', () => {
    const allScopes = [
      'accounts:read', 'accounts:write',
      'records:read', 'records:write',
      'snapshots:read', 'snapshots:write',
      'assets:read', 'assets:write',
      'export', 'settings:read', 'settings:write',
      'import',
    ]
    expect(validateScopes(allScopes)).toBeNull()
  })

  it('should deduplicate repeated scopes', () => {
    expect(validateScopes(['accounts:read', 'accounts:read', 'accounts:read'])).toBeNull()
  })
})