import { cache } from 'fabric'

export interface FontDef {
  family: string
  arabic: boolean
}

// All fonts are open-licensed Google Fonts (loaded in index.html).
export const FONTS: FontDef[] = [
  { family: 'Cairo', arabic: true },
  { family: 'Tajawal', arabic: true },
  { family: 'Almarai', arabic: true },
  { family: 'Changa', arabic: true },
  { family: 'Noto Kufi Arabic', arabic: true },
  { family: 'Noto Naskh Arabic', arabic: true },
  { family: 'IBM Plex Sans Arabic', arabic: true },
  { family: 'Amiri', arabic: true },
  { family: 'Reem Kufi', arabic: true },
  { family: 'El Messiri', arabic: true },
  { family: 'Lalezar', arabic: true },
  { family: 'Lemonada', arabic: true },
  { family: 'Aref Ruqaa', arabic: true },
  { family: 'Inter', arabic: false },
  { family: 'Poppins', arabic: false },
  { family: 'Montserrat', arabic: false },
  { family: 'Roboto', arabic: false },
  { family: 'Open Sans', arabic: false },
  { family: 'Playfair Display', arabic: false },
  { family: 'Bebas Neue', arabic: false },
  { family: 'Pacifico', arabic: false },
  { family: 'Lobster', arabic: false },
]

export const ARABIC_RE = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/
export const hasArabic = (s: string) => ARABIC_RE.test(s)

export async function ensureFont(family: string, weight: string | number = 'normal', style = 'normal') {
  if (!document.fonts) return
  try {
    await document.fonts.load(`${style} ${weight} 40px "${family}"`, 'abcابت')
  } catch {
    /* ignore */
  }
}

/** Load every font used by a serialized Fabric canvas before rendering it. */
export async function ensureFontsForJson(json: unknown) {
  const fams = new Set<string>()
  const walk = (o: unknown) => {
    if (!o || typeof o !== 'object') return
    const rec = o as Record<string, unknown>
    if (typeof rec.fontFamily === 'string') {
      fams.add(`${rec.fontWeight ?? 'normal'}|${rec.fontStyle ?? 'normal'}|${rec.fontFamily}`)
    }
    if (Array.isArray(rec.objects)) rec.objects.forEach(walk)
  }
  walk(json)
  await Promise.all(
    [...fams].map((k) => {
      const [w, s, f] = k.split('|')
      return ensureFont(f, w, s)
    }),
  )
  if (fams.size) cache.clearFontCache()
}

/** Best match for a Photoshop font name among our fonts. */
export function matchFont(psName: string | undefined, text: string): string {
  const n = (psName || '').toLowerCase().replace(/[-_ ]/g, '')
  for (const f of FONTS) {
    if (n.includes(f.family.toLowerCase().replace(/ /g, ''))) return f.family
  }
  return hasArabic(text) ? 'Cairo' : 'Inter'
}
