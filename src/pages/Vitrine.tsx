import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { fullSizeVariations, getAllProducts } from '../api/catalog'
import wall from '../assets/vitrine/wall.webp'
import { RainGlass } from '../components/RainGlass'
import { FREE_SHIPPING, FREE_SHIPPING_GOVERNORATES } from '../config'
import { formatPrice } from '../lib/format'
import { flyToCart } from '../lib/fx'
import { usePageTitle } from '../lib/usePageTitle'
import { useCart } from '../store/cart'
import type { Product } from '../types'
import './vitrine.css'

/** Bottles in one window (computers); phones show them all in a grid of niches. */
const PER_WINDOW = 5
/** How much closer the close-up is than the overview (the same as --z in vitrine.css). */
const Z = 2.3

type Lit = CSSProperties & { '--lit'?: number; '--i'?: number; '--wx'?: string }

/**
 * The Vitrine: every fragrance that has a showcase bottle (Products → Rfaheya details →
 * Showcase bottle), standing in a lit stone window behind wet glass. Hover a niche and its light
 * stays on while the others dim; click and the view moves in to that bottle with its notes,
 * sizes and an add-to-bag card.
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
  return phone ? <PhoneVitrine products={products} /> : <WindowVitrine products={products} />
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

/** Lights come on one niche after another, with a short flicker. */
function useLightsOn(count: number, key: unknown) {
  const [on, setOn] = useState(0)
  useEffect(() => {
    setOn(0)
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (still) return void setOn(count)
    let n = 0
    const t = window.setInterval(() => {
      n += 1
      setOn(n)
      if (n >= count) window.clearInterval(t)
    }, 170)
    return () => window.clearInterval(t)
  }, [count, key])
  return on
}

/* ---------------------------------------------------------------- computers */

function WindowVitrine({ products }: { products: Product[] }) {
  const windows = Math.ceil(products.length / PER_WINDOW)
  const [win, setWin] = useState(0)
  const [hover, setHover] = useState<number | null>(null)
  const [focus, setFocus] = useState<number | null>(null)
  const [dark, setDark] = useState(false)
  const stage = useRef<HTMLElement>(null)
  const shown = products.slice(win * PER_WINDOW, win * PER_WINDOW + PER_WINDOW)
  const on = useLightsOn(shown.length, win)

  // Another window: the lights go out, the bottles change, the lights come back on.
  const goWindow = useCallback(
    (to: number) => {
      const next = (to + windows) % windows
      if (next === win) return
      setDark(true)
      setHover(null)
      window.setTimeout(() => {
        setWin(next)
        setDark(false)
      }, 380)
    },
    [win, windows],
  )

  const move = useCallback(
    (by: number) => {
      if (focus === null) return goWindow(win + by)
      const next = (focus + by + products.length) % products.length
      setWin(Math.floor(next / PER_WINDOW))
      setFocus(next)
    },
    [focus, goWindow, products.length, win],
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

  // The view leans with the mouse (the wall, the bottles and the glass move by different amounts).
  const onMouseMove = (e: React.MouseEvent) => {
    const el = stage.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3))
    el.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3))
  }

  const local = focus === null ? null : focus - win * PER_WINDOW
  const lit = (i: number) => {
    if (dark || i >= on) return 0
    if (local !== null) return i === local ? 1 : 0.1
    if (hover !== null) return i === hover ? 1 : 0.16
    return 1
  }
  // The camera. The window is laid out at close-up size (Z, vitrine.css) and shown shrunk; to step
  // closer it grows back to full size with the chosen niche a little left of the centre.
  const cam: CSSProperties = {}
  if (local !== null) {
    const bx = 0.03 + (0.94 * (local + 0.5)) / PER_WINDOW
    const by = 0.68
    cam.transform = `translate3d(${(-0.1 / Z - (bx - 0.5)) * 100}%, ${(0.02 / Z - (by - 0.5)) * 100}%, 0) scale(1)`
  }

  return (
    <section ref={stage} className={`vt-stage ${focus !== null ? 'is-focus' : ''}`} onMouseMove={onMouseMove} aria-label="The Vitrine">
      <div className="vt-lean">
        <div className="vt-cam" style={cam}>
          <div className="vt-cabinet">
            <div className="vt-wall" style={{ backgroundImage: `url(${wall})` }} />
            <div className="vt-ceiling" />
            <div className="vt-bays">
              {shown.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  className={`vt-bay ${i < on ? 'is-on' : ''}`}
                  style={{ '--lit': lit(i), '--i': i } as Lit}
                  onMouseEnter={() => focus === null && setHover(i)}
                  onMouseLeave={() => focus === null && setHover(null)}
                  onFocus={() => focus === null && setHover(i)}
                  onBlur={() => focus === null && setHover(null)}
                  onClick={() => setFocus(win * PER_WINDOW + i)}
                  aria-label={`${p.name}, from ${formatPrice(lowest(p))}`}
                >
                  <span className="vt-litwall" style={{ backgroundImage: `url(${wall})` }} />
                  <span className="vt-lamp" />
                  <span className="vt-beam" />
                  <span className="vt-pool" />
                  <span className="vt-plinth">
                    <span className="vt-price">{formatPrice(lowest(p))}</span>
                  </span>
                  <img className="vt-bottle" src={p.showcaseImage} alt="" draggable={false} decoding="async" />
                  <span className="vt-floor-glow" />
                </button>
              ))}
            </div>
            <div className="vt-seams" />
          </div>
        </div>
      </div>
      <RainGlass className="vt-rain" density={focus !== null ? 0.8 : 1} />
      <div className="vt-sheen" aria-hidden />

      <header className={`vt-title ${focus !== null ? 'is-away' : ''}`}>
        <p className="vt-eyebrow">The Vitrine</p>
        <p className="vt-hint">Hover to light a bottle · click to step closer</p>
      </header>

      {windows > 1 && focus === null && (
        <nav className="vt-pager" aria-label="Windows">
          <button type="button" onClick={() => goWindow(win - 1)} aria-label="Previous window">
            <ChevronLeft className="size-4" strokeWidth={1.6} />
          </button>
          <span>
            Window {win + 1} / {windows}
          </span>
          <button type="button" onClick={() => goWindow(win + 1)} aria-label="Next window">
            <ChevronRight className="size-4" strokeWidth={1.6} />
          </button>
        </nav>
      )}

      {focus !== null && (
        <>
          <button type="button" className="vt-side is-prev" onClick={() => move(-1)} aria-label="Previous bottle">
            <ChevronLeft className="size-5" strokeWidth={1.4} />
          </button>
          <button type="button" className="vt-side is-next" onClick={() => move(1)} aria-label="Next bottle">
            <ChevronRight className="size-5" strokeWidth={1.4} />
          </button>
          <InfoCard key={products[focus].id} product={products[focus]} number={focus + 1} onBack={() => setFocus(null)} />
        </>
      )}
    </section>
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

/* ---------------------------------------------------------------- phones */

function PhoneVitrine({ products }: { products: Product[] }) {
  const [focus, setFocus] = useState<number | null>(null)
  const grid = useRef<HTMLUListElement>(null)
  const [seen, setSeen] = useState(false)
  const on = useLightsOn(seen ? products.length : 0, seen)

  useEffect(() => {
    const el = grid.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section className="vtm" aria-label="The Vitrine">
      <header className="vtm-head">
        <p className="vt-eyebrow">The Vitrine</p>
        <h1>Every bottle, in its own light.</h1>
        <p>Tap a niche to step closer.</p>
      </header>
      <ul ref={grid} className="vtm-grid">
        {products.map((p, i) => (
          <li key={p.id}>
            <button
              type="button"
              className={`vtm-cell ${i < on ? 'is-on' : ''}`}
              style={{ backgroundImage: `url(${wall})`, '--wx': `${(i * 37) % 100}%` } as Lit}
              onClick={() => setFocus(i)}
              aria-label={`${p.name}, from ${formatPrice(lowest(p))}`}
            >
              <span className="vt-lamp" />
              <span className="vt-pool" />
              <img className="vtm-bottle" src={p.showcaseImage} alt="" loading={i < 4 ? undefined : 'lazy'} decoding="async" />
              <span className="vtm-plinth">
                <span className="vtm-name">{p.name}</span>
                <span className="vt-price">{formatPrice(lowest(p))}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {focus !== null && <PhoneFocus products={products} index={focus} onIndex={setFocus} onClose={() => setFocus(null)} />}
    </section>
  )
}

function PhoneFocus({ products, index, onIndex, onClose }: { products: Product[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const p = products[index]
  const start = useRef<number | null>(null)
  const go = (by: number) => onIndex((index + by + products.length) % products.length)
  useEffect(() => {
    const html = document.documentElement
    const before = html.style.overflow
    html.style.overflow = 'hidden'
    return () => {
      html.style.overflow = before
    }
  }, [])
  return (
    <div
      className="vtm-focus"
      role="dialog"
      aria-modal="true"
      aria-label={p.name}
      onTouchStart={(e) => (start.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (start.current === null) return
        const dx = e.changedTouches[0].clientX - start.current
        start.current = null
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
      }}
    >
      <div className="vtm-scene" style={{ backgroundImage: `url(${wall})` }}>
        <span className="vt-lamp" />
        <span className="vt-beam" />
        <span className="vt-pool" />
        <img key={p.id} className="vtm-hero" src={p.showcaseImage} alt="" />
        <span className="vtm-hero-plinth" />
        <RainGlass density={0.9} />
      </div>
      <div className="vtm-bar">
        <button type="button" onClick={onClose}>
          <ArrowLeft className="size-4" strokeWidth={1.6} /> The window
        </button>
        <span>
          {index + 1} / {products.length}
        </span>
      </div>
      <InfoCard key={p.id} product={p} number={index + 1} onBack={onClose} phone />
    </div>
  )
}
