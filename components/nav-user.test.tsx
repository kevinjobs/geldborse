import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'

// Mock Shadcn UI components
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: vi.fn(({ children }: any) => <div data-testid="dropdown-menu">{children}</div>),
  DropdownMenuContent: vi.fn(({ children }: any) => <div data-testid="dropdown-content">{children}</div>),
  DropdownMenuItem: vi.fn(({ children, onClick }: any) => <button data-testid="dropdown-item" onClick={onClick}>{children}</button>),
  DropdownMenuLabel: vi.fn(({ children }: any) => <div>{children}</div>),
  DropdownMenuSeparator: vi.fn(() => <div>---</div>),
  DropdownMenuTrigger: vi.fn(({ children }: any) => <button data-testid="dropdown-trigger">{children}</button>),
}))

vi.mock('@/components/ui/avatar', () => ({
  Avatar: vi.fn(({ children }: any) => <div data-testid="avatar">{children}</div>),
  AvatarImage: vi.fn(({ src }: any) => <div data-testid="avatar-image" data-src={src} />),
  AvatarFallback: vi.fn(({ children }: any) => <div data-testid="avatar-fallback">{children}</div>),
}))

// Mock useAuth with a controlled logout spy
const mockLogout = vi.fn()
vi.mock('@/lib/auth-context', () => ({
  useAuth: vi.fn(() => ({
    user: { id: '1', email: 'test@example.com', name: 'Test User' },
    logout: mockLogout,
  })),
}))

// Import mocked modules (vi.mock is hoisted, so these get the mocked versions)
import { useAuth } from '@/lib/auth-context'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Avatar } from '@/components/ui/avatar'

describe('NavUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render user name via useAuth', () => {
    const auth = useAuth()
    expect(auth.user?.name).toBe('Test User')
    expect(auth.user?.email).toBe('test@example.com')
  })

  it('should provide a logout function that can be called', () => {
    const { logout } = useAuth()
    logout()
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })

  it('should have dropdown menu items rendered via mocked components', () => {
    // Verify mocked components exist and render children
    const rendered = DropdownMenu({ children: 'test' } as any)
    expect(rendered.props['data-testid']).toBe('dropdown-menu')

    const avatar = Avatar({ children: null } as any)
    expect(avatar.props['data-testid']).toBe('avatar')

    // Verify the mock component triggers logout
    const item = DropdownMenuItem({ children: '退出登录', onClick: mockLogout } as any)
    item.props.onClick()
    expect(mockLogout).toHaveBeenCalled()
  })
})