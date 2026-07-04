"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Toggle } from "@/components/ui/toggle"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import {
  SignOut, Monitor, DeviceMobile, DeviceTablet,
  CaretDown, Shield,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

/* ─── Types ─────────────────────────────────────────── */

interface Session {
  id: string
  ip: string
  loginAt: string
  isCurrent: boolean
}

interface Device {
  fingerprint: string
  deviceName: string
  browser: string
  os: string
  location: string | null
  lastLoginAt: string
  isCurrent: boolean
  sessions: Session[]
}

/* ─── Constants ─────────────────────────────────────── */

const BROWSER_COLORS: Record<string, string> = {
  chrome: "#4285F4",
  firefox: "#FF7139",
  safari: "#006CFF",
  edge: "#0078D7",
}

/* ─── Helpers ───────────────────────────────────────── */

function DeviceIcon({ os }: { os: string }) {
  const lower = os.toLowerCase()
  if (lower.includes("ios") || lower.includes("android"))
    return <DeviceMobile className="size-4 text-muted-foreground" />
  if (lower.includes("ipad") || lower.includes("tablet"))
    return <DeviceTablet className="size-4 text-muted-foreground" />
  return <Monitor className="size-4 text-muted-foreground" />
}

function formatRelativeTime(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 0) return "刚刚"
  if (diff < 60) return "刚刚"
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  if (diff < 604800) return `${Math.floor(diff / 86400)}天前`
  return new Date(dateStr).toLocaleDateString("zh-CN")
}

function formatLastUpdated(date: Date): string {
  const diff = (Date.now() - date.getTime()) / 1000
  if (diff < 60) return "刚刚"
  return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
}

/* ─── Component ─────────────────────────────────────── */

export default function SecuritySection() {
  const { user } = useAuth()

  /* ── Password change state (unchanged) ── */
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loadingPassword, setLoadingPassword] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)

  /* ── Security settings state (unchanged) ── */
  const [twoFactorEnabled] = useState(false)
  const [notificationsEnabled] = useState(true)

  /* ── Login history state ── */
  const [devices, setDevices] = useState<Device[]>([])
  const [loadingDevices, setLoadingDevices] = useState(true)
  const [expandedDevices, setExpandedDevices] = useState<Set<string>>(new Set())
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    type: "single" | "all"
    targetId?: string
  } | null>(null)

  /* ── Password handlers (unchanged) ── */
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error("新密码和确认密码不一致")
      return
    }
    setLoadingPassword(true)
    try {
      if (!user) return
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
      setShowPasswordDialog(false)
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "密码修改失败，请重试"
      toast.error(msg)
    } finally {
      setLoadingPassword(false)
    }
  }

  /* ── Login history handlers ── */
  const fetchDevices = useCallback(
    async ({ showLoading = false } = {}) => {
      if (!user) return
      if (showLoading) setLoadingDevices(true)
      try {
        const res = await fetch("/api/auth/login-history", { credentials: "include" })
        if (!res.ok) {
          setDevices([])
          return
        }
        const data = await res.json()
        setDevices(data.devices ?? [])
        setLastUpdated(new Date())
      } catch {
        setDevices([])
      } finally {
        if (showLoading) setLoadingDevices(false)
      }
    },
    [user],
  )

  const toggleExpand = useCallback((fingerprint: string) => {
    setExpandedDevices((prev) => {
      const next = new Set(prev)
      if (next.has(fingerprint)) next.delete(fingerprint)
      else next.add(fingerprint)
      return next
    })
  }, [])

  const handleLogoutSession = async (sessionId: string) => {
    try {
      const res = await fetch("/api/auth/login-history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: sessionId }),
      })
      if (res.ok) {
        toast.success("会话已登出")
        fetchDevices()
      } else {
        toast.error("登出失败，请重试")
      }
    } catch {
      toast.error("登出失败，请重试")
    }
  }

  const handleLogoutAllOtherSessions = async () => {
    try {
      const res = await fetch("/api/auth/login-history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ all: true }),
      })
      if (res.ok) {
        toast.success("所有其他设备已登出")
        fetchDevices()
      } else {
        toast.error("登出失败，请重试")
      }
    } catch {
      toast.error("登出失败，请重试")
    }
  }

  /* ── Logout (unchanged) ── */
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" })
      if (response.ok) {
        localStorage.removeItem("geldborse_user")
        window.location.href = "/auth/login"
      } else {
        toast.error("退出登录失败")
      }
    } catch {
      toast.error("退出登录失败")
    }
  }

  /* ── Derived ── */
  const sortedDevices = [...devices].sort((a, b) => {
    if (a.isCurrent) return -1
    if (b.isCurrent) return 1
    return new Date(b.lastLoginAt).getTime() - new Date(a.lastLoginAt).getTime()
  })

  const hasOtherDevices = devices.some((d) => !d.isCurrent)

  /* ── Auto-refresh: poll every 30s, only when visible ── */
  useEffect(() => {
    if (!user) return

    fetchDevices({ showLoading: true })

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchDevices()
      }
    }, 30_000)

    return () => clearInterval(interval)
  }, [user, fetchDevices])

  /* ── Confirm dialog handler ── */
  const handleConfirmAction = () => {
    if (confirmDialog?.type === "all") handleLogoutAllOtherSessions()
    else if (confirmDialog?.targetId) handleLogoutSession(confirmDialog.targetId)
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  /* ── Render ────────────────────────────────────────── */
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  return (
    <div className="space-y-6">
      {/* ═══ 修改密码 ═══ */}
      <Card>
        <CardHeader>
          <CardTitle>修改密码</CardTitle>
          <CardDescription>请先输入当前密码，再设置新密码</CardDescription>
        </CardHeader>
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowPasswordDialog(false)}>
                取消
              </Button>
              <Button type="submit" disabled={loadingPassword}>
                {loadingPassword ? "修改中..." : "修改密码"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══ 安全设置 ═══ */}
      <Card>
        <CardHeader>
          <CardTitle>安全设置</CardTitle>
          <CardDescription>管理您的账户安全设置</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">
                  两步验证 <span className="text-xs text-muted-foreground">（即将推出）</span>
                </h3>
                <p className="text-sm text-muted-foreground">启用后，登录时需要输入验证码</p>
              </div>
              <Toggle pressed={twoFactorEnabled} disabled />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">
                  安全通知 <span className="text-xs text-muted-foreground">（即将推出）</span>
                </h3>
                <p className="text-sm text-muted-foreground">接收账户安全相关的通知</p>
              </div>
              <Toggle pressed={notificationsEnabled} disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══ 登录历史（重新设计） ═══ */}
      <Card>
        <CardHeader>
          <CardTitle>登录历史</CardTitle>
          <CardDescription>管理设备上的活跃会话</CardDescription>
          {hasOtherDevices && (
            <CardAction>
              <Button
                variant="destructive"
                size="sm"
                className="text-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  setConfirmDialog({ type: "all" })
                }}
              >
                登出所有其他设备
              </Button>
            </CardAction>
          )}
        </CardHeader>
        <CardContent>
          {loadingDevices ? (
            /* ── Loading skeleton ── */
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-[#2C2C2E] bg-muted/50 px-4 py-3"
                >
                  <Skeleton className="size-2.5 rounded-full shrink-0" />
                  <Skeleton className="size-4 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-md shrink-0" />
                </div>
              ))}
            </div>
          ) : sortedDevices.length === 0 ? (
            /* ── Empty state ── */
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="size-12 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
                <Shield className="size-6 text-muted-foreground/40" weight="light" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">暂无登录记录</p>
              <p className="text-xs text-muted-foreground/60 mt-1">您的登录历史将在此显示</p>
            </div>
          ) : (
            /* ── Device list ── */
            <div className="space-y-3">
              {sortedDevices.map((device) => {
                const isExpanded = expandedDevices.has(device.fingerprint)

                return (
                  <div key={device.fingerprint} className="group/device">
                    {/* ── Device row (clickable) ── */}
                    <div
                      className={cn(
                        "flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors",
                        device.isCurrent
                          ? "border-success/30 bg-success/[0.03] hover:bg-success/[0.06]"
                          : "border-[#2C2C2E] bg-muted/50 hover:bg-muted",
                      )}
                      onClick={() => toggleExpand(device.fingerprint)}
                    >
                      {/* Browser color dot */}
                      <div
                        className="shrink-0 size-2.5 rounded-full"
                        style={{ backgroundColor: BROWSER_COLORS[device.browser] || "#98989D" }}
                      />

                      {/* Device type icon */}
                      <div className="shrink-0">
                        <DeviceIcon os={device.os} />
                      </div>

                      {/* Device info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate leading-tight">{device.deviceName}</p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 flex-wrap">
                          {device.location && <span className="truncate">{device.location}</span>}
                          {device.location && (
                            <span className="text-muted-foreground/40 shrink-0">·</span>
                          )}
                          <span className="shrink-0">{formatRelativeTime(device.lastLoginAt)}</span>
                          {device.sessions.length > 1 && (
                            <>
                              <span className="text-muted-foreground/40 shrink-0">·</span>
                              <Badge variant="outline" className="text-[10px] px-1.5 shrink-0">
                                {device.sessions.length}个会话
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right: current badge or logout */}
                      <div
                        className="flex items-center gap-2 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {device.isCurrent ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20">
                            <div className="size-1.5 rounded-full bg-success" />
                            <span className="text-[11px] font-medium text-success">当前设备</span>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 px-2.5 text-xs"
                            onClick={() => {
                              const currentSession = device.sessions.find((s) => s.isCurrent)
                              const targetId = currentSession?.id || device.sessions[0]?.id
                              if (targetId) setConfirmDialog({ type: "single", targetId })
                            }}
                          >
                            登出
                          </Button>
                        )}
                      </div>

                      {/* Expand caret */}
                      <div className="shrink-0 text-muted-foreground/40 group-hover/device:text-muted-foreground transition-colors">
                        <CaretDown
                          className={cn(
                            "size-3.5 transition-transform duration-200",
                            isExpanded && "rotate-180",
                          )}
                        />
                      </div>
                    </div>

                    {/* ── Expanded sessions ── */}
                    <div
                      className={cn(
                        "grid transition-[grid-template-rows,opacity] duration-200 ease-in-out",
                        isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <div className="ml-12 pl-4 border-l border-[#2C2C2E] py-2 space-y-1">
                          {device.sessions
                            .slice()
                            .sort(
                              (a, b) =>
                                new Date(b.loginAt).getTime() - new Date(a.loginAt).getTime(),
                            )
                            .map((session) => (
                              <div
                                key={session.id}
                                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <span className="font-mono text-xs text-muted-foreground shrink-0">
                                    {session.ip}
                                  </span>
                                  <span className="text-xs text-muted-foreground shrink-0">
                                    {formatRelativeTime(session.loginAt)}
                                  </span>
                                  {session.isCurrent && (
                                    <span className="text-[10px] font-medium text-success bg-success/10 px-1.5 py-0.5 rounded shrink-0">
                                      当前
                                    </span>
                                  )}
                                </div>
                                {!session.isCurrent && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-6 px-2 text-xs shrink-0"
                                    onClick={() =>
                                      setConfirmDialog({ type: "single", targetId: session.id })
                                    }
                                  >
                                    登出
                                  </Button>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Last updated timestamp */}
          {lastUpdated && (
            <p className="text-[10px] text-muted-foreground/50 text-right mt-4 select-none">
              最后更新: {formatLastUpdated(lastUpdated)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* ═══ Shared confirmation dialog (single session) ═══ */}
      {confirmDialog?.type === "single" && (
        <AlertDialog
          open={confirmDialog.type === "single"}
          onOpenChange={(open) => !open && setConfirmDialog(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确定要登出此会话吗？</AlertDialogTitle>
              <AlertDialogDescription>此会话将被立即终止，需要重新登录。</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={handleConfirmAction}>
                确定登出
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* ═══ Shared confirmation dialog (all other sessions) ═══ */}
      {confirmDialog?.type === "all" && (
        <AlertDialog
          open={confirmDialog.type === "all"}
          onOpenChange={(open) => !open && setConfirmDialog(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确定要登出所有其他设备吗？</AlertDialogTitle>
              <AlertDialogDescription>
                此操作不可撤销，所有其他设备上的会话将被立即终止。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={handleConfirmAction}>
                确定登出
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* ═══ 退出登录 ═══ */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">退出登录</CardTitle>
          <CardDescription>安全退出当前账户</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" className="w-full" onClick={handleLogout}>
            <SignOut className="h-4 w-4 mr-2" />
            退出登录
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
