import type { FamilySlug, Product, ScentProfile } from '../types'
import seed from './catalog-seed.json'
import { isSampleSize } from '../api/woo'

/**
 * Demo catalogue, used when the site runs without WordPress.
 *
 * The same `catalog-seed.json` generates the WooCommerce import file
 * (`npm run products:csv`), so the demo data and the real store start out identical.
 * NOTE: `profile` values (who it's for, occasions, seasons, presence, longevity)
 * are starting points for the Finder — review them against the real products.
 */

const images = import.meta.glob<string>(['../assets/products/*.webp', '../assets/reviews/*.webp'], { eager: true, import: 'default' })
const noteImages = import.meta.glob<string>('../assets/notes/*.png', { eager: true, import: 'default' })

export const products: Product[] = seed.map((p) => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  tagline: p.tagline,
  description: p.description,
  story: p.story,
  badge: p.badge,
  accords: p.accords,
  notes: p.notes.map((n) => ({ name: n.name, image: noteImages[`../assets/notes/${n.icon}.png`] })),
  composition: p.composition,
  standard: p.standard as Product['standard'],
  inspiredBy: p.inspiredBy,
  images: p.images.map((i) => ({ src: images[`../assets/${i.file}`], alt: i.alt })),
  categories: p.categories,
  families: p.families as FamilySlug[],
  profile: p.profile as ScentProfile,
  variations: p.sizes.map((s, i) => ({
    id: p.id * 10 + i + 1,
    size: s.size,
    price: s.price,
    isSample: isSampleSize(s.size),
    inStock: true,
  })),
  totalSales: p.totalSales,
  dateCreated: p.dateCreated,
}))
