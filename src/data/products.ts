import type { FragranceNote, Product, ProductVariation } from '../types'
import vanillaOud from '../assets/products/vanilla-oud.webp'
import roseNoir from '../assets/products/rose-noir.webp'
import citrusLeather from '../assets/products/citrus-leather.webp'
import deepCurrent from '../assets/products/deep-current.webp'
import vanillaOudPortrait from '../assets/reviews/vanilla-oud.webp'
import roseNoirPortrait from '../assets/reviews/rose-noir.webp'
import deepCurrentPortrait from '../assets/reviews/deep-current.webp'

/**
 * Mock catalogue used until WooCommerce is connected.
 * Swap `src/api/catalog.ts` to read from the Store API instead.
 */

/**
 * NOTE: `profile` values (who it's for, occasions, seasons, presence, longevity)
 * are starting points for the Finder — review them against the real products.
 */
const noteImages = import.meta.glob<string>('../assets/notes/*.png', {
  eager: true,
  import: 'default',
})

function note(name: string, file: string): FragranceNote {
  return { name, image: noteImages[`../assets/notes/${file}.png`] }
}

function sizes(productId: number): ProductVariation[] {
  return [
    { id: productId * 10 + 1, size: '10 ML', price: 60, isSample: true, inStock: true },
    { id: productId * 10 + 2, size: '50 ML', price: 800, isSample: false, inStock: true },
    { id: productId * 10 + 3, size: '100 ML', price: 1200, isSample: false, inStock: true },
  ]
}

export const products: Product[] = [
  {
    id: 101,
    slug: 'vanilla-oud',
    name: 'Vanilla Oud',
    tagline: 'Warm. Dark. Addictive.',
    description:
      'A rich gourmand built on smooth Madagascan vanilla and smoky oud, wrapped in glowing amber and tonka for a trail that lingers long after you leave the room.',
    accords: ['Vanilla', 'Oud', 'Amber'],
    notes: [
      note('Vanilla', 'vanilla'),
      note('Oud', 'oud'),
      note('Amber', 'amber'),
      note('Tonka Bean', 'tonka-bean'),
      note('Musks', 'musk'),
    ],
    inspiredBy: 'Vanilla 28 by Kayali',
    images: [
      { src: vanillaOud, alt: 'Rfaheya Vanilla Oud eau de parfum with vanilla pods and white flowers' },
      { src: vanillaOudPortrait, alt: 'Rfaheya Vanilla Oud bottle, close-up' },
    ],
    categories: ['Oriental', 'Gourmand', 'Unisex'],
    families: ['oriental', 'sweet'],
    profile: { gender: 'unisex', occasions: ['date', 'special', 'club'], seasons: ['autumn', 'winter'], presence: 'bold', longevity: 'eternal' },
    variations: sizes(101),
    totalSales: 1840,
    dateCreated: '2026-03-12',
  },
  {
    id: 102,
    slug: 'rose-noir',
    name: 'Rose Noir',
    tagline: 'Elegant. Sophisticated. Timeless.',
    description:
      'Velvet rose petals meet dark incense and earthy patchouli, lifted by a thread of saffron. Polished, mysterious and made for evenings.',
    accords: ['Floral', 'Rose', 'Musky'],
    notes: [
      note('Rose', 'rose'),
      note('Incense', 'incense'),
      note('Patchouli', 'patchouli'),
      note('Saffron', 'saffron'),
      note('Musk', 'musk-2'),
    ],
    inspiredBy: 'Oud Satin Mood by MFK',
    images: [
      { src: roseNoir, alt: 'Rfaheya Rose Noir eau de parfum surrounded by red roses' },
      { src: roseNoirPortrait, alt: 'Rfaheya Rose Noir bottle, close-up' },
    ],
    categories: ['Floral', 'Women'],
    families: ['floral'],
    profile: { gender: 'women', occasions: ['date', 'special', 'everyday'], seasons: ['spring', 'autumn', 'winter'], presence: 'balanced', longevity: 'extended' },
    variations: sizes(102),
    totalSales: 1520,
    dateCreated: '2026-05-02',
  },
  {
    id: 103,
    slug: 'citrus-leather',
    name: 'Citrus Leather',
    tagline: 'Fresh. Refined. Confident.',
    description:
      'Sparkling bergamot and lemon cut through a spark of pink pepper before settling into supple leather and dry cedarwood.',
    accords: ['Citrus', 'Leather', 'Woody'],
    notes: [
      note('Bergamot', 'bergamot'),
      note('Lemon', 'lemon'),
      note('Pink Pepper', 'pink-pepper'),
      note('Leather', 'leather'),
      note('Cedarwood', 'cedarwood'),
    ],
    inspiredBy: 'Kologne Shield by Kilian',
    images: [{ src: citrusLeather, alt: 'Rfaheya Citrus Leather eau de parfum with lemons and green leaves' }],
    categories: ['Fresh', 'Men'],
    families: ['fresh'],
    profile: { gender: 'men', occasions: ['work', 'everyday', 'special'], seasons: ['spring', 'summer', 'all'], presence: 'balanced', longevity: 'extended' },
    variations: sizes(103),
    totalSales: 1310,
    dateCreated: '2026-08-20',
  },
  {
    id: 104,
    slug: 'deep-current',
    name: 'Deep Current',
    tagline: 'Clean. Modern. Versatile.',
    description:
      'A rush of sea air and cool aquatic notes brightened by bergamot and lavender, grounded by cedarwood and clean musk. Effortless from morning to night.',
    accords: ['Fresh', 'Aquatic', 'Citrus'],
    notes: [
      note('Sea Notes', 'sea-notes'),
      note('Bergamot', 'bergamot-2'),
      note('Lavender', 'lavender'),
      note('Cedarwood', 'cedarwood-2'),
      note('Musk', 'musk-3'),
    ],
    inspiredBy: 'Davidoff Cool Water Parfum',
    images: [
      { src: deepCurrent, alt: 'Rfaheya Deep Current eau de parfum on rocks with ocean spray' },
      { src: deepCurrentPortrait, alt: 'Rfaheya Deep Current bottle, close-up' },
    ],
    categories: ['Fresh', 'Aquatic', 'Men'],
    families: ['fresh'],
    profile: { gender: 'men', occasions: ['everyday', 'work', 'club'], seasons: ['summer', 'spring', 'all'], presence: 'balanced', longevity: 'standard' },
    variations: sizes(104),
    totalSales: 1185,
    dateCreated: '2026-09-15',
  },
]
