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
}

export interface FragranceNote {
  name: string
  image: string
}

export interface ProductVariation {
  id: number
  /** Value of the "Size" attribute, e.g. "10 ML" */
  size: string
  price: Money
  /** Discovery sample (the "Try 10 ML" option) */
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
  /** Main accords shown as chips */
  accords: string[]
  notes: FragranceNote[]
  inspiredBy: string
  images: ProductImage[]
  categories: string[]
  /** Fragrance families used by "Explore by what you love" */
  families: FamilySlug[]
  variations: ProductVariation[]
  /** Total units sold — drives the Best Sellers ordering */
  totalSales: number
  /** ISO date — drives New Arrivals ordering */
  dateCreated: string
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
  key: string // `${productId}:${variationId}`
  productId: number
  variationId: number
  quantity: number
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
  items: { productId: number; variationId: number; name: string; size: string; price: Money; quantity: number }[]
  subtotal: Money
  shipping: Money
  total: Money
  paymentMethod: 'cod'
  shippingAddress: ShippingAddress
}

export interface Customer {
  id: number
  email: string
  firstName: string
  lastName: string
}
