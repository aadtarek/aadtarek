import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { priceRange, sampleVariation } from '../api/catalog'
import { formatPrice, formatPriceRange } from '../lib/format'
import { useCart } from '../store/cart'
import { useWishlist } from '../store/wishlist'
import type { Product } from '../types'

export function ProductCard({ product, badge }: { product: Product; badge?: string }) {
  const cart = useCart()
  const wishlist = useWishlist()
  const wished = wishlist.has(product.id)
  const range = priceRange(product)
  const sample = sampleVariation(product)
  const href = `/product/${product.slug}`

  return (
    <article className="motion-product-card flex h-full flex-col overflow-hidden rounded-lg bg-card shadow-[0_1px_2px_rgba(60,45,20,0.06),0_0_0_1px_rgba(60,45,20,0.04)] transition-shadow hover:shadow-[0_10px_30px_-12px_rgba(60,45,20,0.25),0_0_0_1px_rgba(60,45,20,0.05)]">
      <div className="relative aspect-[348/229] overflow-hidden">
        <Link to={href} tabIndex={-1} aria-hidden>
          <img
            src={product.images[0].src}
            alt={product.images[0].alt}
            loading="lazy"
            draggable={false}
            className="size-full object-cover transition-transform duration-700 ease-out hover:scale-[1.04]"
          />
        </Link>
        {badge && (
          <span className="pointer-events-none absolute top-[13px] left-4 rounded-full bg-card px-[13px] py-[5px] text-[11.5px] leading-none font-bold tracking-[0.07em] uppercase shadow-sm">
            {badge}
          </span>
        )}
        <button
          type="button"
          onClick={() => wishlist.toggle(product.id)}
          aria-pressed={wished}
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className="absolute top-2 right-2 grid size-10 place-items-center rounded-full text-white transition hover:scale-110"
        >
          <Heart
            className={`size-[25px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition ${wished ? 'fill-white' : ''}`}
            strokeWidth={1.4}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col px-4 pt-[17px] pb-4">
        <h3 className="font-serif text-[19px] leading-none uppercase">
          <Link to={href} className="hover:underline hover:decoration-1 hover:underline-offset-4">
            {product.name}
          </Link>
        </h3>
        <p className="mt-[6px] text-[14px] text-ink-soft">{product.tagline}</p>

        <ul className="mt-[7px] flex flex-wrap gap-2" aria-label="Main accords">
          {product.accords.map((a) => (
            <li key={a} className="rounded-[6px] bg-chip px-3 py-[2px] text-[12px] text-ink-soft">
              {a}
            </li>
          ))}
        </ul>

        <p className="mt-[8px] text-[12px] font-medium tracking-[0.04em] uppercase">Fragrance notes</p>
        <ul className="mt-[6px] grid grid-cols-5 gap-1">
          {product.notes.map((n) => (
            <li key={n.name} className="flex flex-col items-center text-center">
              <img src={n.image} alt="" className="h-[32px] w-auto object-contain" loading="lazy" />
              <span className="mt-[2px] text-[10.5px] leading-tight whitespace-nowrap text-ink-soft">{n.name}</span>
            </li>
          ))}
        </ul>

        <p className="mt-[14px] text-[12px] tracking-[0.02em] text-ink-soft uppercase">Inspired by</p>
        <p className="mt-px text-[13.5px] text-ink-soft">{product.inspiredBy}</p>
        <p className="mt-[5px] text-[18px] font-semibold tracking-[0.01em]">{formatPriceRange(range.min, range.max)}</p>

        <div className="mt-auto grid grid-cols-[1.3fr_1fr] gap-2 pt-[8px]">
          <button
            type="button"
            onClick={() => cart.openQuickAdd(product)}
            className="h-[50px] rounded-[3px] bg-olive px-2 text-[12px] font-medium tracking-[0.12em] text-cream uppercase transition hover:bg-olive-hover"
          >
            Add to cart
          </button>
          {sample && (
            <button
              type="button"
              onClick={() => cart.add(product.id, sample.id)}
              className="flex h-[50px] flex-col items-center justify-center rounded-[3px] border border-line-strong px-2 text-[12px] leading-[1.3] transition hover:border-ink hover:bg-ink hover:text-cream"
            >
              <span className="font-semibold tracking-[0.06em] uppercase">Try {sample.size}</span>
              <span className="tracking-[0.04em]">{formatPrice(sample.price)}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
