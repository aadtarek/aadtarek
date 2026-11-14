import { useEffect, useRef, useState } from 'react'

// A gold-foil coin you scratch with your finger to reveal what's underneath.
function Coin({ value, label, onDone, index }) {
  const cv = useRef(null)
  const [done, setDone] = useState(false)
  useEffect(() => {
    const c = cv.current
    const dpr = Math.min(window.devicePixelRatio, 2)
    const size = c.offsetWidth
    c.width = c.height = size * dpr
    const ctx = c.getContext('2d')
    ctx.scale(dpr, dpr)
    const g = ctx.createLinearGradient(0, 0, size, size)
    ;['#9c7424', '#e9c97a', '#fff1c1', '#c99a3b', '#8a6420', '#f2d68c'].forEach((col, i, a) => g.addColorStop(i / (a.length - 1), col))
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'
    for (let r = size * 0.12; r < size / 2; r += 5) {
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.fillStyle = 'rgba(90,15,34,0.85)'
    ctx.font = `${size * 0.32}px "Great Vibes", cursive`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('♥', size / 2, size / 2)

    let drawing = false
    let moves = 0
    const pos = (e) => {
      const r = c.getBoundingClientRect()
      return [e.clientX - r.left, e.clientY - r.top]
    }
    const scratch = (e) => {
      if (!drawing) return
      e.preventDefault()
      const [x, y] = pos(e)
      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath()
      ctx.arc(x, y, size * 0.13, 0, Math.PI * 2)
      ctx.fill()
      if (++moves % 6 === 0) {
        const data = ctx.getImageData(0, 0, c.width, c.height).data
        let clear = 0
        for (let i = 3; i < data.length; i += 64) if (data[i] === 0) clear++
        if (clear / (data.length / 64) > 0.55) {
          setDone(true)
          onDone()
        }
      }
    }
    const start = (e) => { drawing = true; c.setPointerCapture?.(e.pointerId); scratch(e) }
    const end = () => (drawing = false)
    c.addEventListener('pointerdown', start)
    c.addEventListener('pointermove', scratch)
    c.addEventListener('pointerup', end)
    c.addEventListener('pointercancel', end)
    return () => {
      c.removeEventListener('pointerdown', start)
      c.removeEventListener('pointermove', scratch)
      c.removeEventListener('pointerup', end)
      c.removeEventListener('pointercancel', end)
    }
  }, [])
  return (
    <div className={`coin ${done ? 'done' : ''}`} style={{ '--i': index }}>
      <div className="coin-face">
        <b className="foil">{value}</b>
        <small>{label}</small>
      </div>
      <canvas ref={cv} className="coin-foil" />
    </div>
  )
}

export default function Scratch({ items }) {
  const [count, setCount] = useState(0)
  const all = count >= items.length
  useEffect(() => {
    if (all) window.dispatchEvent(new Event('petal-burst'))
  }, [all])
  return (
    <div className={`scratch ${all ? 'all' : ''}`}>
      <div className="coins">
        {items.map((it, i) => (
          <Coin key={i} index={i} {...it} onDone={() => setCount((c) => c + 1)} />
        ))}
      </div>
      <p className="scratch-hint">{all ? 'See you there! ✨' : 'Scratch each coin with your finger'}</p>
    </div>
  )
}
