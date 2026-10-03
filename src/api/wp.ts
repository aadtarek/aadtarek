/**
 * WordPress / WooCommerce connection.
 *
 * When the site is served by the Rfaheya WordPress theme, the theme injects
 * `window.__RFAHEYA__` with the Store API location and a nonce. Without it
 * (local `npm run dev` / `npm start`) the app runs on the built-in demo data.
 */

export interface WpConfig {
  /** e.g. https://example.com/wp-json/wc/store/v1/ */
  storeApi: string
  /** wp_create_nonce('wc_store_api') */
  nonce: string
  siteUrl: string
  myAccountUrl: string
  currency?: string
  /** Editable in WordPress: Appearance → Customize → Rfaheya Store */
  contact?: Partial<Record<'email' | 'phone' | 'whatsapp' | 'hours' | 'location' | 'instapay', string>>
  social?: Partial<Record<'instagram' | 'tiktok' | 'youtube' | 'facebook', string>>
}

declare global {
  interface Window {
    __RFAHEYA__?: WpConfig
  }
}

export const wp: WpConfig | undefined = typeof window !== 'undefined' ? window.__RFAHEYA__ : undefined
export const isWoo = Boolean(wp?.storeApi)

let nonce = wp?.nonce ?? ''

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

/** Fetch against the WooCommerce Store API (same origin, cookie session). */
export async function storeApi<T>(path: string, init: Init = {}): Promise<T> {
  try {
    return await request<T>(path, init)
  } catch (e) {
    // A page served from cache can carry an expired nonce. A GET to /cart
    // returns a fresh one; retry the write once with it.
    if (e instanceof StoreApiError && /nonce/i.test(e.code) && (init.method ?? 'GET') !== 'GET') {
      await request('cart')
      return request<T>(path, init)
    }
    throw e
  }
}

async function request<T>(path: string, init: Init = {}): Promise<T> {
  if (!wp) throw new Error('WooCommerce is not connected')
  const url = wp.storeApi.replace(/\/?$/, '/') + path.replace(/^\//, '')
  const res = await fetch(url, {
    method: init.method ?? 'GET',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      ...(init.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(nonce ? { Nonce: nonce } : {}),
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  })
  // The Store API rotates its nonce; always keep the latest one.
  const fresh = res.headers.get('Nonce')
  if (fresh) nonce = fresh

  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) {
    const message = (data && typeof data.message === 'string' && stripHtml(data.message)) || `Request failed (${res.status})`
    throw new StoreApiError(message, data?.code ?? 'error', res.status)
  }
  return data as T
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
