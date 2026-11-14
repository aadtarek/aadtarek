import { useEffect, useRef } from 'react'

// Scroll progress bar + parallax ([data-speed]) + soft glow that follows the cursor.
export default function ScrollFx() {
  const bar = useRef(null)
  const glow = useRef(null)
  useEffect(() => {
    let raf = 0
    let gx = innerWidth / 2, gy = innerHeight / 2, cx = gx, cy = gy
    const els = () => document.querySelectorAll('[data-speed]')
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight)
      if (bar.current) bar.current.style.transform = `scaleX(${scrollY / max})`
      els().forEach((el) => {
        const r = el.getBoundingClientRect()
        const off = (r.top + r.height / 2 - innerHeight / 2) * parseFloat(el.dataset.speed)
        el.style.setProperty('--py', `${off.toFixed(1)}px`)
      })
      cx += (gx - cx) * 0.12
      cy += (gy - cy) * 0.12
      if (glow.current) glow.current.style.transform = `translate(${cx - 200}px, ${cy - 200}px)`
    }
    const move = (e) => { gx = e.clientX; gy = e.clientY }
    addEventListener('pointermove', move)
    loop()
    return () => { cancelAnimationFrame(raf); removeEventListener('pointermove', move) }
  }, [])
  return (
    <>
      <div className="progress"><span ref={bar} /></div>
      <div className="cursor-glow" ref={glow} aria-hidden="true" />
    </>
  )
}
