import { useState } from 'react'
import { WEDDING } from '../config'

export default function Intro({ onOpen }) {
  const [opening, setOpening] = useState(false)
  const [gone, setGone] = useState(false)

  const open = async () => {
    if (opening) return
    // iOS asks permission for the tilt-parallax effect
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission) {
        DeviceOrientationEvent.requestPermission().catch(() => {})
      }
    } catch {}
    setOpening(true)
    onOpen()
    setTimeout(() => setGone(true), 2200)
  }

  if (gone) return null
  return (
    <div className={`intro ${opening ? 'is-opening' : ''}`} onClick={open} role="button" aria-label="Open invitation">
      <div className="door door-left"><div className="door-art" /></div>
      <div className="door door-right"><div className="door-art" /></div>
      <div className="intro-light" />
      <div className="intro-center">
        <p className="intro-kicker">You are invited</p>
        <button className="seal" aria-label="Open">
          <span className="seal-ring" />
          <span className="seal-text">{WEDDING.initials}</span>
        </button>
        <p className="intro-hint">اضغط لفتح الدعوة · Tap to open</p>
      </div>
    </div>
  )
}
