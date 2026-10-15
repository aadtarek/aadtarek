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
  /** 'auto': small on phones, regular from the sm breakpoint */
  size?: 'sm' | 'md' | 'auto'
}) {
  const h = size === 'sm' ? 'h-8' : size === 'auto' ? 'h-10 sm:h-12' : 'h-12'
  const btn = `grid ${size === 'sm' ? 'w-8' : size === 'auto' ? 'w-9 sm:w-11' : 'w-11'} place-items-center text-ink transition hover:bg-chip disabled:opacity-30`
  return (
    <div className={`inline-flex ${h} items-stretch rounded-full border border-line-strong`}>
      <button type="button" aria-label="Decrease quantity" className={btn} disabled={value <= min} onClick={() => onChange(value - 1)}>
        <Minus className="size-3.5" />
      </button>
      <span className={`grid ${size === 'sm' ? 'w-8 text-[13px]' : size === 'auto' ? 'w-8 text-[13px] sm:w-10 sm:text-sm' : 'w-10 text-sm'} place-items-center font-medium tabular-nums`} aria-live="polite">
        {value}
      </span>
      <button type="button" aria-label="Increase quantity" className={btn} disabled={value >= max} onClick={() => onChange(value + 1)}>
        <Plus className="size-3.5" />
      </button>
    </div>
  )
}
