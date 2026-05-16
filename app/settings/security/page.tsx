'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { ProtectedRoute } from "@/components/protected-route"

function SecurityContent() {
  const router = useRouter()
  const { user } = useAuth()
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const [loginHistories, setLoginHistories] = useState<any[]>([])
  const [loadingHistories, setLoadingHistories] = useState(true)

  const handleTwoFactorToggle = async () => {
    setLoading(true)
    try {
      // 这里应该调用API来启用/禁用两步验证
      // 目前只是模拟
      setTwoFactorEnabled(!twoFactorEnabled)
      toast.success(twoFactorEnabled ? "两步验证已禁用" : "两步验证已启用")
    } catch (error) {
      toast.error("操作失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationsToggle = async () => {
    setLoading(true)
    try {
      // 这里应该调用API来启用/禁用通知
      // 目前只是模拟
      setNotificationsEnabled(!notificationsEnabled)
      toast.success(notificationsEnabled ? "通知已禁用" : "通知已启用")
    } catch (error) {
      toast.error("操作失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  const fetchLoginHistories = async () => {
    if (!user) return

    setLoadingHistories(true)
    try {
      // 获取用户认证信息
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('geldborse_user') : null
      const userData = storedUser ? JSON.parse(storedUser) : null
      const authToken = userData?.id // 使用用户ID作为临时token

      // 构建请求头
      const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : undefined

      const res = await fetch("/api/auth/login-history", headers ? { headers } : {})
      
      // 检查响应是否成功
      if (!res.ok) {
        console.error("获取登录历史失败: 响应状态", res.status)
        setLoginHistories([])
        return
      }
      
      const data = await res.json()
      // 确保data是一个数组
      if (Array.isArray(data)) {
        setLoginHistories(data)
      } else {
        console.error("获取登录历史失败: 响应数据不是数组")
        setLoginHistories([])
      }
    } catch (error) {
      console.error("获取登录历史失败:", error)
      setLoginHistories([])
    } finally {
      setLoadingHistories(false)
    }
  }

  const handleLogoutSession = async (id: string) => {
    if (!user) return

    try {
      // 获取用户认证信息
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('geldborse_user') : null
      const userData = storedUser ? JSON.parse(storedUser) : null
      const authToken = userData?.id // 使用用户ID作为临时token

      // 构建请求头
      const headers: HeadersInit = authToken ? {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      } : {
        'Content-Type': 'application/json'
      }

      const res = await fetch("/api/auth/login-history", {
        method: "DELETE",
        headers,
        body: JSON.stringify({ id })
      })

      if (res.ok) {
        toast.success("登出成功")
        // 重新获取登录历史
        fetchLoginHistories()
      } else {
        toast.error("登出失败，请重试")
      }
    } catch (error) {
      console.error("登出失败:", error)
      toast.error("登出失败，请重试")
    }
  }

  // 组件挂载时获取登录历史
  useEffect(() => {
    fetchLoginHistories()
  }, [user])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-6">
          <div className="max-w-2xl mx-auto w-full">
            <h1 className="text-3xl font-bold mb-6">安全设置</h1>
            
            <Card>
              <CardHeader>
                <CardTitle>账户安全</CardTitle>
                <CardDescription>
                  管理您的账户安全设置
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">两步验证</h3>
                      <p className="text-sm text-gray-500">启用后，登录时需要输入验证码</p>
                    </div>
                    <Toggle
                      pressed={twoFactorEnabled}
                      onPressedChange={handleTwoFactorToggle}
                      disabled={loading}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">安全通知</h3>
                      <p className="text-sm text-gray-500">接收账户安全相关的通知</p>
                    </div>
                    <Toggle
                      pressed={notificationsEnabled}
                      onPressedChange={handleNotificationsToggle}
                      disabled={loading}
                    />
                  </div>

                  <Button variant="outline" onClick={() => router.push("/settings/password")}>
                    修改密码
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>登录历史</CardTitle>
                <CardDescription>
                  最近的登录记录
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingHistories ? (
                  <div className="flex items-center justify-center py-8">
                    <p>加载中...</p>
                  </div>
                ) : loginHistories.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-gray-500">暂无登录记录</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {loginHistories.map((history) => (
                      <div key={history.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <p className="font-medium">{history.deviceInfo}</p>
                          <p className="text-sm text-gray-500">{new Date(history.loginAt).toLocaleString('zh-CN')}</p>
                          <p className="text-sm text-gray-500">{history.ip}</p>
                        </div>
                        {history.isCurrent ? (
                          <div className="text-[#32D74B] font-medium">当前会话</div>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleLogoutSession(history.id)}
                          >
                            登出
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function SecurityPage() {
  return (
    <ProtectedRoute>
      <SecurityContent />
    </ProtectedRoute>
  )
}
