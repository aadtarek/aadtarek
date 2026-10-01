import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'

interface Props<T> {
  items: T[]
  getKey: (item: T) => string | number
  renderItem: (item: T) => ReactNode
  label: string
}

const GAP = 18

/** Cards visible per breakpoint; fractional values leave a "peek" of the next card. */
function perViewFor(width: number) {
  if (width >= 1180) return 4
  if (width >= 860) return 3
  if (width >= 560) return 2.15
  return 1.18
}

/**
 * Infinite, swipeable carousel. Items are rendered three times and the track
 * silently jumps back to the middle copy after each transition, so it loops
 * in both directions. Dots map 1:1 to items.
 */
export function ProductCarousel<T>({ items, getKey, renderItem, label }: Props<T>) {
  const viewport = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const n = items.length
  const [pos, setPos] = useState(n) // index into the tripled list; middle copy starts at n
  const [animate, setAnimate] = useState(true)
  const [drag, setDrag] = useState(0)
  const dragState = useRef<{ x: number; y: number; id: number; locked: boolean | null } | null>(null)
  const moved = useRef(false)

  useLayoutEffect(() => {
    const el = viewport.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Reset when the item set changes (e.g. switching tabs).
  useEffect(() => {
    setAnimate(false)
    setPos(n)
  }, [items, n])

  // Re-enable transitions on the frame after a silent jump.
  useEffect(() => {
    if (animate) return
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)))
    return () => cancelAnimationFrame(id)
  }, [animate])

  const perView = perViewFor(width)
  const loop = n > 1 && n >= Math.floor(perView)
  const gaps = Number.isInteger(perView) ? perView - 1 : Math.floor(perView)
  const itemWidth = width ? (width - GAP * gaps) / perView : 0
  const step = itemWidth + GAP
  const list = loop ? [...items, ...items, ...items] : items
  const offset = loop ? pos : 0
  const active = ((pos % n) + n) % n

  const go = useCallback((delta: number) => setPos((p) => p + delta), [])

  const onTransitionEnd = () => {
    if (pos < n || pos >= 2 * n) {
      setAnimate(false)
      setPos(n + (((pos % n) + n) % n))
    }
  }

  const goTo = (i: number) => {
    // pick the shortest direction around the loop
    let delta = i - active
    if (delta > n / 2) delta -= n
    if (delta < -n / 2) delta += n
    go(delta)
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (!loop || e.button !== 0) return
    dragState.current = { x: e.clientX, y: e.clientY, id: e.pointerId, locked: null }
    moved.current = false
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const s = dragState.current
    if (!s || s.id !== e.pointerId) return
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    if (s.locked === null && Math.hypot(dx, dy) > 6) {
      s.locked = Math.abs(dx) > Math.abs(dy)
      if (s.locked) (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    }
    if (s.locked) {
      moved.current = true
      setAnimate(false)
      setDrag(dx)
    }
  }
  const onPointerUp = () => {
    const s = dragState.current
    dragState.current = null
    if (!s?.locked) return
    setAnimate(true)
    const steps = Math.round(-drag / step) || (Math.abs(drag) > 40 ? -Math.sign(drag) : 0)
    setDrag(0)
    if (steps) go(steps)
  }

  const arrow =
    'absolute z-10 hidden size-[46px] place-items-center rounded-full border border-line bg-card text-ink shadow-sm transition hover:bg-olive hover:text-cream sm:grid'

  return (
    <div className="relative" role="region" aria-roledescription="carousel" aria-label={label}>
      {loop && (
        <>
          <button
            type="button"
            aria-label="Previous products"
            onClick={() => go(-1)}
            className={`${arrow} -left-3 xl:-left-[63px]`}
            style={{ top: itemWidth / (348 / 229) - 23 }}
          >
            <ArrowLeft className="size-5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            aria-label="Next products"
            onClick={() => go(1)}
            className={`${arrow} -right-3 xl:-right-[55px]`}
            style={{ top: itemWidth / (348 / 229) - 23 }}
          >
            <ArrowRight className="size-5" strokeWidth={1.5} />
          </button>
        </>
      )}

      <div ref={viewport} className="-mx-4 -my-5 overflow-hidden px-4 py-5">
        <ul
          className="flex touch-pan-y select-none"
          style={{
            gap: GAP,
            transform: `translate3d(${-offset * step + drag}px,0,0)`,
            transition: animate ? 'transform 500ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
          }}
          onTransitionEnd={(e) => e.target === e.currentTarget && onTransitionEnd()}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onClickCapture={(e) => {
            if (moved.current) {
              e.preventDefault()
              e.stopPropagation()
              moved.current = false
            }
          }}
        >
          {list.map((item, i) => {
            const copy = loop ? Math.floor(i / n) : 1
            const visible = !loop || (i >= pos && i < pos + Math.ceil(perView))
            return (
              <li
                key={`${copy}-${getKey(item)}`}
                className="shrink-0"
                style={{ width: itemWidth || `calc((100% - ${GAP * 3}px) / 4)` }}
                aria-hidden={!visible || undefined}
                inert={!visible || undefined}
              >
                {renderItem(item)}
              </li>
            )
          })}
        </ul>
      </div>

      {loop && (
        <div className="mt-8 flex justify-center gap-2.5 lg:mt-[30px]">
          {items.map((item, i) => (
            <button
              key={getKey(item)}
              type="button"
              aria-label={`Go to product ${i + 1} of ${n}`}
              aria-current={i === active}
              onClick={() => goTo(i)}
              className="group py-2"
            >
              <span
                className={`block h-[3px] w-[30px] rounded-full transition-colors ${
                  i === active ? 'bg-olive' : 'bg-dot group-hover:bg-muted'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
