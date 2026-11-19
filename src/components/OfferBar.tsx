import { BadgePercent, PartyPopper, ShoppingBag, Truck, type LucideIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { FREE_SHIPPING, ORDER_MIN, SPEND_OFFER, spendDiscount } from '../config'
import { confetti, haptic } from '../lib/fx'
import { formatPrice } from '../lib/format'

interface Milestone {
  at: number
  Icon: LucideIcon
  label: string
  /** What this step is measured on (spend more save more counts before discounts) */
  have: number
}

/**
 * Spend-more bar (Settings → Rfaheya Store → Free shipping & offers): free shipping at
 * the first amount, a discount plus free shipping at the second. `amount` is the
 * merchandise after the order's discounts (what the minimum order and free shipping in
 * Cairo & Alexandria are measured on); `base` is what the spend-more offer is measured on
 * (before discounts). With WooCommerce both come from the server, so the bar and the
 * checkout always agree. `freeShipping`: a free-shipping offer already applies.
 */
export function OfferBar({
  amount,
  base = amount,
  freeShipping = false,
  freeLabel,
  className = '',
}: {
  amount: number
  base?: number
  freeShipping?: boolean
  freeLabel?: string
  className?: string
}) {
  const milestones: Milestone[] = []
  // The smallest order comes first on the bar.
  if (ORDER_MIN.min > 0) milestones.push({ at: ORDER_MIN.min, Icon: ShoppingBag, label: 'Minimum order', have: amount })
  if (FREE_SHIPPING.enabled && FREE_SHIPPING.min > 0 && (!SPEND_OFFER.enabled || FREE_SHIPPING.min < SPEND_OFFER.min))
    milestones.push({ at: FREE_SHIPPING.min, Icon: Truck, label: 'Free shipping', have: freeShipping ? Infinity : amount })
  if (SPEND_OFFER.enabled && SPEND_OFFER.min > 0) milestones.push({ at: SPEND_OFFER.min, Icon: BadgePercent, label: `${SPEND_OFFER.percent}% off + free shipping`, have: base })

  // Steps are reached in order (the minimum order first).
  let reached = 0
  while (reached < milestones.length && milestones[reached].have >= milestones[reached].at) reached++
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
  const next = milestones[reached]
  // The bar fills to the next step: reached steps are full, then the way to the next one.
  const progress = !next ? 100 : Math.min(100, (Math.max(reached ? milestones[reached - 1].at : 0, Math.min(next.have, next.at)) / max) * 100)
  const offer = SPEND_OFFER.enabled && base >= SPEND_OFFER.min
  const savings = spendDiscount(base)
  const freeAnywhere = freeShipping && !offer

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
          ) : next?.Icon === ShoppingBag ? (
            <>
              Add <strong className="font-semibold text-ink">{formatPrice(next.at - Math.max(0, next.have))}</strong> more to reach the{' '}
              <strong className="font-semibold text-ink">{formatPrice(next.at)} minimum order</strong>.
            </>
          ) : next ? (
            <>
              {(milestones[reached - 1]?.Icon === Truck || freeAnywhere) && <strong className="font-semibold text-ink">Free shipping unlocked! </strong>}
              Add <strong className="font-semibold text-ink">{formatPrice(next.at - Math.max(0, next.have))}</strong> more for{' '}
              <strong className="font-semibold text-ink">{next.Icon === Truck ? 'free shipping' : `${SPEND_OFFER.percent}% off + free shipping`}</strong>
              {next.Icon === Truck && ' in Cairo & Alexandria'}.
            </>
          ) : freeAnywhere ? (
            <>
              You’ve unlocked <strong className="font-semibold text-ink">{freeLabel || 'free shipping'}</strong>.
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
          const done = m.have >= m.at
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
