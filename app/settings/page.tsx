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
import { toast } from "sonner"
import { ProtectedRoute } from "@/components/protected-route"
import { UserIcon, ShieldIcon, DatabaseIcon, BellIcon, EyeIcon, Log } from "@phosphor-icons/react"

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

  const menuItems: MenuItem[] = [
    { id: "profile", title: "个人资料", icon: <UserIcon className="h-4 w-4" /> },
    { id: "account", title: "账户安全", icon: <ShieldIcon className="h-4 w-4" /> },
    { id: "data", title: "数据管理", icon: <DatabaseIcon className="h-4 w-4" /> },
    { id: "notifications", title: "通知设置", icon: <BellIcon className="h-4 w-4" /> },
    { id: "privacy", title: "隐私设置", icon: <EyeIcon className="h-4 w-4" /> },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!user) return

      const formData = new FormData()
      formData.append('name', name)
      
      if (avatarFile) {
        formData.append('avatar', avatarFile)
      }

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        // 不设置Content-Type，让浏览器自动设置为multipart/form-data
        headers: {
          "Authorization": `Bearer ${user.id}`
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error("更新失败")
      }

      // 更新本地存储中的用户信息
      const updatedData = await response.json()
      if (updatedData.user) {
        // 更新本地存储
        localStorage.setItem('geldborse_user', JSON.stringify(updatedData.user))
        // 重新加载页面以显示更新后的数据
        window.location.reload()
      }

      toast.success("个人资料已更新")
    } catch (error) {
      toast.error("更新失败，请重试")
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
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={avatarPreview || '/default-avatar.png'}
                  alt="头像"
                  className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                  onClick={() => setShowAvatarPicker(true)}
                  style={{ cursor: 'pointer' }}
                />
                {!avatarPreview && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <UserIcon className="h-6 w-6 text-white" />
                  </div>
                )}
                {showAvatarPicker && (
                  <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    +
                  </div>
                )}
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
            </div>
            
            {/* 头像选择器 */}
            {showAvatarPicker && (
              <div className="border rounded-[16px] p-4 bg-[#1E1E1E]">
                <h3 className="font-medium mb-4">选择头像</h3>
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
                          // 验证文件类型和大小
                          const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                          if (!validTypes.includes(file.type)) {
                            toast.error('只支持JPEG, PNG, GIF和WebP格式');
                            return;
                          }
                          
                          const maxSize = 5 * 1024 * 1024; // 5MB
                          if (file.size > maxSize) {
                            toast.error('文件大小不能超过5MB');
                            return;
                          }
                          
                          // 预览图片
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setAvatarPreview(event.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                          
                          // 存储文件以便提交
                          setAvatarFile(file);
                        }
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      支持JPEG, PNG, GIF, WebP格式，最大5MB
                    </p>
                  </div>
                  
                  {/* 预设头像 */}
                  <div className="space-y-3">
                    <Label>选择系统头像</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {/* 生成16个预设头像 */}
                      {Array.from({ length: 16 }, (_, i) => i + 1).map((index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setAvatarPreset(index);
                            setAvatarPreview(`/avatars/avatar-${index}.png`);
                            setShowAvatarPicker(false);
                          }}
                          className={`w-10 h-10 rounded-full border-2 ${selectedPresetAvatar === index ? 'border-primary' : 'border-transparent'} hover:border-primary transition-colors cursor-pointer`}
                        >
                          <img
                            src={`/avatars/avatar-${index}.png`}
                            alt={`头像 ${index}`}
                            className="w-full h-full rounded-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      点击选择预设头像
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowAvatarPicker(false)}
                      size="sm"
                    >
                      取消
                    </Button>
                    <Button
                      onClick={() => {
                        setShowAvatarPicker(false);
                      }}
                      size="sm"
                    >
                      确定
                    </Button>
                  </div>
                </div>
              </div>
            )}
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
                            <p className="text-sm text-gray-500">启用后，登录时需要输入验证码</p>
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
                            <p className="text-sm text-gray-500">接收账户安全相关的通知</p>
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
                        <Log className="h-4 w-4 mr-2" />
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
                      <div className="p-4 bg-[#3A1C1C] rounded-[16px] border border-[#FF453A]/30">
                        <p className="text-sm text-[#FF453A] font-medium">
                        </p>
                        <p className="mt-2 text-sm text-[#FF453A]">
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
                          <p className="text-sm text-gray-500">接收账户安全相关的通知</p>
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
                          <p className="text-sm text-gray-500">接收收支交易的通知</p>
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
                      <p className="text-sm text-gray-500">
                        目前暂无隐私设置选项，我们会在后续版本中添加更多隐私相关的功能。
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
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
