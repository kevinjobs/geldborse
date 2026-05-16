export interface AvatarPreset {
  id: number
  style: string
  seed: string
}

export const avatarPresets: AvatarPreset[] = [
  { id: 1, style: 'adventurer', seed: 'Mia' },
  { id: 2, style: 'avataaars', seed: 'Max' },
  { id: 3, style: 'bottts', seed: 'Luna' },
  { id: 4, style: 'fun-emoji', seed: 'Felix' },
  { id: 5, style: 'identicon', seed: 'Nova' },
  { id: 6, style: 'lorelei', seed: 'Oscar' },
  { id: 7, style: 'micah', seed: 'Ivy' },
  { id: 8, style: 'notionists', seed: 'Finn' },
  { id: 9, style: 'open-peeps', seed: 'Ella' },
  { id: 10, style: 'personas', seed: 'Leo' },
  { id: 11, style: 'pixel-art', seed: 'Zara' },
  { id: 12, style: 'rings', seed: 'Kai' },
  { id: 13, style: 'shapes', seed: 'Ruby' },
  { id: 14, style: 'thumbs', seed: 'Jade' },
  { id: 15, style: 'croodles', seed: 'Ash' },
  { id: 16, style: 'big-smile', seed: 'Sky' },
]

export function getAvatarUrl(preset: AvatarPreset) {
  return `https://api.dicebear.com/9.x/${preset.style}/svg?seed=${preset.seed}`
}
