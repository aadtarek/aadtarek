import type { FragranceFamily } from '../types'
import fresh from '../assets/categories/fresh.webp'
import freshSm from '../assets/categories/fresh-sm.webp'
import freshXs from '../assets/categories/fresh-xs.webp'
import oriental from '../assets/categories/oriental.webp'
import orientalSm from '../assets/categories/oriental-sm.webp'
import orientalXs from '../assets/categories/oriental-xs.webp'
import floral from '../assets/categories/floral.webp'
import floralSm from '../assets/categories/floral-sm.webp'
import floralXs from '../assets/categories/floral-xs.webp'
import fruity from '../assets/categories/fruity.webp'
import fruitySm from '../assets/categories/fruity-sm.webp'
import fruityXs from '../assets/categories/fruity-xs.webp'
import sweet from '../assets/categories/sweet.webp'
import sweetSm from '../assets/categories/sweet-sm.webp'
import sweetXs from '../assets/categories/sweet-xs.webp'

/** Maps to WooCommerce product categories on integration. */
export const families: FragranceFamily[] = [
  { slug: 'fresh', name: 'Fresh', tagline: 'Bright & refreshing.', keywords: ['Citrus', 'Aquatic', 'Fresh', 'Clean'], image: fresh, imageSm: freshSm, imageXs: freshXs },
  { slug: 'oriental', name: 'Oriental', tagline: 'Warm & distinctive.', keywords: ['Oud', 'Amber', 'Spicy', 'Leather', 'Smoke'], image: oriental, imageSm: orientalSm, imageXs: orientalXs },
  { slug: 'floral', name: 'Floral', tagline: 'Soft & expressive.', keywords: ['Rose', 'Jasmine', 'White Floral', 'Powdery'], image: floral, imageSm: floralSm, imageXs: floralXs },
  { slug: 'fruity', name: 'Fruity', tagline: 'Juicy & vibrant.', keywords: ['Fruits', 'Berries', 'Tropical', 'Crisp'], image: fruity, imageSm: fruitySm, imageXs: fruityXs },
  { slug: 'sweet', name: 'Sweet', tagline: 'Rich & addictive.', keywords: ['Vanilla', 'Gourmand', 'Caramel', 'Praline'], image: sweet, imageSm: sweetSm, imageXs: sweetXs },
]
