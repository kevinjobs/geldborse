"use client"

import * as React from "react"

// 简单的主题提供者，避免使用next-themes库导致的脚本标签问题
export function ThemeProvider({
  children,
  ...props
}: any) {
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme')
      document.documentElement.classList.toggle('dark', savedTheme !== 'light')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
      const handleThemeChange = (e: MediaQueryListEvent) => {
        if (!localStorage.getItem('theme')) {
          document.documentElement.classList.toggle('dark', e.matches)
        }
      }
      prefersDark.addEventListener('change', handleThemeChange)
      return () => prefersDark.removeEventListener('change', handleThemeChange)
    }
  }, [])

  return <>{children}</>
}
