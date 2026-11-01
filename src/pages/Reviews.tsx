import { useEffect, useState } from 'react'
import { getReviews, ratingSummary } from '../api/catalog'
import { PageHeader } from '../components/PageHeader'
import { ReviewCard } from '../components/ReviewCard'
import { Stars } from '../components/Stars'
import reviewsImage from '../assets/reviews/vanilla-oud.webp'
import type { Review } from '../types'

export function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  useEffect(() => {
    getReviews().then(setReviews)
  }, [])
  const { average, count } = ratingSummary(reviews)

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="Customer reviews"
        title="What our customers say"
        image={reviewsImage}
        aside={
          count > 0 && (
            <div className="rf-white inline-flex items-center gap-4 rounded-[22px] py-3 pr-5 pl-4">
              <p className="font-serif text-[52px] leading-none">{average.toFixed(1)}</p>
              <div>
                <Stars rating={average} className="size-4" />
                <p className="mt-1 text-[13px] text-muted">
                  {count} verified {count === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>
          )
        }
      />
      <ul className="container-x mt-6 grid gap-3.5 md:grid-cols-2 lg:mt-8 xl:grid-cols-3">
        {reviews.map((r) => (
          <li key={r.id}>
            <ReviewCard review={r} />
          </li>
        ))}
      </ul>
    </div>
  )
}
