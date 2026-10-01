import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { findProductById } from '../api/catalog'
import { usePersistentState } from '../lib/storage'
import type { CartItem, Product, ProductVariation } from '../types'

export interface CartLine extends CartItem {
  product: Product
  variation: ProductVariation
  lineTotal: number
}

interface CartContextValue {
  lines: CartLine[]
  count: number
  subtotal: number
  add: (productId: number, variationId: number, quantity?: number, options?: { giftMessage?: string; open?: boolean }) => void
  /** Add several lines at once (e.g. a discovery set) and open the cart once. */
  addMany: (lines: { productId: number; variationId: number; quantity?: number }[]) => void
  setQuantity: (key: string, quantity: number) => void
  remove: (key: string) => void
  clear: () => void
  isOpen: boolean
  open: () => void
  close: () => void
  /** Product whose size picker is open (variable products need a size before adding). */
  quickAdd: Product | null
  openQuickAdd: (product: Product) => void
  closeQuickAdd: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const MAX_QTY = 20

function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = usePersistentState<CartItem[]>('rfaheya.cart', [], (raw) =>
    Array.isArray(raw)
      ? raw.filter(
          (i): i is CartItem =>
            !!i && typeof i.key === 'string' && typeof i.productId === 'number' && typeof i.variationId === 'number' && i.quantity > 0,
        )
      : undefined,
  )
  const [isOpen, setOpen] = useState(false)
  const [quickAdd, setQuickAdd] = useState<Product | null>(null)

  const lines = useMemo(
    () =>
      items.flatMap((item): CartLine[] => {
        const product = findProductById(item.productId)
        const variation = product?.variations.find((v) => v.id === item.variationId)
        if (!product || !variation) return []
        return [{ ...item, product, variation, lineTotal: variation.price * item.quantity }]
      }),
    [items],
  )

  const add = useCallback(
    (productId: number, variationId: number, quantity = 1, options: { giftMessage?: string; open?: boolean } = {}) => {
      const giftMessage = options.giftMessage?.trim() || undefined
      // Gift lines are kept separate so each box keeps its own message.
      const key = giftMessage ? `${productId}:${variationId}:gift:${hash(giftMessage)}` : `${productId}:${variationId}`
      setItems((prev) => {
        const existing = prev.find((i) => i.key === key)
        if (existing)
          return prev.map((i) => (i.key === key ? { ...i, quantity: Math.min(MAX_QTY, i.quantity + quantity) } : i))
        return [...prev, { key, productId, variationId, quantity: Math.min(MAX_QTY, quantity), giftMessage }]
      })
      setQuickAdd(null)
      if (options.open !== false) setOpen(true)
    },
    [setItems],
  )

  const addMany = useCallback<CartContextValue['addMany']>(
    (list) => {
      list.forEach((l) => add(l.productId, l.variationId, l.quantity ?? 1, { open: false }))
      setOpen(true)
    },
    [add],
  )

  const setQuantity = useCallback(
    (key: string, quantity: number) =>
      setItems((prev) =>
        quantity <= 0
          ? prev.filter((i) => i.key !== key)
          : prev.map((i) => (i.key === key ? { ...i, quantity: Math.min(MAX_QTY, quantity) } : i)),
      ),
    [setItems],
  )

  const remove = useCallback((key: string) => setItems((prev) => prev.filter((i) => i.key !== key)), [setItems])
  const clear = useCallback(() => setItems([]), [setItems])

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: lines.reduce((n, l) => n + l.lineTotal, 0),
      add,
      addMany,
      setQuantity,
      remove,
      clear,
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      quickAdd,
      openQuickAdd: setQuickAdd,
      closeQuickAdd: () => setQuickAdd(null),
    }),
    [lines, add, addMany, setQuantity, remove, clear, isOpen, quickAdd],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
