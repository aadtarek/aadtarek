import { ArrowRight, Check, Gift, Minus, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fullSizeVariations, getAllProducts, sampleVariation } from '../api/catalog'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { ProductCard } from '../components/ProductCard'
import { SizePicker } from '../components/SizePicker'
import { collections, findCollection, type Collection } from '../data/collections'
import { formatPrice } from '../lib/format'
import { useCart } from '../store/cart'
import type { Product } from '../types'
import { NotFound } from './NotFound'

export function CollectionsIndex() {
  return (
    <div className="pb-16 lg:pb-24">
      <div className="container-x pt-6 lg:pt-8">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Collections' }]} />
        <p className="mt-8 text-[12px] tracking-[0.3em] text-ink-soft uppercase sm:text-[14px]">Collections</p>
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
                className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${i < 2 ? 'aspect-[16/10]' : 'aspect-[4/5]'}`}
              />
              <span className="absolute inset-0 bg-gradient-to-t from-[#140c07]/85 via-[#140c07]/20 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 p-6 text-cream">
                <span className="block font-serif text-[30px] leading-none uppercase">{c.name}</span>
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

function DiscoveryBuilder() {
  const cart = useCart()
  const products = getAllProducts()
  const [picked, setPicked] = useState<number[]>([])
  const toggle = (id: number) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  const selected = products.filter((p) => picked.includes(p.id))
  const total = selected.reduce((n, p) => n + (sampleVariation(p)?.price ?? 0), 0)

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
      <div>
        <h2 className="font-serif text-[30px] sm:text-[38px]">Choose your samples</h2>
        <p className="mt-1 text-ink-soft">{products[0] && sampleVariation(products[0]) ? `Each 10 ML discovery size is ${formatPrice(sampleVariation(products[0])!.price)}. ` : ''}Pick as many as you like.</p>
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
                    <span className="block font-serif text-[19px] uppercase">{p.name}</span>
                    <span className="block truncate text-[13px] text-muted">{p.tagline}</span>
                  </span>
                  <span
                    aria-hidden
                    className={`mr-4 grid size-7 shrink-0 place-items-center rounded-full border-2 ${on ? 'border-olive bg-olive text-cream' : 'border-line-strong'}`}
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
                <span>{p.name} · 10 ML</span>
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
          onClick={() => {
            cart.addMany(selected.map((p) => ({ productId: p.id, variationId: sampleVariation(p)!.id })))
            setPicked([])
          }}
          className="mt-5 h-[52px] w-full rounded-[3px] bg-olive text-[12.5px] font-medium tracking-[0.12em] text-cream uppercase transition hover:bg-olive-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add set to cart
        </button>
      </aside>
    </div>
  )
}

/** Largest full-size bottle (variations are listed smallest → largest). */
function lastSize(p: Product) {
  const sizes = fullSizeVariations(p)
  return sizes[sizes.length - 1]
}

function GiftBuilder() {
  const products = getAllProducts()
  if (products.length === 0) return <p className="text-ink-soft">No fragrances available yet.</p>
  return <GiftBuilderForm products={products} />
}

function GiftBuilderForm({ products }: { products: Product[] }) {
  const cart = useCart()
  const [productId, setProductId] = useState(products[0].id)
  const product = products.find((p) => p.id === productId)!
  const [variationId, setVariationId] = useState(lastSize(product).id)
  const [message, setMessage] = useState('')
  const variation = product.variations.find((v) => v.id === variationId) ?? lastSize(product)!
  const MAX = 200

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
      <div>
        <h2 className="font-serif text-[30px] sm:text-[38px]">1. Choose the fragrance</h2>
        <ul className="mt-5 grid grid-cols-2 gap-[13px]">
          {products.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => {
                  setProductId(p.id)
                  setVariationId(lastSize(p).id)
                }}
                aria-pressed={p.id === productId}
                className={`w-full overflow-hidden rounded-lg border bg-card text-left transition ${
                  p.id === productId ? 'border-olive ring-1 ring-olive' : 'border-line hover:border-line-strong'
                }`}
              >
                <img src={p.images[0].src} alt="" className="aspect-[348/229] w-full object-cover" />
                <span className="block px-4 py-3 font-serif text-[18px] uppercase">{p.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="lg:pt-1">
        <h2 className="font-serif text-[30px] sm:text-[38px]">2. Size</h2>
        <div className="mt-5">
          <SizePicker variations={product.variations} value={variation.id} onChange={setVariationId} />
        </div>
        <h2 className="mt-8 font-serif text-[30px] sm:text-[38px]">3. Your message</h2>
        <label className="mt-4 block">
          <span className="sr-only">Gift message</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, MAX))}
            rows={5}
            placeholder="Write a few words for the person receiving it…"
            className="w-full rounded-[3px] border border-line-strong bg-cream px-4 py-3 text-[15px] outline-none focus:border-olive"
          />
          <span className="mt-1 block text-right text-[12px] text-muted">
            {message.length}/{MAX}
          </span>
        </label>
        <div className="mt-6 flex items-center justify-between rounded-lg bg-card p-5 shadow-[0_0_0_1px_rgba(60,45,20,0.06)]">
          <div>
            <p className="font-serif text-[20px] uppercase">{product.name}</p>
            <p className="text-[13px] text-muted">
              {variation.size} · {message.trim() ? 'with gift message' : 'no message yet'}
            </p>
          </div>
          <p className="text-[20px] font-semibold">{formatPrice(variation.price)}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            cart.add(product.id, variation.id, 1, { giftMessage: message })
            setMessage('')
          }}
          className="mt-4 inline-flex h-[52px] w-full items-center justify-center gap-3 rounded-[3px] bg-olive text-[12.5px] font-medium tracking-[0.12em] text-cream uppercase transition hover:bg-olive-hover"
        >
          <Gift className="size-5" strokeWidth={1.4} />
          Add gift to cart
        </button>
      </div>
    </div>
  )
}
