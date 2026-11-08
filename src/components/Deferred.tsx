import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * A home section below the first screen: built only when the visitor scrolls near it
 * (900 px ahead, so it is ready before it shows), so starting the page stays quick.
 * Until then it keeps its approximate height, so the page doesn't jump.
 */
export function Deferred({ height, children }: { height: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || show) return
    if (!('IntersectionObserver' in window)) return setShow(true)
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && setShow(true), { rootMargin: '900px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [show])
  return (
    <div ref={ref} className="rf-cv" style={{ containIntrinsicSize: `auto ${height}px`, minHeight: show ? undefined : height }}>
      {show ? children : null}
    </div>
  )
}
