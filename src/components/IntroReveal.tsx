import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { heroSlides } from './HeroSlider'

type Phase = 'enter' | 'words' | 'frame' | 'full' | 'leave' | 'done'

const SEEN = 'rfaheya.introSeen'

/** Once per visit, on the home page, unless the visitor prefers less motion. */
function shouldPlay(path: string) {
  if (path !== '/') return false
  try {
    if (sessionStorage.getItem(SEEN)) return false
    sessionStorage.setItem(SEEN, '1')
  } catch {
    // no storage (private mode): play it
  }
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * The store's opening: “Speak your scent” large on cream; a small rounded frame opens
 * between the words with the first slider picture, then grows until the picture fills
 * the screen, and the store shows behind it. A tap or a key skips it.
 */
export function IntroReveal() {
  const { pathname } = useLocation()
  const [phase, setPhase] = useState<Phase>(() => (shouldPlay(pathname) ? 'enter' : 'done'))
  const slide = heroSlides()[0]
  const phone = typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches
  const image = (phone && slide?.mobile) || slide?.image

  useEffect(() => {
    if (phase === 'done') return
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'enter') return
    // Wait for the picture (at most a moment) so the frame never opens empty.
    let started = false
    const timers: number[] = []
    const start = () => {
      if (started) return
      started = true
      timers.push(
        window.setTimeout(() => setPhase('words'), 60),
        window.setTimeout(() => setPhase('frame'), 650),
        window.setTimeout(() => setPhase('full'), 2050),
        window.setTimeout(() => setPhase('leave'), 3050),
        window.setTimeout(() => setPhase('done'), 3650),
      )
    }
    const img = new Image()
    img.onload = start
    img.onerror = start
    if (image) img.src = image
    else start()
    timers.push(window.setTimeout(start, 900))
    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (phase === 'done' || phase === 'leave') return
    const skip = () => {
      setPhase('leave')
      window.setTimeout(() => setPhase('done'), 600)
    }
    window.addEventListener('keydown', skip)
    return () => window.removeEventListener('keydown', skip)
  }, [phase])

  if (phase === 'done') return null

  const open = phase === 'frame' || phase === 'full' || phase === 'leave'
  const full = phase === 'full' || phase === 'leave'
  const shown = phase !== 'enter'
  const ease = 'cubic-bezier(0.76, 0, 0.24, 1)'

  return createPortal(
    <div
      aria-hidden
      onClick={() => {
        setPhase('leave')
        window.setTimeout(() => setPhase('done'), 600)
      }}
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-sand"
      style={{ opacity: phase === 'leave' ? 0 : 1, transition: 'opacity 0.6s ease' }}
    >
      <div
        className="flex items-center justify-center font-serif leading-none whitespace-nowrap text-ink"
        style={{
          fontSize: phone ? '10.5vw' : 'clamp(54px, 10vw, 168px)',
          // The words drift a little while the frame is open, as in a slow pan.
          transform: phase === 'frame' ? 'translateX(-2vw)' : 'none',
          transition: `transform 1.6s ${ease}`,
        }}
      >
        <span
          style={{
            opacity: shown ? 1 : 0,
            transform: shown ? 'none' : 'translateY(28px)',
            transition: `opacity 0.7s ease, transform 0.9s ${ease}`,
          }}
        >
          Speak
        </span>
        <span
          className="relative mx-[0.12em] block shrink-0 overflow-hidden bg-[#1c120b]"
          style={{
            width: full ? '100vw' : open ? (phone ? '24vw' : '22vw') : '0px',
            height: full ? '100vh' : phone ? '17vh' : '30vh',
            // Hidden until it opens (no thin line between the words).
            opacity: open ? 1 : 0,
            marginInline: full ? 0 : undefined,
            borderRadius: full ? 0 : phone ? 14 : 26,
            transition: `width ${full ? 1 : 0.9}s ${ease}, height 1s ${ease}, border-radius 1s ${ease}, margin 1s ${ease}, opacity 0.2s ease`,
          }}
        >
          {image && (
            <img
              src={image}
              alt=""
              className="absolute inset-0 size-full object-cover"
              style={{
                objectPosition: slide?.position ?? 'center',
                transform: full ? 'scale(1)' : 'scale(1.35)',
                transition: `transform 1.4s ${ease}`,
              }}
            />
          )}
        </span>
        <span
          style={{
            opacity: shown ? 1 : 0,
            transform: shown ? 'none' : 'translateY(28px)',
            transition: `opacity 0.7s 0.08s ease, transform 0.9s 0.08s ${ease}`,
          }}
        >
          your <span className="text-gold italic">scent</span>
        </span>
      </div>
    </div>,
    document.body,
  )
}
