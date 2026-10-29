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
          <Link to={href} tabIndex={-1} aria-hidden className="rf-pc-photo relative block">
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

        <div className="rf-pc-grid">
          <div className="rf-pcard-tile rf-pc-info min-w-0">
            {chips.length > 0 && (
              <p className="rf-pcard-gold rf-pc-tags truncate font-semibold uppercase" aria-label="Profile">
                {chips.map((c) => c.label).join(' · ')}
              </p>
            )}
            <h3 className="rf-pcard-name rf-pc-title truncate font-serif">
              <Link to={href} className="transition-opacity hover:opacity-70">
                {product.name}
              </Link>
            </h3>
            {product.inspiredBy && <p className="rf-pcard-inspired rf-pc-dna font-medium">Inspired by {product.inspiredBy}</p>}
          </div>

          <div className="rf-pcard-price rf-pc-price">
            <span className="rf-pcard-gold rf-pc-unit rf-pc-size font-semibold uppercase">{selected.size.replace(/\s*ML$/i, ' ml')}</span>
            <strong key={selected.price} className="rf-num-pop rf-pcard-gold rf-pc-amount font-semibold tabular-nums" aria-live="polite">
              {formatPrice(selected.price).replace(/\s*EGP$/i, '')}
            </strong>
            <span className="rf-pcard-gold rf-pc-unit font-semibold uppercase">EGP</span>
          </div>

          {notes.length > 0 && (
            <ul className="rf-pcard-tile rf-pc-notes" aria-label="Fragrance notes">
              {notes.map((n) => (
                <li key={n.name} className="rf-pcard-note rf-pcard-gold inline-flex shrink-0 items-center font-medium">
                  <img src={n.image} alt="" width={20} height={20} className="shrink-0 object-contain" loading="lazy" decoding="async" />
                  <span>{n.name}</span>
                </li>
              ))}
            </ul>
          )}

          {sizes.length > 1 ? (
            <div ref={pillRef} role="radiogroup" aria-label={`Size for ${product.name}`} className="rf-pcard-tile rf-pc-sizes relative flex">
              <SlidingPill box={pillBox} className="rf-pcard-pill rf-pc-pill" />
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
                    className={`rf-pc-size-btn relative z-[1] min-w-0 flex-1 font-semibold tabular-nums transition-colors duration-300 disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 ${
                      on ? 'rf-pcard-gold-strong' : 'rf-pcard-gold opacity-60 hover:opacity-100'
                    }`}
                  >
                    {sizeLabel(v.size)}
                  </button>
                )
              })}
            </div>
          ) : (
            <span className="rf-pcard-tile rf-pcard-gold rf-pc-sizes grid place-items-center text-[12px] font-semibold">{selected.size}</span>
          )}

          <button
            type="button"
            onClick={(e) => addWithFlight(cart, e.currentTarget, product, selected.id)}
            disabled={!selected.inStock}
            className="rf-pc-add inline-flex items-center justify-center bg-olive font-semibold text-on-accent uppercase transition hover:bg-olive-hover disabled:opacity-50"
          >
            <BagIcon className="shrink-0" strokeWidth={1.6} />
            <span className="rf-pc-add-label">Add to cart</span>
          </button>
        </div>

        {sample && (
          <button
            type="button"
            onClick={(e) => addWithFlight(cart, e.currentTarget, product, sample.id)}
            disabled={!sample.inStock}
            aria-label={`Try ${sample.size} of ${product.name} · ${formatPrice(sample.price)}`}
            className="rf-pcard-gold rf-pc-try mx-auto mt-auto flex items-center gap-1 rounded-full font-semibold underline-offset-4 hover:underline disabled:pointer-events-none disabled:opacity-40"
          >
            <BottleIcon className="shrink-0" />
            Try {sample.size.replace(/\s*ML$/i, ' ml')} · {formatPrice(sample.price)}
          </button>
        )}
      </div>
    </article>
  )
}
