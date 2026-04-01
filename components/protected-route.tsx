'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 等待用户状态恢复
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // 只有在加载完成后才检查用户状态
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, router, isLoading]);

  // 加载状态下返回null，避免重定向
  if (isLoading || !user) {
    return null;
  }

  return <>{children}</>;
}
