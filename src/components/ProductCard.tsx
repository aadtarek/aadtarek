import { Eye } from 'lucide-react'
import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { familyName, fullSizeVariations, sampleVariation } from '../api/catalog'
import { formatPrice } from '../lib/format'
import { profileChips } from '../lib/profile'
import { useCart } from '../store/cart'
import { useWishlist } from '../store/wishlist'
import type { Product } from '../types'
import { BottleIcon } from './Icons'
import { BagIcon, HeartIcon } from './LineIcons'
import { SlidingPill, useSlidingPill } from './SlidingPill'
import { addWithFlight } from '../lib/addToCart'
import { haptic, heartBurst } from '../lib/fx'
import { tintFor } from '../lib/tints'

/**
 * Product card: a white card with the photo on the fragrance's colour and the
 * product's tags (from WooCommerce) on it as glass chips; then the name,
 * “Inspired by”, the key notes, a gliding size picker with the price, a gold
 * Add to cart and the 5 ml sample. Container queries keep narrow cards tidy.
 */
export function ProductCard({ product, badge = product.badge }: { product: Product; badge?: string }) {
  const cart = useCart()
  const wishlist = useWishlist()
  const wished = wishlist.has(product.id)
  const sizes = fullSizeVariations(product)
  const sample = sampleVariation(product)
  const [variationId, setVariationId] = useState(() => (sizes.find((v) => v.inStock) ?? sizes[0]).id)
  const selected = sizes.find((v) => v.id === variationId) ?? sizes[0]
  const href = `/product/${product.slug}`
  // The store's own tags; without any, who it's for and its family.
  const tags = (product.tags.length ? product.tags : profileChips(product, familyName).map((c) => c.label)).slice(0, 3)
  const [pillRef, pillBox] = useSlidingPill<HTMLDivElement>(variationId)
  const [main, alt] = product.images
  const notes = product.notes.slice(0, 3)
  const { tint, ink } = tintFor(product)
  const ml = (size: string) => size.replace(/\s*ML$/i, ' ml')

  return (
    <article
      className="rf-card group/card @container h-full"
      style={{ '--tint': tint, '--tint-ink': ink } as CSSProperties}
    >
      <div className="rf-white flex h-full flex-col rounded-[22px] p-1.5 shadow-[0_1px_0_rgba(60,40,10,0.04),0_18px_40px_-30px_rgba(60,40,10,0.4)] transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:-translate-y-1 group-hover/card:shadow-[0_1px_0_rgba(60,40,10,0.04),0_30px_56px_-30px_rgba(60,40,10,0.5)] @[17rem]:rounded-[28px] @[17rem]:p-2">
        {/* ---- Photo on the fragrance's colour, tags on top ---- */}
        <div className="relative overflow-hidden rounded-[17px] bg-(--tint) @[17rem]:rounded-[22px]">
          <Link to={href} tabIndex={-1} aria-hidden className="relative block aspect-[4/5]">
            <img
              src={main.src}
              srcSet={main.srcset}
              sizes="(min-width: 1280px) 22vw, (min-width: 640px) 32vw, 50vw"
              alt={main.alt}
              width={400}
              height={500}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="size-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:scale-[1.04]"
            />
            {alt && (
              <img
                src={alt.src}
                srcSet={alt.srcset}
                sizes="(min-width: 1280px) 22vw, (min-width: 640px) 32vw, 50vw"
                alt=""
                width={400}
                height={500}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-700 [@media(hover:hover)]:group-hover/card:opacity-100"
              />
            )}
          </Link>

          <ul className="pointer-events-none absolute top-2 right-11 left-2 flex flex-wrap gap-1 @[17rem]:top-3 @[17rem]:right-14 @[17rem]:left-3 @[17rem]:gap-1.5" aria-label="Tags">
            {badge && (
              <li className="rounded-full bg-olive px-2 py-1 text-[9.5px] leading-none font-semibold tracking-[0.04em] text-on-accent @[17rem]:px-2.5 @[17rem]:py-1.5 @[17rem]:text-[10.5px]">
                {badge}
              </li>
            )}
            {tags.map((t, i) => (
              <li
                key={t}
                className={`rounded-full bg-white/80 px-2 py-1 text-[9.5px] leading-none font-semibold text-[#14110d] backdrop-blur-md @[17rem]:px-2.5 @[17rem]:py-1.5 @[17rem]:text-[10.5px] ${
                  i > 0 ? 'hidden @[15rem]:block' : ''
                }`}
              >
                {t}
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={(e) => {
              if (!wished) heartBurst(e.currentTarget)
              wishlist.toggle(product.id)
            }}
            aria-pressed={wished}
            aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            className="absolute top-1.5 right-1.5 grid size-8 place-items-center rounded-full bg-white/85 text-[#14110d] backdrop-blur-md transition hover:scale-110 hover:bg-white @[17rem]:top-2.5 @[17rem]:right-2.5 @[17rem]:size-9"
          >
            <HeartIcon key={String(wished)} className={`size-[17px] transition ${wished ? 'rf-heart-beat fill-[#e49b2d] text-[#e49b2d]' : ''}`} strokeWidth={1.5} />
          </button>

          <button
            type="button"
            onClick={() => cart.openQuickAdd(product)}
            aria-label={`Quick view ${product.name}`}
            className="absolute right-2 bottom-2 inline-flex h-8 items-center gap-1.5 rounded-full bg-white/85 px-2 text-[#14110d] backdrop-blur-md transition duration-300 hover:bg-white @[17rem]:right-3 @[17rem]:bottom-3 @[17rem]:h-9 @[17rem]:px-3 [@media(hover:hover)]:translate-y-1 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/card:translate-y-0 [@media(hover:hover)]:group-hover/card:opacity-100 [@media(hover:hover)]:focus-visible:opacity-100"
          >
            <Eye className="size-4" strokeWidth={1.6} aria-hidden />
            <span className="hidden text-[10.5px] font-semibold tracking-[0.08em] uppercase @[17rem]:inline">Quick view</span>
          </button>

          {notes.length > 0 && (
            <ul className="pointer-events-none absolute bottom-2 left-2 flex -space-x-1.5 @[17rem]:bottom-3 @[17rem]:left-3" aria-label="Key notes">
              {notes.map((n) => (
                <li key={n.name} title={n.name} className="grid size-7 place-items-center rounded-full bg-white/90 ring-2 ring-(--tint) backdrop-blur-md @[17rem]:size-8">
                  <img src={n.image} alt={n.name} width={20} height={20} loading="lazy" decoding="async" className="size-[18px] object-contain @[17rem]:size-5" />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ---- Name, inspired by, notes ---- */}
        <div className="flex flex-1 flex-col px-1.5 pt-3 pb-1 @[17rem]:px-2.5 @[17rem]:pt-4">
          <h3 className="truncate font-serif text-[19px] leading-tight @[17rem]:text-[24px]">
            <Link to={href} className="transition-opacity hover:opacity-70">
              {product.name}
            </Link>
          </h3>
          {product.inspiredBy ? (
            <p className="mt-0.5 truncate text-[11.5px] text-muted @[17rem]:text-[13px]">
              Inspired by <span className="font-medium text-ink-soft">{product.inspiredBy}</span>
            </p>
          ) : (
            notes.length > 0 && <p className="mt-0.5 truncate text-[11.5px] text-muted @[17rem]:text-[13px]">{notes.map((n) => n.name).join(' · ')}</p>
          )}

          {/* ---- Sizes and price ---- */}
          <div className="mt-3 flex flex-col gap-2 @[17rem]:mt-4 @[17rem]:flex-row @[17rem]:items-center @[17rem]:justify-between">
            {sizes.length > 1 ? (
              <div ref={pillRef} role="radiogroup" aria-label={`Size for ${product.name}`} className="relative flex rounded-full bg-chip p-[3px]">
                <SlidingPill box={pillBox} className="rounded-full bg-olive shadow-[0_6px_14px_-8px_rgba(120,80,20,0.7)]" />
                {sizes.map((v) => {
                  const on = v.id === selected.id
                  return (
                    <button
                      key={v.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      aria-label={ml(v.size)}
                      disabled={!v.inStock}
                      onClick={() => {
                        haptic(8)
                        setVariationId(v.id)
                      }}
                      className={`relative z-[1] h-7 min-w-0 flex-1 rounded-full px-2 text-[11.5px] font-semibold tabular-nums transition-colors duration-300 disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 @[17rem]:h-8 @[17rem]:flex-none @[17rem]:px-3 @[17rem]:text-[12.5px] ${
                        on ? 'text-on-accent' : 'text-muted hover:text-ink'
                      }`}
                    >
                      {v.size.replace(/\s*ML$/i, '')}
                    </button>
                  )
                })}
              </div>
            ) : (
              <span className="text-[12px] font-semibold text-muted">{ml(selected.size)}</span>
            )}
            <p className="flex items-baseline gap-1 @[17rem]:justify-end">
              <strong key={selected.price} className="rf-num-pop text-[18px] font-semibold tabular-nums @[17rem]:text-[21px]" aria-live="polite">
                {formatPrice(selected.price).replace(/\s*EGP$/i, '')}
              </strong>
              <span className="text-[10px] font-semibold tracking-[0.1em] text-gold uppercase">EGP</span>
            </p>
          </div>

          {/* ---- Add to cart ---- */}
          <button
            type="button"
            onClick={(e) => addWithFlight(cart, e.currentTarget, product, selected.id)}
            disabled={!selected.inStock}
            className="mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-olive text-[11px] font-semibold tracking-[0.1em] text-on-accent uppercase shadow-[0_10px_22px_-14px_rgba(160,100,20,0.9)] transition hover:bg-olive-hover active:scale-[0.98] disabled:opacity-50 @[17rem]:h-12 @[17rem]:text-[12px]"
          >
            <BagIcon className="size-4 shrink-0" strokeWidth={1.6} />
            Add to cart
          </button>

          {sample && (
            <button
              type="button"
              onClick={(e) => addWithFlight(cart, e.currentTarget, product, sample.id)}
              disabled={!sample.inStock}
              aria-label={`Try ${sample.size} of ${product.name} · ${formatPrice(sample.price)}`}
              className="mx-auto mt-auto flex items-center gap-1 rounded-full pt-2.5 pb-1 text-[11px] font-semibold text-gold underline-offset-4 hover:underline disabled:pointer-events-none disabled:opacity-40 @[17rem]:text-[12px]"
            >
              <BottleIcon className="size-3.5 shrink-0" />
              Try {ml(sample.size)} · {formatPrice(sample.price)}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
