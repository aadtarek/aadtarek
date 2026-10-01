import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { findProductById } from '../api/catalog'
import type { Review } from '../types'
import { Stars, VerifiedBadge } from './Stars'

const portraits = import.meta.glob<string>('../assets/reviews/*.webp', { eager: true, import: 'default' })

export function ReviewCard({ review }: { review: Review }) {
  const product = findProductById(review.productId)
  if (!product) return null
  const image = portraits[`../assets/reviews/${product.slug}.webp`] ?? product.images[0].src

  return (
    <article className="flex h-full gap-4 rounded-lg border border-line bg-[#fbf7f1] p-4 sm:gap-6 sm:py-[19px] sm:pr-[19px] sm:pl-[26px]">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="pt-1 sm:pt-[12px]">
          <Stars rating={review.rating} className="size-[21px]" />
        </div>
        <blockquote className="mt-[13px] font-serif text-[17px] leading-[1.27] font-normal tracking-[-0.035em] text-ink sm:text-[18.5px]">
          “{review.text}”
        </blockquote>
        <div className="mt-[11px] border-t border-line pt-[10px]">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-[15px] text-ink">{review.author}</span>
            {review.verified && <VerifiedBadge />}
          </p>
          <p className="mt-[5px] text-[13.5px] tracking-[0.12em] text-muted uppercase">
            {product.name} · {review.size}
          </p>
        </div>
        <Link
          to={`/product/${product.slug}`}
          className="group mt-auto inline-flex items-center gap-3 self-start pt-6 text-[13.5px] font-semibold tracking-[0.12em] uppercase"
        >
          View product
          <ArrowRight className="size-[18px] transition group-hover:translate-x-1" strokeWidth={1.5} />
        </Link>
      </div>
      <Link to={`/product/${product.slug}`} tabIndex={-1} aria-hidden className="w-[38%] max-w-[148px] shrink-0 self-stretch">
        <img src={image} alt="" loading="lazy" draggable={false} className="size-full rounded-md object-cover" />
      </Link>
    </article>
  )
}
