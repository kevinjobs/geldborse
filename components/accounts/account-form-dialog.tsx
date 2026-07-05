"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ACCOUNT_TYPE_CONFIG } from "@/lib/account-config"
import type { Account } from "./types"

interface AccountFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingAccount: Account | null
  accountName: string
  onAccountNameChange: (name: string) => void
  accountType: string
  onAccountTypeChange: (type: string) => void
  accountNumber: string
  onAccountNumberChange: (num: string) => void
  accountArchived: boolean
  onAccountArchivedChange: (archived: boolean) => void
  saving: boolean
  onSave: () => void
}

export function AccountFormDialog({
  open,
  onOpenChange,
  editingAccount,
  accountName,
  onAccountNameChange,
  accountType,
  onAccountTypeChange,
  accountNumber,
  onAccountNumberChange,
  accountArchived,
  onAccountArchivedChange,
  saving,
  onSave,
}: AccountFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingAccount ? "编辑账户" : "添加账户"}</DialogTitle>
          <DialogDescription>
            {editingAccount ? "修改账户信息" : "创建一个新的财务账户"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accountName">账户名称</Label>
            <Input
              id="accountName"
              placeholder="如：支付宝、微信、中信银行"
              value={accountName}
              onChange={(e) => onAccountNameChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountType">账户类型</Label>
            <Select value={accountType} onValueChange={onAccountTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="选择账户类型" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ACCOUNT_TYPE_CONFIG).map(([value, config]) => {
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
          <div className="space-y-2">
            <Label htmlFor="accountNumber">账户号码</Label>
            <Input
              id="accountNumber"
              placeholder="可选，如银行卡号"
              value={accountNumber}
              onChange={(e) => onAccountNumberChange(e.target.value)}
            />
          </div>
          {editingAccount && (
            <label
              htmlFor="accountArchived"
              className="flex items-start gap-3 rounded-md border border-border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <Checkbox
                id="accountArchived"
                checked={accountArchived}
                onCheckedChange={(v) => onAccountArchivedChange(v === true)}
                className="mt-0.5"
              />
              <div className="space-y-0.5">
                <div className="text-sm font-medium leading-none">归档此账户</div>
                <p className="text-xs text-muted-foreground">
                  归档后账户将在账户管理与添加收支页面默认隐藏，但不影响总览、快照和导出中的数据计算。
                </p>
              </div>
            </label>
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

interface AccountDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deletingAccount: Account | null
  saving: boolean
  onConfirmDelete: () => void
}

export function AccountDeleteDialog({
  open,
  onOpenChange,
  deletingAccount,
  saving,
  onConfirmDelete,
}: AccountDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
          <DialogDescription>
            确定要删除账户 &quot;{deletingAccount?.name}&quot; 吗？如果该账户有关联收支记录，将无法删除。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button variant="destructive" onClick={onConfirmDelete} disabled={saving}>
            {saving ? "删除中..." : "删除"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
