"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye } from "@phosphor-icons/react"

export default function PrivacySection() {
  return (
    <Card>
      <CardHeader><CardTitle>隐私偏好</CardTitle><CardDescription>管理您的隐私偏好</CardDescription></CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Eye className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">隐私设置功能正在开发中，我们会在后续版本中添加更多隐私相关的功能。</p>
        </div>
      </CardContent>
    </Card>
  )
}