import type { StoreSettings } from './api/wp'

/** Store-wide settings. With WordPress connected, shipping comes from WooCommerce shipping zones. */
/** Free-shipping bar and rule; with WordPress: Settings → Rfaheya Store → Free shipping. */
export const FREE_SHIPPING = { enabled: true, min: 1200 }
/** The default minimum, for text built before the settings arrive. */
export const FREE_SHIPPING_THRESHOLD = FREE_SHIPPING.min
export const FREE_SHIPPING_GOVERNORATES = ['Cairo', 'Alexandria']
export const FLAT_SHIPPING_RATE = 70
/**
 * Spend more, save more: from `min` the order gets `percent` off and ships free anywhere.
 * With WordPress: Settings → Rfaheya Store → Free shipping & offers (applied in the WooCommerce cart).
 */
export const SPEND_OFFER = { enabled: true, min: 2500, percent: 20 }

/** The spend-more discount for an amount (after the bundle discount, before coupons). */
export function spendDiscount(amount: number) {
  if (!SPEND_OFFER.enabled || SPEND_OFFER.min <= 0 || amount < SPEND_OFFER.min) return 0
  return Math.round((amount * SPEND_OFFER.percent) / 100)
}

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
    'Free shipping in Cairo & Alexandria on orders over 1200 EGP',
    'Try 5 ML first — discover your scent before committing',
    'Zero risk guarantee',
  ],
  hero: {
    eyebrow: 'Fragrances made personal',
    /** A line break in the title starts a new line. */
    title: 'Speak\nyour scent.',
    text: 'Discover inspired fragrances crafted with quality materials, high concentration and a signature Rfaheya experience.',
    /** Image URL; empty uses the bundled hero image. */
    image: '',
    /** Smaller versions of the image (WordPress srcset) */
    srcset: '',
  },
}

export const HOME = { announcements: [...DEFAULT_HOME.announcements], hero: { ...DEFAULT_HOME.hero } }

/**
 * "Build your bundle": any `count` bottles of `size` for `price`.
 * With WordPress: Settings → Rfaheya Store → Bundle (WooCommerce applies the same discount in the cart).
 */
export const BUNDLE = {
  enabled: true,
  title: 'Build your trio.',
  text: 'Pick any three fragrances in 30 ML and pay less for the set.',
  size: '30 ML',
  count: 3,
  price: 1200,
}

/**
 * Gift boxes: any fragrances in one box, packaging priced by how many are in it.
 * With WordPress: Settings → Rfaheya Store → Gift boxes (a hidden "Gift box" product
 * in WooCommerce carries the packaging price, one variation per number of fragrances).
 */
export const GIFT_BOX = {
  enabled: true,
  max: 6,
  /** Packaging price by number of fragrances in the box */
  prices: { 1: 60, 2: 90, 3: 120, 4: 150, 5: 180, 6: 200 } as Record<number, number>,
  productId: 0,
  /** WooCommerce variation id by number of fragrances */
  variations: {} as Record<number, number>,
}

/** Loyalty points and the welcome discount (Settings → Rfaheya Store → Loyalty points). */
export const LOYALTY = {
  enabled: true,
  /** Points per 1 EGP spent */
  earn: 1,
  /** EGP per point */
  value: 0.05,
  /** Fewest points that can be used */
  min: 200,
  welcome: true,
  welcomePercent: 5,
}

/** Points an amount earns. */
export const pointsFor = (amount: number) => (LOYALTY.enabled ? Math.floor(Math.max(0, amount) * LOYALTY.earn) : 0)

/** Packaging price for a box of `count` fragrances. */
export function giftBoxPrice(count: number): number {
  for (let n = Math.min(count, GIFT_BOX.max); n >= 1; n--) if (GIFT_BOX.prices[n] != null) return GIFT_BOX.prices[n]
  return 0
}

/** Bundle discount for a cart: every full set of `count` bundle-size bottles costs `price`. */
export function bundleDiscount(lines: { size: string; price: number; quantity: number }[]): number {
  if (!BUNDLE.enabled || BUNDLE.count < 2) return 0
  const want = BUNDLE.size.replace(/\s+/g, '').toLowerCase()
  const prices = lines
    .filter((l) => l.size.replace(/\s+/g, '').toLowerCase() === want)
    .flatMap((l) => Array<number>(l.quantity).fill(l.price))
    .sort((a, b) => b - a)
  let discount = 0
  for (let i = 0; i + BUNDLE.count <= prices.length; i += BUNDLE.count) {
    discount += Math.max(0, prices.slice(i, i + BUNDLE.count).reduce((n, p) => n + p, 0) - BUNDLE.price)
  }
  return discount
}

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
  const b = settings.bundle
  if (b) {
    if (typeof b.enabled === 'boolean') BUNDLE.enabled = b.enabled
    if (b.title?.trim()) BUNDLE.title = b.title.trim()
    if (b.text?.trim()) BUNDLE.text = b.text.trim()
    if (b.size?.trim()) BUNDLE.size = b.size.trim()
    if (Number(b.count) >= 2) BUNDLE.count = Number(b.count)
    if (Number(b.price) > 0) BUNDLE.price = Number(b.price)
  }
  const g = settings.gift
  if (g) {
    if (typeof g.enabled === 'boolean') GIFT_BOX.enabled = g.enabled
    if (Number(g.max) >= 1) GIFT_BOX.max = Number(g.max)
    if (g.prices && typeof g.prices === 'object') {
      const prices = Object.fromEntries(Object.entries(g.prices).map(([n, v]) => [Number(n), Number(v)]).filter(([n, v]) => n >= 1 && v >= 0))
      if (Object.keys(prices).length) GIFT_BOX.prices = prices
    }
    if (Number(g.productId) > 0) GIFT_BOX.productId = Number(g.productId)
    if (g.variations && typeof g.variations === 'object') GIFT_BOX.variations = Object.fromEntries(Object.entries(g.variations).map(([n, id]) => [Number(n), Number(id)]))
  }
  const l = settings.loyalty
  if (l) {
    if (typeof l.enabled === 'boolean') LOYALTY.enabled = l.enabled
    if (Number(l.earn) >= 0) LOYALTY.earn = Number(l.earn)
    if (Number(l.value) >= 0) LOYALTY.value = Number(l.value)
    if (Number(l.min) >= 1) LOYALTY.min = Number(l.min)
    if (typeof l.welcome === 'boolean') LOYALTY.welcome = l.welcome
    if (Number(l.welcomePercent) >= 0) LOYALTY.welcomePercent = Number(l.welcomePercent)
  }
  const f = settings.shipping
  if (f) {
    if (typeof f.freeShipping === 'boolean') FREE_SHIPPING.enabled = f.freeShipping
    if (Number(f.freeMin) > 0) FREE_SHIPPING.min = Number(f.freeMin)
    if (typeof f.offer === 'boolean') SPEND_OFFER.enabled = f.offer
    if (Number(f.offerMin) > 0) SPEND_OFFER.min = Number(f.offerMin)
    if (Number(f.offerPercent) > 0) SPEND_OFFER.percent = Math.min(100, Number(f.offerPercent))
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
  if (FREE_SHIPPING.enabled && FREE_SHIPPING_GOVERNORATES.includes(governorate) && subtotal >= FREE_SHIPPING.min) return 0
  if (spendDiscount(subtotal) > 0) return 0
  return FLAT_SHIPPING_RATE
}
