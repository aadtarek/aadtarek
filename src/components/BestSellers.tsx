import { ArrowRight } from 'lucide-react'
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { getProducts, type ProductSort } from '../api/catalog'
import type { Product } from '../types'
import { firstOpenStep, TOTAL_STEPS, type FinderAnswers } from '../finder/data'
import { rankProducts } from '../finder/match'
import { useWishlist } from '../store/wishlist'
import { useCart } from '../store/cart'
import { ProductCard } from './ProductCard'
import { Carousel } from './Carousel'

type Tab = 'best' | 'new' | 'suggested'

const tabs: Record<Tab, { label: string; badge?: string; sort: ProductSort; link: string }> = {
  best: { label: 'Best sellers', badge: 'Best Seller', sort: 'best-sellers', link: '/shop?sort=best-sellers' },
  new: { label: 'New arrivals', badge: 'New', sort: 'newest', link: '/shop?sort=newest' },
  suggested: { label: 'Suggested for you', sort: 'best-sellers', link: '/finder' },
}

/**
 * “Suggested for you”: the finder's matches when the visitor has taken it;
 * otherwise fragrances from the families they saved or added to the bag;
 * otherwise a mix of the store's favourites, one family at a time.
 */
function suggest(list: Product[], liked: Set<number>): Product[] {
  try {
    const raw = JSON.parse(localStorage.getItem('rfaheya.finder') ?? 'null') as FinderAnswers | null
    if (raw && firstOpenStep({ ...raw, notes: Array.isArray(raw.notes) ? raw.notes : [] }) === TOTAL_STEPS) {
      return rankProducts(list, { ...raw, notes: raw.notes ?? [] }).map((m) => m.product)
    }
  } catch {
    // no finder answers saved
  }
  const families = new Set(list.filter((p) => liked.has(p.id)).flatMap((p) => p.families))
  if (families.size) {
    const close = list.filter((p) => !liked.has(p.id) && p.families.some((f) => families.has(f)))
    const rest = list.filter((p) => !liked.has(p.id) && !close.includes(p))
    return [...close, ...rest]
  }
  // One of each family in turn, so the row isn't all alike.
  const byFamily = new Map<string, Product[]>()
  for (const p of list) {
    const key = p.families[0] ?? 'other'
    byFamily.set(key, [...(byFamily.get(key) ?? []), p])
  }
  const out: Product[] = []
  for (let i = 0; out.length < list.length; i++) {
    for (const group of byFamily.values()) if (group[i]) out.push(group[i])
  }
  return out
}

const PHONE = '(max-width: 639px)'
/** True on phones; follows the window as it resizes. */
function usePhone() {
  return useSyncExternalStore(
    (on) => {
      const mq = window.matchMedia(PHONE)
      mq.addEventListener('change', on)
      return () => mq.removeEventListener('change', on)
    },
    () => window.matchMedia(PHONE).matches,
  )
}

/** Home: centred title, pill tabs (best sellers / new arrivals / suggested for you) and the product cards. */
export function BestSellers() {
  const [tab, setTab] = useState<Tab>('best')
  const [products, setProducts] = useState<Product[]>([])
  const wishlist = useWishlist()
  const cart = useCart()
  const t = tabs[tab]

  useEffect(() => {
    let cancelled = false
    getProducts({ sort: t.sort }).then((list) => {
      if (cancelled) return
      setProducts(tab === 'suggested' ? suggest(list, new Set([...wishlist.ids, ...cart.lines.map((l) => l.productId)])) : list)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  const items = useMemo(() => products.slice(0, 12), [products])
  const phone = usePhone()

  return (
    <section className="pt-12 pb-4 lg:pt-16" aria-labelledby="best-sellers-title">
      <div className="container-x">
        <div className="flex flex-col items-center text-center">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-gold uppercase">Customers’ favourites</p>
          <h2 id="best-sellers-title" className="mt-2.5 font-serif text-[38px] leading-none sm:text-[52px]">
            Our best sellers
          </h2>
          <div role="tablist" aria-label="Product lists" className="no-scrollbar mt-5 flex max-w-full overflow-x-auto rounded-full bg-chip p-[5px] lg:mt-6">
            {(Object.keys(tabs) as Tab[]).map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={`h-10 shrink-0 rounded-full px-4 text-[11.5px] font-semibold tracking-[0.06em] whitespace-nowrap transition duration-300 sm:px-5 sm:text-[12px] ${
                  tab === key ? 'rf-white text-ink shadow-[0_4px_12px_-6px_rgba(60,40,10,0.3)]' : 'text-muted hover:text-ink'
                }`}
              >
                {tabs[key].label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-7 lg:mt-9" role="tabpanel" aria-labelledby="best-sellers-title">
          {items.length > 0 &&
            (phone ? (
              // Phones: a 2 × 2 grid
              <ul className="grid grid-cols-2 gap-2.5">
                {items.slice(0, 4).map((p) => (
                  <li key={p.id}>
                    <ProductCard product={p} badge={t.badge} />
                  </li>
                ))}
              </ul>
            ) : (
              <Carousel label={t.label} items={items} getKey={(p) => p.id} renderItem={(p) => <ProductCard product={p} badge={t.badge} />} gap={20} />
            ))}
        </div>
        <div className="mt-7 flex justify-center">
          <Link
            to={t.link}
            className="rf-white group inline-flex h-12 items-center gap-2 rounded-full border border-line px-6 text-[11.5px] font-semibold tracking-[0.12em] uppercase transition hover:border-ink"
          >
            View all fragrances
            <ArrowRight className="size-4 transition group-hover:translate-x-1" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </section>
  )
}
