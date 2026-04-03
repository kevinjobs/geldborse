import { describe, it, expect } from 'vitest'

describe('Document availability', () => {
  it('should have document object available', () => {
    expect(typeof document).toBe('object')
    expect(document).not.toBeNull()
  })

  it('should have window object available', () => {
    expect(typeof window).toBe('object')
    expect(window).not.toBeNull()
  })

  it('should have localStorage available', () => {
    expect(typeof localStorage).toBe('object')
    expect(localStorage).not.toBeNull()
  })
})
