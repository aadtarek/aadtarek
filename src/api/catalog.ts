import { families } from '../data/families'
import { products } from '../data/products'
import { reviews } from '../data/reviews'
import type { FamilySlug, Product, Review } from '../types'

/**
 * Catalogue data access. Every page/component reads products through here,
 * so connecting WooCommerce means re-implementing these functions against
 * `/wp-json/wc/store/v1/products` — nothing else in the UI changes.
 */

export type ProductSort = 'best-sellers' | 'newest' | 'price-asc' | 'price-desc' | 'name'

export interface ProductQuery {
  search?: string
  accord?: string
  family?: FamilySlug
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
  if (query.accord) list = list.filter((p) => p.accords.includes(query.accord!))
  if (query.family) list = list.filter((p) => p.families.includes(query.family!))
  return delay(sortProducts(list, query.sort))
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  return delay(products.find((p) => p.slug === slug))
}

export function getAllAccords(): string[] {
  return [...new Set(products.flatMap((p) => p.accords))].sort()
}

/** Synchronous lookup used by the cart to resolve line items. */
export function findProductById(id: number): Product | undefined {
  return products.find((p) => p.id === id)
}

/** Price range of full-size bottles (the 10 ML sample is shown separately). */
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
