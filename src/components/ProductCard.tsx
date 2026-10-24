import { Eye, Heart, ShoppingBag } from 'lucide-react'
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
 * Product card: photo, name and price, DNA, tags (who it's for, family,
 * occasion, season), key notes, the bottle sizes (a size can be picked and
 * added right here) and the 5 ML sample.
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
  const chips = profileChips(product, familyName)
  const [pillRef, pillBox] = useSlidingPill<HTMLDivElement>(variationId)

  return (
    <article className="rf-card group/card @container flex h-full flex-col">
      <div className="motion-product-card relative overflow-hidden rounded-2xl bg-chip">
        <Link to={href} tabIndex={-1} aria-hidden className="block aspect-[5/4]">
          <img
            src={product.images[0].src}
            srcSet={product.images[0].srcset}
            sizes="(min-width: 1280px) 20vw, (min-width: 640px) 30vw, 50vw"
            alt={product.images[0].alt}
            width={400}
            height={320}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="size-full object-cover"
          />
        </Link>
        {badge && (
          <span className="pointer-events-none absolute top-2.5 left-2.5 rounded-full bg-cream/90 px-2.5 py-[5px] text-[10.5px] leading-none font-medium tracking-[0.03em] text-ink backdrop-blur-sm">
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
          className="absolute top-2 right-2 grid size-9 place-items-center rounded-full bg-cream/85 text-ink backdrop-blur-sm transition hover:bg-cream"
        >
          <Heart key={String(wished)} className={`size-[17px] transition ${wished ? 'rf-heart-beat fill-ink' : ''}`} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={() => cart.openQuickAdd(product)}
          aria-label={`Quick view ${product.name}`}
          className="absolute right-2 bottom-2 inline-flex h-8 items-center gap-1.5 rounded-full bg-cream/90 px-2.5 text-[10.5px] font-medium tracking-[0.06em] text-ink uppercase backdrop-blur-sm transition hover:bg-cream sm:h-9 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/card:opacity-100 [@media(hover:hover)]:focus-visible:opacity-100"
        >
          <Eye className="size-4" strokeWidth={1.5} aria-hidden />
          <span className="hidden sm:inline">Quick view</span>
        </button>
      </div>

      <div className="flex flex-1 flex-col pt-2.5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="min-w-0 truncate font-serif text-[17px] leading-tight sm:text-[20px]">
            <Link to={href} className="hover:underline hover:decoration-1 hover:underline-offset-4">
              {product.name}
            </Link>
          </h3>
          <p className="shrink-0 text-[12px] font-medium tabular-nums sm:text-[13.5px]" aria-live="polite">
            {formatPrice(selected.price)}
          </p>
        </div>
        {product.inspiredBy && <p className="mt-0.5 truncate text-[11px] text-muted sm:text-[12px]">Inspired by {product.inspiredBy}</p>}

        <ul className="mt-2 flex flex-wrap gap-1" aria-label="Profile">
          {chips.map(({ label, Icon }) => (
            <li key={label} className="inline-flex items-center gap-1 rounded-full bg-chip px-1.5 py-[2px] text-[10px] whitespace-nowrap text-ink-soft sm:px-2 sm:text-[10.5px]">
              <Icon className="size-2.5 shrink-0 sm:size-3" strokeWidth={1.5} aria-hidden />
              {label}
            </li>
          ))}
        </ul>

        {product.notes.length > 0 && (
          <ul className="mt-2 flex gap-1.5 sm:gap-2" aria-label="Fragrance notes">
            {product.notes.slice(0, 4).map((n) => (
              <li key={n.name} className="flex min-w-0 flex-1 flex-col items-center text-center">
                <span className="grid size-7 place-items-center rounded-full bg-chip sm:size-8">
                  <img src={n.image} alt="" width={24} height={24} className="size-[18px] object-contain sm:size-5" loading="lazy" decoding="async" />
                </span>
                <span className="mt-0.5 w-full truncate text-[9.5px] leading-tight text-muted">{n.name}</span>
              </li>
            ))}
          </ul>
        )}

        {sizes.length > 1 && (
          <div ref={pillRef} role="radiogroup" aria-label={`Size for ${product.name}`} className="relative mt-2 flex flex-wrap gap-1">
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
                  className={`relative z-[1] h-6 rounded-full border px-2 text-[10.5px] font-medium transition sm:h-7 sm:px-2.5 sm:text-[11px] disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 ${
                    on ? 'border-olive text-on-accent' : 'border-line-strong text-ink-soft hover:border-ink'
                  }`}
                >
                  {v.size.replace(/\s*ML$/i, ' ml')}
                </button>
              )
            })}
          </div>
        )}

        <div className="mt-auto flex flex-col gap-1 pt-2.5 @[16rem]:flex-row @[16rem]:gap-1.5">
          <button
            type="button"
            onClick={(e) => addWithFlight(cart, e.currentTarget, product, selected.id)}
            disabled={!selected.inStock}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-olive px-3 text-[10.5px] @[16rem]:min-w-0 @[16rem]:flex-1 sm:text-[11px] font-medium tracking-[0.06em] whitespace-nowrap text-on-accent uppercase transition hover:bg-olive-hover disabled:opacity-50"
          >
            <ShoppingBag className="hidden size-[15px] shrink-0 sm:block" strokeWidth={1.5} aria-hidden />
            Add to cart
          </button>
          {sample && (
            <button
              type="button"
              onClick={(e) => addWithFlight(cart, e.currentTarget, product, sample.id)}
              disabled={!sample.inStock}
              title={`${sample.size} sample · ${formatPrice(sample.price)}`}
              className="inline-flex h-8 items-center justify-center gap-1 rounded-full border border-line-strong px-3 text-[10.5px] font-medium whitespace-nowrap transition hover:border-ink disabled:pointer-events-none disabled:opacity-40 sm:h-9 sm:text-[11px]"
            >
              <BottleIcon className="hidden size-[15px] shrink-0 sm:block" />
              Try {sample.size}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
