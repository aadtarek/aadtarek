import { useEffect, useRef, useState } from 'react'
import { WEDDING as W } from './config'
import Scene3D from './components/Scene3D.jsx'
import Intro from './components/Intro.jsx'
import Countdown from './components/Countdown.jsx'
import LineFlower from './components/LineFlower.jsx'
import Monogram from './components/Monogram.jsx'
import Sparkles from './components/Sparkles.jsx'
import Studio from './components/Studio.jsx'
import Scratch from './components/Scratch.jsx'
import Timeline from './components/Timeline.jsx'
import Rsvp from './components/Rsvp.jsx'
import { useMusicBox } from './components/MusicBox.jsx'

function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('in')),
      { threshold: 0.18 }
    )
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

function Tilt({ children, className = '' }) {
  const ref = useRef(null)
  const move = (e) => {
    if (e.pointerType === 'touch') return
    const el = ref.current
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--rx', `${-y * 12}deg`)
    el.style.setProperty('--ry', `${x * 16}deg`)
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
    dates: '20261226T170000Z/20261226T230000Z',
    location: `${W.venue}, ${W.area}`,
    details: `We can't wait to celebrate with you!\n${W.mapsUrl}`,
  })
  return `https://calendar.google.com/calendar/render?${p}`
}

const downloadIcs = () => {
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//wedding//EN', 'BEGIN:VEVENT',
    'UID:ahmed-mariam-20261226', 'DTSTAMP:20261101T000000Z',
    'DTSTART:20261226T170000Z', 'DTEND:20261226T230000Z',
    `SUMMARY:${W.groom} & ${W.bride}'s Wedding`, `LOCATION:${W.venue} - Obour`,
    `DESCRIPTION:${W.mapsUrl}`, 'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
  a.download = 'ahmed-mariam-wedding.ics'
  a.click()
}

const Icon = {
  note: <svg viewBox="0 0 24 24"><path d="M9 18V5l11-2v13" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="17.5" cy="16" r="2.5" /></svg>,
  mute: <svg viewBox="0 0 24 24"><path d="M9 18V5l11-2v13" /><circle cx="6.5" cy="18" r="2.5" /><path d="M3 3l18 18" /></svg>,
}

const Divider = () => (
  <div className="divider" aria-hidden="true">
    <span className="dl" /><svg viewBox="0 0 40 20"><path d="M20 2 L24 10 L20 18 L16 10Z" /><circle cx="6" cy="10" r="1.6" /><circle cx="34" cy="10" r="1.6" /></svg><span className="dl" />
  </div>
)

const Heading = ({ eyebrow, title, ar }) => (
  <>
    <p className="eyebrow">{eyebrow}</p>
    <h2 className="title foil">{title}</h2>
    <p className="title-ar">{ar}</p>
  </>
)

const DEFAULTS = { palette: 'mix', petals: 0.7, wind: 1, size: 1, butterflies: true, gold: true }

export default function App() {
  const [opened, setOpened] = useState(false)
  const [burst, setBurst] = useState(0)
  const [settings, setSettings] = useState(DEFAULTS)
  const music = useMusicBox()
  useReveal()

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
      <div className="bg-velvet" />
      <Scene3D settings={settings} burst={burst} />
      <div className="vignette" />
      <Sparkles />
      <Intro onOpen={open} />

      <div className={`controls ${opened ? 'show' : ''}`}>
        <button className={`ctl ${music.playing ? 'playing' : ''}`} onClick={music.toggle} aria-label="Toggle music">
          {music.playing ? Icon.note : Icon.mute}
        </button>
      </div>
      <Studio show={opened} settings={settings} setSettings={setSettings} onRain={() => setBurst((b) => b + 1)} />

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

        {/* COUPLE PHOTO */}
        <section className="reveal photo-section">
          <p className="eyebrow">Two hearts · One love</p>
          <Tilt className="arch">
            <div className="arch-inner">
              <img src={W.photo} alt={`${W.groom} & ${W.bride}`} loading="lazy" />
              <div className="arch-shine" />
            </div>
            <span className="arch-heart h1">♥</span>
            <span className="arch-heart h2">♥</span>
            <span className="arch-heart h3">♥</span>
            <span className="arch-heart h4">♥</span>
            <LineFlower className="arch-flower left" size={64} />
            <LineFlower className="arch-flower right" size={64} />
          </Tilt>
          <p className="photo-caption">{W.groom} <i>&amp;</i> {W.bride}</p>
          <p className="photo-ar">وأخيرًا… لقينا بعض 🤍</p>
        </section>

        {/* INVITATION */}
        <section className="reveal">
          <Tilt className="card">
            <LineFlower className="card-flower left" size={70} />
            <LineFlower className="card-flower right" size={70} />
            <p className="card-kicker">With joyful hearts</p>
            <p className="ar-big">يسعدنا ويشرفنا دعوتكم لحضور حفل زفافنا</p>
            <Divider />
            <p className="en">
              We request the pleasure of your company as we celebrate our love
              and begin our forever together.
            </p>
            {(W.groomParents || W.brideParents) && (
              <div className="families">
                <div><small>Son of</small><b>{W.groomParents}</b><span className="fam-name">{W.groom}</span></div>
                <div className="fam-amp">&amp;</div>
                <div><small>Daughter of</small><b>{W.brideParents}</b><span className="fam-name">{W.bride}</span></div>
              </div>
            )}
            <p className="cute">✦ مستنيينكم تنوّروا فرحتنا ✦</p>
          </Tilt>
        </section>

        {/* SCRATCH DATE */}
        <section className="reveal">
          <Heading eyebrow="A little surprise" title="Save the Date" ar="امسح واكشف التاريخ" />
          <Scratch items={[
            { value: '26', label: W.dayName },
            { value: 'DEC', label: 'December' },
            { value: '2026', label: 'Year' },
          ]} />
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

        {/* PROGRAM */}
        <section className="reveal program">
          <Heading eyebrow="Order of the night" title="The Program" ar="برنامج الليلة" />
          <div className="start-end">
            <div><small>Starts · تبدأ</small><b className="foil">{W.startTime}</b></div>
            <span className="se-line" />
            <div><small>Ends · تنتهي</small><b className="foil">{W.endTime}</b></div>
          </div>
          <Timeline items={W.schedule} />
        </section>

        {/* COUNTDOWN */}
        <section className="reveal">
          <Heading eyebrow="Until we say “I do”" title="Counting Down" ar="باقي على الفرح" />
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
            <a className="map-frame no-rose" href={W.mapsUrl} target="_blank" rel="noopener noreferrer" aria-label="Open in Google Maps">
              <iframe title="map" src={W.mapsEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" tabIndex={-1} />
            </a>
            <a className="btn" href={W.mapsUrl} target="_blank" rel="noopener noreferrer">
              <span>Open in Maps · افتح الخريطة</span>
            </a>
            <Divider />
            <p className="card-kicker">Dress code</p>
            <p className="dress"><span className="foil-dark">{W.dressCode}</span> · <span className="ar">{W.dressCodeAr}</span></p>
            <div className="swatches" aria-hidden="true">
              {['#f6c1cf', '#c9e4f6', '#d8f0c8', '#fbe39a', '#d9c8f5', '#ffcfa8'].map((c, i) => <i key={i} style={{ background: c, '--i': i }} />)}
            </div>
          </Tilt>
        </section>

        {/* RSVP */}
        <section className="reveal">
          <Heading eyebrow="Will you join us?" title="RSVP" ar="أكّد حضورك" />
          <Tilt className="card rsvp-card no-rose">
            <Rsvp />
          </Tilt>
        </section>

        {/* CALENDAR */}
        <section className="reveal short">
          <Heading eyebrow="Don't forget us" title="Add to Calendar" ar="ضيفها لتقويمك" />
          <div className="btn-row">
            <a className="btn ghost" href={gcal()} target="_blank" rel="noreferrer"><span>Google Calendar</span></a>
            <button className="btn ghost" onClick={downloadIcs}><span>Apple / Outlook</span></button>
          </div>
          <p className="tip">🌹 جرّب زرار الوردة تحت… وغيّر لون الورد بنفسك</p>
        </section>

        {/* FOOTER */}
        <footer className="reveal footer">
          <div className="footer-photo"><img src={W.photo} alt="" loading="lazy" /></div>
          <p className="footer-ar">وجودكم هو أجمل هدية</p>
          <p className="footer-en">Your presence is our greatest gift</p>
          <Monogram size={90} className="footer-mono" />
          <p className="sign foil">{W.groom} &amp; {W.bride}</p>
          <p className="sign-date">26 · 12 · 2026</p>
        </footer>
      </main>
    </>
  )
}
