"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { MobileExportMenu } from "@/components/mobile-export-menu"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProtectedRoute } from "@/components/protected-route"
import { DownloadSimpleIcon, UploadIcon, CameraIcon, WalletIcon, ListIcon } from "@phosphor-icons/react"
import { useExportData } from "./_hooks/use-export-data"
import { SnapshotExportTab } from "./_components/snapshot-export-tab"
import { AccountExportTab } from "./_components/account-export-tab"
import { RecordExportTab } from "./_components/record-export-tab"
import { AllDataTab } from "./_components/all-data-tab"
import { ImportTab } from "./_components/import-tab"

export default function ExportPage() {
  const { snapshots, accounts, records, balances, loading, fetchData } = useExportData()
  const [activeTab, setActiveTab] = useState<string>("snapshot")

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col gap-4 p-6">
            <div className="text-center text-muted-foreground">加载中...</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col gap-6 p-6">
            <MobileExportMenu activeTab={activeTab} onTabChange={setActiveTab} />
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="hidden sm:block">
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
                  <TabsTrigger value="snapshot" className="flex items-center justify-center gap-2">
                    <CameraIcon className="h-4 w-4" />
                    <span className="hidden lg:inline">导出快照</span>
                    <span className="lg:hidden">快照</span>
                  </TabsTrigger>
                  <TabsTrigger value="account" className="flex items-center justify-center gap-2">
                    <WalletIcon className="h-4 w-4" />
                    <span className="hidden lg:inline">导出账户明细</span>
                    <span className="lg:hidden">账户</span>
                  </TabsTrigger>
                  <TabsTrigger value="record" className="flex items-center justify-center gap-2">
                    <ListIcon className="h-4 w-4" />
                    <span className="hidden lg:inline">导出收支情况</span>
                    <span className="lg:hidden">收支</span>
                  </TabsTrigger>
                  <TabsTrigger value="all" className="flex items-center justify-center gap-2">
                    <UploadIcon className="h-4 w-4" />
                    <span className="hidden lg:inline">导出全部数据</span>
                    <span className="lg:hidden">全部</span>
                  </TabsTrigger>
                  <TabsTrigger value="import" className="flex items-center justify-center gap-2">
                    <DownloadSimpleIcon className="h-4 w-4" />
                    <span className="hidden lg:inline">导入数据</span>
                    <span className="lg:hidden">导入</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="snapshot" className="space-y-6">
                <SnapshotExportTab snapshots={snapshots} />
              </TabsContent>

              <TabsContent value="account" className="space-y-6">
                <AccountExportTab accounts={accounts} />
              </TabsContent>

              <TabsContent value="record" className="space-y-6">
                <RecordExportTab records={records} />
              </TabsContent>

              <TabsContent value="all" className="space-y-6">
                <AllDataTab accounts={accounts} snapshots={snapshots} records={records} balances={balances} loading={loading} />
              </TabsContent>

              <TabsContent value="import" className="space-y-6">
                <ImportTab onImportComplete={fetchData} />
              </TabsContent>
            </Tabs>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
