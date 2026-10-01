import { Star } from 'lucide-react'

export function Stars({ rating, className = 'size-5' }: { rating: number; className?: string }) {
  return (
    <span className="inline-flex gap-[5px]" role="img" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.max(0, Math.min(1, rating - i))
        return (
          <span key={i} className="relative">
            <Star className={`${className} fill-line text-line`} strokeWidth={0} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className={`${className} fill-gold text-gold`} strokeWidth={0} />
            </span>
          </span>
        )
      })}
    </span>
  )
}

export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-2 text-[15px] text-ink-soft">
      <svg viewBox="0 0 24 24" className="size-[17px] shrink-0" aria-hidden>
        <path
          fill="#2f4a2c"
          d="M12 1.5l2.4 1.8 3-.1.9 2.8 2.5 1.7-.9 2.9.9 2.9-2.5 1.7-.9 2.8-3-.1L12 22.5l-2.4-1.8-3 .1-.9-2.8-2.5-1.7.9-2.9-.9-2.9 2.5-1.7.9-2.8 3 .1z"
        />
        <path d="M8 12.3l2.7 2.7L16.2 9.5" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Verified Purchase
    </span>
  )
}
