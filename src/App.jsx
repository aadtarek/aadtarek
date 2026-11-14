import { useEffect, useRef, useState } from 'react'
import { WEDDING as W } from './config'
import Scene3D from './components/Scene3D.jsx'
import IntroScene from './components/IntroScene.jsx'
import Countdown from './components/Countdown.jsx'
import LineFlower from './components/LineFlower.jsx'
import Monogram from './components/Monogram.jsx'
import Sparkles from './components/Sparkles.jsx'
import Studio from './components/Studio.jsx'
import Scratch from './components/Scratch.jsx'
import Timeline from './components/Timeline.jsx'
import Card3D from './components/Card3D.jsx'
import Celebrate from './components/Celebrate.jsx'
import { useMusicBox } from './components/MusicBox.jsx'
import SplitText from './components/SplitText.jsx'
import ScrollFx from './components/ScrollFx.jsx'
import Marquee from './components/Marquee.jsx'

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

const Heading = ({ eyebrow, title, sub }) => (
  <>
    <p className="eyebrow">{eyebrow}</p>
    <SplitText as="h2" className="title" text={title} />
    <p className="title-sub">{sub}</p>
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
    setTimeout(() => setOpened(true), 4200)
    setTimeout(() => setBurst((b) => b + 1), 4500)
  }

  return (
    <>
      <div className="bg-velvet" />
      <div className="bg-blobs" aria-hidden="true"><i /><i /><i /></div>
      <Scene3D settings={settings} burst={burst} />
      <div className="vignette" />
      <Sparkles />
      <Celebrate />
      {opened && <ScrollFx />}
      <IntroScene onOpen={open} />

      <div className={`controls ${opened ? 'show' : ''}`}>
        <button className={`ctl music-pill ${music.playing ? 'playing' : ''}`} onClick={music.toggle} aria-label="Toggle music">
          {music.playing ? Icon.note : Icon.mute}
          <span className="eq" aria-hidden="true"><i /><i /><i /></span>
          <span className="ctl-label">{music.playing ? 'Music on' : 'Play music'}</span>
        </button>
      </div>
      <Studio show={opened} settings={settings} setSettings={setSettings} onRain={() => setBurst((b) => b + 1)} />

      <main className={`page ${opened ? 'opened' : ''}`}>
        {/* HERO */}
        <section className="hero">
          <div data-speed="-0.15"><Monogram size={112} className="hero-mono" /></div>
          <div className="bism-wrap">
            <span className="bism-orn" />
            <p className="bism">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
            <span className="bism-orn r" />
          </div>
          <p className="kicker">Together with their families</p>
          <h1 className="names">
            <SplitText className="name" text={W.groom} delay={0.7} step={0.08} />
            <span className="amp">&amp;</span>
            <SplitText className="name" text={W.bride} delay={1.1} step={0.08} />
          </h1>
          <div className="hero-date">
            <span>{W.dayName}</span><b>26 · 12 · 2026</b><span>Cairo</span>
          </div>
          <div className="scroll-hint"><span /></div>
        </section>

        <Marquee items={[`${W.groom} & ${W.bride}`, '26 · 12 · 2026', 'Forever starts here', W.venue]} />

        {/* COUPLE PHOTO */}
        <section className="reveal photo-section">
          <p className="eyebrow">Two hearts · One love</p>
          <Tilt className="arch" >
            <div className="arch-inner">
              <img data-speed="0.06" src={W.photo} alt={`${W.groom} & ${W.bride}`} loading="lazy" />
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
          <p className="photo-sub">Two souls, one beautiful story</p>
        </section>

        {/* INVITATION — 3D card */}
        <section className="reveal">
          <Card3D className="invite">
            <LineFlower className="card-flower left z4" size={74} />
            <LineFlower className="card-flower right z4" size={74} />
            <p className="card-kicker z1">With joyful hearts</p>
            <Monogram size={84} className="z3 card-mono" />
            <p className="invite-line z2">You are cordially invited to celebrate the wedding of</p>
            <p className="invite-names foil z4">{W.groom} &amp; {W.bride}</p>
            {(W.groomParents || W.brideParents) && (
              <div className="families z2">
                <div><small>Son of</small><b>{W.groomParents}</b></div>
                <div className="fam-amp">&amp;</div>
                <div><small>Daughter of</small><b>{W.brideParents}</b></div>
              </div>
            )}
            <div className="z1"><Divider /></div>
            <p className="en z2">
              as we celebrate our love and begin our forever together.
            </p>
            <p className="invite-date z3"><span>{W.dayName}</span><b>26 · 12 · 2026</b><span>{W.startTime}</span></p>
          </Card3D>
        </section>

        {/* SCRATCH DATE */}
        <section className="reveal">
          <Heading eyebrow="A little surprise" title="Save the Date" sub="Scratch the gold to reveal" />
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
          <Heading eyebrow="Order of the night" title="The Program" sub="An evening to remember" />
          <div className="start-end">
            <div><small>Starts</small><b className="foil">{W.startTime}</b></div>
            <span className="se-line" />
            <div><small>Ends</small><b className="foil">{W.endTime}</b></div>
          </div>
          <Timeline items={W.schedule} />
        </section>

        {/* COUNTDOWN */}
        <section className="reveal">
          <Heading eyebrow="Until we say “I do”" title="Counting Down" sub="The big day is almost here" />
          <Countdown target={W.date} />
          <p className="cute heart-line"><span className="beat">♥</span> and every second brings us closer</p>
        </section>

        {/* VENUE — 3D card */}
        <section className="reveal">
          <Card3D className="venue">
            <div className="pin z4"><span className="pin-dot" /><span className="pin-wave" /><span className="pin-wave w2" /></div>
            <p className="card-kicker z1">The celebration will be held at</p>
            <p className="venue-name foil z3">{W.venue}</p>
            <p className="venue-area z2">{W.area}</p>
            <a className="map-frame no-rose z2" href={W.mapsUrl} target="_blank" rel="noopener noreferrer" aria-label="Open in Google Maps">
              <iframe title="map" src={W.mapsEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" tabIndex={-1} />
            </a>
            <a className="btn z3" href={W.mapsUrl} target="_blank" rel="noopener noreferrer">
              <span>Open in Maps</span>
            </a>
            <div className="z1"><Divider /></div>
            <p className="card-kicker z1">Dress code</p>
            <p className="dress z3"><span className="foil-dark">{W.dressCode}</span></p>
            <div className="swatches z4" aria-hidden="true">
              {['#f6c1cf', '#c9e4f6', '#d8f0c8', '#fbe39a', '#d9c8f5', '#ffcfa8'].map((c, i) => <i key={i} style={{ background: c, '--i': i }} />)}
            </div>
          </Card3D>
        </section>

        {/* CALENDAR */}
        <section className="reveal short">
          <Heading eyebrow="Don't forget us" title="Add to Calendar" sub="Save the night in your phone" />
          <div className="btn-row">
            <a className="btn ghost" href={gcal()} target="_blank" rel="noreferrer"><span>Google Calendar</span></a>
            <button className="btn ghost" onClick={downloadIcs}><span>Apple / Outlook</span></button>
          </div>
          <p className="tip">🌹 Tap the rose button below to style the flowers yourself</p>
        </section>

        <Marquee reverse items={['Save the date', '26 · 12 · 2026', `${W.groom} & ${W.bride}`, 'See you there']} />

        {/* FOOTER */}
        <footer className="reveal footer">
          <div className="footer-photo"><img src={W.photo} alt="" loading="lazy" /></div>
          <p className="footer-big">With love</p>
          <p className="footer-en">Your presence is our greatest gift</p>
          <Monogram size={90} className="footer-mono" />
          <SplitText as="p" className="sign" text={`${W.groom} & ${W.bride}`} step={0.06} />
          <p className="sign-date">26 · 12 · 2026</p>
        </footer>
      </main>
    </>
  )
}
