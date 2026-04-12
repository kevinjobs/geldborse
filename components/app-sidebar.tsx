"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { Logo } from "@/components/logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth-context"
import { PlusIcon } from "@phosphor-icons/react"
import { Settings, HelpCircle } from "lucide-react"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  const userData = user ? {
    name: user.name || user.email.split('@')[0],
    email: user.email,
    avatar: "/avatars/default.svg",
  } : {
    name: "访客",
    email: "请登录",
    avatar: "/avatars/default.svg",
  }

  return (
    <Sidebar collapsible="icon" {...props} className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      <SidebarHeader className="border-b border-gray-200 dark:border-gray-800 pb-4">
        <div className="px-4 py-3">
          <a href="/overview" className="flex items-center gap-2">
            <Logo className="size-6!" />
            <span className="text-base font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent group-data-[collapsible=icon]:hidden">
              Geldborse
            </span>
          </a>
        </div>


      </SidebarHeader>

      <SidebarContent>
        <NavMain />

        {/* 其他区域 */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
            其他
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="设置">
                  <a href="/settings" className="w-full h-full flex items-center gap-3 px-4">
                    <Settings className="h-4 w-4" />
                    <span>设置</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="帮助中心">
                  <a href="/help" className="w-full h-full flex items-center gap-3 px-4">
                    <HelpCircle className="h-4 w-4" />
                    <span>帮助中心</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* 用户信息 - 放在最下面 */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center">
        <NavUser />
      </div>
    </Sidebar>
  )
}
