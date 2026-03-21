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

interface Account {
  id: string
  name: string
  type: string
}

export default function AddRecordPage() {
  const [date, setDate] = useState("")
  const [account, setAccount] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState("EXPENSE")
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchAccounts()
    const today = new Date().toISOString().split("T")[0]
    setDate(today)
  }, [])

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/accounts")
      const data = await res.json()
      setAccounts(data)
    } catch (error) {
      console.error("获取账户列表失败:", error)
    }
  }

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, accountId: account, amount, type }),
      })
      if (res.ok) {
        alert("收支保存成功")
        setAmount("")
      } else {
        alert("保存失败")
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

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "保存中..." : "保存收支"}
                      </Button>
                    </form>
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
