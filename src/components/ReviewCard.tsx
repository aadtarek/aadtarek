import { BadgeCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { findProductById } from '../api/catalog'
import type { Review } from '../types'
import { Stars } from './Stars'

/**
 * A review card: a large gold quote mark, the stars, the quote, then a footer
 * with who wrote it and the fragrance they bought (links to it).
 */
export function ReviewCard({ review }: { review: Review }) {
  const product = findProductById(review.productId)
  if (!product) return null
  const size = review.size?.replace(/\s*ML$/i, ' ml')

  return (
    <article className="rf-white group/review relative flex h-full flex-col overflow-hidden rounded-[26px] p-6 shadow-[0_1px_0_rgba(60,40,10,0.04),0_18px_40px_-28px_rgba(60,40,10,0.35)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_1px_0_rgba(60,40,10,0.04),0_26px_50px_-28px_rgba(60,40,10,0.45)] sm:p-7">
      <span aria-hidden className="pointer-events-none absolute -top-2 right-5 font-serif text-[130px] leading-none text-[#f3e3c9] select-none">
        ”
      </span>
      <div className="relative flex items-center gap-2">
        <Stars rating={review.rating} className="size-[15px]" />
        <span className="text-[12px] font-semibold text-muted tabular-nums">{review.rating.toFixed(1)}</span>
      </div>
      <blockquote className="relative mt-4 flex-1 font-serif text-[20px] leading-[1.32] text-ink sm:text-[22px]">{review.text}</blockquote>

      <div className="relative mt-6 flex flex-wrap items-center gap-x-3 gap-y-3 border-t border-line pt-5">
        <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-full bg-[#14110d] font-serif text-[19px] text-[#f0c27a]">
          {review.author.trim().charAt(0).toUpperCase()}
        </span>
        <span className="min-w-[150px] flex-1">
          <span className="block truncate text-[14.5px] font-semibold text-ink">{review.author}</span>
          {review.verified ? (
            <span className="flex items-center gap-1 text-[12px] font-medium text-[#55662a]">
              <BadgeCheck className="size-3.5" strokeWidth={1.8} />
              Verified purchase
            </span>
          ) : (
            <span className="block text-[12px] text-muted">Customer</span>
          )}
        </span>
        <Link
          to={`/product/${product.slug}`}
          aria-label={`${product.name}${size ? `, ${size}` : ''}`}
          title={product.name}
          className="ml-auto flex shrink-0 items-center gap-2 rounded-full bg-chip py-1 pr-3 pl-1 transition hover:bg-[#f3e3c9]"
        >
          <img src={product.images[0].src} alt="" loading="lazy" className="size-9 rounded-full object-cover" />
          <span className="max-w-[96px] truncate text-[12px] font-semibold text-ink-soft">{product.name}</span>
        </Link>
      </div>
    </article>
  )
}
