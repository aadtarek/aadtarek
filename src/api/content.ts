/**
 * Editorial content from WordPress: journal posts, pages, FAQs, product
 * categories (fragrance families) and the Rfaheya product details box.
 * Without WordPress (demo mode) the pages use the built-in content in src/data.
 */
import type { WearVideo } from '../types'
import { useEffect, useState } from 'react'
import type { Article } from '../data/journal'
import { stripHtml, wp } from './wp'

/** GET a WordPress REST route, e.g. `wp/v2/posts?per_page=10`. */
async function wpGet<T>(route: string): Promise<T> {
  if (!wp) throw new Error('WordPress is not connected')
  const res = await fetch(`${wp.siteUrl}/wp-json/${route}`, { credentials: 'omit', headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`WordPress request failed (${res.status})`)
  return (await res.json()) as T
}

const cache = new Map<string, Promise<unknown>>()
/** Results already in hand, so the first render can show them (no layout shift). */
const settled = new Map<string, unknown>()

/** Seeds a request with data that arrived another way (the start-up bootstrap). */
export function primeCache(key: string, data: unknown) {
  if (!cache.has(key)) {
    cache.set(key, Promise.resolve(data))
    settled.set(key, data)
  }
}
/** Fetches once per page view and shares the result between components. */
function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  if (!cache.has(key)) {
    const p = load()
    p.then((d) => settled.set(key, d), () => cache.delete(key))
    cache.set(key, p)
  }
  return cache.get(key) as Promise<T>
}

/** State for an async WordPress request: undefined while loading. */
export function useWp<T>(key: string | null, load: () => Promise<T>): { data: T | undefined; error: boolean } {
  const [state, setState] = useState<{ key: string | null; data?: T; error: boolean }>({ key: null, error: false })
  useEffect(() => {
    if (!key) return
    let alive = true
    cached(key, load).then(
      (data) => alive && setState({ key, data, error: false }),
      () => alive && setState({ key, error: true }),
    )
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  if (state.key === key) return { data: state.data, error: state.error }
  return { data: key && settled.has(key) ? (settled.get(key) as T) : undefined, error: false }
}

// ---------------------------------------------------------------- posts

interface RawPost {
  slug: string
  date: string
  title: { rendered: string }
  excerpt: { rendered: string }
  content: { rendered: string }
  _embedded?: {
    'wp:featuredmedia'?: { source_url?: string; alt_text?: string; media_details?: { sizes?: Record<string, { source_url: string; width: number }> } }[]
    'wp:term'?: { taxonomy: string; name: string }[][]
  }
}

export interface WpArticle extends Article {
  html: string
  /** Featured image sizes, for <img srcset> */
  srcset?: string
}

function mapPost(p: RawPost): WpArticle {
  const words = stripHtml(p.content.rendered).split(/\s+/).filter(Boolean).length
  const media = p._embedded?.['wp:featuredmedia']?.[0]
  const sizes = Object.values(media?.media_details?.sizes ?? {}).filter((x) => x.width >= 600)
  const category = p._embedded?.['wp:term']?.flat().find((t) => t.taxonomy === 'category' && t.name !== 'Uncategorized')?.name ?? 'Journal'
  return {
    slug: p.slug,
    title: stripHtml(p.title.rendered),
    excerpt: stripHtml(p.excerpt.rendered).replace(/\s*\[(…|&hellip;|\.\.\.)\]\s*$/, '…'),
    category,
    readMinutes: Math.max(1, Math.round(words / 200)),
    date: p.date.slice(0, 10),
    image: media?.source_url ?? '',
    srcset: sizes.length ? [...new Map(sizes.map((x) => [x.width, `${x.source_url} ${x.width}w`])).values()].join(', ') : undefined,
    body: [],
    html: p.content.rendered,
  }
}

export const fetchPosts = () =>
  cached('posts', async () => ((window.__rfPosts as RawPost[] | undefined) ?? (await wpGet<RawPost[]>('wp/v2/posts?_embed=wp:featuredmedia,wp:term&per_page=100'))).map(mapPost))

export const fetchPost = (slug: string) =>
  cached(`post:${slug}`, async () => {
    const list = await wpGet<RawPost[]>(`wp/v2/posts?_embed=wp:featuredmedia,wp:term&slug=${encodeURIComponent(slug)}`)
    return list[0] ? mapPost(list[0]) : null
  })

// ---------------------------------------------------------------- pages

export interface WpPage {
  slug: string
  title: string
  eyebrow: string
  intro: string
  html: string
}

interface RawPage {
  slug: string
  title: { rendered: string }
  excerpt?: { rendered: string }
  content: { rendered: string }
  meta?: { rfaheya_eyebrow?: string }
}

export const fetchPage = (slug: string) =>
  cached(`page:${slug}`, async (): Promise<WpPage | null> => {
    const list = await wpGet<RawPage[]>(`wp/v2/pages?slug=${encodeURIComponent(slug)}`)
    const p = list[0]
    if (!p) return null
    return {
      slug: p.slug,
      title: stripHtml(p.title.rendered),
      eyebrow: p.meta?.rfaheya_eyebrow ?? '',
      intro: stripHtml(p.excerpt?.rendered ?? ''),
      html: p.content.rendered,
    }
  })

/** Published pages (for "Related" links): slug, title and section label. */
export const fetchPageIndex = () => cached('pages', () => wpGet<{ slug: string; title: string; eyebrow: string }[]>('rfaheya/v1/pages'))

// ---------------------------------------------------------------- FAQs

export const fetchFaqs = () =>
  cached('faqs', async () => (await wpGet<{ q: string; a: string }[]>('rfaheya/v1/faqs')).map((f) => ({ q: stripHtml(f.q), html: f.a })))

// ---------------------------------------------------------------- catalog extras (loaded at start-up)

/** Product → values from the "Rfaheya details" box in the product editor. */
export interface ProductDetails {
  inspired_by?: string
  accords?: string[]
  notes?: string[]
  gender?: string
  occasions?: string[]
  seasons?: string[]
  presence?: string
  longevity?: string
  badge?: string
  dna_image_url?: string
  opening?: string[]
  heart?: string[]
  drydown?: string[]
  standard?: Record<string, string>
}

export const fetchProductDetails = () => wpGet<Record<string, ProductDetails>>('rfaheya/v1/products')

export interface RawCategory {
  slug: string
  name: string
  description: string
  image: { src: string } | null
}

export const fetchProductCategories = () => wpGet<RawCategory[]>('wc/store/v1/products/categories?per_page=100')

/** The notes library (Products → Fragrance notes): name and icon. */
export const fetchNotes = () => wpGet<{ name: string; icon: string }[]>('rfaheya/v1/notes')

/** "Wear report" videos (Products → Videos). */
export const fetchVideos = () => wpGet<WearVideo[]>('rfaheya/v1/videos')

/** Everything the storefront needs at start-up, in one request (see rfaheya.php). */
export interface Bootstrap {
  settings: import('./wp').StoreSettings
  details: Record<string, ProductDetails>
  notes: { name: string; icon: string }[]
  videos: WearVideo[]
  categories: RawCategory[]
  products: import('./woo').RawProduct[]
  dateOrder: number[]
  variations: import('./woo').RawProduct[]
  reviews: import('./woo').RawReview[]
  faqs?: { q: string; a: string }[]
}

declare global {
  interface Window {
    /** Started by index.html (see vite.config.ts) so it loads alongside the JavaScript. */
    __rfBoot?: Promise<Bootstrap | null>
    /** The journal's posts, put in the /journal page by WordPress (rfaheya.php) */
    __rfPosts?: unknown[]
  }
}

export async function fetchBootstrap(): Promise<Bootstrap | null> {
  const early = window.__rfBoot ? await window.__rfBoot : null
  return early ?? wpGet<Bootstrap>('rfaheya/v1/bootstrap')
}
