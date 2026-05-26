'use client'

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { ProtectedRoute } from "@/components/protected-route"
import { Plus, Pencil, Trash, MagnifyingGlass, Users as UsersIcon, ArrowLeft } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"

interface UserItem {
  id: string
  email: string
  name: string | null
  avatar: string | null
  isAdmin: boolean
  createdAt: string
  accounts?: { id: string; name: string; type: string }[]
  _count?: { accounts: number; loginHistories: number }
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

function AdminContent() {
  const router = useRouter()
  const { user } = useAuth()
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [page, setPage] = useState(1)

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null)
  const [dialogLoading, setDialogLoading] = useState(false)

  const [formData, setFormData] = useState({ email: "", name: "", password: "", isAdmin: false })

  const fetchUsers = async (pageNum: number, searchQuery: string = "") => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(pageNum), limit: "20" })
      if (searchQuery) params.append("search", searchQuery)

      const res = await fetch(`/api/admin/users?${params}`, { credentials: "include" })
      if (!res.ok) {
        if (res.status === 403) {
          toast.error("无权限访问")
          router.push("/")
          return
        }
        throw new Error("获取用户列表失败")
      }
      const data = await res.json()
      setUsers(data.users)
      setPagination(data.pagination)
    } catch (error) {
      console.error("获取用户列表失败:", error)
      toast.error("获取用户列表失败")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.isAdmin) {
      fetchUsers(page, search)
    }
  }, [user, page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchUsers(1, search)
  }

  const handleCreate = async () => {
    if (!formData.email || !formData.password) {
      toast.error("邮箱和密码不能为空")
      return
    }

    setDialogLoading(true)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "创建用户失败")
      }

      toast.success("用户创建成功")
      setShowCreateDialog(false)
      setFormData({ email: "", name: "", password: "", isAdmin: false })
      fetchUsers(page, search)
    } catch (error: any) {
      toast.error(error.message || "创建用户失败")
    } finally {
      setDialogLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedUser) return

    setDialogLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: formData.email, name: formData.name, isAdmin: formData.isAdmin }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "更新用户失败")
      }

      toast.success("用户更新成功")
      setShowEditDialog(false)
      setSelectedUser(null)
      fetchUsers(page, search)
    } catch (error: any) {
      toast.error(error.message || "更新用户失败")
    } finally {
      setDialogLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedUser) return

    setDialogLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "删除用户失败")
      }

      toast.success("用户删除成功")
      setShowDeleteDialog(false)
      setSelectedUser(null)
      fetchUsers(page, search)
    } catch (error: any) {
      toast.error(error.message || "删除用户失败")
    } finally {
      setDialogLoading(false)
    }
  }

  const openEditDialog = (userItem: UserItem) => {
    setSelectedUser(userItem)
    setFormData({ email: userItem.email, name: userItem.name || "", password: "", isAdmin: userItem.isAdmin })
    setShowEditDialog(true)
  }

  const openDeleteDialog = (userItem: UserItem) => {
    setSelectedUser(userItem)
    setShowDeleteDialog(true)
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-6">
          <div className="max-w-6xl mx-auto w-full">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" size="icon" onClick={() => router.push("/settings")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold">用户管理</h1>
            </div>

            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>用户列表</CardTitle>
                    <CardDescription>管理系统中的所有用户</CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <form onSubmit={handleSearch} className="flex gap-2">
                      <Input
                        placeholder="搜索邮箱或名称..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-[200px]"
                      />
                      <Button type="submit" variant="secondary" size="icon">
                        <MagnifyingGlass className="h-4 w-4" />
                      </Button>
                    </form>
                    <Button onClick={() => { setFormData({ email: "", name: "", password: "", isAdmin: false }); setShowCreateDialog(true) }}>
                      <Plus className="h-4 w-4 mr-2" />
                      创建用户
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <p>加载中...</p>
                  </div>
                ) : users.length === 0 ? (
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
                          <TableHead>账户数</TableHead>
                          <TableHead>创建时间</TableHead>
                          <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((userItem) => (
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
                            <TableCell>{userItem._count?.accounts || 0}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(userItem.createdAt).toLocaleDateString("zh-CN")}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(userItem)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                {userItem.id !== user?.id && (
                                  <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(userItem)}>
                                    <Trash className="h-4 w-4 text-destructive" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {pagination.totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page === 1}
                          onClick={() => setPage(page - 1)}
                        >
                          上一页
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          第 {page} / {pagination.totalPages} 页
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page === pagination.totalPages}
                          onClick={() => setPage(page + 1)}
                        >
                          下一页
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建用户</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">名称</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="用户名称（可选）"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="输入密码"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isAdmin"
                checked={formData.isAdmin}
                onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="isAdmin">设为管理员</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              取消
            </Button>
            <Button onClick={handleCreate} disabled={dialogLoading}>
              {dialogLoading ? "创建中..." : "创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑用户</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-email">邮箱</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">名称</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-isAdmin"
                checked={formData.isAdmin}
                onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="edit-isAdmin">管理员</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              取消
            </Button>
            <Button onClick={handleEdit} disabled={dialogLoading}>
              {dialogLoading ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除用户 "{selectedUser?.email}" 吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  )
}

export default function AdminPage() {
  const { user } = useAuth()

  if (!user?.isAdmin) {
    return null
  }

  return (
    <ProtectedRoute>
      <AdminContent />
    </ProtectedRoute>
  )
}