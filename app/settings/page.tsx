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
