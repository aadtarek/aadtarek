import { useState } from 'react'
import { WEDDING } from '../config'
import Monogram from './Monogram.jsx'

export default function Intro({ onOpen }) {
  const [stage, setStage] = useState('idle') // idle -> opening -> leaving -> gone

  const open = () => {
    if (stage !== 'idle') return
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission) {
        DeviceOrientationEvent.requestPermission().catch(() => {})
      }
    } catch {}
    setStage('opening')
    onOpen()
    setTimeout(() => setStage('leaving'), 2300)
    setTimeout(() => setStage('gone'), 3300)
  }

  if (stage === 'gone') return null
  return (
    <div className={`intro stage-${stage}`} onClick={open} role="button" aria-label="Open invitation">
      <div className="intro-frame" />
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
        <button className="seal" aria-label="Open">
          <span className="seal-text">{WEDDING.groom[0]}<i>&amp;</i>{WEDDING.bride[0]}</span>
        </button>
      </div>

      <p className="intro-hint">
        <span className="dot" /> اضغط على الختم لفتح الدعوة <span className="dot" />
        <br />
        <small>Tap the seal to open</small>
      </p>
    </div>
  )
}
