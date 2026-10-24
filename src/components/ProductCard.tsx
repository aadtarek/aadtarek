import { Eye, Heart, ShoppingBag } from 'lucide-react'
import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { familyName, fullSizeVariations, sampleVariation } from '../api/catalog'
import { formatPrice } from '../lib/format'
import { profileChips } from '../lib/profile'
import { useCart } from '../store/cart'
import { useWishlist } from '../store/wishlist'
import type { FamilySlug, Product } from '../types'
import { BottleIcon } from './Icons'
import { SlidingPill, useSlidingPill } from './SlidingPill'
import { addWithFlight } from '../lib/addToCart'
import { haptic, heartBurst } from '../lib/fx'

/** Each card takes a soft colour from its fragrance family (tint = background, ink = small text). */
const TINTS: Record<FamilySlug, { tint: string; ink: string }> = {
  oriental: { tint: '#f3e3c9', ink: '#8a5a1c' },
  floral: { tint: '#f6dcdc', ink: '#8f2f3a' },
  fresh: { tint: '#e6ecd2', ink: '#55662a' },
  sweet: { tint: '#f8e2cf', ink: '#94511f' },
  fruity: { tint: '#fadcd2', ink: '#a43f2a' },
}
const DEFAULT_TINT = { tint: '#f1eadf', ink: '#74695b' }

/**
 * Product card in its family's pastel colour: who/what it is and the wishlist on top,
 * the photo, name and DNA, the key notes as little chips, and one white bar with the
 * sizes and a black button that adds it (with the price). The 5 ml sample sits below.
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
  const notes = product.notes.slice(0, 3)
  const { tint, ink } = (product.families[0] && TINTS[product.families[0]]) || DEFAULT_TINT

  return (
    <article
      className="rf-card rf-pcard group/card @container flex h-full flex-col rounded-[22px] p-2 sm:rounded-[28px] sm:p-3.5"
      style={{ '--tint': tint, '--tint-ink': ink } as CSSProperties}
    >
      <div className="flex min-h-7 items-center justify-between gap-2 pb-2 pl-1 sm:min-h-8 sm:pb-2.5">
        <p className="rf-pcard-ink truncate text-[8.5px] font-semibold tracking-[0.14em] uppercase @[15rem]:text-[10.5px]" aria-label="Profile">
          {chips.map((c) => c.label).join(' · ')}
        </p>
        <button
          type="button"
          onClick={(e) => {
            if (!wished) heartBurst(e.currentTarget)
            wishlist.toggle(product.id)
          }}
          aria-pressed={wished}
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className="grid size-7 shrink-0 place-items-center rounded-full bg-white text-[#14110d] shadow-[0_4px_12px_-6px_rgba(16,14,11,0.35)] transition hover:scale-110 sm:size-9"
        >
          <Heart key={String(wished)} className={`size-[15px] transition sm:size-[17px] ${wished ? 'rf-heart-beat fill-[#e49b2d] text-[#e49b2d]' : ''}`} strokeWidth={1.7} />
        </button>
      </div>

      <div className="rf-pcard-photo motion-product-card relative overflow-hidden rounded-[16px] bg-white/40 sm:rounded-[20px]">
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
        </Link>
        {badge && (
          <span className="pointer-events-none absolute top-2 left-2 rounded-full bg-white/90 px-2 py-1 text-[9px] leading-none font-semibold text-[#14110d] backdrop-blur-md sm:top-2.5 sm:left-2.5 sm:px-2.5 sm:text-[10.5px]">
            {badge}
          </span>
        )}
        <button
          type="button"
          onClick={() => cart.openQuickAdd(product)}
          aria-label={`Quick view ${product.name}`}
          className="rf-pcard-qv absolute right-2 bottom-2 grid size-8 place-items-center rounded-full bg-white/85 text-[#14110d] backdrop-blur-md transition hover:scale-110 hover:bg-white sm:right-2.5 sm:bottom-2.5 sm:size-9"
        >
          <Eye className="size-4" strokeWidth={1.7} aria-hidden />
        </button>
      </div>

      <div className="flex flex-1 flex-col px-1 pt-2.5 sm:pt-3.5">
        <h3 className="truncate font-serif text-[17px] leading-tight sm:text-[24px]">
          <Link to={href} className="transition-opacity hover:opacity-70">
            {product.name}
          </Link>
        </h3>
        {product.inspiredBy && <p className="mt-0.5 truncate text-[10.5px] text-ink-soft sm:text-[13px]">Inspired by {product.inspiredBy}</p>}

        {notes.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1 sm:mt-2.5 sm:gap-1.5" aria-label="Fragrance notes">
            {notes.map((n) => (
              <li
                key={n.name}
                className="rf-pcard-chip inline-flex max-w-full items-center gap-1 rounded-full py-[3px] pr-2 pl-[3px] text-[9.5px] text-ink-soft sm:gap-1.5 sm:py-1 sm:pr-2.5 sm:pl-1 sm:text-[12px]"
              >
                <img src={n.image} alt="" width={20} height={20} className="size-3.5 shrink-0 object-contain sm:size-[18px]" loading="lazy" decoding="async" />
                <span className="truncate">{n.name}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="rf-pcard-bar mt-auto">
          <div className="mt-2.5 flex items-center justify-between gap-1 rounded-full p-[3px] sm:mt-3.5 sm:p-1">
            {sizes.length > 1 ? (
              <div ref={pillRef} role="radiogroup" aria-label={`Size for ${product.name}`} className="relative flex min-w-0">
                <SlidingPill box={pillBox} className="rf-pcard-pill rounded-full" />
                {sizes.map((v) => {
                  const on = v.id === selected.id
                  return (
                    <button
                      key={v.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      aria-label={v.size.replace(/\s*ML$/i, ' ml')}
                      disabled={!v.inStock}
                      onClick={() => {
                        haptic(8)
                        setVariationId(v.id)
                      }}
                      className={`relative z-[1] h-7 min-w-0 rounded-full px-[5px] text-[9.5px] font-semibold tabular-nums transition-colors duration-300 @[15rem]:px-2.5 @[15rem]:text-[12px] sm:h-9 disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 ${
                        on ? 'rf-pcard-ink' : 'text-muted hover:text-ink'
                      }`}
                    >
                      {v.size.replace(/\s*ML$/i, '')}
                    </button>
                  )
                })}
              </div>
            ) : (
              <span className="px-2 text-[11px] font-semibold text-muted">{selected.size}</span>
            )}
            <button
              type="button"
              onClick={(e) => addWithFlight(cart, e.currentTarget, product, selected.id)}
              disabled={!selected.inStock}
              className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-[#14110d] px-2.5 text-[11px] font-semibold text-white transition hover:bg-[#2e2820] disabled:opacity-50 sm:h-9 sm:px-4 sm:text-[13px]"
            >
              <ShoppingBag className="size-3.5 shrink-0 sm:size-4" strokeWidth={1.8} aria-hidden />
              <span className="sr-only">Add to cart · </span>
              <span key={selected.price} className="rf-num-pop hidden tabular-nums @[15rem]:inline">
                {formatPrice(selected.price)}
              </span>
            </button>
          </div>
          {sample && (
            <button
              type="button"
              onClick={(e) => addWithFlight(cart, e.currentTarget, product, sample.id)}
              disabled={!sample.inStock}
              aria-label={`Try ${sample.size} of ${product.name} · ${formatPrice(sample.price)}`}
              className="rf-pcard-ink mx-auto mt-1.5 flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold underline-offset-4 transition hover:underline disabled:pointer-events-none disabled:opacity-40 sm:mt-2 sm:text-[11.5px]"
            >
              <BottleIcon className="size-3.5 shrink-0" />
              Try {sample.size.replace(/\s*ML$/i, ' ml')} · {formatPrice(sample.price)}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
