"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { ASSET_TYPE_CONFIG } from "@/lib/account-config"
import type { Asset, Balance } from "./types"

interface AssetFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingAsset: Asset | null
  assetName: string
  onAssetNameChange: (name: string) => void
  assetType: string
  onAssetTypeChange: (type: string) => void
  assetAmount: string
  onAssetAmountChange: (amount: string) => void
  assetBalances: Record<string, Balance[]>
  saving: boolean
  onSave: () => void
  onAddBalance: (asset: Asset) => void
  onEditBalance: (asset: Asset, balance: Balance) => void
  onDeleteBalance: (balance: Balance) => void
  formatDateTime: (date: string) => string
  formatAmount: (amount: number) => string
}

export function AssetFormDialog({
  open,
  onOpenChange,
  editingAsset,
  assetName,
  onAssetNameChange,
  assetType,
  onAssetTypeChange,
  assetAmount,
  onAssetAmountChange,
  assetBalances,
  saving,
  onSave,
  onAddBalance,
  onEditBalance,
  onDeleteBalance,
  formatDateTime,
  formatAmount,
}: AssetFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingAsset ? "编辑资产" : "添加资产"}</DialogTitle>
          <DialogDescription>
            {editingAsset ? "修改资产信息" : "为账户添加新资产"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="assetName">资产名称</Label>
            <Input
              id="assetName"
              placeholder="如：活期存款、定期存款、基金"
              value={assetName}
              onChange={(e) => onAssetNameChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assetType">资产类型</Label>
            <Select value={assetType} onValueChange={onAssetTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="选择资产类型" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ASSET_TYPE_CONFIG).map(([value, config]) => {
                  const Icon = config.icon
                  return (
                    <SelectItem key={value} value={value}>
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {config.label}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          {!editingAsset && (
            <div className="space-y-2">
              <Label htmlFor="assetAmount">金额</Label>
              <Input
                id="assetAmount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={assetAmount}
                onChange={(e) => onAssetAmountChange(e.target.value)}
              />
            </div>
          )}
          {editingAsset && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>余额快照</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-primary hover:text-primary"
                  onClick={() => onAddBalance(editingAsset)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  添加快照
                </Button>
              </div>
              <div className="border rounded-md max-h-40 overflow-y-auto">
                {assetBalances[editingAsset.id] && assetBalances[editingAsset.id].length > 0 ? (
                  <div className="divide-y">
                    {[...assetBalances[editingAsset.id]]
                      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
                      .map((balance) => (
                        <div key={balance.id} className="flex items-center justify-between p-2 hover:bg-muted">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {formatDateTime(balance.recordedAt)}
                            </span>
                            <span className="text-sm font-medium">{formatAmount(balance.amount)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => onEditBalance(editingAsset, balance)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              onClick={() => onDeleteBalance(balance)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    暂无快照
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
