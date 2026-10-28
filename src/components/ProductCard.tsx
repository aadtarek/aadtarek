import { Eye } from 'lucide-react'
import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { composition, familyName, fullSizeVariations, sampleVariation } from '../api/catalog'
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

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()

/** Top / Heart / Base for a key note, from the product's composition. */
function noteLevel(product: Product, note: string) {
  const c = composition(product)
  if (c.opening.some((n) => same(n, note))) return 'Top'
  if (c.heart.some((n) => same(n, note))) return 'Heart'
  if (c.drydown.some((n) => same(n, note))) return 'Base'
  return ''
}

/**
 * Product card. Wide (shop list, phones one per row): the photo on the left and the
 * details on the right, fading into the family's colour. Narrow (carousels, small
 * grids): the same details under the photo. Details: family, name, DNA, the three key
 * notes (Top / Heart / Base), sizes, price with the 5 ml sample, and Add to cart.
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
    <article className="rf-card rf-pcard group/card @container h-full" style={{ '--tint': tint, '--tint-ink': ink } as CSSProperties}>
      <div className="rf-pcard-in grid h-full overflow-hidden rounded-[20px] @[22rem]:grid-cols-[42%_1fr] @[28rem]:grid-cols-[38%_1fr] @[22rem]:rounded-[24px] @[28rem]:rounded-[30px]">
        <div className="rf-pcard-photo relative overflow-hidden bg-chip">
          <Link to={href} tabIndex={-1} aria-hidden className="relative block aspect-[5/4] @[22rem]:absolute @[22rem]:inset-0 @[22rem]:aspect-auto">
            <img
              src={main.src}
              srcSet={main.srcset}
              sizes="(min-width: 1024px) 22vw, (min-width: 640px) 40vw, 50vw"
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
                sizes="(min-width: 1024px) 22vw, (min-width: 640px) 40vw, 50vw"
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
            <span className="pointer-events-none absolute top-2 left-2 rounded-full bg-white/90 px-2 py-1 text-[9px] leading-none font-semibold text-[#14110d] backdrop-blur-md @[28rem]:top-3.5 @[28rem]:left-3.5 @[28rem]:px-2.5 @[28rem]:py-1.5 @[28rem]:text-[10.5px]">
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
            className="absolute top-1.5 right-1.5 grid size-8 place-items-center rounded-full bg-white/85 text-[#14110d] backdrop-blur-md transition hover:scale-110 hover:bg-white @[28rem]:top-3 @[28rem]:right-3 @[28rem]:size-9"
          >
            <HeartIcon key={String(wished)} className={`size-[17px] transition ${wished ? 'rf-heart-beat fill-[#e49b2d] text-[#e49b2d]' : ''}`} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => cart.openQuickAdd(product)}
            aria-label={`Quick view ${product.name}`}
            className="rf-pcard-qv absolute bottom-2 left-2 inline-flex h-8 items-center justify-center gap-1.5 rounded-full bg-[#100e0b]/75 px-2 text-white backdrop-blur-md transition hover:bg-[#100e0b] @[28rem]:bottom-3.5 @[28rem]:left-3.5 @[28rem]:h-9 @[28rem]:px-3"
          >
            <Eye className="size-4" strokeWidth={1.7} aria-hidden />
            <span className="hidden text-[10.5px] font-semibold tracking-[0.08em] uppercase @[28rem]:inline">Quick view</span>
          </button>
        </div>

        <div className="rf-pcard-body flex min-w-0 flex-col p-3 @[22rem]:p-3.5 @[28rem]:px-5 @[28rem]:pt-5 @[28rem]:pb-5">
          {chips.length > 0 && (
            <p className="rf-pcard-ink truncate text-[8.5px] font-semibold tracking-[0.16em] uppercase @[28rem]:text-[10.5px] @[28rem]:tracking-[0.2em]" aria-label="Profile">
              {chips.map((c) => c.label).join(' · ')}
            </p>
          )}
          <h3 className="mt-1 truncate font-serif text-[19px] leading-[1.05] @[22rem]:text-[22px] @[28rem]:mt-1.5 @[28rem]:text-[31px]">
            <Link to={href} className="transition-opacity hover:opacity-70">
              {product.name}
            </Link>
          </h3>
          {product.inspiredBy && <p className="mt-0.5 truncate text-[10.5px] text-muted @[28rem]:mt-1 @[28rem]:text-[13px]">Inspired by {product.inspiredBy}</p>}

          {notes.length > 0 && (
            <ul className="mt-2.5 space-y-1 @[28rem]:mt-3.5 @[28rem]:space-y-1.5" aria-label="Fragrance notes">
              {notes.map((n) => {
                const level = noteLevel(product, n.name)
                return (
                  <li key={n.name} className="rf-pcard-note flex items-center gap-2 text-[11px] text-ink-soft @[28rem]:gap-2.5 @[28rem]:text-[13px]">
                    <span className="rf-pcard-chip grid size-5 shrink-0 place-items-center rounded-full @[28rem]:size-[26px]">
                      <img src={n.image} alt="" width={20} height={20} className="size-3 object-contain @[28rem]:size-4" loading="lazy" decoding="async" />
                    </span>
                    <span className="min-w-0 truncate">{n.name}</span>
                    {level && <span className="rf-pcard-ink ml-auto shrink-0 text-[8px] font-semibold tracking-[0.16em] uppercase opacity-80 @[28rem]:text-[9.5px]">{level}</span>}
                  </li>
                )
              })}
            </ul>
          )}

          {sizes.length > 1 && (
            <div
              ref={pillRef}
              role="radiogroup"
              aria-label={`Size for ${product.name}`}
              className="rf-pcard-sizes relative mt-3 flex rounded-full p-[3px] @[28rem]:mt-4 @[28rem]:w-max @[28rem]:p-1"
            >
              <SlidingPill box={pillBox} className="rounded-full bg-[#14110d]" />
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
                    className={`relative z-[1] h-7 min-w-0 flex-1 rounded-full px-1 text-[11px] font-semibold whitespace-nowrap tabular-nums transition-colors duration-300 @[28rem]:h-8 @[28rem]:flex-none @[28rem]:px-3.5 @[28rem]:text-[12px] disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 ${
                      on ? 'text-white' : 'text-muted hover:text-ink'
                    }`}
                  >
                    {v.size.replace(/\s*ML$/i, ' ml')}
                  </button>
                )
              })}
            </div>
          )}

          <div className="mt-auto flex flex-wrap items-end justify-between gap-x-2 gap-y-2.5 pt-3 @[28rem]:pt-4">
            <div className="min-w-0">
              <p key={selected.price} className="rf-num-pop text-[16px] leading-none font-semibold whitespace-nowrap tabular-nums @[28rem]:text-[21px]" aria-live="polite">
                {formatPrice(selected.price)}
              </p>
              {sample && (
                <button
                  type="button"
                  onClick={(e) => addWithFlight(cart, e.currentTarget, product, sample.id)}
                  disabled={!sample.inStock}
                  aria-label={`Try ${sample.size} of ${product.name} · ${formatPrice(sample.price)}`}
                  className="rf-pcard-ink mt-1.5 flex items-center gap-1 text-[9.5px] font-semibold whitespace-nowrap underline-offset-4 hover:underline disabled:pointer-events-none disabled:opacity-40 @[28rem]:text-[11.5px]"
                >
                  <BottleIcon className="size-3 shrink-0 @[28rem]:size-3.5" />
                  Try {sample.size.replace(/\s*ML$/i, ' ml')} · {formatPrice(sample.price)}
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => addWithFlight(cart, e.currentTarget, product, selected.id)}
              disabled={!selected.inStock}
              className="inline-flex size-10 shrink-0 items-center justify-center gap-2 rounded-full bg-olive text-on-accent shadow-[0_12px_22px_-12px_rgba(228,155,45,0.95)] transition hover:bg-olive-hover disabled:opacity-50 @[28rem]:h-11 @[28rem]:w-auto @[28rem]:gap-1.5 @[28rem]:px-4"
            >
              <BagIcon className="size-[18px] shrink-0" strokeWidth={1.6} />
              <span className="sr-only text-[11.5px] font-semibold tracking-[0.06em] whitespace-nowrap uppercase @[28rem]:not-sr-only">Add to cart</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
