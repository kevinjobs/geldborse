"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import {
  Plus, Pencil, Trash, MagnifyingGlass, Users as UsersIcon,
} from "@phosphor-icons/react"
import { useAuth } from "@/lib/auth-context"

interface UserItem {
  id: string; email: string; name: string | null; avatar: string | null
  isAdmin: boolean; createdAt: string
}

export default function AdminSection() {
  const { user } = useAuth()
  const [adminUsers, setAdminUsers] = useState<UserItem[]>([])
  const [adminLoading, setAdminLoading] = useState(false)
  const [adminSearch, setAdminSearch] = useState("")
  const [adminPage, setAdminPage] = useState(1)
  const [adminPagination, setAdminPagination] = useState({ total: 0, totalPages: 0 })
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false)
  const [showEditUserDialog, setShowEditUserDialog] = useState(false)
  const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false)
  const [selectedAdminUser, setSelectedAdminUser] = useState<UserItem | null>(null)
  const [adminDialogLoading, setAdminDialogLoading] = useState(false)
  const [adminFormData, setAdminFormData] = useState({ email: "", name: "", password: "", isAdmin: false })

  const fetchAdminUsers = async (pageNum: number, searchQuery = "") => {
    setAdminLoading(true)
    try {
      const params = new URLSearchParams({ page: String(pageNum), limit: "20" })
      if (searchQuery) params.append("search", searchQuery)
      const res = await fetch(`/api/admin/users?${params}`, { credentials: "include" })
      if (!res.ok) throw new Error("获取用户列表失败")
      const data = await res.json()
      setAdminUsers(data.users)
      setAdminPagination({ total: data.pagination.total, totalPages: data.pagination.totalPages })
    } catch { toast.error("获取用户列表失败") }
    finally { setAdminLoading(false) }
  }

  const handleAdminCreate = async () => {
    if (!adminFormData.email || !adminFormData.password) { toast.error("邮箱和密码不能为空"); return }
    setAdminDialogLoading(true)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify(adminFormData),
      })
      if (!res.ok) { const error = await res.json(); throw new Error(error.error || "创建用户失败") }
      toast.success("用户创建成功"); setShowCreateUserDialog(false)
      setAdminFormData({ email: "", name: "", password: "", isAdmin: false })
      fetchAdminUsers(adminPage, adminSearch)
    } catch (error: any) { toast.error(error.message || "创建用户失败") }
    finally { setAdminDialogLoading(false) }
  }

  const handleAdminEdit = async () => {
    if (!selectedAdminUser) return
    setAdminDialogLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${selectedAdminUser.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ email: adminFormData.email, name: adminFormData.name, isAdmin: adminFormData.isAdmin }),
      })
      if (!res.ok) { const error = await res.json(); throw new Error(error.error || "更新用户失败") }
      toast.success("用户更新成功"); setShowEditUserDialog(false); setSelectedAdminUser(null)
      fetchAdminUsers(adminPage, adminSearch)
    } catch (error: any) { toast.error(error.message || "更新用户失败") }
    finally { setAdminDialogLoading(false) }
  }

  const handleAdminDelete = async () => {
    if (!selectedAdminUser) return
    setAdminDialogLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${selectedAdminUser.id}`, { method: "DELETE", credentials: "include" })
      if (!res.ok) { const error = await res.json(); throw new Error(error.error || "删除用户失败") }
      toast.success("用户删除成功"); setShowDeleteUserDialog(false); setSelectedAdminUser(null)
      fetchAdminUsers(adminPage, adminSearch)
    } catch (error: any) { toast.error(error.message || "删除用户失败") }
    finally { setAdminDialogLoading(false) }
  }

  useEffect(() => { fetchAdminUsers(adminPage, adminSearch) }, [adminPage])
  useEffect(() => { setAdminPage(1) }, [adminSearch])

  if (!user?.isAdmin) return null

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div><CardTitle>用户列表</CardTitle><CardDescription>管理系统中的所有用户</CardDescription></div>
          <div className="flex flex-col sm:flex-row gap-2">
            <form onSubmit={(e) => { e.preventDefault(); fetchAdminUsers(1, adminSearch) }} className="flex gap-2">
              <Input placeholder="搜索邮箱或名称..." value={adminSearch} onChange={(e) => setAdminSearch(e.target.value)} className="w-[200px]" />
              <Button type="submit" variant="secondary" size="icon"><MagnifyingGlass className="h-4 w-4" /></Button>
            </form>
            <Button onClick={() => { setAdminFormData({ email: "", name: "", password: "", isAdmin: false }); setShowCreateUserDialog(true) }}>
              <Plus className="h-4 w-4 mr-2" />创建用户
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {adminLoading ? (
          <div className="flex items-center justify-center py-8"><p>加载中...</p></div>
        ) : adminUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <UsersIcon className="h-12 w-12 text-muted-foreground mb-4" /><p className="text-muted-foreground">暂无用户</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow><TableHead>邮箱</TableHead><TableHead>名称</TableHead><TableHead>角色</TableHead><TableHead>创建时间</TableHead><TableHead className="text-right">操作</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {adminUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-mono text-sm">{u.email}</TableCell>
                    <TableCell>{u.name || "-"}</TableCell>
                    <TableCell>{u.isAdmin ? <Badge variant="destructive">管理员</Badge> : <Badge variant="outline">用户</Badge>}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(u.createdAt).toLocaleDateString("zh-CN")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedAdminUser(u); setAdminFormData({ email: u.email, name: u.name || "", password: "", isAdmin: u.isAdmin }); setShowEditUserDialog(true) }}><Pencil className="h-4 w-4" /></Button>
                        {u.id !== user?.id && <Button variant="ghost" size="icon" onClick={() => { setSelectedAdminUser(u); setShowDeleteUserDialog(true) }}><Trash className="h-4 w-4 text-destructive" /></Button>}
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

      <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>创建用户</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label htmlFor="new-email">邮箱</Label><Input id="new-email" type="email" value={adminFormData.email} onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })} placeholder="user@example.com" /></div>
            <div className="space-y-2"><Label htmlFor="new-name">名称</Label><Input id="new-name" value={adminFormData.name} onChange={(e) => setAdminFormData({ ...adminFormData, name: e.target.value })} placeholder="用户名称（可选）" /></div>
            <div className="space-y-2"><Label htmlFor="new-password">密码</Label><Input id="new-password" type="password" value={adminFormData.password} onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })} placeholder="输入密码" /></div>
            <div className="flex items-center gap-2"><input type="checkbox" id="new-isAdmin" checked={adminFormData.isAdmin} onChange={(e) => setAdminFormData({ ...adminFormData, isAdmin: e.target.checked })} className="rounded" /><Label htmlFor="new-isAdmin">设为管理员</Label></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowCreateUserDialog(false)}>取消</Button><Button onClick={handleAdminCreate} disabled={adminDialogLoading}>{adminDialogLoading ? "创建中..." : "创建"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>编辑用户</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label htmlFor="edit-email">邮箱</Label><Input id="edit-email" type="email" value={adminFormData.email} onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="edit-name">名称</Label><Input id="edit-name" value={adminFormData.name} onChange={(e) => setAdminFormData({ ...adminFormData, name: e.target.value })} /></div>
            <div className="flex items-center gap-2"><input type="checkbox" id="edit-isAdmin" checked={adminFormData.isAdmin} onChange={(e) => setAdminFormData({ ...adminFormData, isAdmin: e.target.checked })} className="rounded" /><Label htmlFor="edit-isAdmin">管理员</Label></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowEditUserDialog(false)}>取消</Button><Button onClick={handleAdminEdit} disabled={adminDialogLoading}>{adminDialogLoading ? "保存中..." : "保存"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteUserDialog} onOpenChange={setShowDeleteUserDialog}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>确认删除</AlertDialogTitle><AlertDialogDescription>确定要删除用户 "{selectedAdminUser?.email}" 吗？此操作不可撤销。</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel><AlertDialogAction onClick={handleAdminDelete} className="bg-destructive hover:bg-destructive/90">删除</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}