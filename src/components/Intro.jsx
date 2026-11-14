import { useState } from 'react'
import { WEDDING } from '../config'
import Monogram from './Monogram.jsx'

// The wax seal splits into wedge shards that fly out in 3D.
const SHARDS = Array.from({ length: 12 }).map((_, i) => {
  const a0 = (i / 12) * Math.PI * 2
  const a1 = ((i + 1) / 12) * Math.PI * 2
  const pt = (a) => `${50 + 75 * Math.cos(a)}% ${50 + 75 * Math.sin(a)}%`
  const mid = (a0 + a1) / 2
  const d = 160 + Math.random() * 220
  return {
    clip: `polygon(50% 50%, ${pt(a0)}, ${pt(a1)})`,
    tx: `${Math.cos(mid) * d}px`,
    ty: `${Math.sin(mid) * d}px`,
    tz: `${150 + Math.random() * 350}px`,
    r: `${(Math.random() - 0.5) * 720}deg`,
  }
})

export default function Intro({ onOpen }) {
  const [stage, setStage] = useState('idle') // idle -> opening -> leaving -> gone

  const open = () => {
    if (stage !== 'idle') return
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission) {
        DeviceOrientationEvent.requestPermission().catch(() => {})
      }
    } catch {}
    navigator.vibrate?.([30, 40, 60])
    window.dispatchEvent(new Event('celebrate'))
    setStage('opening')
    onOpen()
    setTimeout(() => setStage('leaving'), 2400)
    setTimeout(() => setStage('gone'), 3500)
  }

  if (stage === 'gone') return null
  return (
    <div className={`intro stage-${stage}`} onClick={open} role="button" aria-label="Open invitation">
      <div className="intro-frame" />
      <div className="intro-flash" />
      <p className="intro-kicker">The Wedding Of</p>
      <p className="intro-names">{WEDDING.groom} <i>&amp;</i> {WEDDING.bride}</p>

      <div className="envelope">
        <div className="env-back" />
        <div className="letter">
          <Monogram size={70} />
          <p className="letter-sub">Save the date</p>
          <p className="letter-date">26 · 12 · 2026</p>
        </div>
        <div className="env-pocket" />
        <div className="env-flap"><div className="env-flap-inner" /></div>
        <div className="seal-wrap">
          <button className="seal" aria-label="Open">
            <span className="seal-text">{WEDDING.groom[0]}<i>&amp;</i>{WEDDING.bride[0]}</span>
          </button>
          <div className="shards" aria-hidden="true">
            {SHARDS.map((s, i) => (
              <span key={i} className="shard" style={{ clipPath: s.clip, WebkitClipPath: s.clip, '--tx': s.tx, '--ty': s.ty, '--tz': s.tz, '--r': s.r }} />
            ))}
          </div>
        </div>
      </div>

      <p className="intro-hint">
        <span className="dot" /> Tap the seal to open <span className="dot" />
      </p>
    </div>
  )
}
