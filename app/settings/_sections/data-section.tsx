"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function DataSection() {
  const { user } = useAuth()
  const [clearPassword, setClearPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleClearData = async () => {
    if (!clearPassword || !user) return
    setLoading(true)
    try {
      const response = await fetch("/api/clear-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: clearPassword }),
      })
      if (!response.ok) { const errorData = await response.json().catch(() => ({})); throw new Error(errorData.error || "清空失败") }
      toast.success("数据已成功清空！", { duration: 3000, onAutoClose: () => window.location.reload() })
      setClearPassword("")
    } catch (error) { toast.error((error as Error).message || "清空失败，请重试") }
    finally { setLoading(false) }
  }

  return (
    <Card className="border-destructive/20">
      <CardHeader><CardTitle className="text-destructive">清空所有数据</CardTitle><CardDescription>清空您的所有数据（此操作不可恢复）</CardDescription></CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-destructive/10 rounded-[16px] border border-destructive/30">
            <p className="text-sm text-destructive font-medium">请谨慎操作，数据删除后无法恢复。</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="clear-password">输入密码确认</Label>
            <Input id="clear-password" type="password" placeholder="请输入您的密码" value={clearPassword} onChange={(e) => setClearPassword(e.target.value)} />
          </div>
          <Button variant="destructive" onClick={handleClearData} disabled={loading || !clearPassword}>
            {loading ? "清空中..." : "一键清空数据库"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}