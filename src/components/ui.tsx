import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'

export function Button({
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'primary' | 'ghost' | 'danger'; size?: 'sm' | 'md' }) {
  const v = {
    default: 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-800',
    primary: 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm',
    ghost: 'hover:bg-slate-100 text-slate-700',
    danger: 'bg-white border border-red-200 text-red-600 hover:bg-red-50',
  }[variant]
  const s = size === 'sm' ? 'h-8 px-2.5 text-sm' : 'h-10 px-4'
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition disabled:opacity-40 disabled:pointer-events-none ${v} ${s} ${className}`}
    />
  )
}

export function IconButton({
  title,
  active,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { title: string; active?: boolean }) {
  return (
    <button
      {...props}
      title={title}
      aria-label={title}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition disabled:opacity-30 ${
        active ? 'bg-brand-100 text-brand-700' : 'text-slate-700 hover:bg-slate-100'
      } ${className}`}
    />
  )
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-500">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-amber-600">{hint}</span>}
    </label>
  )
}

export const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100'

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  format?: (v: number) => string
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-semibold text-slate-500">
        <span>{label}</span>
        <span className="tabular-nums" dir="ltr">
          {format ? format(value) : Math.round(value * 100) / 100}
        </span>
      </div>
      <input
        type="range"
        className="w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}

const SWATCHES = ['#000000', '#ffffff', '#111827', '#6b7280', '#ef4444', '#f97316', '#f59e0b', '#eab308', '#22c55e', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#7c3aed', '#d946ef', '#ec4899']

export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const hex = toHex(value)
  return (
    <div>
      <span className="mb-1 block text-xs font-semibold text-slate-500">{label}</span>
      <div className="flex flex-wrap items-center gap-1.5">
        <label className="relative h-8 w-8 cursor-pointer overflow-hidden rounded-lg border border-slate-300" style={{ background: value }}>
          <input type="color" className="absolute inset-0 opacity-0" value={hex} onChange={(e) => onChange(e.target.value)} />
        </label>
        {SWATCHES.map((c) => (
          <button
            key={c}
            title={c}
            onClick={() => onChange(c)}
            className={`h-6 w-6 rounded-md border ${hex === c ? 'ring-2 ring-brand-500' : 'border-slate-200'}`}
            style={{ background: c }}
          />
        ))}
      </div>
    </div>
  )
}

export function toHex(c: string): string {
  if (!c || typeof c !== 'string') return '#000000'
  if (/^#[0-9a-f]{6}$/i.test(c)) return c.toLowerCase()
  if (/^#[0-9a-f]{3}$/i.test(c)) return '#' + [...c.slice(1)].map((x) => x + x).join('').toLowerCase()
  const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (m) return '#' + [m[1], m[2], m[3]].map((x) => Number(x).toString(16).padStart(2, '0')).join('')
  return '#000000'
}

export function Dropdown({ button, children }: { button: (open: () => void) => ReactNode; children: (close: () => void) => ReactNode }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])
  return (
    <div className="relative" ref={ref}>
      {button(() => setOpen((v) => !v))}
      {open && (
        <div className="absolute end-0 top-full z-50 mt-2 min-w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  )
}

export function MenuItem({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-start text-sm hover:bg-slate-100">
      {children}
    </button>
  )
}

export function Spinner({ className = '' }: { className?: string }) {
  return <span className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} />
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onMouseDown={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
        <h3 className="mb-4 text-lg font-bold">{title}</h3>
        {children}
      </div>
    </div>
  )
}

export function Overlay({ text }: { text: string }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/70 backdrop-blur-sm">
      <div className="flex items-center gap-3 rounded-xl bg-white px-5 py-4 font-semibold shadow-xl">
        <Spinner className="text-brand-600" /> {text}
      </div>
    </div>
  )
}
