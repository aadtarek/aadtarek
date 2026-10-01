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
      <PageHeader eyebrow="Customer reviews" title="What our customers say.">
        {count > 0 && (
          <p className="mt-4 flex items-center gap-3 text-ink-soft">
            <Stars rating={average} />
            <span className="text-lg font-medium text-ink">{average.toFixed(1)}/5</span>
            <span>
              · {count} verified {count === 1 ? 'review' : 'reviews'}
            </span>
          </p>
        )}
      </PageHeader>
      <ul className="container-x grid gap-[13px] md:grid-cols-2 xl:grid-cols-3">
        {reviews.map((r) => (
          <li key={r.id}>
            <ReviewCard review={r} />
          </li>
        ))}
      </ul>
    </div>
  )
}
