import { families } from '../data/families'
import type { FamilySlug, Product, Review, WearVideo } from '../types'
import { fetchBootstrap, primeCache, fetchNotes, fetchProductCategories, fetchProductDetails, fetchVideos, type RawCategory } from './content'
import { buildCatalog, fetchWooCatalog, fetchWooReviews, mapReviews, setNoteLibrary } from './woo'
import { applyStoreSettings } from '../config'
import { fetchStoreSettings, isWoo, stripHtml, type StoreSettings } from './wp'

/**
 * The catalogue is loaded once at start-up (see main.tsx) and then read
 * synchronously everywhere. With WordPress connected it comes from
 * WooCommerce; otherwise from the demo data in src/data (loaded only then).
 */
let products: Product[] = []
let reviews: Review[] = []
let videos: WearVideo[] = []

export async function loadCatalog(): Promise<void> {
  if (!isWoo) {
    const [p, r, v] = await Promise.all([import('../data/products'), import('../data/reviews'), import('../data/videos')])
    products = p.products
    reviews = r.reviews
    videos = v.videos
    return
  }
  // One request when the rfaheya.php mu-plugin is up to date…
  const boot = await fetchBootstrap().catch(() => null)
  if (boot?.products?.length) {
    setNoteLibrary(boot.notes ?? [])
    if (boot.faqs) primeCache('faqs', boot.faqs.map((f) => ({ q: stripHtml(f.q), html: f.a })))
    products = buildCatalog(boot.products, boot.dateOrder ?? [], boot.variations ?? [], boot.details ?? {})
    applyLoaded(mapReviews(boot.reviews ?? []), boot.videos ?? [], boot.settings ?? {}, boot.categories ?? [])
    return
  }
  // …otherwise the individual WooCommerce / WordPress requests.
  // Optional extras: without the rfaheya.php mu-plugin (or with no categories) the defaults stay.
  const [details, categories, settings, notes, vids] = await Promise.all([
    fetchProductDetails().catch(() => ({})),
    fetchProductCategories().catch(() => []),
    fetchStoreSettings().catch(() => ({})),
    fetchNotes().catch(() => []),
    fetchVideos().catch(() => [] as WearVideo[]),
  ])
  setNoteLibrary(notes)
  const [list, revs] = await Promise.all([fetchWooCatalog(details), fetchWooReviews().catch(() => [] as Review[])])
  products = list
  applyLoaded(revs, vids, settings, categories)
}

function applyLoaded(revs: Review[], vids: WearVideo[], settings: StoreSettings, categories: RawCategory[]) {
  // Only show reviews and videos for products that are actually in the catalogue.
  reviews = revs.filter((r) => products.some((p) => p.id === r.productId))
  videos = vids.filter((v) => v.src && products.some((p) => p.id === v.productId))
  applyStoreSettings(settings)
  // Fragrance families take their name, tagline and image from the product categories.
  for (const family of families) {
    const c = categories.find((x) => x.slug === family.slug)
    if (!c) continue
    family.name = stripHtml(c.name) || family.name
    family.tagline = stripHtml(c.description) || family.tagline
    if (c.image?.src) family.image = c.image.src
  }
}

/** Product + variation for a variation id (cart lines reference variations). */
export function findByVariationId(variationId: number) {
  for (const product of products) {
    const variation = product.variations.find((v) => v.id === variationId)
    if (variation) return { product, variation }
  }
  return undefined
}

/**
 * Catalogue data access. Every page/component reads products through here,
 * so connecting WooCommerce means re-implementing these functions against
 * `/wp-json/wc/store/v1/products` — nothing else in the UI changes.
 */

export type ProductSort = 'best-sellers' | 'newest' | 'price-asc' | 'price-desc' | 'name'

export interface ProductQuery {
  search?: string
  /** Match products having ANY of these accords */
  accords?: string[]
  /** Match products in ANY of these families */
  families?: FamilySlug[]
  sort?: ProductSort
}

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), 0))
}

export function matchesSearch(product: Product, term: string): boolean {
  const q = term.trim().toLowerCase()
  if (!q) return true
  const haystack = [
    product.name,
    product.tagline,
    product.inspiredBy,
    ...product.accords,
    ...product.categories,
    ...product.notes.map((n) => n.name),
  ]
    .join(' ')
    .toLowerCase()
  return q.split(/\s+/).every((word) => haystack.includes(word))
}

export function sortProducts(list: Product[], sort: ProductSort = 'best-sellers'): Product[] {
  const sorted = [...list]
  switch (sort) {
    case 'best-sellers':
      return sorted.sort((a, b) => b.totalSales - a.totalSales)
    case 'newest':
      return sorted.sort((a, b) => b.dateCreated.localeCompare(a.dateCreated))
    case 'price-asc':
      return sorted.sort((a, b) => priceRange(a).min - priceRange(b).min)
    case 'price-desc':
      return sorted.sort((a, b) => priceRange(b).max - priceRange(a).max)
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
  }
}

export async function getProducts(query: ProductQuery = {}): Promise<Product[]> {
  let list = products.filter((p) => matchesSearch(p, query.search ?? ''))
  const { accords, families: fams } = query
  if (accords?.length) list = list.filter((p) => p.accords.some((a) => accords.includes(a)))
  if (fams?.length) list = list.filter((p) => p.families.some((f) => fams.includes(f)))
  return delay(sortProducts(list, query.sort))
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  return delay(products.find((p) => p.slug === slug))
}

export function getAllProducts(): Product[] {
  return products
}

/** Other products sharing a family or accord, best matches first. */
export function relatedProducts(product: Product, limit = 4): Product[] {
  const score = (p: Product) =>
    p.families.filter((f) => product.families.includes(f)).length * 2 + p.accords.filter((a) => product.accords.includes(a)).length
  return sortProducts(products.filter((p) => p.id !== product.id))
    .sort((a, b) => score(b) - score(a))
    .slice(0, limit)
}

export function getAllAccords(): string[] {
  return [...new Set(products.flatMap((p) => p.accords))].sort()
}

/** Synchronous lookup used by the cart to resolve line items. */
export function findProductById(id: number): Product | undefined {
  return products.find((p) => p.id === id)
}

/** Price range of full-size bottles (the 5 ML sample is shown separately). */
export function priceRange(product: Product): { min: number; max: number } {
  const prices = product.variations.filter((v) => !v.isSample).map((v) => v.price)
  return { min: Math.min(...prices), max: Math.max(...prices) }
}

export function sampleVariation(product: Product) {
  return product.variations.find((v) => v.isSample)
}

export function fullSizeVariations(product: Product) {
  return product.variations.filter((v) => !v.isSample)
}

export function getFamilies() {
  return families
}

export function findFamily(slug: string) {
  return families.find((f) => f.slug === slug)
}

export async function getReviews(productId?: number): Promise<Review[]> {
  const list = productId ? reviews.filter((r) => r.productId === productId) : reviews
  return delay([...list].sort((a, b) => b.date.localeCompare(a.date)))
}

/** Store-wide rating summary. */
export function ratingSummary(list: Review[] = reviews) {
  const count = list.length
  const average = count ? list.reduce((n, r) => n + r.rating, 0) / count : 0
  return { average, count }
}

/** "Wear report" videos, optionally only those of one product. */
export function getVideos(productId?: number): WearVideo[] {
  return productId ? videos.filter((v) => v.productId === productId) : videos
}

/** Opening / heart / dry down; when not set, the key notes are spread over the three. */
export function composition(product: Product) {
  const c = product.composition
  if (c.opening.length || c.heart.length || c.drydown.length) return c
  const n = product.notes.map((x) => x.name)
  const a = Math.ceil(n.length / 3)
  const b = Math.ceil((n.length - a) / 2)
  return { opening: n.slice(0, a), heart: n.slice(a, a + b), drydown: n.slice(a + b) }
}

export function familyName(slug: FamilySlug): string {
  return families.find((f) => f.slug === slug)?.name ?? slug
}

/** Icon for a note name (WordPress notes library, then the bundled artwork). */
export { noteImage as noteFor } from './woo'
