import { useLayoutEffect, useRef, useState } from 'react'

/** Where the checked option is; `glide` is false for the first placement (no animation then). */
type Box = { x: number; y: number; w: number; h: number; glide: boolean }

/**
 * A highlight that glides to the checked option of a radio group (sizes etc.).
 * Put `ref` on the group (position: relative) and render <SlidingPill box=… /> inside it;
 * the options sit above it (relative z-[1]) with a transparent background when checked.
 */
export function useSlidingPill<T extends HTMLElement>(active: unknown) {
  const ref = useRef<T>(null)
  const [box, setBox] = useState<Box | null>(null)
  useLayoutEffect(() => {
    const group = ref.current
    if (!group) return
    const measure = () => {
      const on = group.querySelector<HTMLElement>('[aria-checked="true"]')
      setBox((prev) => (on ? { x: on.offsetLeft, y: on.offsetTop, w: on.offsetWidth, h: on.offsetHeight, glide: prev !== null } : null))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(group)
    return () => observer.disconnect()
  }, [active])
  return [ref, box] as const
}

export function SlidingPill({ box, className = 'rounded-full bg-olive' }: { box: Box | null; className?: string }) {
  if (!box) return null
  const animate = box.glide
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute top-0 left-0 ${animate ? 'transition-[transform,width,height] duration-500 ease-[cubic-bezier(0.34,1.36,0.64,1)] motion-reduce:transition-none' : ''} ${className}`}
      style={{ width: box.w, height: box.h, transform: `translate(${box.x}px, ${box.y}px)` }}
    />
  )
}
