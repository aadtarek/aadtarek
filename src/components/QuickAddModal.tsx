import { X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { fullSizeVariations } from '../api/catalog'
import { formatPrice } from '../lib/format'
import { useCart } from '../store/cart'
import type { Product } from '../types'
import { Overlay } from './Overlay'
import { QuantityInput } from './QuantityInput'
import { SizePicker } from './SizePicker'

/** "Add to cart" on a card opens this so the customer picks a bottle size first. */
export function QuickAddModal() {
  const { quickAdd, closeQuickAdd } = useCart()
  if (!quickAdd) return null
  return <QuickAdd key={quickAdd.id} product={quickAdd} onClose={closeQuickAdd} />
}

function QuickAdd({ product, onClose }: { product: Product; onClose: () => void }) {
  const cart = useCart()
  const options = product.variations
  const [variationId, setVariationId] = useState(fullSizeVariations(product)[0].id)
  const [qty, setQty] = useState(1)
  const selected = options.find((v) => v.id === variationId)!

  return (
    <Overlay onClose={onClose} label={`Choose a size for ${product.name}`}>
      <div className="absolute inset-x-0 bottom-0 max-h-[92vh] overflow-y-auto rounded-t-2xl bg-cream shadow-2xl [animation:pop-in_.25s_ease-out] sm:inset-auto sm:top-1/2 sm:left-1/2 sm:w-[min(40rem,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 grid size-9 place-items-center rounded-full bg-cream/90 hover:bg-chip"
        >
          <X className="size-5" strokeWidth={1.5} />
        </button>
        <div className="grid sm:grid-cols-[1fr_1.15fr]">
          <img src={product.images[0].src} alt={product.images[0].alt} className="aspect-[348/229] w-full object-cover sm:aspect-auto sm:h-full" />
          <div className="p-5 sm:p-6">
            <h2 className="pr-8 font-serif text-[24px] leading-none uppercase">{product.name}</h2>
            <p className="mt-2 text-sm text-ink-soft">{product.tagline}</p>
            <p className="mt-1 text-xs text-muted">Inspired by {product.inspiredBy}</p>

            <p className="mt-5 mb-2 text-[12px] font-medium tracking-[0.08em] uppercase">Choose size</p>
            <SizePicker variations={options} value={variationId} onChange={setVariationId} />

            <div className="mt-5 flex items-center justify-between gap-3">
              <QuantityInput value={qty} onChange={setQty} />
              <p className="text-lg font-semibold">{formatPrice(selected.price * qty)}</p>
            </div>

            <button
              type="button"
              onClick={() => cart.add(product.id, variationId, qty)}
              className="mt-4 h-[52px] w-full rounded-[3px] bg-olive text-[12.5px] font-medium tracking-[0.12em] text-cream uppercase transition hover:bg-olive-hover"
            >
              Add to cart
            </button>
            <Link
              to={`/product/${product.slug}`}
              onClick={onClose}
              className="mt-3 block text-center text-[12px] tracking-[0.08em] text-muted uppercase underline-offset-4 hover:text-ink hover:underline"
            >
              View full details
            </Link>
          </div>
        </div>
      </div>
    </Overlay>
  )
}
