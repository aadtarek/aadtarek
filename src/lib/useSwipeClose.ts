import { useEffect, useRef, useState } from 'react'

/**
 * Lets a phone user close a sheet with a finger: drag a bottom sheet down
 * (or a left-hand menu to the left) and let go past a third of the way, or
 * with a quick flick. Shorter drags spring back. Inner lists that are
 * scrolled keep scrolling; the drag only starts from their top.
 *
 * `own`: the panel has its own leaving animation (the cart) — it then runs
 * from where the finger let go instead of sliding out here first.
 */
export function useSwipeClose<T extends HTMLElement>(onClose: () => void, { direction = 'down', own = false }: { direction?: 'down' | 'left'; own?: boolean } = {}) {
  const [el, ref] = useState<T | null>(null)
  const close = useRef(onClose)
  useEffect(() => {
    close.current = onClose
  })

  useEffect(() => {
    if (!el) return
    const down = direction === 'down'
    let start: { x: number; y: number; t: number } | null = null
    let dragging = false
    let offset = 0

    const scrolledInside = (target: EventTarget | null) => {
      for (let n = target as HTMLElement | null; n && n !== el.parentElement; n = n.parentElement) {
        if (down ? n.scrollTop > 0 : n.scrollLeft > 0) return true
      }
      return false
    }
    const move = (px: number) => {
      el.style.transform = down ? `translateY(${px}px)` : `translateX(${-px}px)`
    }

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1 || !matchMedia('(max-width: 639px)').matches) return
      if (scrolledInside(e.target)) return
      const t = e.touches[0]
      start = { x: t.clientX, y: t.clientY, t: performance.now() }
      dragging = false
      offset = 0
    }
    const onMove = (e: TouchEvent) => {
      if (!start) return
      const t = e.touches[0]
      const dx = t.clientX - start.x
      const dy = t.clientY - start.y
      const along = down ? dy : -dx
      const across = down ? dx : dy
      if (!dragging) {
        if (Math.abs(along) < 8 && Math.abs(across) < 8) return
        // Only a drag in the closing direction (and mostly along it) moves the sheet.
        if (along <= 0 || Math.abs(across) > Math.abs(along)) {
          start = null
          return
        }
        dragging = true
        el.style.animation = 'none'
        el.style.transition = 'none'
        el.style.willChange = 'transform'
      }
      e.preventDefault()
      offset = Math.max(0, along)
      move(offset)
    }
    const onEnd = () => {
      if (!start || !dragging) {
        start = null
        return
      }
      const size = down ? el.offsetHeight : el.offsetWidth
      const speed = offset / Math.max(1, performance.now() - start.t)
      start = null
      dragging = false
      el.style.willChange = ''
      if (offset > size / 3 || (speed > 0.5 && offset > 40)) {
        if (own) {
          // Hand over to the panel's leaving animation, which starts from here.
          el.style.animation = ''
          close.current()
          return
        }
        el.style.transition = 'transform .24s cubic-bezier(.4,0,1,1)'
        el.style.transform = down ? 'translateY(100%)' : 'translateX(-100%)'
        window.setTimeout(() => close.current(), 220)
      } else {
        el.style.transition = 'transform .45s cubic-bezier(.2,1.25,.3,1)'
        move(0)
        window.setTimeout(() => {
          el.style.transition = ''
          el.style.transform = ''
        }, 460)
      }
    }

    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: false })
    el.addEventListener('touchend', onEnd)
    el.addEventListener('touchcancel', onEnd)
    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onEnd)
      el.removeEventListener('touchcancel', onEnd)
    }
  }, [el, direction, own])

  // A callback ref: put it on the sheet (re-attaches when the sheet remounts).
  return ref
}
