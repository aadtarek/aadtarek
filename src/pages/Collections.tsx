import { ArrowRight, Check, Gift, Minus, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fullSizeVariations, getAllProducts, giftBoxProduct, sampleVariation } from '../api/catalog'
import { PageHeader } from '../components/PageHeader'
import { ProductCard } from '../components/ProductCard'
import { SizePicker } from '../components/SizePicker'
import { GIFT_BOX } from '../config'
import { collections, findCollection, type Collection } from '../data/collections'
import { formatPrice } from '../lib/format'
import { flyToCart } from '../lib/fx'
import { useCart } from '../store/cart'
import type { Product } from '../types'
import collectionsImage from '../assets/categories/oriental.webp'
import { NotFound } from './NotFound'

export function CollectionsIndex() {
  return (
    <div className="pb-16 lg:pb-24">
      <PageHeader eyebrow="Collections" title="Curated for every you" image={collectionsImage}>
        <p className="mt-3 max-w-xl text-[15px] leading-[1.6] text-ink-soft sm:text-[16px]">
          From our inspired Perfume Lab to discovery sets and gifts — find the way into Rfaheya that suits you.
        </p>
      </PageHeader>
      <ul className="container-x mt-6 grid grid-cols-2 gap-2.5 lg:mt-8 lg:grid-cols-6 lg:gap-4">
        {collections.map((c, i) => (
          <li key={c.slug} className={i < 2 ? 'col-span-2 lg:col-span-3' : i === 2 ? 'col-span-2 lg:col-span-2' : 'lg:col-span-2'}>
            <Link to={`/collections/${c.slug}`} className="group relative block overflow-hidden rounded-[22px] bg-[#1c120b] lg:rounded-[28px]">
              <img
                src={c.image}
                alt=""
                loading={i === 0 ? undefined : 'lazy'}
                decoding="async"
                className={`w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 ${i < 3 ? 'aspect-[16/10]' : 'aspect-[4/5] lg:aspect-[16/10]'}`}
              />
              <span className="absolute inset-x-2 bottom-2 flex items-center gap-2.5 rounded-2xl bg-white/85 py-2.5 pr-2 pl-3.5 text-[#14110d] backdrop-blur-xl lg:inset-x-3 lg:bottom-3 lg:rounded-[20px] lg:py-3 lg:pr-3 lg:pl-[18px]">
                <span className="min-w-0 flex-1">
                  <span className="block font-serif text-[20px] leading-none lg:text-[28px]">{c.name}</span>
                  <span className={`mt-1 truncate text-[12px] text-[#7b6e5b] ${i < 3 ? 'block' : 'hidden lg:block'}`}>{c.tagline}</span>
                </span>
                <span className="grid size-[30px] shrink-0 place-items-center rounded-full bg-olive text-on-accent transition group-hover:translate-x-0.5 lg:size-[38px]">
                  <ArrowRight className="size-4" strokeWidth={1.6} />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function CollectionPage() {
  const { slug = '' } = useParams()
  const c = findCollection(slug)
  if (!c) return <NotFound />

  return (
    <div className="pb-16 lg:pb-24">
      <div className="container-x pt-3 lg:pt-4">
        <section className="relative overflow-hidden rounded-[28px] bg-[#1c120b] text-white lg:rounded-[36px]">
          <img src={c.image} alt="" className="absolute inset-0 size-full object-cover opacity-80" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[#140c07]/90 via-[#140c07]/55 to-[#140c07]/10" />
          <div className="relative px-6 py-10 lg:px-12 lg:py-16">
            <nav aria-label="Breadcrumb" className="text-[11px] tracking-[0.12em] text-white/70 uppercase">
              <Link to="/" className="hover:text-white">
                Home
              </Link>{' '}
              <span className="mx-1.5">›</span>
              <Link to="/collections" className="hover:text-white">
                Collections
              </Link>{' '}
              <span className="mx-1.5">›</span>
              <span className="text-white">{c.name}</span>
            </nav>
            <p className="mt-8 text-[11px] font-semibold tracking-[0.24em] text-[#f0c27a] uppercase">{c.tagline}</p>
            <h1 className="mt-2.5 font-serif text-[46px] leading-none text-white sm:text-[68px]">{c.label}</h1>
            <p className="mt-4 max-w-xl text-[15px] leading-[1.6] text-white/85 sm:text-[17px]">{c.description}</p>
          </div>
        </section>
      </div>
      <div className="container-x mt-6 lg:mt-8">
        {c.kind === 'list' && <ProductList collection={c} />}
        {c.kind === 'discovery' && <DiscoveryBuilder />}
        {c.kind === 'gift' && <GiftBuilder />}
      </div>
    </div>
  )
}

function ProductList({ collection }: { collection: Collection }) {
  const items = getAllProducts().filter((p) => collection.includes?.(p))
  return (
    <>
      <p className="text-[14px] text-muted">
        {items.length} {items.length === 1 ? 'fragrance' : 'fragrances'}
      </p>
      <ul className="mt-5 grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((p) => (
          <li key={p.id}>
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </>
  )
}

/** The small discovery bottle of a product (its sample size), if it sells one. */
const fiveMl = (p: Product) => sampleVariation(p)

/** A discovery set holds exactly one of these numbers of samples. */
const SET_SIZES = [10, 20]

function DiscoveryBuilder() {
  const cart = useCart()
  // Only fragrances that come in a discovery (sample) size.
  const products = getAllProducts().filter((p) => fiveMl(p)?.inStock)
  const [picked, setPicked] = useState<number[]>([])
  const [query, setQuery] = useState('')
  const [limit, setLimit] = useState(12)
  const max = SET_SIZES[SET_SIZES.length - 1]
  const full = picked.length >= max
  const toggle = (id: number) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= max ? p : [...p, id]))
  const selected = picked.flatMap((id) => products.filter((p) => p.id === id))
  const total = selected.reduce((n, p) => n + (fiveMl(p)?.price ?? 0), 0)
  const ready = SET_SIZES.includes(selected.length)
  const next = SET_SIZES.find((n) => n > selected.length) ?? max
  const q = query.trim().toLowerCase()
  const matching = products.filter((p) => !q || p.name.toLowerCase().includes(q) || (p.inspiredBy ?? '').toLowerCase().includes(q))
  const size = selected[0] ? fiveMl(selected[0])?.size.replace(/\s*ML$/i, ' ml') : products[0] ? fiveMl(products[0])?.size.replace(/\s*ML$/i, ' ml') : ''
  const hint = ready
    ? selected.length < max
      ? `Your set of ${selected.length} is ready — or keep going to ${max}.`
      : `Your set of ${max} is ready.`
    : `Pick ${next - selected.length} more for a set of ${next}.`

  const add = (e: React.MouseEvent<HTMLElement>) => {
    if (!ready) return
    flyToCart(e.currentTarget, selected[0]?.images[0]?.src)
    cart.addMany(selected.map((p) => ({ productId: p.id, variationId: fiveMl(p)!.id })))
    setPicked([])
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:gap-12">
      <div>
        <h2 className="font-serif text-[30px] sm:text-[38px]">Choose your samples</h2>
        <p className="mt-1 text-ink-soft">
          A discovery set is <strong className="font-semibold text-ink">10 or 20</strong> fragrances{size ? ` in ${size}` : ''}. Pick the ones you want to live with.
        </p>
        <SetProgress count={selected.length} className="mt-5" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setLimit(12)
          }}
          placeholder="Search a fragrance or what it's inspired by…"
          aria-label="Search fragrances"
          className="mt-4 h-12 w-full rounded-full border-[1.5px] border-line bg-sand px-5 text-[14.5px] outline-none focus:border-olive"
        />
        {products.length === 0 && <p className="mt-6 text-muted">No discovery sizes are available right now.</p>}
        <ul className="mt-4 grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-3">
          {matching.slice(0, limit).map((p) => {
            const on = picked.includes(p.id)
            const v = fiveMl(p)!
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => toggle(p.id)}
                  aria-pressed={on}
                  disabled={!on && full}
                  className={`rf-white group block w-full overflow-hidden rounded-[20px] border text-left transition disabled:cursor-not-allowed disabled:opacity-45 ${
                    on ? 'border-olive ring-1 ring-olive' : 'border-line hover:border-line-strong'
                  }`}
                >
                  <span className="relative block aspect-square overflow-hidden bg-chip sm:aspect-[5/4]">
                    <img src={p.images[0].src} alt="" loading="lazy" className="size-full object-cover transition duration-700 group-hover:scale-[1.04]" />
                    <span
                      aria-hidden
                      className={`absolute top-2 right-2 grid size-8 place-items-center rounded-full transition ${on ? 'bg-olive text-on-accent' : 'bg-cream/90 text-ink'}`}
                    >
                      {on ? <Check className="size-4" strokeWidth={2.5} /> : <Plus className="size-4" strokeWidth={2} />}
                    </span>
                  </span>
                  <span className="block px-2.5 pt-2 pb-2.5 sm:px-3.5">
                    <span className="block truncate font-serif text-[16px] leading-tight sm:text-[19px]">{p.name}</span>
                    <span className="mt-0.5 block text-[11.5px] font-medium text-ink-soft sm:text-[12.5px]">
                      {v.size.replace(/\s*ML$/i, ' ml')} · {formatPrice(v.price)}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        {matching.length === 0 && products.length > 0 && <p className="mt-6 text-center text-[14px] text-muted">No fragrance matches “{query}”.</p>}
        {matching.length > limit && (
          <button
            type="button"
            onClick={() => setLimit((n) => n + 12)}
            className="mx-auto mt-5 flex h-12 items-center rounded-full px-7 text-[12px] font-semibold tracking-[0.12em] uppercase shadow-[inset_0_0_0_1.5px_var(--color-line-strong)] hover:shadow-[inset_0_0_0_1.5px_var(--color-ink)]"
          >
            Show more ({matching.length - limit})
          </button>
        )}
      </div>

      {/* Phone: the set's progress follows along at the bottom. */}
      {selected.length > 0 && (
        <div className="fixed inset-x-3 bottom-[calc(84px+env(safe-area-inset-bottom))] z-30 rounded-[26px] bg-[#14110d] px-4 pt-3 pb-3 text-white shadow-[0_18px_40px_-16px_rgba(0,0,0,0.6)] lg:hidden">
          <SetProgress count={selected.length} dark />
          <div className="mt-2.5 flex items-center gap-3">
            <p className="flex-1 text-[12.5px] text-white/80">{hint}</p>
            <button
              type="button"
              onClick={add}
              disabled={!ready}
              className="h-11 shrink-0 rounded-full bg-olive px-5 text-[11.5px] font-semibold tracking-[0.1em] text-on-accent uppercase disabled:opacity-40"
            >
              Add · {formatPrice(total)}
            </button>
          </div>
        </div>
      )}

      <aside className="h-fit rf-white rounded-[28px] border border-line p-6 lg:sticky lg:top-24">
        <p className="text-[13px] font-semibold tracking-[0.14em] uppercase">Your discovery set</p>
        <SetProgress count={selected.length} className="mt-4" />
        <p className={`mt-3 text-[13.5px] ${ready ? 'font-medium text-[#55662a]' : 'text-ink-soft'}`}>{hint}</p>
        {selected.length > 0 && (
          <ul className="mt-3 max-h-[300px] divide-y divide-line overflow-y-auto">
            {selected.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2 text-[14px]">
                <span className="truncate">
                  {p.name} · {fiveMl(p)?.size.replace(/\s*ML$/i, ' ml')}
                </span>
                <button type="button" onClick={() => toggle(p.id)} aria-label={`Remove ${p.name}`} className="text-muted hover:text-ink">
                  <Minus className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 flex justify-between border-t border-line pt-4 text-[17px] font-semibold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </p>
        <button
          type="button"
          disabled={!ready}
          onClick={add}
          className="mt-5 h-[52px] w-full rounded-full bg-olive text-[12.5px] font-semibold tracking-[0.12em] text-on-accent uppercase transition hover:bg-olive-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {ready ? `Add set of ${selected.length} to cart` : `Pick ${next - selected.length} more`}
        </button>
      </aside>
    </div>
  )
}

/** A bar from 0 to 20 with the 10 and 20 stops marked; it turns green on a stop. */
function SetProgress({ count, dark = false, className = '' }: { count: number; dark?: boolean; className?: string }) {
  const max = SET_SIZES[SET_SIZES.length - 1]
  const ready = SET_SIZES.includes(count)
  return (
    <div className={className} role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={count} aria-label="Samples in your set">
      <div className="flex items-baseline justify-between text-[12px] font-semibold tabular-nums">
        <span className={dark ? 'text-white' : 'text-ink'}>
          {count} <span className={dark ? 'text-white/50' : 'text-muted'}>/ {count <= SET_SIZES[0] ? SET_SIZES[0] : max} samples</span>
        </span>
        <span className={dark ? 'text-white/50' : 'text-muted'}>10 or 20</span>
      </div>
      <div className={`relative mt-2 h-2.5 rounded-full ${dark ? 'bg-white/15' : 'bg-chip'}`}>
        <span
          className={`absolute inset-y-0 left-0 rounded-full transition-[width,background-color] duration-500 ${ready ? 'bg-[#6f8a3a]' : 'bg-olive'}`}
          style={{ width: `${(Math.min(count, max) / max) * 100}%` }}
        />
        {SET_SIZES.map((n) => (
          <span
            key={n}
            aria-hidden
            className={`absolute top-1/2 grid size-[22px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-[9.5px] font-bold transition ${
              count >= n ? 'bg-[#6f8a3a] text-white' : dark ? 'bg-[#2a221b] text-white/60 ring-2 ring-white/20' : 'bg-white text-muted ring-2 ring-line-strong'
            }`}
            style={{ left: `${Math.min(100, (n / max) * 100)}%`, ...(n === max ? { left: 'calc(100% - 11px)' } : {}) }}
          >
            {n}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Largest full-size bottle (variations are listed smallest → largest). */
function lastSize(p: Product) {
  const sizes = fullSizeVariations(p).filter((v) => v.inStock)
  return sizes[sizes.length - 1]
}

function GiftBuilder() {
  const products = getAllProducts().filter((p) => lastSize(p))
  if (products.length === 0) return <p className="text-ink-soft">No fragrances available yet.</p>
  return <GiftBuilderForm products={products} />
}

/** Any fragrances, each in its own size, in one box; packaging is priced by how many are inside. */
function GiftBuilderForm({ products }: { products: Product[] }) {
  const cart = useCart()
  // product id → chosen variation id, in the order they were picked
  const [picked, setPicked] = useState<[number, number][]>([])
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState('')
  const [limit, setLimit] = useState(12)
  const MAX_MESSAGE = 200
  const max = GIFT_BOX.max
  const full = picked.length >= max

  const toggle = (p: Product) =>
    setPicked((list) => (list.some(([id]) => id === p.id) ? list.filter(([id]) => id !== p.id) : list.length >= max ? list : [...list, [p.id, lastSize(p)!.id]]))
  const setSize = (productId: number, variationId: number) => setPicked((list) => list.map(([id, v]) => (id === productId ? [id, variationId] : [id, v])))

  const items = picked.flatMap(([id, variationId]) => {
    const product = products.find((p) => p.id === id)
    const variation = product?.variations.find((v) => v.id === variationId)
    return product && variation ? [{ product, variation }] : []
  })
  const q = query.trim().toLowerCase()
  const matching = products.filter((p) => !q || p.name.toLowerCase().includes(q) || (p.inspiredBy ?? '').toLowerCase().includes(q))
  const shownProducts = matching.slice(0, limit)
  const box = giftBoxProduct()
  const boxVariation = GIFT_BOX.enabled && items.length ? box.variations[items.length - 1] : undefined
  const packaging = boxVariation?.price ?? 0
  const total = items.reduce((n, i) => n + i.variation.price, 0) + packaging

  const addToCart = (e: React.MouseEvent<HTMLElement>) => {
    flyToCart(e.currentTarget, items[0]?.product.images[0]?.src)
    const contents = items.map((i) => `${i.product.name} ${i.variation.size}`).join(', ')
    const note = `Box: ${contents}${message.trim() ? ` · Card: “${message.trim()}”` : ''}`
    // The note rides on the packaging line (or, with packaging off, on the first fragrance).
    cart.addMany([
      ...items.map((i, n) => ({ productId: i.product.id, variationId: i.variation.id, giftMessage: !boxVariation && n === 0 ? note : undefined })),
      ...(boxVariation ? [{ productId: box.id, variationId: boxVariation.id, giftMessage: note }] : []),
    ])
    setPicked([])
    setMessage('')
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-12">
      <div>
        <h2 className="font-serif text-[30px] sm:text-[38px]">1. Choose the fragrances</h2>
        <p className="mt-1 text-ink-soft">
          Pick any fragrances you like — up to {max} in one box — and choose a size for each.
        </p>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setLimit(12)
          }}
          placeholder="Search a fragrance or what it's inspired by…"
          aria-label="Search fragrances"
          className="mt-5 h-12 w-full rounded-full border-[1.5px] border-line bg-sand px-5 text-[14.5px] outline-none focus:border-olive"
        />
        <ul className="mt-4 grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-3">
          {shownProducts.map((p) => {
            const choice = picked.find(([id]) => id === p.id)
            const on = Boolean(choice)
            return (
              <li key={p.id} className={`overflow-hidden rounded-2xl border bg-card transition ${on ? 'border-olive ring-1 ring-olive' : 'border-line'}`}>
                <button type="button" onClick={() => toggle(p)} aria-pressed={on} disabled={!on && full} className="group block w-full text-left disabled:cursor-not-allowed disabled:opacity-50">
                  <span className="relative block aspect-square overflow-hidden bg-chip sm:aspect-[5/4]">
                    <img src={p.images[0].src} alt="" loading="lazy" className="size-full object-cover transition duration-700 group-hover:scale-[1.04]" />
                    <span
                      aria-hidden
                      className={`absolute top-2 right-2 grid size-8 sm:top-3 sm:right-3 place-items-center rounded-full transition ${on ? 'bg-olive text-on-accent' : 'bg-cream/90 text-ink'}`}
                    >
                      {on ? <Check className="size-4" strokeWidth={2.5} /> : <Plus className="size-4" strokeWidth={2} />}
                    </span>
                  </span>
                  <span className="block px-2.5 pt-2 pb-2 sm:px-4 sm:pt-3">
                    <span className="block truncate font-serif text-[16px] leading-tight sm:text-[19px]">{p.name}</span>
                    <span className="block truncate text-[11.5px] text-muted sm:text-[12.5px]">{p.inspiredBy ? `Inspired by ${p.inspiredBy}` : p.tagline}</span>
                  </span>
                </button>
                {choice && (
                  <div className="animate-fade-in px-2 pb-2 sm:px-3 sm:pb-3">
                    <SizePicker variations={fullSizeVariations(p)} value={choice[1]} onChange={(v) => setSize(p.id, v)} />
                  </div>
                )}
              </li>
            )
          })}
        </ul>
        {matching.length === 0 && <p className="mt-6 text-center text-[14px] text-muted">No fragrance matches “{query}”.</p>}
        {matching.length > limit && (
          <button
            type="button"
            onClick={() => setLimit((n) => n + 12)}
            className="mx-auto mt-5 flex h-12 items-center rounded-full px-7 text-[12px] font-semibold tracking-[0.12em] uppercase shadow-[inset_0_0_0_1.5px_var(--color-line-strong)] hover:shadow-[inset_0_0_0_1.5px_var(--color-ink)]"
          >
            Show more ({matching.length - limit})
          </button>
        )}
      </div>

      {/* Phone: the box follows along at the bottom, so the choice is never far away. */}
      {items.length > 0 && (
        <a
          href="#gift-summary"
          className="fixed inset-x-3 bottom-[calc(84px+env(safe-area-inset-bottom))] z-30 flex h-14 items-center gap-3 rounded-full bg-[#14110d] pr-2 pl-5 text-white shadow-[0_18px_40px_-16px_rgba(0,0,0,0.6)] lg:hidden"
        >
          <Gift className="size-[18px] text-[#f0c27a]" strokeWidth={1.5} />
          <span className="flex-1 text-[13px]">
            <strong className="font-semibold">{items.length}/{max}</strong> in your box · {formatPrice(total)}
          </span>
          <span className="rounded-full bg-olive px-4 py-2.5 text-[11.5px] font-semibold tracking-[0.1em] text-on-accent uppercase">Review</span>
        </a>
      )}

      <aside id="gift-summary" className="h-fit scroll-mt-24 rf-white rounded-[28px] border border-line p-5 sm:p-6 lg:sticky lg:top-24">
        <p className="flex items-center gap-2 text-[13px] font-semibold tracking-[0.14em] uppercase">
          <Gift className="size-4" strokeWidth={1.5} />
          Your gift box
          <span className="ml-auto text-[12px] font-normal tracking-normal text-muted normal-case">
            {items.length}/{max}
          </span>
        </p>
        {items.length === 0 ? (
          <p className="mt-4 text-[14px] text-muted">Pick one or more fragrances to fill the box.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {items.map((i) => (
              <li key={i.product.id} className="flex items-center gap-3 py-2.5 text-[14px]">
                <img src={i.product.images[0].src} alt="" className="size-10 rounded-xl object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{i.product.name}</span>
                  <span className="block text-[12px] text-muted">{i.variation.size}</span>
                </span>
                <span className="text-[13px] font-medium">{formatPrice(i.variation.price)}</span>
                <button type="button" onClick={() => toggle(i.product)} aria-label={`Remove ${i.product.name}`} className="text-muted hover:text-ink">
                  <Minus className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <label className="mt-5 block">
          <span className="text-[13px] font-semibold tracking-[0.14em] uppercase">2. Your message</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE))}
            rows={3}
            placeholder="A few words for the card inside the box (optional)…"
            className="mt-2 w-full rounded-[18px] border-[1.5px] border-line bg-sand px-4 py-3 text-[14.5px] outline-none focus:border-olive"
          />
          <span className="block text-right text-[11.5px] text-muted">
            {message.length}/{MAX_MESSAGE}
          </span>
        </label>

        {GIFT_BOX.enabled && (
          <div className="mt-3 rounded-xl bg-chip px-4 py-3 text-[13px]">
            <p className="flex justify-between">
              <span>Gift packaging{items.length ? ` · ${items.length} ${items.length === 1 ? 'fragrance' : 'fragrances'}` : ''}</span>
              <span className="font-semibold">{items.length ? formatPrice(packaging) : '—'}</span>
            </p>
            <p className="mt-1 text-[11.5px] text-muted">
              {box.variations.map((v, i) => `${i + 1}: ${formatPrice(v.price)}`).join(' · ')}
            </p>
          </div>
        )}
        <p className="mt-4 flex justify-between border-t border-line pt-4 text-[17px] font-semibold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </p>
        <button
          type="button"
          disabled={items.length === 0}
          onClick={addToCart}
          className="mt-4 inline-flex h-[52px] w-full items-center justify-center gap-3 rounded-full bg-olive text-[12.5px] font-medium tracking-[0.12em] text-on-accent uppercase transition hover:bg-olive-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Gift className="size-5" strokeWidth={1.4} />
          Add gift box to cart
        </button>
      </aside>
    </div>
  )
}
