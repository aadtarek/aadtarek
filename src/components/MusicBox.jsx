import { useEffect, useRef, useState } from 'react'

// An original, procedurally generated music-box lullaby (no audio files needed).
const NOTES = { C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880 }
const PROG = [
  ['C4', 'G4', 'C5', 'E5', 'G5', 'E5', 'C5', 'G4'],
  ['A4', 'C5', 'E5', 'A5', 'E5', 'C5', 'A4', 'E4'],
  ['F4', 'A4', 'C5', 'E5', 'A5', 'E5', 'C5', 'A4'],
  ['G4', 'B4', 'D5', 'G5', 'D5', 'B4', 'G4', 'D4'],
]

export function useMusicBox() {
  const ctxRef = useRef(null)
  const timer = useRef(null)
  const master = useRef(null)
  const [playing, setPlaying] = useState(false)

  const ensure = () => {
    if (ctxRef.current) return ctxRef.current
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const out = ctx.createGain()
    out.gain.value = 0.0
    const delay = ctx.createDelay()
    delay.delayTime.value = 0.36
    const fb = ctx.createGain()
    fb.gain.value = 0.38
    const wet = ctx.createGain()
    wet.gain.value = 0.35
    out.connect(ctx.destination)
    out.connect(delay)
    delay.connect(fb).connect(delay)
    delay.connect(wet).connect(ctx.destination)
    ctxRef.current = ctx
    master.current = out
    return ctx
  }

  const pluck = (ctx, freq, when, vol = 0.18) => {
    ;[1, 2.01, 3.98].forEach((h, i) => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = i === 0 ? 'triangle' : 'sine'
      o.frequency.value = freq * h
      g.gain.setValueAtTime(0, when)
      g.gain.linearRampToValueAtTime(vol / (i + 1) ** 1.6, when + 0.005)
      g.gain.exponentialRampToValueAtTime(0.0001, when + 1.6 / (i + 1))
      o.connect(g).connect(master.current)
      o.start(when)
      o.stop(when + 1.8)
    })
  }

  const start = () => {
    const ctx = ensure()
    ctx.resume()
    master.current.gain.cancelScheduledValues(ctx.currentTime)
    master.current.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 1.5)
    let step = 0
    let next = ctx.currentTime + 0.1
    const beat = 0.3
    const schedule = () => {
      while (next < ctx.currentTime + 0.6) {
        const bar = Math.floor(step / 8) % PROG.length
        const n = PROG[bar][step % 8]
        pluck(ctx, NOTES[n], next, step % 8 === 0 ? 0.24 : 0.15)
        if (step % 8 === 0) pluck(ctx, NOTES[PROG[bar][0]] / 2, next, 0.16)
        step++
        next += beat
      }
    }
    schedule()
    clearInterval(timer.current)
    timer.current = setInterval(schedule, 120)
    setPlaying(true)
  }

  const stop = () => {
    const ctx = ctxRef.current
    if (!ctx) return
    master.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6)
    setTimeout(() => clearInterval(timer.current), 700)
    setPlaying(false)
  }

  useEffect(() => () => clearInterval(timer.current), [])
  return { playing, start, toggle: () => (playing ? stop() : start()) }
}
