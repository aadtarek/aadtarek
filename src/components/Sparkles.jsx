import { useEffect, useState } from 'react'

// Tap / click anywhere for a burst of glowing sparkles.
export default function Sparkles() {
  const [bursts, setBursts] = useState([])
  useEffect(() => {
    let id = 0
    const onDown = (e) => {
      const b = { id: id++, x: e.clientX, y: e.clientY }
      setBursts((s) => [...s.slice(-6), b])
      setTimeout(() => setBursts((s) => s.filter((x) => x.id !== b.id)), 1100)
    }
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [])
  return (
    <div className="sparkles" aria-hidden="true">
      {bursts.map((b) => (
        <div key={b.id} className="burst" style={{ left: b.x, top: b.y }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <i key={i} style={{ '--a': `${i * 30}deg`, '--dist': `${40 + (i % 3) * 18}px` }}>{i % 3 ? '✦' : '♥'}</i>
          ))}
        </div>
      ))}
    </div>
  )
}
