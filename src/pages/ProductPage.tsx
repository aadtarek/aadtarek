import { ArrowRight, Badge, FlaskConical, Heart, Truck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fullSizeVariations, getProduct, getReviews, ratingSummary, relatedProducts, sampleVariation } from '../api/catalog'
import { AccordionItem } from '../components/Accordion'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { Carousel } from '../components/Carousel'
import { ProductCard } from '../components/ProductCard'
import { QuantityInput } from '../components/QuantityInput'
import { ReviewCard } from '../components/ReviewCard'
import { SizePicker } from '../components/SizePicker'
import { pillars } from '../data/pillars'
import { Stars } from '../components/Stars'
import { FREE_SHIPPING_THRESHOLD } from '../config'
import { formatPrice } from '../lib/format'
import { useCart } from '../store/cart'
import { useWishlist } from '../store/wishlist'
import type { Product, Review } from '../types'
import { NotFound } from './NotFound'

export function ProductPage() {
  const { slug = '' } = useParams()
  const [product, setProduct] = useState<Product | null | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    getProduct(slug).then((p) => !cancelled && setProduct(p ?? null))
    return () => {
      cancelled = true
    }
  }, [slug])

  if (product === undefined) return <div className="min-h-[70vh]" />
  if (product === null) return <NotFound />
  return <ProductDetails key={product.id} product={product} />
}

function ProductDetails({ product }: { product: Product }) {
  const cart = useCart()
  const wishlist = useWishlist()
  const [variationId, setVariationId] = useState(fullSizeVariations(product)[fullSizeVariations(product).length - 1].id)
  const [qty, setQty] = useState(1)
  const [image, setImage] = useState(0)
  const [reviews, setReviews] = useState<Review[]>([])
  const buyBox = useRef<HTMLDivElement>(null)
  const [showSticky, setShowSticky] = useState(false)

  const variation = product.variations.find((v) => v.id === variationId)!
  const sample = sampleVariation(product)
  const wished = wishlist.has(product.id)
  const { average, count } = ratingSummary(reviews)
  const related = relatedProducts(product)

  useEffect(() => {
    getReviews(product.id).then(setReviews)
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

  const addToCart = () => cart.add(product.id, variationId, qty)

  return (
    <div className="pb-24 lg:pb-0">
      <div className="container-x pt-6 lg:pt-8">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Shop', to: '/shop' }, { label: product.name }]} />
      </div>

      {/* ---------- Gallery + buy box ---------- */}
      <section className="container-x mt-6 grid gap-8 lg:mt-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:gap-14 xl:gap-20">
        <div className="lg:sticky lg:top-[90px] lg:self-start">
          <div className="relative overflow-hidden rounded-lg bg-card">
            <img
              src={product.images[image].src}
              alt={product.images[image].alt}
              className="aspect-square w-full animate-fade-in object-cover"
              key={image}
              fetchPriority="high"
            />
            <span className="absolute top-4 left-4 rounded-full bg-card px-[13px] py-[6px] text-[11.5px] leading-none font-bold tracking-[0.07em] uppercase shadow-sm">
              Eau de parfum
            </span>
          </div>
          {product.images.length > 1 && (
            <ul className="mt-3 flex gap-3" aria-label="Product images">
              {product.images.map((img, i) => (
                <li key={img.src}>
                  <button
                    type="button"
                    onClick={() => setImage(i)}
                    aria-label={`Show image ${i + 1}`}
                    aria-current={i === image}
                    className={`block size-20 overflow-hidden rounded-md border-2 transition sm:size-24 ${
                      i === image ? 'border-olive' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.src} alt="" className="size-full object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="text-[12px] tracking-[0.3em] text-ink-soft uppercase sm:text-[13px]">Inspired by {product.inspiredBy}</p>
          <h1 className="mt-3 font-serif text-[42px] leading-[0.95] uppercase sm:text-[56px]">{product.name}</h1>
          <p className="mt-3 text-[18px] text-ink-soft">{product.tagline}</p>

          {count > 0 && (
            <a href="#reviews" className="mt-4 inline-flex items-center gap-3 text-[14px] text-ink-soft hover:text-ink">
              <Stars rating={average} className="size-[17px]" />
              <span>
                {average.toFixed(1)} · {count} {count === 1 ? 'review' : 'reviews'}
              </span>
            </a>
          )}

          <p className="mt-5 text-[28px] font-semibold" aria-live="polite">
            {formatPrice(variation.price * qty)}
            {qty > 1 && <span className="ml-2 text-[14px] font-normal text-muted">({formatPrice(variation.price)} each)</span>}
          </p>

          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Main accords">
            {product.accords.map((a) => (
              <li key={a}>
                <Link to={`/shop?accord=${encodeURIComponent(a)}`} className="block rounded-[6px] bg-chip px-3 py-1 text-[13px] text-ink-soft hover:bg-line">
                  {a}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <div className="mb-3 flex items-baseline justify-between">
              <p className="text-[12.5px] font-semibold tracking-[0.12em] uppercase">Size · {variation.size}</p>
              {variation.isSample && <p className="text-[12.5px] text-muted">Discovery sample</p>}
            </div>
            <SizePicker variations={product.variations} value={variationId} onChange={setVariationId} />
          </div>

          <div ref={buyBox} className="mt-5 flex gap-3">
            <QuantityInput value={qty} onChange={setQty} />
            <button
              type="button"
              onClick={addToCart}
              className="h-12 flex-1 rounded-[3px] bg-olive text-[12.5px] font-medium tracking-[0.12em] text-cream uppercase transition hover:bg-olive-hover"
            >
              Add to cart
            </button>
            <button
              type="button"
              onClick={() => wishlist.toggle(product.id)}
              aria-pressed={wished}
              aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
              className="grid size-12 shrink-0 place-items-center rounded-[3px] border border-line-strong transition hover:border-ink"
            >
              <Heart className={`size-5 ${wished ? 'fill-ink' : ''}`} strokeWidth={1.5} />
            </button>
          </div>

          {sample && !variation.isSample && (
            <button
              type="button"
              onClick={() => cart.add(product.id, sample.id)}
              className="mt-3 flex w-full items-center justify-between gap-3 rounded-[3px] border border-dashed border-line-strong px-4 py-3 text-left transition hover:border-ink hover:bg-card"
            >
              <span className="flex items-center gap-3">
                <FlaskConical className="size-5 shrink-0" strokeWidth={1.3} />
                <span className="text-[14px]">
                  Not sure yet? <strong className="font-semibold">Try {sample.size} first</strong>
                </span>
              </span>
              <span className="text-[14px] font-semibold whitespace-nowrap">{formatPrice(sample.price)}</span>
            </button>
          )}

          <ul className="mt-6 grid grid-cols-3 gap-2 rounded-lg bg-card p-4 text-center shadow-[0_0_0_1px_rgba(60,45,20,0.05)]">
            {[
              { Icon: Truck, title: 'Free shipping', text: `Cairo & Alex over ${FREE_SHIPPING_THRESHOLD.toLocaleString('en-US')} EGP` },
              { Icon: FlaskConical, title: 'Try 10 ML first', text: 'Discover before you commit' },
              { Icon: Badge, title: 'Zero risk', text: 'Easy returns, even if used' },
            ].map(({ Icon, title, text }) => (
              <li key={title} className="flex flex-col items-center px-1">
                <Icon className="size-6" strokeWidth={1.25} />
                <span className="mt-2 text-[11px] font-semibold tracking-[0.08em] uppercase">{title}</span>
                <span className="mt-0.5 text-[12px] leading-snug text-muted">{text}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t border-line">
            <AccordionItem title="Description" open>
              <p>{product.description}</p>
            </AccordionItem>
            <AccordionItem title="Fragrance notes">
              <ul className="grid grid-cols-5 gap-2 pt-1">
                {product.notes.map((n) => (
                  <li key={n.name} className="flex flex-col items-center text-center">
                    <img src={n.image} alt="" className="h-10 w-auto object-contain" />
                    <span className="mt-1 text-[12px] leading-tight">{n.name}</span>
                  </li>
                ))}
              </ul>
            </AccordionItem>
            <AccordionItem title="How to wear">
              <p>
                Apply to pulse points — wrists, neck and behind the ears — from about 15 cm away. Let it settle on skin rather
                than rubbing it in, so the scent can unfold naturally through the day. A light mist on clothing extends the
                trail.
              </p>
            </AccordionItem>
            <AccordionItem title="Shipping & returns">
              <p>
                Free shipping in Cairo &amp; Alexandria on orders over {FREE_SHIPPING_THRESHOLD.toLocaleString('en-US')} EGP. Pay
                cash on delivery. Our zero-risk guarantee means easy returns — even if used.{' '}
                <Link to="/contact" className="text-ink underline underline-offset-4">
                  Questions? Contact us
                </Link>
                .
              </p>
            </AccordionItem>
          </div>
        </div>
      </section>

      {/* ---------- Notes ---------- */}
      <section className="mt-16 bg-card py-14 lg:mt-24 lg:py-20" aria-labelledby="notes-title">
        <div className="container-x text-center">
          <p className="text-[12px] tracking-[0.3em] text-ink-soft uppercase sm:text-[14px]">The composition</p>
          <h2 id="notes-title" className="mt-2 font-serif text-[36px] leading-[1.05] sm:text-[48px]">
            What’s inside {product.name}.
          </h2>
          <ul className="mx-auto mt-10 grid max-w-4xl grid-cols-3 gap-y-10 sm:grid-cols-5">
            {product.notes.map((n) => (
              <li key={n.name} className="flex flex-col items-center">
                <span className="grid size-24 place-items-center rounded-full bg-sand shadow-[inset_0_0_0_1px_rgba(60,45,20,0.06)] sm:size-28">
                  <img src={n.image} alt="" className="h-14 w-auto object-contain sm:h-16" />
                </span>
                <span className="mt-3 font-serif text-[18px] uppercase">{n.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Standard ---------- */}
      <section className="container-x py-14 lg:py-20" aria-labelledby="pdp-standard-title">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[12px] tracking-[0.3em] text-ink-soft uppercase sm:text-[14px]">Rfaheya Standard™</p>
            <h2 id="pdp-standard-title" className="mt-2 font-serif text-[36px] leading-[1.05] sm:text-[48px]">
              Evaluated beyond the first spray.
            </h2>
          </div>
          <Link to="/our-standard" className="group inline-flex items-center gap-3 text-[13px] font-medium tracking-[0.15em] uppercase">
            Our standard
            <ArrowRight className="size-[18px] transition group-hover:translate-x-1" strokeWidth={1.5} />
          </Link>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-[13px] sm:grid-cols-3 lg:grid-cols-6">
          {pillars.map((p) => (
            <li key={p.title} className="flex flex-col items-center rounded-lg border border-line bg-card px-3 py-6 text-center">
              <img src={p.image} alt="" loading="lazy" className="size-20 rounded-full object-cover" />
              <p className="mt-4 font-serif text-[18px] uppercase">{p.title}</p>
              <p className="mt-1.5 text-[13px] leading-snug text-muted">{p.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Reviews ---------- */}
      <section id="reviews" className="scroll-mt-24 border-t border-line" aria-labelledby="pdp-reviews-title">
        <div className="container-x py-14 lg:py-20">
          <p className="text-[12px] tracking-[0.3em] text-ink-soft uppercase sm:text-[14px]">Customer reviews</p>
          <h2 id="pdp-reviews-title" className="mt-2 font-serif text-[36px] leading-[1.05] sm:text-[48px]">
            {count > 0 ? 'What wearers say.' : 'No reviews yet.'}
          </h2>
          {count > 0 ? (
            <ul className="mt-8 grid gap-[13px] md:grid-cols-2 xl:grid-cols-3">
              {reviews.map((r) => (
                <li key={r.id}>
                  <ReviewCard review={r} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 max-w-lg text-ink-soft">
              Be the first to share your experience with {product.name} — reviews are collected from verified purchases after
              delivery.
            </p>
          )}
        </div>
      </section>

      {/* ---------- Related ---------- */}
      {related.length > 0 && (
        <section className="border-t border-line bg-sand" aria-labelledby="related-title">
          <div className="container-x py-14 lg:py-20">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[12px] tracking-[0.3em] text-ink-soft uppercase sm:text-[14px]">You may also like</p>
                <h2 id="related-title" className="mt-2 font-serif text-[36px] leading-[1.05] sm:text-[48px]">
                  Complete your wardrobe.
                </h2>
              </div>
              <Link to="/shop" className="group hidden items-center gap-3 text-[13px] font-medium tracking-[0.15em] uppercase sm:flex">
                View all
                <ArrowRight className="size-[18px] transition group-hover:translate-x-1" strokeWidth={1.5} />
              </Link>
            </div>
            <div className="mt-8">
              {related.length >= 3 ? (
                <Carousel
                  label="Related fragrances"
                  items={related}
                  getKey={(p) => p.id}
                  renderItem={(p) => <ProductCard product={p} />}
                  perViewFor={(w) => (w >= 1180 ? 3 : w >= 560 ? 2.1 : 1.15)}
                />
              ) : (
                <ul className="grid gap-[18px] sm:grid-cols-2 xl:grid-cols-3">
                  {related.map((p) => (
                    <li key={p.id}>
                      <ProductCard product={p} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Mobile sticky buy bar ---------- */}
      <div
        className={`fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream/95 px-4 py-3 backdrop-blur transition-transform duration-300 lg:hidden ${
          showSticky ? 'translate-y-0' : 'translate-y-full'
        }`}
        aria-hidden={!showSticky}
        inert={!showSticky || undefined}
      >
        <div className="flex items-center gap-3">
          <img src={product.images[0].src} alt="" className="size-12 rounded object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-[16px] uppercase">{product.name}</p>
            <p className="text-[13px] text-muted">
              {variation.size} · {formatPrice(variation.price)}
            </p>
          </div>
          <button
            type="button"
            onClick={addToCart}
            className="h-11 rounded-[3px] bg-olive px-5 text-[12px] font-medium tracking-[0.12em] text-cream uppercase"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  )
}
