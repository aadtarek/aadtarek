import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, ShoppingBag, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fullSizeVariations, getAllProducts } from '../api/catalog'
import logo from '../assets/logo.svg'
import marble from '../assets/vitrine/marble.webp'
import { FREE_SHIPPING, FREE_SHIPPING_GOVERNORATES, HOME } from '../config'
import { formatPrice } from '../lib/format'
import { flyToCart } from '../lib/fx'
import { useOwnLogo } from '../lib/ownLogo'
import { usePageTitle } from '../lib/usePageTitle'
import { useCart } from '../store/cart'
import type { Product } from '../types'
import { VitrineEngine, webglAvailable } from '../vitrine/engine'
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

function Experience({ products, phone }: { products: Product[]; phone: boolean }) {
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
  const focusRef = useRef<number | null>(null)

  const setFocus = (i: number | null) => {
    focusRef.current = i
    setFocusState(i)
    engine.current?.setFocus(i)
  }

  useEffect(() => {
    const el = canvas.current
    if (!el) return
    const items = products.map((p) => ({ image: p.showcaseImage!, name: p.name, price: formatPrice(lowest(p)) }))
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

  // Keys: arrows step through the bottles, Escape steps back out.
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      const f = focusRef.current
      if (ev.key === 'Escape') f !== null ? setFocus(null) : navigate(-1)
      else if (f !== null && ev.key === 'ArrowRight') setFocus(Math.min(products.length - 1, f + 1))
      else if (f !== null && ev.key === 'ArrowLeft') setFocus(Math.max(0, f - 1))
      else if (f === null && (ev.key === 'ArrowDown' || ev.key === 'PageDown')) engine.current?.scrollBy(1.2)
      else if (f === null && (ev.key === 'ArrowUp' || ev.key === 'PageUp')) engine.current?.scrollBy(-1.2)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.length])

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

  // Pointer: drag or wheel to move along the wall, click / tap to pick a bottle.
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
      else if (Math.abs(ev.clientX - d.x) > 50) setFocus(Math.max(0, Math.min(products.length - 1, f + (ev.clientX < d.x ? 1 : -1)))) // swipe to the next bottle
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
    <div className={`vx ${phone ? 'is-phone' : ''} ${f !== null ? 'is-focus' : ''} ${entered ? 'is-in' : ''}`}>
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
          <button type="button" className="vx-icon" onClick={() => (f !== null ? setFocus(null) : navigate(-1))} aria-label={f !== null ? 'Back to the wall' : 'Close'}>
            <X className="size-[18px]" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {f === null && (
        <>
          <div className="vx-rail" aria-hidden>
            <span style={{ transform: `translateY(${scroll * 100 * 4}%)` }} />
          </div>
          {!phone && hover !== null && (
            <p className="vx-tip" key={hover}>
              {products[hover].name} <span>{formatPrice(lowest(products[hover]))}</span>
            </p>
          )}
        </>
      )}

      {f !== null && (
        <>
          <div className={`vx-steps ${phone ? 'is-in-card' : ''}`}>
            <button type="button" onClick={() => setFocus(Math.max(0, f - 1))} disabled={f === 0} aria-label="Previous bottle">
              <ChevronLeft className="size-5" strokeWidth={1.4} />
            </button>
            <span>
              {String(f + 1).padStart(2, '0')} / {String(products.length).padStart(2, '0')}
            </span>
            <button type="button" onClick={() => setFocus(Math.min(products.length - 1, f + 1))} disabled={f === products.length - 1} aria-label="Next bottle">
              <ChevronRight className="size-5" strokeWidth={1.4} />
            </button>
          </div>
          <InfoCard key={products[f].id} product={products[f]} number={f + 1} onBack={() => setFocus(null)} phone={phone} />
        </>
      )}

      {/* Loading, then the lights come on */}
      <div className={`vx-load ${ready ? 'is-done' : ''}`} aria-hidden={ready}>
        <BrandMark className="vx-load-logo" />
        <p className="vx-load-name">The Vitrine</p>
        <div className="vx-load-bar">
          <span style={{ transform: `scaleX(${Math.max(0.04, progress)})` }} />
        </div>
        <p className="vx-load-pct">{Math.round(progress * 100)}%</p>
      </div>
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
