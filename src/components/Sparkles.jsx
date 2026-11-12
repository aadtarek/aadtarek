import { useEffect, useRef } from 'react'

// Canvas overlay: a gold-dust trail follows the finger, and taps burst into stars & hearts.
export default function Sparkles() {
  const ref = useRef(null)
  useEffect(() => {
    const cv = ref.current
    const ctx = cv.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio, 2)
    const parts = []
    let last = { x: -99, y: -99 }
    const resize = () => {
      cv.width = innerWidth * dpr
      cv.height = innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const golds = ['#c99a3b', '#e9c46a', '#f6dc95', '#b8862d', '#fff3cf']
    const add = (x, y, n, speed, kind) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2
        const v = speed * (0.4 + Math.random() * 0.8)
        parts.push({
          x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - speed * 0.3, life: 1,
          decay: 0.012 + Math.random() * 0.02, size: kind === 'dust' ? 1 + Math.random() * 2 : 4 + Math.random() * 6,
          kind: kind === 'dust' ? 'dust' : Math.random() < 0.35 ? 'heart' : 'star',
          color: golds[(Math.random() * golds.length) | 0], rot: Math.random() * 6,
        })
      }
    }
    const onMove = (e) => {
      const dx = e.clientX - last.x
      const dy = e.clientY - last.y
      if (dx * dx + dy * dy > 120) {
        add(e.clientX, e.clientY, 2, 0.8, 'dust')
        last = { x: e.clientX, y: e.clientY }
      }
    }
    const onDown = (e) => add(e.clientX, e.clientY, 22, 4.5, 'burst')
    const star = (s) => {
      ctx.beginPath()
      for (let i = 0; i < 8; i++) {
        const r = i % 2 ? s * 0.28 : s
        const a = (i / 8) * Math.PI * 2
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r)
      }
      ctx.closePath()
      ctx.fill()
    }
    const heart = (s) => {
      ctx.beginPath()
      ctx.moveTo(0, s * 0.35)
      ctx.bezierCurveTo(-s, -s * 0.3, -s * 0.45, -s, 0, -s * 0.45)
      ctx.bezierCurveTo(s * 0.45, -s, s, -s * 0.3, 0, s * 0.35)
      ctx.fill()
    }
    let raf
    const loop = () => {
      raf = requestAnimationFrame(loop)
      ctx.clearRect(0, 0, innerWidth, innerHeight)
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]
        p.x += p.vx
        p.y += p.vy
        p.vy += p.kind === 'dust' ? 0.02 : 0.09
        p.vx *= 0.97
        p.rot += 0.05
        p.life -= p.decay
        if (p.life <= 0) { parts.splice(i, 1); continue }
        ctx.save()
        ctx.globalAlpha = p.life
        ctx.fillStyle = p.color
        ctx.shadowColor = '#f6dc95'
        ctx.shadowBlur = 8
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        if (p.kind === 'dust') { ctx.beginPath(); ctx.arc(0, 0, p.size, 0, 7); ctx.fill() }
        else if (p.kind === 'heart') heart(p.size)
        else star(p.size)
        ctx.restore()
      }
    }
    loop()
    addEventListener('pointermove', onMove)
    addEventListener('pointerdown', onDown)
    addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('pointermove', onMove)
      removeEventListener('pointerdown', onDown)
      removeEventListener('resize', resize)
    }
  }, [])
  return <canvas ref={ref} className="sparkles" aria-hidden="true" />
}
