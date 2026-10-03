/**
 * Local stand-in for WordPress + WooCommerce, for testing the storefront's
 * WooCommerce mode without a real site.
 *
 *   npm run build:wp && SITE_URL=http://localhost:8080 node scripts/products-csv.mjs http://localhost:8080 > /tmp/p.csv
 *   node scripts/mock-wp/server.mjs [port] [csv]
 *
 * - Serves the theme like index.php does (injects window.__RFAHEYA__).
 * - Implements the Store API endpoints the app uses, following WooCommerce's
 *   documented request/response shapes: products (incl. variations), reviews,
 *   cart, add/update/remove item, update-customer (shipping), checkout.
 * - Products come from the same CSV used for the WooCommerce import.
 * - The page is served with a stale nonce on purpose, to exercise the app's
 *   nonce-refresh retry.
 */
import { randomBytes } from 'node:crypto'
import { createServer } from 'node:http'
import { existsSync, readFileSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'

const root = new URL('../..', import.meta.url).pathname
const port = Number(process.argv[2] || 8080)
const site = `http://localhost:${port}`
const csvPath = process.argv[3] || join(root, 'release/rfaheya-products.csv')
const themeDir = join(root, 'wordpress/rfaheya')

// ------------------------------------------------------------------ CSV → products

function parseCsv(text) {
  const rows = []
  let row = [], cell = '', q = false
  text = text.replace(/^﻿/, '')
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++ } else if (c === '"') q = false
      else cell += c
    } else if (c === '"') q = true
    else if (c === ',') { row.push(cell); cell = '' }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = '' }
    else if (c !== '\r') cell += c
  }
  if (cell || row.length) { row.push(cell); rows.push(row) }
  const [header, ...body] = rows
  return body.filter((r) => r.length > 1).map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])))
}

const slug = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const rows = parseCsv(readFileSync(csvPath, 'utf8'))
let nextId = 200
const termIds = new Map()
const termId = (k) => termIds.get(k) ?? (termIds.set(k, termIds.size + 1), termIds.get(k))

const products = []
const variations = []
for (const r of rows.filter((x) => x.Type === 'variable')) {
  const id = nextId++
  const attributes = []
  for (let i = 1; r[`Attribute ${i} name`] !== undefined; i++) {
    const name = r[`Attribute ${i} name`]
    if (!name) continue
    const values = r[`Attribute ${i} value(s)`].split(',').map((v) => v.trim()).filter(Boolean)
    attributes.push({
      id: termId(`attr:${name}`),
      name,
      taxonomy: `pa_${slug(name)}`,
      has_variations: name === 'Size',
      terms: values.map((v) => ({ id: termId(`${name}:${v}`), name: v, slug: slug(v) })),
    })
  }
  products.push({
    id,
    name: r.Name,
    slug: slug(r.Name),
    sku: r.SKU,
    type: 'variable',
    parent: 0,
    position: Number(r.Position),
    created: products.length,
    short_description: `<p>${r['Short description']}</p>`,
    description: `<p>${r.Description}</p>`,
    images: r.Images.split(',').map((u, i) => ({
      id: 900 + id * 10 + i,
      src: u.trim().replace(/^https?:\/\/[^/]+/, site),
      thumbnail: u.trim().replace(/^https?:\/\/[^/]+/, site),
      alt: '',
      name: '',
    })),
    categories: r.Categories.split(',').map((c) => c.trim()).filter(Boolean).map((c) => ({ id: termId(`cat:${c}`), name: c, slug: slug(c), link: `${site}/product-category/${slug(c)}/` })),
    attributes,
    variations: [],
    is_in_stock: true,
    is_purchasable: true,
  })
}
for (const r of rows.filter((x) => x.Type === 'variation')) {
  const parent = products.find((p) => p.sku === r.Parent)
  const id = nextId++
  const size = r['Attribute 1 value(s)']
  // One deliberately out-of-stock variation, to exercise stock errors.
  const inStock = !(parent.slug === 'deep-current' && size === '10 ML')
  const price = String(Math.round(Number(r['Regular price']) * 100))
  variations.push({
    id,
    name: parent.name,
    slug: `${parent.slug}-${slug(size)}`,
    type: 'variation',
    parent: parent.id,
    variation: `Size: ${size}`,
    short_description: '',
    description: '',
    prices: { price, regular_price: price, sale_price: price, price_range: null, currency_code: 'EGP', currency_minor_unit: 2 },
    images: [],
    categories: [],
    attributes: [],
    variations: [],
    is_in_stock: inStock,
    is_purchasable: true,
  })
  parent.variations.push({ id, attributes: [{ name: 'Size', value: slug(size) }] })
}
for (const p of products) {
  const prices = p.variations.map((v) => Number(variations.find((x) => x.id === v.id).prices.price))
  p.prices = {
    price: String(Math.min(...prices)),
    regular_price: String(Math.min(...prices)),
    sale_price: String(Math.min(...prices)),
    price_range: { min_amount: String(Math.min(...prices)), max_amount: String(Math.max(...prices)) },
    currency_code: 'EGP',
    currency_minor_unit: 2,
  }
}
const reviews = [
  {
    id: 1,
    date_created: '2026-09-30T10:00:00',
    product_id: products.find((p) => p.slug === 'vanilla-oud').id,
    product_name: 'Vanilla Oud',
    reviewer: 'Test Customer',
    review: '<p>Lovely warm scent &amp; great longevity.</p>',
    rating: 4,
    verified: true,
  },
]
const publicProduct = ({ sku, position, created, ...p }) => p

// ------------------------------------------------------------------ sessions & cart

const VALID_NONCE = 'valid-nonce-123'
const sessions = new Map()
export const orders = []

function session(req, res) {
  const id = /wc_session=([a-f0-9]+)/.exec(req.headers.cookie || '')?.[1]
  if (id && sessions.has(id)) return sessions.get(id)
  const fresh = randomBytes(8).toString('hex')
  const s = { id: fresh, items: [], address: { state: '' } }
  sessions.set(fresh, s)
  res.setHeader('Set-Cookie', `wc_session=${fresh}; Path=/; HttpOnly`)
  return s
}

function shippingRates(s, subtotal) {
  const state = s.address.state
  if (!state) return []
  if (state === 'EGWAD') return [] // "we don't deliver here" zone
  const rates = []
  if ((state === 'EGC' || state === 'EGALX') && subtotal >= 100000) rates.push({ rate_id: 'free_shipping:1', name: 'Free shipping', price: '0' })
  else rates.push({ rate_id: 'flat_rate:2', name: 'Flat rate', price: '7000' })
  return rates.map((r, i) => ({ ...r, selected: i === 0, currency_minor_unit: 2, currency_code: 'EGP' }))
}

function cartJson(s) {
  const items = s.items.map((it) => {
    const v = variations.find((x) => x.id === it.id)
    const line = String(Number(v.prices.price) * it.quantity)
    return { key: it.key, id: it.id, quantity: it.quantity, name: v.name, totals: { line_subtotal: line, line_total: line, currency_minor_unit: 2 } }
  })
  const subtotal = items.reduce((n, i) => n + Number(i.totals.line_subtotal), 0)
  const rates = shippingRates(s, subtotal)
  const shipping = items.length && rates.length ? Number(rates[0].price) : 0
  return {
    items,
    items_count: items.reduce((n, i) => n + i.quantity, 0),
    needs_shipping: items.length > 0,
    payment_methods: ['cod', 'bacs'],
    shipping_rates: items.length ? [{ package_id: 0, shipping_rates: rates }] : [],
    totals: {
      total_items: String(subtotal),
      total_shipping: items.length && s.address.state ? String(shipping) : null,
      total_discount: '0',
      total_price: String(subtotal + shipping),
      currency_code: 'EGP',
      currency_minor_unit: 2,
    },
    errors: [],
  }
}

// ------------------------------------------------------------------ HTTP

const types = { '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.json': 'application/json' }

function themePage(nonce) {
  const manifest = JSON.parse(readFileSync(join(themeDir, 'dist/.vite/manifest.json'), 'utf8'))
  const entry = Object.values(manifest).find((c) => c.isEntry)
  const base = `${site}/wp-content/themes/rfaheya/dist/`
  const config = {
    storeApi: `${site}/wp-json/wc/store/v1/`,
    nonce,
    siteUrl: `${site}/`,
    myAccountUrl: `${site}/my-account/`,
    currency: 'EGP',
    contact: { email: 'shop@example.test', instapay: 'test@instapay' },
    social: {},
  }
  return `<!doctype html><html lang="en-US"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Rfaheya</title>
${(entry.css || []).map((c) => `<link rel="stylesheet" href="${base}${c}">`).join('')}
</head><body class="rfaheya-app"><div id="root"></div>
<script id="rfaheya-app-0-js-before">window.__RFAHEYA__ = ${JSON.stringify(config)};</script>
<script type="module" src="${base}${entry.file}" id="rfaheya-app-0-js"></script></body></html>`
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json', ...headers })
  res.end(typeof body === 'string' ? body : JSON.stringify(body))
}
const err = (res, status, code, message) => send(res, status, { code, message, data: { status } })

async function readBody(req) {
  let raw = ''
  for await (const chunk of req) raw += chunk
  return raw ? JSON.parse(raw) : {}
}

createServer(async (req, res) => {
  const url = new URL(req.url, site)
  const path = url.pathname

  if (path.startsWith('/wp-content/themes/rfaheya/')) {
    const file = normalize(join(themeDir, path.replace('/wp-content/themes/rfaheya/', '')))
    if (!file.startsWith(themeDir) || !existsSync(file)) return send(res, 404, 'not found', { 'Content-Type': 'text/plain' })
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' })
    return res.end(readFileSync(file))
  }

  if (path.startsWith('/wp-json/wc/store/v1/')) {
    const route = path.replace('/wp-json/wc/store/v1/', '').replace(/\/$/, '')
    const s = session(req, res)
    res.setHeader('Nonce', VALID_NONCE)
    if (req.method === 'POST') {
      const nonce = req.headers.nonce
      if (!nonce) return err(res, 401, 'woocommerce_rest_missing_nonce', 'Missing the Nonce header. This endpoint requires a valid nonce.')
      if (nonce !== VALID_NONCE) return err(res, 403, 'woocommerce_rest_invalid_nonce', 'Nonce is invalid.')
    }
    const body = req.method === 'POST' ? await readBody(req) : {}

    if (route === 'products' && req.method === 'GET') {
      if (url.searchParams.get('type') === 'variation') {
        const include = (url.searchParams.get('include') || '').split(',').map(Number)
        return send(res, 200, variations.filter((v) => include.includes(v.id)))
      }
      const orderby = url.searchParams.get('orderby')
      const order = url.searchParams.get('order')
      let list = [...products]
      if (orderby === 'popularity') list.sort((a, b) => a.position - b.position)
      if (orderby === 'date') list.sort((a, b) => a.created - b.created)
      if (order === 'asc' && orderby === 'popularity') list.reverse()
      return send(res, 200, list.map(publicProduct))
    }
    if (route === 'products/reviews') return send(res, 200, reviews)
    if (route === 'cart' && req.method === 'GET') return send(res, 200, cartJson(s))
    if (route === 'cart/add-item') {
      const v = variations.find((x) => x.id === body.id)
      if (!v) return err(res, 400, 'woocommerce_rest_cart_invalid_product', 'This product cannot be added to the cart.')
      if (!v.is_in_stock) return err(res, 400, 'woocommerce_rest_product_out_of_stock', `You cannot add &quot;${v.name} - ${v.variation.replace('Size: ', '')}&quot; to the cart because the product is out of stock.`)
      const existing = s.items.find((i) => i.id === v.id)
      if (existing) existing.quantity += body.quantity || 1
      else s.items.push({ key: randomBytes(16).toString('hex'), id: v.id, quantity: body.quantity || 1 })
      return send(res, 201, cartJson(s))
    }
    if (route === 'cart/update-item') {
      const it = s.items.find((i) => i.key === body.key)
      if (!it) return err(res, 409, 'woocommerce_rest_cart_invalid_key', 'Cart item no longer exists or is invalid.')
      it.quantity = body.quantity
      return send(res, 200, cartJson(s))
    }
    if (route === 'cart/remove-item') {
      s.items = s.items.filter((i) => i.key !== body.key)
      return send(res, 200, cartJson(s))
    }
    if (route === 'cart/update-customer') {
      s.address = { ...body.shipping_address, email: body.billing_address?.email }
      return send(res, 200, cartJson(s))
    }
    if (route === 'checkout' && req.method === 'POST') {
      const b = body.billing_address || {}
      if (!s.items.length) return err(res, 400, 'woocommerce_rest_cart_empty', 'Cannot create order from empty cart.')
      if (!/^\S+@\S+\.\S+$/.test(b.email || '')) return err(res, 400, 'rest_invalid_param', 'Invalid parameter(s): billing_address')
      if (!['cod', 'bacs'].includes(body.payment_method)) return err(res, 400, 'woocommerce_rest_checkout_invalid_payment_method', 'Invalid payment method provided.')
      if (!b.state || b.country !== 'EG') return err(res, 400, 'rest_invalid_param', 'Invalid parameter(s): billing_address')
      const cart = cartJson(s)
      if (!cart.shipping_rates[0]?.shipping_rates.length) return err(res, 400, 'woocommerce_rest_checkout_no_shipping', 'No shipping options are available for this address.')
      const order = { id: 1001 + orders.length, key: `wc_order_${randomBytes(6).toString('hex')}`, body, cart }
      orders.push(order)
      s.items = []
      return send(res, 200, {
        order_id: order.id,
        status: body.payment_method === 'bacs' ? 'on-hold' : 'processing',
        order_key: order.key,
        customer_note: body.customer_note || '',
        payment_method: body.payment_method,
        payment_result: { payment_status: 'success', payment_details: [], redirect_url: `${site}/checkout/order-received/${order.id}/?key=${order.key}` },
      })
    }
    return err(res, 404, 'rest_no_route', 'No route was found matching the URL and request method.')
  }

  // Test helper: inspect placed orders.
  if (path === '/__orders') return send(res, 200, orders.map((o) => ({ id: o.id, payment: o.body.payment_method, note: o.body.customer_note, state: o.body.shipping_address.state, total: o.cart.totals.total_price })))

  if (path.startsWith('/my-account')) {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    return res.end('<!doctype html><title>My account</title><h1>My account (WooCommerce)</h1>')
  }

  // Everything else is the storefront (index.php). Stale nonce on purpose.
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
  res.end(themePage('stale-nonce-from-cache'))
}).listen(port, () => console.log(`mock WordPress on ${site} — ${products.length} products, ${variations.length} variations`))
