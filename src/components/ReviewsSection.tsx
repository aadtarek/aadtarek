import { ArrowRight, BadgeCheck, Star } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { findProductById, getReviews, ratingSummary } from '../api/catalog'
import type { Review } from '../types'

/**
 * Home: a dark band. On the left the rating, how the stars split and a link to every
 * review; on the right two rows of review cards gliding slowly in opposite directions
 * (they stop under the pointer; with reduced motion they become a plain swipeable row).
 */
export function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    getReviews().then(setReviews)
  }, [])

  const { average, count } = ratingSummary(reviews)
  const split = useMemo(() => [5, 4, 3, 2, 1].map((n) => ({ n, c: reviews.filter((r) => Math.round(r.rating) === n).length })), [reviews])
  // The newest with something to say first; very short ones last.
  // Only a handful are shown (a store can have hundreds): the best ones, newest first —
  // with something to say, 4★ or more, photos first.
  const ordered = useMemo(
    () =>
      [...reviews]
        .filter((r) => r.text.trim() && r.rating >= 4)
        .sort(
          (a, b) =>
            Number(b.text.trim().length > 24) - Number(a.text.trim().length > 24) ||
            Number(Boolean(b.images?.length)) - Number(Boolean(a.images?.length)) ||
            b.date.localeCompare(a.date),
        )
        .slice(0, 16),
    [reviews],
  )
  const rows = useMemo(() => {
    if (ordered.length < 10) return [ordered]
    return [ordered.filter((_, i) => i % 2 === 0), ordered.filter((_, i) => i % 2 === 1)]
  }, [ordered])

  // No reviews yet (e.g. a fresh WooCommerce store): hide the section rather than show an empty one.
  if (reviews.length === 0) return null

  return (
    <section aria-labelledby="reviews-title" className="container-x py-10 lg:py-14">
      <div className="rf-reviews-band relative overflow-hidden rounded-[28px] bg-[#1a120c] text-[#f6efe4] lg:rounded-[36px]">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(228,155,45,0.22),transparent_45%)]" />
        <div className="relative grid lg:grid-cols-[340px_1fr] xl:grid-cols-[380px_1fr]">
          {/* ---------- the rating ---------- */}
          <div className="px-6 pt-9 pb-2 sm:px-10 lg:py-12 lg:pr-4 lg:pl-12">
            <p className="text-[11px] font-semibold tracking-[0.24em] text-[#f0c27a] uppercase">Customer reviews</p>
            <h2 id="reviews-title" className="mt-3 font-serif text-[38px] leading-[0.98] sm:text-[48px]">
              Loved by the people <span className="text-[#f0c27a] italic">who wear it.</span>
            </h2>
            <div className="mt-7 flex items-center gap-4">
              <span className="font-serif text-[68px] leading-none">{average.toFixed(1)}</span>
              <span>
                <GoldStars rating={average} size="size-[18px]" />
                <span className="mt-1.5 block text-[13px] text-[#f6efe4]/65">
                  {count} {count === 1 ? 'review' : 'reviews'}
                </span>
              </span>
            </div>
            <ul className="mt-5 hidden max-w-[300px] gap-1.5 sm:grid" aria-label="How the ratings split">
              {split.map(({ n, c }) => (
                <li key={n} className="flex items-center gap-2.5 text-[12px] text-[#f6efe4]/65 tabular-nums">
                  <span className="w-3">{n}</span>
                  <Star className="size-3 fill-[#e49b2d] text-[#e49b2d]" strokeWidth={0} aria-hidden />
                  <span className="relative h-[5px] flex-1 overflow-hidden rounded-full bg-white/10">
                    <span className="absolute inset-y-0 left-0 rounded-full bg-[#e49b2d]" style={{ width: `${count ? (c / count) * 100 : 0}%` }} />
                  </span>
                  <span className="w-6 text-right">{c}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/reviews"
              className="group mt-8 hidden h-12 items-center gap-2 rounded-full bg-[#e49b2d] px-6 text-[11.5px] font-semibold tracking-[0.12em] text-[#1a120c] uppercase transition hover:bg-[#f0b04a] lg:inline-flex"
            >
              Read all reviews
              <ArrowRight className="size-4 transition group-hover:translate-x-1" strokeWidth={1.6} />
            </Link>
          </div>

          {/* ---------- the reviews ---------- */}
          <div className="rf-reviews-rows relative grid content-center gap-4 py-7 lg:py-12">
            {rows.map((row, i) => (
              <Row key={i} reviews={row} reverse={i === 1} />
            ))}
          </div>
        </div>
        <div className="relative px-6 pb-8 sm:px-10 lg:hidden">
          <Link
            to="/reviews"
            className="group flex h-12 items-center justify-center gap-2 rounded-full bg-[#e49b2d] text-[11.5px] font-semibold tracking-[0.12em] text-[#1a120c] uppercase"
          >
            Read all reviews
            <ArrowRight className="size-4 transition group-hover:translate-x-1" strokeWidth={1.6} />
          </Link>
        </div>
      </div>
    </section>
  )
}

/** One gliding row. The list is repeated so the loop has no gap, however few reviews there are. */
function Row({ reviews, reverse }: { reviews: Review[]; reverse: boolean }) {
  const box = useRef<HTMLDivElement>(null)
  const [onScreen, setOnScreen] = useState(false)
  // Moves only while it can be seen: no work for the phone the rest of the time.
  useEffect(() => {
    const el = box.current
    if (!el || typeof IntersectionObserver === 'undefined') return setOnScreen(true)
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { rootMargin: '100px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const times = Math.max(2, Math.ceil(8 / Math.max(1, reviews.length)))
  const half = Array.from({ length: times }, () => reviews).flat()
  // About 7 s per card keeps every quote readable while it passes.
  const seconds = Math.max(28, half.length * 7)
  return (
    <div ref={box} className="rf-marquee relative overflow-hidden">
      <ul
        className="rf-marquee-track flex w-max gap-4 px-2"
        style={{ animationDuration: `${seconds}s`, animationDirection: reverse ? 'reverse' : 'normal', animationPlayState: onScreen ? undefined : 'paused' }}
      >
        {[...half, ...half].map((r, i) => (
          <li key={`${r.id}-${i}`} aria-hidden={i >= half.length || undefined} className="w-[280px] shrink-0 sm:w-[330px]">
            <Quote review={r} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function Quote({ review }: { review: Review }) {
  const product = findProductById(review.productId)
  const photo = review.images?.[0]
  return (
    <article className="flex h-full flex-col rounded-[22px] border border-white/10 bg-[#2a1f17] p-5 transition-colors hover:border-[#f0c27a]/40">
      <div className="flex items-center justify-between gap-3">
        <GoldStars rating={review.rating} size="size-[14px]" />
        {review.verified && (
          <span className="flex items-center gap-1 text-[11px] font-medium text-[#b9d39a]">
            <BadgeCheck className="size-3.5" strokeWidth={1.8} aria-hidden />
            Verified
          </span>
        )}
      </div>
      <div className="mt-3 flex flex-1 gap-3">
        <blockquote dir="auto" className="line-clamp-4 flex-1 font-serif text-[18px] leading-[1.32] text-[#f6efe4]">
          “{review.text.trim()}”
        </blockquote>
        {photo && <img src={photo} alt="" loading="lazy" className="size-[64px] shrink-0 rounded-[14px] object-cover" />}
      </div>
      <div className="mt-4 flex items-center gap-2.5 border-t border-white/10 pt-4">
        <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-[#e49b2d] font-serif text-[16px] text-[#1a120c]">
          {review.author.trim().charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span dir="auto" className="block truncate text-[13px] font-semibold">
            {review.author}
          </span>
          {product && (
            <Link to={`/product/${product.slug}`} tabIndex={-1} className="block truncate text-[11.5px] text-[#f0c27a] hover:underline">
              {product.name}
              {review.size ? ` · ${review.size.replace(/\s*ML$/i, ' ml')}` : ''}
            </Link>
          )}
        </span>
        {product && <img src={product.images[0].src} alt="" loading="lazy" className="size-9 shrink-0 rounded-full object-cover" />}
      </div>
    </article>
  )
}

function GoldStars({ rating, size }: { rating: number; size: string }) {
  return (
    <span className="inline-flex gap-[3px]" role="img" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.max(0, Math.min(1, rating - i))
        return (
          <span key={i} className="relative">
            <Star className={`${size} fill-white/15 text-white/15`} strokeWidth={0} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className={`${size} fill-[#e49b2d] text-[#e49b2d]`} strokeWidth={0} />
            </span>
          </span>
        )
      })}
    </span>
  )
}
