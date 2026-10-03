import type { FamilySlug, Gender, Longevity, Occasion, Presence, Product, ProductVariation, Review, Season } from '../types'
import { money, storeApi, stripHtml } from './wp'

/**
 * Maps WooCommerce Store API responses onto the storefront's types.
 *
 * Expected product setup in WooCommerce (see WORDPRESS-SETUP.md / the CSV):
 * - Variable product with a "Size" attribute (10 ML / 50 ML / 100 ML)
 * - Short description → tagline, description → long description
 * - Categories → fragrance families (Fresh, Oriental, Floral, Fruity, Sweet)
 * - Attributes: Accords, Notes, Inspired By, For, Occasion, Season, Presence, Longevity
 */

// ---------- Store API shapes (only the fields we use) ----------

interface RawTerm {
  id: number
  name: string
  slug: string
}
interface RawAttribute {
  id: number
  name: string
  taxonomy: string | null
  has_variations: boolean
  terms: RawTerm[]
}
interface RawPrices {
  price: string
  regular_price: string
  sale_price: string
  price_range: { min_amount: string; max_amount: string } | null
  currency_minor_unit: number
}
export interface RawProduct {
  id: number
  name: string
  slug: string
  type: string
  parent?: number
  short_description: string
  description: string
  prices: RawPrices
  images: { id: number; src: string; alt: string; name?: string }[]
  categories: { id: number; name: string; slug: string }[]
  attributes: RawAttribute[]
  variations: { id: number; attributes: { name: string; value: string }[] }[]
  variation?: string
  is_in_stock: boolean
  is_purchasable: boolean
}
interface RawReview {
  id: number
  date_created: string
  product_id: number
  reviewer: string
  review: string
  rating: number
  verified: boolean
}

// ---------- note icons (bundled artwork, matched by name) ----------

const noteImages = import.meta.glob<string>('../assets/notes/*.png', { eager: true, import: 'default' })
const noteFile: Record<string, string> = {
  vanilla: 'vanilla',
  oud: 'oud',
  amber: 'amber',
  'tonka bean': 'tonka-bean',
  tonka: 'tonka-bean',
  musk: 'musk',
  musks: 'musk',
  'white musk': 'musk-2',
  rose: 'rose',
  incense: 'incense',
  patchouli: 'patchouli',
  saffron: 'saffron',
  bergamot: 'bergamot',
  lemon: 'lemon',
  citrus: 'lemon',
  'pink pepper': 'pink-pepper',
  leather: 'leather',
  cedarwood: 'cedarwood',
  cedar: 'cedarwood',
  woods: 'cedarwood-2',
  'sea notes': 'sea-notes',
  aquatic: 'sea-notes',
  lavender: 'lavender',
}
/** Neutral droplet used for notes we don't have artwork for. */
const FALLBACK_NOTE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M24 6c6 9 12 15 12 23a12 12 0 0 1-24 0c0-8 6-14 12-23z" fill="#d9c7b3"/><path d="M19 30a6 6 0 0 0 5 6" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/></svg>',
  )

export function noteImage(name: string): string {
  const file = noteFile[name.trim().toLowerCase()]
  return (file && noteImages[`../assets/notes/${file}.png`]) || FALLBACK_NOTE
}

// ---------- helpers ----------

const norm = (s: string) => s.trim().toLowerCase().replace(/^pa_/, '').replace(/[\s_-]+/g, ' ')

function attr(p: RawProduct, ...names: string[]): string[] {
  const wanted = names.map(norm)
  const a = p.attributes.find((x) => wanted.includes(norm(x.name)) || (x.taxonomy && wanted.includes(norm(x.taxonomy))))
  return a ? a.terms.map((t) => t.name.trim()).filter(Boolean) : []
}

function pickOne<T extends string>(values: string[], map: Record<string, T>, fallback: T): T {
  for (const v of values) {
    const hit = map[norm(v)]
    if (hit) return hit
  }
  return fallback
}

function pickMany<T extends string>(values: string[], map: Record<string, T>): T[] {
  return [...new Set(values.map((v) => map[norm(v)]).filter((x): x is T => Boolean(x)))]
}

const GENDER: Record<string, Gender> = { men: 'men', man: 'men', male: 'men', women: 'women', woman: 'women', female: 'women', unisex: 'unisex' }
const OCCASION: Record<string, Occasion> = {
  everyday: 'everyday',
  work: 'work',
  office: 'work',
  'date night': 'date',
  date: 'date',
  'special occasions': 'special',
  'special occasion': 'special',
  special: 'special',
  'club vibe': 'club',
  club: 'club',
  night: 'club',
}
const SEASON: Record<string, Season> = { spring: 'spring', summer: 'summer', autumn: 'autumn', fall: 'autumn', winter: 'winter', 'all year': 'all', all: 'all' }
const PRESENCE: Record<string, Presence> = { soft: 'soft', subtle: 'soft', balanced: 'balanced', moderate: 'balanced', bold: 'bold', strong: 'bold' }
const LONGEVITY: Record<string, Longevity> = { standard: 'standard', extended: 'extended', eternal: 'eternal' }
const FAMILIES: FamilySlug[] = ['fresh', 'oriental', 'floral', 'fruity', 'sweet']

/** Size label for one variation, e.g. "50 ML". */
function sizeOf(parent: RawProduct, v: RawProduct['variations'][number]): string {
  const sizeAttr = parent.attributes.find((a) => a.has_variations) ?? parent.attributes.find((a) => norm(a.name) === 'size')
  const raw = v.attributes.find((x) => norm(x.name) === 'size' || (sizeAttr && norm(x.name) === norm(sizeAttr.name)))?.value ?? v.attributes[0]?.value ?? ''
  // global attributes give the term slug ("50-ml"); map back to its display name
  const term = sizeAttr?.terms.find((t) => t.slug === raw || t.name === raw)
  return (term?.name ?? raw.replace(/-/g, ' ')).toUpperCase()
}

function mapProduct(p: RawProduct, variationsById: Map<number, RawProduct>, rank: { sales: number; date: number }): Product {
  const minor = p.prices.currency_minor_unit ?? 2
  let variations: ProductVariation[] = p.variations.map((v) => {
    const full = variationsById.get(v.id)
    const size = sizeOf(p, v)
    const price = full ? money(full.prices.price, full.prices.currency_minor_unit ?? minor) : money(p.prices.price, minor)
    return { id: v.id, size, price, isSample: /^10\s*ml$/i.test(size), inStock: full ? full.is_in_stock : p.is_in_stock }
  })
  variations.sort((a, b) => parseFloat(a.size) - parseFloat(b.size) || a.price - b.price)
  if (variations.length === 0) {
    // simple product: treat it as a single full-size option
    variations = [{ id: p.id, size: attr(p, 'Size')[0] ?? 'One size', price: money(p.prices.price, minor), isSample: false, inStock: p.is_in_stock }]
  }

  const notes = attr(p, 'Notes', 'Fragrance Notes')
  const families = p.categories.map((c) => c.slug.toLowerCase()).filter((s): s is FamilySlug => FAMILIES.includes(s as FamilySlug))

  return {
    id: p.id,
    slug: p.slug,
    name: stripHtml(p.name),
    tagline: stripHtml(p.short_description),
    description: stripHtml(p.description),
    accords: attr(p, 'Accords', 'Main Accords'),
    notes: notes.map((n) => ({ name: n, image: noteImage(n) })),
    inspiredBy: attr(p, 'Inspired By', 'Inspired')[0] ?? '',
    images: p.images.length
      ? p.images.map((i) => ({ src: i.src, alt: i.alt || stripHtml(p.name) }))
      : [{ src: FALLBACK_NOTE, alt: stripHtml(p.name) }],
    categories: p.categories.map((c) => stripHtml(c.name)),
    families,
    profile: {
      gender: pickOne(attr(p, 'For', 'Gender'), GENDER, 'unisex'),
      occasions: pickMany(attr(p, 'Occasion', 'Occasions'), OCCASION),
      seasons: pickMany(attr(p, 'Season', 'Seasons'), SEASON),
      presence: pickOne(attr(p, 'Presence', 'Projection'), PRESENCE, 'balanced'),
      longevity: pickOne(attr(p, 'Longevity'), LONGEVITY, 'extended'),
    },
    variations,
    totalSales: rank.sales,
    dateCreated: new Date(Date.UTC(2020, 0, 1) + rank.date * 86_400_000).toISOString().slice(0, 10),
  }
}

/** Loads every published product (with variation prices) from WooCommerce. */
export async function fetchWooCatalog(): Promise<Product[]> {
  const [byPopularity, byDate] = await Promise.all([
    storeApi<RawProduct[]>('products?per_page=100&orderby=popularity&order=desc'),
    storeApi<RawProduct[]>('products?per_page=100&orderby=date&order=asc'),
  ])
  const ids = byPopularity.flatMap((p) => p.variations.map((v) => v.id))
  const variationsById = new Map<number, RawProduct>()
  for (let i = 0; i < ids.length; i += 100) {
    const chunk = ids.slice(i, i + 100)
    const list = await storeApi<RawProduct[]>(`products?type=variation&per_page=100&include=${chunk.join(',')}`).catch(() => [])
    list.forEach((v) => variationsById.set(v.id, v))
  }
  const n = byPopularity.length
  return byPopularity
    .filter((p) => p.type !== 'variation')
    .map((p, i) =>
      mapProduct(p, variationsById, {
        sales: n - i,
        date: Math.max(0, byDate.findIndex((d) => d.id === p.id)),
      }),
    )
}

export async function fetchWooReviews(): Promise<Review[]> {
  const raw = await storeApi<RawReview[]>('products/reviews?per_page=50&orderby=date_gmt&order=desc')
  return raw.map((r) => ({
    id: r.id,
    productId: r.product_id,
    size: '',
    author: stripHtml(r.reviewer),
    rating: r.rating,
    text: stripHtml(r.review),
    verified: r.verified,
    date: r.date_created.slice(0, 10),
  }))
}
