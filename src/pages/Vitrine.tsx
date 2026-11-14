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
import { characterProducts, resolveCharacters } from '../vitrine/characters'
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

/**
 * One 3D scene from the first frame to the last, behind one loading screen: the characters'
 * stage (when there are characters), then a flight into the chosen one's wall of bottles and back.
 */
function Experience({ products, phone }: { products: Product[]; phone: boolean }) {
  const navigate = useNavigate()
  const cart = useCart()
  const canvas = useRef<HTMLCanvasElement>(null)
  const engine = useRef<VitrineEngine | null>(null)
  const characters = useMemo(
    () => resolveCharacters(VITRINE.characters).map((c) => ({ c, bottles: characterProducts(c, products) })).filter((x) => x.bottles.length),
    [products],
  )
  const hall = characters.length > 0
  const [progress, setProgress] = useState(0)
  const [ready, setReady] = useState(false)
  const [entered, setEntered] = useState(false)
  const [mode, setMode] = useState<'stage' | 'wall'>(hall ? 'stage' : 'wall')
  const [flying, setFlying] = useState(hall) // the entrance is a flight too
  const [front, setFront] = useState(0)
  const [chosen, setChosen] = useState<number | null>(null)
  const [focus, setFocusState] = useState<number | null>(null)
  const [hover, setHover] = useState<number | null>(null)
  const [scroll, setScroll] = useState(0)
  const [look, setLook] = useState(false)
  const focusRef = useRef<number | null>(null)
  const modeRef = useRef(mode)
  const flyingRef = useRef(flying)
  modeRef.current = mode
  flyingRef.current = flying
  const wall = hall ? (chosen !== null ? characters[chosen].bottles : []) : products
  const character = chosen !== null ? characters[chosen].c : null

  const bottleItems = (list: Product[]): ShowcaseItem[] => list.map((p) => ({ image: p.showcaseImage!, name: p.name, price: formatPrice(lowest(p)) }))
  const setFocus = (i: number | null) => {
    focusRef.current = i
    setFocusState(i)
    engine.current?.setFocus(i)
  }
  const enter = (i: number) => {
    if (flyingRef.current || modeRef.current !== 'stage') return
    flyingRef.current = true
    setFlying(true)
    setChosen(i)
    engine.current?.enter(bottleItems(characters[i].bottles))
  }
  const back = () => {
    if (!hall) return navigate(-1)
    if (flyingRef.current) return
    flyingRef.current = true
    setFlying(true)
    setLook(false)
    focusRef.current = null
    setFocusState(null)
    engine.current?.leave()
  }

  useEffect(() => {
    const el = canvas.current
    if (!el) return
    const all = new Set<string>()
    for (const x of characters) for (const p of x.bottles) all.add(p.showcaseImage!)
    const e = new VitrineEngine(
      el,
      hall ? [] : bottleItems(products),
      phone,
      marble,
      {
        onProgress: setProgress,
        onReady: () => {
          setReady(true)
          window.setTimeout(() => setEntered(true), hall ? 2200 : 900)
        },
        onHover: setHover,
        onScroll: (s) => setScroll((old) => (Math.abs(old - s) > 0.004 ? s : old)),
        onStage: setFront,
        onArrive: (where) => {
          flyingRef.current = false
          setFlying(false)
          setMode(where)
          if (where === 'stage') setChosen(null)
        },
      },
      hall ? characters.map(({ c }) => ({ image: c.image, name: c.name })) : null,
      [...all],
    )
    engine.current = e
    const ro = new ResizeObserver(() => e.resize())
    ro.observe(el.parentElement!)
    return () => {
      ro.disconnect()
      e.dispose()
      engine.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, phone])

  // Keys: on the stage the arrows turn the ring and Enter steps in; on the wall they step through
  // the bottles; Escape steps back out (bottle → wall → stage → leave).
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      const e = engine.current
      if (!e || flyingRef.current) return
      const f = focusRef.current
      if (modeRef.current === 'stage') {
        if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') e.stageGo(Math.round(e.stageAt) + 1)
        else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') e.stageGo(Math.round(e.stageAt) - 1)
        else if (ev.key === 'Enter') enter(Math.round(e.stageAt))
        else if (ev.key === 'Escape') navigate(-1)
        return
      }
      if (ev.key === 'Escape') {
        if (f !== null) setFocus(null)
        else back()
      } else if (f !== null && ev.key === 'ArrowRight') setFocus(Math.min(wall.length - 1, f + 1))
      else if (f !== null && ev.key === 'ArrowLeft') setFocus(Math.max(0, f - 1))
      else if (f === null && (ev.key === 'ArrowDown' || ev.key === 'PageDown')) e.scrollBy(1.2)
      else if (f === null && (ev.key === 'ArrowUp' || ev.key === 'PageUp')) e.scrollBy(-1.2)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wall.length])

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

  // Pointer: on the stage a sideways drag (or the wheel) turns the ring; on the wall an up-down
  // drag moves along it. A click or tap picks.
  const drag = useRef<{ x: number; y: number; last: number; lastX: number; t: number; v: number; moved: boolean; from: number } | null>(null)
  const ndc = (ev: { clientX: number; clientY: number }) => {
    const r = canvas.current!.getBoundingClientRect()
    return [((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1] as const
  }
  const unit = () => (phone ? 3.2 : 2.4) / (canvas.current?.clientHeight || 800)
  const ringSpan = () => (canvas.current?.clientWidth || 1000) * (phone ? 0.55 : 0.28)
  const snap = useRef(0)
  const onWheel = (ev: React.WheelEvent) => {
    const e = engine.current
    if (!e || flyingRef.current) return
    if (modeRef.current === 'stage') {
      e.stageNudge((Math.abs(ev.deltaX) > Math.abs(ev.deltaY) ? ev.deltaX : ev.deltaY) / 380)
      window.clearTimeout(snap.current)
      snap.current = window.setTimeout(() => e.stageSnap(), 160)
    } else if (focusRef.current === null) e.scrollBy(ev.deltaY * 0.0021)
  }
  const onPointerDown = (ev: React.PointerEvent) => {
    if (phone) askTilt()
    drag.current = { x: ev.clientX, y: ev.clientY, last: ev.clientY, lastX: ev.clientX, t: performance.now(), v: 0, moved: false, from: engine.current?.stageAt ?? 0 }
  }
  const onPointerMove = (ev: React.PointerEvent) => {
    const [x, y] = ndc(ev)
    engine.current?.pointerAt(x, y)
    const d = drag.current
    if (!d || flyingRef.current) return
    if (Math.abs(ev.clientY - d.y) > 6 || Math.abs(ev.clientX - d.x) > 6) d.moved = true
    if (!d.moved) return
    const now = performance.now()
    if (modeRef.current === 'stage') {
      d.v = (ev.clientX - d.lastX) / Math.max(1, now - d.t)
      d.t = now
      d.lastX = ev.clientX
      engine.current?.stageGo(d.from - (ev.clientX - d.x) / ringSpan())
    } else if (focusRef.current === null) {
      const dy = ev.clientY - d.last
      d.v = dy / Math.max(1, now - d.t)
      d.t = now
      d.last = ev.clientY
      engine.current?.scrollBy(-dy * unit())
    }
  }
  const onPointerUp = (ev: React.PointerEvent) => {
    const d = drag.current
    drag.current = null
    const e = engine.current
    if (!d || !e || flyingRef.current) return
    if (modeRef.current === 'stage') {
      if (d.moved) e.stageGo(Math.round(e.stageAt - d.v * 1.6)) // a flick carries on
      else {
        const [x, y] = ndc(ev)
        const i = e.stagePick(x, y)
        if (i === null) return
        if (i === Math.round(e.stageAt)) enter(i)
        else e.stageGo(i)
      }
      return
    }
    if (d.moved) {
      const f = focusRef.current
      if (f === null) e.scrollBy(-d.v * 260 * unit()) // a flick keeps going
      else if (Math.abs(ev.clientX - d.x) > 50) setFocus(Math.max(0, Math.min(wall.length - 1, f + (ev.clientX < d.x ? 1 : -1)))) // swipe to the next bottle
      return
    }
    const [x, y] = ndc(ev)
    const i = e.pick(x, y)
    // A tap on a bottle steps in; a second tap on it (or a tap beside it) steps back out.
    if (i !== null && i !== focusRef.current) setFocus(i)
    else if (focusRef.current !== null) setFocus(null)
  }

  const f = focus
  const onStage = mode === 'stage' && hall
  const c = characters[front]?.c
  return (
    <div className={`vx ${phone ? 'is-phone' : ''} ${f !== null ? 'is-focus' : ''} ${entered ? 'is-in' : ''} ${character && mode === 'wall' ? 'has-look' : ''} ${flying ? 'is-flying' : ''}`}>
      <div
        className={`vx-stage ${hover !== null || onStage ? 'is-pointing' : ''} ${onStage ? 'is-ring' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (drag.current = null)}
        onPointerLeave={() => engine.current?.pointerAt(null)}
        onWheel={onWheel}
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
            {cart.count > 0 && <span className="vx-badge" key={cart.count}>{cart.count}</span>}
          </button>
          <button
            type="button"
            className="vx-icon"
            onClick={() => (f !== null ? setFocus(null) : mode === 'wall' && hall ? back() : navigate(-1))}
            aria-label={f !== null ? 'Back to the wall' : mode === 'wall' && hall ? 'Back to the characters' : 'Close'}
          >
            <X className="size-[18px]" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* The stage */}
      {onStage && !flying && c && (
        <>
          <div className="vx-hall-title">
            <p className="vx-scene-eyebrow">Choose your character</p>
          </div>
          <div className="vx-hall-info" key={c.id}>
            <p className="vx-hall-no">
              {String(front + 1).padStart(2, '0')} <span>/ {String(characters.length).padStart(2, '0')}</span>
            </p>
            <h1 className="vx-hall-name">{c.name}</h1>
            {c.tagline && <p className="vx-hall-line">{c.tagline}</p>}
            <button type="button" className="vx-look-btn vx-hall-go" onClick={() => enter(front)}>
              Explore {characters[front].bottles.length} {characters[front].bottles.length === 1 ? 'perfume' : 'perfumes'} <ArrowRight className="size-4" strokeWidth={1.8} />
            </button>
          </div>
          <button type="button" className="vx-hall-arrow is-prev" onClick={() => engine.current?.stageGo(front - 1)} disabled={front === 0} aria-label="Previous character">
            <ChevronLeft className="size-6" strokeWidth={1.3} />
          </button>
          <button type="button" className="vx-hall-arrow is-next" onClick={() => engine.current?.stageGo(front + 1)} disabled={front === characters.length - 1} aria-label="Next character">
            <ChevronRight className="size-6" strokeWidth={1.3} />
          </button>
          <div className="vx-hall-dots" aria-hidden>
            {characters.map((x, i) => (
              <span key={x.c.id} className={i === front ? 'is-on' : ''} />
            ))}
          </div>
        </>
      )}

      {/* A character's wall */}
      {mode === 'wall' && !flying && character && f === null && (
        <div className="vx-scene-title">
          <button type="button" className="vx-back" onClick={back}>
            <ArrowLeft className="size-4" strokeWidth={1.6} /> Characters
          </button>
          <p className="vx-scene-name">{character.name}</p>
          {character.tagline && <p className="vx-scene-line">{character.tagline}</p>}
        </div>
      )}

      {mode === 'wall' && !flying && f === null && (
        <>
          <div className="vx-rail" aria-hidden>
            <span style={{ transform: `translateY(${scroll * 100 * 4}%)` }} />
          </div>
          {!phone && hover !== null && wall[hover] && (
            <p className="vx-tip" key={hover}>
              {wall[hover].name} <span>{formatPrice(lowest(wall[hover]))}</span>
            </p>
          )}
          {character && (
            <button type="button" className="vx-look-btn" onClick={() => setLook(true)}>
              <ShoppingBag className="size-4" strokeWidth={1.6} /> Shop the look · {wall.length}
            </button>
          )}
        </>
      )}

      {mode === 'wall' && f !== null && wall[f] && (
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

      {look && character && mode === 'wall' && (
        <LookPanel name={character.name} products={wall} phone={phone} onClose={() => setLook(false)} onAdded={() => engine.current?.celebrate()} />
      )}

      {/* Loading (once, for everything), then the lights come on */}
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

/* ---------------------------------------------------------------- shop the look */

/** A character's bottles in one list: all of them in one go, or only the ones (and sizes) wanted. */
function LookPanel({ name, products, phone, onClose, onAdded }: { name: string; products: Product[]; phone: boolean; onClose: () => void; onAdded?: () => void }) {
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
    cart.addMany(lines) // one go: the bag shows them all together
    onAdded?.()
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
          {chosen.length === products.length ? (
            <button type="button" className="vx-add" onClick={() => addAll(products)}>
              Add all {products.length} to bag
            </button>
          ) : (
            <>
              <button type="button" className="vx-add" disabled={!chosen.length} onClick={() => addAll(chosen)}>
                Add {chosen.length} to bag
              </button>
              <button type="button" className="vx-look-all" onClick={() => addAll(products)}>
                Add the whole look ({products.length})
              </button>
            </>
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
