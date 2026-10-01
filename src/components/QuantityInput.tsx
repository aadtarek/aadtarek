import { Minus, Plus } from 'lucide-react'

export function QuantityInput({
  value,
  onChange,
  min = 1,
  max = 20,
  size = 'md',
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  size?: 'sm' | 'md'
}) {
  const h = size === 'sm' ? 'h-8' : 'h-12'
  const btn = `grid ${size === 'sm' ? 'w-8' : 'w-11'} place-items-center text-ink transition hover:bg-chip disabled:opacity-30`
  return (
    <div className={`inline-flex ${h} items-stretch rounded-[3px] border border-line-strong`}>
      <button type="button" aria-label="Decrease quantity" className={btn} disabled={value <= min} onClick={() => onChange(value - 1)}>
        <Minus className="size-3.5" />
      </button>
      <span className={`grid ${size === 'sm' ? 'w-8 text-[13px]' : 'w-10 text-sm'} place-items-center font-medium tabular-nums`} aria-live="polite">
        {value}
      </span>
      <button type="button" aria-label="Increase quantity" className={btn} disabled={value >= max} onClick={() => onChange(value + 1)}>
        <Plus className="size-3.5" />
      </button>
    </div>
  )
}
