import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'

interface Props<T> {
  items: T[]
  getKey: (item: T) => string | number
  renderItem: (item: T) => ReactNode
  label: string
  /** Cards visible for a given viewport width; fractional values leave a "peek" of the next card. */
  perViewFor?: (width: number) => number
  /** Vertical centre of the arrows, given the rendered card width. Defaults to the middle. */
  arrowTop?: number | string | ((itemWidth: number) => number | string)
  gap?: number
  itemLabel?: string
}

/** Product cards: 4 / 3 / 2 / 1 per view. */
export function productsPerView(width: number) {
  if (width >= 1180) return 4
  if (width >= 860) return 3
  if (width >= 560) return 2.3
  return 1.55
}

/**
 * Native scrolling carousel (scroll-snap): small, and no React render per
 * pointer move. Arrows and dots scroll to a card; styles in index.css
 * (.rf-carousel…).
 */
export function Carousel<T>({
  items,
  getKey,
  renderItem,
  label,
  perViewFor = productsPerView,
  arrowTop = (w) => w / 2 - 21,
  gap: GAP = 18,
  itemLabel = 'product',
}: Props<T>) {
  const viewport = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [index, setIndex] = useState(0)
  const n = items.length

  useLayoutEffect(() => {
    const el = viewport.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Back to the start when the item set changes (e.g. switching tabs).
  useEffect(() => {
    setIndex(0)
    viewport.current?.scrollTo({ left: 0, behavior: 'instant' })
  }, [items])

  const perView = perViewFor(width)
  const itemWidth = width ? (width - GAP * (Math.ceil(perView) - 1)) / perView : 280
  const step = itemWidth + GAP
  const top = typeof arrowTop === 'function' ? arrowTop(itemWidth) : arrowTop

  const go = (i: number) => {
    viewport.current?.scrollTo({
      left: Math.max(0, Math.min(n - 1, i)) * step,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    })
  }

  return (
    <div className="rf-carousel" role="region" aria-roledescription="carousel" aria-label={label}>
      {n > perView && (
        <>
          <button type="button" className="rf-carousel-arrow rf-carousel-prev" style={{ top }} aria-label={`Previous ${itemLabel}s`} onClick={() => go(index <= 0 ? n - 1 : index - 1)}>
            <ArrowLeft className="size-5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            className="rf-carousel-arrow rf-carousel-next"
            style={{ top }}
            aria-label={`Next ${itemLabel}s`}
            onClick={() => {
              const el = viewport.current
              go(el && el.scrollLeft >= el.scrollWidth - el.clientWidth - 2 ? 0 : index + 1)
            }}
          >
            <ArrowRight className="size-5" strokeWidth={1.5} />
          </button>
        </>
      )}
      <div
        ref={viewport}
        className="rf-carousel-viewport no-scrollbar"
        onScroll={() => {
          const el = viewport.current
          if (el) setIndex(Math.round(el.scrollLeft / step))
        }}
      >
        <ul className="rf-carousel-track" style={{ gap: GAP }}>
          {items.map((item) => (
            <li key={getKey(item)} className="rf-carousel-item" style={{ width: itemWidth }}>
              {renderItem(item)}
            </li>
          ))}
        </ul>
      </div>
      {n > perView && (
        <div className="rf-carousel-dots">
          {items.map((item, i) => (
            <button
              key={getKey(item)}
              type="button"
              aria-label={`Go to ${itemLabel} ${i + 1} of ${n}`}
              aria-current={i === index}
              className={i === index ? 'is-active' : undefined}
              onClick={() => go(i)}
            >
              <span />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
