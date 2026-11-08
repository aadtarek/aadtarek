import { Check, Plus, Search, ShoppingBag, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllProducts } from '../api/catalog'
import { BUNDLE } from '../config'
import { formatPrice } from '../lib/format'
import { flyToCart } from '../lib/fx'
import { useCart } from '../store/cart'
import type { Product, ProductVariation } from '../types'

const sameSize = (a: string, b: string) => a.replace(/\s+/g, '').toLowerCase() === b.replace(/\s+/g, '').toLowerCase()
/** Cards shown in the row at once (search finds the rest). */
const SHOWN = 24

type Option = { product: Product; variation: ProductVariation }

/**
 * Home page “Build your trio”: pick any BUNDLE.count fragrances in BUNDLE.size for one set
 * price (WordPress applies the discount in the cart). The picks sit in numbered slots above
 * a scrolling row of fragrances, with a search to find any of them.
 */
export function BundleBuilder() {
  const cart = useCart()
  const [picks, setPicks] = useState<Option[]>([])
  const [query, setQuery] = useState('')

  const options = useMemo(
    () =>
      getAllProducts().flatMap((product) => {
        const variation = product.variations.find((v) => sameSize(v.size, BUNDLE.size) && v.inStock)
        return variation && product.images[0] ? [{ product, variation }] : []
      }),
    [],
  )
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q ? options.filter((o) => `${o.product.name} ${o.product.inspiredBy ?? ''}`.toLowerCase().includes(q)) : options
    return list.slice(0, SHOWN)
  }, [options, query])

  if (!BUNDLE.enabled || options.length < BUNDLE.count) return null

  const full = picks.length >= BUNDLE.count
  const regular = picks.reduce((n, p) => n + p.variation.price, 0)
  const unit = Math.max(...options.map((o) => o.variation.price))
  const usual = full ? regular : unit * BUNDLE.count
  const save = usual - BUNDLE.price
  const add = (o: Option) => !full && setPicks((p) => [...p, o])
  const removeAt = (i: number) => setPicks((p) => p.filter((_, j) => j !== i))
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
          {/* Title and offer */}
          <div>
            <p className="text-[11px] font-semibold tracking-[0.24em] text-[#b8741a] uppercase">Bundle &amp; save</p>
            <h2 id="bundle-title" className="mt-3 font-serif text-[40px] leading-[0.98] lg:text-[56px]">
              {BUNDLE.title}
            </h2>
            <p className="mt-3 max-w-[28rem] text-[14.5px] leading-[1.55] text-ink-soft lg:text-[16px]">{BUNDLE.text}</p>
            <p className="mt-5 inline-flex flex-wrap items-baseline gap-x-2 rounded-full bg-[#fbf3e6] px-4 py-2 text-[13px] text-[#7a4d0e]">
              Any {BUNDLE.count} × {BUNDLE.size}
              <strong className="text-[15px] font-semibold text-ink">{formatPrice(BUNDLE.price)}</strong>
              {save > 0 && <span className="text-[#a07a45] line-through">{formatPrice(unit * BUNDLE.count)}</span>}
            </p>
          </div>

          {/* The set: numbered slots, price and the button */}
          <div className="rounded-[24px] bg-[#14110d] p-4 text-white lg:p-5">
            <ol className="grid grid-cols-3 gap-2.5 lg:gap-3">
              {Array.from({ length: BUNDLE.count }, (_, i) => {
                const p = picks[i]
                return (
                  <li key={i} className="relative">
                    {p ? (
                      <div className="rf-pop-in overflow-hidden rounded-[16px] bg-[#1f1b16] ring-1 ring-[#e49b2d]/60">
                        <img src={p.product.images[0].src} srcSet={p.product.images[0].srcset} sizes="120px" alt="" className="aspect-square w-full object-cover" />
                        <p className="truncate px-2 py-1.5 font-serif text-[14px] leading-tight lg:text-[16px]">{p.product.name}</p>
                        <button
                          type="button"
                          onClick={() => removeAt(i)}
                          aria-label={`Remove ${p.product.name} from the bundle`}
                          className="absolute top-1.5 right-1.5 grid size-7 place-items-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/80"
                        >
                          <X className="size-3.5" strokeWidth={2} />
                        </button>
                      </div>
                    ) : (
                      <div className="grid aspect-[1/1.18] place-items-center rounded-[16px] border border-dashed border-[#3a3229] text-center">
                        <span>
                          <span className="block font-serif text-[28px] leading-none text-[#e49b2d]">{i + 1}</span>
                          <span className="mt-1 block text-[11px] tracking-[0.1em] text-[#8f8474] uppercase">Pick</span>
                        </span>
                      </div>
                    )}
                  </li>
                )
              })}
            </ol>
            <div className="mt-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] tracking-[0.14em] text-[#8f8474] uppercase">
                  {picks.length}/{BUNDLE.count} · Set price
                </p>
                <p className="text-[22px] leading-tight font-semibold">{formatPrice(BUNDLE.price)}</p>
                {save > 0 && <p className="text-[12.5px] text-[#e9c48a]">You save {formatPrice(save)}</p>}
              </div>
              <button
                type="button"
                onClick={addToCart}
                disabled={!full}
                className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-olive px-5 text-[12px] font-semibold tracking-[0.1em] text-white uppercase transition hover:bg-olive-hover disabled:opacity-40 lg:px-6"
              >
                <ShoppingBag className="size-[17px]" strokeWidth={1.5} />
                {full ? 'Add set' : `${BUNDLE.count - picks.length} more`}
              </button>
            </div>
          </div>
        </div>

        {/* The fragrances */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-serif text-[24px] leading-none lg:text-[28px]">Choose your {BUNDLE.count}</p>
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
            {shown.map((o) => {
              const n = picks.filter((p) => p.variation.id === o.variation.id).length
              const img = o.product.images[0]
              return (
                <li key={o.product.id} className="w-[150px] shrink-0 snap-start lg:w-[180px]">
                  <article className={`flex h-full flex-col overflow-hidden rounded-[20px] bg-cream/70 transition ${n ? 'ring-2 ring-[#e49b2d]' : 'ring-1 ring-line'}`}>
                    <Link to={`/product/${o.product.slug}`} className="relative block aspect-[5/4] overflow-hidden" tabIndex={-1} aria-hidden>
                      <img src={img.src} srcSet={img.srcset} sizes="180px" alt="" loading="lazy" decoding="async" className="size-full object-cover" />
                      {n > 0 && (
                        <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-[#e49b2d] px-2 py-0.5 text-[11px] font-medium text-white">
                          <Check className="size-3" strokeWidth={2.4} /> {n > 1 ? `×${n}` : 'In set'}
                        </span>
                      )}
                    </Link>
                    <div className="flex flex-1 flex-col p-3">
                      <h3 className="line-clamp-1 font-serif text-[17px] leading-tight">{o.product.name}</h3>
                      <p className="mt-0.5 line-clamp-1 text-[12px] text-muted">{o.product.inspiredBy ? `DNA · ${o.product.inspiredBy}` : o.variation.size}</p>
                      <button
                        type="button"
                        onClick={() => add(o)}
                        disabled={full}
                        aria-label={`Add ${o.product.name} to the bundle`}
                        className="mt-3 inline-flex h-9 items-center justify-center gap-1 rounded-full bg-[#14110d] text-[11.5px] font-semibold tracking-[0.08em] text-white uppercase transition hover:bg-olive disabled:opacity-35"
                      >
                        <Plus className="size-3.5" strokeWidth={2} /> Add
                      </button>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
