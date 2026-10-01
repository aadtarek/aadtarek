import { ChevronRight, Heart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fullSizeVariations, getProduct } from '../api/catalog'
import { QuantityInput } from '../components/QuantityInput'
import { SizePicker } from '../components/SizePicker'
import { formatPrice } from '../lib/format'
import { useCart } from '../store/cart'
import { useWishlist } from '../store/wishlist'
import type { Product } from '../types'
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

  if (product === undefined) return <div className="min-h-[60vh]" />
  if (product === null) return <NotFound />
  return <ProductDetails key={product.id} product={product} />
}

function ProductDetails({ product }: { product: Product }) {
  const cart = useCart()
  const wishlist = useWishlist()
  const [variationId, setVariationId] = useState(fullSizeVariations(product)[0].id)
  const [qty, setQty] = useState(1)
  const variation = product.variations.find((v) => v.id === variationId)!
  const wished = wishlist.has(product.id)

  useEffect(() => {
    document.title = `${product.name} — Rfaheya`
    return () => {
      document.title = 'Rfaheya — Speak Your Scent'
    }
  }, [product.name])

  return (
    <div className="container-x py-8 lg:py-12">
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-[12px] tracking-[0.06em] text-muted uppercase">
        <Link to="/" className="hover:text-ink">Home</Link>
        <ChevronRight className="size-3.5" />
        <Link to="/shop" className="hover:text-ink">Shop</Link>
        <ChevronRight className="size-3.5" />
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="overflow-hidden rounded-lg">
          <img src={product.images[0].src} alt={product.images[0].alt} className="aspect-[348/229] w-full object-cover" />
        </div>

        <div>
          <p className="text-[12px] tracking-[0.3em] text-ink-soft uppercase">Eau de parfum</p>
          <h1 className="mt-2 font-serif text-[40px] leading-none uppercase sm:text-[48px]">{product.name}</h1>
          <p className="mt-3 text-lg text-ink-soft">{product.tagline}</p>
          <p className="mt-4 text-2xl font-semibold">{formatPrice(variation.price * qty)}</p>

          <ul className="mt-5 flex flex-wrap gap-2">
            {product.accords.map((a) => (
              <li key={a} className="rounded-[6px] bg-chip px-3 py-1 text-[13px] text-ink-soft">
                {a}
              </li>
            ))}
          </ul>

          <p className="mt-6 max-w-xl leading-relaxed text-ink-soft">{product.description}</p>

          <p className="mt-6 mb-2 text-[12px] font-medium tracking-[0.08em] uppercase">Size</p>
          <SizePicker variations={product.variations} value={variationId} onChange={setVariationId} />

          <div className="mt-5 flex gap-3">
            <QuantityInput value={qty} onChange={setQty} />
            <button
              type="button"
              onClick={() => cart.add(product.id, variationId, qty)}
              className="h-12 flex-1 rounded-[3px] bg-olive text-[12.5px] font-medium tracking-[0.12em] text-cream uppercase transition hover:bg-olive-hover"
            >
              Add to cart
            </button>
            <button
              type="button"
              onClick={() => wishlist.toggle(product.id)}
              aria-pressed={wished}
              aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
              className="grid size-12 place-items-center rounded-[3px] border border-line-strong transition hover:border-ink"
            >
              <Heart className={`size-5 ${wished ? 'fill-ink' : ''}`} strokeWidth={1.5} />
            </button>
          </div>

          <div className="mt-8 border-t border-line pt-6">
            <p className="text-[12.5px] font-medium tracking-[0.04em] uppercase">Fragrance notes</p>
            <ul className="mt-3 flex flex-wrap gap-6">
              {product.notes.map((n) => (
                <li key={n.name} className="flex w-16 flex-col items-center text-center">
                  <img src={n.image} alt="" className="h-11 w-auto object-contain" />
                  <span className="mt-1 text-[12px] text-ink-soft">{n.name}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[12.5px] tracking-[0.02em] text-ink-soft uppercase">Inspired by</p>
            <p className="mt-0.5 text-ink-soft">{product.inspiredBy}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
