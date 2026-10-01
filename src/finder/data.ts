import type { FamilySlug, Gender, Longevity, Occasion, Presence, Season } from '../types'

const img = import.meta.glob<string>('../assets/finder/*.webp', { eager: true, import: 'default' })
const pic = (name: string) => img[`../assets/finder/${name}.webp`]

export interface Option<V extends string = string> {
  value: V
  label: string
  description?: string
  image: string
}

export interface FinderAnswers {
  for?: Gender
  occasion?: Occasion
  style?: FamilySlug
  notes: string[]
  season?: Season
  presence?: Presence
  longevity?: Longevity
}

export const emptyAnswers: FinderAnswers = { notes: [] }
export const MAX_NOTES = 3

export const genderOptions: Option<Gender>[] = [
  { value: 'men', label: 'Men', image: pic('for-men') },
  { value: 'women', label: 'Women', image: pic('for-women') },
  { value: 'unisex', label: 'Unisex', image: pic('for-unisex') },
]

export const occasionOptions: Option<Occasion>[] = [
  { value: 'everyday', label: 'Everyday', image: pic('occ-everyday') },
  { value: 'work', label: 'Work', image: pic('occ-work') },
  { value: 'date', label: 'Date Night', image: pic('occ-date') },
  { value: 'special', label: 'Special Occasions', image: pic('occ-special') },
  { value: 'club', label: 'Club Vibe', image: pic('occ-club') },
]

export const styleOptions: Option<FamilySlug>[] = [
  { value: 'fresh', label: 'Fresh & Clean', description: 'Bright, airy & refreshing.', image: pic('style-fresh') },
  { value: 'oriental', label: 'Warm & Oriental', description: 'Rich, deep & distinctive.', image: pic('style-oriental') },
  { value: 'floral', label: 'Floral & Expressive', description: 'Elegant, soft & captivating.', image: pic('style-floral') },
  { value: 'fruity', label: 'Fruity & Juicy', description: 'Bright, playful & vibrant.', image: pic('style-fruity') },
  { value: 'sweet', label: 'Sweet & Addictive', description: 'Warm, smooth & irresistible.', image: pic('style-sweet') },
]

/**
 * Notes the customer can pick. `matches` lists the product notes/accords
 * (from src/data/products.ts) that count as a hit for that choice.
 */
export interface NoteOption extends Option {
  matches: string[]
}

export const mainNotes: NoteOption[] = [
  { value: 'citrus', label: 'Citrus', image: pic('style-fresh'), matches: ['Citrus', 'Bergamot', 'Lemon'] },
  { value: 'aquatic', label: 'Aquatic', image: pic('season-summer'), matches: ['Aquatic', 'Sea Notes', 'Fresh'] },
  { value: 'woods', label: 'Woods', image: pic('more-style'), matches: ['Woody', 'Cedarwood', 'Oud'] },
  { value: 'floral', label: 'Floral', image: pic('style-floral'), matches: ['Floral', 'Rose', 'Lavender'] },
  { value: 'fruity', label: 'Fruity', image: pic('style-fruity'), matches: [] },
  { value: 'musk', label: 'Musk', image: pic('more-moments'), matches: ['Musk', 'Musks', 'Musky'] },
]

export const moreNotes: NoteOption[] = [
  { value: 'vanilla', label: 'Vanilla', image: pic('note-vanilla'), matches: ['Vanilla'] },
  { value: 'caramel', label: 'Caramel', image: pic('note-caramel'), matches: ['Vanilla', 'Tonka Bean'] },
  { value: 'tonka', label: 'Tonka', image: pic('note-tonka'), matches: ['Tonka Bean'] },
  { value: 'oud', label: 'Oud', image: pic('note-oud'), matches: ['Oud'] },
  { value: 'incense', label: 'Incense', image: pic('note-incense'), matches: ['Incense'] },
  { value: 'leather', label: 'Leather', image: pic('note-leather'), matches: ['Leather'] },
  { value: 'rose', label: 'Rose', image: pic('note-rose'), matches: ['Rose'] },
  { value: 'jasmine', label: 'Jasmine', image: pic('note-jasmine'), matches: ['Floral'] },
  { value: 'amber', label: 'Amber', image: pic('note-amber'), matches: ['Amber'] },
]

export const allNotes = [...mainNotes, ...moreNotes]

export const seasonOptions: Option<Season>[] = [
  { value: 'spring', label: 'Spring', description: 'Fresh · Blooming · Vibrant', image: pic('season-spring') },
  { value: 'summer', label: 'Summer', description: 'Bright · Energizing · Airy', image: pic('season-summer') },
  { value: 'autumn', label: 'Autumn', description: 'Warm · Rich · Cozy', image: pic('season-autumn') },
  { value: 'winter', label: 'Winter', description: 'Deep · Intense · Sophisticated', image: pic('season-winter') },
  { value: 'all', label: 'All Year', description: 'Versatile · Anytime · Everywhere', image: pic('season-all') },
]

export const presenceOptions: Option<Presence>[] = [
  { value: 'soft', label: 'Soft', description: 'Close to the skin — noticed only by those near you.', image: pic('more-moments') },
  { value: 'balanced', label: 'Balanced', description: 'Noticeable but never overwhelming.', image: pic('more-preferences') },
  { value: 'bold', label: 'Bold', description: 'A confident trail that fills the room.', image: pic('more-match') },
]

export const longevityOptions: (Option<Longevity> & { hours: string })[] = [
  { value: 'standard', label: 'Standard', hours: 'Up to 6 Hours', description: 'Perfect for everyday wear — from workouts to the office.', image: pic('long-standard') },
  { value: 'extended', label: 'Extended', hours: 'Up to 8 Hours', description: 'Great for longer days and busy schedules.', image: pic('long-extended') },
  { value: 'eternal', label: 'Eternal', hours: 'More Than 12 Hours', description: 'For those who want their fragrance to stay with them for as long as possible.', image: pic('long-eternal') },
]

export const panels = [pic('panel-1'), pic('panel-2'), pic('panel-3'), pic('panel-2'), pic('panel-5'), pic('panel-3'), pic('panel-7')]

export const landing = {
  hero: pic('landing-hero'),
  cta: pic('landing-cta'),
  cards: [
    { title: 'Your style', text: 'What you want your fragrance to feel like.', image: pic('more-style') },
    { title: 'Your moments', text: 'Where and when you’ll wear it.', image: pic('more-moments') },
    { title: 'Your preferences', text: 'The scent worlds and notes you gravitate toward.', image: pic('more-preferences') },
    { title: 'Your match', text: 'The fragrances that fit you best.', image: pic('more-match') },
  ],
}

export const STEPS = ['For You', 'Occasion', 'Scent Style', 'Notes', 'Season', 'Presence', 'Longevity'] as const
export const TOTAL_STEPS = STEPS.length

export const presenceLabel: Record<Presence, string> = { soft: 'Soft', balanced: 'Moderate', bold: 'Bold' }

export function label<V extends string>(options: Option<V>[], value?: V) {
  return options.find((o) => o.value === value)?.label ?? ''
}

/** Index of the first unanswered step (0-based), or TOTAL_STEPS when complete. */
export function firstOpenStep(a: FinderAnswers): number {
  const done = [a.for, a.occasion, a.style, a.notes.length > 0, a.season, a.presence, a.longevity]
  const i = done.findIndex((d) => !d)
  return i === -1 ? TOTAL_STEPS : i
}

// ---------- URL (results are shareable and survive a refresh) ----------

export function toSearch(a: FinderAnswers): string {
  const p = new URLSearchParams()
  if (a.for) p.set('for', a.for)
  if (a.occasion) p.set('occasion', a.occasion)
  if (a.style) p.set('style', a.style)
  if (a.notes.length) p.set('notes', a.notes.join(','))
  if (a.season) p.set('season', a.season)
  if (a.presence) p.set('presence', a.presence)
  if (a.longevity) p.set('longevity', a.longevity)
  return p.toString()
}

function pick<V extends string>(options: Option<V>[], v: string | null): V | undefined {
  return options.find((o) => o.value === v)?.value
}

export function fromSearch(p: URLSearchParams): FinderAnswers {
  return {
    for: pick(genderOptions, p.get('for')),
    occasion: pick(occasionOptions, p.get('occasion')),
    style: pick(styleOptions, p.get('style')),
    notes: (p.get('notes') ?? '')
      .split(',')
      .filter((n) => allNotes.some((o) => o.value === n))
      .slice(0, MAX_NOTES),
    season: pick(seasonOptions, p.get('season')),
    presence: pick(presenceOptions, p.get('presence')),
    longevity: pick(longevityOptions, p.get('longevity')),
  }
}
