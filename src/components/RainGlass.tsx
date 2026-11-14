import { useEffect, useRef } from 'react'

/**
 * Water on the glass in front of The Vitrine: beads that sit on the pane, and now and then a
 * drop that runs down it, gathering the beads in its way and leaving a faint wet trail.
 * Drawn on one canvas; it pauses when the page is hidden or the glass is off screen, and stays
 * still for visitors who ask for less motion.
 */
export function RainGlass({ density = 1, className = '' }: { density?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    let w = 0
    let h = 0

    // One bead drawn once, then stamped at every size: a lens that is bright at the top-left,
    // dark under its lower edge and catches a small glint.
    const sprite = document.createElement('canvas')
    const S = 64
    sprite.width = S
    sprite.height = S
    const s = sprite.getContext('2d')!
    const c = S / 2
    const shade = s.createRadialGradient(c + 4, c + 7, 6, c + 4, c + 7, c - 4)
    shade.addColorStop(0, 'rgba(0,0,0,0)')
    shade.addColorStop(0.8, 'rgba(0,0,0,0.28)')
    shade.addColorStop(1, 'rgba(0,0,0,0)')
    s.fillStyle = shade
    s.beginPath()
    s.arc(c + 3, c + 5, c - 4, 0, Math.PI * 2)
    s.fill()
    const body = s.createRadialGradient(c - 7, c - 9, 2, c, c, c - 6)
    body.addColorStop(0, 'rgba(255,246,240,0.55)')
    body.addColorStop(0.45, 'rgba(255,232,222,0.14)')
    body.addColorStop(0.85, 'rgba(255,255,255,0.05)')
    body.addColorStop(1, 'rgba(255,255,255,0.32)')
    s.fillStyle = body
    s.beginPath()
    s.arc(c, c, c - 6, 0, Math.PI * 2)
    s.fill()
    s.fillStyle = 'rgba(255,255,255,0.85)'
    s.beginPath()
    s.ellipse(c - 8, c - 10, 4.5, 3, -0.6, 0, Math.PI * 2)
    s.fill()
    s.strokeStyle = 'rgba(255,255,255,0.22)'
    s.lineWidth = 2
    s.beginPath()
    s.arc(c, c, c - 9, 0.25 * Math.PI, 0.85 * Math.PI)
    s.stroke()

    type Bead = { x: number; y: number; r: number; a: number }
    type Runner = { x: number; y: number; r: number; v: number; sway: number; trail: { x: number; y: number }[] }
    let beads: Bead[] = []
    let runners: Runner[] = []
    let streaks: { x: number; pts: number[] }[] = []

    const bead = (): Bead => {
      const big = Math.random() < 0.12
      return { x: Math.random() * w, y: Math.random() * h, r: big ? 3.5 + Math.random() * 4 : 0.8 + Math.random() * 2.4, a: still ? 1 : 0 }
    }
    const resize = () => {
      const box = canvas.getBoundingClientRect()
      w = Math.max(1, box.width)
      h = Math.max(1, box.height)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.round(((w * h) / 4200) * density)
      beads = Array.from({ length: count }, () => ({ ...bead(), a: 1 }))
      // A few long wet streaks from drops that already ran (they wander a little).
      streaks = Array.from({ length: Math.max(2, Math.round((w / 260) * density)) }, () => {
        const x = Math.random() * w
        const pts: number[] = []
        let dx = 0
        for (let y = 0; y <= h; y += 12) {
          dx += (Math.random() - 0.5) * 2.2
          pts.push(x + dx)
        }
        return { x, pts }
      })
    }

    const spawn = () => {
      const r = 3 + Math.random() * 3.5
      runners.push({ x: Math.random() * w, y: -10 + Math.random() * h * 0.35, r, v: 0.3, sway: (Math.random() - 0.5) * 0.6, trail: [] })
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      // Old streaks: a faint lighter line with a darker edge, like water that dried unevenly.
      ctx.lineCap = 'round'
      for (const st of streaks) {
        ctx.beginPath()
        st.pts.forEach((x, i) => (i ? ctx.lineTo(x, i * 12) : ctx.moveTo(x, 0)))
        ctx.strokeStyle = 'rgba(255,236,226,0.07)'
        ctx.lineWidth = 2.4
        ctx.stroke()
        ctx.strokeStyle = 'rgba(255,255,255,0.09)'
        ctx.lineWidth = 0.8
        ctx.stroke()
      }
      for (const b of beads) {
        ctx.globalAlpha = b.a
        const d = b.r * 2.6
        ctx.drawImage(sprite, b.x - d / 2, b.y - d / 2, d, d)
      }
      ctx.globalAlpha = 1
      for (const r of runners) {
        if (r.trail.length > 1) {
          ctx.beginPath()
          r.trail.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)))
          ctx.strokeStyle = 'rgba(255,238,228,0.13)'
          ctx.lineWidth = r.r * 0.9
          ctx.stroke()
        }
        const d = r.r * 2.9
        ctx.drawImage(sprite, r.x - d / 2, r.y - d / 2 - r.r * 0.4, d, d * 1.15)
      }
    }

    let last = 0
    let next = 600
    let raf = 0
    let running = false
    const step = (t: number) => {
      raf = requestAnimationFrame(step)
      const dt = Math.min(64, t - (last || t))
      if (dt < 30) return // about 30 frames a second is plenty for water
      last = t
      next -= dt
      if (next <= 0) {
        spawn()
        next = (1400 + Math.random() * 2600) / density
      }
      // New beads land; the oldest fade in rather than pop.
      if (beads.length < ((w * h) / 4200) * density && Math.random() < 0.5) beads.push(bead())
      for (const b of beads) if (b.a < 1) b.a = Math.min(1, b.a + 0.04)
      for (const r of runners) {
        r.v = Math.min(9, r.v + 0.05 + r.r * 0.006)
        r.y += r.v * (dt / 16)
        r.x += Math.sin(r.y / 38) * r.sway
        r.trail.push({ x: r.x, y: r.y })
        if (r.trail.length > 60) r.trail.shift()
        // Beads in its path join it (it grows a little).
        beads = beads.filter((b) => {
          if (Math.abs(b.x - r.x) < r.r + b.r && Math.abs(b.y - r.y) < r.r + b.r) {
            r.r = Math.min(8, r.r + b.r * 0.08)
            return false
          }
          return true
        })
        // Now and then it leaves a small bead behind.
        if (Math.random() < 0.05) beads.push({ x: r.x + (Math.random() - 0.5) * 3, y: r.y - r.r * 2, r: 0.8 + Math.random() * 1.4, a: 1 })
      }
      runners = runners.filter((r) => r.y < h + 40)
      draw()
    }

    const start = () => {
      if (running || still) return
      running = true
      last = 0
      raf = requestAnimationFrame(step)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    resize()
    draw()
    const ro = new ResizeObserver(() => {
      resize()
      draw()
    })
    ro.observe(canvas)
    let visible = true
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && !document.hidden) start()
      else stop()
    })
    io.observe(canvas)
    const onVis = () => (document.hidden || !visible ? stop() : start())
    document.addEventListener('visibilitychange', onVis)
    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [density])

  return <canvas ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 size-full ${className}`} />
}
