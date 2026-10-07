import type { Product } from '../types'
import perfumeLab from '../assets/standard/background.webp'
import ledger from '../assets/finder/for-men.webp'
import serenity from '../assets/finder/for-women.webp'
import discovery from '../assets/finder/more-preferences.webp'
import gifts from '../assets/finder/landing-cta.webp'

export interface Collection {
  slug: string
  name: string
  label: string
  tagline: string
  description: string
  image: string
  /** 'list' shows matching products; the others render an interactive builder. */
  kind: 'list' | 'discovery' | 'gift'
  includes?: (p: Product) => boolean
}

/** Maps to WooCommerce product categories / tags on integration. */
export const collections: Collection[] = [
  {
    slug: 'perfume-lab',
    name: 'Perfume Lab',
    label: 'Perfume Lab (Inspired)',
    tagline: 'Inspired by the scents you love.',
    description:
      'Our inspired collection: familiar fragrances re-composed with quality materials and high concentration, each with its own Rfaheya signature.',
    image: perfumeLab,
    kind: 'list',
    includes: () => true,
  },
  {
    slug: 'ledger',
    name: 'Ledger',
    label: 'Ledger (Men)',
    tagline: 'Confident. Refined. Yours.',
    description: 'Fragrances composed for men — from crisp office freshness to deep evening warmth. Unisex scents included.',
    image: ledger,
    kind: 'list',
    includes: (p) => p.profile.gender !== 'women',
  },
  {
    slug: 'serenity',
    name: 'Serenity',
    label: 'Serenity (Women)',
    tagline: 'Elegant. Soft. Captivating.',
    description: 'Fragrances composed for women — expressive florals and warm, addictive signatures. Unisex scents included.',
    image: serenity,
    kind: 'list',
    includes: (p) => p.profile.gender !== 'men',
  },
  {
    slug: 'discovery-sets',
    name: 'Discovery Sets',
    label: 'Discovery Sets',
    tagline: 'Build your own set of 5 ML samples.',
    description: 'Choose the scents you’re curious about, live with them for a few days, then commit to your favorite full bottle.',
    image: discovery,
    kind: 'discovery',
  },
  {
    slug: 'gift-boxes',
    name: 'Gift Boxes',
    label: 'Gift Boxes',
    tagline: 'A scent to remember you by.',
    description: 'Choose a fragrance and size, add a personal message, and we’ll include it with the gift.',
    image: gifts,
    kind: 'gift',
  },
]

export function findCollection(slug: string) {
  return collections.find((c) => c.slug === slug)
}
