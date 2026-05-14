"use client"

import { Button } from "@/components/ui/button"
import {
  CameraIcon,
  WalletIcon,
  ListIcon,
  UploadIcon,
  DownloadSimpleIcon,
} from "@phosphor-icons/react"

interface MobileExportMenuProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function MobileExportMenu({ activeTab, onTabChange }: MobileExportMenuProps) {
  const menuItems = [
    { value: "snapshot", label: "导出快照", icon: CameraIcon },
    { value: "account", label: "导出账户明细", icon: WalletIcon },
    { value: "record", label: "导出收支情况", icon: ListIcon },
    { value: "all", label: "导出全部数据", icon: UploadIcon },
    { value: "import", label: "导入数据", icon: DownloadSimpleIcon },
  ]

  return (
    <div className="flex flex-col gap-2 w-full sm:hidden">
      {menuItems.map((item) => {
        const Icon = item.icon
        return (
          <Button
            key={item.value}
            variant={activeTab === item.value ? "default" : "outline"}
            className="flex items-center justify-start gap-2 text-sm"
            onClick={() => onTabChange(item.value)}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {item.label}
          </Button>
        )
      })}
    </div>
  )
}