import type { StoreSettings } from './api/wp'

/** Store-wide settings. With WordPress connected, shipping comes from WooCommerce shipping zones. */
export const FREE_SHIPPING_THRESHOLD = 1000
export const FREE_SHIPPING_GOVERNORATES = ['Cairo', 'Alexandria']
export const FLAT_SHIPPING_RATE = 70

/** Defaults; with WordPress connected these are overridden from Settings → Rfaheya Store. */
const DEFAULT_SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/',
  tiktok: 'https://www.tiktok.com/',
  youtube: 'https://www.youtube.com/',
  facebook: 'https://www.facebook.com/',
}

const DEFAULT_CONTACT = {
  email: 'hello@rfaheya.com',
  phone: '+20 100 000 0000',
  whatsapp: '201000000000', // international format, digits only
  hours: 'Sat – Thu · 10 AM – 8 PM',
  location: 'Cairo, Egypt',
  /** InstaPay address customers transfer to (shown at checkout). */
  instapay: 'rfaheya@instapay',
}

export const SOCIAL_LINKS = { ...DEFAULT_SOCIAL_LINKS }
export const CONTACT = { ...DEFAULT_CONTACT }

/** Home page copy. With WordPress: Settings → Rfaheya Store → Home page. */
export const DEFAULT_HOME = {
  announcements: [
    'Free shipping in Cairo & Alexandria on orders over 1000 EGP',
    'Try 10 ML first — discover your scent before committing',
    'Zero risk guarantee',
  ],
  hero: {
    eyebrow: 'Fragrances made personal',
    /** A line break in the title starts a new line. */
    title: 'Speak\nyour scent.',
    text: 'Discover inspired fragrances crafted with quality materials, high concentration and a signature Rfaheya experience.',
    /** Image URL; empty uses the bundled hero image. */
    image: '',
  },
}

export const HOME = { announcements: [...DEFAULT_HOME.announcements], hero: { ...DEFAULT_HOME.hero } }

/** Applies the WordPress settings (called once before the app renders). */
export function applyStoreSettings(settings: StoreSettings) {
  const merge = <T extends Record<string, string>>(target: T, overrides?: Partial<Record<string, string>>) => {
    for (const key of Object.keys(target) as (keyof T)[]) {
      const value = overrides?.[key as string]
      if (typeof value === 'string' && value.trim()) target[key] = value.trim() as T[keyof T]
    }
  }
  merge(CONTACT, settings.contact)
  merge(SOCIAL_LINKS, settings.social)
  const home = settings.home
  if (home) {
    const lines = (home.announcements ?? []).map((l) => l.trim()).filter(Boolean)
    if (lines.length) HOME.announcements = lines
    merge(HOME.hero, home.hero)
  }
}

export const GOVERNORATES = [
  'Cairo',
  'Giza',
  'Alexandria',
  'Qalyubia',
  'Sharqia',
  'Dakahlia',
  'Gharbia',
  'Monufia',
  'Beheira',
  'Kafr El Sheikh',
  'Damietta',
  'Port Said',
  'Ismailia',
  'Suez',
  'Faiyum',
  'Beni Suef',
  'Minya',
  'Asyut',
  'Sohag',
  'Qena',
  'Luxor',
  'Aswan',
  'Red Sea',
  'Matrouh',
  'New Valley',
  'North Sinai',
  'South Sinai',
]

export function shippingCost(subtotal: number, governorate: string): number {
  if (subtotal === 0) return 0
  if (FREE_SHIPPING_GOVERNORATES.includes(governorate) && subtotal >= FREE_SHIPPING_THRESHOLD) return 0
  return FLAT_SHIPPING_RATE
}
