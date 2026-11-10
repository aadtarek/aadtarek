import { ArrowRight, ChevronLeft, ChevronRight, Heart, Minus, Play, Plus, ShieldCheck, ShoppingBag, Sparkles, Truck, Gift } from 'lucide-react'
import { Deferred } from '../components/Deferred'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { usePageTitle } from '../lib/usePageTitle'
import {
  composition,
  familyName,
  fetchMissingProduct,
  fullSizeVariations,
  getAllProducts,
  getReviews,
  getVideos,
  noteFor,
  ratingSummary,
  relatedProducts,
  sampleVariation,
  useCatalogVersion,
} from '../api/catalog'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { BottleIcon } from '../components/Icons'
import { ProductCard } from '../components/ProductCard'
import { OfferBar } from '../components/OfferBar'
import { SlidingPill, useSlidingPill } from '../components/SlidingPill'
import { addWithFlight } from '../lib/addToCart'
import { haptic } from '../lib/fx'
import { Stars } from '../components/Stars'
import { VideoModal } from '../components/WearVideos'
import { LOYALTY, pointsFor, offersFor } from '../config'
import { dimensions } from '../data/standard'
import { formatPrice } from '../lib/format'
import { profileChips } from '../lib/profile'
import { tintFor } from '../lib/tints'
import { useWishlist } from '../store/wishlist'
import { useCart } from '../store/cart'
import { FaqList } from '../components/FaqList'
import { ReviewCard } from '../components/ReviewCard'
import type { Product, Review, StandardKey } from '../types'
import { NotFound } from './NotFound'

export function ProductPage() {
  const { slug: raw = '' } = useParams()
  const slug = safeDecode(raw).toLowerCase()
  useCatalogVersion()
  // The catalogue is loaded before the app renders, so the product is usually found straight away.
  const product = getAllProducts().find((p) => p.slug === slug || safeDecode(p.slug).toLowerCase() === slug)
  // Not in it (e.g. just added): asked from WooCommerce before saying "not found".
  const [lookup, setLookup] = useState<{ slug: string; done: boolean }>({ slug: '', done: false })
  useEffect(() => {
    if (product) return
    let live = true
    setLookup({ slug, done: false })
    fetchMissingProduct(raw)
      .catch(() => undefined)
      .then(() => live && setLookup({ slug, done: true }))
    return () => {
      live = false
    }
  }, [product, raw, slug])
  if (product) return <ProductDetails key={product.id} product={product} />
  if (!(lookup.slug === slug && lookup.done)) return <div className="min-h-[70vh]" aria-busy="true" />
  return <NotFound />
}

function safeDecode(s: string) {
  try {
    return decodeURIComponent(s)
  } catch {
    return s
  }
}

function ProductDetails({ product }: { product: Product }) {
  const cart = useCart()
  const wishlist = useWishlist()
  const sizes = fullSizeVariations(product)
  const sample = sampleVariation(product)
  const [variationId, setVariationId] = useState((sizes.filter((v) => v.inStock).at(-1) ?? sizes.at(-1)!).id)
  const [qty, setQty] = useState(1)
  const [reviews, setReviews] = useState<Review[]>([])
  const [videoOpen, setVideoOpen] = useState<number | null>(null)
  const buyBox = useRef<HTMLDivElement>(null)
  usePageTitle(`${product.name}${product.tagline ? ` — ${product.tagline}` : ''} | Rfaheya`)
  const [showSticky, setShowSticky] = useState(false)

  const variation = product.variations.find((v) => v.id === variationId)!
  const { average, count } = ratingSummary(reviews)
  const related = relatedProducts(product, 4)
  const videos = getVideos(product.id)
  const { tint, ink } = tintFor(product)

  useEffect(() => {
    getReviews(product.id).then(setReviews)
    document.title = `${product.name} — Rfaheya`
    return () => {
      document.title = 'Rfaheya — Speak Your Scent'
    }
  }, [product])

  // The sticky buy bar shows once the main "Add to cart" button scrolls away.
  useEffect(() => {
    const update = () => setShowSticky((buyBox.current?.getBoundingClientRect().bottom ?? 1) < 0)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  // Phones: the buy bar takes the tab bar's place while it shows.
  useEffect(() => {
    const root = document.documentElement
    if (showSticky) root.dataset.stickyBuy = ''
    else delete root.dataset.stickyBuy
    return () => {
      delete root.dataset.stickyBuy
    }
  }, [showSticky])
  const addToCart = (e: React.MouseEvent<HTMLElement>) => addWithFlight(cart, e.currentTarget, product, variationId, qty)
  const [sizeRef, sizeBox] = useSlidingPill<HTMLDivElement>(variationId)
  const pickSize = (id: number) => {
    haptic(8)
    setVariationId(id)
  }
  const navigate = useNavigate()
  const buyNow = () => {
    cart.add(product.id, variationId, qty, { open: false })
    navigate('/checkout')
  }
  const chips = profileChips(product, familyName)
  const wished = wishlist.has(product.id)

  return (
    <div className="pb-24" style={{ '--tint': tint, '--tint-ink': ink } as CSSProperties}>
      <div className="container-x pt-5 lg:pt-6">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'All Fragrances', to: '/shop' }, { label: product.name }]} />
      </div>

      {/* ---------- Picture + everything to buy it ---------- */}
      <section className="container-x mt-3 grid gap-6 lg:mt-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-11">
        <div className="-mx-4 sm:mx-0">
          <Gallery
            product={product}
            videos={videos.length}
            onVideo={() => setVideoOpen(0)}
            wished={wished}
            onWish={() => wishlist.toggle(product.id)}
          />
        </div>

        <div className="min-w-0 lg:sticky lg:top-[96px] lg:self-start">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-gold uppercase">{chips.map((c) => c.label).join(' · ')}</p>
          <h1 className="mt-2.5 font-serif text-[46px] leading-[0.95] sm:text-[60px] xl:text-[68px]">{product.name}</h1>
          {/* A short description that only names the DNA isn't repeated: the picture card below shows it. */}
          {product.tagline && !/^\s*dna\b/i.test(product.tagline) && <p className="mt-2 font-serif text-[20px] text-ink-soft italic sm:text-[24px]">{product.tagline}</p>}
          {count > 0 && (
            <a href="#reviews" className="mt-3 inline-flex items-center gap-2 text-[13px] text-muted hover:text-ink">
              <Stars rating={average} className="size-[14px]" />
              {average.toFixed(1)} · {count} {count === 1 ? 'review' : 'reviews'}
            </a>
          )}

          {product.inspiredBy && <InspiredBy product={product} />}
          <ProductOffers product={product} />

          <p className="mt-6 text-[11px] font-semibold tracking-[0.18em] text-muted uppercase">Size</p>
          <div
            ref={sizeRef}
            role="radiogroup"
            aria-label="Size"
            className={`relative mt-2.5 grid gap-2 ${sizes.length >= 4 ? 'grid-cols-4' : sizes.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}
          >
            <SlidingPill box={sizeBox} className="rounded-[18px] bg-olive shadow-[0_10px_24px_-12px_rgba(120,80,20,0.6)]" />
            {sizes.map((v) => {
              const on = v.id === variationId
              return (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  disabled={!v.inStock}
                  onClick={() => pickSize(v.id)}
                  className={`relative z-[1] rounded-[18px] px-2 py-3 text-center transition-[color,box-shadow,transform] duration-300 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 sm:py-3.5 ${
                    on ? 'text-on-accent' : 'rf-white shadow-[inset_0_0_0_1.5px_var(--color-line-strong)] hover:shadow-[inset_0_0_0_1.5px_var(--color-ink)]'
                  }`}
                >
                  <span className="relative z-[1] block text-[15px] font-semibold sm:text-[16px]">{v.size.replace(/\s*ML$/i, ' ml')}</span>
                  <span className={`relative z-[1] block text-[12px] transition-colors duration-300 sm:text-[12.5px] ${on ? 'text-on-accent/80' : 'text-muted'}`}>
                    {v.regularPrice && <s className="mr-1 opacity-70">{formatPrice(v.regularPrice)}</s>}
                    {formatPrice(v.price)}
                  </span>
                </button>
              )
            })}
          </div>

          <div ref={buyBox} className="mt-4 flex gap-2.5">
            <div className="rf-white flex h-14 shrink-0 items-center gap-1 rounded-full px-1.5 shadow-[inset_0_0_0_1.5px_var(--color-line-strong)]">
              <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="One less" className="grid size-10 place-items-center rounded-full text-muted hover:text-ink">
                <Minus className="size-4" strokeWidth={1.6} />
              </button>
              <span className="w-6 text-center text-[16px] font-semibold tabular-nums" aria-live="polite">
                {qty}
              </span>
              <button type="button" onClick={() => setQty(qty + 1)} aria-label="One more" className="grid size-10 place-items-center rounded-full text-muted hover:text-ink">
                <Plus className="size-4" strokeWidth={1.6} />
              </button>
            </div>
            <button
              type="button"
              onClick={addToCart}
              disabled={!variation.inStock}
              className="rf-magnetic inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-olive text-[12px] font-semibold tracking-[0.1em] text-white uppercase transition hover:bg-olive-hover disabled:opacity-50 sm:text-[13px]"
            >
              <ShoppingBag className="size-[17px]" strokeWidth={1.5} />
              Add to cart · {formatPrice(variation.price * qty)}
            </button>
          </div>
          <button
            type="button"
            onClick={buyNow}
            disabled={!variation.inStock}
            className="mt-2.5 h-14 w-full rounded-full text-[12px] font-semibold tracking-[0.1em] text-gold uppercase shadow-[inset_0_0_0_1.5px_var(--color-olive)] transition hover:bg-olive hover:text-on-accent disabled:opacity-50 sm:text-[13px]"
          >
            Buy now
          </button>
          {sample && (
            <button
              type="button"
              onClick={() => cart.add(product.id, sample.id)}
              disabled={!sample.inStock}
              className="mx-auto mt-3.5 flex items-center justify-center gap-1.5 text-[14px] text-ink-soft transition hover:text-ink disabled:pointer-events-none disabled:opacity-40"
            >
              <BottleIcon className="size-[18px]" />
              Not sure? <strong className="font-semibold text-gold">Try {sample.size.replace(/\s*ML$/i, ' ml')} for {formatPrice(sample.price)}</strong>
              <ArrowRight className="size-3.5" strokeWidth={1.6} />
            </button>
          )}

          <OfferBar amount={cart.subtotal - cart.discount} className="rf-white mt-4 rounded-2xl border border-line px-4 pt-3 [--rf-offer-ring:#fff]" />
          {LOYALTY.enabled && pointsFor(variation.price * qty) > 0 && (
            <p className="mt-2.5 flex items-center gap-2 px-1 text-[12.5px] text-ink-soft">
              <Sparkles className="size-4 shrink-0 text-olive" strokeWidth={1.5} />
              Earn <strong className="font-semibold text-ink">{pointsFor(variation.price * qty).toLocaleString('en-US')} points</strong> with this purchase.
            </p>
          )}
          <GoodToKnow />
        </div>
      </section>

      {/* Below the first screen: built when the visitor scrolls near (the page opens quicker). */}
      <Deferred height={620}>
        <NotesIsland product={product} />
      </Deferred>
      <Deferred height={560}>
        <Story product={product} />
      </Deferred>
      <Deferred height={520}>
        <StandardBars product={product} />
      </Deferred>
      <Deferred height={700} anchor="reviews">
        <ProductReviews product={product} reviews={reviews} />
      </Deferred>
      <Deferred height={640}>
        <ProductFaq />
      </Deferred>
      {related.length > 0 && (
        <Deferred height={720}>
          <Related products={related} />
        </Deferred>
      )}

      {videoOpen != null && <VideoModal videos={videos} index={videoOpen} onIndex={setVideoOpen} onClose={() => setVideoOpen(null)} />}

      {/* ---------- Sticky buy bar (once the main buttons scroll away) ---------- */}
      <div
        className={`fixed inset-x-0 bottom-0 z-30 px-3 pb-[calc(0.6rem+env(safe-area-inset-bottom))] transition-transform duration-500 sm:px-6 ${showSticky ? 'translate-y-0' : 'translate-y-[130%]'}`}
        aria-hidden={!showSticky}
        inert={!showSticky || undefined}
      >
        <div className="rf-shop-bar mx-auto flex max-w-[860px] items-center gap-2.5 rounded-full border border-line p-2 lg:gap-4">
          <img src={product.images[0].src} alt="" className="size-11 shrink-0 rounded-full object-cover lg:size-12" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold lg:font-serif lg:text-[20px] lg:font-normal">{product.name}</p>
            <p className="text-[12px] text-muted">
              {variation.size.replace(/\s*ML$/i, ' ml')} · {formatPrice(variation.price)}
            </p>
          </div>
          <button
            type="button"
            onClick={addToCart}
            disabled={!variation.inStock}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-olive px-[18px] text-[11px] font-semibold tracking-[0.1em] text-white uppercase disabled:opacity-50 lg:h-12 lg:px-7 lg:text-[12px]"
          >
            <ShoppingBag className="hidden size-4 sm:block" strokeWidth={1.5} />
            Add to cart
          </button>
          <button
            type="button"
            onClick={buyNow}
            disabled={!variation.inStock}
            className="hidden h-12 shrink-0 rounded-full px-7 text-[12px] font-semibold tracking-[0.1em] text-gold uppercase shadow-[inset_0_0_0_1.5px_var(--color-olive)] transition hover:bg-olive hover:text-on-accent disabled:opacity-50 sm:block"
          >
            Buy now
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- gallery

function Gallery({ product, videos, onVideo, wished, onWish }: { product: Product; videos: number; onVideo: () => void; wished: boolean; onWish: () => void }) {
  const [index, setIndex] = useState(0)
  const track = useRef<HTMLDivElement>(null)
  const images = product.images
  const show = (i: number) => {
    const n = (i + images.length) % images.length
    setIndex(n)
    track.current?.scrollTo({ left: n * track.current.clientWidth, behavior: 'smooth' })
  }

  return (
    <div>
      <div className="relative overflow-hidden bg-(--tint) sm:rounded-[32px] max-sm:rounded-b-[28px]">
        <div
          ref={track}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
          onScroll={(e) => {
            const el = e.currentTarget
            const i = Math.round(el.scrollLeft / el.clientWidth)
            if (i !== index) setIndex(i)
          }}
        >
          {images.map((img, i) => (
            <img
              key={img.src}
              src={img.src}
              srcSet={img.srcset}
              sizes="(min-width: 1024px) 55vw, 100vw"
              width={1600}
              height={1600}
              alt={img.alt}
              fetchPriority={i === 0 ? 'high' : undefined}
              loading={i === 0 ? undefined : 'lazy'}
              draggable={false}
              className="aspect-square w-full shrink-0 snap-center object-cover"
            />
          ))}
        </div>
        {product.badge && (
          <span className="absolute top-4 left-4 rounded-full bg-white px-3.5 py-1.5 text-[12px] font-semibold text-[#14110d] sm:top-[18px] sm:left-[18px]">{product.badge}</span>
        )}
        <button
          type="button"
          onClick={onWish}
          aria-pressed={wished}
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className="absolute top-3.5 right-3.5 grid size-11 place-items-center rounded-full bg-white/90 text-[#14110d] backdrop-blur-md transition hover:scale-105 sm:top-4 sm:right-4"
        >
          <Heart className={`size-[19px] ${wished ? 'fill-[#e49b2d] text-[#e49b2d]' : ''}`} strokeWidth={1.5} />
        </button>
        {images.length > 1 && (
          <>
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-[#14110d]/55 px-3 py-1.5 text-[12px] font-semibold text-white backdrop-blur-md sm:left-[18px] sm:translate-x-0">
              {index + 1} / {images.length}
            </span>
            <button
              type="button"
              onClick={() => show(index - 1)}
              aria-label="Previous image"
              className="absolute top-1/2 left-3 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/85 backdrop-blur-md transition hover:bg-white sm:grid"
            >
              <ChevronLeft className="size-5" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => show(index + 1)}
              aria-label="Next image"
              className="absolute top-1/2 right-3 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/85 backdrop-blur-md transition hover:bg-white sm:grid"
            >
              <ChevronRight className="size-5" strokeWidth={1.5} />
            </button>
          </>
        )}
        {videos > 0 && (
          <button
            type="button"
            onClick={onVideo}
            className="absolute right-4 bottom-4 inline-flex items-center gap-2 rounded-full bg-white/90 py-1.5 pr-3.5 pl-1.5 text-[12.5px] font-semibold text-[#14110d] backdrop-blur-md sm:right-[18px] sm:bottom-[18px]"
          >
            <span className="grid size-7 place-items-center rounded-full bg-olive text-white">
              <Play className="ml-0.5 size-3.5 fill-current" strokeWidth={0} />
            </span>
            Watch
          </button>
        )}
      </div>
      {images.length > 1 && (
        <ul className="no-scrollbar mt-3 hidden gap-2.5 overflow-x-auto sm:flex" aria-label="Product pictures">
          {images.map((img, i) => (
            <li key={img.src} className="shrink-0">
              <button
                type="button"
                onClick={() => show(i)}
                aria-label={`Show picture ${i + 1}`}
                aria-current={i === index}
                className={`block size-[84px] overflow-hidden rounded-[18px] border-2 transition ${i === index ? 'border-olive' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={img.src} alt="" loading="lazy" className="size-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ---------------------------------------------------------------- blocks

/** The cart offers that cover this product (buy 1 get 1, any 3 for…, free gift…): worked out in the cart. */
function ProductOffers({ product }: { product: Product }) {
  const offers = offersFor(product)
  if (!offers.length) return null
  return (
    <ul className="mt-4 space-y-2">
      {offers.map((o, i) => (
        <li key={i} className="flex items-start gap-3 rounded-[18px] border border-[#f0d9b0] bg-[#fdf6ea] px-4 py-3">
          <Gift className="mt-0.5 size-[18px] shrink-0 text-[#b8741a]" strokeWidth={1.6} />
          <span className="min-w-0 text-[13.5px] leading-snug">
            <strong className="font-semibold text-[#7a4d0e]">{o.label}</strong>
            {o.sizes.length > 0 && <span className="text-[#9a7a4a]"> · {o.sizes.join(', ')}</span>}
            {o.note && <span className="mt-0.5 block text-[12.5px] text-ink-soft">{o.note}</span>}
          </span>
        </li>
      ))}
    </ul>
  )
}

/** The original this fragrance is inspired by: its picture with its name beside it. */
function InspiredBy({ product }: { product: Product }) {
  // "Vanilla 28 by Kayali" → the name large, the house small.
  const [, title, by] = product.inspiredBy.match(/^(.*?)\s+by\s+(.+)$/i) ?? []
  const name = title || product.inspiredBy
  return (
    <div className="mt-5 flex items-center gap-3.5 overflow-hidden rounded-[20px] bg-chip p-2.5 pr-[18px]">
      {product.dnaImage && <img src={product.dnaImage} alt={`${name}${by ? ` by ${by}` : ''}`} loading="lazy" className="h-[84px] w-[64px] shrink-0 rounded-[14px] bg-white object-cover" />}
      <span className={`min-w-0 flex-1 ${product.dnaImage ? '' : 'py-2 pl-2'}`}>
        <span className="block truncate font-serif text-[23px] leading-none">{name}</span>
        {by && <span className="mt-1 block truncate text-[13px] text-muted">by {by}</span>}
      </span>
    </div>
  )
}

/** The notes as the scent unfolds: opening, heart and dry down, on the family's colour. */
function NotesIsland({ product }: { product: Product }) {
  const c = composition(product)
  const stages = [
    { label: 'Opening', when: 'The first minutes', notes: c.opening },
    { label: 'Heart', when: 'The next hours', notes: c.heart },
    { label: 'Dry down', when: 'What stays on skin', notes: c.drydown },
  ].filter((s) => s.notes.length)
  const fallback = !stages.length && product.notes.length ? product.notes : null
  if (!stages.length && !fallback) return null
  return (
    <section className="container-x mt-12 lg:mt-16" aria-labelledby="notes-title">
      <div className="rf-tint-island rounded-[28px] px-[18px] py-7 lg:rounded-[36px] lg:px-12 lg:py-11">
        <p className="text-[11px] font-semibold tracking-[0.24em] text-(--tint-ink) uppercase">The composition</p>
        <h2 id="notes-title" className="mt-2.5 font-serif text-[36px] leading-none sm:text-[52px]">
          How it unfolds
        </h2>
        {fallback ? (
          <ul className="mt-7 flex flex-wrap gap-4">
            {fallback.map((n) => (
              <NoteBubble key={n.name} name={n.name} image={n.image} />
            ))}
          </ul>
        ) : (
          <ol className={`mt-6 grid gap-2.5 lg:mt-7 lg:gap-4 ${stages.length === 3 ? 'lg:grid-cols-3' : stages.length === 2 ? 'lg:grid-cols-2' : ''}`}>
            {stages.map((s, i) => (
              <li key={s.label} className="flex items-center justify-between gap-3 rounded-[22px] bg-white/60 p-4 lg:block lg:rounded-[26px] lg:p-[22px]">
                <div>
                  <p className="font-serif text-[26px] leading-none lg:text-[30px]">
                    <span className="mr-2.5 align-middle font-sans text-[11px] font-semibold tracking-[0.14em] text-gold">{String(i + 1).padStart(2, '0')}</span>
                    {s.label}
                  </p>
                  <p className="mt-1 text-[12.5px] text-muted lg:text-[13px]">{s.when}</p>
                </div>
                <ul className="flex shrink-0 gap-2 lg:mt-[18px] lg:gap-3">
                  {s.notes.slice(0, 3).map((n) => (
                    <NoteBubble key={n} name={n} image={noteFor(n)} />
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}

function NoteBubble({ name, image }: { name: string; image?: string }) {
  return (
    <li className="flex w-[64px] flex-col items-center gap-2 text-center lg:w-[78px]">
      <span className="grid size-[58px] place-items-center rounded-full bg-white lg:size-[76px]">
        {image && <img src={image} alt="" width={46} height={46} loading="lazy" className="rf-note size-[34px] object-contain lg:size-[46px]" />}
      </span>
      <span className="text-[11.5px] leading-tight font-semibold lg:text-[13px]">{name}</span>
    </li>
  )
}

/** The fragrance's story beside a large picture. */
function Story({ product }: { product: Product }) {
  const paragraphs = product.story.length ? product.story : product.description ? [product.description] : []
  if (!paragraphs.length && !product.tagline) return null
  const picture = product.images[1] ?? product.images[0]
  const chips = profileChips(product, familyName)
  return (
    <section className="container-x mt-12 grid items-center gap-6 lg:mt-16 lg:grid-cols-2 lg:gap-14" aria-labelledby="story-title">
      <img src={picture.src} srcSet={picture.srcset} sizes="(min-width: 1024px) 45vw, 100vw" alt="" loading="lazy" className="aspect-[4/3] w-full rounded-[26px] bg-(--tint) object-cover lg:aspect-square lg:rounded-[32px]" />
      <div>
        <p className="text-[11px] font-semibold tracking-[0.24em] text-gold uppercase">The fragrance</p>
        <h2 id="story-title" className="mt-3 font-serif text-[32px] leading-[1.08] sm:text-[46px]">
          {product.tagline ? `“${product.tagline}”` : product.name}
        </h2>
        <div className="mt-5 space-y-4 text-[15px] leading-[1.7] text-ink-soft sm:text-[16px]">
          {paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        {chips.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-2">
            {chips.map(({ label }) => (
              <li key={label} className="rf-white rounded-full border border-line px-4 py-2 text-[13px]">
                {label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

/**
 * How full each level's bar is. Rfaheya's own standard sits at the top: Universal character,
 * Relaxed comfort and Airy density fill the bar; Moderate longevity sits in the middle.
 */
const STANDARD_FILL: Record<string, Record<string, number>> = {
  character: { universal: 1, selective: 0.66, enthusiast: 0.36 },
  comfort: { relaxed: 1, balanced: 0.66, intense: 0.36 },
  density: { airy: 1, balanced: 0.66, dense: 0.36 },
  longevity: { moderate: 0.5, standard: 0.5, extended: 0.75, 'long-lasting': 1 },
}

/** Rfaheya Standard™ as six simple bars. */
function StandardBars({ product }: { product: Product }) {
  const cells = dimensions
    .map((d) => {
      const value = product.standard[d.slug as StandardKey]
      const i = d.levels.findIndex((l) => l.name.toLowerCase() === value?.toLowerCase())
      const fill = STANDARD_FILL[d.slug]?.[d.levels[i]?.name.toLowerCase() ?? ''] ?? (i + 1) / d.levels.length
      return value && i >= 0 ? { key: d.slug, title: d.title, level: d.levels[i].name, fill } : null
    })
    .filter((c) => c !== null)
  if (!cells.length) return null
  return (
    <section className="container-x mt-12 lg:mt-16" aria-labelledby="standard-title">
      <div className="rf-white grid gap-6 rounded-[28px] border border-line px-[18px] py-7 lg:grid-cols-[0.7fr_1.3fr] lg:gap-12 lg:rounded-[36px] lg:px-12 lg:py-11">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.24em] text-gold uppercase">Rfaheya Standard™</p>
          <h2 id="standard-title" className="mt-2.5 font-serif text-[36px] leading-none sm:text-[52px]">
            Measured on skin
          </h2>
          <Link to="/our-standard" className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-gold hover:underline">
            How we test <ArrowRight className="size-3.5" strokeWidth={1.6} />
          </Link>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-[22px]">
          {cells.map((c) => (
            <li key={c.key}>
              <p className="flex justify-between gap-3 text-[14px]">
                <span className="text-muted">{c.title}</span>
                <strong className="font-semibold">{c.level}</strong>
              </p>
              <span className="mt-2.5 block h-1.5 overflow-hidden rounded-full bg-chip" aria-hidden>
                <span className="block h-full rounded-full bg-gradient-to-r from-[#f0c27a] to-olive" style={{ width: `${c.fill * 100}%` }} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/** Reviews on one side; questions, delivery and care on the other. */
/** Every review of this fragrance: the rating with a breakdown, customers' photos, then the cards (six, then all). */
function ProductReviews({ product, reviews }: { product: Product; reviews: Review[] }) {
  const [all, setAll] = useState(false)
  const { average, count } = ratingSummary(reviews)
  const photos = reviews.flatMap((r) => r.images ?? [])
  const shown = all ? reviews : reviews.slice(0, 6)
  return (
    <section id="reviews" className="container-x mt-12 scroll-mt-24 lg:mt-16" aria-labelledby="reviews-title">
      <div className="rounded-[28px] bg-chip px-4 py-8 lg:rounded-[36px] lg:p-12">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-10">
          <div className="px-1 lg:px-0">
            <p className="text-[11px] font-semibold tracking-[0.24em] text-gold uppercase">Reviews</p>
            <h2 id="reviews-title" className="mt-2.5 font-serif text-[38px] leading-none sm:text-[48px]">
              What people <span className="text-gold italic">say.</span>
            </h2>
            {count > 0 ? (
              <div className="rf-white mt-6 rounded-[24px] p-5">
                <div className="flex items-center gap-4">
                  <p className="font-serif text-[64px] leading-none">{average.toFixed(1)}</p>
                  <div>
                    <Stars rating={average} className="size-4" />
                    <p className="mt-1 text-[13px] text-muted">
                      {count} {count === 1 ? 'review' : 'reviews'} of {product.name}
                    </p>
                  </div>
                </div>
                <ul className="mt-4 space-y-1.5" aria-label="Ratings">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const n = reviews.filter((r) => Math.round(r.rating) === star).length
                    return (
                      <li key={star} className="flex items-center gap-2.5 text-[12.5px] text-ink-soft">
                        <span className="w-3 font-semibold tabular-nums">{star}</span>
                        <span className="relative h-[6px] flex-1 overflow-hidden rounded-full bg-chip">
                          <span className="absolute inset-y-0 left-0 rounded-full bg-olive" style={{ width: `${(n / count) * 100}%` }} />
                        </span>
                        <span className="w-6 text-right text-muted tabular-nums">{n}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ) : (
              <p className="mt-4 text-[15px] text-ink-soft">No reviews of {product.name} yet — reviews are collected from customers after delivery.</p>
            )}
            {photos.length > 0 && (
              <div className="mt-4">
                <p className="text-[11px] font-semibold tracking-[0.2em] text-muted uppercase">Customer photos</p>
                <ul className="mt-2 grid grid-cols-4 gap-1.5">
                  {photos.slice(0, 8).map((src) => (
                    <li key={src}>
                      <img src={src} alt="" loading="lazy" className="aspect-square w-full rounded-[12px] object-cover" />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Link to="/reviews" className="mt-5 inline-flex items-center gap-2 text-[11.5px] font-semibold tracking-[0.12em] uppercase hover:text-gold">
              Reviews of every fragrance <ArrowRight className="size-4" strokeWidth={1.6} />
            </Link>
          </div>

          {count > 0 && (
            <div>
              <ul className="grid gap-2.5 md:grid-cols-2 lg:gap-3">
                {shown.map((r) => (
                  <li key={r.id}>
                    <ReviewCard review={r} />
                  </li>
                ))}
              </ul>
              {reviews.length > shown.length && (
                <button
                  type="button"
                  onClick={() => setAll(true)}
                  className="rf-white mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-[12px] font-semibold tracking-[0.12em] uppercase transition hover:bg-olive hover:text-on-accent sm:w-auto sm:px-8"
                >
                  Show all {reviews.length} reviews
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/** All the store's questions, beside delivery, returns and care. */
/** Delivery, returns and care, right under the buy buttons. */
function GoodToKnow() {
  return (
    <div className="mt-5">
      <p className="text-[11px] font-semibold tracking-[0.18em] text-muted uppercase">Good to know</p>
      <ul className="mt-2.5 grid gap-2 text-[13px] text-ink-soft">
        {[
          { Icon: ShieldCheck, title: 'Zero-risk returns', text: 'exchange or return easily — see our policy.', to: '/returns' },
          { Icon: Truck, title: 'Delivery in 2–4 days', text: 'after your order is confirmed.' },
          { Icon: BottleIcon, title: 'Care', text: 'let it rest 2 days after delivery; keep it upright, cool and out of the sun.' },
        ].map(({ Icon, title, text, to }) => (
          <li key={title} className="rf-white flex items-start gap-3 rounded-[18px] border border-line p-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#f3e3c9] text-gold">
              <Icon className="size-4" strokeWidth={1.6} />
            </span>
            <span className="pt-0.5">
              <strong className="font-semibold text-ink">{title}</strong>{' '}
              {to ? (
                <Link to={to} className="underline-offset-2 hover:underline">
                  {text}
                </Link>
              ) : (
                text
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** The store's questions and answers. */
function ProductFaq() {
  return (
    <section className="container-x mt-4 lg:mt-5" aria-labelledby="product-faq-title">
      <div className="grid gap-6 rounded-[28px] bg-chip px-4 py-8 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-10 lg:rounded-[36px] lg:p-12">
        <div className="px-1 lg:sticky lg:top-24 lg:self-start lg:px-0">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-gold uppercase">FAQs</p>
          <h2 id="product-faq-title" className="mt-2.5 font-serif text-[38px] leading-none sm:text-[48px]">
            Your <span className="text-gold italic">questions.</span>
          </h2>
          <Link to="/faqs" className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-gold hover:underline">
            All FAQs <ArrowRight className="size-3.5" strokeWidth={1.6} />
          </Link>
        </div>
        <FaqList first={0} />
      </div>
    </section>
  )
}

function Related({ products }: { products: Product[] }) {
  return (
    <section className="container-x mt-12 pb-10 lg:mt-16" aria-labelledby="related-title">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.24em] text-gold uppercase">You may also like</p>
          <h2 id="related-title" className="mt-2.5 font-serif text-[36px] leading-none sm:text-[52px]">
            From the same family
          </h2>
        </div>
        <Link to="/shop" className="rf-white inline-flex h-[42px] items-center gap-2 rounded-full border border-line px-[18px] text-[11px] font-semibold tracking-[0.12em] uppercase transition hover:border-ink">
          View all <ArrowRight className="size-4" strokeWidth={1.5} />
        </Link>
      </div>
      <ul className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-4 lg:mt-8 lg:grid-cols-4 lg:gap-5">
        {products.map((p) => (
          <li key={p.id}>
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </section>
  )
}
