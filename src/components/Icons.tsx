import type { SVGProps } from 'react'

/** Small perfume bottle (the "Try 5 ML" buttons). */
export function BottleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M10 2.5h4v3h-4z" />
      <path d="M10.5 5.5v2.2c-2 .7-3.5 2.2-3.5 4.3v7.5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V12c0-2.1-1.5-3.6-3.5-4.3V5.5" />
    </svg>
  )
}
