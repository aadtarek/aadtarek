import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, ShoppingBag, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fullSizeVariations, getAllProducts } from '../api/catalog'
import logo from '../assets/logo.svg'
import marble from '../assets/vitrine/marble.webp'
import { FREE_SHIPPING, FREE_SHIPPING_GOVERNORATES, HOME, VITRINE } from '../config'
import { formatPrice } from '../lib/format'
import { flyToCart } from '../lib/fx'
import { useOwnLogo } from '../lib/ownLogo'
import { usePageTitle } from '../lib/usePageTitle'
import { useCart } from '../store/cart'
import type { Product } from '../types'
import { characterProducts, resolveCharacters, type Character } from '../vitrine/characters'
import { VitrineEngine, webglAvailable, type ShowcaseItem } from '../vitrine/engine'
import './vitrine.css'

/**
 * The Vitrine: a full-screen 3D experience (no site header, footer or tab bar). Every fragrance
 * with a showcase bottle (Products → Rfaheya details → Showcase bottle) stands in its own lit
 * marble niche in a wall seen through wet glass. Scroll or swipe along the wall, point or tilt
 * to lean, click or tap a bottle to light it and step in: notes, sizes and add to bag.
 */
export function Vitrine() {
  usePageTitle('The Vitrine — Rfaheya')
  const products = useMemo(() => getAllProducts().filter((p) => p.showcaseImage), [])
  const phone = usePhone()

  // The page owns the whole screen while it is open.
  useEffect(() => {
    const html = document.documentElement
    const before = html.style.overflow
    html.style.overflow = 'hidden'
    return () => {
      html.style.overflow = before
    }
  }, [])

  if (!products.length || !webglAvailable()) return <Fallback products={products} />
  return <Experience key={phone ? 'phone' : 'desk'} products={products} phone={phone} />
}

function usePhone() {
  const q = '(max-width: 767px)'
  const [phone, setPhone] = useState(() => window.matchMedia(q).matches)
  useEffect(() => {
    const m = window.matchMedia(q)
    const on = () => setPhone(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return phone
}

const lowest = (p: Product) => {
  const prices = fullSizeVariations(p).map((v) => v.price)
  return prices.length ? Math.min(...prices) : 0
}

function BrandMark({ className = '' }: { className?: string }) {
  const own = useOwnLogo()
  return <img src={HOME.logo ? own.src : logo} alt="Rfaheya" className={`vx-logo ${className}`} draggable={false} />
}

/** The characters' stage first (when there are characters), then the chosen one's wall of bottles. */
function Experience({ products, phone }: { products: Product[]; phone: boolean }) {
  const characters = useMemo(
    () => resolveCharacters(VITRINE.characters).map((c) => ({ c, bottles: characterProducts(c, products) })).filter((x) => x.bottles.length),
    [products],
  )
  const [chosen, setChosen] = useState<number | null>(null)
  const [last, setLast] = useState(0) // the stage comes back facing the last character
  if (!characters.length) return <Wall products={products} phone={phone} />
  if (chosen === null)
    return (
      <CharacterStage
        characters={characters.map((x) => x.c)}
        counts={characters.map((x) => x.bottles.length)}
        start={last}
        phone={phone}
        onChoose={(i) => {
          setLast(i)
          setChosen(i)
        }}
      />
    )
  const { c, bottles } = characters[chosen]
  return <Wall key={c.id} products={bottles} phone={phone} character={c} onBack={() => setChosen(null)} />
}

/* ---------------------------------------------------------------- the characters' stage */

/** A stand-in until the dashboard has the character's photo. */
function Silhouette() {
  return (
    <svg viewBox="0 0 120 300" className="vx-person-img vx-person-ghost" aria-hidden>
      <defs>
        <linearGradient id="vx-ghost" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0c27a" stopOpacity=".55" />
          <stop offset="1" stopColor="#e49b2d" stopOpacity=".08" />
        </linearGradient>
      </defs>
      <path
        fill="url(#vx-ghost)"
        d="M60 8c11 0 19 9 19 21s-8 22-19 22-19-10-19-22S49 8 60 8Zm-24 50h48c10 0 17 7 18 17l6 78c1 6-3 10-8 10s-8-3-9-8l-5-55v198c0 7-5 11-11 11s-10-4-11-11l-3-110h-2l-3 110c-1 7-5 11-11 11s-11-4-11-11V100l-5 55c-1 5-4 8-9 8s-9-4-8-10l6-78c1-10 8-17 18-17Z"
      />
    </svg>
  )
}

/**
 * The characters standing on an open, dark stage along a curve: scroll, drag, swipe or use the
 * arrows to turn the curve; the one in the middle steps into the light. Tap it to open its wall.
 */
function CharacterStage({
  characters,
  counts,
  start,
  phone,
  onChoose,
}: {
  characters: Character[]
  counts: number[]
  start: number
  phone: boolean
  onChoose: (i: number) => void
}) {
  const navigate = useNavigate()
  const cart = useCart()
  const n = characters.length
  const ring = useRef<HTMLDivElement>(null)
  const pos = useRef(start) // where the curve stands (float)
  const target = useRef(start)
  const [active, setActive] = useState(start)
  const [leaving, setLeaving] = useState<number | null>(null)
  const [shown, setShown] = useState(false)
  const lean = useRef({ x: 0, y: 0, tx: 0, ty: 0 })
  const clamp = (v: number) => Math.max(0, Math.min(n - 1, v))

  useEffect(() => {
    const id = window.setTimeout(() => setShown(true), 60)
    return () => window.clearTimeout(id)
  }, [])

  // One frame loop places every character in 3D from the curve's position.
  useEffect(() => {
    let raf = 0
    let prev = performance.now()
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000)
      prev = now
      pos.current += (target.current - pos.current) * (still ? 1 : Math.min(1, dt * 6.5))
      const l = lean.current
      l.x += (l.tx - l.x) * Math.min(1, dt * 3)
      l.y += (l.ty - l.y) * Math.min(1, dt * 3)
      const el = ring.current
      if (el) {
        el.style.transform = `rotateX(${l.y * -3}deg) rotateY(${l.x * 5}deg)`
        const gap = phone ? 0.62 : 0.3
        el.querySelectorAll<HTMLElement>('.vx-person').forEach((p, i) => {
          const d = i - pos.current
          const a = Math.abs(d)
          const x = Math.sign(d) * Math.min(a, 3.2) ** 0.82 * gap * 100
          const z = -Math.min(a, 4) * (phone ? 260 : 340)
          const ry = Math.max(-55, Math.min(55, -d * 24))
          p.style.transform = `translateX(-50%) translate3d(${x}vw, 0, ${z}px) rotateY(${ry}deg)`
          p.style.opacity = String(Math.max(0, 1 - Math.max(0, a - 2.2) * 0.8))
          p.style.zIndex = String(100 - Math.round(a * 10))
          p.style.setProperty('--lit', String(Math.max(0, 1 - a * 0.85)))
        })
      }
      const near = Math.round(pos.current)
      setActive((o) => (o === near ? o : near))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phone])

  const go = (i: number) => (target.current = clamp(i))
  const enter = (i: number) => {
    if (leaving !== null) return
    go(i)
    setLeaving(i)
    window.setTimeout(() => onChoose(i), 750)
  }

  // Wheel, keys, drag and swipe turn the curve.
  const wheelAcc = useRef(0)
  const snapTimer = useRef(0)
  const onWheel = (e: React.WheelEvent) => {
    wheelAcc.current += (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) / 420
    target.current = clamp(pos.current + wheelAcc.current)
    wheelAcc.current = 0
    window.clearTimeout(snapTimer.current)
    snapTimer.current = window.setTimeout(() => go(Math.round(target.current)), 140)
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(Math.round(target.current) + 1)
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go(Math.round(target.current) - 1)
      else if (e.key === 'Enter') enter(Math.round(target.current))
      else if (e.key === 'Escape') navigate(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n])
  const drag = useRef<{ x: number; from: number; moved: boolean; t: number; v: number; lx: number } | null>(null)
  const span = () => (window.innerWidth * (phone ? 0.62 : 0.3)) || 1
  const onDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, from: target.current, moved: false, t: performance.now(), v: 0, lx: e.clientX }
  }
  const onMove = (e: React.PointerEvent) => {
    if (!phone) {
      lean.current.tx = (e.clientX / window.innerWidth) * 2 - 1
      lean.current.ty = (e.clientY / window.innerHeight) * 2 - 1
    }
    const d = drag.current
    if (!d) return
    if (Math.abs(e.clientX - d.x) > 6) d.moved = true
    if (!d.moved) return
    const now = performance.now()
    d.v = (e.clientX - d.lx) / Math.max(1, now - d.t)
    d.t = now
    d.lx = e.clientX
    target.current = clamp(d.from - (e.clientX - d.x) / span())
  }
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current
    drag.current = null
    if (!d) return
    if (d.moved) {
      go(Math.round(target.current - d.v * 2.2)) // a flick carries on
      return
    }
    // A tap: on a character steps to it (or into it, when it is the one in the light).
    const hit = (e.target as HTMLElement).closest<HTMLElement>('.vx-person')
    if (!hit) return
    const i = Number(hit.dataset.i)
    if (i === Math.round(pos.current)) enter(i)
    else go(i)
  }

  const c = characters[active]
  return (
    <div className={`vx vx-stage-mode is-in ${phone ? 'is-phone' : ''} ${shown ? 'is-shown' : ''} ${leaving !== null ? 'is-leaving' : ''}`}>
      <div className="vx-hall" onWheel={onWheel} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={() => (drag.current = null)}>
        <div className="vx-hall-light" aria-hidden />
        <div className="vx-hall-floor" aria-hidden />
        <div className="vx-hall-dust" aria-hidden>
          {Array.from({ length: 26 }, (_, i) => (
            <span key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${-(i * 1.7) % 14}s`, animationDuration: `${11 + (i % 7) * 2}s` }} />
          ))}
        </div>
        <div className="vx-ring" ref={ring}>
          {characters.map((ch, i) => (
            <figure key={ch.id} className={`vx-person ${i === active ? 'is-active' : ''}`} data-i={i}>
              <div className="vx-person-spot" aria-hidden />
              <div className="vx-person-body">
                {ch.image ? <img src={ch.image} alt={ch.name} className="vx-person-img" draggable={false} loading={Math.abs(i - start) < 3 ? 'eager' : 'lazy'} /> : <Silhouette />}
                {ch.image && <img src={ch.image} alt="" aria-hidden className="vx-person-img vx-person-mirror" draggable={false} />}
              </div>
              <div className="vx-person-ground" aria-hidden />
            </figure>
          ))}
        </div>
      </div>

      <header className="vx-top">
        <button type="button" className="vx-brand" onClick={() => navigate('/')} aria-label="Leave The Vitrine — Rfaheya home">
          <BrandMark />
        </button>
        <p className="vx-name">
          <span>The</span> Vitrine
        </p>
        <div className="vx-actions">
          <button type="button" className="vx-icon" onClick={cart.open} aria-label={`Bag, ${cart.count} items`}>
            <ShoppingBag className="size-[18px]" strokeWidth={1.5} />
            {cart.count > 0 && <span className="vx-badge">{cart.count}</span>}
          </button>
          <button type="button" className="vx-icon" onClick={() => navigate(-1)} aria-label="Close">
            <X className="size-[18px]" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      <div className="vx-hall-title">
        <p className="vx-scene-eyebrow">Choose your character</p>
      </div>

      {c && (
        <div className="vx-hall-info" key={c.id}>
          <p className="vx-hall-no">
            {String(active + 1).padStart(2, '0')} <span>/ {String(n).padStart(2, '0')}</span>
          </p>
          <h1 className="vx-hall-name">{c.name}</h1>
          {c.tagline && <p className="vx-hall-line">{c.tagline}</p>}
          <button type="button" className="vx-look-btn vx-hall-go" onClick={() => enter(active)}>
            Explore {counts[active]} {counts[active] === 1 ? 'perfume' : 'perfumes'} <ArrowRight className="size-4" strokeWidth={1.8} />
          </button>
        </div>
      )}

      <button type="button" className="vx-hall-arrow is-prev" onClick={() => go(active - 1)} disabled={active === 0} aria-label="Previous character">
        <ChevronLeft className="size-6" strokeWidth={1.3} />
      </button>
      <button type="button" className="vx-hall-arrow is-next" onClick={() => go(active + 1)} disabled={active === n - 1} aria-label="Next character">
        <ChevronRight className="size-6" strokeWidth={1.3} />
      </button>
      <div className="vx-hall-dots" aria-hidden>
        {characters.map((ch, i) => (
          <span key={ch.id} className={i === active ? 'is-on' : ''} />
        ))}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- the wall */

/** The wall of lit niches: every fragrance (or a character's) in its own. */
function Wall({ products, phone, character, onBack }: { products: Product[]; phone: boolean; character?: Character; onBack?: () => void }) {
  const navigate = useNavigate()
  const cart = useCart()
  const canvas = useRef<HTMLCanvasElement>(null)
  const engine = useRef<VitrineEngine | null>(null)
  const [progress, setProgress] = useState(0)
  const [ready, setReady] = useState(false)
  const [entered, setEntered] = useState(false)
  const [focus, setFocusState] = useState<number | null>(null)
  const [hover, setHover] = useState<number | null>(null)
  const [scroll, setScroll] = useState(0)
  const [look, setLook] = useState(false) // the "shop the look" panel
  const focusRef = useRef<number | null>(null)
  const wall = products
  const back = onBack ?? (() => navigate(-1))

  const setFocus = (i: number | null) => {
    focusRef.current = i
    setFocusState(i)
    engine.current?.setFocus(i)
  }

  useEffect(() => {
    const el = canvas.current
    if (!el) return
    const items: ShowcaseItem[] = products.map((p) => ({ image: p.showcaseImage!, name: p.name, price: formatPrice(lowest(p)) }))
    const e = new VitrineEngine(el, items, phone, marble, {
      onProgress: setProgress,
      onReady: () => {
        setReady(true)
        window.setTimeout(() => setEntered(true), 900)
      },
      onHover: setHover,
      onScroll: (s) => setScroll((old) => (Math.abs(old - s) > 0.004 ? s : old)),
    })
    engine.current = e
    const ro = new ResizeObserver(() => e.resize())
    ro.observe(el.parentElement!)
    return () => {
      ro.disconnect()
      e.dispose()
      engine.current = null
    }
  }, [products, phone])

  const count = wall.length
  // Keys: arrows step through the bottles, Escape steps back out (bottle → wall → characters / leave).
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      const f = focusRef.current
      if (ev.key === 'Escape') {
        if (f !== null) setFocus(null)
        else back()
      } else if (f !== null && ev.key === 'ArrowRight') setFocus(Math.min(count - 1, f + 1))
      else if (f !== null && ev.key === 'ArrowLeft') setFocus(Math.max(0, f - 1))
      else if (f === null && (ev.key === 'ArrowDown' || ev.key === 'PageDown')) engine.current?.scrollBy(1.2)
      else if (f === null && (ev.key === 'ArrowUp' || ev.key === 'PageUp')) engine.current?.scrollBy(-1.2)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count])

  // The phone's tilt leans the view (iPhones ask once, on the first touch).
  useEffect(() => {
    if (!phone) return
    let base: number | null = null
    const onTilt = (ev: DeviceOrientationEvent) => {
      if (ev.gamma === null || ev.beta === null) return
      base ??= ev.beta
      engine.current?.setTilt(ev.gamma / 20, (ev.beta - base) / 22)
    }
    window.addEventListener('deviceorientation', onTilt)
    return () => window.removeEventListener('deviceorientation', onTilt)
  }, [phone])
  const asked = useRef(false)
  const askTilt = () => {
    if (asked.current) return
    asked.current = true
    const D = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
    D?.requestPermission?.().catch(() => undefined)
  }

  // Pointer: drag or wheel to move along the wall, click / tap to pick.
  const drag = useRef<{ x: number; y: number; last: number; t: number; v: number; moved: boolean } | null>(null)
  const ndc = (ev: { clientX: number; clientY: number }) => {
    const r = canvas.current!.getBoundingClientRect()
    return [((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1] as const
  }
  const unit = () => (phone ? 3.2 : 2.4) / (canvas.current?.clientHeight || 800)
  const onPointerDown = (ev: React.PointerEvent) => {
    if (phone) askTilt()
    drag.current = { x: ev.clientX, y: ev.clientY, last: ev.clientY, t: performance.now(), v: 0, moved: false }
  }
  const onPointerMove = (ev: React.PointerEvent) => {
    const [x, y] = ndc(ev)
    engine.current?.pointerAt(x, y)
    const d = drag.current
    if (!d) return
    if (Math.abs(ev.clientY - d.y) > 6 || Math.abs(ev.clientX - d.x) > 6) d.moved = true
    if (d.moved && focusRef.current === null) {
      const dy = ev.clientY - d.last
      const now = performance.now()
      d.v = dy / Math.max(1, now - d.t)
      d.t = now
      d.last = ev.clientY
      engine.current?.scrollBy(-dy * unit())
    }
  }
  const onPointerUp = (ev: React.PointerEvent) => {
    const d = drag.current
    drag.current = null
    if (!d) return
    if (d.moved) {
      const f = focusRef.current
      if (f === null) engine.current?.scrollBy(-d.v * 260 * unit()) // a flick keeps going
      else if (Math.abs(ev.clientX - d.x) > 50) setFocus(Math.max(0, Math.min(wall.length - 1, f + (ev.clientX < d.x ? 1 : -1)))) // swipe to the next bottle
      return
    }
    const [x, y] = ndc(ev)
    const i = engine.current?.pick(x, y) ?? null
    // A tap on a bottle steps in; a second tap on it (or a tap beside it) steps back out.
    if (i !== null && i !== focusRef.current) setFocus(i)
    else if (focusRef.current !== null) setFocus(null)
  }

  const f = focus
  return (
    <div className={`vx ${phone ? 'is-phone' : ''} ${f !== null ? 'is-focus' : ''} ${entered ? 'is-in' : ''} ${character ? 'has-look' : ''}`}>
      <div
        className={`vx-stage ${hover !== null ? 'is-pointing' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={() => engine.current?.pointerAt(null)}
        onWheel={(ev) => f === null && engine.current?.scrollBy(ev.deltaY * 0.0021)}
      >
        <canvas ref={canvas} className="vx-canvas" />
      </div>

      {/* The heads-up layer */}
      <header className="vx-top">
        <button type="button" className="vx-brand" onClick={() => navigate('/')} aria-label="Leave The Vitrine — Rfaheya home">
          <BrandMark />
        </button>
        <p className="vx-name">
          <span>The</span> Vitrine
        </p>
        <div className="vx-actions">
          <button type="button" className="vx-icon" onClick={cart.open} aria-label={`Bag, ${cart.count} items`}>
            <ShoppingBag className="size-[18px]" strokeWidth={1.5} />
            {cart.count > 0 && <span className="vx-badge">{cart.count}</span>}
          </button>
          <button type="button" className="vx-icon" onClick={() => (f !== null ? setFocus(null) : back())} aria-label={f !== null ? 'Back to the wall' : character ? 'Back to the characters' : 'Close'}>
            <X className="size-[18px]" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {character && f === null && (
        <div className="vx-scene-title">
          <button type="button" className="vx-back" onClick={back}>
            <ArrowLeft className="size-4" strokeWidth={1.6} /> Characters
          </button>
          <p className="vx-scene-name">{character.name}</p>
          {character.tagline && <p className="vx-scene-line">{character.tagline}</p>}
        </div>
      )}

      {f === null && (
        <>
          <div className="vx-rail" aria-hidden>
            <span style={{ transform: `translateY(${scroll * 100 * 4}%)` }} />
          </div>
          {!phone && hover !== null && wall[hover] && (
            <p className="vx-tip" key={hover}>
              {wall[hover].name} <span>{formatPrice(lowest(wall[hover]))}</span>
            </p>
          )}
          {character && ready && (
            <button type="button" className="vx-look-btn" onClick={() => setLook(true)}>
              <ShoppingBag className="size-4" strokeWidth={1.6} /> Shop the look · {wall.length}
            </button>
          )}
        </>
      )}

      {f !== null && wall[f] && (
        <>
          <div className={`vx-steps ${phone ? 'is-in-card' : ''}`}>
            <button type="button" onClick={() => setFocus(Math.max(0, f - 1))} disabled={f === 0} aria-label="Previous bottle">
              <ChevronLeft className="size-5" strokeWidth={1.4} />
            </button>
            <span>
              {String(f + 1).padStart(2, '0')} / {String(wall.length).padStart(2, '0')}
            </span>
            <button type="button" onClick={() => setFocus(Math.min(wall.length - 1, f + 1))} disabled={f === wall.length - 1} aria-label="Next bottle">
              <ChevronRight className="size-5" strokeWidth={1.4} />
            </button>
          </div>
          <InfoCard key={wall[f].id} product={wall[f]} number={f + 1} onBack={() => setFocus(null)} phone={phone} />
        </>
      )}

      {look && character && <LookPanel name={character.name} products={wall} phone={phone} onClose={() => setLook(false)} />}

      {/* Loading, then the lights come on */}
      <div className={`vx-load ${ready ? 'is-done' : ''}`} aria-hidden={ready}>
        <BrandMark className="vx-load-logo" />
        <p className="vx-load-name">{character ? character.name : 'The Vitrine'}</p>
        <div className="vx-load-bar">
          <span style={{ transform: `scaleX(${Math.max(0.04, progress)})` }} />
        </div>
        <p className="vx-load-pct">{Math.round(progress * 100)}%</p>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- shop the look */

/** A character's bottles in one list: all of them in one go, or only the ones (and sizes) wanted. */
function LookPanel({ name, products, phone, onClose }: { name: string; products: Product[]; phone: boolean; onClose: () => void }) {
  const cart = useCart()
  const [picked, setPicked] = useState<Record<number, number | null>>(() =>
    Object.fromEntries(products.map((p) => [p.id, (fullSizeVariations(p).find((v) => v.inStock) ?? null)?.id ?? null])),
  )
  const [off, setOff] = useState<Set<number>>(new Set())
  const chosen = products.filter((p) => !off.has(p.id) && picked[p.id])
  const total = chosen.reduce((n, p) => n + (fullSizeVariations(p).find((v) => v.id === picked[p.id])?.price ?? 0), 0)
  const toggle = (id: number) =>
    setOff((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  const addAll = (list: Product[]) => {
    const lines = list.filter((p) => picked[p.id]).map((p) => ({ productId: p.id, variationId: picked[p.id]!, quantity: 1 }))
    if (!lines.length) return
    cart.addMany(lines)
    onClose()
  }
  return (
    <div className="vx-look" role="dialog" aria-modal="true" aria-label={`Shop the look: ${name}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <aside className={`vx-look-panel ${phone ? 'is-phone' : ''}`}>
        <div className="vx-look-head">
          <div>
            <p className="vx-card-no">Shop the look</p>
            <h2 className="vx-card-name">{name}</h2>
          </div>
          <button type="button" className="vx-icon" onClick={onClose} aria-label="Close">
            <X className="size-[18px]" strokeWidth={1.5} />
          </button>
        </div>
        <ul className="vx-look-list">
          {products.map((p) => {
            const sizes = fullSizeVariations(p)
            const on = !off.has(p.id) && !!picked[p.id]
            return (
              <li key={p.id} className={on ? 'is-on' : ''}>
                <button type="button" className="vx-look-check" role="checkbox" aria-checked={on} onClick={() => toggle(p.id)} aria-label={`${on ? 'Remove' : 'Add'} ${p.name}`}>
                  {on && <Check className="size-3.5" strokeWidth={2.4} />}
                </button>
                <img src={p.showcaseImage} alt="" />
                <div className="vx-look-info">
                  <p className="vx-look-name">{p.name}</p>
                  <div className="vx-look-sizes">
                    {sizes.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        disabled={!v.inStock}
                        className={picked[p.id] === v.id ? 'is-on' : ''}
                        onClick={() => {
                          setPicked((s) => ({ ...s, [p.id]: v.id }))
                          setOff((s) => {
                            const n = new Set(s)
                            n.delete(p.id)
                            return n
                          })
                        }}
                      >
                        {v.size.replace(/\s*ML$/i, ' ml')}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="vx-look-price">{formatPrice(sizes.find((v) => v.id === picked[p.id])?.price ?? lowest(p))}</p>
              </li>
            )
          })}
        </ul>
        <div className="vx-look-foot">
          <p>
            <span>{chosen.length} selected</span>
            <strong>{formatPrice(total)}</strong>
          </p>
          <button type="button" className="vx-add" disabled={!chosen.length} onClick={() => addAll(chosen)}>
            Add selected to bag
          </button>
          {chosen.length < products.length && (
            <button type="button" className="vx-look-all" onClick={() => addAll(products)}>
              Add the whole look ({products.length})
            </button>
          )}
        </div>
      </aside>
    </div>
  )
}

/* ---------------------------------------------------------------- the card */

function InfoCard({ product, number, onBack, phone = false }: { product: Product; number: number; onBack: () => void; phone?: boolean }) {
  const { add } = useCart()
  const sizes = fullSizeVariations(product)
  const [pick, setPick] = useState(() => (sizes.find((v) => v.inStock) ?? sizes[0])?.id)
  const chosen = sizes.find((v) => v.id === pick)
  const rows = (
    [
      ['Top', product.composition.opening],
      ['Heart', product.composition.heart],
      ['Base', product.composition.drydown],
    ] as [string, string[]][]
  ).filter(([, list]) => list.length)
  const notes = rows.length ? rows : ([['Notes', product.notes.map((n) => n.name).slice(0, 4)]] as [string, string[]][])

  return (
    <aside className={`vx-card ${phone ? 'is-phone' : ''}`} aria-live="polite">
      <p className="vx-card-no">
        N° {String(number).padStart(2, '0')} · Eau de parfum
      </p>
      <h2 className="vx-card-name">{product.name}</h2>
      {product.inspiredBy && <p className="vx-card-tag">Inspired by {product.inspiredBy}</p>}
      <dl className="vx-notes">
        {notes.map(([label, list]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{list.slice(0, 3).join(', ')}</dd>
          </div>
        ))}
      </dl>
      {sizes.length > 0 && (
        <div className="vx-sizes" role="radiogroup" aria-label="Size">
          {sizes.map((v) => (
            <button key={v.id} type="button" role="radio" aria-checked={v.id === pick} disabled={!v.inStock} className={v.id === pick ? 'is-on' : ''} onClick={() => setPick(v.id)}>
              <span>{v.size}</span>
              <span>{formatPrice(v.price)}</span>
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        className="vx-add"
        disabled={!chosen?.inStock}
        onClick={(e) => {
          if (!chosen) return
          flyToCart(e.currentTarget, product.showcaseImage)
          add(product.id, chosen.id, 1)
        }}
      >
        {chosen?.inStock === false ? 'Sold out' : 'Add to bag'}
      </button>
      {FREE_SHIPPING.enabled && !phone && (
        <p className="vx-card-note">
          Free shipping in {FREE_SHIPPING_GOVERNORATES.join(' & ')} on orders over {formatPrice(FREE_SHIPPING.min)}.
        </p>
      )}
      <div className="vx-card-links">
        <button type="button" onClick={onBack}>
          <ArrowLeft className="size-3.5" strokeWidth={1.6} /> Back to the wall
        </button>
        <Link to={`/product/${product.slug}`}>
          Full details <ArrowRight className="size-3.5" strokeWidth={1.6} />
        </Link>
      </div>
    </aside>
  )
}

/* ---------------------------------------------------------------- without 3D */

function Fallback({ products }: { products: Product[] }) {
  return (
    <section className="vx-empty">
      <BrandMark className="vx-load-logo" />
      <p className="vx-load-name">The Vitrine</p>
      <h1>{products.length ? 'This device can’t show the 3D window.' : 'The window is being dressed.'}</h1>
      <p>{products.length ? 'Every bottle is waiting for you in the shop.' : 'Our bottles will be standing here very soon.'}</p>
      <Link to="/shop" className="vx-add vx-empty-link">
        Shop the collection
      </Link>
    </section>
  )
}
