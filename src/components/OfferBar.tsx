import { BadgePercent, PartyPopper, Truck, type LucideIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { FREE_SHIPPING, SPEND_OFFER, spendDiscount } from '../config'
import { confetti, haptic } from '../lib/fx'
import { formatPrice } from '../lib/format'

interface Milestone {
  at: number
  Icon: LucideIcon
  label: string
}

/**
 * Spend-more bar (Settings → Rfaheya Store → Free shipping & offers): free shipping at
 * the first amount, a discount plus free shipping at the second. `amount` is the
 * merchandise after the bundle discount, before coupons and the offer itself.
 */
export function OfferBar({ amount, className = '' }: { amount: number; className?: string }) {
  const milestones: Milestone[] = []
  if (FREE_SHIPPING.enabled && FREE_SHIPPING.min > 0 && (!SPEND_OFFER.enabled || FREE_SHIPPING.min < SPEND_OFFER.min))
    milestones.push({ at: FREE_SHIPPING.min, Icon: Truck, label: 'Free shipping' })
  if (SPEND_OFFER.enabled && SPEND_OFFER.min > 0) milestones.push({ at: SPEND_OFFER.min, Icon: BadgePercent, label: `${SPEND_OFFER.percent}% off + free shipping` })

  const reached = milestones.filter((m) => amount >= m.at).length
  // A little celebration when the cart crosses a milestone (not on first sight).
  const seen = useRef<number | null>(null)
  const mounted = useRef(0)
  useEffect(() => {
    mounted.current = performance.now()
  }, [])
  useEffect(() => {
    // Only for the shopper's own cart changes, not the cart arriving after a page load.
    if (seen.current !== null && reached > seen.current && performance.now() - mounted.current > 1500 && navigator.userActivation?.hasBeenActive !== false) {
      confetti(reached === milestones.length ? 80 : 40)
      haptic([10, 40, 14])
    }
    seen.current = reached
  }, [reached, milestones.length])

  if (!milestones.length) return null
  const max = milestones[milestones.length - 1].at
  const progress = Math.min(100, (Math.max(0, amount) / max) * 100)
  const next = milestones[reached]
  const offer = SPEND_OFFER.enabled && amount >= SPEND_OFFER.min
  const savings = spendDiscount(amount)

  return (
    <div className={`rf-offer flow-root ${className}`}>
      <p key={reached} className="rf-offer-msg flex items-start gap-2 text-[12.5px] leading-snug text-ink-soft">
        {offer ? (
          <PartyPopper className="mt-px size-4 shrink-0 text-olive" strokeWidth={1.6} />
        ) : (
          <Truck className="mt-px size-4 shrink-0 text-olive" strokeWidth={1.5} />
        )}
        <span>
          {offer ? (
            <>
              You’ve unlocked <strong className="font-semibold text-ink">{SPEND_OFFER.percent}% off + free shipping</strong>
              {savings > 0 && <> — you save {formatPrice(savings)}</>}.
            </>
          ) : next ? (
            <>
              {reached > 0 && <strong className="font-semibold text-ink">Free shipping unlocked! </strong>}
              Add <strong className="font-semibold text-ink">{formatPrice(next.at - Math.max(0, amount))}</strong> more for{' '}
              <strong className="font-semibold text-ink">{next.Icon === Truck ? 'free shipping' : `${SPEND_OFFER.percent}% off + free shipping`}</strong>
              {next.Icon === Truck && ' in Cairo & Alexandria'}.
            </>
          ) : (
            <>
              You’ve unlocked <strong className="font-semibold text-ink">free shipping</strong> in Cairo &amp; Alexandria.
            </>
          )}
        </span>
      </p>

      <div className="relative mt-3 mr-3.5 mb-11 ml-1">
        <div className="h-[6px] overflow-hidden rounded-full bg-line">
          <div className="rf-offer-fill h-full rounded-full" style={{ width: `${progress}%` }} />
        </div>
        {milestones.map((m, i) => {
          const done = amount >= m.at
          const left = (m.at / max) * 100
          const last = i === milestones.length - 1
          return (
            <div key={m.at}>
              <span
                className={`rf-offer-dot absolute top-1/2 grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full transition-colors duration-500 ${done ? 'rf-offer-done bg-olive text-on-accent' : 'bg-chip text-muted'}`}
                style={{ left: `${left}%` }}
              >
                <m.Icon className="size-3.5" strokeWidth={1.8} />
              </span>
              {/* The last label is right-aligned under its dot so it never runs past the bar. */}
              <span
                className={`absolute top-[20px] text-[10.5px] leading-tight font-medium whitespace-nowrap ${done ? 'text-ink' : 'text-muted'} ${last ? '-right-3.5 text-right' : '-translate-x-1/2 text-center'}`}
                style={last ? undefined : { left: `${left}%` }}
              >
                {formatPrice(m.at)}
                <span className="block font-normal text-muted">{m.label}</span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
