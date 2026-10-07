import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getReviews, ratingSummary, useCatalogReady } from '../api/catalog'
import type { Review } from '../types'
import { Carousel } from './Carousel'
import { ReviewCard } from './ReviewCard'
import { Stars } from './Stars'

function reviewsPerView(width: number) {
  if (width >= 1100) return 3
  if (width >= 700) return 2
  return 1.08
}

export function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([])
  const ready = useCatalogReady()
  useEffect(() => {
    getReviews().then(setReviews)
  }, [ready])
  const { average } = ratingSummary(reviews)
  // No reviews yet (e.g. a fresh WooCommerce store): hide the section rather than show an empty one.
  if (reviews.length === 0) return null

  return (
    <section aria-labelledby="reviews-title" className="bg-sand pt-12 pb-10 lg:pt-[62px] lg:pb-[50px]">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-[84px]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[12px] tracking-[0.2em] text-ink-soft uppercase sm:text-[15px]">Customer reviews</p>
            <h2 id="reviews-title" className="mt-2 font-serif text-[38px] leading-[1.05] sm:text-[58px]">
              What our customers say.
            </h2>
            <p className="mt-2 text-[16px] text-ink-soft sm:text-[18px]">Real experiences from people who wear Rfaheya.</p>
          </div>

          {reviews.length > 0 && (
            <div className="flex items-center gap-6 lg:mt-[37px] lg:gap-[46px]">
              <div>
                <p className="flex items-center gap-4">
                  <Stars rating={average} className="size-[21px]" />
                  <span className="text-[28px] leading-none font-medium">{average.toFixed(1)}/5</span>
                </p>
                <p className="mt-[9px] text-[14.5px] text-ink-soft">Based on verified purchases</p>
              </div>
              <span aria-hidden className="hidden h-[58px] w-px bg-line-strong/70 sm:block" />
              <Link
                to="/reviews"
                className="group hidden shrink-0 items-center gap-3 text-[13.5px] font-medium tracking-[0.15em] uppercase sm:flex"
              >
                View all reviews
                <ArrowRight className="size-[18px] transition group-hover:translate-x-1" strokeWidth={1.5} />
              </Link>
            </div>
          )}
        </div>

        <div className="mt-7 lg:mt-[34px]">
          {reviews.length > 0 && (
            <Carousel
              label="Customer reviews"
              itemLabel="review"
              items={reviews}
              getKey={(r) => r.id}
              renderItem={(r) => <ReviewCard review={r} />}
              perViewFor={reviewsPerView}
              arrowTop="calc(50% - 46px)"
              gap={13}
              arrowClass={{ prev: '-left-3 xl:-left-[63px]', next: '-right-3 xl:-right-[63px]' }}
            />
          )}
        </div>
        <Link
          to="/reviews"
          className="group mt-6 flex items-center justify-center gap-3 text-[13px] font-medium tracking-[0.15em] uppercase sm:hidden"
        >
          View all reviews
          <ArrowRight className="size-[18px]" strokeWidth={1.5} />
        </Link>
      </div>
    </section>
  )
}
