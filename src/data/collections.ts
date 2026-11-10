import type { Product } from '../types'
import perfumeLab from '../assets/standard/background.webp'
import perfumeLabCard from '../assets/standard/background-800.webp'
import ledger from '../assets/finder/for-men.webp'
import serenity from '../assets/finder/for-women.webp'
import discovery from '../assets/finder/more-preferences.webp'
import gifts from '../assets/finder/landing-cta.webp'
import { siteImage, SITE_IMAGES } from '../config'

/**
 * The pictures chosen in the dashboard (Settings → Site images): the Collections page card (the
 * name and line are part of it; a phone copy too) and the banner on the collection's own page.
 */
const pictures = <T extends { slug: string; image: string }>(c: T) => {
  const key = c.slug.replace(/-/g, '_')
  const built = c.image
  return Object.defineProperties(c, {
    image: { get: () => siteImage(`colhero_${key}`, built), enumerable: true },
    card: { get: () => SITE_IMAGES[`col_${key}`] || undefined, enumerable: true },
    cardMobile: { get: () => SITE_IMAGES[`col_${key}_m`] || undefined, enumerable: true },
  }) as T & Pick<Collection, 'card' | 'cardMobile'>
}

export interface Collection {
  slug: string
  name: string
  label: string
  tagline: string
  description: string
  image: string
  /** A lighter 800 × 500 copy for the cards (16:10), when the picture is large */
  smallCard?: string
  /** The card picked in the dashboard, 16:10 (the name and line are part of the picture) */
  card?: string
  /** The same card for phones, 5:4 */
  cardMobile?: string
  /** 'list' shows matching products; the others render an interactive builder. */
  kind: 'list' | 'discovery' | 'gift'
  includes?: (p: Product) => boolean
}

/** Maps to WooCommerce product categories / tags on integration. */
export const collections: Collection[] = [
  pictures({
    slug: 'perfume-lab',
    name: 'Perfume Lab',
    label: 'Perfume Lab (Inspired)',
    tagline: 'Inspired by the scents you love.',
    description:
      'Our inspired collection: familiar fragrances re-composed with quality materials and high concentration, each with its own Rfaheya signature.',
    image: perfumeLab,
    smallCard: perfumeLabCard,
    kind: 'list',
    includes: () => true,
  }),
  pictures({
    slug: 'ledger',
    name: 'Ledger',
    label: 'Ledger (Men)',
    tagline: 'Confident. Refined. Yours.',
    description: 'Fragrances composed for men — from crisp office freshness to deep evening warmth. Unisex scents included.',
    image: ledger,
    kind: 'list',
    includes: (p) => p.profile.gender !== 'women',
  }),
  pictures({
    slug: 'serenity',
    name: 'Serenity',
    label: 'Serenity (Women)',
    tagline: 'Elegant. Soft. Captivating.',
    description: 'Fragrances composed for women — expressive florals and warm, addictive signatures. Unisex scents included.',
    image: serenity,
    kind: 'list',
    includes: (p) => p.profile.gender !== 'men',
  }),
  pictures({
    slug: 'discovery-sets',
    name: 'Discovery Sets',
    label: 'Discovery Sets',
    tagline: 'Build your own set of 10 or 20 samples.',
    description: 'Choose the scents you’re curious about, live with them for a few days, then commit to your favorite full bottle.',
    image: discovery,
    kind: 'discovery',
  }),
  pictures({
    slug: 'gift-boxes',
    name: 'Gift Boxes',
    label: 'Gift Boxes',
    tagline: 'A scent to remember you by.',
    description: 'Fill a box with any fragrances you like, each in its own size, add a personal message, and we’ll wrap it as a gift.',
    image: gifts,
    kind: 'gift',
  }),
]

export function findCollection(slug: string) {
  return collections.find((c) => c.slug === slug)
}
