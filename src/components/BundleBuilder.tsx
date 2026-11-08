import { Check, Plus, Search, ShoppingBag, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { fullSizeVariations, getAllProducts } from '../api/catalog'
import { BUNDLE, bundlePercent, isBottleSize } from '../config'
import { formatPrice } from '../lib/format'
import { flyToCart } from '../lib/fx'
import { useCart } from '../store/cart'
import type { Product, ProductVariation } from '../types'

type Pick = { product: Product; variation: ProductVariation }

/**
 * Home page bundle builder: every fragrance, in the size the visitor chooses; the more
 * bottles in the bundle, the bigger the discount (BUNDLE.tiers, applied in the cart by
 * WordPress to any full bottles). The picks sit in the dark tray with the next step.
 */
export function BundleBuilder() {
  const cart = useCart()
  const [picks, setPicks] = useState<Pick[]>([])
  const [query, setQuery] = useState('')

  const products = useMemo(() => getAllProducts().filter((p) => p.images[0] && fullSizeVariations(p).some((v) => v.inStock && isBottleSize(v.size))), [])
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? products.filter((p) => `${p.name} ${p.inspiredBy ?? ''}`.toLowerCase().includes(q)) : products
  }, [products, query])

  const tiers = BUNDLE.tiers
  if (!BUNDLE.enabled || tiers.length === 0 || products.length === 0) return null

  const count = picks.length
  const percent = bundlePercent(count)
  const subtotal = picks.reduce((n, p) => n + p.variation.price, 0)
  const save = Math.round((subtotal * percent) / 100)
  const next = tiers.find((t) => t.count > count)
  const top = tiers[tiers.length - 1]
  const ready = count >= tiers[0].count

  const add = (p: Pick) => setPicks((list) => [...list, p])
  const removeAt = (i: number) => setPicks((list) => list.filter((_, j) => j !== i))
  const addToCart = (e: React.MouseEvent<HTMLElement>) => {
    flyToCart(e.currentTarget, picks[0]?.product.images[0]?.src)
    const grouped = new Map<number, { productId: number; variationId: number; quantity: number }>()
    for (const p of picks) {
      const g = grouped.get(p.variation.id)
      if (g) g.quantity++
      else grouped.set(p.variation.id, { productId: p.product.id, variationId: p.variation.id, quantity: 1 })
    }
    cart.addMany([...grouped.values()])
    setPicks([])
  }

  return (
    <section aria-labelledby="bundle-title" className="container-x py-6 lg:py-8">
      <div className="overflow-hidden rounded-[28px] bg-white px-5 py-8 shadow-[0_1px_0_rgba(60,40,10,0.04),0_24px_60px_-40px_rgba(60,40,10,0.45)] ring-1 ring-black/[0.04] lg:rounded-[36px] lg:p-12">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end lg:gap-12">
          {/* Title and the steps */}
          <div>
            <p className="text-[11px] font-semibold tracking-[0.24em] text-[#b8741a] uppercase">Bundle &amp; save</p>
            <h2 id="bundle-title" className="mt-3 font-serif text-[38px] leading-[1] lg:text-[52px]">
              {BUNDLE.title}
            </h2>
            <p className="mt-3 max-w-[28rem] text-[14.5px] leading-[1.55] text-ink-soft lg:text-[16px]">{BUNDLE.text}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {tiers.map((t) => {
                const on = count >= t.count
                return (
                  <li key={t.count} className={`rounded-full px-3.5 py-1.5 text-[12.5px] transition ${on ? 'bg-[#e49b2d] text-white' : 'bg-[#fbf3e6] text-[#7a4d0e]'}`}>
                    {t.count} bottles · <strong className="font-semibold">−{t.percent}%</strong>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* The bundle so far: picks, progress to the next step, totals and the button */}
          <div className="rounded-[24px] bg-[#14110d] p-4 text-white lg:p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] tracking-[0.14em] text-[#8f8474] uppercase">
                Your bundle · {count} {count === 1 ? 'bottle' : 'bottles'}
              </p>
              {percent > 0 && <span className="rf-pop-in rounded-full bg-[#e49b2d] px-2.5 py-0.5 text-[12px] font-semibold">−{percent}%</span>}
            </div>
            {count === 0 ? (
              <p className="mt-3 grid h-[76px] place-items-center rounded-[16px] border border-dashed border-[#3a3229] text-[13px] text-[#8f8474]">Add fragrances below — any size</p>
            ) : (
              <ul className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
                {picks.map((p, i) => (
                  <li key={`${p.variation.id}-${i}`} className="rf-pop-in relative w-[64px] shrink-0">
                    <img src={p.product.images[0].src} srcSet={p.product.images[0].srcset} sizes="64px" alt="" className="aspect-square w-full rounded-[12px] object-cover ring-1 ring-[#e49b2d]/50" />
                    <span className="mt-1 block truncate text-center text-[10.5px] text-[#cfc2ae]">{p.variation.size}</span>
                    <button
                      type="button"
                      onClick={() => removeAt(i)}
                      aria-label={`Remove ${p.product.name} ${p.variation.size}`}
                      className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-white text-[#14110d] shadow"
                    >
                      <X className="size-3" strokeWidth={2.4} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {/* Progress over the steps */}
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#2c261f]">
              <div className="h-full rounded-full bg-[#e49b2d] transition-[width] duration-500" style={{ width: `${Math.min(100, (count / top.count) * 100)}%` }} />
            </div>
            <p className="mt-2 text-[12.5px] text-[#e9c48a]">
              {next ? `Add ${next.count - count} more for ${next.percent}% off` : `Top discount unlocked: ${top.percent}% off`}
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[21px] leading-tight font-semibold whitespace-nowrap lg:text-[22px]">{formatPrice(subtotal - save)}</p>
                {save > 0 && (
                  <p className="text-[12.5px] whitespace-nowrap text-[#e9c48a]">
                    <span className="text-[#8f8474] line-through">{formatPrice(subtotal)}</span> · save {formatPrice(save)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={addToCart}
                disabled={!ready}
                className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-olive px-5 text-[12px] font-semibold tracking-[0.1em] text-white uppercase transition hover:bg-olive-hover disabled:opacity-40 lg:px-6"
              >
                <ShoppingBag className="size-[17px]" strokeWidth={1.5} />
                {ready ? 'Add bundle' : `Pick ${tiers[0].count - count} more`}
              </button>
            </div>
          </div>
        </div>

        {/* Every fragrance, with its sizes */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-serif text-[24px] leading-none lg:text-[28px]">
            All fragrances <span className="text-[15px] font-normal text-muted">({products.length})</span>
          </p>
          <label className="relative block w-full sm:max-w-[280px]">
            <span className="sr-only">Search fragrances</span>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" strokeWidth={1.6} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a scent"
              className="h-11 w-full rounded-full border border-line bg-cream/60 pr-4 pl-10 text-[14px] outline-none focus:border-[#e49b2d]"
            />
          </label>
        </div>
        {shown.length === 0 ? (
          <p className="mt-6 text-[14px] text-muted">No fragrance matches “{query}”.</p>
        ) : (
          <ul className="no-scrollbar -mx-5 mt-4 flex snap-x gap-3 overflow-x-auto px-5 pb-1 lg:-mx-12 lg:px-12">
            {shown.map((p, i) => (
              <li key={p.id} className="w-[168px] shrink-0 snap-start lg:w-[196px]">
                {i < 8 ? (
                  <BundleCard product={p} picked={picks.filter((x) => x.product.id === p.id).length} onAdd={add} />
                ) : (
                  <SideLazy>
                    <BundleCard product={p} picked={picks.filter((x) => x.product.id === p.id).length} onAdd={add} />
                  </SideLazy>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

/** One fragrance: picture, name, its bottle sizes to choose from, and Add. */
function BundleCard({ product, picked, onAdd }: { product: Product; picked: number; onAdd: (p: Pick) => void }) {
  const sizes = fullSizeVariations(product).filter((v) => isBottleSize(v.size))
  const [chosen, setChosen] = useState(() => (sizes.find((v) => v.inStock) ?? sizes[0]).id)
  const variation = sizes.find((v) => v.id === chosen) ?? sizes[0]
  const img = product.images[0]
  return (
    <article className={`flex h-full flex-col overflow-hidden rounded-[20px] bg-cream/70 transition ${picked ? 'ring-2 ring-[#e49b2d]' : 'ring-1 ring-line'}`}>
      <Link to={`/product/${product.slug}`} className="relative block aspect-[5/4] overflow-hidden" tabIndex={-1} aria-hidden>
        <img src={img.src} srcSet={img.srcset} sizes="200px" alt="" loading="lazy" decoding="async" className="size-full object-cover" />
        {picked > 0 && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-[#e49b2d] px-2 py-0.5 text-[11px] font-medium text-white">
            <Check className="size-3" strokeWidth={2.4} /> {picked > 1 ? `×${picked}` : 'In bundle'}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-1 font-serif text-[16px] leading-tight">{product.name}</h3>
        <div className="mt-2 flex flex-wrap gap-1" role="radiogroup" aria-label={`${product.name} size`}>
          {sizes.map((v) => (
            <button
              key={v.id}
              type="button"
              role="radio"
              aria-checked={v.id === variation.id}
              disabled={!v.inStock}
              onClick={() => setChosen(v.id)}
              className={`h-7 rounded-full px-2.5 text-[11.5px] transition disabled:opacity-35 ${v.id === variation.id ? 'bg-[#14110d] text-white' : 'bg-white text-ink ring-1 ring-line'}`}
            >
              {v.size.replace(/\s*ml/i, ' ml')}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[13px] font-medium">{formatPrice(variation.price)}</p>
        <button
          type="button"
          onClick={() => onAdd({ product, variation })}
          disabled={!variation.inStock}
          aria-label={`Add ${product.name} ${variation.size} to the bundle`}
          className="mt-3 inline-flex h-9 items-center justify-center gap-1 rounded-full bg-[#14110d] text-[11.5px] font-semibold tracking-[0.08em] text-white uppercase transition hover:bg-olive disabled:opacity-35"
        >
          <Plus className="size-3.5" strokeWidth={2} /> Add
        </button>
      </div>
    </article>
  )
}

/** A card further along the row: built when it scrolls near (a hundred cards stay light). */
function SideLazy({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || show) return
    if (!('IntersectionObserver' in window)) return setShow(true)
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && setShow(true), { rootMargin: '300px 900px' })
    io.observe(el)
    return () => io.disconnect()
  }, [show])
  return show ? <>{children}</> : <div ref={ref} aria-hidden className="h-[330px] rounded-[20px] bg-cream/70 ring-1 ring-line" />
}
