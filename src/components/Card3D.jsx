import { useEffect, useRef } from 'react'

/*
  A physical 3D card:
  - real thickness (stacked gilded-edge layers)
  - content floats at different depths (add className z1 / z2 / z3 / z4 to children)
  - follows the mouse, the phone's tilt, or gently floats on its own
  - holographic foil sheen + moving glare + a soft shadow that shifts with the angle
  - flips in from deep space when it scrolls into view
*/
const EDGE_LAYERS = 12

export default function Card3D({ children, className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    let tx = 0, ty = 0, rx = 0, ry = 0, gx = 0, gy = 0
    let hover = false, gyro = false, visible = false, raf = 0

    const onMove = (e) => {
      if (e.pointerType === 'touch') return
      const r = el.getBoundingClientRect()
      tx = (e.clientX - r.left) / r.width - 0.5
      ty = (e.clientY - r.top) / r.height - 0.5
      hover = true
    }
    const onLeave = () => (hover = false)
    const onOrient = (e) => {
      if (e.gamma == null) return
      gyro = true
      gx = Math.max(-1, Math.min(1, e.gamma / 25)) * 0.5
      gy = Math.max(-1, Math.min(1, (e.beta - 50) / 25)) * 0.5
    }
    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (!visible) return
      const t = performance.now() / 1000
      const X = hover ? tx : gyro ? gx : Math.sin(t * 0.7) * 0.22
      const Y = hover ? ty : gyro ? gy : Math.cos(t * 0.55) * 0.14
      rx += (X - rx) * 0.08
      ry += (Y - ry) * 0.08
      el.style.setProperty('--ry', `${rx * 26}deg`)
      el.style.setProperty('--rx', `${-ry * 22}deg`)
      el.style.setProperty('--mx', `${(rx + 0.5) * 100}%`)
      el.style.setProperty('--my', `${(ry + 0.5) * 100}%`)
      el.style.setProperty('--sx', `${-rx * 40}px`)
      el.style.setProperty('--sy', `${30 - ry * 30}px`)
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) el.classList.add('entered')
    }, { threshold: 0.15 })
    io.observe(el)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    window.addEventListener('deviceorientation', onOrient)
    loop()
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('deviceorientation', onOrient)
    }
  }, [])

  return (
    <div ref={ref} className={`c3d ${className}`}>
      <div className="c3d-shadow" />
      <div className="c3d-enter">
        <div className="c3d-body">
          {Array.from({ length: EDGE_LAYERS }).map((_, i) => (
            <div key={i} className="c3d-edge" style={{ transform: `translateZ(${-(i + 1) * 1.4}px)` }} />
          ))}
          <div className="c3d-back" style={{ transform: `translateZ(${-(EDGE_LAYERS + 1) * 1.4}px) rotateY(180deg)` }} />
          <div className="c3d-face">
            <div className="c3d-frame" />
            {children}
            <div className="c3d-holo" />
            <div className="c3d-glare" />
          </div>
        </div>
      </div>
    </div>
  )
}
