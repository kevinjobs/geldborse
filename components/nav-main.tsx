"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { EyeIcon, PlusIcon, WalletIcon, ListIcon, CameraIcon, UploadIcon } from "@phosphor-icons/react"

const navIcons = {
  overview: EyeIcon,
  addRecord: PlusIcon,
  record: ListIcon,
  accounts: WalletIcon,
  snapshots: CameraIcon,
  export: UploadIcon,
}

interface NavItem {
  title: string
  url: string
  iconKey: keyof typeof navIcons
}

const navItems: NavItem[] = [
  { title: "总览", url: "/overview", iconKey: "overview" },
  { title: "添加收支", url: "/record/add", iconKey: "addRecord" },
  { title: "收支", url: "/record", iconKey: "record" },
  { title: "账户", url: "/accounts", iconKey: "accounts" },
  { title: "快照", url: "/snapshots", iconKey: "snapshots" },
  { title: "导入/导出", url: "/export", iconKey: "export" },
]

function NavIcon({ iconKey, mounted }: { iconKey: keyof typeof navIcons; mounted: boolean }) {
  const Icon = navIcons[iconKey]
  // 服务器端和初始客户端渲染使用相同的默认大小
  const iconClass = mounted ? "size-5 md:size-4" : "size-4"
  return <Icon className={iconClass} />
}

export function NavMain() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 服务器端和初始客户端渲染使用相同的默认样式
  const menuClass = mounted ? "gap-1 md:gap-px" : "gap-px"
  const buttonClass = mounted
    ? "h-11 md:h-8 text-sm md:text-xs py-2.5 md:py-2"
    : "h-8 text-xs py-2"

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
        主菜单
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className={menuClass}>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className={`${buttonClass} animate-transition-all hover:bg-gray-50 dark:hover:bg-gray-800`}
              >
                <Link href={item.url} className="w-full h-full flex items-center gap-3 px-4 animate-transition-colors">
                  <NavIcon iconKey={item.iconKey} mounted={mounted} />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}