'use client'

import * as React from 'react'

type User = {
  id: string
  email: string
  name?: string
  avatar?: string | null
  isAdmin?: boolean
}

type AuthContextType = {
  user: User | null
  login: (credentials: { email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => {
        if (res.ok) return res.json()
        return null
      })
      .then((data) => {
        if (data?.user) {
          setUser(data.user)
        }
        setIsLoading(false)
      })
      .catch(() => {
        setIsLoading(false)
      })
  }, [])

  const login = async (credentials: { email: string; password: string }) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Login failed')
    }

    const data = await response.json()
    setUser(data.user)
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      setUser(null)
    }
  }

  const value = {
    user,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  )
}