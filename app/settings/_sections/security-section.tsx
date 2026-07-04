"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Toggle } from "@/components/ui/toggle"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { SignOut } from "@phosphor-icons/react"

export default function SecuritySection() {
  const { user } = useAuth()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loadingPassword, setLoadingPassword] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)

  const [twoFactorEnabled] = useState(false)
  const [notificationsEnabled] = useState(true)

  const [loginHistories, setLoginHistories] = useState<any[]>([])
  const [loadingHistories, setLoadingHistories] = useState(true)

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) { toast.error("新密码和确认密码不一致"); return }
    setLoadingPassword(true)
    try {
      if (!user) return
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      if (!response.ok) { const error = await response.json(); throw new Error(error.error || "密码修改失败") }
      toast.success("密码修改成功")
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("")
      setShowPasswordDialog(false)
    } catch (error: any) { toast.error(error.message || "密码修改失败，请重试") }
    finally { setLoadingPassword(false) }
  }

  const fetchLoginHistories = async () => {
    if (!user) return
    setLoadingHistories(true)
    try {
      const res = await fetch("/api/auth/login-history", { credentials: 'include' })
      if (!res.ok) { setLoginHistories([]); return }
      const data = await res.json()
      setLoginHistories(Array.isArray(data) ? data : [])
    } catch { setLoginHistories([]) }
    finally { setLoadingHistories(false) }
  }

  const handleLogoutSession = async (id: string) => {
    if (!user) return
    try {
      const res = await fetch("/api/auth/login-history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ id }),
      })
      if (res.ok) { toast.success("登出成功"); fetchLoginHistories() }
      else toast.error("登出失败，请重试")
    } catch { toast.error("登出失败，请重试") }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" })
      if (response.ok) { localStorage.removeItem("geldborse_user"); window.location.href = "/auth/login" }
      else toast.error("退出登录失败")
    } catch { toast.error("退出登录失败") }
  }

  useEffect(() => { fetchLoginHistories() }, [user])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>修改密码</CardTitle><CardDescription>请先输入当前密码，再设置新密码</CardDescription></CardHeader>
        <CardContent>
          <Button onClick={() => setShowPasswordDialog(true)}>修改密码</Button>
        </CardContent>
      </Card>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>修改密码</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">当前密码</Label>
              <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="请输入当前密码" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">新密码</Label>
              <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="请输入新密码" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认新密码</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="请再次输入新密码" required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowPasswordDialog(false)}>取消</Button>
              <Button type="submit" disabled={loadingPassword}>{loadingPassword ? "修改中..." : "修改密码"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader><CardTitle>安全设置</CardTitle><CardDescription>管理您的账户安全设置</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div><h3 className="font-medium">两步验证 <span className="text-xs text-muted-foreground">（即将推出）</span></h3><p className="text-sm text-muted-foreground">启用后，登录时需要输入验证码</p></div>
              <Toggle pressed={twoFactorEnabled} disabled />
            </div>
            <div className="flex items-center justify-between">
              <div><h3 className="font-medium">安全通知 <span className="text-xs text-muted-foreground">（即将推出）</span></h3><p className="text-sm text-muted-foreground">接收账户安全相关的通知</p></div>
              <Toggle pressed={notificationsEnabled} disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>登录历史</CardTitle><CardDescription>最近的登录记录</CardDescription></CardHeader>
        <CardContent>
          {loadingHistories ? (
            <div className="flex items-center justify-center py-8"><p>加载中...</p></div>
          ) : loginHistories.length === 0 ? (
            <div className="flex items-center justify-center py-8"><p className="text-muted-foreground">暂无登录记录</p></div>
          ) : (
            <div className="space-y-4">
              {loginHistories.map((h) => (
                <div key={h.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <p className="font-medium">{h.deviceInfo}</p>
                    <p className="text-sm text-muted-foreground">{new Date(h.loginAt).toLocaleString("zh-CN")}</p>
                    <p className="text-sm text-muted-foreground">{h.ip}</p>
                  </div>
                  {h.isCurrent ? <div className="text-success font-medium">当前会话</div> : <Button variant="ghost" size="sm" onClick={() => handleLogoutSession(h.id)}>登出</Button>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-destructive/20">
        <CardHeader><CardTitle className="text-destructive">退出登录</CardTitle><CardDescription>安全退出当前账户</CardDescription></CardHeader>
        <CardContent>
          <Button variant="destructive" className="w-full" onClick={handleLogout}><SignOut className="h-4 w-4 mr-2" />退出登录</Button>
        </CardContent>
      </Card>
    </div>
  )
}