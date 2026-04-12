"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveTable, ResponsiveTableBody, ResponsiveTableCell, ResponsiveTableHeader, ResponsiveTableRow } from "@/components/responsive-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  getAccountNameColor,
  getAccountTypeConfig,
  AccountDisplay
} from "@/lib/account-config"

interface Account {
  id: string
  name: string
  type: string
}

interface Record {
  id: string
  date: string
  amount: number
  type: string
  accountId: string
  account: Account
  assetId: string | null
  asset: {
    id: string
    name: string
    type: string
  } | null
  note: string | null
  createdAt: string
  updatedAt: string
}

export default function RecordsPage() {
  const [records, setRecords] = useState<Record[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null)
  const [editDate, setEditDate] = useState("")
  const [editAccount, setEditAccount] = useState("")
  const [editAsset, setEditAsset] = useState("")
  const [editAmount, setEditAmount] = useState("")
  const [editNote, setEditNote] = useState("")
  const [editType, setEditType] = useState("EXPENSE")
  const [editAssets, setEditAssets] = useState<{ id: string; name: string; type: string; amount: number }[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchAssets = async (accountId: string) => {
    try {
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('geldborse_user') : null
      const userData = storedUser ? JSON.parse(storedUser) : null
      const authToken = userData?.id

      const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : undefined

      const res = await fetch(`/api/accounts/${accountId}/assets`, headers ? { headers } : {})
      const data = await res.json()
      if (Array.isArray(data)) {
        setEditAssets(data)
      } else {
        console.error("获取资产列表失败: 响应数据不是数组")
        setEditAssets([])
      }
    } catch (error) {
      console.error("获取资产列表失败:", error)
      setEditAssets([])
    }
  }

  useEffect(() => {
    if (editAccount) {
      fetchAssets(editAccount)
      setEditAsset("")
    } else {
      setEditAssets([])
      setEditAsset("")
    }
  }, [editAccount])

  const fetchData = async () => {
    try {
      // 获取用户认证信息
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('geldborse_user') : null
      const userData = storedUser ? JSON.parse(storedUser) : null
      const authToken = userData?.id

      // 构建请求头
      const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : undefined

      const [recordsRes, accountsRes] = await Promise.all([
        fetch("/api/records", headers ? { headers } : {}),
        fetch("/api/accounts", headers ? { headers } : {}),
      ])
      const recordsData = await recordsRes.json()
      const accountsData = await accountsRes.json()
      // 确保recordsData是一个数组
      if (Array.isArray(recordsData)) {
        setRecords(recordsData)
      } else {
        console.error("获取记录列表失败: 响应数据不是数组")
        setRecords([])
      }
      // 确保accountsData是一个数组
      if (Array.isArray(accountsData)) {
        setAccounts(accountsData)
      } else {
        console.error("获取账户列表失败: 响应数据不是数组")
        setAccounts([])
      }
    } catch (error) {
      console.error("获取数据失败:", error)
      setRecords([])
      setAccounts([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("zh-CN")
  }

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("zh-CN", {
      style: "currency",
      currency: "CNY",
    })
  }

  const handleEdit = (record: Record) => {
    setSelectedRecord(record)
    setEditDate(record.date.split("T")[0])
    setEditAccount(record.accountId)
    setEditAsset(record.assetId || "")
    setEditNote(record.note || "")
    setEditAmount(Math.abs(record.amount).toString())
    setEditType(record.type)
    setEditDialogOpen(true)
  }

  const handleDelete = (record: Record) => {
    setSelectedRecord(record)
    setDeleteDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedRecord || !editDate || !editAccount || !editAmount) {
      alert("请填写所有字段")
      return
    }

    setSaving(true)
    try {
      // 获取用户认证信息
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('geldborse_user') : null
      const userData = storedUser ? JSON.parse(storedUser) : null
      const authToken = userData?.id

      const res = await fetch(`/api/records/${selectedRecord.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          date: editDate,
          accountId: editAccount,
          assetId: editAsset || null,
          amount: editAmount,
          type: editType,
          note: editNote || null,
        }),
      })
      if (res.ok) {
        setEditDialogOpen(false)
        fetchData()
      } else {
        alert("保存失败")
      }
    } catch (error) {
      console.error("保存失败:", error)
      alert("保存失败")
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedRecord) return

    setSaving(true)
    try {
      // 获取用户认证信息
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('geldborse_user') : null
      const userData = storedUser ? JSON.parse(storedUser) : null
      const authToken = userData?.id

      const res = await fetch(`/api/records/${selectedRecord.id}`, {
        method: "DELETE",
        headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
      })
      if (res.ok) {
        setDeleteDialogOpen(false)
        fetchData()
      } else {
        alert("删除失败")
      }
    } catch (error) {
      console.error("删除失败:", error)
      alert("删除失败")
    } finally {
      setSaving(false)
    }
  }

  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <SidebarProvider>
      <AppSidebar variant="sidebar" />
      <SidebarInset className="flex flex-col h-svh">
        <SiteHeader />
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <p>加载中...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-4 lg:px-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>收支列表</CardTitle>
                          <CardDescription>管理所有收支明细</CardDescription>
                        </div>
                        <Button onClick={() => window.location.href = "/record/add"}>
                          添加收支
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {sortedRecords.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          暂无收支记录
                        </p>
                      ) : (
                        <>
                          {/* 桌面端表格视图 */}
                          <div className="hidden md:block">
                            <ResponsiveTable>
                              <thead>
                                <ResponsiveTableRow>
                                  <ResponsiveTableHeader>日期</ResponsiveTableHeader>
                                  <ResponsiveTableHeader>账户</ResponsiveTableHeader>
                                  <ResponsiveTableHeader>资产</ResponsiveTableHeader>
                                  <ResponsiveTableHeader>类型</ResponsiveTableHeader>
                                  <ResponsiveTableHeader className="text-right">金额</ResponsiveTableHeader>
                                  <ResponsiveTableHeader>备注</ResponsiveTableHeader>
                                  <ResponsiveTableHeader className="text-right">操作</ResponsiveTableHeader>
                                </ResponsiveTableRow>
                              </thead>
                              <ResponsiveTableBody>
                                {sortedRecords.map((record) => {
                                  const nameColor = getAccountNameColor(record.account.name)
                                  return (
                                    <ResponsiveTableRow key={record.id} className={`${nameColor.bgColor} dark:${nameColor.darkBgColor}`}>
                                      <ResponsiveTableCell mobileLabel="日期">{formatDate(record.date)}</ResponsiveTableCell>
                                      <ResponsiveTableCell mobileLabel="账户">
                                        <AccountDisplay name={record.account.name} type={record.account.type} variant="compact" />
                                      </ResponsiveTableCell>
                                      <ResponsiveTableCell mobileLabel="资产">
                                        {record.asset ? (
                                          <span className="text-sm">{record.asset.name}</span>
                                        ) : (
                                          <span className="text-sm text-muted-foreground">-</span>
                                        )}
                                      </ResponsiveTableCell>
                                      <ResponsiveTableCell mobileLabel="类型">
                                        <Badge variant={record.type === "INCOME" ? "default" : "secondary"}>
                                          {record.type === "INCOME" ? "收入" : "支出"}
                                        </Badge>
                                      </ResponsiveTableCell>
                                      <ResponsiveTableCell mobileLabel="金额" className={`text-right font-medium ${record.amount >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                        {formatAmount(record.amount)}
                                      </ResponsiveTableCell>
                                      <ResponsiveTableCell mobileLabel="备注">
                                        {record.note ? (
                                          <span className="text-sm">{record.note}</span>
                                        ) : (
                                          <span className="text-sm text-muted-foreground">-</span>
                                        )}
                                      </ResponsiveTableCell>
                                      <ResponsiveTableCell mobileLabel="操作" className="text-right">
                                        <div className="flex flex-col sm:flex-row gap-1 justify-end">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(record)}
                                          >
                                            编辑
                                          </Button>
                                          <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(record)}
                                          >
                                            删除
                                          </Button>
                                        </div>
                                      </ResponsiveTableCell>
                                    </ResponsiveTableRow>
                                  )
                                })}
                              </ResponsiveTableBody>
                            </ResponsiveTable>
                          </div>
                          {/* 移动端卡片视图 - 使用总览页面同款设计 */}
                          <div className="md:hidden space-y-3">
                            {sortedRecords.length === 0 ? (
                              <div className="text-center text-muted-foreground py-8">
                                暂无收支记录
                              </div>
                            ) : (
                              sortedRecords.map((record) => (
                                <div key={record.id} className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-4">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                      <Badge variant={record.type === "INCOME" ? "default" : "destructive"}>
                                        {record.type === "INCOME" ? "收入" : "支出"}
                                      </Badge>
                                      <span className="text-sm text-muted-foreground">{formatDate(record.date)}</span>
                                    </div>
                                    <div className={"text-lg font-medium " + (record.amount >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                                      {formatAmount(record.amount)}
                                    </div>
                                  </div>
                                  {/* 账户名和操作按钮放在同一行 */}
                                  <div className="flex justify-between items-center mb-2">
                                    <div className="text-sm text-muted-foreground">
                                      <AccountDisplay name={record.account.name} type={record.account.type} variant="compact" />
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2 text-xs"
                                        onClick={() => handleEdit(record)}
                                      >
                                        编辑
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                                        onClick={() => handleDelete(record)}
                                      >
                                        删除
                                      </Button>
                                    </div>
                                  </div>
                                  {/* 资产/备注信息 */}
                                  {(record.asset || record.note) && (
                                    <div className="text-xs text-muted-foreground">
                                      {record.asset && (
                                        <span>资产: {record.asset.name}</span>
                                      )}
                                      {record.asset && record.note && (
                                        <span className="mx-1">|</span>
                                      )}
                                      {record.note && (
                                        <span>备注: {record.note}</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        )}
      </SidebarInset>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑收支</DialogTitle>
            <DialogDescription>修改收支信息</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editDate">日期</Label>
              <Input
                id="editDate"
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editAccount">账户</Label>
              <Select value={editAccount} onValueChange={setEditAccount}>
                <SelectTrigger id="editAccount">
                  <SelectValue placeholder="选择账户" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      <AccountDisplay name={acc.name} type={acc.type} variant="compact" />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {editAssets.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="editAsset">资产（可选）</Label>
                <Select value={editAsset || "none"} onValueChange={(value) => setEditAsset(value === "none" ? "" : value)}>
                  <SelectTrigger id="editAsset">
                    <SelectValue placeholder="选择资产" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">不选择资产</SelectItem>
                    {editAssets.map((ast) => (
                      <SelectItem key={ast.id} value={ast.id}>
                        {ast.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="editType">类型</Label>
              <Select value={editType} onValueChange={setEditType}>
                <SelectTrigger id="editType">
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPENSE">支出</SelectItem>
                  <SelectItem value="INCOME">收入</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editAmount">金额</Label>
              <Input
                id="editAmount"
                type="number"
                step="0.01"
                placeholder="请输入金额（正数）"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editNote">备注（可选）</Label>
              <Input
                id="editNote"
                type="text"
                placeholder="请输入备注"
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除这条收支记录吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={saving}>
              {saving ? "删除中..." : "删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
