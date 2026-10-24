import { Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { wp } from '../api/wp'
import { LOYALTY, pointsFor } from '../config'
import { formatPrice } from '../lib/format'
import { useRewards } from '../store/rewards'

/** Checkout: points this order earns, and using the customer's points as a discount. */
export function PointsPanel({ total, className = '' }: { total: number; className?: string }) {
  const { me, busy, error, redeem, cancelRedeem } = useRewards()
  if (!LOYALTY.enabled) return null
  const earn = pointsFor(total)
  const points = me.points ?? 0
  const worth = Math.floor(points * LOYALTY.value)

  return (
    <div className={`rounded-xl bg-chip px-4 py-3.5 text-[13px] ${className}`}>
      <p className="flex items-center gap-2 font-semibold">
        <Sparkles className="size-4 text-olive" strokeWidth={1.5} />
        Rfaheya points
      </p>
      {!me.loggedIn ? (
        <p className="mt-1 text-ink-soft">
          {wp ? (
            <a href={wp.myAccountUrl} className="font-semibold text-ink underline underline-offset-2">
              Sign in
            </a>
          ) : (
            <Link to="/account" className="font-semibold text-ink underline underline-offset-2">
              Sign in
            </Link>
          )}{' '}
          to earn {earn.toLocaleString('en-US')} points on this order{LOYALTY.welcome ? ` and get ${LOYALTY.welcomePercent}% off your first order` : ''}.
        </p>
      ) : (
        <>
          <p className="mt-1 text-ink-soft">
            This order earns <strong className="text-ink">{earn.toLocaleString('en-US')} points</strong> once it’s delivered.
          </p>
          {me.redeem ? (
            <p className="mt-2 flex items-center justify-between gap-3">
              <span>
                {me.redeem.points.toLocaleString('en-US')} points used · −{formatPrice(me.redeem.amount)}
              </span>
              <button type="button" disabled={busy} onClick={cancelRedeem} className="shrink-0 font-semibold underline underline-offset-2 disabled:opacity-50">
                Keep my points
              </button>
            </p>
          ) : points >= LOYALTY.min && worth >= 1 ? (
            <div className="mt-2 flex items-center justify-between gap-3">
              <span>
                You have <strong>{points.toLocaleString('en-US')}</strong> points ({formatPrice(worth)})
              </span>
              <button
                type="button"
                disabled={busy || total < 1}
                onClick={redeem}
                className="shrink-0 rounded-full bg-olive px-4 py-1.5 text-[11.5px] font-medium tracking-[0.08em] text-on-accent uppercase transition hover:bg-olive-hover disabled:opacity-50"
              >
                {busy ? 'Applying…' : 'Use points'}
              </button>
            </div>
          ) : (
            <p className="mt-1 text-muted">
              You have {points.toLocaleString('en-US')} points — use them from {LOYALTY.min.toLocaleString('en-US')} points.
            </p>
          )}
          {error && <p className="mt-2 text-red-800">{error}</p>}
        </>
      )}
    </div>
  )
}
