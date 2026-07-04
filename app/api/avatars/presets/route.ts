import { NextResponse } from 'next/server'
import { createAvatar } from '@dicebear/core'
import * as collection from '@dicebear/collection'

export const dynamic = 'force-dynamic'

const AVATAR_STYLES = [
  'avataaars',
  'micah',
  'openPeeps',
  'lorelei',
  'adventurer',
  'notionists',
  'miniavs',
  'funEmoji',
  'personas',
  'dylan',
  'bigEars',
  'croodles',
  'toonHead',
  'bottts',
  'pixelArt',
  'bigSmile',
] as const

function randomSeed() {
  return Math.random().toString(36).substring(2, 10)
}

function getStyle(style: string) {
  return (collection as Record<string, any>)[style]
}

function generatePresetSvg(style: string, seed: string): string {
  const dicebearStyle = getStyle(style)
  if (!dicebearStyle) throw new Error(`Unknown style: ${style}`)
  const avatar = createAvatar(dicebearStyle, { seed })
  return avatar.toString()
}

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

export async function GET() {
  try {
    const presets = AVATAR_STYLES.map((style) => {
      const seed = randomSeed()
      const svg = generatePresetSvg(style, seed)
      return {
        seed,
        style,
        dataUrl: svgToDataUrl(svg),
      }
    })

    return NextResponse.json({ presets })
  } catch (error) {
    console.error('Generate avatars error:', error)
    return NextResponse.json({ error: 'Failed to generate avatars' }, { status: 500 })
  }
}
