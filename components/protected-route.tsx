'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, authError } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user === null && !authError) {
      router.push('/auth/login')
    }
  }, [user, isLoading, authError, router])

  if (isLoading || (user === null && authError)) {
    return (
      <div className="flex h-svh items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    )
  }

  if (user === null) {
    return null
  }

  return <>{children}</>
}
