"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  getAccountNameColor,
  getAccountTypeConfig,
  AccountDisplay
} from "@/lib/account-config"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

interface Account {
  id: string
  name: string
  type: string
}

interface Asset {
  id: string
  name: string
  type: string
  amount: number
}

export default function AddRecordPage() {
  const { user } = useAuth()
  const [date, setDate] = useState("")
  const [account, setAccount] = useState("")
  const [asset, setAsset] = useState("")
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [type, setType] = useState("EXPENSE")
  const [accounts, setAccounts] = useState<Account[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (user) {
      fetchAccounts()
    }
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const today = `${year}-${month}-${day}`
    setDate(today)
  }, [user])

  const fetchAccounts = async () => {
    try {
      // 构建请求头
      const headers = user?.id ? { 'Authorization': `Bearer ${user.id}` } : undefined

      const res = await fetch("/api/accounts", headers ? { headers } : {})
      const data = await res.json()
      // 确保data是一个数组
      if (Array.isArray(data)) {
        setAccounts(data)
      } else {
        console.error("获取账户列表失败: 响应数据不是数组")
        setAccounts([])
      }
    } catch (error) {
      console.error("获取账户列表失败:", error)
      setAccounts([])
    }
  }

  const fetchAssets = async (accountId: string) => {
    try {
      const headers = user?.id ? { 'Authorization': `Bearer ${user.id}` } : undefined

      const res = await fetch(`/api/accounts/${accountId}/assets`, headers ? { headers } : {})
      const data = await res.json()
      if (Array.isArray(data)) {
        setAssets(data)
      } else {
        console.error("获取资产列表失败: 响应数据不是数组")
        setAssets([])
      }
    } catch (error) {
      console.error("获取资产列表失败:", error)
      setAssets([])
    }
  }

  useEffect(() => {
    if (account) {
      fetchAssets(account)
      setAsset("")
    } else {
      setAssets([])
      setAsset("")
    }
  }, [account])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !account || !amount) {
      alert("请填写所有字段")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(user?.id ? { 'Authorization': `Bearer ${user.id}` } : {})
        },
        body: JSON.stringify({ date, accountId: account, assetId: asset || null, amount, type, note: note || null }),
      })
      if (res.ok) {
        alert("收支保存成功")
        setAmount("")
        setNote("")
        setAsset("")
      } else {
        const errorData = await res.json().catch(() => ({ error: "保存失败" }))
        alert(errorData.error || "保存失败")
      }
    } catch (error) {
      console.error("保存收支失败:", error)
      alert("保存失败")
    } finally {
      setLoading(false)
    }
  }

  const selectedAccount = accounts.find((a) => a.id === account)

  return (
    <SidebarProvider>
      <AppSidebar variant="sidebar" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <Card className="max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle>添加收支</CardTitle>
                    <CardDescription>记录一笔收入或支出</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!mounted ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">加载中...</p>
                      </div>
                    ) : accounts.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">您还没有创建任何账户</p>
                        <Link href="/accounts">
                          <Button>前往创建账户</Button>
                        </Link>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="date">日期</Label>
                          <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="account">账户</Label>
                          <Select value={account} onValueChange={setAccount}>
                            <SelectTrigger id="account" className="w-full">
                              <SelectValue placeholder="选择账户">
                                {selectedAccount && (
                                  <AccountDisplay name={selectedAccount.name} type={selectedAccount.type} variant="compact" />
                                )}
                              </SelectValue>
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

                        {assets.length > 0 && (
                          <div className="space-y-2">
                            <Label htmlFor="asset">资产（可选）</Label>
                            <Select value={asset || "none"} onValueChange={(value) => setAsset(value === "none" ? "" : value)}>
                              <SelectTrigger id="asset" className="w-full">
                                <SelectValue placeholder="选择资产" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">不选择资产</SelectItem>
                                {assets.map((ast) => (
                                  <SelectItem key={ast.id} value={ast.id}>
                                    {ast.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="type">类型</Label>
                          <Select value={type} onValueChange={setType}>
                            <SelectTrigger id="type" className="w-full">
                              <SelectValue placeholder="选择类型" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="EXPENSE">支出</SelectItem>
                              <SelectItem value="INCOME">收入</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="amount">金额</Label>
                          <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            placeholder="请输入金额（正数）"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="note">备注（可选）</Label>
                          <Input
                            id="note"
                            type="text"
                            placeholder="请输入备注"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full"
                          />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? "保存中..." : "保存收支"}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
