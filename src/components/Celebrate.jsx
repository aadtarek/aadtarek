import { useEffect, useRef } from 'react'

// Confetti cannons + gold fireworks + a shockwave. Fire with: window.dispatchEvent(new Event('celebrate'))
const CONFETTI = ['#c9a04a', '#e6c873', '#8f2a40', '#6e1529', '#e7a6b3', '#f2d3d6', '#b98d3e']
const FIRE = [['#b98d3e', '#dcb873', '#9c7424'], ['#8f2a40', '#c66b7e', '#e7a6b3'], ['#c9a04a', '#8f2a40', '#e6c873']]

export default function Celebrate() {
  const ref = useRef(null)
  useEffect(() => {
    const cv = ref.current
    const ctx = cv.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio, 2)
    let W = 0, H = 0
    const resize = () => {
      W = innerWidth
      H = innerHeight
      cv.width = W * dpr
      cv.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    let confetti = [], rockets = [], sparks = [], rings = [], raf = 0, running = false

    const cannon = (x, y, dir) => {
      const n = W < 600 ? 110 : 170
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + dir * (0.25 + Math.random() * 0.5)
        const v = 12 + Math.random() * 15
        confetti.push({
          x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
          w: 6 + Math.random() * 7, h: 9 + Math.random() * 9, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.35,
          flip: Math.random() * 6, vf: 0.1 + Math.random() * 0.2, color: CONFETTI[(Math.random() * CONFETTI.length) | 0],
          heart: Math.random() < 0.12, life: 1,
        })
      }
    }
    const rocket = (delay) => {
      setTimeout(() => {
        rockets.push({ x: W * (0.2 + Math.random() * 0.6), y: H + 10, vx: (Math.random() - 0.5) * 2, vy: -(H * 0.018 + 9 + Math.random() * 4), ty: H * (0.15 + Math.random() * 0.25), pal: FIRE[(Math.random() * FIRE.length) | 0] })
        start()
      }, delay)
    }
    const explode = (x, y, pal) => {
      const n = 90
      rings.push({ x, y, r: 4, life: 1, small: true })
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + Math.random() * 0.1
        const v = 2.5 + Math.random() * 5.5
        sparks.push({ x, y, px: x, py: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, decay: 0.008 + Math.random() * 0.012, color: pal[(Math.random() * pal.length) | 0] })
      }
    }
    const heart = (s) => {
      ctx.beginPath()
      ctx.moveTo(0, s * 0.35)
      ctx.bezierCurveTo(-s, -s * 0.3, -s * 0.45, -s, 0, -s * 0.45)
      ctx.bezierCurveTo(s * 0.45, -s, s, -s * 0.3, 0, s * 0.35)
      ctx.fill()
    }

    const frame = () => {
      ctx.clearRect(0, 0, W, H)
      // shockwave rings
      ctx.globalCompositeOperation = 'source-over'
      rings = rings.filter((r) => (r.life -= r.small ? 0.04 : 0.018) > 0)
      rings.forEach((r) => {
        r.r += r.small ? 6 : 18
        ctx.strokeStyle = `rgba(185,141,62,${r.life * 0.8})`
        ctx.lineWidth = (r.small ? 2 : 6) * r.life
        ctx.beginPath()
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2)
        ctx.stroke()
      })
      // rockets
      rockets = rockets.filter((k) => {
        k.x += k.vx
        k.y += k.vy
        k.vy *= 0.985
        ctx.fillStyle = '#b98d3e'
        ctx.beginPath()
        ctx.arc(k.x, k.y, 2.5, 0, Math.PI * 2)
        ctx.fill()
        for (let i = 0; i < 2; i++) sparks.push({ x: k.x, y: k.y, px: k.x, py: k.y, vx: (Math.random() - 0.5) * 0.8, vy: Math.random() * 1.5, life: 0.6, decay: 0.03, color: '#dcb873' })
        if (k.y <= k.ty || k.vy > -2) { explode(k.x, k.y, k.pal); return false }
        return true
      })
      // sparks with trails
      sparks = sparks.filter((s) => (s.life -= s.decay) > 0)
      sparks.forEach((s) => {
        s.px = s.x
        s.py = s.y
        s.vx *= 0.975
        s.vy = s.vy * 0.975 + 0.05
        s.x += s.vx
        s.y += s.vy
        ctx.strokeStyle = s.color
        ctx.globalAlpha = Math.min(1, s.life * 1.4)
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(s.px - s.vx * 2, s.py - s.vy * 2)
        ctx.lineTo(s.x, s.y)
        ctx.stroke()
      })
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
      // confetti (3D flutter)
      confetti = confetti.filter((c) => c.y < H + 40 && c.life > 0)
      confetti.forEach((c) => {
        c.vx *= 0.985
        c.vy = c.vy * 0.985 + 0.32
        c.x += c.vx + Math.sin(c.flip) * 0.6
        c.y += c.vy
        c.rot += c.vr
        c.flip += c.vf
        if (c.vy > 0) c.life -= 0.003
        ctx.save()
        ctx.translate(c.x, c.y)
        ctx.rotate(c.rot)
        ctx.scale(1, Math.cos(c.flip))
        ctx.fillStyle = c.color
        if (c.heart) heart(c.w)
        else ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h)
        ctx.restore()
      })
      if (confetti.length || rockets.length || sparks.length || rings.length) raf = requestAnimationFrame(frame)
      else running = false
    }
    const start = () => {
      if (!running) {
        running = true
        raf = requestAnimationFrame(frame)
      }
    }
    const fire = () => {
      rings.push({ x: W / 2, y: H / 2, r: 10, life: 1 })
      explode(W / 2, H / 2, FIRE[0])
      cannon(0, H, 1)
      cannon(W, H, -1)
      ;[350, 700, 1050, 1500, 1900, 2400].forEach(rocket)
      setTimeout(() => { cannon(0, H * 0.7, 1); cannon(W, H * 0.7, -1) }, 1200)
      start()
    }
    addEventListener('celebrate', fire)
    addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('celebrate', fire)
      removeEventListener('resize', resize)
    }
  }, [])
  return <canvas ref={ref} className="celebrate" aria-hidden="true" />
}
