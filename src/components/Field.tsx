import type { InputHTMLAttributes, ReactNode } from 'react'

export const inputClass =
  'h-12 w-full rounded-[3px] border border-line-strong bg-cream px-3.5 text-[14px] outline-none transition placeholder:text-muted focus:border-olive aria-invalid:border-red-700'

export function Field({
  label,
  error,
  children,
  className = '',
}: {
  label: string
  error?: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[12px] font-medium tracking-[0.06em] uppercase">{label}</span>
      {children}
      {error && <span className="mt-1 block text-[12px] text-red-700">{error}</span>}
    </label>
  )
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ''}`} />
}
