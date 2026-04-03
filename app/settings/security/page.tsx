'use client'

import { useState } from "react"
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <p className="font-medium">Chrome on Windows</p>
                      <p className="text-sm text-gray-500">2024-01-01 12:00:00</p>
                      <p className="text-sm text-gray-500">192.168.1.1</p>
                    </div>
                    <div className="text-green-600 font-medium">当前会话</div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <p className="font-medium">Safari on macOS</p>
                      <p className="text-sm text-gray-500">2023-12-31 18:30:00</p>
                      <p className="text-sm text-gray-500">10.0.0.1</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      登出
                    </Button>
                  </div>
                </div>
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
