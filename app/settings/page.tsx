"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Toggle } from "@/components/ui/toggle"
import { useAuth } from "@/lib/auth-context"
import { generateRandomPresets, getAvatarUrl } from "@/lib/avatars"
import { toast } from "sonner"
import { ProtectedRoute } from "@/components/protected-route"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { UserIcon, ShieldIcon, DatabaseIcon, BellIcon, EyeIcon, SignOut, Users as UsersIcon, Plus, Pencil, Trash, MagnifyingGlass } from "@phosphor-icons/react"

interface MenuItem {
  id: string
  title: string
  icon: React.ReactNode
}

function SettingsContent() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name || "")
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreset, setAvatarPreset] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [clearPassword, setClearPassword] = useState("")
  const [loadingClear, setLoadingClear] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loadingPassword, setLoadingPassword] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [loadingSecurity, setLoadingSecurity] = useState(false)
  const [loginHistories, setLoginHistories] = useState<any[]>([])
  const [loadingHistories, setLoadingHistories] = useState(true)
  const [activeMenu, setActiveMenu] = useState("profile")
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [selectedPresetAvatar, setSelectedPresetAvatar] = useState<number | null>(null)
  const [avatarPresets, setAvatarPresets] = useState(() => generateRandomPresets())

  const [adminUsers, setAdminUsers] = useState<any[]>([])
  const [adminLoading, setAdminLoading] = useState(false)
  const [adminSearch, setAdminSearch] = useState("")
  const [adminPage, setAdminPage] = useState(1)
  const [adminPagination, setAdminPagination] = useState({ total: 0, totalPages: 0 })
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false)
  const [showEditUserDialog, setShowEditUserDialog] = useState(false)
  const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false)
  const [selectedAdminUser, setSelectedAdminUser] = useState<any>(null)
  const [adminDialogLoading, setAdminDialogLoading] = useState(false)
  const [adminFormData, setAdminFormData] = useState({ email: "", name: "", password: "", isAdmin: false })

  const menuItems: MenuItem[] = [
    { id: "profile", title: "个人资料", icon: <UserIcon className="h-4 w-4" /> },
    { id: "account", title: "账户安全", icon: <ShieldIcon className="h-4 w-4" /> },
    { id: "data", title: "数据管理", icon: <DatabaseIcon className="h-4 w-4" /> },
    { id: "notifications", title: "通知设置", icon: <BellIcon className="h-4 w-4" /> },
    { id: "privacy", title: "隐私设置", icon: <EyeIcon className="h-4 w-4" /> },
    ...(user?.isAdmin ? [{ id: "users", title: "用户管理", icon: <UsersIcon className="h-4 w-4" /> }] : []),
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!user) return

      const body: Record<string, unknown> = { name }

      if (avatarPreset) {
        const preset = avatarPresets.find(p => p.id === avatarPreset)
        if (preset) {
          body.avatarPresetUrl = getAvatarUrl(preset)
        }
      } else if (avatarFile) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(avatarFile)
        })
        body.avatarData = base64
        body.avatarType = avatarFile.type
      }

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.id}`
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || `更新失败 (${response.status})`)
      }

      const updatedData = await response.json()
      if (updatedData.user) {
        localStorage.setItem('geldborse_user', JSON.stringify(updatedData.user))
        window.location.reload()
      }

      toast.success("个人资料已更新")
    } catch (error) {
      console.error('保存失败:', error)
      toast.error(error instanceof Error ? error.message : "更新失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingPassword(true)

    if (newPassword !== confirmPassword) {
      toast.error("新密码和确认密码不一致")
      setLoadingPassword(false)
      return
    }

    try {
      if (!user) return

      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.id}`
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "密码修改失败")
      }

      toast.success("密码修改成功")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      toast.error(error.message || "密码修改失败，请重试")
    } finally {
      setLoadingPassword(false)
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

  const handleTwoFactorToggle = async () => {
    setLoadingSecurity(true)
    try {
      // 这里应该调用API来启用/禁用两步验证
      // 目前只是模拟
      setTwoFactorEnabled(!twoFactorEnabled)
      toast.success(twoFactorEnabled ? "两步验证已禁用" : "两步验证已启用")
    } catch (error) {
      toast.error("操作失败，请重试")
    } finally {
      setLoadingSecurity(false)
    }
  }

  const handleNotificationsToggle = async () => {
    setLoadingSecurity(true)
    try {
      // 这里应该调用API来启用/禁用通知
      // 目前只是模拟
      setNotificationsEnabled(!notificationsEnabled)
      toast.success(notificationsEnabled ? "通知已禁用" : "通知已启用")
    } catch (error) {
      toast.error("操作失败，请重试")
    } finally {
      setLoadingSecurity(false)
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

  const fetchAdminUsers = async (pageNum: number, searchQuery: string = "") => {
    setAdminLoading(true)
    try {
      const params = new URLSearchParams({ page: String(pageNum), limit: "20" })
      if (searchQuery) params.append("search", searchQuery)
      const res = await fetch(`/api/admin/users?${params}`, { credentials: "include" })
      if (!res.ok) throw new Error("获取用户列表失败")
      const data = await res.json()
      setAdminUsers(data.users)
      setAdminPagination({ total: data.pagination.total, totalPages: data.pagination.totalPages })
    } catch (error) {
      console.error("获取用户列表失败:", error)
      toast.error("获取用户列表失败")
    } finally {
      setAdminLoading(false)
    }
  }

  useEffect(() => {
    if (activeMenu === "users" && user?.isAdmin) {
      fetchAdminUsers(adminPage, adminSearch)
    }
  }, [activeMenu, user, adminPage])

  const handleAdminCreate = async () => {
    if (!adminFormData.email || !adminFormData.password) {
      toast.error("邮箱和密码不能为空")
      return
    }
    setAdminDialogLoading(true)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(adminFormData),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "创建用户失败")
      }
      toast.success("用户创建成功")
      setShowCreateUserDialog(false)
      setAdminFormData({ email: "", name: "", password: "", isAdmin: false })
      fetchAdminUsers(adminPage, adminSearch)
    } catch (error: any) {
      toast.error(error.message || "创建用户失败")
    } finally {
      setAdminDialogLoading(false)
    }
  }

  const handleAdminEdit = async () => {
    if (!selectedAdminUser) return
    setAdminDialogLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${selectedAdminUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: adminFormData.email, name: adminFormData.name, isAdmin: adminFormData.isAdmin }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "更新用户失败")
      }
      toast.success("用户更新成功")
      setShowEditUserDialog(false)
      setSelectedAdminUser(null)
      fetchAdminUsers(adminPage, adminSearch)
    } catch (error: any) {
      toast.error(error.message || "更新用户失败")
    } finally {
      setAdminDialogLoading(false)
    }
  }

  const handleAdminDelete = async () => {
    if (!selectedAdminUser) return
    setAdminDialogLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${selectedAdminUser.id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "删除用户失败")
      }
      toast.success("用户删除成功")
      setShowDeleteUserDialog(false)
      setSelectedAdminUser(null)
      fetchAdminUsers(adminPage, adminSearch)
    } catch (error: any) {
      toast.error(error.message || "删除用户失败")
    } finally {
      setAdminDialogLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        localStorage.removeItem('geldborse_user')
        window.location.href = '/auth/login'
      } else {
        toast.error('退出登录失败')
      }
    } catch (error) {
      console.error('退出登录失败:', error)
      toast.error('退出登录失败')
    }
  }

  // 组件挂载时获取登录历史
  useEffect(() => {
    fetchLoginHistories()
  }, [user])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-svh">
        <SiteHeader />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row gap-6">
            {/* 侧边栏菜单 */}
            <div className="md:w-64 flex-shrink-0">
              <div className="bg-card rounded-[16px] border p-4">
                <h2 className="text-lg font-semibold mb-4">设置</h2>
                <nav className="space-y-1">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveMenu(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${activeMenu === item.id
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted"
                        }`}
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* 内容区域 */}
            <div className="flex-1">
              {/* 个人资料 */}
{activeMenu === "profile" && (
    <Card>
      <CardHeader>
        <CardTitle>个人资料</CardTitle>
        <CardDescription>
          管理您的个人信息和账户设置
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 头像选择区域 */}
          <div className="space-y-2">
            <Label>头像</Label>
            <div className="flex items-center space-x-4">
                <div
                  className="relative cursor-pointer shrink-0"
                  onClick={() => setShowAvatarPicker(true)}
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="头像"
                      className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-accent border-2 border-primary flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
            
            {/* 头像选择器 */}
            <Dialog open={showAvatarPicker} onOpenChange={setShowAvatarPicker}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>选择头像</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* 上传自定义头像 */}
                  <div className="space-y-3">
                    <Label htmlFor="avatar-upload">上传自定义头像</Label>
                    <Input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                          if (!validTypes.includes(file.type)) {
                            toast.error('只支持JPEG, PNG, GIF和WebP格式');
                            return;
                          }

                          const maxSize = 5 * 1024 * 1024;
                          if (file.size > maxSize) {
                            toast.error('文件大小不能超过5MB');
                            return;
                          }

                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setAvatarPreview(event.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                          setAvatarFile(file);
                          setAvatarPreset(null);
                        }
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      支持JPEG, PNG, GIF, WebP格式，最大5MB
                    </p>
                  </div>

                  {/* 预设头像 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>选择系统头像</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAvatarPresets(generateRandomPresets())
                          setSelectedPresetAvatar(null)
                        }}
                        className="gap-1"
                      >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 2v6h-6" />
                          <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                          <path d="M3 22v-6h6" />
                          <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                        </svg>
                        换一批
                      </Button>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {avatarPresets.map((preset) => (
                        <button
                          key={`${preset.id}-${preset.seed}`}
                          onClick={() => {
                            setAvatarPreset(preset.id);
                            setAvatarFile(null);
                            setAvatarPreview(getAvatarUrl(preset));
                            setShowAvatarPicker(false);
                          }}
                          className={`w-14 h-14 rounded-full overflow-hidden border-2 ${selectedPresetAvatar === preset.id ? 'border-primary' : 'border-transparent'} hover:border-primary transition-colors`}
                        >
                          <img
                            src={getAvatarUrl(preset)}
                            alt={`头像 ${preset.id}`}
                            className="w-full h-full"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

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
        </div>
      </CardContent>
    </Card>
  )}

              {/* 账户安全 */}
              {activeMenu === "account" && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>密码设置</CardTitle>
                      <CardDescription>
                        修改您的账户密码
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">当前密码</Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="请输入当前密码"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="newPassword">新密码</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="请输入新密码"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">确认新密码</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="请再次输入新密码"
                            required
                          />
                        </div>

                        <Button type="submit" disabled={loadingPassword}>
                          {loadingPassword ? "修改中..." : "修改密码"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>安全设置</CardTitle>
                      <CardDescription>
                        管理您的账户安全设置
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">两步验证</h3>
                            <p className="text-sm text-muted-foreground">启用后，登录时需要输入验证码</p>
                          </div>
                          <Toggle
                            pressed={twoFactorEnabled}
                            onPressedChange={handleTwoFactorToggle}
                            disabled={loadingSecurity}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">安全通知</h3>
                            <p className="text-sm text-muted-foreground">接收账户安全相关的通知</p>
                          </div>
                          <Toggle
                            pressed={notificationsEnabled}
                            onPressedChange={handleNotificationsToggle}
                            disabled={loadingSecurity}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
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
                          <p className="text-muted-foreground">暂无登录记录</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {loginHistories.map((history) => (
                            <div key={history.id} className="flex items-center justify-between p-3 border rounded-md">
                              <div>
                                <p className="font-medium">{history.deviceInfo}</p>
                                <p className="text-sm text-muted-foreground">{new Date(history.loginAt).toLocaleString('zh-CN')}</p>
                                <p className="text-sm text-muted-foreground">{history.ip}</p>
                              </div>
                              {history.isCurrent ? (
                                <div className="text-success font-medium">当前会话</div>
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

                  <Card className="border-destructive/20">
                    <CardHeader>
                      <CardTitle className="text-destructive">退出登录</CardTitle>
                      <CardDescription>
                        安全退出当前账户
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={handleLogout}
                      >
                        <SignOut className="h-4 w-4 mr-2" />
                        退出登录
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* 数据管理 */}
              {activeMenu === "data" && (
                <Card className="border-destructive/20">
                  <CardHeader>
                    <CardTitle className="text-destructive">数据管理</CardTitle>
                    <CardDescription>
                      清空您的所有数据（此操作不可恢复）
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-destructive/10 rounded-[16px] border border-destructive/30">
                        <p className="text-sm text-destructive font-medium">
                        </p>
                        <p className="mt-2 text-sm text-destructive">
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
              )}

              {/* 通知设置 */}
              {activeMenu === "notifications" && (
                <Card>
                  <CardHeader>
                    <CardTitle>通知设置</CardTitle>
                    <CardDescription>
                      管理您的通知偏好
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">安全通知</h3>
                          <p className="text-sm text-muted-foreground">接收账户安全相关的通知</p>
                        </div>
                        <Toggle
                          pressed={notificationsEnabled}
                          onPressedChange={handleNotificationsToggle}
                          disabled={loadingSecurity}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">交易通知</h3>
                          <p className="text-sm text-muted-foreground">接收收支交易的通知</p>
                        </div>
                        <Toggle
                          pressed={notificationsEnabled}
                          onPressedChange={handleNotificationsToggle}
                          disabled={loadingSecurity}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 隐私设置 */}
              {activeMenu === "privacy" && (
                <Card>
                  <CardHeader>
                    <CardTitle>隐私设置</CardTitle>
                    <CardDescription>
                      管理您的隐私偏好
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                       目前暂无隐私设置选项，我们会在后续版本中添加更多隐私相关的功能。
                    </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 用户管理 */}
              {activeMenu === "users" && (
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle>用户列表</CardTitle>
                        <CardDescription>管理系统中的所有用户</CardDescription>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <form onSubmit={(e) => { e.preventDefault(); fetchAdminUsers(1, adminSearch) }} className="flex gap-2">
                          <Input
                            placeholder="搜索邮箱或名称..."
                            value={adminSearch}
                            onChange={(e) => setAdminSearch(e.target.value)}
                            className="w-[200px]"
                          />
                          <Button type="submit" variant="secondary" size="icon">
                            <MagnifyingGlass className="h-4 w-4" />
                          </Button>
                        </form>
                        <Button onClick={() => { setAdminFormData({ email: "", name: "", password: "", isAdmin: false }); setShowCreateUserDialog(true) }}>
                          <Plus className="h-4 w-4 mr-2" />
                          创建用户
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {adminLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <p>加载中...</p>
                      </div>
                    ) : adminUsers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <UsersIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">暂无用户</p>
                      </div>
                    ) : (
                      <>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>邮箱</TableHead>
                              <TableHead>名称</TableHead>
                              <TableHead>角色</TableHead>
                              <TableHead>创建时间</TableHead>
                              <TableHead className="text-right">操作</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {adminUsers.map((userItem) => (
                              <TableRow key={userItem.id}>
                                <TableCell className="font-mono text-sm">{userItem.email}</TableCell>
                                <TableCell>{userItem.name || "-"}</TableCell>
                                <TableCell>
                                  {userItem.isAdmin ? (
                                    <Badge variant="destructive">管理员</Badge>
                                  ) : (
                                    <Badge variant="outline">用户</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {new Date(userItem.createdAt).toLocaleDateString("zh-CN")}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => { setSelectedAdminUser(userItem); setAdminFormData({ email: userItem.email, name: userItem.name || "", password: "", isAdmin: userItem.isAdmin }); setShowEditUserDialog(true) }}>
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    {userItem.id !== user?.id && (
                                      <Button variant="ghost" size="icon" onClick={() => { setSelectedAdminUser(userItem); setShowDeleteUserDialog(true) }}>
                                        <Trash className="h-4 w-4 text-destructive" />
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>

                        {adminPagination.totalPages > 1 && (
                          <div className="flex items-center justify-center gap-2 mt-4">
                            <Button variant="outline" size="sm" disabled={adminPage === 1} onClick={() => setAdminPage(adminPage - 1)}>上一页</Button>
                            <span className="text-sm text-muted-foreground">第 {adminPage} / {adminPagination.totalPages} 页</span>
                            <Button variant="outline" size="sm" disabled={adminPage === adminPagination.totalPages} onClick={() => setAdminPage(adminPage + 1)}>下一页</Button>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Dialogs */}
              <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>创建用户</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-email">邮箱</Label>
                      <Input id="new-email" type="email" value={adminFormData.email} onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })} placeholder="user@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-name">名称</Label>
                      <Input id="new-name" value={adminFormData.name} onChange={(e) => setAdminFormData({ ...adminFormData, name: e.target.value })} placeholder="用户名称（可选）" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">密码</Label>
                      <Input id="new-password" type="password" value={adminFormData.password} onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })} placeholder="输入密码" />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="new-isAdmin" checked={adminFormData.isAdmin} onChange={(e) => setAdminFormData({ ...adminFormData, isAdmin: e.target.checked })} className="rounded" />
                      <Label htmlFor="new-isAdmin">设为管理员</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateUserDialog(false)}>取消</Button>
                    <Button onClick={handleAdminCreate} disabled={adminDialogLoading}>{adminDialogLoading ? "创建中..." : "创建"}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>编辑用户</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-email">邮箱</Label>
                      <Input id="edit-email" type="email" value={adminFormData.email} onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">名称</Label>
                      <Input id="edit-name" value={adminFormData.name} onChange={(e) => setAdminFormData({ ...adminFormData, name: e.target.value })} />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="edit-isAdmin" checked={adminFormData.isAdmin} onChange={(e) => setAdminFormData({ ...adminFormData, isAdmin: e.target.checked })} className="rounded" />
                      <Label htmlFor="edit-isAdmin">管理员</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowEditUserDialog(false)}>取消</Button>
                    <Button onClick={handleAdminEdit} disabled={adminDialogLoading}>{adminDialogLoading ? "保存中..." : "保存"}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <AlertDialog open={showDeleteUserDialog} onOpenChange={setShowDeleteUserDialog}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>确认删除</AlertDialogTitle>
                    <AlertDialogDescription>
                      确定要删除用户 "{selectedAdminUser?.email}" 吗？此操作不可撤销。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction onClick={handleAdminDelete} className="bg-destructive hover:bg-destructive/90">删除</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
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
