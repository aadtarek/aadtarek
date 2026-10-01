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
  add: (productId: number, variationId: number, quantity?: number) => void
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

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = usePersistentState<CartItem[]>('rfaheya.cart', [])
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
    (productId: number, variationId: number, quantity = 1) => {
      const key = `${productId}:${variationId}`
      setItems((prev) => {
        const existing = prev.find((i) => i.key === key)
        if (existing)
          return prev.map((i) => (i.key === key ? { ...i, quantity: Math.min(MAX_QTY, i.quantity + quantity) } : i))
        return [...prev, { key, productId, variationId, quantity: Math.min(MAX_QTY, quantity) }]
      })
      setQuickAdd(null)
      setOpen(true)
    },
    [setItems],
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
    [lines, add, setQuantity, remove, clear, isOpen, quickAdd],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
