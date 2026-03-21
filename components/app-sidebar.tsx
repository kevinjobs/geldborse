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

const data = {
  user: {
    name: "用户",
    email: "user@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
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
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
