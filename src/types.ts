/**
 * Domain types for the storefront.
 *
 * These mirror the shape of WooCommerce's Store API (`/wp-json/wc/store/v1`):
 * a product is a "variable product" whose sizes are variations, and the
 * fragrance-specific fields (notes, accords, inspired by) map to product
 * attributes / custom meta. When we connect WordPress, only `src/api/*`
 * changes — it will translate Woo responses into these types.
 */

export type Money = number // whole EGP

export interface ProductImage {
  src: string
  alt: string
  /** Smaller versions from WordPress (`<img srcset>`) */
  srcset?: string
}

export interface FragranceNote {
  name: string
  image: string
}

export interface ProductVariation {
  id: number
  /** Value of the "Size" attribute, e.g. "50 ML" */
  size: string
  price: Money
  /** Discovery sample (the "Try 5 ML" option) */
  isSample: boolean
  inStock: boolean
}

export interface Product {
  id: number
  slug: string
  name: string
  /** Short description, e.g. "Warm. Dark. Addictive." */
  tagline: string
  description: string
  /** Long description as paragraphs ("The fragrance" section) */
  story: string[]
  /** Small label on the image, e.g. "Best Seller" or "New" */
  badge: string
  /** Main accords shown as chips */
  accords: string[]
  /** Key notes (cards and "Key notes") */
  notes: FragranceNote[]
  /** Opening / heart / dry down note names ("The composition") */
  composition: Composition
  /** Rfaheya Standard™ level per dimension, e.g. { character: 'Universal' } */
  standard: Partial<Record<StandardKey, string>>
  inspiredBy: string
  /** Bottle image for the DNA card on the product page (optional) */
  dnaImage?: string
  images: ProductImage[]
  categories: string[]
  /** Fragrance families used by "Explore by what you love" */
  families: FamilySlug[]
  /** Attributes used by the Rfaheya Finder (→ WooCommerce attributes / ACF on integration) */
  profile: ScentProfile
  variations: ProductVariation[]
  /** Total units sold — drives the Best Sellers ordering */
  totalSales: number
  /** ISO date — drives New Arrivals ordering */
  dateCreated: string
}

export interface Composition {
  opening: string[]
  heart: string[]
  drydown: string[]
}

export type StandardKey = 'character' | 'comfort' | 'density' | 'projection' | 'longevity' | 'evolution'

/** A "Wear report" video uploaded in WordPress, linked to one product. */
export interface WearVideo {
  id: number
  title: string
  /** Small label above the title, e.g. "Rfaheya Wear Report" */
  label: string
  /** e.g. "Warm · Bold · Evening" */
  tags: string
  src: string
  poster: string
  productId: number
}

export type Gender = 'men' | 'women' | 'unisex'
export type Occasion = 'everyday' | 'work' | 'date' | 'special' | 'club'
export type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'all'
export type Presence = 'soft' | 'balanced' | 'bold'
export type Longevity = 'standard' | 'extended' | 'eternal'

export interface ScentProfile {
  gender: Gender
  occasions: Occasion[]
  seasons: Season[]
  presence: Presence
  longevity: Longevity
}

export type FamilySlug = 'fresh' | 'oriental' | 'floral' | 'fruity' | 'sweet'

export interface FragranceFamily {
  slug: FamilySlug
  name: string
  tagline: string
  keywords: string[]
  image: string
}

export interface Review {
  id: number
  productId: number
  size: string
  author: string
  rating: number
  text: string
  verified: boolean
  date: string
}

export interface CartItem {
  key: string // `${productId}:${variationId}` (+ `:gift:<hash>` for gift lines)
  productId: number
  variationId: number
  quantity: number
  /** Optional gift message printed on a card inside the box */
  giftMessage?: string
}

export interface ShippingAddress {
  firstName: string
  lastName: string
  phone: string
  email: string
  governorate: string
  city: string
  address: string
  notes: string
}

export interface Order {
  id: number
  number: string
  createdAt: string
  status: 'processing'
  items: { productId: number; variationId: number; name: string; size: string; price: Money; quantity: number; giftMessage?: string }[]
  subtotal: Money
  shipping: Money
  total: Money
  /** 'cod', 'instapay' (demo) or a WooCommerce gateway id such as 'bacs' */
  paymentMethod: string
  shippingAddress: ShippingAddress
}

export interface Customer {
  id: number
  email: string
  firstName: string
  lastName: string
}
