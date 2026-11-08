import { ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { hideShell } from '../lib/shell'
import { Link } from 'react-router-dom'
import obsidian from '../assets/slider/obsidian.webp'
import obsidianClosed from '../assets/slider/obsidian-closed.webp'
import obsidianMobile from '../assets/slider/obsidian-mobile.webp'
import obsidianMobileSm from '../assets/slider/obsidian-mobile-740.webp'
import obsidianSm from '../assets/slider/obsidian-945.webp'
import dynastySm from '../assets/slider/dynasty-945.webp'
import finderSm from '../assets/slider/finder-945.webp'
import finderMobileSm from '../assets/slider/finder-mobile-740.webp'
import dynasty from '../assets/slider/dynasty.webp'
import dynastyClosed from '../assets/slider/dynasty-closed.webp'
import finder from '../assets/slider/finder.webp'
import finderClosed from '../assets/slider/finder-closed.webp'
import finderMobile from '../assets/slider/finder-mobile.webp'
import { HERO_SLIDER, type HeroSlide } from '../config'
import { haptic } from '../lib/fx'

// Two sizes of each picture: the browser takes the one the screen needs.
const pair = (small: string, small_w: number, large: string, large_w: number) => `${small} ${small_w}w, ${large} ${large_w}w`

const slide = (
  [image, closed, mobile, srcset, mobileSrcset]: [string, string, string, string, string],
  position: string,
  eyebrow: string,
  title: string,
  text: string,
  button: string,
  link: string,
): HeroSlide & { position: string } => ({
  image,
  closed,
  position,
  srcset,
  mobile,
  mobileSrcset,
  eyebrow,
  title,
  text,
  button,
  link,
})

/** Shown until slides are filled in the dashboard. */
const BUILT_IN: (HeroSlide & { position?: string })[] = [
  slide([obsidianSm, obsidianClosed, obsidianMobileSm, pair(obsidianSm, 945, obsidian, 1890), pair(obsidianMobileSm, 740, obsidianMobile, 1074)], '62% 50%', 'New season', 'The Oud Edit', 'Deep, warm and unforgettable — our richest scents for the cold nights.', 'Shop the edit', '/shop?family=oriental'),
  slide([dynastySm, dynastyClosed, '', pair(dynastySm, 945, dynasty, 1890), ''], '62% 50%', 'Limited offer', 'Spend more, save more', 'Free shipping over 1,200 EGP · 20% off + free shipping over 2,500 EGP.', 'Start shopping', '/shop'),
  slide([finderSm, finderClosed, finderMobileSm, pair(finderSm, 945, finder, 1890), pair(finderMobileSm, 740, finderMobile, 1074)], '62% 50%', 'Rfaheya Finder', 'Find your scent', 'Answer a few questions and meet the fragrance that feels like you.', 'Take the quiz', '/finder'),
]

/** The dashboard's slides (those with a picture or a title); a slide without a picture borrows a built-in one. */
export function heroSlides(): (HeroSlide & { position?: string })[] {
  const filled = HERO_SLIDER.slides.filter((s) => s.image || s.title.trim())
  if (filled.length === 0) return BUILT_IN
  return filled.map((s, i) => {
    const own = BUILT_IN[i % BUILT_IN.length]
    return s.image ? s : { ...s, image: own.image, srcset: own.srcset, closed: s.closed || own.closed, mobile: s.mobile || own.mobile, mobileSrcset: s.mobile ? s.mobileSrcset : own.mobileSrcset }
  })
}

/**
 * Home hero: picture slides side by side like an accordion. The open one shows its picture
 * and text; the others are narrow with their title. Opens the next one on its own
 * (paused while the pointer is over it); a tap opens any of them.
 */
export function HeroSlider() {
  const slides = heroSlides()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = slides.length
  const first = useRef<HTMLImageElement>(null)

  // The first picture is on screen: the page drawn by index.html can go.
  useEffect(() => {
    const img = first.current
    if (!img || img.complete) return hideShell()
    img.addEventListener('load', hideShell, { once: true })
    img.addEventListener('error', hideShell, { once: true })
    const t = window.setTimeout(hideShell, 2500)
    return () => {
      window.clearTimeout(t)
      img.removeEventListener('load', hideShell)
      img.removeEventListener('error', hideShell)
    }
  }, [])

  useEffect(() => {
    if (count < 2 || paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = window.setTimeout(() => setIndex((i) => (i + 1) % count), HERO_SLIDER.interval * 1000)
    return () => window.clearTimeout(t)
  }, [index, paused, count])

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      className="rf-acc container-x pt-2 lg:pt-3"
      style={{ '--rf-slide': `${HERO_SLIDER.interval}s` } as CSSProperties}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') setIndex((i) => (i + 1) % count)
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') setIndex((i) => (i - 1 + count) % count)
      }}
    >
      <ul className="rf-acc-list">
        {slides.map((s, i) => {
          const on = i === index
          const external = /^https?:\/\//.test(s.link)
          return (
            <li key={i} className="rf-acc-panel" data-on={on || undefined} aria-roledescription="slide" aria-label={`${i + 1} of ${count}`}>
              <picture>
                {s.mobile && <source media="(max-width: 767px)" srcSet={s.mobileSrcset || s.mobile} sizes="100vw" />}
                <img
                  ref={i === 0 ? first : undefined}
                  src={s.image}
                  srcSet={s.srcset || undefined}
                  sizes="(min-width: 1024px) 66vw, 100vw"
                  alt=""
                  width={2000}
                  height={1100}
                  fetchPriority={i === 0 ? 'high' : 'low'}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  className="rf-acc-img"
                  style={s.position ? { objectPosition: s.position } : undefined}
                />
              </picture>
              {/* Its own narrow picture while closed (computers) */}
              {s.closed && <img src={s.closed} alt="" width={170} height={780} loading="lazy" className="rf-acc-closed" />}
              <span aria-hidden className="rf-acc-shade" />
              <span aria-hidden className="rf-acc-no">{String(i + 1).padStart(2, '0')}</span>
              {/* Closed: the whole panel opens it */}
              {!on && (
                <button
                  type="button"
                  className="rf-acc-open"
                  onClick={() => {
                    haptic(8)
                    setIndex(i)
                  }}
                >
                  <span className="rf-acc-vt">{s.title || s.eyebrow}</span>
                  <span className="sr-only">Show slide {i + 1}</span>
                </button>
              )}
              <div className="rf-acc-copy" aria-hidden={!on}>
                {s.eyebrow && <p className="rf-acc-eb">{s.eyebrow}</p>}
                {s.title && (i === 0 ? <h1 className="rf-acc-title">{s.title}</h1> : <h2 className="rf-acc-title">{s.title}</h2>)}
                {s.text && <p className="rf-acc-text">{s.text}</p>}
                {s.button && s.link && (
                  <div className="rf-acc-cta">
                    {external ? (
                      <a href={s.link} tabIndex={on ? undefined : -1} className="rf-acc-btn">
                        {s.button}
                        <ArrowRight className="size-4" strokeWidth={1.6} />
                      </a>
                    ) : (
                      <Link to={s.link} tabIndex={on ? undefined : -1} className="rf-acc-btn rf-magnetic">
                        {s.button}
                        <ArrowRight className="size-4" strokeWidth={1.6} />
                      </Link>
                    )}
                  </div>
                )}
              </div>
              {on && count > 1 && !paused && <span key={index} aria-hidden className="rf-acc-progress" />}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
