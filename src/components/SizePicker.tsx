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
    <div role="radiogroup" aria-label="Size" className="grid grid-cols-3 gap-2">
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
            className={`flex flex-col items-center justify-center rounded-[3px] border px-2 py-3 transition disabled:cursor-not-allowed disabled:opacity-40 ${
              selected ? 'border-olive bg-olive text-cream' : 'border-line-strong hover:border-ink'
            }`}
          >
            <span className="text-[13px] font-semibold tracking-[0.06em] uppercase">{v.size}</span>
            <span className={`mt-0.5 text-[12px] ${selected ? 'text-cream/80' : 'text-muted'}`}>
              {v.isSample ? 'Sample · ' : ''}
              {formatPrice(v.price)}
            </span>
          </button>
        )
      })}
    </div>
  )
}
