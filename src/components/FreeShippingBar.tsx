import { Truck } from 'lucide-react'
import { FREE_SHIPPING } from '../config'
import { formatPrice } from '../lib/format'

/** How far the order is from free shipping (Settings → Rfaheya Store → Free shipping). */
export function FreeShippingBar({ amount, className = '' }: { amount: number; className?: string }) {
  if (!FREE_SHIPPING.enabled) return null
  const remaining = Math.max(0, FREE_SHIPPING.min - amount)
  const progress = Math.min(100, (Math.max(0, amount) / FREE_SHIPPING.min) * 100)
  return (
    <div className={className}>
      <p className="flex items-center gap-2 text-[12.5px] text-ink-soft">
        <Truck className="size-4 shrink-0 text-olive" strokeWidth={1.5} />
        <span>
          {remaining > 0 ? (
            <>
              Add <strong className="font-semibold text-ink">{formatPrice(remaining)}</strong> more for free shipping in Cairo &amp; Alexandria.
            </>
          ) : (
            <>
              You’ve unlocked <strong className="font-semibold text-ink">free shipping</strong> in Cairo &amp; Alexandria.
            </>
          )}
        </span>
      </p>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-olive transition-[width] duration-700" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
