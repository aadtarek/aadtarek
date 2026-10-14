import { Heart, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { familyName, fullSizeVariations, sampleVariation } from '../api/catalog'
import { formatPrice } from '../lib/format'
import { profileChips } from '../lib/profile'
import { useCart } from '../store/cart'
import { useWishlist } from '../store/wishlist'
import type { Product } from '../types'
import { BottleIcon } from './Icons'

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

  return (
    <article className="group/card flex h-full flex-col">
      <div className="relative overflow-hidden rounded-2xl bg-chip">
        <Link to={href} tabIndex={-1} aria-hidden className="block aspect-square">
          <img
            src={product.images[0].src}
            srcSet={product.images[0].srcset}
            sizes="(min-width: 1280px) 20vw, (min-width: 640px) 30vw, 50vw"
            alt={product.images[0].alt}
            width={400}
            height={400}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="size-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-[1.04]"
          />
        </Link>
        {badge && (
          <span className="pointer-events-none absolute top-2.5 left-2.5 rounded-full bg-cream/90 px-2.5 py-[5px] text-[10.5px] leading-none font-medium tracking-[0.03em] text-ink backdrop-blur-sm">
            {badge}
          </span>
        )}
        <button
          type="button"
          onClick={() => wishlist.toggle(product.id)}
          aria-pressed={wished}
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className="absolute top-2 right-2 grid size-9 place-items-center rounded-full bg-cream/85 text-ink backdrop-blur-sm transition hover:bg-cream"
        >
          <Heart className={`size-[17px] transition ${wished ? 'fill-ink' : ''}`} strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex flex-1 flex-col pt-3">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="min-w-0 font-serif text-[19px] leading-tight sm:text-[21px]">
            <Link to={href} className="hover:underline hover:decoration-1 hover:underline-offset-4">
              {product.name}
            </Link>
          </h3>
          <p className="shrink-0 text-[13px] font-medium tabular-nums sm:text-[14px]" aria-live="polite">
            {formatPrice(selected.price)}
          </p>
        </div>
        {product.inspiredBy && <p className="mt-0.5 truncate text-[12px] text-muted sm:text-[12.5px]">Inspired by {product.inspiredBy}</p>}

        <ul className="mt-2.5 flex flex-wrap gap-1" aria-label="Profile">
          {chips.map(({ label, Icon }) => (
            <li key={label} className="inline-flex items-center gap-1 rounded-full bg-chip px-2 py-[3px] text-[10.5px] whitespace-nowrap text-ink-soft sm:text-[11px]">
              <Icon className="size-3 shrink-0" strokeWidth={1.5} aria-hidden />
              {label}
            </li>
          ))}
        </ul>

        {product.notes.length > 0 && (
          <ul className="mt-2.5 flex gap-2.5" aria-label="Fragrance notes">
            {product.notes.slice(0, 4).map((n) => (
              <li key={n.name} className="flex min-w-0 flex-1 flex-col items-center text-center">
                <span className="grid size-9 place-items-center rounded-full bg-chip">
                  <img src={n.image} alt="" width={24} height={24} className="size-6 object-contain" loading="lazy" decoding="async" />
                </span>
                <span className="mt-1 w-full truncate text-[10px] leading-tight text-muted">{n.name}</span>
              </li>
            ))}
          </ul>
        )}

        {sizes.length > 1 && (
          <div role="radiogroup" aria-label={`Size for ${product.name}`} className="mt-2.5 flex flex-wrap gap-1">
            {sizes.map((v) => {
              const on = v.id === selected.id
              return (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  disabled={!v.inStock}
                  onClick={() => setVariationId(v.id)}
                  className={`h-7 rounded-full border px-2.5 text-[11px] font-medium transition disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 ${
                    on ? 'border-ink bg-ink text-cream' : 'border-line-strong text-ink-soft hover:border-ink'
                  }`}
                >
                  {v.size.replace(/\s*ML$/i, ' ml')}
                </button>
              )
            })}
          </div>
        )}

        <div className="mt-auto flex flex-col gap-1.5 pt-3 sm:flex-row">
          <button
            type="button"
            onClick={() => cart.add(product.id, selected.id)}
            disabled={!selected.inStock}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full bg-olive sm:flex-1 px-3 text-[11px] font-medium tracking-[0.06em] whitespace-nowrap text-cream uppercase transition hover:bg-olive-hover disabled:opacity-50"
          >
            <ShoppingBag className="hidden size-[15px] shrink-0 sm:block" strokeWidth={1.5} aria-hidden />
            Add to cart
          </button>
          {sample && (
            <button
              type="button"
              onClick={() => cart.add(product.id, sample.id)}
              disabled={!sample.inStock}
              title={`${sample.size} sample · ${formatPrice(sample.price)}`}
              className="inline-flex h-9 items-center justify-center gap-1 rounded-full border border-line-strong px-3 text-[11px] font-medium whitespace-nowrap transition hover:border-ink disabled:pointer-events-none disabled:opacity-40 sm:h-10"
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
