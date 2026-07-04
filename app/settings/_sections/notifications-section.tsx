"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell } from "@phosphor-icons/react"

export default function NotificationsSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>通知偏好</CardTitle><CardDescription>管理您的通知偏好</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div><h3 className="font-medium">安全通知</h3><p className="text-sm text-muted-foreground">接收账户安全相关的通知</p></div>
              <Badge variant="outline" className="text-xs">即将推出</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div><h3 className="font-medium">交易通知</h3><p className="text-sm text-muted-foreground">接收收支交易的通知</p></div>
              <Badge variant="outline" className="text-xs">即将推出</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Bell className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">通知功能正在开发中，敬请期待</p>
      </div>
    </div>
  )
}