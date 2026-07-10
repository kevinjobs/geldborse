"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import type { Balance } from "./types"

interface BalanceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingBalance: Balance | null
  balanceAmount: string
  onBalanceAmountChange: (amount: string) => void
  balanceDate: string
  onBalanceDateChange: (date: string) => void
  balanceNote: string
  onBalanceNoteChange: (note: string) => void
  saving: boolean
  onSave: () => void
}

export function BalanceFormDialog({
  open,
  onOpenChange,
  editingBalance,
  balanceAmount,
  onBalanceAmountChange,
  balanceDate,
  onBalanceDateChange,
  balanceNote,
  onBalanceNoteChange,
  saving,
  onSave,
}: BalanceFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingBalance ? "编辑余额快照" : "添加余额快照"}</DialogTitle>
          <DialogDescription>
            {editingBalance ? "修改余额快照信息" : "记录当前资产余额"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 mb-5">
          <div className="space-y-2">
            <Label htmlFor="balanceAmount">金额</Label>
            <Input
              id="balanceAmount"
              type="number"
              step="0.01"
              placeholder="请输入当前资产余额"
              value={balanceAmount}
              onChange={(e) => onBalanceAmountChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="balanceDate">登记时间</Label>
            <DateTimePicker
              value={balanceDate}
              onChange={onBalanceDateChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="balanceNote">备注（可选，最多20字）</Label>
            <Input
              id="balanceNote"
              type="text"
              maxLength={20}
              placeholder="请输入备注"
              value={balanceNote}
              onChange={(e) => onBalanceNoteChange(e.target.value)}
            />
          </div>
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
