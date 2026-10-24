import { useEffect, useRef } from 'react'

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Fine golden dust drifting upwards, like scent in the air. A light canvas that
 * starts after the page has loaded, runs only while on screen, and is skipped for
 * reduced motion.
 */
export function GoldenDust({ density = 1, className = '' }: { density?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas || reduced()) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(1.5, window.devicePixelRatio || 1)
    let w = 0
    let h = 0
    let frame = 0
    let visible = false
    let started = false

    // One soft glowing dot, drawn once and reused.
    const sprite = document.createElement('canvas')
    sprite.width = sprite.height = 32
    const s = sprite.getContext('2d')!
    const g = s.createRadialGradient(16, 16, 0, 16, 16, 16)
    g.addColorStop(0, 'rgba(255, 244, 214, 1)')
    g.addColorStop(0.35, 'rgba(232, 200, 140, 0.55)')
    g.addColorStop(1, 'rgba(201, 164, 102, 0)')
    s.fillStyle = g
    s.fillRect(0, 0, 32, 32)

    type Dot = { x: number; y: number; r: number; vy: number; sway: number; phase: number; tw: number }
    let dots: Dot[] = []
    const spawn = (anywhere: boolean): Dot => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 10,
      r: 2 + Math.random() * 5,
      vy: 0.08 + Math.random() * 0.28,
      sway: 0.2 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      tw: 0.004 + Math.random() * 0.012,
    })
    const resize = () => {
      const box = canvas.getBoundingClientRect()
      w = box.width
      h = box.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.round(Math.min(70, (w * h) / 16000) * density)
      dots = Array.from({ length: count }, () => spawn(true))
    }
    const tick = () => {
      ctx.clearRect(0, 0, w, h)
      for (const d of dots) {
        d.phase += d.tw
        d.y -= d.vy
        d.x += Math.sin(d.phase) * d.sway * 0.3
        if (d.y < -12) Object.assign(d, spawn(false))
        ctx.globalAlpha = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(d.phase * 2))
        ctx.drawImage(sprite, d.x - d.r, d.y - d.r, d.r * 2, d.r * 2)
      }
      frame = requestAnimationFrame(tick)
    }
    const run = () => {
      cancelAnimationFrame(frame)
      if (visible && started && document.visibilityState === 'visible') frame = requestAnimationFrame(tick)
    }
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      run()
    })
    io.observe(canvas)
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    document.addEventListener('visibilitychange', run)
    // After the first paint: never competes with the page loading.
    const start = window.setTimeout(() => {
      started = true
      resize()
      canvas.style.opacity = '1'
      run()
    }, 1200)
    return () => {
      window.clearTimeout(start)
      cancelAnimationFrame(frame)
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', run)
    }
  }, [density])
  return <canvas ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 size-full opacity-0 transition-opacity duration-[2000ms] ${className}`} />
}

/** Soft gold and cream light slowly breathing behind a section (put inside an `isolate` parent). */
export function Aura({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`rf-aura pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}>
      <span className="rf-aura-blob rf-aura-a" />
      <span className="rf-aura-blob rf-aura-b" />
      <span className="rf-aura-blob rf-aura-c" />
    </div>
  )
}
