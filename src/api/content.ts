/**
 * Editorial content from WordPress: journal posts, pages, FAQs, product
 * categories (fragrance families) and the Rfaheya product details box.
 * Without WordPress (demo mode) the pages use the built-in content in src/data.
 */
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
/** Fetches once per page view and shares the result between components. */
function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  if (!cache.has(key)) {
    const p = load()
    p.catch(() => cache.delete(key))
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
  return state.key === key ? { data: state.data, error: state.error } : { data: undefined, error: false }
}

// ---------------------------------------------------------------- posts

interface RawPost {
  slug: string
  date: string
  title: { rendered: string }
  excerpt: { rendered: string }
  content: { rendered: string }
  _embedded?: {
    'wp:featuredmedia'?: { source_url?: string; alt_text?: string }[]
    'wp:term'?: { taxonomy: string; name: string }[][]
  }
}

export interface WpArticle extends Article {
  html: string
}

function mapPost(p: RawPost): WpArticle {
  const words = stripHtml(p.content.rendered).split(/\s+/).filter(Boolean).length
  const category = p._embedded?.['wp:term']?.flat().find((t) => t.taxonomy === 'category' && t.name !== 'Uncategorized')?.name ?? 'Journal'
  return {
    slug: p.slug,
    title: stripHtml(p.title.rendered),
    excerpt: stripHtml(p.excerpt.rendered).replace(/\s*\[(…|&hellip;|\.\.\.)\]\s*$/, '…'),
    category,
    readMinutes: Math.max(1, Math.round(words / 200)),
    date: p.date.slice(0, 10),
    image: p._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? '',
    body: [],
    html: p.content.rendered,
  }
}

export const fetchPosts = () =>
  cached('posts', async () => (await wpGet<RawPost[]>('wp/v2/posts?_embed=wp:featuredmedia,wp:term&per_page=100')).map(mapPost))

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
}

export const fetchProductDetails = () => wpGet<Record<string, ProductDetails>>('rfaheya/v1/products')

export interface RawCategory {
  slug: string
  name: string
  description: string
  image: { src: string } | null
}

export const fetchProductCategories = () => wpGet<RawCategory[]>('wc/store/v1/products/categories?per_page=100')
