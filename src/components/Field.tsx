import type { InputHTMLAttributes, ReactNode } from 'react'

export const inputClass =
  'h-[50px] w-full rounded-[16px] border-[1.5px] border-line bg-sand px-4 text-[15px] outline-none transition placeholder:text-muted focus:border-olive aria-invalid:border-red-700'

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
      <span className="mb-1.5 block text-[11.5px] font-semibold text-muted">{label}</span>
      {children}
      {error && <span className="mt-1 block text-[12px] text-red-700">{error}</span>}
    </label>
  )
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ''}`} />
}
