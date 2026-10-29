import { ArrowRight, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { findProductById } from '../api/catalog'
import type { Review } from '../types'
import { Stars } from './Stars'

/** A white review card: stars, the quote, who wrote it and a chip linking to the fragrance. */
export function ReviewCard({ review }: { review: Review }) {
  const product = findProductById(review.productId)
  if (!product) return null

  return (
    <article className="rf-white flex h-full flex-col rounded-[24px] border border-line p-5 sm:p-6">
      <Stars rating={review.rating} className="size-[15px]" />
      <blockquote className="mt-3.5 flex-1 font-serif text-[19px] leading-[1.3] text-ink sm:text-[21px]">“{review.text}”</blockquote>
      <div className="mt-5 flex items-center gap-2.5">
        <span aria-hidden className="grid size-[38px] shrink-0 place-items-center rounded-full bg-[#f3e3c9] text-[15px] font-bold text-[#8a5a1c]">
          {review.author.trim().charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[14px] font-semibold text-ink">{review.author}</span>
          {review.verified && (
            <span className="flex items-center gap-1 text-[11.5px] font-medium text-[#55662a]">
              <Check className="size-3" strokeWidth={2.4} />
              Verified purchase
            </span>
          )}
        </span>
      </div>
      <Link
        to={`/product/${product.slug}`}
        className="group mt-4 flex items-center gap-2.5 rounded-full bg-chip py-1.5 pr-3 pl-1.5 text-[12px] font-semibold text-ink-soft transition hover:text-ink"
      >
        <img src={product.images[0].src} alt="" loading="lazy" className="size-8 shrink-0 rounded-full object-cover" />
        <span className="min-w-0 flex-1 truncate">
          {product.name}
          {review.size && ` · ${review.size.replace(/\s*ML$/i, ' ml')}`}
        </span>
        <ArrowRight className="size-3.5 shrink-0 transition group-hover:translate-x-0.5" strokeWidth={1.6} />
      </Link>
    </article>
  )
}
