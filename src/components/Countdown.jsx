import { useEffect, useState } from 'react'

const diff = (target) => {
  const ms = Math.max(0, new Date(target).getTime() - Date.now())
  return {
    done: ms === 0,
    d: Math.floor(ms / 864e5),
    h: Math.floor((ms / 36e5) % 24),
    m: Math.floor((ms / 6e4) % 60),
    s: Math.floor((ms / 1e3) % 60),
  }
}

function Unit({ value, max, label, labelAr }) {
  const pct = max ? (value % max) / max : 0
  const C = 2 * Math.PI * 44
  return (
    <div className="cd-unit">
      <svg viewBox="0 0 100 100" className="cd-ring">
        <circle cx="50" cy="50" r="44" className="cd-track" />
        <circle cx="50" cy="50" r="44" className="cd-bar" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} />
      </svg>
      <div className="cd-num" key={value}>{String(value).padStart(2, '0')}</div>
      <div className="cd-label">{label}<span>{labelAr}</span></div>
    </div>
  )
}

export default function Countdown({ target }) {
  const [t, setT] = useState(() => diff(target))
  useEffect(() => {
    const id = setInterval(() => setT(diff(target)), 1000)
    return () => clearInterval(id)
  }, [target])
  if (t.done) return <p className="cd-done">The celebration has begun ✨ بدأت الفرحة</p>
  return (
    <div className="countdown">
      <Unit value={t.d} max={365} label="Days" labelAr="يوم" />
      <Unit value={t.h} max={24} label="Hours" labelAr="ساعة" />
      <Unit value={t.m} max={60} label="Minutes" labelAr="دقيقة" />
      <Unit value={t.s} max={60} label="Seconds" labelAr="ثانية" />
    </div>
  )
}
