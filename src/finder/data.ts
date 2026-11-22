import { siteImage } from '../config'
import type { FamilySlug, Gender, Longevity, Occasion, Presence, Season } from '../types'

const img = import.meta.glob<string>('../assets/finder/*.webp', { eager: true, import: 'default' })
const pic = (name: string) => img[`../assets/finder/${name}.webp`]
/** An option's picture: the one chosen in the dashboard (Settings → Site images), or the built-in one. */
const site = <T extends object>(key: string, fallback: string, o: T) =>
  Object.defineProperty(o, 'image', { get: () => siteImage(key, fallback), enumerable: true, configurable: true }) as T & { image: string }

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
  site('for_men', pic('for-men'), { value: 'men', label: 'Men' }),
  site('for_women', pic('for-women'), { value: 'women', label: 'Women' }),
  site('for_unisex', pic('for-unisex'), { value: 'unisex', label: 'Unisex' }),
]

export const occasionOptions: Option<Occasion>[] = [
  site('occ_everyday', pic('occ-everyday'), { value: 'everyday', label: 'Everyday' }),
  site('occ_work', pic('occ-work'), { value: 'work', label: 'Work' }),
  site('occ_date', pic('occ-date'), { value: 'date', label: 'Date Night' }),
  site('occ_special', pic('occ-special'), { value: 'special', label: 'Special Occasions' }),
  site('occ_club', pic('occ-club'), { value: 'club', label: 'Club Vibe' }),
]

export const styleOptions: Option<FamilySlug>[] = [
  site('style_fresh', pic('style-fresh'), { value: 'fresh', label: 'Fresh & Clean', description: 'Bright, airy & refreshing.' }),
  site('style_oriental', pic('style-oriental'), { value: 'oriental', label: 'Warm & Oriental', description: 'Rich, deep & distinctive.' }),
  site('style_floral', pic('style-floral'), { value: 'floral', label: 'Floral & Expressive', description: 'Elegant, soft & captivating.' }),
  site('style_fruity', pic('style-fruity'), { value: 'fruity', label: 'Fruity & Juicy', description: 'Bright, playful & vibrant.' }),
  site('style_sweet', pic('style-sweet'), { value: 'sweet', label: 'Sweet & Addictive', description: 'Warm, smooth & irresistible.' }),
]

/**
 * Notes the customer can pick. `matches` lists words of the product notes/accords that count
 * as a hit for that choice (a product note containing the word matches: "Lemon" → "Sicilian Lemon").
 * `icon`: the picture is an ingredient cut-out (shown on a soft tint), not a photo.
 */
export interface NoteOption extends Option {
  matches: string[]
  icon?: boolean
}

const noteIcons = import.meta.glob<string>('../assets/finder/notes/*.webp', { eager: true, import: 'default' })
/** A note with an ingredient picture from the notes pack. */
const iconNote = (value: string, label: string, matches: string[]): NoteOption => ({
  value,
  label,
  matches,
  icon: true,
  image: noteIcons[`../assets/finder/notes/${value}.webp`],
})

// The photo notes (their pictures can be changed in Settings → Site images).
const citrus = site('note_citrus', pic('style-fresh'), { value: 'citrus', label: 'Citrus', matches: ['Citrus', 'Bergamot', 'Lemon', 'Orange', 'Mandarin'] })
const aquatic = site('note_aquatic', pic('season-summer'), { value: 'aquatic', label: 'Aquatic', matches: ['Aquatic', 'Sea', 'Marine', 'Water', 'Fresh'] })
const woods = site('note_woods', pic('more-style'), { value: 'woods', label: 'Woods', matches: ['Wood', 'Cedar', 'Oud', 'Vetiver', 'Sandalwood'] })
const floral = site('note_floral', pic('style-floral'), { value: 'floral', label: 'Floral', matches: ['Floral', 'Flower', 'Rose', 'Jasmine', 'Lavender'] })
const fruity = site('note_fruity', pic('style-fruity'), { value: 'fruity', label: 'Fruity', matches: ['Fruit', 'Berr', 'Apple', 'Pear', 'Cherry', 'Peach', 'Plum'] })
const musk = site('note_musk', pic('more-moments'), { value: 'musk', label: 'Musk', matches: ['Musk'] })
const vanilla = site('note_vanilla', pic('note-vanilla'), { value: 'vanilla', label: 'Vanilla', matches: ['Vanilla'] })
const caramel = site('note_caramel', pic('note-caramel'), { value: 'caramel', label: 'Caramel', matches: ['Caramel', 'Toffee', 'Sugar'] })
const tonka = site('note_tonka', pic('note-tonka'), { value: 'tonka', label: 'Tonka', matches: ['Tonka', 'Coumarin'] })
const oud = site('note_oud', pic('note-oud'), { value: 'oud', label: 'Oud', matches: ['Oud', 'Agarwood'] })
const incense = site('note_incense', pic('note-incense'), { value: 'incense', label: 'Incense', matches: ['Incense', 'Frankincense', 'Smok'] })
const leather = site('note_leather', pic('note-leather'), { value: 'leather', label: 'Leather', matches: ['Leather', 'Suede'] })
const rose = site('note_rose', pic('note-rose'), { value: 'rose', label: 'Rose', matches: ['Rose'] })
const jasmine = site('note_jasmine', pic('note-jasmine'), { value: 'jasmine', label: 'Jasmine', matches: ['Jasmine'] })
const amber = site('note_amber', pic('note-amber'), { value: 'amber', label: 'Amber', matches: ['Amber'] })

/** The notes shown for each scent style (the step after "What kind of scent speaks to you?"). */
export const styleNotes: Record<FamilySlug, NoteOption[]> = {
  fresh: [
    citrus,
    aquatic,
    iconNote('bergamot', 'Bergamot', ['Bergamot']),
    iconNote('green-tea', 'Green Tea', ['Tea', 'Green']),
    iconNote('lavender', 'Lavender', ['Lavender']),
    musk,
  ],
  oriental: [oud, amber, incense, leather, iconNote('saffron', 'Saffron', ['Saffron']), woods],
  floral: [
    rose,
    jasmine,
    iconNote('peony', 'Peony', ['Peony']),
    iconNote('orange-blossom', 'Orange Blossom', ['Orange Blossom', 'Neroli']),
    iconNote('iris', 'Iris', ['Iris', 'Orris', 'Violet']),
    iconNote('indian-tuberose', 'Tuberose', ['Tuberose']),
  ],
  fruity: [
    fruity,
    iconNote('raspberry', 'Raspberry', ['Raspberr', 'Berr']),
    iconNote('pear', 'Pear', ['Pear']),
    iconNote('apple', 'Apple', ['Apple']),
    iconNote('pineapple', 'Pineapple', ['Pineapple']),
    iconNote('blackcurrant', 'Blackcurrant', ['Blackcurrant', 'Currant', 'Cassis']),
  ],
  sweet: [vanilla, caramel, tonka, iconNote('praline', 'Praline', ['Praline']), iconNote('honey', 'Honey', ['Honey']), iconNote('cacao', 'Cacao', ['Cacao', 'Chocolate', 'Cocoa'])],
}

/** A few more that belong to no one style. */
export const extraNotes: NoteOption[] = [
  floral,
  iconNote('grapefruit', 'Grapefruit', ['Grapefruit']),
  iconNote('ylang-ylang', 'Ylang Ylang', ['Ylang']),
  iconNote('plum', 'Plum', ['Plum']),
  iconNote('coffee', 'Coffee', ['Coffee']),
  iconNote('coconut', 'Coconut', ['Coconut']),
  iconNote('cinnamon', 'Cinnamon', ['Cinnamon']),
  iconNote('cardamom', 'Cardamom', ['Cardamom']),
  iconNote('tobacco', 'Tobacco', ['Tobacco']),
  iconNote('sandalwood', 'Sandalwood', ['Sandalwood']),
  iconNote('patchouli', 'Patchouli', ['Patchouli']),
  iconNote('vetiver', 'Vetiver', ['Vetiver']),
  iconNote('white-musk', 'White Musk', ['White Musk', 'Musk']),
]

/** Shown when no style is chosen (and before the styles had their own notes). */
export const mainNotes: NoteOption[] = [citrus, aquatic, woods, floral, fruity, musk]
export const moreNotes: NoteOption[] = [vanilla, caramel, tonka, oud, incense, leather, rose, jasmine, amber]

/** Every note, once. */
export const allNotes: NoteOption[] = [...new Map([...mainNotes, ...moreNotes, ...Object.values(styleNotes).flat(), ...extraNotes].map((n) => [n.value, n])).values()]

/** The notes to show first for a style. */
export const notesFor = (style?: FamilySlug) => (style ? styleNotes[style] : mainNotes)

/** "Explore more notes": everything else, grouped (the other styles' notes, then the rest). */
export function moreNoteGroups(style?: FamilySlug): { title: string; notes: NoteOption[] }[] {
  const shown = new Set(notesFor(style).map((n) => n.value))
  const seen = new Set(shown)
  const groups: { title: string; notes: NoteOption[] }[] = []
  const add = (title: string, list: NoteOption[]) => {
    const notes = list.filter((n) => !seen.has(n.value))
    notes.forEach((n) => seen.add(n.value))
    if (notes.length) groups.push({ title, notes })
  }
  for (const o of styleOptions) if (o.value !== style) add(o.label, styleNotes[o.value])
  add('More notes', [...extraNotes, ...mainNotes, ...moreNotes])
  return groups
}

export const seasonOptions: Option<Season>[] = [
  site('season_spring', pic('season-spring'), { value: 'spring', label: 'Spring', description: 'Fresh · Blooming · Vibrant' }),
  site('season_summer', pic('season-summer'), { value: 'summer', label: 'Summer', description: 'Bright · Energizing · Airy' }),
  site('season_autumn', pic('season-autumn'), { value: 'autumn', label: 'Autumn', description: 'Warm · Rich · Cozy' }),
  site('season_winter', pic('season-winter'), { value: 'winter', label: 'Winter', description: 'Deep · Intense · Sophisticated' }),
  site('season_all', pic('season-all'), { value: 'all', label: 'All Year', description: 'Versatile · Anytime · Everywhere' }),
]

export const presenceOptions: Option<Presence>[] = [
  site('pres_soft', pic('more-moments'), { value: 'soft', label: 'Soft', description: 'Close to the skin — noticed only by those near you.' }),
  site('pres_balanced', pic('more-preferences'), { value: 'balanced', label: 'Balanced', description: 'Noticeable but never overwhelming.' }),
  site('pres_bold', pic('more-match'), { value: 'bold', label: 'Bold', description: 'A confident trail that fills the room.' }),
]

export const longevityOptions: (Option<Longevity> & { hours: string })[] = [
  site('long_standard', pic('long-standard'), { value: 'standard', label: 'Moderate', hours: 'Up to 6 Hours', description: 'Perfect for everyday wear — from workouts to the office.' }),
  site('long_extended', pic('long-extended'), { value: 'extended', label: 'Extended', hours: 'Up to 8 Hours', description: 'Great for longer days and busy schedules.' }),
  site('long_eternal', pic('long-eternal'), { value: 'eternal', label: 'Eternal', hours: 'More Than 12 Hours', description: 'For those who want their fragrance to stay with them for as long as possible.' }),
]

/** The big photo beside each question (desktop). */
const panelKeys = ['panel_for', 'panel_occasion', 'panel_style', 'panel_notes', 'panel_season', 'panel_presence', 'panel_longevity']
const panelPics = [pic('landing-hero'), pic('occ-date'), pic('style-oriental'), pic('note-rose'), pic('season-autumn'), pic('more-style'), pic('long-eternal')]
export const panels = new Proxy(panelPics, { get: (t, k) => (typeof k === 'string' && /^\d+$/.test(k) ? siteImage(panelKeys[+k], t[+k]) : Reflect.get(t, k)) })


export const landing = {
  get hero() {
    return siteImage('finder_hero', pic('landing-hero'))
  },
  get cta() {
    return siteImage('finder_cta', pic('landing-cta'))
  },
  cards: [
    site('finder_card_style', pic('more-style'), { title: 'Your style', text: 'What you want your fragrance to feel like.' }),
    site('finder_card_moments', pic('more-moments'), { title: 'Your moments', text: 'Where and when you’ll wear it.' }),
    site('finder_card_prefs', pic('more-preferences'), { title: 'Your preferences', text: 'The scent worlds and notes you gravitate toward.' }),
    site('finder_card_match', pic('more-match'), { title: 'Your match', text: 'The fragrances that fit you best.' }),
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
