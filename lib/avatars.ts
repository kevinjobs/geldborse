export interface AvatarPreset {
  seed: string
  style: string
  dataUrl: string
}

export async function fetchAvatarPresets(): Promise<AvatarPreset[]> {
  const res = await fetch('/api/avatars/presets')
  if (!res.ok) throw new Error('Failed to load avatar presets')
  const data = await res.json()
  return data.presets
}
