"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { ProtectedRoute } from "@/components/protected-route"

function SettingsContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [name, setName] = useState(user?.name || "")
  const [loading, setLoading] = useState(false)
  const [clearPassword, setClearPassword] = useState("")
  const [loadingClear, setLoadingClear] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) {
        throw new Error("更新失败")
      }

      toast.success("个人资料已更新")
    } catch (error) {
      toast.error("更新失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  const handleClearData = async () => {
    if (!clearPassword || !user) return

    setLoadingClear(true)
    try {
      // 构建请求头
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.id}`
      }

      const response = await fetch("/api/clear-data", {
        method: "POST",
        headers,
        body: JSON.stringify({ password: clearPassword }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "清空失败")
      }

      const result = await response.json()

      // 显示成功提示
      toast.success("数据已成功清空！", {
        duration: 3000, // 延长提示显示时间
        onAutoClose: () => {
          // 提示关闭后再刷新页面
          window.location.reload()
        }
      })

      setClearPassword("")
    } catch (error) {
      toast.error((error as Error).message || "清空失败，请重试")
    } finally {
      setLoadingClear(false)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-6">
          <div className="max-w-2xl mx-auto w-full">
            <h1 className="text-3xl font-bold mb-6">设置</h1>

            <Card>
              <CardHeader>
                <CardTitle>个人资料</CardTitle>
                <CardDescription>
                  管理您的个人信息和账户设置
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground">
                      邮箱地址无法修改
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">昵称</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="请输入您的昵称"
                    />
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? "保存中..." : "保存更改"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>账户安全</CardTitle>
                <CardDescription>
                  管理您的密码和账户安全设置
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={() => router.push("/settings/password")}>
                  修改密码
                </Button>
              </CardContent>
            </Card>

            <Card className="mt-6 border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive">数据管理</CardTitle>
                <CardDescription>
                  清空您的所有数据（此操作不可恢复）
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                      警告：此操作将永久删除您的所有数据，包括账户、资产、收支记录和快照。
                    </p>
                    <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                      请谨慎操作，数据删除后无法恢复。
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clear-password">输入密码确认</Label>
                    <Input
                      id="clear-password"
                      type="password"
                      placeholder="请输入您的密码"
                      value={clearPassword}
                      onChange={(e) => setClearPassword(e.target.value)}
                    />
                  </div>

                  <Button
                    variant="destructive"
                    onClick={handleClearData}
                    disabled={loadingClear || !clearPassword}
                  >
                    {loadingClear ? "清空ing..." : "一键清空数据库"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  )
}
