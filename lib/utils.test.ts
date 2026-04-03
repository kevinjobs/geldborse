import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('should merge class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    const isActive = true
    const isDisabled = false
    expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe('base active')
  })

  it('should handle arrays of classes', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz')
  })

  it('should handle objects with boolean values', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz')
  })

  it('should merge tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })

  it('should filter out falsy values', () => {
    expect(cn('foo', null, undefined, false, '', 'bar')).toBe('foo bar')
  })

  it('should handle complex combinations', () => {
    const result = cn(
      'flex items-center',
      'px-4 py-2',
      {
        'bg-blue-500': true,
        'text-white': true,
        'rounded-lg': false,
      },
      ['hover:bg-blue-600', 'focus:outline-none']
    )
    expect(result).toContain('flex')
    expect(result).toContain('items-center')
    expect(result).toContain('px-4')
    expect(result).toContain('py-2')
    expect(result).toContain('bg-blue-500')
    expect(result).toContain('text-white')
    expect(result).toContain('hover:bg-blue-600')
    expect(result).toContain('focus:outline-none')
    expect(result).not.toContain('rounded-lg')
  })
})
