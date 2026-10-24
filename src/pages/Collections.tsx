import { ArrowRight, Check, Gift, Minus, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fullSizeVariations, getAllProducts, giftBoxProduct, sampleVariation } from '../api/catalog'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { ProductCard } from '../components/ProductCard'
import { SizePicker } from '../components/SizePicker'
import { GIFT_BOX } from '../config'
import { collections, findCollection, type Collection } from '../data/collections'
import { formatPrice } from '../lib/format'
import { flyToCart } from '../lib/fx'
import { useCart } from '../store/cart'
import type { Product } from '../types'
import { NotFound } from './NotFound'

export function CollectionsIndex() {
  return (
    <div className="pb-16 lg:pb-24">
      <div className="container-x pt-6 lg:pt-8">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Collections' }]} />
        <p className="mt-8 text-[12px] tracking-[0.3em] text-gold uppercase sm:text-[14px]">Collections</p>
        <h1 className="mt-2 font-serif text-[44px] leading-[1] sm:text-[60px]">Curated for every you.</h1>
        <p className="mt-4 max-w-xl text-[17px] leading-[1.7] text-ink-soft">
          From our inspired Perfume Lab to discovery sets and gifts — find the way into Rfaheya that suits you.
        </p>
      </div>
      <ul className="container-x mt-10 grid gap-[13px] md:grid-cols-2 lg:grid-cols-6">
        {collections.map((c, i) => (
          <li key={c.slug} className={i < 2 ? 'lg:col-span-3' : 'lg:col-span-2'}>
            <Link to={`/collections/${c.slug}`} className="group relative block overflow-hidden rounded-lg bg-[#1c120b]">
              <img
                src={c.image}
                alt=""
                loading={i === 0 ? undefined : 'lazy'}
                decoding="async"
                className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${i < 2 ? 'aspect-[16/10]' : 'aspect-[4/5]'}`}
              />
              <span className="absolute inset-0 bg-gradient-to-t from-[#140c07]/85 via-[#140c07]/20 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 p-6 text-cream">
                <span className="block font-serif text-[30px] leading-none">{c.name}</span>
                <span className="mt-2 block text-[15px] text-cream/85">{c.tagline}</span>
                <span className="mt-4 inline-flex items-center gap-2 text-[12px] tracking-[0.14em] uppercase">
                  Explore <ArrowRight className="size-4 transition group-hover:translate-x-1" strokeWidth={1.5} />
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
      <section className="relative overflow-hidden bg-[#1c120b] text-cream">
        <img src={c.image} alt="" className="absolute inset-0 size-full object-cover opacity-80" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[#140c07]/90 via-[#140c07]/55 to-[#140c07]/10" />
        <div className="container-x relative py-14 lg:py-20">
          <nav aria-label="Breadcrumb" className="text-[12px] tracking-[0.08em] text-cream/70 uppercase">
            <Link to="/" className="hover:text-cream">Home</Link> <span className="mx-1.5">›</span>
            <Link to="/collections" className="hover:text-cream">Collections</Link> <span className="mx-1.5">›</span>
            <span className="text-cream">{c.name}</span>
          </nav>
          <p className="mt-8 text-[12px] tracking-[0.3em] text-cream/80 uppercase sm:text-[14px]">{c.tagline}</p>
          <h1 className="mt-2 font-serif text-[48px] leading-[1] sm:text-[68px]">{c.label}</h1>
          <p className="mt-4 max-w-xl text-[17px] leading-[1.7] text-cream/85">{c.description}</p>
        </div>
      </section>
      <div className="container-x mt-10">
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

/** The 5 ML discovery bottle of a product, if it sells one. */
const fiveMl = (p: Product) => {
  const v = sampleVariation(p)
  return v && parseFloat(v.size) === 5 ? v : undefined
}

function DiscoveryBuilder() {
  const cart = useCart()
  // Only fragrances that come in the 5 ML discovery size.
  const products = getAllProducts().filter((p) => fiveMl(p)?.inStock)
  const [picked, setPicked] = useState<number[]>([])
  const toggle = (id: number) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  const selected = products.filter((p) => picked.includes(p.id))
  const total = selected.reduce((n, p) => n + (fiveMl(p)?.price ?? 0), 0)

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
      <div>
        <h2 className="font-serif text-[30px] sm:text-[38px]">Choose your samples</h2>
        <p className="mt-1 text-ink-soft">Every fragrance here in its 5 ML discovery size. Pick as many as you like.</p>
        {products.length === 0 && <p className="mt-6 text-muted">No 5 ML discovery sizes are available right now.</p>}
        <ul className="mt-6 grid gap-[13px] sm:grid-cols-2">
          {products.map((p) => {
            const on = picked.includes(p.id)
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => toggle(p.id)}
                  aria-pressed={on}
                  className={`flex w-full items-center gap-4 overflow-hidden rounded-lg border bg-card text-left transition ${
                    on ? 'border-olive ring-1 ring-olive' : 'border-line hover:border-line-strong'
                  }`}
                >
                  <img src={p.images[0].src} alt="" className="h-24 w-32 shrink-0 object-cover" />
                  <span className="min-w-0 flex-1 py-3">
                    <span className="block font-serif text-[19px]">{p.name}</span>
                    <span className="block truncate text-[13px] text-muted">{p.tagline}</span>
                    <span className="mt-1 block text-[12.5px] font-medium text-ink-soft">
                      {fiveMl(p)!.size} · {formatPrice(fiveMl(p)!.price)}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className={`mr-4 grid size-7 shrink-0 place-items-center rounded-full border-2 ${on ? 'border-olive bg-olive text-on-accent' : 'border-line-strong'}`}
                  >
                    {on ? <Check className="size-4" strokeWidth={2.5} /> : <Plus className="size-4" strokeWidth={2} />}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
      <aside className="h-fit rounded-lg bg-card p-6 shadow-[0_0_0_1px_rgba(60,45,20,0.06)] lg:sticky lg:top-24">
        <p className="text-[13px] font-semibold tracking-[0.14em] uppercase">Your discovery set</p>
        {selected.length === 0 ? (
          <p className="mt-4 text-[14.5px] text-muted">Select at least one fragrance to start your set.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {selected.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-[14px]">
                <span>{p.name} · {fiveMl(p)?.size}</span>
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
          disabled={selected.length === 0}
          onClick={(e) => {
            flyToCart(e.currentTarget, selected[0]?.images[0]?.src)
            cart.addMany(selected.map((p) => ({ productId: p.id, variationId: fiveMl(p)!.id })))
            setPicked([])
          }}
          className="mt-5 h-[52px] w-full rounded-full bg-olive text-[12.5px] font-medium tracking-[0.12em] text-on-accent uppercase transition hover:bg-olive-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add set to cart
        </button>
      </aside>
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
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((p) => {
            const choice = picked.find(([id]) => id === p.id)
            const on = Boolean(choice)
            return (
              <li key={p.id} className={`overflow-hidden rounded-2xl border bg-card transition ${on ? 'border-olive ring-1 ring-olive' : 'border-line'}`}>
                <button type="button" onClick={() => toggle(p)} aria-pressed={on} disabled={!on && full} className="group block w-full text-left disabled:cursor-not-allowed disabled:opacity-50">
                  <span className="relative block aspect-[5/4] overflow-hidden bg-chip">
                    <img src={p.images[0].src} alt="" loading="lazy" className="size-full object-cover transition duration-700 group-hover:scale-[1.04]" />
                    <span
                      aria-hidden
                      className={`absolute top-3 right-3 grid size-8 place-items-center rounded-full transition ${on ? 'bg-olive text-on-accent' : 'bg-cream/90 text-ink'}`}
                    >
                      {on ? <Check className="size-4" strokeWidth={2.5} /> : <Plus className="size-4" strokeWidth={2} />}
                    </span>
                  </span>
                  <span className="block px-4 pt-3 pb-2">
                    <span className="block font-serif text-[19px] leading-tight">{p.name}</span>
                    <span className="block truncate text-[12.5px] text-muted">{p.inspiredBy ? `Inspired by ${p.inspiredBy}` : p.tagline}</span>
                  </span>
                </button>
                {choice && (
                  <div className="animate-fade-in px-3 pb-3">
                    <SizePicker variations={fullSizeVariations(p)} value={choice[1]} onChange={(v) => setSize(p.id, v)} />
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      <aside className="h-fit rounded-2xl bg-card p-5 shadow-[0_0_0_1px_rgba(60,45,20,0.06)] sm:p-6 lg:sticky lg:top-24">
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
                <img src={i.product.images[0].src} alt="" className="size-10 rounded-lg object-cover" />
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
            className="mt-2 w-full rounded-xl border border-line-strong bg-cream px-4 py-3 text-[14.5px] outline-none focus:border-olive"
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
