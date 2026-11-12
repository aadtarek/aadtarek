import { useEffect, useRef, useState } from 'react'
import { WEDDING as W } from './config'
import Scene3D from './components/Scene3D.jsx'
import Intro from './components/Intro.jsx'
import Countdown from './components/Countdown.jsx'
import LineFlower from './components/LineFlower.jsx'
import Monogram from './components/Monogram.jsx'
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
    location: `${W.venue}, ${W.area}`,
    details: `We can't wait to celebrate with you!\n${W.mapsUrl}`,
  })
  return `https://calendar.google.com/calendar/render?${p}`
}

const downloadIcs = () => {
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//wedding//EN', 'BEGIN:VEVENT',
    'UID:ahmed-mariam-20261226', 'DTSTAMP:20261101T000000Z',
    'DTSTART;VALUE=DATE:20261226', 'DTEND;VALUE=DATE:20261227',
    `SUMMARY:${W.groom} & ${W.bride}'s Wedding`, `LOCATION:${W.venue} - Obour`,
    `DESCRIPTION:${W.mapsUrl}`, 'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
  a.download = 'ahmed-mariam-wedding.ics'
  a.click()
}

const Icon = {
  sun: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" /></svg>,
  moon: <svg viewBox="0 0 24 24"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" /></svg>,
  note: <svg viewBox="0 0 24 24"><path d="M9 18V5l11-2v13" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="17.5" cy="16" r="2.5" /></svg>,
  mute: <svg viewBox="0 0 24 24"><path d="M9 18V5l11-2v13" /><circle cx="6.5" cy="18" r="2.5" /><path d="M3 3l18 18" /></svg>,
}

const Divider = () => (
  <div className="divider" aria-hidden="true">
    <span className="dl" /><svg viewBox="0 0 40 20"><path d="M20 2 L24 10 L20 18 L16 10Z" /><circle cx="6" cy="10" r="1.6" /><circle cx="34" cy="10" r="1.6" /></svg><span className="dl" />
  </div>
)

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
    setTimeout(() => setBurst((b) => b + 1), 1500)
    setTimeout(() => setOpened(true), 2200)
  }

  return (
    <>
      <div className="bg-marble" />
      <Scene3D lightsOff={lightsOff} burst={burst} />
      <div className="vignette" />
      <Sparkles />
      <Intro onOpen={open} />

      <div className={`controls ${opened ? 'show' : ''}`}>
        <button className="ctl" onClick={() => setLightsOff((v) => !v)} aria-label="Toggle night mode">
          {lightsOff ? Icon.sun : Icon.moon}
        </button>
        <button className={`ctl ${music.playing ? 'playing' : ''}`} onClick={music.toggle} aria-label="Toggle music">
          {music.playing ? Icon.note : Icon.mute}
        </button>
      </div>

      <main className={`page ${opened ? 'opened' : ''}`}>
        {/* HERO */}
        <section className="hero">
          <Monogram size={112} className="hero-mono" />
          <p className="bism">بسم الله الرحمن الرحيم</p>
          <p className="kicker">Together with their families</p>
          <h1 className="names">
            <span className="name foil">{W.groom}</span>
            <span className="amp">&amp;</span>
            <span className="name foil">{W.bride}</span>
          </h1>
          <p className="names-ar">{W.groomAr} <span>و</span> {W.brideAr}</p>
          <div className="hero-date">
            <span>{W.dayName}</span><b className="foil">26 · 12 · 2026</b><span className="ar">{W.dayNameAr}</span>
          </div>
          <div className="scroll-hint"><span /></div>
        </section>

        {/* INVITATION */}
        <section className="reveal">
          <Tilt className="card">
            <LineFlower className="card-flower left" size={70} />
            <LineFlower className="card-flower right" size={70} flip />
            <p className="card-kicker">With joyful hearts</p>
            <p className="ar-big">يسعدنا ويشرفنا دعوتكم لحضور حفل زفافنا</p>
            <Divider />
            <p className="en">
              We request the pleasure of your company as we celebrate our love
              and begin our forever together.
            </p>
            <p className="cute">✦ مستنيينكم تنوّروا فرحتنا ✦</p>
          </Tilt>
        </section>

        {/* DATE */}
        <section className="reveal">
          <p className="eyebrow">Mark your calendar</p>
          <h2 className="title foil">Save the Date</h2>
          <p className="title-ar">احجز التاريخ</p>
          <div className="date-tiles">
            <div className="tile" style={{ '--i': 0 }}><small>{W.dayName}</small><b className="foil">26</b><small className="ar">{W.dayNameAr}</small></div>
            <div className="tile big" style={{ '--i': 1 }}><small>December</small><b className="foil">12</b><small className="ar">ديسمبر</small></div>
            <div className="tile" style={{ '--i': 2 }}><small>Year</small><b className="foil">2026</b><small className="ar">٢٠٢٦</small></div>
          </div>
        </section>

        {/* RINGS + VERSE */}
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
          <p className="eyebrow">Until we say “I do”</p>
          <h2 className="title foil">Counting Down</h2>
          <p className="title-ar">باقي على الفرح</p>
          <Countdown target={W.date} />
          <p className="cute heart-line"><span className="beat">♥</span> and every second brings us closer</p>
        </section>

        {/* VENUE */}
        <section className="reveal">
          <Tilt className="card venue">
            <div className="pin"><span className="pin-dot" /><span className="pin-wave" /><span className="pin-wave w2" /></div>
            <p className="card-kicker">The celebration will be held at</p>
            <p className="venue-name foil">{W.venue}</p>
            <p className="venue-ar">{W.venueAr}</p>
            <p className="venue-area">{W.area}</p>
            <a className="map-frame" href={W.mapsUrl} target="_blank" rel="noopener noreferrer" aria-label="Open in Google Maps">
              <iframe title="map" src={W.mapsEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" tabIndex={-1} />
            </a>
            <a className="btn" href={W.mapsUrl} target="_blank" rel="noopener noreferrer">
              <span>Open in Maps · افتح الخريطة</span>
            </a>
            <Divider />
            <p className="card-kicker">Dress code</p>
            <p className="dress"><span className="foil">{W.dressCode}</span> · <span className="ar">{W.dressCodeAr}</span></p>
            <div className="swatches" aria-hidden="true">
              {['#f6c1cf', '#c9e4f6', '#d8f0c8', '#fbe39a', '#d9c8f5', '#ffcfa8'].map((c, i) => <i key={i} style={{ background: c, '--i': i }} />)}
            </div>
          </Tilt>
        </section>

        {/* CALENDAR */}
        <section className="reveal">
          <p className="eyebrow">Don't forget us</p>
          <h2 className="title foil">Add to Calendar</h2>
          <p className="title-ar">ضيفها لتقويمك</p>
          <div className="btn-row">
            <a className="btn ghost" href={gcal()} target="_blank" rel="noreferrer"><span>Google Calendar</span></a>
            <button className="btn ghost" onClick={downloadIcs}><span>Apple / Outlook</span></button>
          </div>
          <p className="tip">جرّب زرار القمر 🌙 فوق… وشوف الدهب بينوّر</p>
        </section>

        {/* FOOTER */}
        <footer className="reveal footer">
          <LineFlower className="footer-flower" size={60} />
          <p className="footer-ar">وجودكم هو أجمل هدية</p>
          <p className="footer-en">Your presence is our greatest gift</p>
          <Monogram size={96} className="footer-mono" />
          <p className="sign foil">{W.groom} &amp; {W.bride}</p>
          <p className="sign-date">26 · 12 · 2026</p>
        </footer>
      </main>
    </>
  )
}
