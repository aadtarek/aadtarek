import type { FragranceFamily } from '../types'
import fresh from '../assets/categories/fresh.webp'
import oriental from '../assets/categories/oriental.webp'
import floral from '../assets/categories/floral.webp'
import fruity from '../assets/categories/fruity.webp'
import sweet from '../assets/categories/sweet.webp'

/** Maps to WooCommerce product categories on integration. */
export const families: FragranceFamily[] = [
  { slug: 'fresh', name: 'Fresh', tagline: 'Bright & refreshing.', keywords: ['Citrus', 'Aquatic', 'Fresh', 'Clean'], image: fresh },
  { slug: 'oriental', name: 'Oriental', tagline: 'Warm & distinctive.', keywords: ['Oud', 'Amber', 'Spicy', 'Leather', 'Smoke'], image: oriental },
  { slug: 'floral', name: 'Floral', tagline: 'Soft & expressive.', keywords: ['Rose', 'Jasmine', 'White Floral', 'Powdery'], image: floral },
  { slug: 'fruity', name: 'Fruity', tagline: 'Juicy & vibrant.', keywords: ['Fruits', 'Berries', 'Tropical', 'Crisp'], image: fruity },
  { slug: 'sweet', name: 'Sweet', tagline: 'Rich & addictive.', keywords: ['Vanilla', 'Gourmand', 'Caramel', 'Praline'], image: sweet },
]
