import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * A section below the first screen (home sections, the footer): built only when the visitor scrolls near it
 * (900 px ahead, so it is ready before it shows), so starting the page stays quick.
 * Until then it keeps its approximate height, so the page doesn't jump.
 */
export function Deferred({ height, children, anchor }: { height: number; children: ReactNode; anchor?: string }) {
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
    // `anchor`: the id a link (#reviews) jumps to before the section is built; the section has it after.
    <div ref={ref} id={show ? undefined : anchor} className="rf-cv" style={{ containIntrinsicSize: `auto ${height}px`, minHeight: show ? undefined : height, scrollMarginTop: 96 }}>
      {show ? <Suspense fallback={<div style={{ height }} />}>{children}</Suspense> : null}
    </div>
  )
}

/**
 * One item of a long grid (e.g. a product card further down the shop): an empty box of
 * about its size until it comes near the screen, then the item itself.
 */
export function LazyItem({ children, placeholder }: { children: ReactNode; placeholder: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || show) return
    if (!('IntersectionObserver' in window)) return setShow(true)
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && setShow(true), { rootMargin: '600px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [show])
  return show ? <>{children}</> : <div ref={ref} aria-hidden className={placeholder} />
}

/** True once the page has finished loading (plus a moment), for things not needed at the start. */
export function useAfterLoad(delay = 200) {
  const [done, setDone] = useState(false)
  useEffect(() => {
    let t = 0
    const go = () => {
      t = window.setTimeout(() => setDone(true), delay)
    }
    if (document.readyState === 'complete') go()
    else window.addEventListener('load', go, { once: true })
    return () => {
      window.removeEventListener('load', go)
      window.clearTimeout(t)
    }
  }, [delay])
  return done
}
