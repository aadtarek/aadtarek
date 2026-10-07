import { Gift, Handbag, Trash2, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { FREE_SHIPPING_THRESHOLD } from '../config'
import { formatPrice } from '../lib/format'
import { useCart } from '../store/cart'
import { Overlay } from './Overlay'
import { QuantityInput } from './QuantityInput'

export function CartDrawer() {
  const cart = useCart()
  const navigate = useNavigate()
  if (!cart.isOpen) return null

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - (cart.subtotal - cart.discount))
  const progress = Math.min(100, ((cart.subtotal - cart.discount) / FREE_SHIPPING_THRESHOLD) * 100)

  return (
    <Overlay onClose={cart.close} label="Shopping cart">
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-[26rem] animate-slide-in flex-col bg-cream shadow-2xl">
        <header className="flex h-16 items-center justify-between border-b border-line px-5">
          <h2 className="text-[13px] font-semibold tracking-[0.14em] uppercase">Your cart ({cart.count})</h2>
          <button type="button" onClick={cart.close} aria-label="Close cart" className="grid size-9 place-items-center rounded-full hover:bg-chip">
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </header>

        {cart.busy && (
          <span aria-hidden className="block h-[2px] w-full overflow-hidden bg-line">
            <span className="block h-full w-1/3 animate-[splash_1.1s_ease-in-out_infinite] bg-olive" />
          </span>
        )}
        {cart.error && (
          <div role="alert" className="flex items-start justify-between gap-3 border-b border-red-200 bg-red-50 px-5 py-3 text-[13px] text-red-800">
            <span>{cart.error}</span>
            <button type="button" onClick={cart.dismissError} aria-label="Dismiss" className="shrink-0">
              <X className="size-4" />
            </button>
          </div>
        )}

        {cart.lines.length === 0 && cart.busy ? (
          <div className="flex-1" />
        ) : cart.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <Handbag className="size-10 text-muted" strokeWidth={1.2} />
            <p className="mt-4 font-serif text-2xl">Your cart is empty.</p>
            <p className="mt-2 text-sm text-muted">Discover a scent that speaks for you.</p>
            <Link
              to="/shop"
              onClick={cart.close}
              className="mt-6 inline-flex h-12 items-center rounded-[3px] bg-olive px-8 text-[12px] font-medium tracking-[0.12em] text-cream uppercase hover:bg-olive-hover"
            >
              Shop fragrances
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b border-line px-5 py-4">
              <p className="text-[13px]">
                {remaining > 0 ? (
                  <>
                    Add <strong>{formatPrice(remaining)}</strong> more for free shipping in Cairo &amp; Alexandria.
                  </>
                ) : (
                  <>You’ve unlocked <strong>free shipping</strong> in Cairo &amp; Alexandria.</>
                )}
              </p>
              <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-olive transition-[width] duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {cart.lines.map((line) => (
                <li key={line.key} className="flex gap-4 py-4">
                  <Link to={`/product/${line.product.slug}`} onClick={cart.close} className="shrink-0">
                    <img src={line.product.images[0].src} alt="" className="size-20 rounded object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link to={`/product/${line.product.slug}`} onClick={cart.close} className="font-serif text-[16px] uppercase hover:underline">
                          {line.product.name}
                        </Link>
                        <p className="text-[12px] text-muted">
                          {line.variation.size}
                          {line.variation.isSample && ' · Sample'}
                        </p>
                        {line.giftMessage && (
                          <p className="mt-1 flex gap-1.5 text-[12px] text-ink-soft italic">
                            <Gift className="mt-0.5 size-3.5 shrink-0 not-italic" strokeWidth={1.5} />
                            <span className="line-clamp-2">“{line.giftMessage}”</span>
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => cart.remove(line.key)}
                        aria-label={`Remove ${line.product.name} ${line.variation.size}`}
                        className="-m-1 p-1 text-muted hover:text-ink"
                      >
                        <Trash2 className="size-4" strokeWidth={1.5} />
                      </button>
                    </div>
                    <div className="mt-auto flex items-end justify-between pt-2">
                      <QuantityInput size="sm" value={line.quantity} onChange={(q) => cart.setQuantity(line.key, q)} />
                      <p className="text-[14px] font-semibold">{formatPrice(line.lineTotal)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-line px-5 pt-4 pb-5">
              {cart.discount > 0 && (
                <div className="mb-1.5 flex items-center justify-between text-[14px] text-mocha">
                  <span>Bundle discount</span>
                  <span>−{formatPrice(cart.discount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-[13px] tracking-[0.1em] uppercase">Subtotal</span>
                <span className="text-lg font-semibold">{formatPrice(cart.subtotal - cart.discount)}</span>
              </div>
              <p className="mt-1 text-[12px] text-muted">Shipping calculated at checkout.</p>
              <button
                type="button"
                onClick={() => {
                  cart.close()
                  navigate('/checkout')
                }}
                className="mt-4 h-[52px] w-full rounded-[3px] bg-olive text-[12.5px] font-medium tracking-[0.12em] text-cream uppercase transition hover:bg-olive-hover"
              >
                Checkout
              </button>
              <button
                type="button"
                onClick={cart.close}
                className="mt-2 h-11 w-full text-[12px] tracking-[0.1em] uppercase underline-offset-4 hover:underline"
              >
                Continue shopping
              </button>
            </footer>
          </>
        )}
      </aside>
    </Overlay>
  )
}
