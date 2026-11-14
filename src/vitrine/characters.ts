import type { FamilySlug, Gender, Occasion, Product, Season } from '../types'

/**
 * The Vitrine's characters. They stand on an open stage; each opens its own wall of bottles. The dashboard (Products →
 * Vitrine characters) can rename them, change their line and photo, choose their bottles,
 * switch them off or add new ones; without a choice of bottles, the ones that fit the
 * character's taste are picked here.
 */
export interface Character {
  id: string
  name: string
  tagline: string
  /** The person's full-length photo, background cut out (from the dashboard) */
  image?: string
  /** Chosen in the dashboard (in this order); empty = picked by taste */
  products: number[]
}

interface Taste {
  gender?: Gender[]
  families?: FamilySlug[]
  occasions?: Occasion[]
  seasons?: Season[]
  notes?: string[]
  bold?: boolean
}

export const DEFAULT_CHARACTERS: (Character & { taste: Taste })[] = [
  { id: 'gangster', name: 'The Gangster', tagline: 'Smoke, leather & power', products: [], taste: { gender: ['men', 'unisex'], families: ['oriental'], occasions: ['club', 'special'], notes: ['tobacco', 'leather', 'oud', 'smok', 'incense', 'whisk', 'rum'], bold: true } },
  { id: 'doll', name: 'The Doll', tagline: 'Sweet, pink & iconic', products: [], taste: { gender: ['women'], families: ['sweet', 'fruity', 'floral'], notes: ['vanilla', 'candy', 'caramel', 'berr', 'strawberr', 'cherry', 'rose', 'praline', 'sugar'] } },
  { id: 'professor', name: 'The Professor', tagline: 'Woody, wise & refined', products: [], taste: { families: ['oriental', 'fresh'], occasions: ['work', 'everyday'], notes: ['wood', 'cedar', 'sandal', 'vetiver', 'tea', 'pepper', 'iris', 'leather', 'tobacco'] } },
  { id: 'gentleman', name: 'The Gentleman', tagline: 'Sharp, clean & confident', products: [], taste: { gender: ['men'], families: ['fresh'], occasions: ['work', 'special'], notes: ['bergamot', 'lavender', 'citrus', 'musk', 'ambroxan', 'pepper', 'vetiver'] } },
  { id: 'romantic', name: 'The Romantic', tagline: 'Rose, warmth & date nights', products: [], taste: { families: ['floral', 'sweet'], occasions: ['date'], notes: ['rose', 'jasmine', 'vanilla', 'tonka', 'amber', 'musk'] } },
  { id: 'nightowl', name: 'The Night Owl', tagline: 'Loud, magnetic & after dark', products: [], taste: { occasions: ['club', 'date'], families: ['sweet', 'oriental'], notes: ['vanilla', 'tonka', 'amber', 'cherry', 'coffee', 'rum'], bold: true } },
  { id: 'freespirit', name: 'The Free Spirit', tagline: 'Fresh air & endless summer', products: [], taste: { families: ['fresh', 'fruity'], seasons: ['spring', 'summer'], notes: ['citrus', 'lemon', 'bergamot', 'sea', 'aquatic', 'coconut', 'mint', 'green', 'tropical'] } },
  { id: 'sultan', name: 'The Sultan', tagline: 'Oud, amber & royal trails', products: [], taste: { families: ['oriental'], seasons: ['autumn', 'winter'], notes: ['oud', 'amber', 'saffron', 'incense', 'rose', 'musk', 'patchouli'], bold: true } },
]

const smells = (p: Product) =>
  [...p.notes.map((n) => n.name), ...p.accords, ...p.composition.opening, ...p.composition.heart, ...p.composition.drydown].join(' ').toLowerCase()

function score(p: Product, t: Taste) {
  let s = 0
  const sm = smells(p)
  if (t.gender?.includes(p.profile.gender)) s += 2
  else if (t.gender && p.profile.gender !== 'unisex') s -= 3
  s += p.families.filter((f) => t.families?.includes(f)).length * 2
  s += p.profile.occasions.filter((o) => t.occasions?.includes(o)).length * 1.5
  s += p.profile.seasons.filter((o) => t.seasons?.includes(o)).length
  s += (t.notes ?? []).filter((n) => sm.includes(n)).length * 1.6
  if (t.bold && p.profile.presence === 'bold') s += 1.5
  return s
}

/** The characters to show: the dashboard's list (when saved), else the built-in eight. */
export function resolveCharacters(saved: Partial<Character>[] | null | undefined): Character[] {
  if (!saved?.length) return DEFAULT_CHARACTERS.map(({ taste: _t, ...c }) => ({ ...c }))
  return saved
    .filter((c) => c.name)
    .map((c, i) => ({ id: c.id || `c${i}`, name: c.name!, tagline: c.tagline ?? '', image: c.image || undefined, products: (c.products ?? []).map(Number).filter(Boolean) }))
}

/** A character's bottles: the dashboard's choice, else up to `limit` picked by taste (only bottles that stand in the vitrine). */
export function characterProducts(c: Character, all: Product[], limit = 10): Product[] {
  if (c.products.length) {
    const byId = new Map(all.map((p) => [p.id, p]))
    return c.products.map((id) => byId.get(id)).filter((p): p is Product => !!p)
  }
  const taste = DEFAULT_CHARACTERS.find((d) => d.id === c.id)?.taste ?? {}
  return all
    .map((p) => ({ p, s: score(p, taste) }))
    .filter((x) => x.s > 1.5)
    .sort((a, b) => b.s - a.s || b.p.totalSales - a.p.totalSales)
    .slice(0, limit)
    .map((x) => x.p)
}
