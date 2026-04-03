"use client"

import * as React from "react"

// 简单的主题提供者，避免使用next-themes库导致的脚本标签问题
export function ThemeProvider({
  children,
  ...props
}: any) {
  React.useEffect(() => {
    // 只在客户端执行主题相关的逻辑
    if (typeof window !== 'undefined') {
      // 检查用户的主题偏好
      const savedTheme = localStorage.getItem('theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light')
      
      // 设置初始主题
      document.documentElement.classList.toggle('dark', initialTheme === 'dark')
      
      // 监听主题变化
      const handleThemeChange = (e: MediaQueryListEvent) => {
        if (!localStorage.getItem('theme')) {
          document.documentElement.classList.toggle('dark', e.matches)
        }
      }
      
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleThemeChange)
      
      return () => {
        window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handleThemeChange)
      }
    }
  }, [])

  return <>{children}</>
}
