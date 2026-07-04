"use client"

import { useMemo, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth-context"
import {
  Bell,
  Database,
  Eye,
  Key,
  Shield,
  User,
  Users,
} from "@phosphor-icons/react"

import ProfileSection from "./_sections/profile-section"
import SecuritySection from "./_sections/security-section"
import NotificationsSection from "./_sections/notifications-section"
import PrivacySection from "./_sections/privacy-section"
import DataSection from "./_sections/data-section"
import ApiKeysSection from "./_sections/api-keys-section"
import AdminSection from "./_sections/admin-section"

type SettingsTab =
  | "profile"
  | "security"
  | "notifications"
  | "privacy"
  | "data"
  | "api-keys"
  | "admin"

interface NavItem {
  id: SettingsTab
  label: string
  description: string
  icon: React.ElementType
  adminOnly?: boolean
}

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "账户",
    items: [
      { id: "profile", label: "个人资料", description: "头像、昵称", icon: User },
      { id: "security", label: "账户安全", description: "密码、登录历史", icon: Shield },
    ],
  },
  {
    title: "偏好",
    items: [
      { id: "notifications", label: "通知设置", description: "通知偏好", icon: Bell },
      { id: "privacy", label: "隐私设置", description: "隐私偏好", icon: Eye },
    ],
  },
  {
    title: "数据",
    items: [
      { id: "data", label: "数据管理", description: "清空数据", icon: Database },
      { id: "api-keys", label: "API 密钥", description: "访问密钥", icon: Key },
    ],
  },
  {
    title: "管理",
    items: [
      { id: "admin", label: "用户管理", description: "用户权限", icon: Users, adminOnly: true },
    ],
  },
]

const sectionTitle: Record<SettingsTab, string> = {
  profile: "个人资料",
  security: "账户安全",
  notifications: "通知设置",
  privacy: "隐私设置",
  data: "数据管理",
  "api-keys": "API 密钥",
  admin: "用户管理",
}

function renderSection(activeTab: SettingsTab) {
  switch (activeTab) {
    case "profile":
      return <ProfileSection />
    case "security":
      return <SecuritySection />
    case "notifications":
      return <NotificationsSection />
    case "privacy":
      return <PrivacySection />
    case "data":
      return <DataSection />
    case "api-keys":
      return <ApiKeysSection />
    case "admin":
      return <AdminSection />
  }
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile")

  const visibleGroups = useMemo(
    () =>
      navGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => !item.adminOnly || user?.isAdmin),
        }))
        .filter((group) => group.items.length > 0),
    [user?.isAdmin]
  )

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-svh">
        <SiteHeader />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-6">
            <aside className="lg:w-72 flex-shrink-0">
              <div className="bg-card rounded-[16px] border p-4">
                <h1 className="text-xl font-heading mb-4">设置</h1>
                <nav className="space-y-6">
                  {visibleGroups.map((group) => (
                    <div key={group.title} className="space-y-2">
                      <h2 className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {group.title}
                      </h2>
                      <div className="space-y-1">
                        {group.items.map((item) => {
                          const Icon = item.icon
                          const active = activeTab === item.id
                          return (
                            <button
                              key={item.id}
                              onClick={() => setActiveTab(item.id)}
                              className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-md text-left transition-colors ${
                                active
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "hover:bg-muted text-foreground"
                              }`}
                            >
                              <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                              <span className="min-w-0">
                                <span className="block text-sm">{item.label}</span>
                                <span className={`block text-xs ${active ? "text-primary/80" : "text-muted-foreground"}`}>
                                  {item.description}
                                </span>
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </nav>
              </div>
            </aside>

            <main className="flex-1 min-w-0 space-y-6">
              <h2 className="text-2xl font-heading">{sectionTitle[activeTab]}</h2>
              {renderSection(activeTab)}
            </main>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}