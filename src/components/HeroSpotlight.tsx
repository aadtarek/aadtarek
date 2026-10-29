import { ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { composition, familyName, findProductById, getAllProducts, isCatalogReady, priceRange, sortProducts } from '../api/catalog'
import { HERO_SLIDER, HOME } from '../config'
import { formatPrice } from '../lib/format'
import { haptic } from '../lib/fx'
import { profileChips } from '../lib/profile'
import { DEFAULT_TINT, tintFor } from '../lib/tints'
import type { Product } from '../types'

type Slide = { product: Product; image: string; srcset?: string; text: string }

/** The three slides: the ones chosen in the dashboard, the best sellers for the rest. */
function useSlides(): Slide[] {
  if (!isCatalogReady()) return []
  const best = sortProducts(getAllProducts(), 'best-sellers')
  const picked = new Set<number>()
  const slides: Slide[] = []
  for (let i = 0; i < 3; i++) {
    const s = HERO_SLIDER.slides[i]
    let product = s?.productId ? findProductById(s.productId) : undefined
    if (!product || picked.has(product.id)) product = best.find((p) => !picked.has(p.id))
    if (!product) break
    picked.add(product.id)
    const photo = product.images[0]
    slides.push({
      product,
      image: s?.image || photo.src,
      srcset: s?.image ? s.srcset || undefined : photo.srcset,
      text: s?.text?.trim() || product.tagline || (product.inspiredBy ? `Inspired by ${product.inspiredBy}` : ''),
    })
  }
  return slides
}

/**
 * Home hero as a product spotlight: one fragrance per slide on its family's colour,
 * the bottle in a circle with its name large behind it, the key notes on the side and
 * tabs to switch. Slides change on their own (paused on hover), by tab, arrow keys or swipe.
 */
export function HeroSpotlight() {
  const slides = useSlides()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = slides.length
  const current = slides[Math.min(index, Math.max(0, count - 1))]
  const go = (i: number) => setIndex(((i % count) + count) % count)

  // Auto-advance; the tab's bar shows the time left.
  useEffect(() => {
    if (count < 2 || paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = window.setTimeout(() => setIndex((i) => (i + 1) % count), HERO_SLIDER.interval * 1000)
    return () => window.clearTimeout(t)
  }, [index, paused, count])

  // Swipe on phones.
  const start = useRef<{ x: number; y: number } | null>(null)

  const product = current?.product
  const { tint, ink } = product ? tintFor(product) : DEFAULT_TINT
  const chips = product ? profileChips(product, familyName).slice(0, 2) : []
  const c = product ? composition(product) : null
  const levels = c
    ? ([
        ['Top', c.opening[0]],
        ['Heart', c.heart[0]],
        ['Base', c.drydown[0]],
      ].filter(([, n]) => n) as [string, string][])
    : []
  const from = product ? priceRange(product).min : 0
  const word = product?.name.split(/\s+/)[0] ?? ''

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured fragrances"
      className="rf-spot relative -mt-16 overflow-hidden lg:-mt-[67px]"
      style={{ '--tint': tint, '--tint-ink': ink, '--rf-slide': `${HERO_SLIDER.interval}s` } as CSSProperties}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onTouchStart={(e) => (start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
      onTouchEnd={(e) => {
        const s = start.current
        start.current = null
        if (!s || count < 2) return
        const dx = e.changedTouches[0].clientX - s.x
        const dy = e.changedTouches[0].clientY - s.y
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) {
          haptic(8)
          go(index + (dx < 0 ? 1 : -1))
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(index + 1)
        if (e.key === 'ArrowLeft') go(index - 1)
      }}
    >
      <div className="rf-spot-stage container-x relative grid min-h-[620px] items-center pt-[76px] pb-24 md:h-[clamp(600px,44vw,800px)] md:grid-cols-[1fr_minmax(0,auto)_1fr] md:gap-6 md:pb-20">
        {/* The name, very large, behind the bottle */}
        <p key={`w${index}`} aria-hidden className="rf-spot-word pointer-events-none absolute inset-x-0 top-[33%] text-center font-serif whitespace-nowrap md:top-1/2">
          {word}
        </p>

        {/* Bottle */}
        <div className="relative order-1 mx-auto md:order-2">
          <div className="rf-spot-circle relative size-[min(68vw,300px)] overflow-hidden rounded-full md:size-[clamp(320px,30vw,470px)]">
            {slides.map((s, i) => (
              <img
                key={s.product.id}
                src={s.image}
                srcSet={s.srcset}
                sizes="(min-width: 768px) 30vw, 70vw"
                alt={i === index ? s.product.images[0].alt : ''}
                aria-hidden={i !== index}
                width={600}
                height={600}
                fetchPriority={i === 0 ? 'high' : 'low'}
                loading={i === 0 ? 'eager' : 'lazy'}
                className={`rf-spot-img absolute inset-0 size-full object-cover ${i === index ? 'is-on' : ''}`}
              />
            ))}
          </div>
        </div>

        {/* Copy */}
        <div key={`c${index}`} className="rf-spot-copy relative order-2 mt-7 text-center md:order-1 md:mt-0 md:text-left">
          <p className="rf-spot-ink text-[10.5px] font-semibold tracking-[0.3em] uppercase sm:text-[11.5px]">
            {product ? chips.map((x) => x.label).join(' · ') : HOME.hero.eyebrow}
          </p>
          <h1 className="mt-2.5 font-serif text-[46px] leading-[0.95] sm:text-[60px] lg:text-[78px]">{product?.name ?? HOME.hero.title.split(/\r?\n/)[0]}</h1>
          <p className="mx-auto mt-3 max-w-[22rem] text-[14.5px] leading-snug text-ink-soft md:mx-0 lg:text-[16px]">{current?.text ?? HOME.hero.text}</p>
          {product && (
            <div className="mt-5 flex flex-wrap justify-center gap-2.5 md:justify-start">
              <Link
                to={`/product/${product.slug}`}
                className="rf-magnetic group inline-flex h-12 items-center gap-2.5 rounded-full bg-[#14110d] px-7 text-[11.5px] font-semibold tracking-[0.12em] text-white uppercase transition hover:bg-[#2e2820]"
              >
                Shop now · {formatPrice(from)}
                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" strokeWidth={1.6} />
              </Link>
              <Link
                to="/shop"
                className="rf-spot-ghost inline-flex h-12 items-center rounded-full bg-white/70 px-6 text-[11.5px] font-semibold tracking-[0.12em] text-ink uppercase backdrop-blur-md transition hover:bg-white"
              >
                All fragrances
              </Link>
            </div>
          )}
        </div>

        {/* Key notes */}
        {levels.length > 0 && (
          <div key={`n${index}`} className="rf-spot-notes relative order-3 hidden text-right md:block">
            <p className="rf-spot-ink text-[11px] font-semibold tracking-[0.28em] uppercase">Key notes</p>
            <p className="mt-2 font-serif text-[30px] leading-tight lg:text-[36px]">{levels.map(([, n]) => n).slice(0, 2).join(' · ')}</p>
            <ul className="mt-4 space-y-1.5 text-[14px] text-ink-soft">
              {levels.map(([level, n]) => (
                <li key={level}>
                  <span className="rf-spot-ink text-[10.5px] font-semibold tracking-[0.18em] uppercase">{level}</span> — {n}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tabs */}
        {count > 1 && (
          <div role="tablist" aria-label="Choose a fragrance" className="absolute inset-x-0 bottom-6 flex justify-center gap-2 px-4 md:bottom-8">
            {slides.map((s, i) => (
              <button
                key={s.product.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                onClick={() => {
                  haptic(8)
                  setIndex(i)
                }}
                className={`rf-spot-tab relative min-w-0 overflow-hidden rounded-full px-3.5 py-2 text-[10px] font-semibold tracking-[0.1em] whitespace-nowrap uppercase transition sm:px-5 sm:text-[11px] ${
                  i === index ? 'is-on bg-white text-[#14110d] shadow-[0_8px_20px_-10px_rgba(0,0,0,0.35)]' : 'bg-white/45 text-ink-soft hover:bg-white/70'
                }`}
              >
                <span className="relative z-[1] truncate">{s.product.name}</span>
                {i === index && !paused && <span key={index} aria-hidden className="rf-spot-progress absolute inset-x-0 bottom-0 h-[2px]" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
