import type { Product } from '../types'
import { allNotes, type FinderAnswers } from './data'

export interface Match {
  product: Product
  score: number
  /** 0–100, relative to the best possible score for these answers */
  percent: number
  matchedNotes: string[]
}

const LONGEVITY_RANK = { standard: 0, extended: 1, eternal: 2 }
const PRESENCE_RANK = { soft: 0, balanced: 1, bold: 2 }

/** Scores every product against the answers and returns them best-first. */
export function rankProducts(products: Product[], a: FinderAnswers): Match[] {
  const max = 4 + 4 + 2 + a.notes.length * 2 + 1.5 + 1 + 1

  return products
    .map((product) => {
      const pr = product.profile
      const keywords = new Set([...product.accords, ...product.notes.map((n) => n.name)])
      let score = 0

      if (a.for) {
        if (pr.gender === a.for) score += 4
        else if (pr.gender === 'unisex' || a.for === 'unisex') score += 2.5
        else score -= 4
      }
      if (a.style && product.families.includes(a.style)) score += 4
      if (a.occasion && pr.occasions.includes(a.occasion)) score += 2

      const matchedNotes = a.notes.filter((n) => allNotes.find((o) => o.value === n)?.matches.some((m) => keywords.has(m)))
      score += matchedNotes.length * 2

      if (a.season) {
        if (pr.seasons.includes(a.season) || pr.seasons.includes('all')) score += 1.5
        else if (a.season === 'all') score += 0.75
      }
      if (a.presence) score += 1 - Math.abs(PRESENCE_RANK[pr.presence] - PRESENCE_RANK[a.presence]) * 0.5
      if (a.longevity) score += 1 - Math.abs(LONGEVITY_RANK[pr.longevity] - LONGEVITY_RANK[a.longevity]) * 0.5

      return { product, score, percent: Math.max(0, Math.round((score / max) * 100)), matchedNotes }
    })
    .sort((x, y) => y.score - x.score || y.product.totalSales - x.product.totalSales)
}
