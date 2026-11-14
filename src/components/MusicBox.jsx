import { useEffect, useRef, useState } from 'react'

/*
  Calm ambient music generated in the browser (no files):
  slow, warm chord pads with a soft low-pass + reverb, and a few gentle
  bell notes now and then. Quiet by design — never starts on its own.
*/
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12)
// Cmaj7 → Am9 → Fmaj7 → G6sus (MIDI notes)
const CHORDS = [
  [48, 55, 59, 64, 67],
  [45, 52, 57, 60, 64, 71],
  [41, 48, 53, 57, 64],
  [43, 50, 55, 59, 62],
]
const BELLS = [72, 74, 76, 79, 81, 84]
const CHORD_LEN = 8 // seconds per chord

function makeReverb(ctx, seconds = 4.5) {
  const len = ctx.sampleRate * seconds
  const buf = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6)
  }
  const conv = ctx.createConvolver()
  conv.buffer = buf
  return conv
}

export function useMusicBox() {
  const ref = useRef(null)
  const [playing, setPlaying] = useState(false)

  const setup = () => {
    if (ref.current) return ref.current
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const master = ctx.createGain()
    master.gain.value = 0
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 1400
    const verb = makeReverb(ctx)
    const wet = ctx.createGain()
    wet.gain.value = 0.55
    const dry = ctx.createGain()
    dry.gain.value = 0.6
    lp.connect(dry).connect(master)
    lp.connect(verb).connect(wet).connect(master)
    master.connect(ctx.destination)
    ref.current = { ctx, master, bus: lp, timer: null, next: 0, step: 0 }
    return ref.current
  }

  const pad = (s, notes, when) => {
    const { ctx, bus } = s
    notes.forEach((m, i) => {
      ;[-4, 4].forEach((det) => {
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.type = i === 0 ? 'sine' : 'triangle'
        o.frequency.value = hz(m)
        o.detune.value = det
        const peak = (i === 0 ? 0.05 : 0.022) / notes.length * 3
        g.gain.setValueAtTime(0.0001, when)
        g.gain.linearRampToValueAtTime(peak, when + 2.8)
        g.gain.setValueAtTime(peak, when + CHORD_LEN - 1)
        g.gain.linearRampToValueAtTime(0.0001, when + CHORD_LEN + 2.5)
        o.connect(g).connect(bus)
        o.start(when)
        o.stop(when + CHORD_LEN + 2.6)
      })
    })
  }

  const bell = (s, m, when) => {
    const { ctx, bus } = s
    ;[1, 2.76].forEach((h, i) => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.value = hz(m) * h
      const v = i ? 0.006 : 0.03
      g.gain.setValueAtTime(0.0001, when)
      g.gain.linearRampToValueAtTime(v, when + 0.03)
      g.gain.exponentialRampToValueAtTime(0.0001, when + (i ? 1.5 : 4))
      o.connect(g).connect(bus)
      o.start(when)
      o.stop(when + 4.2)
    })
  }

  const schedule = () => {
    const s = ref.current
    while (s.next < s.ctx.currentTime + 2) {
      pad(s, CHORDS[s.step % CHORDS.length], s.next)
      const n = 2 + ((s.step * 7) % 3)
      for (let k = 0; k < n; k++) {
        if (Math.random() < 0.75) bell(s, BELLS[(Math.random() * BELLS.length) | 0], s.next + 0.8 + k * (CHORD_LEN / n) + Math.random() * 0.6)
      }
      s.step++
      s.next += CHORD_LEN
    }
  }

  const start = () => {
    const s = setup()
    clearTimeout(s.stopT)
    s.ctx.resume()
    s.master.gain.cancelScheduledValues(s.ctx.currentTime)
    s.master.gain.setValueAtTime(s.master.gain.value, s.ctx.currentTime)
    s.master.gain.linearRampToValueAtTime(0.8, s.ctx.currentTime + 4)
    if (!s.timer) {
      s.next = s.ctx.currentTime + 0.1
      schedule()
      s.timer = setInterval(schedule, 500)
    }
    setPlaying(true)
  }

  const stop = () => {
    const s = ref.current
    if (!s) return
    s.master.gain.cancelScheduledValues(s.ctx.currentTime)
    s.master.gain.setValueAtTime(s.master.gain.value, s.ctx.currentTime)
    s.master.gain.linearRampToValueAtTime(0, s.ctx.currentTime + 1.2)
    s.stopT = setTimeout(() => {
      clearInterval(s.timer)
      s.timer = null
      s.ctx.suspend()
    }, 1400)
    setPlaying(false)
  }

  useEffect(() => () => ref.current && clearInterval(ref.current.timer), [])
  return { playing, start, toggle: () => (playing ? stop() : start()) }
}
