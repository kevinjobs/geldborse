"use client"

import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"

const PAGE_TITLES: Record<string, string> = {
  "/overview": "总览",
  "/record": "收支",
  "/record/add": "添加收支",
  "/accounts": "账户管理",
  "/snapshots": "每日快照",
  "/export": "导出",
}

export function SiteHeader() {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname] || "财务管理"

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium flex-1">{title}</h1>
        <ThemeToggle />
      </div>
    </header>
  )
}
