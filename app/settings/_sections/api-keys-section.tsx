"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
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
import { toast } from "sonner"
import { SCOPE_GROUPS, SCOPE_PRESETS, type ScopeKey } from "@/lib/api-key"
import { Plus, Key, Copy, Check, XCircle, Trash } from "@phosphor-icons/react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ApiKeyData {
  id: string
  name: string
  prefix: string
  scopes: string | string[]
  isActive: boolean
  lastUsedAt: string | null
  expiresAt: string | null
  createdAt: string
}

interface CreatedKeyResult {
  id: string
  name: string
  prefix: string
  scopes: string[]
  expiresAt: string | null
  fullKey: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseScopes(scopes: string | string[]): string[] {
  if (Array.isArray(scopes)) return scopes
  try {
    return JSON.parse(scopes) as string[]
  } catch {
    return []
  }
}

function formatDate(d: string | null): string {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt).getTime() < Date.now()
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ApiKeysSection() {
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [selectedScopes, setSelectedScopes] = useState<Set<ScopeKey>>(new Set())
  const [expiresIn, setExpiresIn] = useState("never")

  // Success dialog
  const [successOpen, setSuccessOpen] = useState(false)
  const [createdKey, setCreatedKey] = useState<CreatedKeyResult | null>(null)
  const [copied, setCopied] = useState(false)

  // Revoke dialog
  const [revokeTarget, setRevokeTarget] = useState<ApiKeyData | null>(null)

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<ApiKeyData | null>(null)

  // -----------------------------------------------------------------------
  // Fetch keys
  // -----------------------------------------------------------------------

  const fetchKeys = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/api-keys", {
        credentials: "include",
      })
      if (res.status === 401) {
        // Session expired — redirect to login
        localStorage.removeItem("geldborse_user")
        window.location.href = "/auth/login"
        return
      }
      if (!res.ok) throw new Error(`Failed to fetch (${res.status})`)
      const data = await res.json()
      setApiKeys(data.apiKeys ?? [])
    } catch (err) {
      if (err instanceof Error && err.message.startsWith("Failed to fetch (401)")) {
        localStorage.removeItem("geldborse_user")
        window.location.href = "/auth/login"
        return
      }
      toast.error("获取 API 密钥列表失败")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKeys()
  }, [])

  // -----------------------------------------------------------------------
  // Scope toggles
  // -----------------------------------------------------------------------

  const toggleScope = (scope: ScopeKey) => {
    setSelectedScopes((prev) => {
      const next = new Set(prev)
      if (next.has(scope)) next.delete(scope)
      else next.add(scope)
      return next
    })
  }

  const applyPreset = (presetKey: string) => {
    const preset = SCOPE_PRESETS[presetKey as keyof typeof SCOPE_PRESETS]
    if (!preset) return
    const resolved = preset.scopes.filter((s: string) => s.endsWith(":*")) as string[]
    const explicit = preset.scopes.filter((s) => !s.endsWith(":*")) as ScopeKey[]

    // Resolve wildcard presets into concrete scopes from SCOPE_GROUPS
    const concrete = new Set<ScopeKey>()
    for (const s of explicit) concrete.add(s)
    if (resolved.includes("read:*")) {
      for (const group of SCOPE_GROUPS) {
        for (const scope of group.scopes) {
          if (scope.endsWith(":read")) concrete.add(scope)
        }
      }
    }
    if (resolved.includes("write:*")) {
      for (const group of SCOPE_GROUPS) {
        for (const scope of group.scopes) {
          if (scope.endsWith(":write")) concrete.add(scope)
        }
      }
    }
    setSelectedScopes(concrete)
  }

  // -----------------------------------------------------------------------
  // Create key
  // -----------------------------------------------------------------------

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast.error("请输入密钥名称")
      return
    }
    if (selectedScopes.size === 0) {
      toast.error("请选择至少一个作用域")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: newName.trim(),
          scopes: Array.from(selectedScopes),
          expiresIn: expiresIn === "never" ? undefined : expiresIn,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "创建失败" }))
        throw new Error(err.error ?? `创建失败 (${res.status})`)
      }

      const result: CreatedKeyResult = await res.json()
      setCreatedKey(result)
      setCreateOpen(false)
      setSuccessOpen(true)
      setNewName("")
      setSelectedScopes(new Set())
      setExpiresIn("never")
      fetchKeys()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "创建失败")
    } finally {
      setSubmitting(false)
    }
  }

  // -----------------------------------------------------------------------
  // Revoke / Delete
  // -----------------------------------------------------------------------

  const handleRevoke = async () => {
    if (!revokeTarget) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/api-keys/${revokeTarget.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })
      if (!res.ok) throw new Error(`撤销失败 (${res.status})`)

      toast.success("密钥已撤销")
      setRevokeTarget(null)
      fetchKeys()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "撤销失败")
    } finally {
      setSubmitting(false)
    }
  }

  const handlePermanentDelete = async () => {
    if (!deleteTarget) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/api-keys/${deleteTarget.id}?permanent=true`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })
      if (!res.ok) throw new Error(`删除失败 (${res.status})`)

      toast.success("密钥已永久删除")
      setDeleteTarget(null)
      fetchKeys()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "删除失败")
    } finally {
      setSubmitting(false)
    }
  }

  // -----------------------------------------------------------------------
  // Copy
  // -----------------------------------------------------------------------

  const copyKey = async (fullKey: string) => {
    try {
      await navigator.clipboard.writeText(fullKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success("已复制到剪贴板")
    } catch {
      toast.error("复制失败")
    }
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading">API 密钥</h1>
          <p className="text-sm text-muted-foreground mt-1">
            管理用于外部集成的 API 密钥
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          创建密钥
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>密钥列表</CardTitle>
          <CardDescription>你的所有 API 密钥，最多存活 90 天</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              加载中...
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
              <Key className="h-10 w-10 opacity-40" />
              <p>暂无 API 密钥</p>
              <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
                创建第一个密钥
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>前缀</TableHead>
                  <TableHead>作用域</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>过期时间</TableHead>
                  <TableHead>最后使用</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => {
                  const scopes = parseScopes(key.scopes)
                  const expired = isExpired(key.expiresAt)
                  const active = key.isActive && !expired

                  return (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">{key.name}</TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                          {key.prefix}...
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {scopes.slice(0, 3).map((s) => (
                            <Badge key={s} variant="secondary" className="text-[11px]">
                              {s}
                            </Badge>
                          ))}
                          {scopes.length > 3 && (
                            <Badge variant="outline" className="text-[11px]">
                              +{scopes.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {active ? (
                          <Badge className="bg-success/15 text-success border-success/30 text-[11px]">
                            活跃
                          </Badge>
                        ) : expired ? (
                          <Badge variant="outline" className="text-muted-foreground text-[11px]">
                            已过期
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-alert border-alert/30 text-[11px]">
                            已撤销
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(key.expiresAt)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(key.lastUsedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {active && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setRevokeTarget(key)}
                              disabled={submitting}
                              title="撤销"
                            >
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          )}
                          {!active && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteTarget(key)}
                              disabled={submitting}
                              title="永久删除"
                            >
                              <Trash className="h-4 w-4 text-alert" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* Create dialog                                                    */}
      {/* ================================================================ */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>创建 API 密钥</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="key-name">密钥名称</Label>
              <Input
                id="key-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="例如：自动同步脚本"
              />
            </div>

            {/* Expiration */}
            <div className="space-y-2">
              <Label>过期时间</Label>
              <Select value={expiresIn} onValueChange={setExpiresIn}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">永不过期</SelectItem>
                  <SelectItem value="24h">24 小时</SelectItem>
                  <SelectItem value="7d">7 天</SelectItem>
                  <SelectItem value="30d">30 天</SelectItem>
                  <SelectItem value="90d">90 天</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <Label>快速预设</Label>
              <div className="flex gap-2">
                {Object.entries(SCOPE_PRESETS).map(([key, preset]) => (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset(key)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Scope groups */}
            <div className="space-y-3">
              <Label>权限作用域</Label>
              {SCOPE_GROUPS.map((group) => (
                <div key={group.key} className="space-y-1.5">
                  <p className="text-sm font-medium text-muted-foreground">
                    {group.label}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.scopes.map((scope) => {
                      const checked = selectedScopes.has(scope)
                      return (
                        <Badge
                          key={scope}
                          variant={checked ? "default" : "outline"}
                          className={`cursor-pointer select-none transition-colors text-[11px] ${
                            checked ? "" : "hover:border-foreground/50"
                          }`}
                          onClick={() => toggleScope(scope)}
                        >
                          {checked ? "✓ " : ""}
                          {scope}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? "创建中..." : "创建密钥"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================================ */}
      {/* Create success dialog                                            */}
      {/* ================================================================ */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>密钥创建成功</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              请立即复制并安全保存此密钥。关闭此对话框后将无法再次查看完整密钥。
            </p>
            {createdKey && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>名称</Label>
                  <p className="text-sm font-medium">{createdKey.name}</p>
                </div>
                <div className="space-y-1">
                  <Label>完整密钥</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded border bg-muted px-3 py-2 text-sm font-mono break-all select-all">
                      {createdKey.fullKey}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyKey(createdKey.fullKey)}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>作用域</Label>
                  <div className="flex flex-wrap gap-1">
                    {createdKey.scopes.map((s) => (
                      <Badge key={s} variant="secondary" className="text-[11px]">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setSuccessOpen(false)}>我已保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================================ */}
      {/* Revoke confirmation                                              */}
      {/* ================================================================ */}
      <AlertDialog
        open={!!revokeTarget}
        onOpenChange={(v) => !v && setRevokeTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>撤销 API 密钥</AlertDialogTitle>
            <AlertDialogDescription>
              确定要撤销密钥 <strong>{revokeTarget?.name}</strong> 吗？
              撤销后该密钥将无法继续使用，但你可以稍后永久删除它。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevoke} disabled={submitting}>
              确定撤销
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ================================================================ */}
      {/* Permanent delete confirmation                                    */}
      {/* ================================================================ */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>永久删除 API 密钥</AlertDialogTitle>
            <AlertDialogDescription>
              确定要永久删除密钥 <strong>{deleteTarget?.name}</strong> 吗？
              此操作不可撤销，该密钥将立即失效且无法恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePermanentDelete}
              disabled={submitting}
              className="bg-alert hover:bg-alert/90 text-white"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}