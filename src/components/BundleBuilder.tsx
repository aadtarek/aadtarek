import { Check, Plus, ShoppingBag, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllProducts } from '../api/catalog'
import { BUNDLE } from '../config'
import { formatPrice } from '../lib/format'
import { useCart } from '../store/cart'
import type { Product, ProductVariation } from '../types'

const sameSize = (a: string, b: string) => a.replace(/\s+/g, '').toLowerCase() === b.replace(/\s+/g, '').toLowerCase()

/**
 * Home page "Build your bundle": pick any BUNDLE.count fragrances in BUNDLE.size;
 * the tray beside the grid shows the picks and the set price.
 */
export function BundleBuilder() {
  const cart = useCart()
  const [picks, setPicks] = useState<{ product: Product; variation: ProductVariation }[]>([])
  if (!BUNDLE.enabled) return null

  const options = getAllProducts().flatMap((product) => {
    const variation = product.variations.find((v) => sameSize(v.size, BUNDLE.size) && v.inStock)
    return variation ? [{ product, variation }] : []
  })
  if (options.length === 0) return null

  const full = picks.length >= BUNDLE.count
  const regular = picks.reduce((n, p) => n + p.variation.price, 0)
  const unit = Math.max(...options.map((o) => o.variation.price))
  const save = unit * BUNDLE.count - BUNDLE.price
  const add = (o: (typeof options)[number]) => !full && setPicks((p) => [...p, o])
  const removeAt = (i: number) => setPicks((p) => p.filter((_, j) => j !== i))
  const addToCart = () => {
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
    <section aria-labelledby="bundle-title" className="bg-[#efe6db] py-12 lg:py-16">
      <div className="container-x grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[12px] tracking-[0.3em] text-ink-soft uppercase sm:text-[14px]">Bundle &amp; save</p>
              <h2 id="bundle-title" className="mt-2 font-serif text-[36px] leading-[1.05] sm:text-[48px]">
                {BUNDLE.title}
              </h2>
              <p className="mt-2 max-w-xl text-[15px] text-ink-soft sm:text-[17px]">{BUNDLE.text}</p>
            </div>
            <p className="rounded-full bg-olive px-4 py-2 text-[13px] text-cream sm:text-[14px]">
              Any {BUNDLE.count} × {BUNDLE.size} for <strong className="font-semibold">{formatPrice(BUNDLE.price)}</strong>
              {save > 0 && <span className="text-cream/75"> · instead of {formatPrice(unit * BUNDLE.count)}</span>}
            </p>
          </div>

          <ul className="mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
            {options.map((o) => {
              const n = picks.filter((p) => p.variation.id === o.variation.id).length
              return (
                <li key={o.product.id}>
                  <article className={`flex h-full flex-col overflow-hidden rounded-[10px] bg-card transition ${n ? 'ring-2 ring-olive' : 'ring-1 ring-line'}`}>
                    <Link to={`/product/${o.product.slug}`} className="relative block aspect-[4/3] overflow-hidden" tabIndex={-1} aria-hidden>
                      <img src={o.product.images[0].src} alt="" loading="lazy" className="size-full object-cover" />
                      {n > 0 && (
                        <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-olive px-2.5 py-1 text-[11.5px] text-cream">
                          <Check className="size-3.5" strokeWidth={2} /> {n > 1 ? `×${n}` : 'Added'}
                        </span>
                      )}
                    </Link>
                    <div className="flex flex-1 flex-col p-3 sm:p-4">
                      <h3 className="font-serif text-[16px] leading-tight uppercase sm:text-[18px]">{o.product.name}</h3>
                      {o.product.inspiredBy && <p className="mt-1 line-clamp-1 text-[12px] text-muted sm:text-[13px]">DNA · {o.product.inspiredBy}</p>}
                      <p className="mt-1.5 text-[13px] text-ink-soft">
                        {o.variation.size} · {formatPrice(o.variation.price)}
                      </p>
                      <button
                        type="button"
                        onClick={() => add(o)}
                        disabled={full}
                        aria-label={`Add ${o.product.name} to the bundle`}
                        className="mt-auto inline-flex h-10 items-center justify-center gap-1.5 rounded-[3px] border border-olive pt-0 text-[12px] font-medium tracking-[0.08em] text-olive uppercase transition hover:bg-olive hover:text-cream disabled:cursor-not-allowed disabled:opacity-40 sm:mt-3"
                      >
                        <Plus className="size-4" strokeWidth={1.6} /> Add
                      </button>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Tray: sticks to the bottom of the screen on phones, beside the grid on desktop */}
        <aside aria-label="Your bundle" className="sticky bottom-0 z-20 -mx-4 self-end sm:-mx-6 lg:top-[90px] lg:bottom-auto lg:mx-0 lg:self-start">
          <div className="rounded-t-2xl bg-cream p-4 shadow-[0_-10px_30px_-12px_rgba(40,30,20,0.25)] sm:p-5 lg:rounded-2xl lg:p-6 lg:shadow-[0_10px_40px_-20px_rgba(40,30,20,0.35)]">
            <div className="flex items-baseline justify-between">
              <p className="font-serif text-[22px] lg:text-[26px]">Your bundle</p>
              <p className="text-[13px] text-muted">
                {picks.length}/{BUNDLE.count} selected
              </p>
            </div>
            <ol className="mt-3 grid grid-cols-3 gap-2 lg:mt-4 lg:grid-cols-1 lg:gap-2.5">
              {Array.from({ length: BUNDLE.count }, (_, i) => {
                const p = picks[i]
                return (
                  <li key={i}>
                    {p ? (
                      <div className="relative flex flex-col items-center gap-1.5 rounded-lg bg-card p-1.5 text-center ring-1 ring-line lg:flex-row lg:gap-3 lg:p-2 lg:text-left">
                        <img src={p.product.images[0].src} alt="" className="aspect-square w-full rounded-md object-cover lg:size-14 lg:w-14" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-serif text-[13px] uppercase lg:text-[16px]">{p.product.name}</span>
                          <span className="hidden text-[13px] text-muted lg:block">
                            {p.variation.size} · {formatPrice(p.variation.price)}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAt(i)}
                          aria-label={`Remove ${p.product.name} from the bundle`}
                          className="absolute -top-1.5 -right-1.5 grid size-6 place-items-center rounded-full bg-ink text-cream lg:static lg:size-8 lg:bg-transparent lg:text-muted lg:hover:bg-chip lg:hover:text-ink"
                        >
                          <X className="size-3.5 lg:size-4" strokeWidth={1.8} />
                        </button>
                      </div>
                    ) : (
                      <div className="grid aspect-square place-items-center rounded-lg border border-dashed border-line-strong text-[13px] text-muted lg:aspect-auto lg:h-[72px]">
                        <span>
                          <span className="font-serif text-[20px] text-ink-soft">{i + 1}</span>
                          <span className="hidden lg:inline"> · Pick a fragrance</span>
                        </span>
                      </div>
                    )}
                  </li>
                )
              })}
            </ol>
            <div className="mt-3 flex items-end justify-between gap-3 border-t border-line pt-3 lg:mt-5 lg:pt-4">
              <div>
                <p className="text-[12px] tracking-[0.1em] text-muted uppercase">Bundle price</p>
                <p className="text-[22px] font-semibold">
                  {formatPrice(BUNDLE.price)}
                  {full && regular > BUNDLE.price && <span className="ml-2 text-[15px] font-normal text-muted line-through">{formatPrice(regular)}</span>}
                </p>
              </div>
              {save > 0 && <p className="pb-1 text-[13px] text-mocha">You save {formatPrice(full ? regular - BUNDLE.price : save)}</p>}
            </div>
            <button
              type="button"
              onClick={addToCart}
              disabled={!full}
              className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[4px] bg-olive text-[12.5px] font-medium tracking-[0.1em] text-cream uppercase transition hover:bg-olive-hover disabled:opacity-45 lg:mt-4 lg:h-[54px]"
            >
              <ShoppingBag className="size-[18px]" strokeWidth={1.4} />
              {full ? 'Add bundle to cart' : `Pick ${BUNDLE.count - picks.length} more`}
            </button>
          </div>
        </aside>
      </div>
    </section>
  )
}
