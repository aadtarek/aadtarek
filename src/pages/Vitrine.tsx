import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { fullSizeVariations, getAllProducts } from '../api/catalog'
import marbleDark from '../assets/vitrine/marble-dark.webp'
import marbleLit from '../assets/vitrine/marble-lit.webp'
import { RainGlass } from '../components/RainGlass'
import { FREE_SHIPPING, FREE_SHIPPING_GOVERNORATES } from '../config'
import { formatPrice } from '../lib/format'
import { flyToCart } from '../lib/fx'
import { usePageTitle } from '../lib/usePageTitle'
import { useCart } from '../store/cart'
import type { Product } from '../types'
import './vitrine.css'

/** Niches in one window on computers (phones show one niche at a time, in a 3D carousel). */
const PER_WINDOW = 5

type Vars = CSSProperties & Record<`--${string}`, string | number>

/**
 * The Vitrine: every fragrance that has a showcase bottle (Products → Rfaheya details →
 * Showcase bottle) standing in its own marble niche, built in 3D: back wall, side walls, ceiling
 * with a downlight, a polished floor and a stone plinth, all behind wet glass. The camera leans
 * with the mouse (or the phone's tilt), the lamps come on one by one, a hovered niche keeps its
 * light while the others dim, and a click travels into the niche with the notes, sizes and an
 * add-to-bag card.
 */
export function Vitrine() {
  usePageTitle('The Vitrine — Rfaheya')
  const products = useMemo(() => getAllProducts().filter((p) => p.showcaseImage), [])
  const phone = usePhone()
  if (!products.length) {
    return (
      <section className="vt-empty">
        <p className="vt-eyebrow">The Vitrine</p>
        <h1>The window is being dressed.</h1>
        <p>Our bottles will be standing here very soon.</p>
        <Link to="/shop" className="vt-empty-link">
          Shop the collection <ArrowRight className="size-4" strokeWidth={1.6} />
        </Link>
      </section>
    )
  }
  return <Scene key={phone ? 'phone' : 'desk'} products={products} phone={phone} />
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

/** Sizes of the niches and the camera distances, from the size of the stage. */
function geometry(W: number, H: number, phone: boolean) {
  const NH = phone ? H * 0.8 : H * 0.98
  const NW = phone ? Math.min(W * 0.74, NH * 0.6) : NH * 0.52
  const ND = NW * 0.95
  const G = NW * 0.07
  const P = NW + G
  const p = NW * 2.6
  // How far back the camera stands so the whole window (or one niche, on phones) fits.
  const fit = phone ? Math.min((W * 0.86) / NW, (H * 0.86) / NH) : Math.min((W * 0.94) / (PER_WINDOW * P - G), (H * 0.8) / NH)
  const back = p / fit - p
  return { W, H, NW, NH, ND, G, P, p, back }
}

/** Lamps come on one after another (with a flicker); `key` starts them again. */
function useLightsOn(count: number, key: unknown, delay = 0) {
  const [on, setOn] = useState(0)
  useEffect(() => {
    setOn(0)
    let n = 0
    let t = 0
    const s = window.setTimeout(() => {
      t = window.setInterval(() => {
        n += 1
        setOn(n)
        if (n >= count) window.clearInterval(t)
      }, 190)
    }, delay)
    return () => {
      window.clearTimeout(s)
      window.clearInterval(t)
    }
  }, [count, key, delay])
  return on
}

function Scene({ products, phone }: { products: Product[]; phone: boolean }) {
  const stage = useRef<HTMLElement>(null)
  const [size, setSize] = useState({ W: 1280, H: 760 })
  const [ready, setReady] = useState(false)
  const [center, setCenter] = useState(0) // phones: the niche in front
  const [win, setWin] = useState(0) // computers: the window shown
  const [hover, setHover] = useState<number | null>(null)
  const [focus, setFocus] = useState<number | null>(null)
  const [drag, setDrag] = useState(0)
  const windows = Math.ceil(products.length / PER_WINDOW)

  useLayoutEffect(() => {
    const el = stage.current
    if (!el) return
    const measure = () => setSize({ W: el.clientWidth, H: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 60)
    return () => window.clearTimeout(t)
  }, [])

  const g = geometry(size.W, size.H, phone)
  const first = phone ? center - 1 : win * PER_WINDOW
  const count = phone ? 3 : PER_WINDOW
  const on = useLightsOn(count, phone ? 'phone' : win, ready ? 500 : 99999)

  // --- light in each niche
  const lit = (i: number) => {
    const k = i - first
    if (k < 0 || k >= count || k >= on) return phone && i !== center ? 0.1 : 0.04
    if (focus !== null) return i === focus ? 1 : 0.07
    if (phone) return i === center ? 1 : 0.14
    if (hover !== null) return i === hover ? 1 : 0.14
    return 1
  }

  // --- the camera: dolly (distance and framing), orbit (the lean), truck (along the row)
  let truck: number
  let dolly: [number, number, number]
  if (focus !== null) {
    truck = -focus * g.P
    // Into the niche, up to the bottle (the plinth drops below the frame on computers).
    const shift = phone ? 0 : -g.W * 0.14
    const lift = phone ? -g.NH * 0.08 - g.H * 0.21 : -g.NH * 0.16
    dolly = [shift, lift, g.ND * 0.45 + g.NW * (phone ? 0.02 : 0.62)]
  } else if (phone) {
    truck = -center * g.P + drag
    dolly = [0, g.NH * 0.02, -g.back]
  } else {
    truck = -(win * PER_WINDOW + (PER_WINDOW - 1) / 2) * g.P
    dolly = [0, g.NH * 0.02, -g.back]
  }
  if (!ready) dolly = [dolly[0], dolly[1], dolly[2] + g.back * 0.55] // starts close, then draws back

  const move = useCallback(
    (by: number) => {
      if (focus !== null) {
        const next = Math.max(0, Math.min(products.length - 1, focus + by))
        setFocus(next)
        if (phone) setCenter(next)
        else setWin(Math.floor(next / PER_WINDOW))
      } else if (phone) setCenter((c) => Math.max(0, Math.min(products.length - 1, c + by)))
      else {
        setHover(null)
        setWin((w) => (w + by + windows) % windows)
      }
    },
    [focus, phone, products.length, windows],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFocus(null)
      else if (e.key === 'ArrowRight') move(1)
      else if (e.key === 'ArrowLeft') move(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [move])

  // --- the lean: mouse on computers; the phone's tilt (asked for on the first touch on iPhones)
  const steer = (x: number, y: number) => {
    const el = stage.current
    if (!el) return
    el.classList.remove('is-idle')
    el.style.setProperty('--mx', Math.max(-1, Math.min(1, x)).toFixed(3))
    el.style.setProperty('--my', Math.max(-1, Math.min(1, y)).toFixed(3))
  }
  const tiltAsked = useRef(false)
  useEffect(() => {
    if (!phone) return
    let base: number | null = null
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return
      base ??= e.beta
      steer(e.gamma / 22, (e.beta - base) / 26)
    }
    window.addEventListener('deviceorientation', onTilt)
    return () => window.removeEventListener('deviceorientation', onTilt)
  }, [phone])
  const askTilt = () => {
    if (tiltAsked.current) return
    tiltAsked.current = true
    const D = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
    D?.requestPermission?.().catch(() => undefined)
  }

  // --- swipe (phones)
  const touch = useRef<{ x: number; y: number; moved: boolean } | null>(null)
  const onTouchStart = (e: React.TouchEvent) => {
    askTilt()
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, moved: false }
  }
  const onTouchMove = (e: React.TouchEvent) => {
    const t = touch.current
    if (!t || focus !== null) return
    const dx = e.touches[0].clientX - t.x
    if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(e.touches[0].clientY - t.y)) {
      t.moved = true
      setDrag(dx)
    }
  }
  const onTouchEnd = () => {
    const t = touch.current
    touch.current = null
    if (!t?.moved) return
    if (Math.abs(drag) > g.NW * 0.18) move(drag < 0 ? 1 : -1)
    setDrag(0)
  }

  const shown: number[] = []
  const from = Math.max(0, phone ? center - 2 : win * PER_WINDOW - 1)
  const to = Math.min(products.length - 1, phone ? center + 2 : win * PER_WINDOW + PER_WINDOW)
  for (let i = from; i <= to; i++) shown.push(i)

  const vars: Vars = {
    '--nw': `${g.NW}px`,
    '--nh': `${g.NH}px`,
    '--nd': `${g.ND}px`,
    '--g': `${g.G}px`,
    '--pp': `${g.p}px`,
    '--marble': `url(${marbleDark})`,
    '--marble-lit': `url(${marbleLit})`,
    '--tilt-y': phone ? 9 : 6,
    '--tilt-x': phone ? 6 : 3.5,
  }

  return (
    <section
      ref={stage}
      className={`vt3 is-idle ${phone ? 'is-phone' : ''} ${focus !== null ? 'is-focus' : ''} ${ready ? 'is-ready' : ''} ${drag ? 'is-drag' : ''}`}
      style={vars}
      aria-label="The Vitrine"
      onMouseMove={(e) => {
        if (phone) return
        const r = e.currentTarget.getBoundingClientRect()
        steer(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1)
      }}
      onTouchStart={phone ? onTouchStart : undefined}
      onTouchMove={phone ? onTouchMove : undefined}
      onTouchEnd={phone ? onTouchEnd : undefined}
    >
      <div className="vt3-dolly" style={{ transform: `translate3d(${dolly[0]}px, ${dolly[1]}px, ${dolly[2]}px)` }}>
        <div className="vt3-sway">
        <div className="vt3-orbit">
          <div className="vt3-truck" style={{ transform: `translate3d(${truck}px, 0, 0)` }}>
            {shown.map((i) => (
              <Niche
                key={products[i].id}
                product={products[i]}
                index={i}
                lit={lit(i)}
                flicker={i - first >= 0 && i - first < on}
                sheen={focus === i || hover === i || (phone && focus === null && i === center)}
                onEnter={() => !phone && focus === null && setHover(i)}
                onLeave={() => !phone && focus === null && setHover(null)}
                onPick={() => {
                  if (phone && i !== center) return setCenter(i)
                  setHover(null)
                  setFocus(i)
                  if (phone) setCenter(i)
                }}
              />
            ))}
          </div>
        </div>
        </div>
      </div>

      <RainGlass className="vt3-rain" density={phone ? 0.75 : 1} />
      <div className="vt3-glass" aria-hidden />

      <header className={`vt3-title ${focus !== null ? 'is-away' : ''}`}>
        <p className="vt-eyebrow">The Vitrine</p>
        <p className="vt-hint">{phone ? 'Swipe through the niches · tap to step closer' : 'Hover to light a bottle · click to step inside'}</p>
      </header>

      {focus === null && (phone ? products.length > 1 : windows > 1) && (
        <nav className="vt3-pager" aria-label={phone ? 'Bottles' : 'Windows'}>
          <button type="button" onClick={() => move(-1)} aria-label="Previous" disabled={phone && center === 0}>
            <ChevronLeft className="size-4" strokeWidth={1.6} />
          </button>
          <span>{phone ? `${center + 1} / ${products.length}` : `Window ${win + 1} / ${windows}`}</span>
          <button type="button" onClick={() => move(1)} aria-label="Next" disabled={phone && center === products.length - 1}>
            <ChevronRight className="size-4" strokeWidth={1.6} />
          </button>
        </nav>
      )}

      {focus !== null && (
        <>
          {!phone && (
            <>
              <button type="button" className="vt3-side is-prev" onClick={() => move(-1)} aria-label="Previous bottle" disabled={focus === 0}>
                <ChevronLeft className="size-5" strokeWidth={1.4} />
              </button>
              <button type="button" className="vt3-side is-next" onClick={() => move(1)} aria-label="Next bottle" disabled={focus === products.length - 1}>
                <ChevronRight className="size-5" strokeWidth={1.4} />
              </button>
            </>
          )}
          {phone && (
            <button type="button" className="vt3-back" onClick={() => setFocus(null)}>
              <ArrowLeft className="size-4" strokeWidth={1.6} /> The window
            </button>
          )}
          <InfoCard key={products[focus].id} product={products[focus]} number={focus + 1} onBack={() => setFocus(null)} phone={phone} />
        </>
      )}
    </section>
  )
}

/* ---------------------------------------------------------------- one niche */

const DUST = Array.from({ length: 7 }, (_, i) => ({
  left: 30 + ((i * 37) % 40),
  top: 12 + ((i * 53) % 62),
  size: 1.5 + ((i * 7) % 3) * 0.6,
  dur: 7 + ((i * 5) % 6),
  delay: -((i * 1.7) % 9),
}))

function Niche({
  product,
  index,
  lit,
  flicker,
  sheen,
  onEnter,
  onLeave,
  onPick,
}: {
  product: Product
  index: number
  lit: number
  flicker: boolean
  sheen: boolean
  onEnter: () => void
  onLeave: () => void
  onPick: () => void
}) {
  const img = product.showcaseImage!
  const style: Vars = {
    '--i': index,
    '--lit': lit,
    '--bx': `${(index * 29) % 100}%`,
    '--by': `${(index * 47) % 100}%`,
    '--sheen': sheen ? 1 : 0,
  }
  return (
    <div className={`nx ${flicker ? 'is-on' : ''}`} style={style}>
      <div className="nx-face nx-back">
        <i className="nx-lit" />
      </div>
      <div className="nx-face nx-left">
        <i className="nx-lit" />
      </div>
      <div className="nx-face nx-right">
        <i className="nx-lit" />
      </div>
      <div className="nx-face nx-ceil">
        <span className="nx-lamp" />
      </div>
      <div className="nx-face nx-floor">
        <i className="nx-lit" />
      </div>
      <div className="nx-beam" />
      {sheen && lit > 0.5 && (
        <div className="nx-dust" aria-hidden>
          {DUST.map((d, k) => (
            <span key={k} style={{ left: `${d.left}%`, top: `${d.top}%`, width: d.size * 3, height: d.size * 3, animationDuration: `${d.dur}s`, animationDelay: `${d.delay}s` }} />
          ))}
        </div>
      )}
      <div className="nx-plinth">
        <div className="pl pl-top" />
        <div className="pl pl-left" />
        <div className="pl pl-right" />
        <div className="pl pl-front">
          <span className="pl-name">{product.name}</span>
          <span className="pl-price">{formatPrice(lowest(product))}</span>
        </div>
      </div>
      <div className="nx-item">
        <img className="nx-glow" src={img} alt="" aria-hidden />
        <img className="nx-bottle" src={img} alt="" draggable={false} decoding="async" />
        {sheen && (
          <span className="nx-spec" style={{ maskImage: `url(${img})`, WebkitMaskImage: `url(${img})` }}>
            <i />
          </span>
        )}
      </div>
      <div className="nx-post" />
      <div className="nx-lintel" />
      <button
        type="button"
        className="nx-hit"
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onFocus={onEnter}
        onBlur={onLeave}
        onClick={onPick}
        aria-label={`${product.name}, from ${formatPrice(lowest(product))}`}
      />
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
    <aside className={`vt-card ${phone ? 'is-phone' : ''}`} aria-live="polite">
      <p className="vt-card-no">
        N° {String(number).padStart(2, '0')} · Eau de parfum
      </p>
      <h2 className="vt-card-name">{product.name}</h2>
      {product.tagline && <p className="vt-card-tag">{product.tagline}</p>}
      <dl className="vt-notes">
        {notes.map(([label, list]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{list.slice(0, 3).join(', ')}</dd>
          </div>
        ))}
      </dl>
      {sizes.length > 0 && (
        <div className="vt-sizes" role="radiogroup" aria-label="Size">
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
        className="vt-add"
        disabled={!chosen?.inStock}
        onClick={(e) => {
          if (!chosen) return
          flyToCart(e.currentTarget, product.showcaseImage)
          add(product.id, chosen.id, 1)
        }}
      >
        {chosen?.inStock === false ? 'Sold out' : 'Add to bag'}
      </button>
      {FREE_SHIPPING.enabled && (
        <p className="vt-card-note">
          Free shipping in {FREE_SHIPPING_GOVERNORATES.join(' & ')} on orders over {formatPrice(FREE_SHIPPING.min)}.
        </p>
      )}
      <div className="vt-card-links">
        <button type="button" onClick={onBack}>
          <ArrowLeft className="size-3.5" strokeWidth={1.6} /> Back to the window
        </button>
        <Link to={`/product/${product.slug}`}>
          Full details <ArrowRight className="size-3.5" strokeWidth={1.6} />
        </Link>
      </div>
    </aside>
  )
}

