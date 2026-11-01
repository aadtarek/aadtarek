import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getReviews, ratingSummary } from '../api/catalog'
import type { Review } from '../types'
import { ReviewCard } from './ReviewCard'
import { Stars } from './Stars'

const GAP = 16

/**
 * Home: the rating and a heading, then the review cards in a swipeable row,
 * with a progress line, a counter and prev/next arrows under it.
 */
export function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([])
  const track = useRef<HTMLUListElement>(null)
  const [state, setState] = useState({ progress: 0, index: 0, visible: 1, overflow: false, atStart: true, atEnd: false })

  useEffect(() => {
    getReviews().then(setReviews)
  }, [])

  const measure = useCallback(() => {
    const el = track.current
    const first = el?.firstElementChild as HTMLElement | null
    if (!el || !first) return
    const step = first.offsetWidth + GAP
    const max = el.scrollWidth - el.clientWidth
    setState({
      progress: max > 0 ? el.scrollLeft / max : 1,
      index: Math.round(el.scrollLeft / step),
      visible: Math.max(1, Math.round((el.clientWidth + GAP) / step)),
      overflow: max > 4,
      atStart: el.scrollLeft <= 4,
      atEnd: el.scrollLeft >= max - 4,
    })
  }, [])

  useEffect(() => {
    const el = track.current
    if (!el) return
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [measure, reviews.length])

  const go = (dir: 1 | -1) => {
    const el = track.current
    const first = el?.firstElementChild as HTMLElement | null
    if (!el || !first) return
    el.scrollBy({ left: dir * (first.offsetWidth + GAP), behavior: 'smooth' })
  }

  const { average, count } = ratingSummary(reviews)
  // No reviews yet (e.g. a fresh WooCommerce store): hide the section rather than show an empty one.
  if (reviews.length === 0) return null

  const total = reviews.length
  const shown = Math.min(total, state.index + state.visible)
  const pad = (n: number) => String(n).padStart(2, '0')
  const arrow =
    'grid size-12 place-items-center rounded-full transition duration-300 disabled:pointer-events-none disabled:opacity-30 active:scale-95'

  return (
    <section aria-labelledby="reviews-title" className="container-x py-10 lg:py-14">
      <div className="overflow-hidden rounded-[28px] bg-chip px-5 py-9 lg:rounded-[36px] lg:p-12">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.24em] text-gold uppercase">Customer reviews</p>
            <h2 id="reviews-title" className="mt-3 font-serif text-[40px] leading-[0.98] sm:text-[54px]">
              Loved by the people <span className="text-gold italic">who wear it.</span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-serif text-[64px] leading-none lg:text-[76px]">{average.toFixed(1)}</span>
            <span>
              <Stars rating={average} className="size-[17px]" />
              <span className="mt-1.5 block text-[13.5px] text-ink-soft">
                From {count} verified {count === 1 ? 'purchase' : 'purchases'}
              </span>
            </span>
          </div>
        </div>

        <ul
          ref={track}
          onScroll={measure}
          aria-label="Customer reviews"
          className="no-scrollbar -mx-5 mt-8 flex snap-x snap-mandatory scroll-px-5 overflow-x-auto px-5 pt-1 pb-6 lg:mx-0 lg:scroll-px-0 lg:px-0"
          style={{ gap: GAP }}
        >
          {reviews.map((r) => (
            <li key={r.id} className="w-[86%] shrink-0 snap-start sm:w-[calc((100%-16px)/2)] lg:w-[calc((100%-32px)/3)]">
              <ReviewCard review={r} />
            </li>
          ))}
        </ul>

        <div className="mt-2 flex items-center gap-4">
          {state.overflow ? (
            <>
              <span className="text-[13px] font-semibold text-ink tabular-nums" aria-live="polite">
                {pad(shown)} <span className="text-muted">/ {pad(total)}</span>
              </span>
              <span aria-hidden className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-line-strong/60">
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-olive transition-[width] duration-300"
                  style={{ width: `${Math.max(shown / total, state.progress) * 100}%` }}
                />
              </span>
              <span className="flex gap-2">
                <button type="button" onClick={() => go(-1)} disabled={state.atStart} aria-label="Previous reviews" className={`${arrow} rf-white text-ink shadow-[inset_0_0_0_1.5px_var(--color-line-strong)] hover:shadow-[inset_0_0_0_1.5px_var(--color-ink)]`}>
                  <ArrowLeft className="size-5" strokeWidth={1.5} />
                </button>
                <button type="button" onClick={() => go(1)} disabled={state.atEnd} aria-label="Next reviews" className={`${arrow} bg-olive text-on-accent hover:bg-olive-hover`}>
                  <ArrowRight className="size-5" strokeWidth={1.5} />
                </button>
              </span>
            </>
          ) : (
            <span className="flex-1" />
          )}
          <Link
            to="/reviews"
            className="group hidden h-12 items-center gap-2 rounded-full px-2 text-[11.5px] font-semibold tracking-[0.12em] text-ink uppercase underline-offset-4 hover:underline sm:inline-flex"
          >
            All reviews
            <ArrowRight className="size-4 transition group-hover:translate-x-1" strokeWidth={1.5} />
          </Link>
        </div>
        <Link
          to="/reviews"
          className="group rf-white mt-5 flex h-12 items-center justify-center gap-2 rounded-full text-[11.5px] font-semibold tracking-[0.12em] uppercase sm:hidden"
        >
          Read all reviews
          <ArrowRight className="size-4 transition group-hover:translate-x-1" strokeWidth={1.5} />
        </Link>
      </div>
    </section>
  )
}
