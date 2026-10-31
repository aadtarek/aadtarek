import {
  ArrowRight,
  Box,
  ChartNoAxesColumnIncreasing,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Feather,
  FingerprintPattern,
  Info,
  Layers,
  Minus,
  Play,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Target,
  Truck,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  composition,
  familyName,
  fetchMissingProduct,
  fullSizeVariations,
  getAllProducts,
  getReviews,
  getVideos,
  noteFor,
  priceRange,
  ratingSummary,
  relatedProducts,
  sampleVariation,
  useCatalogVersion,
} from '../api/catalog'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { Carousel } from '../components/Carousel'
import { BottleIcon } from '../components/Icons'
import { ProductCard } from '../components/ProductCard'
import { OfferBar } from '../components/OfferBar'
import { SlidingPill, useSlidingPill } from '../components/SlidingPill'
import { addWithFlight } from '../lib/addToCart'
import { haptic } from '../lib/fx'
import { QuantityInput } from '../components/QuantityInput'
import { Stars, VerifiedBadge } from '../components/Stars'
import { VideoModal } from '../components/WearVideos'
import { WpHtml } from '../components/WpHtml'
import { FREE_SHIPPING, LOYALTY, pointsFor } from '../config'
import { dimensions } from '../data/standard'
import { formatPrice, formatPriceRange } from '../lib/format'
import { GENDERS, profileChips } from '../lib/profile'
import { useCart } from '../store/cart'
import { useFaqs } from '../lib/useFaqs'
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

const STANDARD_ICONS: Record<StandardKey, LucideIcon> = {
  character: FingerprintPattern,
  comfort: Feather,
  density: Layers,
  projection: Target,
  longevity: Clock,
  evolution: ChartNoAxesColumnIncreasing,
}

function ProductDetails({ product }: { product: Product }) {
  const cart = useCart()
  const sizes = fullSizeVariations(product)
  const sample = sampleVariation(product)
  const [variationId, setVariationId] = useState((sizes.filter((v) => v.inStock).at(-1) ?? sizes.at(-1)!).id)
  const [qty, setQty] = useState(1)
  const [reviews, setReviews] = useState<Review[]>([])
  const [allReviews, setAllReviews] = useState<Review[]>([])
  const [videoOpen, setVideoOpen] = useState<number | null>(null)
  const buyBox = useRef<HTMLDivElement>(null)
  const [showSticky, setShowSticky] = useState(false)

  const variation = product.variations.find((v) => v.id === variationId)!
  const { average, count } = ratingSummary(reviews)
  const related = relatedProducts(product, 8)
  const videos = getVideos(product.id)
  const range = priceRange(product)

  useEffect(() => {
    getReviews(product.id).then(setReviews)
    getReviews().then(setAllReviews)
    document.title = `${product.name} — Rfaheya`
    return () => {
      document.title = 'Rfaheya — Speak Your Scent'
    }
  }, [product])

  // Show the mobile sticky bar once the main "Add to cart" button scrolls away.
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
  const [stickyRef, stickyBox] = useSlidingPill<HTMLDivElement>(variationId)
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

  return (
    <div className="pb-24">
      <div className="container-x pt-5 lg:pt-6">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'All Fragrances', to: '/shop' }, { label: product.name }]} />
      </div>

      <section className="container-x mt-4 grid gap-7 lg:mt-5 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] lg:gap-10 xl:gap-12">
        <div className="lg:sticky lg:top-[88px] lg:self-start">
          <Gallery product={product} videos={videos.length} onVideo={() => setVideoOpen(0)} />
        </div>

        <div className="min-w-0">
          {/* ---------- 01 Purchase ---------- */}
          <div className="flex items-center justify-between gap-3">
            {product.badge ? <span className="rounded-full bg-olive px-3 py-1 text-[11.5px] leading-none text-on-accent sm:px-3.5 sm:py-1.5 sm:text-[13px]">{product.badge}</span> : <span />}
            <p className="text-[11px] tracking-[0.1em] text-muted uppercase lg:hidden">
              {GENDERS[product.profile.gender].label}
              {product.families[0] && ` · ${familyName(product.families[0])}`}
            </p>
          </div>
          <h1 className="mt-2 font-serif text-[32px] leading-[0.95] tracking-[-0.01em] sm:mt-2.5 sm:text-[56px] xl:text-[64px]">{product.name}</h1>
          <p className="mt-1.5 font-serif text-[18px] text-ink-soft sm:mt-2 sm:text-[26px]">{product.tagline}</p>

          <ul className="mt-3 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2" aria-label="Profile">
            {chips.map(({ label, Icon }) => (
              <li
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-2.5 py-1 text-[12px] sm:gap-2 sm:px-4 sm:py-2 sm:text-[15px]"
              >
                <Icon className="size-3.5 sm:size-[18px]" strokeWidth={1.3} aria-hidden />
                {label}
              </li>
            ))}
          </ul>

          {count > 0 && (
            <a href="#reviews" className="mt-3 inline-flex items-center gap-2 text-[13px] text-ink-soft hover:text-ink sm:mt-4 sm:gap-3 sm:text-[15px]">
              <Stars rating={average} className="size-4 sm:size-[19px]" />
              <span className="font-medium text-ink">{average.toFixed(1)}</span>
              <span>
                ({count} {count === 1 ? 'review' : 'reviews'})
              </span>
            </a>
          )}

          {product.inspiredBy && <DnaCard product={product} />}

          <p className="mt-4 text-[22px] font-semibold tracking-[-0.01em] sm:mt-6 sm:text-[36px]">{formatPriceRange(range.min, range.max)}</p>

          <p className="mt-3 text-[11.5px] font-medium tracking-[0.06em] uppercase sm:mt-4 sm:text-[13.5px]">Choose your size</p>
          <div
            ref={sizeRef}
            role="radiogroup"
            aria-label="Size"
            className={`relative mt-2 grid gap-1.5 sm:mt-2.5 sm:gap-2 ${sizes.length >= 4 ? 'grid-cols-4' : sizes.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}
          >
            <SlidingPill box={sizeBox} className="rounded-xl bg-olive" />
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
                  className={`relative z-[1] rounded-xl border px-2 py-2 text-center transition disabled:cursor-not-allowed sm:py-2.5 disabled:opacity-40 ${
                    on ? 'border-olive text-on-accent' : 'border-line-strong bg-card hover:border-ink'
                  }`}
                >
                  <span className="block text-[12.5px] font-semibold sm:text-[13.5px]">{v.size}</span>
                  <span className={`block text-[11.5px] sm:text-[12.5px] ${on ? 'text-on-accent/75' : 'text-ink-soft'}`}>{formatPrice(v.price)}</span>
                </button>
              )
            })}
          </div>

          <div ref={buyBox} className="mt-2.5 flex gap-1.5 sm:mt-3 sm:flex-col sm:gap-2">
            <div className="shrink-0">
              <QuantityInput value={qty} onChange={setQty} size="auto" />
            </div>
            <button
              type="button"
              onClick={addToCart}
              disabled={!variation.inStock}
              className="rf-magnetic inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-olive text-[11.5px] font-medium tracking-[0.1em] text-on-accent uppercase transition hover:bg-olive-hover disabled:opacity-50 sm:h-12 sm:flex-none sm:gap-2.5 sm:text-[13px]"
            >
              <ShoppingBag className="size-4" strokeWidth={1.3} />
              Add to cart
              {qty > 1 && <span className="tracking-normal normal-case opacity-80">· {formatPrice(variation.price * qty)}</span>}
            </button>
          </div>
          <button
            type="button"
            onClick={buyNow}
            disabled={!variation.inStock}
            className="rf-magnetic mt-1.5 inline-flex h-10 w-full items-center justify-center rounded-full bg-mocha text-[11.5px] font-medium tracking-[0.1em] text-cream uppercase transition hover:bg-espresso disabled:opacity-50 sm:mt-2 sm:h-12 sm:text-[13px]"
          >
            Buy now
          </button>
          {sample && (
            <button
              type="button"
              onClick={() => cart.add(product.id, sample.id)}
              disabled={!sample.inStock}
              className="mt-1.5 flex h-11 w-full items-center justify-center gap-2.5 rounded-full border border-ink/70 transition hover:bg-ink hover:text-cream disabled:pointer-events-none disabled:opacity-40 sm:mt-2 sm:h-12 sm:gap-3"
            >
              <BottleIcon className="size-5 sm:size-6" />
              <span className="text-center leading-tight">
                <span className="block text-[11.5px] font-semibold tracking-[0.06em] uppercase sm:text-[12.5px]">Try {sample.size} first</span>
                <span className="block text-[11px] sm:text-[12px]">{formatPrice(sample.price)}</span>
              </span>
            </button>
          )}

          <OfferBar amount={cart.subtotal - cart.discount} className="mt-4 rounded-2xl bg-chip px-4 pt-3 [--rf-offer-ring:var(--color-chip)] sm:mt-5" />
          {LOYALTY.enabled && pointsFor(variation.price * qty) > 0 && (
            <p className="mt-2 flex items-center gap-2 px-1 text-[12.5px] text-ink-soft">
              <Sparkles className="size-4 shrink-0 text-olive" strokeWidth={1.5} />
              Earn <strong className="font-semibold text-ink">{pointsFor(variation.price * qty).toLocaleString('en-US')} points</strong> with this purchase.
            </p>
          )}

          <ul className="mt-5 grid grid-cols-3 gap-2 sm:mt-6 sm:gap-0">
            {[
              {
                Icon: ShieldCheck,
                title: 'Zero Risk Guarantee',
                text: 'Try it at home. Love it or return it.',
              },
              {
                Icon: Truck,
                title: 'Free Shipping',
                text: `On orders over ${FREE_SHIPPING.min.toLocaleString('en-US')} EGP.`,
              },
              {
                Icon: Star,
                title: 'Rfaheya Standard™',
                text: 'Every fragrance is evaluated beyond the scent.',
                to: '/our-standard',
              },
            ].map(({ Icon, title, text, to }, i) => (
              <li key={title} className={`flex flex-col gap-2 sm:flex-row sm:gap-3 sm:px-3 ${i ? 'sm:border-l sm:border-line' : 'sm:pl-0'}`}>
                <Icon className="size-5 shrink-0 sm:size-7" strokeWidth={1.2} aria-hidden />
                <span className="text-[11px] leading-snug text-muted sm:text-[13px]">
                  {to ? (
                    <Link to={to} className="block font-medium text-ink hover:underline">
                      {title}
                    </Link>
                  ) : (
                    <span className="block font-medium text-ink">{title}</span>
                  )}
                  {text}
                </span>
              </li>
            ))}
          </ul>

          {/* ---------- 02 The fragrance ---------- */}
          <Fold num="02" aside="The story, notes, and character of the fragrance." title="The Fragrance" defaultOpen>
            {product.tagline && <p className="font-serif text-[19px] text-mocha sm:text-[28px]">{product.tagline}</p>}
            <div className="mt-3 space-y-3 font-serif text-[15px] leading-[1.6] text-ink-soft sm:mt-4 sm:space-y-4 sm:text-[18px]">
              {(product.story.length ? product.story : [product.description]).map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>

            <h3 className="mt-6 border-t border-line pt-5 font-serif text-[19px] sm:mt-8 sm:pt-7 sm:text-[26px]">Key notes</h3>
            <ul className="mt-5 grid grid-cols-5 gap-2">
              {product.notes.slice(0, 5).map((n) => (
                <li key={n.name} className="flex flex-col items-center text-center">
                  <img src={n.image} alt="" width={96} height={72} className="h-10 w-auto object-contain sm:h-[72px]" loading="lazy" decoding="async" />
                  <span className="mt-1.5 text-[11px] sm:mt-2 sm:text-[14px]">{n.name}</span>
                </li>
              ))}
            </ul>

            <Composition product={product} />
          </Fold>

          {/* ---------- 03 Standard + delivery ---------- */}
          <Fold
            num="03"
            aside="Our standards, and everything you need to know."
            title="Rfaheya Standard™"
            subtitle="Every fragrance is evaluated beyond the scent."
          >
            <StandardGrid product={product} />
          </Fold>
          <Fold num="03" aside="Everything you need to know." title="Delivery & Care" subtitle="Everything you need to know after your purchase.">
            <DeliveryCare />
          </Fold>
        </div>
      </section>

      <ReviewsBlock product={product} reviews={reviews.length ? reviews : allReviews} own={reviews.length > 0} />
      <FaqBlock />
      {related.length > 0 && <Related products={related} />}

      {videoOpen != null && <VideoModal videos={videos} index={videoOpen} onIndex={setVideoOpen} onClose={() => setVideoOpen(null)} />}

      {/* ---------- Sticky buy bar (once the main buttons scroll away) ---------- */}
      <div
        className={`fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream/95 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] sm:pt-3 sm:pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-10px_30px_-18px_rgba(40,30,20,0.35)] backdrop-blur transition-transform duration-300 ${
          showSticky ? 'translate-y-0' : 'translate-y-full'
        }`}
        aria-hidden={!showSticky}
        inert={!showSticky || undefined}
      >
        <div className="container-x flex items-center gap-2.5 lg:gap-5">
          <img src={product.images[0].src} alt="" className="size-10 shrink-0 rounded-lg object-cover lg:size-14" />
          <div className="min-w-0 flex-1 lg:flex-none">
            <p className="truncate font-serif text-[15px] lg:text-[20px]">{product.name}</p>
            <p className="text-[11.5px] text-muted lg:text-[13px]">
              {variation.size} · {formatPrice(variation.price)}
            </p>
          </div>
          <div ref={stickyRef} role="radiogroup" aria-label="Size" className="relative ml-auto hidden gap-1.5 lg:flex">
            <SlidingPill box={stickyBox} className="rounded-full bg-olive" />
            {sizes.map((v) => (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={v.id === variationId}
                disabled={!v.inStock}
                onClick={() => pickSize(v.id)}
                className={`relative z-[1] h-10 rounded-full border px-3 text-[13px] font-medium transition disabled:opacity-40 ${
                  v.id === variationId ? 'border-olive text-on-accent' : 'border-line-strong hover:border-ink'
                }`}
              >
                {v.size}
              </button>
            ))}
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={addToCart}
              disabled={!variation.inStock}
              className="inline-flex h-9 items-center gap-2 rounded-full bg-olive px-3.5 text-[10.5px] font-medium tracking-[0.1em] text-on-accent uppercase disabled:opacity-50 sm:h-11 sm:px-5 sm:text-[11.5px] lg:h-12 lg:px-7 lg:text-[12.5px]"
            >
              <ShoppingBag className="hidden size-[18px] sm:block" strokeWidth={1.4} />
              Add to cart
            </button>
            <button
              type="button"
              onClick={buyNow}
              disabled={!variation.inStock}
              className="h-9 rounded-full bg-mocha px-3.5 text-[10.5px] font-medium tracking-[0.1em] text-cream uppercase hover:bg-espresso disabled:opacity-50 sm:h-11 sm:px-5 sm:text-[11.5px] lg:h-12 lg:px-7 lg:text-[12.5px]"
            >
              Buy now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- gallery

function Gallery({ product, videos, onVideo }: { product: Product; videos: number; onVideo: () => void }) {
  const [index, setIndex] = useState(0)
  const strip = useRef<HTMLUListElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const images = product.images
  const show = (i: number) => {
    const n = (i + images.length) % images.length
    setIndex(n)
    track.current?.scrollTo({
      left: n * track.current.clientWidth,
      behavior: 'smooth',
    })
  }
  const thumbs: ({ kind: 'image'; i: number } | { kind: 'video' })[] = images.map((_, i) => ({ kind: 'image' as const, i }))
  if (videos) thumbs.splice(1, 0, { kind: 'video' })

  return (
    <div className="grid gap-4 lg:grid-cols-[86px_minmax(0,1fr)] xl:grid-cols-[96px_minmax(0,1fr)]">
      {/* Desktop thumbnails */}
      <div className="hidden lg:block">
        <ul ref={strip} className="no-scrollbar flex max-h-[min(70vh,640px)] flex-col gap-3 overflow-y-auto" aria-label="Product media">
          {thumbs.map((t) =>
            t.kind === 'video' ? (
              <li key="video">
                <button
                  type="button"
                  onClick={onVideo}
                  aria-label="Play video"
                  className="relative block aspect-[5/4] w-full overflow-hidden rounded-[6px] bg-ink"
                >
                  <img src={images[0].src} alt="" className="size-full object-cover opacity-45" />
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid size-11 place-items-center rounded-full border-2 border-white text-white">
                      <Play className="ml-0.5 size-5 fill-current" strokeWidth={0} />
                    </span>
                  </span>
                </button>
              </li>
            ) : (
              <li key={t.i}>
                <button
                  type="button"
                  onClick={() => show(t.i)}
                  aria-label={`Show image ${t.i + 1}`}
                  aria-current={t.i === index}
                  className={`block aspect-[5/4] w-full overflow-hidden rounded-[6px] border-2 transition ${t.i === index ? 'border-ink' : 'border-transparent opacity-80 hover:opacity-100'}`}
                >
                  <img src={images[t.i].src} alt="" className="size-full object-cover" />
                </button>
              </li>
            ),
          )}
        </ul>
        {thumbs.length > 6 && (
          <button
            type="button"
            onClick={() => strip.current?.scrollBy({ top: 220, behavior: 'smooth' })}
            aria-label="More images"
            className="mx-auto mt-2 grid size-9 place-items-center"
          >
            <ChevronDown className="size-5" strokeWidth={1.5} />
          </button>
        )}
      </div>

      <div>
        <div className="relative overflow-hidden rounded-[8px] bg-card">
          <div
            ref={track}
            className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto lg:overflow-hidden"
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
                sizes="(min-width: 1024px) 45vw, 100vw"
                width={2000}
                height={1600}
                alt={img.alt}
                fetchPriority={i === 0 ? 'high' : undefined}
                loading={i === 0 ? undefined : 'lazy'}
                draggable={false}
                className="aspect-[5/4] w-full shrink-0 snap-center object-cover"
              />
            ))}
          </div>
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => show(index - 1)}
                aria-label="Previous image"
                className="absolute top-1/2 left-3 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow lg:hidden"
              >
                <ChevronLeft className="size-5" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => show(index + 1)}
                aria-label="Next image"
                className="absolute top-1/2 right-3 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow lg:hidden"
              >
                <ChevronRight className="size-5" strokeWidth={1.5} />
              </button>
            </>
          )}
          {videos > 0 && (
            <button
              type="button"
              onClick={onVideo}
              className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-black/55 py-1.5 pr-3.5 pl-1.5 text-[13px] text-white backdrop-blur lg:hidden"
            >
              <span className="grid size-7 place-items-center rounded-full bg-white text-ink">
                <Play className="ml-0.5 size-3.5 fill-current" strokeWidth={0} />
              </span>
              Watch
            </button>
          )}
        </div>
        {images.length > 1 && (
          <div className="mt-3 flex justify-center gap-2 lg:hidden" aria-hidden>
            {images.map((img, i) => (
              <span key={img.src} className={`h-2 rounded-full transition-all ${i === index ? 'w-5 bg-ink' : 'w-2 border border-ink/50'}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- blocks

function DnaCard({ product }: { product: Product }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-4 rounded-xl border border-line bg-card sm:mt-5">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center gap-3 p-2.5 text-left sm:gap-5 sm:p-3">
        <span className="grid h-12 w-11 shrink-0 place-items-center border-r border-line pr-2.5 sm:h-[72px] sm:w-[84px] sm:pr-5">
          {product.dnaImage ? (
            <img src={product.dnaImage} alt="" className="max-h-full w-auto object-contain" />
          ) : (
            <BottleIcon className="size-7 text-mocha sm:size-10" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 text-[13.5px] font-semibold sm:gap-2 sm:text-[18px]">
            DNA <Info className="size-3.5 text-muted sm:size-4" strokeWidth={1.5} aria-hidden />
          </span>
          <span className="block truncate text-[12.5px] text-ink-soft sm:text-[17px]">{product.inspiredBy}</span>
        </span>
        <ChevronRight className={`size-4 shrink-0 transition sm:size-5 ${open ? 'rotate-90' : ''}`} strokeWidth={1.5} />
      </button>
      {open && (
        <p className="border-t border-line px-3.5 py-2.5 text-[12.5px] leading-relaxed text-ink-soft sm:px-4 sm:py-3 sm:text-[14px]">
          DNA refers to the original fragrance that a Rfaheya fragrance is based on. It shows the olfactive direction and character behind it — not the original
          product, and not intended to be an exact copy.
        </p>
      )}
    </div>
  )
}

/** Numbered section; a collapsible panel on phones, always open on desktop. */
function Fold({
  num,
  aside,
  title,
  subtitle,
  defaultOpen = false,
  children,
}: {
  num: string
  aside: string
  title: string
  subtitle?: string
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className="mt-10 border-t border-line pt-6 lg:mt-14 lg:border-0 lg:pt-0">
      <SectionMeta num={num} aside={aside} />
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="mt-3 flex w-full items-center justify-between text-left lg:pointer-events-none lg:mt-4"
      >
        <h2 className="font-serif text-[24px] leading-none sm:text-[40px] xl:text-[46px]">{title}</h2>
        <span className="lg:hidden">{open ? <Minus className="size-6" strokeWidth={1.3} /> : <Plus className="size-6" strokeWidth={1.3} />}</span>
      </button>
      {subtitle && <p className={`mt-2 font-serif text-[18px] text-muted sm:text-[22px] ${open ? '' : 'hidden lg:block'}`}>{subtitle}</p>}
      <div className={`mt-5 ${open ? '' : 'hidden lg:block'}`}>{children}</div>
    </section>
  )
}

function SectionMeta({ num, aside, center }: { num: string; aside: string; center?: boolean }) {
  return (
    <div className={`flex items-center gap-4 text-[12.5px] text-muted sm:text-[13.5px] ${center ? 'mx-auto max-w-[760px]' : ''}`}>
      <span>{num}</span>
      <span aria-hidden className="h-px flex-1 bg-mocha/40" />
      <span className="text-right">{aside}</span>
    </div>
  )
}

function Composition({ product }: { product: Product }) {
  const c = composition(product)
  const stages = [
    { label: 'Opening', notes: c.opening, color: '#e2c39c' },
    { label: 'Heart', notes: c.heart, color: '#9b5d2a' },
    { label: 'Dry Down', notes: c.drydown, color: '#5a1a1a' },
  ].filter((s) => s.notes.length)
  if (!stages.length) return null
  return (
    <>
      <h3 className="mt-8 border-t border-line pt-7 font-serif text-[22px] sm:text-[26px]">The composition</h3>
      {/* Desktop: timeline */}
      <div className="relative mt-6 hidden sm:block">
        <span aria-hidden className="absolute top-[11px] right-0 left-0 h-[2px] bg-gradient-to-r from-[#e2c39c] via-[#9b5d2a] to-[#5a1a1a] opacity-70" />
        <ol className={`relative grid text-center ${stages.length === 3 ? 'grid-cols-3' : stages.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {stages.map((s) => (
            <li key={s.label} className="flex flex-col items-center">
              <span className="size-6 rounded-full ring-4 ring-cream" style={{ background: s.color }} />
              <span className="mt-4 text-[15px] font-medium tracking-[0.04em] uppercase">{s.label}</span>
              <span className="mt-1 text-[15px] text-ink-soft">{s.notes.join(' · ')}</span>
            </li>
          ))}
        </ol>
      </div>
      {/* Phone: list */}
      <ol className="mt-4 divide-y divide-line rounded-[6px] border border-line bg-card sm:hidden">
        {stages.map((s) => (
          <li key={s.label} className="flex items-center gap-3 px-4 py-3">
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-medium tracking-[0.04em] text-mocha uppercase">{s.label}</span>
              <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[14px] text-ink-soft">
                {s.notes.map((n) => (
                  <span key={n} className="inline-flex items-center gap-1">
                    <img src={noteFor(n)} alt="" width={20} height={20} loading="lazy" className="rf-note size-5 object-contain" />
                    {n}
                  </span>
                ))}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </>
  )
}

function StandardGrid({ product }: { product: Product }) {
  const cells = dimensions
    .map((d) => {
      const key = d.slug as StandardKey
      const value = product.standard[key]
      const i = d.levels.findIndex((l) => l.name.toLowerCase() === value?.toLowerCase())
      return value && i >= 0
        ? {
            key,
            title: d.title,
            level: d.levels[i],
            fill: (i + 1) / d.levels.length,
          }
        : null
    })
    .filter((c) => c !== null)
  if (!cells.length) return <p className="text-ink-soft">Coming soon.</p>
  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3">
      {cells.map((c, i) => {
        const Icon = STANDARD_ICONS[c.key]
        return (
          <li
            key={c.key}
            className={`flex gap-3 py-4 pr-3 ${i % 3 ? 'sm:border-l sm:border-line sm:pl-4' : ''} ${i % 2 ? 'max-sm:border-l max-sm:border-line max-sm:pl-3' : ''} ${i >= 3 ? 'sm:border-t sm:border-line' : ''} ${i >= 2 ? 'max-sm:border-t max-sm:border-line' : ''}`}
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-full border border-line bg-card sm:size-14">
              <Icon className="size-6 sm:size-7" strokeWidth={1.2} aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] text-ink-soft">{c.title}</span>
              <span className="mt-1.5 block h-[5px] overflow-hidden rounded-full bg-line" aria-hidden>
                <span className="block h-full rounded-full bg-gradient-to-r from-[#d9a77a] to-[#a0663a]" style={{ width: `${c.fill * 100}%` }} />
              </span>
              <span className="mt-2 block text-[16px] font-medium sm:text-[17px]">{c.level.name}</span>
              <span className="mt-0.5 block text-[12.5px] leading-snug text-muted sm:text-[13px]">{c.level.text.join(' ')}</span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}

function DeliveryCare() {
  const items: {
    Icon: LucideIcon | typeof BottleIcon
    title: string
    text: ReactNode
  }[] = [
    {
      Icon: Truck,
      title: 'Delivery',
      text: (
        <>
          Orders are delivered within <strong className="font-medium text-ink">2–4 business days</strong> after your order is confirmed.
        </>
      ),
    },
    {
      Icon: Box,
      title: 'Exchange & Returns',
      text: (
        <>
          You can exchange or return your order easily according to{' '}
          <Link to="/returns" className="underline underline-offset-2">
            our policy
          </Link>
          .
        </>
      ),
    },
    {
      Icon: Clock,
      title: 'Before 1st Use',
      text: (
        <>
          Let your fragrance rest for <strong className="font-medium text-ink">2 days</strong> after delivery before trying it.
        </>
      ),
    },
    {
      Icon: BottleIcon,
      title: 'Fragrance Care',
      text: 'Keep your fragrance upright in a cool, dry place, away from direct sunlight and heat.',
    },
  ]
  return (
    <ul className="grid grid-cols-2">
      {items.map(({ Icon, title, text }, i) => (
        <li key={title} className={`flex gap-3 py-4 sm:gap-5 ${i % 2 ? 'border-l border-line pl-3 sm:pl-5' : 'pr-3'} ${i >= 2 ? 'border-t border-line' : ''}`}>
          <span className="grid size-11 shrink-0 place-items-center rounded-full border border-line bg-card sm:size-16">
            <Icon className="size-6 sm:size-8" strokeWidth={1.2} aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-[13px] font-medium tracking-[0.02em] uppercase sm:text-[16px]">{title}</span>
            <span className="mt-1 block text-[12.5px] leading-snug text-muted sm:text-[15px]">{text}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

function CenterHead({ num, aside, title, subtitle }: { num: string; aside: string; title: string; subtitle?: ReactNode }) {
  return (
    <div className="text-center">
      <SectionMeta num={num} aside={aside} center />
      <h2 className="mt-5 font-serif text-[34px] leading-none sm:text-[56px] xl:text-[64px]">{title}</h2>
      {subtitle}
    </div>
  )
}

function ReviewsBlock({ product, reviews, own }: { product: Product; reviews: Review[]; own: boolean }) {
  const { average, count } = ratingSummary(reviews)
  return (
    <section id="reviews" className="mt-16 scroll-mt-24 lg:mt-24" aria-label="Customer reviews">
      <div className="container-x">
        <CenterHead
          num="04"
          aside="Real experiences. Real stories."
          title="Customer Reviews"
          subtitle={<p className="mt-3 font-serif text-[15px] tracking-[0.2em] text-mocha sm:text-[22px]">What our customers say</p>}
        />
        {count === 0 ? (
          <p className="mx-auto mt-6 max-w-lg text-center text-ink-soft">
            Be the first to share your experience with {product.name} — reviews are collected from verified purchases after delivery.
          </p>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              <p className="flex items-center gap-4">
                <Stars rating={average} className="size-[22px] sm:size-[28px]" />
                <span className="font-serif text-[26px] sm:text-[34px]">{average.toFixed(1)} / 5</span>
              </p>
              <span aria-hidden className="hidden h-10 w-px bg-line-strong sm:block" />
              <p className="text-[15px] text-ink-soft sm:text-[17px]">
                Based on {count} {count === 1 ? 'review' : 'reviews'}
                {!own && ' across our fragrances'}
              </p>
              <Link
                to="/reviews"
                className="inline-flex h-12 items-center gap-3 border border-mocha px-7 text-[13px] font-medium tracking-[0.1em] text-mocha uppercase transition hover:bg-mocha hover:text-cream"
              >
                View all reviews <ArrowRight className="size-4" strokeWidth={1.5} />
              </Link>
            </div>
            <div className="mt-8">
              <Carousel
                label="Reviews"
                itemLabel="review"
                items={reviews}
                getKey={(r) => r.id}
                renderItem={(r) => <ReviewTile review={r} />}
                perViewFor={(w) => (w >= 1100 ? 3 : w >= 700 ? 2 : 1.08)}
                arrowTop="50%"
              />
            </div>
          </>
        )}
      </div>
    </section>
  )
}

function ago(date: string) {
  const days = Math.max(0, Math.round((Date.now() - new Date(date).getTime()) / 86_400_000))
  if (days < 1) return 'Today'
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`
  if (days < 30) return `${Math.round(days / 7)} week${Math.round(days / 7) === 1 ? '' : 's'} ago`
  if (days < 365) return `${Math.round(days / 30)} month${Math.round(days / 30) === 1 ? '' : 's'} ago`
  return `${Math.round(days / 365)} year${Math.round(days / 365) === 1 ? '' : 's'} ago`
}

function ReviewTile({ review }: { review: Review }) {
  const product = getAllProducts().find((p) => p.id === review.productId)
  return (
    <article className="flex h-full flex-col rounded-[8px] border border-line bg-card p-6 sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <Stars rating={review.rating} className="size-[20px]" />
        <span className="text-[14px] text-muted">{ago(review.date)}</span>
      </div>
      <blockquote className="mt-5 flex-1 font-serif text-[18px] leading-[1.4] text-ink sm:text-[20px]">{review.text}</blockquote>
      <div className="mt-6 border-t border-line pt-4">
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="font-serif text-[19px]">{review.author}</span>
          {review.verified && <VerifiedBadge />}
        </p>
        {product && (
          <p className="mt-1 text-[15px] text-muted">
            {product.name}
            {review.size && ` · ${review.size.toLowerCase()}`}
          </p>
        )}
      </div>
    </article>
  )
}

function FaqBlock() {
  const faqs = useFaqs()
  const [open, setOpen] = useState<number | null>(null)
  if (!faqs.length) return null
  return (
    <section className="mt-16 lg:mt-24" aria-label="Frequently asked questions">
      <div className="container-x">
        <CenterHead
          num="05"
          aside="Quick answers to common questions."
          title="Frequently Asked Questions"
          subtitle={<p className="mt-3 font-serif text-[17px] text-muted sm:text-[24px]">Everything you need to know about Rfaheya fragrances.</p>}
        />
        <ol className="mx-auto mt-8 max-w-[970px] lg:mt-12">
          {faqs.map((f, i) => (
            <li key={f.q} className="border-b border-line">
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                className="flex w-full items-center gap-5 py-5 text-left sm:gap-12 sm:py-6"
              >
                <span className="w-7 shrink-0 text-[16px] text-mocha sm:text-[22px]">{String(i + 1).padStart(2, '0')}</span>
                <span className="flex-1 font-serif text-[16px] sm:text-[22px]">{f.q}</span>
                <ChevronDown className={`size-5 shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} strokeWidth={1.5} />
              </button>
              {open === i && (
                <div className="pb-6 pl-12 text-[15px] leading-relaxed text-ink-soft sm:pl-[76px] sm:text-[16.5px]">
                  {f.html !== undefined ? <WpHtml html={f.html} /> : <p>{f.text}</p>}
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Related({ products }: { products: Product[] }) {
  return (
    <section className="mt-16 pb-16 lg:mt-24 lg:pb-24" aria-label="You may also like">
      <div className="container-x">
        <CenterHead
          num="06"
          aside="Discover fragrances you might enjoy."
          title="You May Also Like"
          subtitle={<p className="mt-3 font-serif text-[17px] text-muted sm:text-[24px]">Discover fragrances you might enjoy.</p>}
        />
        <div className="mt-8 lg:mt-12">
          {products.length >= 3 ? (
            <Carousel label="Related fragrances" items={products} getKey={(p) => p.id} renderItem={(p) => <ProductCard product={p} />} arrowTop="45%" />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {products.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/shop"
            className="inline-flex h-14 items-center gap-3 border border-mocha px-12 text-[14px] font-medium tracking-[0.1em] text-mocha uppercase transition hover:bg-mocha hover:text-cream"
          >
            View all fragrances <ArrowRight className="size-4" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </section>
  )
}
