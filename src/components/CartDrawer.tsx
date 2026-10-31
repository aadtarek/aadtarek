import { Gift, Handbag, Lock, Minus, Plus, X } from 'lucide-react'
import { useState, type CSSProperties } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAllProducts, isGiftBoxProduct, sampleVariation } from '../api/catalog'
import { SPEND_OFFER } from '../config'
import { formatPrice } from '../lib/format'
import { tintFor } from '../lib/tints'
import { useCart } from '../store/cart'
import { useRewards } from '../store/rewards'
import { OfferBar } from './OfferBar'
import { Overlay } from './Overlay'

/** The cart: a panel from the right (from the bottom on phones). */
export function CartDrawer() {
  const cart = useCart()
  const rewards = useRewards()
  const navigate = useNavigate()
  // Stays on screen while it animates away after closing.
  const [shown, setShown] = useState(cart.isOpen)
  if (cart.isOpen && !shown) setShown(true)
  if (!shown) return null
  const leaving = !cart.isOpen

  const wrap = cart.giftWrap
  const wrapAmount = wrap.available && wrap.on ? wrap.price : 0
  const total = Math.max(0, cart.subtotal - cart.discount - cart.offerDiscount - rewards.couponTotal) + wrapAmount
  // 5 ml samples of fragrances that aren't in the cart yet.
  const inCart = new Set(cart.lines.map((l) => l.productId))
  const samples = getAllProducts()
    .filter((p) => !inCart.has(p.id))
    .map((p) => ({ product: p, sample: sampleVariation(p) }))
    .filter((x) => x.sample?.inStock)
    .slice(0, 2)

  return (
    <Overlay onClose={cart.close} label="Shopping cart" leaving={leaving}>
      <aside
        className={`rf-drawer absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col overflow-hidden rounded-t-[28px] bg-cream shadow-[0_40px_120px_-30px_rgba(16,14,11,0.6)] sm:inset-x-auto sm:top-3 sm:right-3 sm:bottom-3 sm:max-h-none sm:w-[440px] sm:rounded-[28px] ${leaving ? 'rf-drawer-leave' : ''}`}
        onAnimationEnd={(e) => {
          if (leaving && e.target === e.currentTarget) setShown(false)
        }}
      >
        <header className="flex items-center justify-between px-[18px] pt-4 pb-3 sm:px-6 sm:pt-[22px]">
          <h2 className="flex items-center gap-2 font-serif text-[28px] leading-none sm:text-[32px]">
            Your bag
            {cart.count > 0 && <span className="grid size-7 place-items-center rounded-full bg-[#14110d] font-sans text-[13px] font-semibold text-white">{cart.count}</span>}
          </h2>
          <button type="button" onClick={cart.close} aria-label="Close cart" className="grid size-10 place-items-center rounded-full bg-chip transition hover:bg-line">
            <X className="size-[18px]" strokeWidth={1.5} />
          </button>
        </header>

        {cart.busy && (
          <span aria-hidden className="block h-[2px] w-full overflow-hidden bg-line">
            <span className="block h-full w-1/3 animate-[splash_1.1s_ease-in-out_infinite] bg-olive" />
          </span>
        )}
        {cart.error && (
          <div role="alert" className="mx-4 mb-2 flex items-start justify-between gap-3 rounded-2xl bg-red-50 px-4 py-3 text-[13px] text-red-800">
            <span>{cart.error}</span>
            <button type="button" onClick={cart.dismissError} aria-label="Dismiss" className="shrink-0">
              <X className="size-4" />
            </button>
          </div>
        )}

        {cart.lines.length === 0 && cart.busy ? (
          <div className="min-h-[240px] flex-1" />
        ) : cart.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 py-14 text-center">
            <span className="grid size-20 place-items-center rounded-full bg-chip">
              <Handbag className="size-9 text-gold" strokeWidth={1.2} />
            </span>
            <p className="mt-5 font-serif text-[30px] leading-none">Your bag is empty.</p>
            <p className="mt-2 text-sm text-muted">Discover a scent that speaks for you.</p>
            <Link
              to="/shop"
              onClick={cart.close}
              className="mt-6 inline-flex h-12 items-center rounded-full bg-olive px-8 text-[12px] font-semibold tracking-[0.12em] text-white uppercase hover:bg-olive-hover"
            >
              Shop fragrances
            </Link>
          </div>
        ) : (
          <>
            <div className="no-scrollbar flex-1 overflow-y-auto">
              <OfferBar amount={cart.subtotal - cart.discount} className="rf-white mx-3 rounded-[20px] border border-line px-4 pt-3.5 [--rf-offer-ring:#fff] sm:mx-4" />

              <ul className="px-3 sm:px-4">
                {cart.lines.map((line, i) => (
                  <li key={line.key} className="rf-cart-line relative flex gap-3.5 border-b border-line py-3.5" style={{ '--i': Math.min(i, 8) } as CSSProperties}>
                    <Link
                      to={`/product/${line.product.slug}`}
                      onClick={cart.close}
                      className="size-[76px] shrink-0 overflow-hidden rounded-[18px] sm:size-[86px]"
                      style={{ background: tintFor(line.product).tint }}
                    >
                      <img src={line.product.images[0].src} alt="" className="size-full object-cover" />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col pr-6">
                      <Link
                        to={isGiftBoxProduct(line.product) ? '/collections/gift-boxes' : `/product/${line.product.slug}`}
                        onClick={cart.close}
                        className="truncate font-serif text-[20px] leading-tight hover:underline sm:text-[22px]"
                      >
                        {line.product.name}
                      </Link>
                      <p className="mt-1.5">
                        <span className="inline-block rounded-full bg-chip px-2.5 py-[3px] text-[11.5px] font-semibold">
                          {line.variation.size.replace(/\s*ML$/i, ' ml')}
                          {line.variation.isSample && ' · Sample'}
                        </span>
                      </p>
                      {line.giftMessage && (
                        <p className="mt-1.5 flex gap-1.5 text-[12px] text-ink-soft italic">
                          <Gift className="mt-0.5 size-3.5 shrink-0 not-italic" strokeWidth={1.5} />
                          <span className="line-clamp-2">{isGiftBoxProduct(line.product) ? line.giftMessage : `“${line.giftMessage}”`}</span>
                        </p>
                      )}
                      <div className="mt-auto flex items-center justify-between pt-2.5">
                        <span className="rf-white inline-flex h-[34px] items-center gap-1 rounded-full px-1 shadow-[inset_0_0_0_1px_var(--color-line-strong)]">
                          <button
                            type="button"
                            onClick={() => cart.setQuantity(line.key, line.quantity - 1)}
                            aria-label={`One less ${line.product.name}`}
                            className="grid size-7 place-items-center rounded-full text-muted hover:text-ink"
                          >
                            <Minus className="size-3.5" strokeWidth={1.8} />
                          </button>
                          <span className="w-5 text-center text-[14px] font-semibold tabular-nums">{line.quantity}</span>
                          <button
                            type="button"
                            onClick={() => cart.setQuantity(line.key, line.quantity + 1)}
                            aria-label={`One more ${line.product.name}`}
                            className="grid size-7 place-items-center rounded-full text-muted hover:text-ink"
                          >
                            <Plus className="size-3.5" strokeWidth={1.8} />
                          </button>
                        </span>
                        <p key={line.lineTotal} className="rf-num-pop text-[16px] font-semibold">
                          {formatPrice(line.lineTotal)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => cart.remove(line.key)}
                      aria-label={`Remove ${line.product.name} ${line.variation.size}`}
                      className="absolute top-3.5 right-0 grid size-7 place-items-center rounded-full text-muted transition hover:bg-chip hover:text-ink"
                    >
                      <X className="size-3.5" strokeWidth={1.8} />
                    </button>
                  </li>
                ))}
              </ul>

              {samples.length > 0 && (
                <div className="px-3 pt-4 sm:px-4">
                  <p className="text-[11px] font-semibold tracking-[0.24em] text-gold uppercase">Try one more — 5 ml</p>
                  <ul className="mt-2.5 grid grid-cols-2 gap-2">
                    {samples.map(({ product, sample }) => (
                      <li key={product.id} className="rf-white flex items-center gap-2 rounded-2xl border border-line p-1.5">
                        <img src={product.images[0].src} alt="" className="size-10 shrink-0 rounded-xl object-cover" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12.5px] font-semibold">{product.name}</span>
                          <span className="block text-[11px] text-gold">
                            {sample!.size.replace(/\s*ML$/i, ' ml')} · {formatPrice(sample!.price)}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => cart.add(product.id, sample!.id, 1, { open: false })}
                          aria-label={`Add a ${sample!.size} sample of ${product.name}`}
                          className="grid size-[30px] shrink-0 place-items-center rounded-full bg-chip transition hover:bg-olive hover:text-white"
                        >
                          <Plus className="size-4" strokeWidth={1.8} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {wrap.available && (
                <label className="mx-3 mt-3 mb-4 flex cursor-pointer items-center gap-3 rounded-2xl bg-chip px-3.5 py-3 text-[12.5px] text-ink-soft sm:mx-4">
                  <input type="checkbox" checked={wrap.on} onChange={wrap.toggle} className="peer sr-only" />
                  <span
                    aria-hidden
                    className="relative h-[22px] w-[38px] shrink-0 rounded-full bg-line-strong transition peer-checked:bg-olive peer-focus-visible:outline-2 peer-focus-visible:outline-olive after:absolute after:top-[3px] after:left-[3px] after:size-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-4"
                  />
                  <span className="min-w-0 flex-1">
                    <strong className="font-semibold text-ink">Gift wrap</strong> Boxed with a handwritten card · {formatPrice(wrap.price)}
                  </span>
                  <Gift className="size-[18px] shrink-0 text-gold" strokeWidth={1.5} />
                </label>
              )}
            </div>

            <footer className="rf-white border-t border-line px-[18px] pt-3.5 pb-[calc(1.1rem+env(safe-area-inset-bottom))] sm:px-6">
              <dl className="space-y-1 text-[14px]">
                <div className="flex justify-between">
                  <dt className="text-muted">Subtotal</dt>
                  <dd>{formatPrice(cart.subtotal)}</dd>
                </div>
                {cart.discount > 0 && (
                  <div className="flex justify-between text-gold">
                    <dt>Bundle discount</dt>
                    <dd>−{formatPrice(cart.discount)}</dd>
                  </div>
                )}
                {cart.offerDiscount > 0 && (
                  <div className="flex justify-between font-medium text-gold">
                    <dt>
                      {SPEND_OFFER.percent}% off over {formatPrice(SPEND_OFFER.min)}
                    </dt>
                    <dd>−{formatPrice(cart.offerDiscount)}</dd>
                  </div>
                )}
                {rewards.coupons.map((c) => (
                  <div key={c.code} className="flex justify-between text-[#55662a]">
                    <dt>{c.label}</dt>
                    <dd>−{formatPrice(c.amount)}</dd>
                  </div>
                ))}
                {wrapAmount > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-muted">Gift wrap</dt>
                    <dd>{formatPrice(wrapAmount)}</dd>
                  </div>
                )}
              </dl>
              <button
                type="button"
                onClick={() => {
                  cart.close()
                  navigate('/checkout')
                }}
                className="rf-magnetic mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-olive text-[13px] font-semibold tracking-[0.1em] text-white uppercase transition hover:bg-olive-hover"
              >
                <Lock className="size-4" strokeWidth={1.6} />
                Checkout · <span key={total} className="rf-num-pop">{formatPrice(total)}</span>
              </button>
              <p className="mt-2.5 text-center text-[11.5px] text-muted">Shipping at checkout · Cash on delivery · InstaPay</p>
            </footer>
          </>
        )}
      </aside>
    </Overlay>
  )
}
