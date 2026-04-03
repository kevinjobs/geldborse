"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
  const [editAmount, setEditAmount] = useState("")
  const [editType, setEditType] = useState("EXPENSE")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [recordsRes, accountsRes] = await Promise.all([
        fetch("/api/records"),
        fetch("/api/accounts"),
      ])
      const recordsData = await recordsRes.json()
      const accountsData = await accountsRes.json()
      setRecords(recordsData)
      setAccounts(accountsData)
    } catch (error) {
      console.error("获取数据失败:", error)
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
      const res = await fetch(`/api/records/${selectedRecord.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: editDate,
          accountId: editAccount,
          amount: editAmount,
          type: editType,
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
      const res = await fetch(`/api/records/${selectedRecord.id}`, {
        method: "DELETE",
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
      <SidebarInset>
        <SiteHeader />
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <p>加载中...</p>
          </div>
        ) : (
        <div className="flex flex-1 flex-col">
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
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>日期</TableHead>
                            <TableHead>账户</TableHead>
                            <TableHead>类型</TableHead>
                            <TableHead className="text-right">金额</TableHead>
                            <TableHead className="text-right">操作</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortedRecords.map((record) => {
                            const nameColor = getAccountNameColor(record.account.name)
                            return (
                              <TableRow key={record.id} className={`${nameColor.bgColor} dark:${nameColor.darkBgColor}`}>
                                <TableCell>{formatDate(record.date)}</TableCell>
                                <TableCell>
                                  <AccountDisplay name={record.account.name} type={record.account.type} variant="compact" />
                                </TableCell>
                                <TableCell>
                                  <Badge variant={record.type === "INCOME" ? "default" : "secondary"}>
                                    {record.type === "INCOME" ? "收入" : "支出"}
                                  </Badge>
                                </TableCell>
                                <TableCell className={`text-right font-medium ${record.amount >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                  {formatAmount(record.amount)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mr-2"
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
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
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
