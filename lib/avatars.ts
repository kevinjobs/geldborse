export interface AvatarPreset {
  id: number
  style: string
  seed: string
}

const STYLES = [
  'avataaars',
  'lorelei',
  'micah',
  'open-peeps',
  'miniavs',
  'personas',
  'notionists',
  'adventurer',
  'big-ears',
  'dylan',
  'toon-head',
  'fun-emoji',
  'pixel-art',
  'croodles',
  'bottts',
  'big-smile',
]

function randomSeed() {
  return Math.random().toString(36).substring(2, 8)
}

export function generateRandomPresets(): AvatarPreset[] {
  return STYLES.map((style, i) => ({
    id: i + 1,
    style,
    seed: randomSeed(),
  }))
}

export function getAvatarUrl(preset: AvatarPreset) {
  return `https://api.dicebear.com/9.x/${preset.style}/svg?seed=${preset.seed}`
}
