import { Eye, Tag } from 'lucide-react'
import { useState } from 'react'
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

/**
 * Product card: photo (badge, wishlist, quick view), name and price, “Inspired by”,
 * tags (the store's WooCommerce tags, else who it's for / family / occasion / season),
 * key notes with their names, the sizes, Add to cart and the 5 ml sample.
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
  const chips = product.tags.length ? product.tags.slice(0, 4).map((label) => ({ label, Icon: Tag })) : profileChips(product, familyName)
  const [pillRef, pillBox] = useSlidingPill<HTMLDivElement>(variationId)
  const [main] = product.images

  return (
    <article className="rf-card group/card @container h-full">
      <div className="rf-white flex h-full flex-col rounded-[22px] p-1.5 shadow-[0_1px_0_rgba(60,40,10,0.04),0_18px_40px_-30px_rgba(60,40,10,0.45)] transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:-translate-y-1 group-hover/card:shadow-[0_1px_0_rgba(60,40,10,0.04),0_30px_56px_-30px_rgba(60,40,10,0.55)] sm:rounded-[26px] sm:p-2">
      <div className="relative overflow-hidden rounded-[17px] bg-chip sm:rounded-[20px]">
        <Link to={href} tabIndex={-1} aria-hidden className="block aspect-[5/4]">
          <img
            src={main.src}
            srcSet={main.srcset}
            sizes="(min-width: 1280px) 22vw, (min-width: 640px) 32vw, 50vw"
            alt={main.alt}
            width={400}
            height={320}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="size-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:scale-[1.04]"
          />
        </Link>
        {badge && (
          <span className="pointer-events-none absolute top-2.5 left-2.5 rounded-full bg-white/90 px-2.5 py-[5px] text-[10.5px] leading-none font-medium text-[#14110d] backdrop-blur-sm sm:top-3 sm:left-3 sm:px-3 sm:py-1.5 sm:text-[11.5px]">
            {badge}
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            if (!wished) heartBurst(e.currentTarget)
            wishlist.toggle(product.id)
          }}
          aria-pressed={wished}
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className="absolute top-2 right-2 grid size-9 place-items-center rounded-full bg-white/90 text-[#14110d] backdrop-blur-sm transition hover:scale-110 hover:bg-white sm:top-2.5 sm:right-2.5 sm:size-10"
        >
          <HeartIcon key={String(wished)} className={`size-[18px] transition ${wished ? 'rf-heart-beat fill-[#e49b2d] text-[#e49b2d]' : ''}`} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={() => cart.openQuickAdd(product)}
          aria-label={`Quick view ${product.name}`}
          className="absolute right-2 bottom-2 grid size-9 place-items-center rounded-full bg-white/90 text-[#14110d] backdrop-blur-sm transition hover:bg-white sm:right-2.5 sm:bottom-2.5 sm:size-10"
        >
          <Eye className="size-[18px]" strokeWidth={1.5} aria-hidden />
        </button>
      </div>

      <div className="flex flex-1 flex-col px-1.5 pt-3 pb-1 sm:px-2">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="min-w-0 truncate font-serif text-[19px] leading-tight sm:text-[22px]">
            <Link to={href} className="hover:underline hover:decoration-1 hover:underline-offset-4">
              {product.name}
            </Link>
          </h3>
          <p key={selected.price} className="rf-num-pop shrink-0 text-[12.5px] font-semibold text-gold tabular-nums sm:text-[14px]" aria-live="polite">
            {formatPrice(selected.price)}
          </p>
        </div>
        {product.inspiredBy && <p className="mt-0.5 truncate text-[12px] text-muted sm:text-[13px]">Inspired by {product.inspiredBy}</p>}

        {chips.length > 0 && (
          <ul className="mt-2.5 flex flex-wrap gap-1" aria-label="Tags">
            {chips.map(({ label, Icon }) => (
              <li key={label} className="inline-flex items-center gap-1 rounded-full bg-chip px-2 py-[3px] text-[10.5px] whitespace-nowrap text-ink-soft sm:px-2.5 sm:text-[11.5px]">
                <Icon className="size-3 shrink-0" strokeWidth={1.5} aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        )}

        {product.notes.length > 0 && (
          <ul className="mt-3 flex gap-1.5 sm:gap-2" aria-label="Fragrance notes">
            {product.notes.slice(0, 4).map((n) => (
              <li key={n.name} className="flex min-w-0 flex-1 flex-col items-center text-center">
                <span className="grid size-8 place-items-center rounded-full bg-chip sm:size-9">
                  <img src={n.image} alt="" width={24} height={24} className="size-5 object-contain" loading="lazy" decoding="async" />
                </span>
                <span className="mt-1 w-full truncate text-[10.5px] leading-tight text-muted sm:text-[11.5px]">{n.name}</span>
              </li>
            ))}
          </ul>
        )}

        {sizes.length > 1 && (
          <div ref={pillRef} role="radiogroup" aria-label={`Size for ${product.name}`} className="relative mt-3 flex flex-wrap gap-1.5">
            <SlidingPill box={pillBox} className="rounded-full bg-olive" />
            {sizes.map((v) => {
              const on = v.id === selected.id
              return (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  disabled={!v.inStock}
                  onClick={() => {
                    haptic(8)
                    setVariationId(v.id)
                  }}
                  className={`relative z-[1] h-8 rounded-full border px-3 text-[11.5px] font-medium transition-colors duration-300 sm:h-9 sm:px-3.5 sm:text-[12.5px] disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 ${
                    on ? 'border-olive text-on-accent' : 'border-line-strong text-ink-soft hover:border-ink'
                  }`}
                >
                  {v.size.replace(/\s*ML$/i, ' ml')}
                </button>
              )
            })}
          </div>
        )}

        <div className="mt-auto flex flex-col gap-1.5 pt-3">
          <button
            type="button"
            onClick={(e) => addWithFlight(cart, e.currentTarget, product, selected.id)}
            disabled={!selected.inStock}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-olive px-3 text-[11.5px] font-semibold tracking-[0.1em] whitespace-nowrap text-on-accent uppercase shadow-[0_10px_22px_-14px_rgba(160,100,20,0.9)] transition hover:bg-olive-hover active:scale-[0.98] disabled:opacity-50 sm:h-12 sm:text-[12.5px]"
          >
            <BagIcon className="hidden size-4 shrink-0 sm:block" strokeWidth={1.6} />
            Add to cart
          </button>
          {sample && (
            <button
              type="button"
              onClick={(e) => addWithFlight(cart, e.currentTarget, product, sample.id)}
              disabled={!sample.inStock}
              aria-label={`Try ${sample.size} of ${product.name} · ${formatPrice(sample.price)}`}
              className="inline-flex items-center justify-center gap-1 py-1 text-[11px] font-semibold text-gold underline-offset-4 hover:underline disabled:pointer-events-none disabled:opacity-40 sm:text-[12px]"
            >
              <BottleIcon className="size-3.5 shrink-0" />
              Try {sample.size.replace(/\s*ML$/i, ' ml')} · {formatPrice(sample.price)}
            </button>
          )}
        </div>
      </div>
      </div>
    </article>
  )
}
