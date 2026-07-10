"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Wallet, List, Camera, Download, Code, Settings,
  ChevronDown, ChevronRight, ArrowRight, ExternalLink
} from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import Link from "next/link"

interface FaqItem {
  q: string
  a: string
}

const faqs: FaqItem[] = [
  {
    q: "如何创建一个新账户？",
    a: "进入「账户管理」页面，点击右上角的「添加账户」按钮，填写账户名称并选择类型即可创建。创建后可在账户详情中添加资产和余额快照。",
  },
  {
    q: "如何记录一笔收支？",
    a: "进入「收支记录」页面点击「添加收支」，或通过侧边栏快捷进入。选择账户、填写金额、选择类型（收入/支出），还可添加备注。支出金额会自动取负。",
  },
  {
    q: "如何生成资产快照？",
    a: "进入「快照」页面，点击「生成快照」即可记录当前所有账户的资产状态。也可在日期时间选择器中指定历史时间点，生成该时间点的回溯快照。",
  },
  {
    q: "如何导出数据？",
    a: "进入「导出」页面，选择导出格式（XLSX / PDF / JPG），可按日期或账户筛选后导出。PDF 和 JPG 模式支持预览。",
  },
  {
    q: "初始余额和资产字段去哪了？",
    a: "创建账户时不再要求填写初始余额和资产。你可以在创建账户后，通过资产管理功能手动添加余额快照，或在收支记录中记录流水，系统会自动计算实时资产总额。",
  },
  {
    q: "如何通过 API 访问我的数据？",
    a: "进入「设置」页面，在 API 密钥管理区域创建密钥。分配对应权限（如 records:read、snapshots:write），通过 Authorization 头传递即可调用 REST API。完整的 API 文档请访问 /api/docs。",
  },
  {
    q: "如何修改密码？",
    a: "进入「设置」→ 密码设置，输入当前密码和新密码即可修改。出于安全考虑，此操作不支持 API Key 认证。",
  },
  {
    q: "数据安全吗？",
    a: "所有数据传输使用 HTTPS 加密，密码经过哈希存储。API Key 的完整密钥仅在创建时展示一次，请妥善保管。",
  },
  {
    q: "余额快照可以添加备注吗？",
    a: "可以。在账户详情中编辑余额快照时，可以添加最多 20 字的备注说明，方便记录特殊原因（如期末调整、审计核对等）。备注会在余额列表中显示。",
  },
]

const features = [
  { icon: Wallet, title: "账户管理", desc: "管理你的财务账户，支持多类型账户和资产细分", href: "/accounts" },
  { icon: List, title: "收支记录", desc: "记录收入与支出，分类管理，生成详细报表", href: "/record" },
  { icon: Camera, title: "资产快照", desc: "定时生成资产快照，支持历史时间回溯，追踪资产变化趋势", href: "/snapshots" },
  { icon: Download, title: "数据导出", desc: "支持 XLSX / PDF / JPG 多种格式导出", href: "/export" },
  { icon: Code, title: "API 文档", desc: "RESTful API，支持 API Key 认证，便于自动化集成", href: "/api/docs" },
  { icon: Settings, title: "系统设置", desc: "管理 API 密钥、修改密码、配置个人资料", href: "/settings" },
]

function HelpPageContent() {
  const [expandedFaqs, setExpandedFaqs] = useState<Set<number>>(new Set())

  const toggleFaq = (index: number) => {
    setExpandedFaqs((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="sidebar" />
      <SidebarInset className="flex flex-col h-svh">
        <SiteHeader />
        <div className="flex flex-1 flex-col overflow-y-auto" style={{ scrollbarGutter: "stable" }}>
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

              {/* Welcome */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Geldborse 使用指南</CardTitle>
                        <CardDescription>智能财务管理平台 · v1.0</CardDescription>
                      </div>
                      <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">
                        帮助中心
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground leading-relaxed">
                    <p>
                      Geldborse 帮助你轻松追踪收支、管理资产、生成快照。通过侧边栏导航可快速切换功能模块。
                      首次使用建议按顺序完成：<strong className="text-foreground">创建账户 → 记录收支 → 生成快照</strong>。
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Feature Grid */}
              <div className="px-4 lg:px-6">
                <h2 className="text-base font-semibold mb-3">功能指南</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {features.map((feature) => {
                    const Icon = feature.icon
                    return (
                      <Link key={feature.href} href={feature.href}>
                        <Card className="h-full hover:border-primary/40 transition-colors cursor-pointer group">
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-primary" />
                              <CardTitle className="text-sm">{feature.title}</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-muted-foreground">{feature.desc}</p>
                            <div className="mt-2 flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                              前往 <ArrowRight className="h-3 w-3" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* FAQ */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>常见问题</CardTitle>
                    <CardDescription>使用过程中可能遇到的问题</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {faqs.map((faq, index) => {
                      const isExpanded = expandedFaqs.has(index)
                      return (
                        <div
                          key={index}
                          className="border border-[#2C2C2E] rounded-[12px] overflow-hidden"
                        >
                          <button
                            onClick={() => toggleFaq(index)}
                            className="w-full flex items-center justify-between gap-2 p-3 text-left text-sm font-medium text-foreground hover:bg-[#252525] transition-colors"
                          >
                            <span>{faq.q}</span>
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                            )}
                          </button>
                          {isExpanded && (
                            <div className="px-3 pb-3 text-sm text-muted-foreground leading-relaxed border-t border-[#2C2C2E] pt-2">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* Resources */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>更多资源</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-3">
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                      <Link href="/api/docs">
                        <Code className="h-4 w-4" />
                        API 参考文档
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                      <Link href="/settings">
                        <Settings className="h-4 w-4" />
                        系统设置
                      </Link>
                    </Button>
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

export default function HelpPage() {
  return (
    <ProtectedRoute>
      <HelpPageContent />
    </ProtectedRoute>
  )
}