import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { findByVariationId, findProductById, useCatalogReady } from '../api/catalog'
import { isWoo, money, storeApi } from '../api/wp'
import { bundleDiscount } from '../config'
import { usePersistentState } from '../lib/storage'
import type { CartItem, Product, ProductVariation } from '../types'

export interface CartLine extends CartItem {
  product: Product
  variation: ProductVariation
  lineTotal: number
}

/** WooCommerce Store API cart (fields we use). */
export interface WooCart {
  items: {
    key: string
    id: number
    quantity: number
    totals: { line_subtotal: string; line_total: string; currency_minor_unit: number }
  }[]
  items_count: number
  needs_shipping: boolean
  payment_methods: string[]
  shipping_rates: { package_id: number | string; shipping_rates: { rate_id: string; name: string; price: string; selected: boolean; currency_minor_unit: number }[] }[]
  totals: {
    total_items: string
    total_shipping: string | null
    total_discount: string
    /** Fees; the bundle discount is a negative fee */
    total_fees?: string
    total_price: string
    currency_minor_unit: number
  }
  errors?: { code: string; message: string }[]
}

type AddOptions = { giftMessage?: string; open?: boolean }

interface CartContextValue {
  lines: CartLine[]
  count: number
  subtotal: number
  /** Bundle discount (already taken off by WooCommerce's cart total in WooCommerce mode) */
  discount: number
  add: (productId: number, variationId: number, quantity?: number, options?: AddOptions) => void
  /** Add several lines at once (e.g. a discovery set) and open the cart once. */
  addMany: (lines: { productId: number; variationId: number; quantity?: number }[]) => void
  setQuantity: (key: string, quantity: number) => void
  remove: (key: string) => void
  clear: () => void
  /** True while a WooCommerce cart request is in flight. */
  busy: boolean
  /** Last cart error message (WooCommerce mode), e.g. out of stock. */
  error: string | null
  dismissError: () => void
  isOpen: boolean
  open: () => void
  close: () => void
  /** Product whose size picker is open (variable products need a size before adding). */
  quickAdd: Product | null
  openQuickAdd: (product: Product) => void
  closeQuickAdd: () => void
  /** WooCommerce only: the raw server cart, for checkout totals/shipping. */
  woo?: { cart: WooCart | null; apply: (cart: WooCart) => void; refresh: () => Promise<void> }
}

interface Backend {
  lines: CartLine[]
  add: (productId: number, variationId: number, quantity: number, giftMessage?: string) => Promise<void>
  setQuantity: (key: string, quantity: number) => Promise<void>
  remove: (key: string) => Promise<void>
  clear: () => Promise<void>
  busy: boolean
  /** Server-calculated discount, when the backend has one */
  discount?: number
  woo?: CartContextValue['woo']
}

const CartContext = createContext<CartContextValue | null>(null)
const MAX_QTY = 20

function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}

// ---------------------------------------------------------------- local (demo) cart

function useLocalCart(): Backend {
  const [items, setItems] = usePersistentState<CartItem[]>('rfaheya.cart', [], (raw) =>
    Array.isArray(raw)
      ? raw.filter(
          (i): i is CartItem =>
            !!i && typeof i.key === 'string' && typeof i.productId === 'number' && typeof i.variationId === 'number' && i.quantity > 0,
        )
      : undefined,
  )

  const ready = useCatalogReady()
  const lines = useMemo(
    () =>
      items.flatMap((item): CartLine[] => {
        const product = findProductById(item.productId)
        const variation = product?.variations.find((v) => v.id === item.variationId)
        if (!product || !variation) return []
        return [{ ...item, product, variation, lineTotal: variation.price * item.quantity }]
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- lines need the products, which arrive after start-up
    [items, ready],
  )

  return {
    lines,
    busy: false,
    add: async (productId, variationId, quantity, giftMessage) => {
      // Gift lines are kept separate so each box keeps its own message.
      const key = giftMessage ? `${productId}:${variationId}:gift:${hash(giftMessage)}` : `${productId}:${variationId}`
      setItems((prev) => {
        const existing = prev.find((i) => i.key === key)
        if (existing) return prev.map((i) => (i.key === key ? { ...i, quantity: Math.min(MAX_QTY, i.quantity + quantity) } : i))
        return [...prev, { key, productId, variationId, quantity: Math.min(MAX_QTY, quantity), giftMessage }]
      })
    },
    setQuantity: async (key, quantity) =>
      setItems((prev) =>
        quantity <= 0 ? prev.filter((i) => i.key !== key) : prev.map((i) => (i.key === key ? { ...i, quantity: Math.min(MAX_QTY, quantity) } : i)),
      ),
    remove: async (key) => setItems((prev) => prev.filter((i) => i.key !== key)),
    clear: async () => setItems([]),
  }
}

// ---------------------------------------------------------------- WooCommerce cart

function useWooCart(): Backend {
  const [cart, setCart] = useState<WooCart | null>(null)
  const [pending, setPending] = useState(0)
  // WooCommerce has no per-line notes in the Store API, so gift messages are
  // kept here (by cart item key) and sent with the order as the customer note.
  const [gifts, setGifts] = usePersistentState<Record<string, string[]>>('rfaheya.giftNotes', {})
  const queue = useRef(Promise.resolve())

  /** Serialise cart requests so quick clicks can't race each other. */
  const run = useCallback(async (fn: () => Promise<WooCart>) => {
    setPending((n) => n + 1)
    const job = queue.current.then(fn)
    queue.current = job.then(
      () => undefined,
      () => undefined,
    )
    try {
      const next = await job
      setCart(next)
      return next
    } finally {
      setPending((n) => n - 1)
    }
  }, [])

  const refresh = useCallback(async () => {
    await run(() => storeApi<WooCart>('cart'))
  }, [run])

  useEffect(() => {
    refresh().catch(() => undefined)
  }, [refresh])

  // Forget gift notes for lines that no longer exist.
  useEffect(() => {
    if (!cart) return
    const keys = new Set(cart.items.map((i) => i.key))
    if (Object.keys(gifts).some((k) => !keys.has(k))) setGifts((g) => Object.fromEntries(Object.entries(g).filter(([k]) => keys.has(k))))
  }, [cart, gifts, setGifts])

  const ready = useCatalogReady()
  const lines = useMemo(
    () =>
      (cart?.items ?? []).flatMap((item): CartLine[] => {
        const found = findByVariationId(item.id) ?? (findProductById(item.id) ? { product: findProductById(item.id)!, variation: findProductById(item.id)!.variations[0] } : undefined)
        if (!found) return []
        return [
          {
            key: item.key,
            productId: found.product.id,
            variationId: item.id,
            quantity: item.quantity,
            giftMessage: gifts[item.key]?.join(' / ') || undefined,
            product: found.product,
            variation: found.variation,
            lineTotal: money(item.totals.line_subtotal, item.totals.currency_minor_unit),
          },
        ]
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- lines need the products, which arrive after start-up
    [cart, gifts, ready],
  )

  return {
    lines,
    busy: pending > 0,
    discount: cart ? Math.max(0, -money(cart.totals.total_fees ?? '0', cart.totals.currency_minor_unit)) : 0,
    add: async (_productId, variationId, quantity, giftMessage) => {
      const next = await run(() => storeApi<WooCart>('cart/add-item', { method: 'POST', body: { id: variationId, quantity } }))
      if (giftMessage) {
        const item = next.items.find((i) => i.id === variationId)
        if (item) setGifts((g) => ({ ...g, [item.key]: [...(g[item.key] ?? []), giftMessage] }))
      }
    },
    setQuantity: async (key, quantity) => {
      if (quantity <= 0) await run(() => storeApi<WooCart>('cart/remove-item', { method: 'POST', body: { key } }))
      else await run(() => storeApi<WooCart>('cart/update-item', { method: 'POST', body: { key, quantity: Math.min(MAX_QTY, quantity) } }))
    },
    remove: async (key) => {
      await run(() => storeApi<WooCart>('cart/remove-item', { method: 'POST', body: { key } }))
    },
    clear: async () => {
      // After checkout WooCommerce empties the cart itself; just re-read it.
      setGifts({})
      await refresh()
    },
    woo: { cart, apply: setCart, refresh },
  }
}

const useBackend: () => Backend = isWoo ? useWooCart : useLocalCart

// ---------------------------------------------------------------- provider

export function CartProvider({ children }: { children: ReactNode }) {
  const backend = useBackend()
  const [isOpen, setOpen] = useState(false)
  const [quickAdd, setQuickAdd] = useState<Product | null>(null)
  const [error, setError] = useState<string | null>(null)

  const report = useCallback((p: Promise<unknown>) => {
    setError(null)
    p.catch((e: unknown) => setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.'))
  }, [])

  const { add: backendAdd } = backend
  const add = useCallback<CartContextValue['add']>(
    (productId, variationId, quantity = 1, options = {}) => {
      report(backendAdd(productId, variationId, quantity, options.giftMessage?.trim() || undefined))
      setQuickAdd(null)
      if (options.open !== false) setOpen(true)
    },
    [backendAdd, report],
  )

  const addMany = useCallback<CartContextValue['addMany']>(
    (list) => {
      report(list.reduce<Promise<void>>((p, l) => p.then(() => backendAdd(l.productId, l.variationId, l.quantity ?? 1)), Promise.resolve()))
      setOpen(true)
    },
    [backendAdd, report],
  )

  const value = useMemo<CartContextValue>(
    () => ({
      lines: backend.lines,
      count: backend.lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: backend.lines.reduce((n, l) => n + l.lineTotal, 0),
      discount: backend.discount ?? bundleDiscount(backend.lines.map((l) => ({ size: l.variation.size, price: l.variation.price, quantity: l.quantity }))),
      add,
      addMany,
      setQuantity: (key, q) => report(backend.setQuantity(key, q)),
      remove: (key) => report(backend.remove(key)),
      clear: () => report(backend.clear()),
      busy: backend.busy,
      error,
      dismissError: () => setError(null),
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      quickAdd,
      openQuickAdd: setQuickAdd,
      closeQuickAdd: () => setQuickAdd(null),
      woo: backend.woo,
    }),
    [backend, add, addMany, report, error, isOpen, quickAdd],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
