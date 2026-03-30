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
} from "@/components/ui/sidebar"
import { EyeIcon, PlusIcon, WalletIcon, ListIcon, CameraIcon, DownloadSimpleIcon } from "@phosphor-icons/react"
import { useAuth } from "@/lib/auth-context"

const navMain = [
  {
    title: "总览",
    url: "/overview",
    icon: <EyeIcon />,
  },
  {
    title: "添加收支",
    url: "/record/add",
    icon: <PlusIcon />,
  },
  {
    title: "收支",
    url: "/record",
    icon: <ListIcon />,
  },
  {
    title: "账户",
    url: "/accounts",
    icon: <WalletIcon />,
  },
  {
    title: "快照",
    url: "/snapshots",
    icon: <CameraIcon />,
  },
  {
    title: "导出",
    url: "/export",
    icon: <DownloadSimpleIcon />,
  },
]

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
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/overview">
                <Logo className="size-6!" />
                <span className="text-base font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Geldborse
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
