import { ShoppingBag, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { familyName, fullSizeVariations, sampleVariation } from '../api/catalog'
import { addWithFlight } from '../lib/addToCart'
import { formatPrice } from '../lib/format'
import { profileChips } from '../lib/profile'
import { useCart } from '../store/cart'
import type { Product } from '../types'
import { BottleIcon } from './Icons'
import { Overlay } from './Overlay'
import { QuantityInput } from './QuantityInput'
import { SizePicker } from './SizePicker'

/**
 * Quick view: the product's photo, tags, notes and sizes in a window over the
 * page, to add it to the cart (or buy it) without leaving. Opened from a
 * card's eye button (and from "Add to cart" where a size must be picked first).
 */
export function QuickAddModal() {
  const { quickAdd, closeQuickAdd } = useCart()
  if (!quickAdd) return null
  return <QuickView key={quickAdd.id} product={quickAdd} onClose={closeQuickAdd} />
}

function QuickView({ product, onClose }: { product: Product; onClose: () => void }) {
  const cart = useCart()
  const navigate = useNavigate()
  const sizes = fullSizeVariations(product)
  const sample = sampleVariation(product)
  const [variationId, setVariationId] = useState((sizes.find((v) => v.inStock) ?? sizes[0]).id)
  const [qty, setQty] = useState(1)
  const selected = sizes.find((v) => v.id === variationId) ?? sizes[0]
  const chips = profileChips(product, familyName)
  const href = `/product/${product.slug}`

  return (
    <Overlay onClose={onClose} label={`Quick view: ${product.name}`}>
      <div className="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-3xl bg-cream pb-[env(safe-area-inset-bottom)] shadow-2xl sm:pb-0 [animation:slide-up_.6s_cubic-bezier(.2,1.15,.3,1)] sm:inset-auto sm:top-1/2 sm:left-1/2 sm:max-h-[86vh] sm:w-[min(52rem,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:[animation:rf-spring-in_.6s_cubic-bezier(.2,1.25,.3,1)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 grid size-9 place-items-center rounded-full bg-cream/90 backdrop-blur-sm hover:bg-chip"
        >
          <X className="size-5" strokeWidth={1.5} />
        </button>
        <div className="grid sm:grid-cols-[1fr_1.1fr]">
          <div className="bg-chip sm:flex sm:items-center">
            <img src={product.images[0].src} srcSet={product.images[0].srcset} sizes="(min-width: 640px) 26rem, 100vw" alt={product.images[0].alt} className="aspect-[5/4] w-full object-cover" />
          </div>
          <div className="p-5 sm:p-7">
            {product.badge && <span className="rounded-full bg-chip px-2.5 py-1 text-[10.5px] font-medium tracking-[0.03em]">{product.badge}</span>}
            <h2 className="mt-2 pr-8 font-serif text-[26px] leading-none sm:text-[34px]">{product.name}</h2>
            {product.tagline && <p className="mt-1 font-serif text-[16px] text-ink-soft sm:text-[18px]">{product.tagline}</p>}
            {product.inspiredBy && <p className="mt-1.5 text-[12px] text-muted">Inspired by {product.inspiredBy}</p>}

            <ul className="mt-3 flex flex-wrap gap-1" aria-label="Profile">
              {chips.map(({ label, Icon }) => (
                <li key={label} className="inline-flex items-center gap-1 rounded-full bg-chip px-2 py-[3px] text-[11px] whitespace-nowrap text-ink-soft">
                  <Icon className="size-3 shrink-0" strokeWidth={1.5} aria-hidden />
                  {label}
                </li>
              ))}
            </ul>

            {product.notes.length > 0 && (
              <ul className="mt-3 flex gap-3" aria-label="Fragrance notes">
                {product.notes.slice(0, 5).map((n) => (
                  <li key={n.name} className="flex w-12 flex-col items-center text-center">
                    <span className="grid size-9 place-items-center rounded-full bg-chip">
                      <img src={n.image} alt="" width={24} height={24} className="size-6 object-contain" />
                    </span>
                    <span className="mt-1 w-full truncate text-[10px] text-muted">{n.name}</span>
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-4 mb-2 text-[11px] font-medium tracking-[0.08em] uppercase">Choose size</p>
            <SizePicker variations={sizes} value={variationId} onChange={setVariationId} />

            <div className="mt-4 flex items-center justify-between gap-3">
              <QuantityInput value={qty} onChange={setQty} size="sm" />
              <p className="text-[18px] font-semibold tabular-nums">{formatPrice(selected.price * qty)}</p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={(e) => addWithFlight(cart, e.currentTarget, product, selected.id, qty)}
                disabled={!selected.inStock}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-olive text-[11px] font-medium tracking-[0.08em] text-on-accent uppercase transition hover:bg-olive-hover disabled:opacity-50"
              >
                <ShoppingBag className="size-4" strokeWidth={1.5} aria-hidden />
                Add to cart
              </button>
              <button
                type="button"
                onClick={() => {
                  cart.add(product.id, selected.id, qty, { open: false })
                  onClose()
                  navigate('/checkout')
                }}
                disabled={!selected.inStock}
                className="h-10 rounded-full bg-mocha text-[11px] font-medium tracking-[0.08em] text-cream uppercase transition hover:bg-espresso disabled:opacity-50"
              >
                Buy now
              </button>
            </div>
            {sample && (
              <button
                type="button"
                onClick={(e) => addWithFlight(cart, e.currentTarget, product, sample.id)}
                disabled={!sample.inStock}
                className="mt-1.5 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full border border-line-strong text-[11px] font-medium transition hover:border-ink disabled:pointer-events-none disabled:opacity-40"
              >
                <BottleIcon className="size-4" />
                Try {sample.size} first · {formatPrice(sample.price)}
              </button>
            )}
            <Link
              to={href}
              onClick={onClose}
              className="mt-3 block text-center text-[11px] tracking-[0.08em] text-muted uppercase underline-offset-4 hover:text-ink hover:underline"
            >
              View full details
            </Link>
          </div>
        </div>
      </div>
    </Overlay>
  )
}
