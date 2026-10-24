import { Eye, Heart, ShoppingBag, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { familyName, fullSizeVariations, sampleVariation } from '../api/catalog'
import { formatPrice } from '../lib/format'
import { profileChips } from '../lib/profile'
import { useCart } from '../store/cart'
import { useWishlist } from '../store/wishlist'
import type { Product } from '../types'
import { BottleIcon } from './Icons'
import { SlidingPill, useSlidingPill } from './SlidingPill'
import { addWithFlight } from '../lib/addToCart'
import { haptic, heartBurst } from '../lib/fx'

/**
 * Product card: one rounded surface. The photo carries the badge, wishlist, price and
 * (on hover) a second photo and Quick view; below sit who/what it is, the DNA, the key
 * notes as a stack, a segmented size picker and Add to cart with the 5 ML sample.
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
  const chips = profileChips(product, familyName).slice(0, 2)
  const [pillRef, pillBox] = useSlidingPill<HTMLDivElement>(variationId)
  const [main, alt] = product.images
  const notes = product.notes.slice(0, 4)

  return (
    <article className="rf-card rf-pcard group/card @container flex h-full flex-col rounded-[22px] bg-card p-1.5 ring-1 ring-line sm:rounded-[26px] sm:p-2">
      <div className="motion-product-card relative overflow-hidden rounded-[17px] bg-chip sm:rounded-[20px]">
        <Link to={href} tabIndex={-1} aria-hidden className="relative block aspect-[5/4]">
          <img
            src={main.src}
            srcSet={main.srcset}
            sizes="(min-width: 1280px) 20vw, (min-width: 640px) 30vw, 50vw"
            alt={main.alt}
            width={400}
            height={320}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="size-full object-cover"
          />
          {alt && (
            <img
              src={alt.src}
              srcSet={alt.srcset}
              sizes="(min-width: 1280px) 20vw, (min-width: 640px) 30vw, 50vw"
              alt=""
              width={400}
              height={320}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="rf-pcard-alt absolute inset-0 size-full object-cover"
            />
          )}
          <span aria-hidden className="rf-pcard-shade pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/45 to-transparent" />
        </Link>
        {badge && (
          <span className="pointer-events-none absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-olive px-2.5 py-[5px] text-[10px] leading-none font-semibold tracking-[0.06em] text-on-accent uppercase shadow-[0_6px_16px_-6px_rgba(228,155,45,0.8)] sm:top-2.5 sm:left-2.5 sm:text-[10.5px]">
            <Sparkles className="size-3" strokeWidth={2} aria-hidden />
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
          className={`absolute top-1.5 right-1.5 grid size-9 place-items-center rounded-full backdrop-blur-md transition hover:scale-110 sm:top-2 sm:right-2 ${wished ? 'bg-olive text-on-accent' : 'bg-white/70 text-ink hover:bg-white'}`}
        >
          <Heart key={String(wished)} className={`size-[17px] transition ${wished ? 'rf-heart-beat fill-current' : ''}`} strokeWidth={1.6} />
        </button>
        <p
          key={selected.price}
          className="rf-num-pop pointer-events-none absolute bottom-2 left-2 rounded-full bg-white/80 px-2.5 py-1 text-[11.5px] font-semibold text-[#14110d] tabular-nums backdrop-blur-md sm:bottom-2.5 sm:left-2.5 sm:text-[13px]"
          aria-live="polite"
        >
          {formatPrice(selected.price)}
        </p>
        <button
          type="button"
          onClick={() => cart.openQuickAdd(product)}
          aria-label={`Quick view ${product.name}`}
          className="rf-pcard-qv absolute right-2 bottom-2 inline-flex h-8 items-center gap-1.5 rounded-full bg-[#100e0b]/80 px-2.5 text-[10.5px] font-medium tracking-[0.08em] text-white uppercase backdrop-blur-md transition hover:bg-[#100e0b] sm:right-2.5 sm:bottom-2.5 sm:h-9 sm:px-3"
        >
          <Eye className="size-4" strokeWidth={1.6} aria-hidden />
          <span className="hidden @[15rem]:inline">Quick view</span>
        </button>
      </div>

      <div className="flex flex-1 flex-col px-1 pt-3 pb-1 sm:px-1.5">
        {chips.length > 0 && (
          <p className="flex items-center gap-1.5 truncate text-[9.5px] font-semibold tracking-[0.16em] text-gold uppercase sm:text-[10.5px]" aria-label="Profile">
            {chips.map(({ label }, i) => (
              <span key={label} className="flex items-center gap-1.5">
                {i > 0 && <span aria-hidden className="size-1 rounded-full bg-gold/60" />}
                {label}
              </span>
            ))}
          </p>
        )}
        <h3 className="mt-1 truncate font-serif text-[18px] leading-tight sm:text-[23px]">
          <Link to={href} className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_1px]">
            {product.name}
          </Link>
        </h3>
        {product.inspiredBy && <p className="mt-0.5 truncate text-[11px] text-muted sm:text-[12.5px]">Inspired by {product.inspiredBy}</p>}

        {notes.length > 0 && (
          <div className="mt-2.5 flex items-center gap-2" aria-label="Fragrance notes">
            <ul className="flex shrink-0 -space-x-1.5">
              {notes.map((n, i) => (
                <li
                  key={n.name}
                  className="rf-pcard-note grid size-7 place-items-center rounded-full bg-chip ring-2 ring-card sm:size-8"
                  style={{ zIndex: notes.length - i, transitionDelay: `${i * 40}ms` }}
                  title={n.name}
                >
                  <img src={n.image} alt="" width={24} height={24} className="size-[17px] object-contain sm:size-5" loading="lazy" decoding="async" />
                </li>
              ))}
            </ul>
            <p className="hidden min-w-0 truncate text-[10.5px] text-ink-soft @[13rem]:block sm:text-[12px]">{notes.map((n) => n.name).join(' · ')}</p>
          </div>
        )}

        {sizes.length > 1 && (
          <div ref={pillRef} role="radiogroup" aria-label={`Size for ${product.name}`} className="relative mt-3 flex rounded-full bg-chip p-[3px]">
            <SlidingPill box={pillBox} className="rounded-full bg-ink shadow-[0_4px_12px_-4px_rgba(16,14,11,0.45)]" />
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
                  className={`relative z-[1] h-7 min-w-0 flex-1 rounded-full text-[10.5px] font-semibold tracking-[0.02em] transition-colors duration-300 sm:h-8 sm:text-[11.5px] disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 ${
                    on ? 'text-cream' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  {v.size.replace(/\s*ML$/i, ' ml')}
                </button>
              )
            })}
          </div>
        )}

        <div className="mt-auto flex items-center gap-1.5 pt-3">
          <button
            type="button"
            onClick={(e) => addWithFlight(cart, e.currentTarget, product, selected.id)}
            disabled={!selected.inStock}
            className="inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full bg-olive px-2 text-[10px] font-semibold tracking-[0.03em] whitespace-nowrap @[13rem]:px-3 @[13rem]:text-[10.5px] @[13rem]:tracking-[0.08em] text-on-accent uppercase transition hover:bg-olive-hover disabled:opacity-50 sm:h-11 sm:text-[11.5px]"
          >
            <ShoppingBag className="hidden size-4 shrink-0 @[13rem]:block" strokeWidth={1.6} aria-hidden />
            Add to cart
          </button>
          {sample && (
            <button
              type="button"
              onClick={(e) => addWithFlight(cart, e.currentTarget, product, sample.id)}
              disabled={!sample.inStock}
              title={`${sample.size} sample · ${formatPrice(sample.price)}`}
              aria-label={`Try ${sample.size} of ${product.name} · ${formatPrice(sample.price)}`}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-1 rounded-full border border-line-strong px-2.5 text-[10.5px] font-semibold whitespace-nowrap transition hover:border-ink hover:bg-ink hover:text-cream disabled:pointer-events-none disabled:opacity-40 sm:h-11 sm:px-3 sm:text-[11px]"
            >
              <BottleIcon className="size-[15px] shrink-0" />
              <span className="hidden @[14rem]:inline">Try</span> {sample.size.replace(/\s*ML$/i, ' ml')}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
