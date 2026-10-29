import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getReviews, ratingSummary } from '../api/catalog'
import type { Review } from '../types'
import { Carousel } from './Carousel'
import { ReviewCard } from './ReviewCard'
import { Stars } from './Stars'

function reviewsPerView(width: number) {
  if (width >= 820) return 3
  if (width >= 520) return 2
  return 1.15
}

/** Home: the average rating large on one side, the review cards on the other. */
export function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([])
  useEffect(() => {
    getReviews().then(setReviews)
  }, [])
  const { average, count } = ratingSummary(reviews)
  // No reviews yet (e.g. a fresh WooCommerce store): hide the section rather than show an empty one.
  if (reviews.length === 0) return null

  return (
    <section aria-labelledby="reviews-title" className="container-x py-12 lg:py-16">
      <div className="grid items-center gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
        <div className="text-center lg:text-left">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-gold uppercase">Customer reviews</p>
          <h2 id="reviews-title" className="sr-only">
            What our customers say
          </h2>
          <p aria-hidden className="mt-2 font-serif text-[84px] leading-none lg:text-[120px]">
            {average.toFixed(1)}
          </p>
          <div className="flex justify-center lg:justify-start">
            <Stars rating={average} className="size-[18px]" />
          </div>
          <p className="mt-3 text-[14.5px] text-ink-soft lg:text-[16px]">
            From {count} verified {count === 1 ? 'purchase' : 'purchases'}
          </p>
          <Link
            to="/reviews"
            className="rf-white group mt-5 inline-flex h-[42px] items-center gap-2 rounded-full border border-line px-[18px] text-[11px] font-semibold tracking-[0.12em] uppercase transition hover:border-ink"
          >
            Read all reviews
            <ArrowRight className="size-4 transition group-hover:translate-x-1" strokeWidth={1.5} />
          </Link>
        </div>
        <div className="min-w-0">
          <Carousel
            label="Customer reviews"
            itemLabel="review"
            items={reviews}
            getKey={(r) => r.id}
            renderItem={(r) => <ReviewCard review={r} />}
            perViewFor={reviewsPerView}
            arrowTop="50%"
            gap={16}
          />
        </div>
      </div>
    </section>
  )
}
