import { useEffect, useState } from 'react'
import { getReviews, ratingSummary } from '../api/catalog'
import { PageHeader } from '../components/PageHeader'
import { ReviewCard } from '../components/ReviewCard'
import { Stars } from '../components/Stars'
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
        aside={
          count > 0 && (
            <div className="flex items-center gap-4 lg:flex-col lg:items-end lg:gap-1">
              <p className="font-serif text-[64px] leading-none lg:text-[96px]">{average.toFixed(1)}</p>
              <div className="lg:text-right">
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
