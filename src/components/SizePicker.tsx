import { formatPrice } from '../lib/format'
import type { ProductVariation } from '../types'

export function SizePicker({
  variations,
  value,
  onChange,
}: {
  variations: ProductVariation[]
  value: number
  onChange: (id: number) => void
}) {
  return (
    <div role="radiogroup" aria-label="Size" className="grid grid-cols-3 gap-1.5">
      {variations.map((v) => {
        const selected = v.id === value
        return (
          <button
            key={v.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={!v.inStock}
            onClick={() => onChange(v.id)}
            className={`flex flex-col items-center justify-center rounded-xl border px-2 py-2 transition sm:py-2.5 disabled:cursor-not-allowed disabled:opacity-40 ${
              selected ? 'border-olive bg-olive text-cream' : 'border-line-strong hover:border-ink'
            }`}
          >
            <span className="text-[12px] font-semibold tracking-[0.06em] uppercase">{v.size}</span>
            <span className={`mt-0.5 text-[11px] ${selected ? 'text-cream/80' : 'text-muted'}`}>
              {v.isSample ? 'Sample · ' : ''}
              {formatPrice(v.price)}
            </span>
          </button>
        )
      })}
    </div>
  )
}
