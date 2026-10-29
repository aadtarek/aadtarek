import { Eye } from 'lucide-react'
import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { familyName, fullSizeVariations, sampleVariation } from '../api/catalog'
import { formatPrice } from '../lib/format'
import { profileChips } from '../lib/profile'
import { useCart } from '../store/cart'
import { useWishlist } from '../store/wishlist'
import type { FamilySlug, Product } from '../types'
import { BottleIcon } from './Icons'
import { BagIcon, HeartIcon } from './LineIcons'
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
 * Product card in tiles (bento): the photo, then the family, name and “Inspired by”,
 * the price in the family's colour, the key notes, the sizes and an amber Add to cart;
 * the 5 ml sample sits underneath. Narrow cards stack the tiles.
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
  const sizeLabel = (size: string) => size.replace(/\s*ML$/i, '')

  return (
    <article className="rf-card rf-pcard group/card @container h-full" style={{ '--tint': tint, '--tint-ink': ink } as CSSProperties}>
      <div className="rf-pcard-in flex h-full flex-col rounded-[22px] p-[5px] @[17rem]:rounded-[28px] @[17rem]:p-[7px]">
        <div className="rf-pcard-photo relative overflow-hidden rounded-[17px] bg-chip @[17rem]:rounded-[22px]">
          <Link to={href} tabIndex={-1} aria-hidden className="relative block aspect-[5/4]">
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
              className="rf-pcard-img size-full object-cover"
            />
            {alt && (
              <img
                src={alt.src}
                srcSet={alt.srcset}
                sizes="(min-width: 1280px) 22vw, (min-width: 640px) 32vw, 50vw"
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
            <span className="pointer-events-none absolute top-2 left-2 rounded-full bg-white/90 px-2 py-1 text-[9px] leading-none font-semibold text-[#14110d] backdrop-blur-md @[17rem]:top-3 @[17rem]:left-3 @[17rem]:px-2.5 @[17rem]:py-1.5 @[17rem]:text-[10.5px]">
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
            className="absolute top-1.5 right-1.5 grid size-8 place-items-center rounded-full bg-white/85 text-[#14110d] backdrop-blur-md transition hover:scale-110 hover:bg-white @[17rem]:top-2.5 @[17rem]:right-2.5 @[17rem]:size-9"
          >
            <HeartIcon key={String(wished)} className={`size-[17px] transition ${wished ? 'rf-heart-beat fill-[#e49b2d] text-[#e49b2d]' : ''}`} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => cart.openQuickAdd(product)}
            aria-label={`Quick view ${product.name}`}
            className="rf-pcard-qv absolute right-2 bottom-2 inline-flex h-8 items-center justify-center gap-1.5 rounded-full bg-[#100e0b]/75 px-2 text-white backdrop-blur-md transition hover:bg-[#100e0b] @[17rem]:right-3 @[17rem]:bottom-3 @[17rem]:h-9 @[17rem]:px-3"
          >
            <Eye className="size-4" strokeWidth={1.6} aria-hidden />
            <span className="hidden text-[10.5px] font-semibold tracking-[0.08em] uppercase @[19rem]:inline">Quick view</span>
          </button>
        </div>

        <div className="mt-[5px] grid auto-rows-min gap-[5px] @[17rem]:mt-[7px] @[17rem]:grid-cols-[1fr_5.4rem] @[17rem]:gap-[7px]">
          <div className="rf-pcard-tile min-w-0 rounded-[14px] px-2.5 py-2 @[17rem]:rounded-[18px] @[17rem]:px-3.5 @[17rem]:py-3">
            {chips.length > 0 && (
              <p className="rf-pcard-gold truncate text-[8.5px] font-semibold tracking-[0.16em] uppercase @[17rem]:text-[10px]" aria-label="Profile">
                {chips.map((c) => c.label).join(' · ')}
              </p>
            )}
            <h3 className="rf-pcard-name mt-0.5 truncate font-serif text-[18px] leading-[1.05] @[17rem]:mt-1 @[17rem]:text-[23px]">
              <Link to={href} className="transition-opacity hover:opacity-70">
                {product.name}
              </Link>
            </h3>
            {product.inspiredBy && (
              <p className="rf-pcard-inspired mt-0.5 line-clamp-2 text-[10px] leading-snug font-medium @[17rem]:mt-1 @[17rem]:text-[12px]">Inspired by {product.inspiredBy}</p>
            )}
          </div>

          <div className="rf-pcard-price flex items-baseline justify-center gap-1 rounded-[14px] px-2 py-1.5 @[17rem]:flex-col @[17rem]:items-center @[17rem]:justify-center @[17rem]:gap-0 @[17rem]:rounded-[18px] @[17rem]:py-2">
            <span className="rf-pcard-gold text-[8.5px] font-semibold tracking-[0.14em] uppercase @[17rem]:text-[9.5px]">{selected.size.replace(/\s*ML$/i, ' ml')}</span>
            <strong key={selected.price} className="rf-num-pop rf-pcard-gold text-[17px] leading-none font-semibold tabular-nums @[17rem]:mt-0.5 @[17rem]:text-[25px]" aria-live="polite">
              {formatPrice(selected.price).replace(/\s*EGP$/i, '')}
            </strong>
            <span className="rf-pcard-gold text-[8.5px] font-semibold tracking-[0.14em] uppercase @[17rem]:text-[9.5px]">EGP</span>
          </div>

          {notes.length > 0 && (
            <ul
              className="rf-pcard-tile flex flex-wrap items-center gap-x-2 gap-y-1 rounded-[14px] px-2.5 py-1.5 @[17rem]:col-span-2 @[17rem]:gap-x-3.5 @[17rem]:rounded-[18px] @[17rem]:px-3.5 @[17rem]:py-2.5"
              aria-label="Fragrance notes"
            >
              {notes.map((n) => (
                <li key={n.name} className="rf-pcard-note rf-pcard-gold inline-flex min-w-0 items-center gap-1 text-[10px] font-medium @[17rem]:gap-1.5 @[17rem]:text-[12.5px]">
                  <img src={n.image} alt="" width={20} height={20} className="size-3.5 shrink-0 object-contain @[17rem]:size-[18px]" loading="lazy" decoding="async" />
                  <span className="truncate">{n.name}</span>
                </li>
              ))}
            </ul>
          )}

          {sizes.length > 1 ? (
            <div
              ref={pillRef}
              role="radiogroup"
              aria-label={`Size for ${product.name}`}
              className="rf-pcard-tile relative flex rounded-[14px] p-[3px] @[17rem]:rounded-[18px] @[17rem]:p-1"
            >
              <SlidingPill box={pillBox} className="rf-pcard-pill rounded-[11px] @[17rem]:rounded-[14px]" />
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
                    className={`relative z-[1] h-8 min-w-0 flex-1 rounded-[11px] text-[12px] font-semibold tabular-nums transition-colors duration-300 @[17rem]:h-10 @[17rem]:text-[13px] disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 ${
                      on ? 'rf-pcard-gold-strong' : 'rf-pcard-gold opacity-60 hover:opacity-100'
                    }`}
                  >
                    {sizeLabel(v.size)}
                  </button>
                )
              })}
            </div>
          ) : (
            <span className="rf-pcard-tile rf-pcard-gold grid place-items-center rounded-[14px] py-2 text-[12px] font-semibold @[17rem]:rounded-[18px]">{selected.size}</span>
          )}

          <button
            type="button"
            onClick={(e) => addWithFlight(cart, e.currentTarget, product, selected.id)}
            disabled={!selected.inStock}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[14px] bg-olive px-2 text-[10.5px] font-semibold tracking-[0.06em] whitespace-nowrap text-on-accent uppercase transition hover:bg-olive-hover disabled:opacity-50 @[17rem]:h-auto @[17rem]:flex-col @[17rem]:gap-1 @[17rem]:rounded-[18px] @[17rem]:py-1.5 @[17rem]:text-[10px] @[17rem]:leading-tight @[17rem]:whitespace-normal"
          >
            <BagIcon className="size-[17px] shrink-0" strokeWidth={1.6} />
            Add to cart
          </button>
        </div>

        {sample && (
          <button
            type="button"
            onClick={(e) => addWithFlight(cart, e.currentTarget, product, sample.id)}
            disabled={!sample.inStock}
            aria-label={`Try ${sample.size} of ${product.name} · ${formatPrice(sample.price)}`}
            className="rf-pcard-gold mx-auto mt-auto mb-0.5 flex items-center gap-1 pt-1.5 @[17rem]:pt-2 rounded-full px-2 py-1 text-[10px] font-semibold underline-offset-4 hover:underline disabled:pointer-events-none disabled:opacity-40 @[17rem]:text-[11.5px]"
          >
            <BottleIcon className="size-3.5 shrink-0" />
            Try {sample.size.replace(/\s*ML$/i, ' ml')} · {formatPrice(sample.price)}
          </button>
        )}
      </div>
    </article>
  )
}
