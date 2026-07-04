"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-context"
import { fetchAvatarPresets, AvatarPreset } from "@/lib/avatars"
import { toast } from "sonner"
import { UserIcon } from "@phosphor-icons/react"

export default function ProfileSection() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name || "")
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [selectedPresetSeed, setSelectedPresetSeed] = useState<string | null>(null)
  const [avatarPresets, setAvatarPresets] = useState<AvatarPreset[]>([])
  const [presetsLoading, setPresetsLoading] = useState(false)

  const loadPresets = useCallback(async () => {
    setPresetsLoading(true)
    try {
      const presets = await fetchAvatarPresets()
      setAvatarPresets(presets)
    } catch {
      toast.error("加载头像失败")
    } finally {
      setPresetsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (showAvatarPicker && avatarPresets.length === 0) {
      loadPresets()
    }
  }, [showAvatarPicker, avatarPresets.length, loadPresets])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!user) return
      const body: Record<string, unknown> = { name }
      if (avatarDataUrl) {
        body.avatarData = avatarDataUrl
      } else if (avatarFile) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(avatarFile)
        })
        body.avatarData = base64
      }
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.id}` },
        body: JSON.stringify(body),
      })
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || `更新失败 (${response.status})`)
      }
      const updatedData = await response.json()
      if (updatedData.user) {
        localStorage.setItem("geldborse_user", JSON.stringify(updatedData.user))
        window.location.reload()
      }
      toast.success("个人资料已更新")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "更新失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  const selectPreset = (preset: AvatarPreset) => {
    setSelectedPresetSeed(preset.seed)
    setAvatarFile(null)
    setAvatarDataUrl(preset.dataUrl)
    setAvatarPreview(preset.dataUrl)
    setShowAvatarPicker(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>个人资料</CardTitle>
        <CardDescription>管理您的个人信息和账户设置</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>头像</Label>
            <div className="relative cursor-pointer w-16 h-16" onClick={() => setShowAvatarPicker(true)}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="头像" className="w-16 h-16 rounded-full object-cover border-2 border-primary" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-accent border-2 border-primary flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          <Dialog open={showAvatarPicker} onOpenChange={setShowAvatarPicker}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>选择头像</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="avatar-upload">上传自定义头像</Label>
                  <Input id="avatar-upload" type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
                      toast.error("只支持JPEG, PNG, GIF和WebP格式"); return
                    }
                    if (file.size > 5 * 1024 * 1024) { toast.error("文件大小不能超过5MB"); return }
                    const reader = new FileReader()
                    reader.onload = (event) => {
                      setAvatarPreview(event.target?.result as string)
                      setAvatarDataUrl(null)
                    }
                    reader.readAsDataURL(file)
                    setAvatarFile(file)
                  }} />
                  <p className="text-xs text-muted-foreground">支持JPEG, PNG, GIF, WebP格式，最大5MB</p>
                </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>选择系统头像</Label>
                      <Button variant="outline" size="sm" onClick={() => { loadPresets(); setSelectedPresetSeed(null) }} className="gap-1" disabled={presetsLoading}>
                        <svg className={`h-3.5 w-3.5 ${presetsLoading ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                        </svg>换一批
                      </Button>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {avatarPresets.length === 0 && presetsLoading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                          <div key={i} className="w-14 h-14 rounded-full bg-muted animate-pulse" />
                        ))
                      ) : (
                        avatarPresets.map((preset) => (
                          <button key={`${preset.style}-${preset.seed}`} onClick={() => selectPreset(preset)}
                            className={`w-14 h-14 rounded-full overflow-hidden border-2 ${selectedPresetSeed === preset.seed ? "border-primary" : "border-transparent"} hover:border-primary transition-colors`}>
                            <img src={preset.dataUrl} alt={`头像 ${preset.style}`} className="w-full h-full" />
                          </button>
                        ))
                      )}
                    </div>
                  </div>
              </div>
            </DialogContent>
          </Dialog>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input id="email" type="email" value={user?.email || ""} disabled className="bg-muted" />
              <p className="text-sm text-muted-foreground">邮箱地址无法修改</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">昵称</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="请输入您的昵称" />
            </div>
            <Button type="submit" disabled={loading}>{loading ? "保存中..." : "保存更改"}</Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}