/**
 * Headless WordPress / WooCommerce connection.
 *
 * The storefront is deployed on its own (Vercel, Netlify, any static host)
 * and talks to WooCommerce on the WordPress site through the Store API.
 * Set the WordPress address at build time:
 *
 *   VITE_WP_URL=https://your-wordpress-site.com
 *
 * (see .env.headless). Without it the app runs on the built-in demo data.
 *
 * Cart sessions use WooCommerce's `Cart-Token` header rather than cookies,
 * so they work across domains: the token is kept in localStorage and sent
 * with every request; write requests carrying a valid token need no nonce.
 */

export interface WpConfig {
  /** e.g. https://example.com */
  siteUrl: string
  /** e.g. https://example.com/wp-json/wc/store/v1/ */
  storeApi: string
  /** WooCommerce My Account page (sign in, orders, addresses). */
  myAccountUrl: string
}

/** Editable in WordPress: Settings → Rfaheya Headless (served by the companion plugin). */
export interface StoreSettings {
  contact?: Partial<Record<'email' | 'phone' | 'whatsapp' | 'hours' | 'location' | 'instapay', string>>
  social?: Partial<Record<'instagram' | 'tiktok' | 'youtube' | 'facebook', string>>
  myAccountUrl?: string
}

const siteUrl = String(import.meta.env.VITE_WP_URL ?? '')
  .trim()
  .replace(/\/+$/, '')

export const isWoo = Boolean(siteUrl)

export const wp: WpConfig | undefined = isWoo
  ? { siteUrl, storeApi: `${siteUrl}/wp-json/wc/store/v1/`, myAccountUrl: `${siteUrl}/my-account/` }
  : undefined

const TOKEN_KEY = 'rfaheya.cartToken'

function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? ''
  } catch {
    return ''
  }
}

function writeToken(value: string) {
  cartToken = value
  try {
    if (value) localStorage.setItem(TOKEN_KEY, value)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Private mode etc.: the token still lives for this page view.
  }
}

let cartToken = readToken()
let nonce = ''

export class StoreApiError extends Error {
  code: string
  status: number
  constructor(message: string, code: string, status: number) {
    super(message)
    this.code = code
    this.status = status
  }
}

type Init = { method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; body?: unknown }

/** Fetch against the WooCommerce Store API. */
export async function storeApi<T>(path: string, init: Init = {}): Promise<T> {
  try {
    return await request<T>(path, init)
  } catch (e) {
    // An expired cart session makes WooCommerce fall back to nonce checks,
    // which fail cross-origin. Start a fresh session and retry the write once.
    if (e instanceof StoreApiError && /nonce|cart_token/i.test(e.code) && (init.method ?? 'GET') !== 'GET') {
      writeToken('')
      await request('cart')
      return request<T>(path, init)
    }
    throw e
  }
}

async function request<T>(path: string, init: Init = {}): Promise<T> {
  if (!wp) throw new Error('WooCommerce is not connected')
  const url = wp.storeApi + path.replace(/^\//, '')
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (init.body !== undefined) headers['Content-Type'] = 'application/json'
  if (cartToken) headers['Cart-Token'] = cartToken
  if (nonce) headers.Nonce = nonce

  const res = await fetch(url, {
    method: init.method ?? 'GET',
    credentials: 'omit',
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  })
  const token = res.headers.get('Cart-Token')
  if (token && token !== cartToken) writeToken(token)
  const fresh = res.headers.get('Nonce')
  if (fresh) nonce = fresh

  const text = await res.text()
  let data: unknown = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    throw new StoreApiError(`Unexpected response from the store (${res.status})`, 'invalid_json', res.status)
  }
  if (!res.ok) {
    const body = (data ?? {}) as { message?: unknown; code?: unknown }
    const message = (typeof body.message === 'string' && stripHtml(body.message)) || `Request failed (${res.status})`
    throw new StoreApiError(message, typeof body.code === 'string' ? body.code : 'error', res.status)
  }
  return data as T
}

/** Contact details and social links set in WordPress (companion plugin). */
export async function fetchStoreSettings(): Promise<StoreSettings> {
  if (!wp) return {}
  const res = await fetch(`${wp.siteUrl}/wp-json/rfaheya/v1/settings`, { credentials: 'omit', headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Settings request failed (${res.status})`)
  const settings = (await res.json()) as StoreSettings
  if (settings.myAccountUrl) wp.myAccountUrl = settings.myAccountUrl
  return settings
}

export function stripHtml(html: string): string {
  if (!html) return ''
  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim()
  }
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

/** Store API money values are integer strings in minor units. */
export function money(amount: string | number | undefined, minorUnit = 2): number {
  const n = typeof amount === 'number' ? amount : parseInt(amount ?? '0', 10)
  return Number.isFinite(n) ? n / 10 ** minorUnit : 0
}
