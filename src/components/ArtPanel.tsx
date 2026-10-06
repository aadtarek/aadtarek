import { ArrowRight } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'

/**
 * "Art panels": a section drawn at a design comp's size. The comp's
 * photography (with its text erased) is the background, and copy is laid
 * over it at the comp's pixel coordinates, sized in container units so the
 * whole panel scales exactly like the comp. Used by the About and Rfaheya
 * Standard pages.
 */

export const INK = '#120b06'
export const BROWN = '#86451e'
export const SOFT = '#3b2f26'


/** A section drawn at the comp's size; children use design pixels via px(). */
export function Panel({ image, w, h, children, label }: { image: string; w: number; h: number; children: ReactNode; label?: string }) {
  return (
    <div
      className="relative w-full overflow-hidden bg-cover bg-center"
      style={{ aspectRatio: `${w} / ${h}`, backgroundImage: `url(${image})`, containerType: 'inline-size' }}
      role={label ? 'img' : undefined}
      aria-label={label}
    >
      {children}
    </div>
  )
}

/** Converts comp pixels to container width units for a comp `base` px wide. */
export const unit = (base: number) => (n: number) => `${((n / base) * 100).toFixed(4)}cqw`

export type TextProps = {
  base: number
  x: number
  y: number
  size: number
  ls?: number
  font?: 'serif' | 'sans'
  weight?: number
  color?: string
  center?: boolean
  /** Anchor x at the line's right edge instead of its left */
  right?: boolean
  /** Smallest rendered size in CSS px, so fine print stays legible when the panel shrinks */
  minPx?: number
  style?: CSSProperties
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3'
  className?: string
  children: ReactNode
}

/** One line of text at a comp position (x = left edge, or centre with `center`). */
export function T({ base, x, y, size, ls = 0, font = 'serif', weight = 400, color = INK, center, right, minPx, style: extra, as: Tag = 'span', className = '', children }: TextProps) {
  const u = unit(base)
  const style: CSSProperties = {
    position: 'absolute',
    left: u(x),
    top: u(y),
    fontSize: minPx ? `max(${minPx}px, ${u(size)})` : u(size),
    letterSpacing: `${ls}em`,
    lineHeight: 1,
    fontWeight: weight,
    color,
    whiteSpace: 'nowrap',
    transform: center ? 'translateX(-50%)' : right ? 'translateX(-100%)' : undefined,
    ...extra,
  }
  return (
    <Tag className={`${font === 'serif' ? 'font-serif' : 'font-sans'} ${className}`} style={style}>
      {children}
    </Tag>
  )
}

/** A thin rule at comp coordinates. */
export function Rule({ base, x, y, w, h = 1, color = BROWN, opacity = 0.7 }: { base: number; x: number; y: number; w: number; h?: number; color?: string; opacity?: number }) {
  const u = unit(base)
  return <span aria-hidden className="absolute" style={{ left: u(x), top: u(y), width: u(w), height: `max(1px, ${u(h)})`, background: color, opacity }} />
}

export function VRule({ base, x, y0, y1, color = BROWN, opacity = 0.35 }: { base: number; x: number; y0: number; y1: number; color?: string; opacity?: number }) {
  const u = unit(base)
  return <span aria-hidden className="absolute w-px" style={{ left: u(x), top: u(y0), height: u(y1 - y0), background: color, opacity }} />
}

export function PanelButton({ base, x, y, w, h, to, size, ls, children }: { base: number; x: number; y: number; w: number; h: number; to: string; size: number; ls: number; children: ReactNode }) {
  const u = unit(base)
  return (
    <Link
      to={to}
      className="group absolute flex items-center justify-center rounded-full bg-[#1d130d] font-sans font-medium text-cream uppercase transition hover:bg-[#3a2618]"
      style={{ left: u(x), top: u(y), width: u(w), height: u(h), fontSize: u(size), letterSpacing: `${ls}em`, gap: u(size * 1.6) }}
    >
      {children}
      <ArrowRight className="transition group-hover:translate-x-1" style={{ width: u(size * 1.5), height: u(size * 1.5) }} strokeWidth={1.4} />
    </Link>
  )
}

