import { useEffect, useRef, useState } from 'react'
import { WEDDING as W } from './config'
import Scene3D from './components/Scene3D.jsx'
import Intro from './components/Intro.jsx'
import Countdown from './components/Countdown.jsx'
import Bloom from './components/Bloom.jsx'
import Sparkles from './components/Sparkles.jsx'
import { useMusicBox } from './components/MusicBox.jsx'

// Reveal sections (and bloom their flowers) when they scroll into view
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('in')),
      { threshold: 0.22 }
    )
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

// 3D tilt that follows the finger / mouse
function Tilt({ children, className = '' }) {
  const ref = useRef(null)
  const move = (e) => {
    const el = ref.current
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--rx', `${-y * 14}deg`)
    el.style.setProperty('--ry', `${x * 18}deg`)
    el.style.setProperty('--gx', `${(x + 0.5) * 100}%`)
    el.style.setProperty('--gy', `${(y + 0.5) * 100}%`)
  }
  const leave = () => {
    ref.current.style.setProperty('--rx', '0deg')
    ref.current.style.setProperty('--ry', '0deg')
  }
  return (
    <div ref={ref} className={`tilt ${className}`} onPointerMove={move} onPointerLeave={leave}>
      {children}
    </div>
  )
}

const gcal = () => {
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${W.groom} & ${W.bride}'s Wedding 💍`,
    dates: '20261226/20261227',
    location: W.venue,
    details: `We can't wait to celebrate with you!\n${W.mapsUrl}`,
  })
  return `https://calendar.google.com/calendar/render?${p}`
}

const downloadIcs = () => {
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//wedding//EN', 'BEGIN:VEVENT',
    'UID:ahmed-mariam-20261226', 'DTSTAMP:20261101T000000Z',
    'DTSTART;VALUE=DATE:20261226', 'DTEND;VALUE=DATE:20261227',
    `SUMMARY:${W.groom} & ${W.bride}'s Wedding`, `LOCATION:${W.venue}`,
    `DESCRIPTION:${W.mapsUrl}`, 'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
  a.download = 'ahmed-mariam-wedding.ics'
  a.click()
}

export default function App() {
  const [opened, setOpened] = useState(false)
  const [lightsOff, setLightsOff] = useState(false)
  const [burst, setBurst] = useState(0)
  const music = useMusicBox()
  useReveal()

  useEffect(() => {
    document.body.classList.toggle('lights-off', lightsOff)
  }, [lightsOff])

  useEffect(() => {
    document.body.style.overflow = opened ? '' : 'hidden'
  }, [opened])

  const open = () => {
    music.start()
    setBurst((b) => b + 1)
    setTimeout(() => setOpened(true), 900)
  }

  return (
    <>
      <div className="bg-aurora" />
      <Scene3D lightsOff={lightsOff} burst={burst} />
      <div className="vignette" />
      <Sparkles />
      <Intro onOpen={open} />

      <div className={`controls ${opened ? 'show' : ''}`}>
        <button className={`ctl ${lightsOff ? 'on' : ''}`} onClick={() => setLightsOff((v) => !v)} aria-label="Toggle lights">
          {lightsOff ? '🌙' : '💡'}
        </button>
        <button className={`ctl ${music.playing ? 'on' : ''}`} onClick={music.toggle} aria-label="Toggle music">
          {music.playing ? '♫' : '🔇'}
        </button>
      </div>

      <main className={`page ${opened ? 'opened' : ''}`}>
        {/* HERO */}
        <section className="hero">
          <p className="bism">بسم الله الرحمن الرحيم</p>
          <p className="kicker">Together with their families</p>
          <h1 className="names">
            <span className="name">{W.groom}</span>
            <span className="amp">&amp;</span>
            <span className="name">{W.bride}</span>
          </h1>
          <p className="names-ar">{W.groomAr} <span>و</span> {W.brideAr}</p>
          <p className="hero-date">26 · 12 · 2026</p>
          <div className="scroll-hint"><span /></div>
        </section>

        {/* INVITATION */}
        <section className="reveal">
          <Bloom className="corner tl" hue="pink" />
          <Bloom className="corner br" hue="gold" size={90} />
          <Tilt className="card">
            <p className="ar-big">يسعدنا ويشرفنا دعوتكم لحضور حفل زفافنا</p>
            <div className="divider"><span>✦</span></div>
            <p className="en">
              With hearts full of love, we invite you to share the most magical night of our lives
              as we begin our forever together.
            </p>
          </Tilt>
        </section>

        {/* DATE */}
        <section className="reveal">
          <h2 className="title">Save the Date</h2>
          <p className="title-ar">احجز التاريخ</p>
          <div className="date-tiles">
            <div className="tile" style={{ '--i': 0 }}><small>{W.dayName}</small><b>26</b><small>{W.dayNameAr}</small></div>
            <div className="tile" style={{ '--i': 1 }}><small>Month</small><b>DEC</b><small>ديسمبر</small></div>
            <div className="tile" style={{ '--i': 2 }}><small>Year</small><b>2026</b><small>٢٠٢٦</small></div>
          </div>
        </section>

        {/* RINGS SPACE (3D rings float here) */}
        <section className="reveal rings-space">
          <div className="rings-anchor" />
          <p className="verse">
            وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا
            وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً
          </p>
          <p className="verse-ref">سورة الروم · ٢١</p>
        </section>

        {/* COUNTDOWN */}
        <section className="reveal">
          <h2 className="title">Counting the Moments</h2>
          <p className="title-ar">باقي على الفرح</p>
          <Countdown target={W.date} />
        </section>

        {/* VENUE */}
        <section className="reveal">
          <Bloom className="corner tr" hue="white" />
          <Bloom className="corner bl" hue="pink" size={90} />
          <Tilt className="card venue">
            <div className="pin"><span className="pin-dot" /><span className="pin-wave" /><span className="pin-wave w2" /></div>
            <h2 className="title small">The Venue</h2>
            <p className="venue-name">{W.venue}</p>
            <p className="venue-ar">{W.venueAr}</p>
            <a className="btn" href={W.mapsUrl} target="_blank" rel="noreferrer">
              <span>📍 Open in Maps · افتح الخريطة</span>
            </a>
          </Tilt>
        </section>

        {/* CALENDAR */}
        <section className="reveal">
          <h2 className="title">Don't Miss It</h2>
          <p className="title-ar">ضيفها لتقويمك</p>
          <div className="btn-row">
            <a className="btn ghost" href={gcal()} target="_blank" rel="noreferrer"><span>Google Calendar</span></a>
            <button className="btn ghost" onClick={downloadIcs}><span>Apple / Outlook</span></button>
          </div>
          <p className="tip">جرّب تطفي النور 💡 من فوق… وشوف السحر</p>
        </section>

        {/* FOOTER */}
        <footer className="reveal footer">
          <Bloom className="footer-bloom" hue="gold" size={110} />
          <p className="footer-ar">وجودكم هو أجمل هدية</p>
          <p className="footer-en">Your presence is our greatest gift</p>
          <p className="sign">{W.groom} &amp; {W.bride}</p>
          <p className="sign-date">26 · 12 · 2026</p>
        </footer>
      </main>
    </>
  )
}
