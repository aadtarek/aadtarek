import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts, type ProductSort } from '../api/catalog'
import type { Product } from '../types'
import { ProductCard } from './ProductCard'
import { ProductCarousel } from './ProductCarousel'

type Tab = 'new' | 'best'

const tabs: Record<Tab, { label: string; eyebrow: string; title: string; subtitle: string; badge: string; sort: ProductSort }> = {
  new: {
    label: 'New Arrivals',
    eyebrow: 'Just landed',
    title: 'New Arrivals.',
    subtitle: 'The latest additions to the Rfaheya collection.',
    badge: 'New',
    sort: 'newest',
  },
  best: {
    label: 'Best Sellers',
    eyebrow: 'Customers’ favorites',
    title: 'Our Best Sellers.',
    subtitle: 'The most loved fragrances, chosen by our customers.',
    badge: 'Best Seller',
    sort: 'best-sellers',
  },
}

export function BestSellers() {
  const [tab, setTab] = useState<Tab>('best')
  const [products, setProducts] = useState<Product[]>([])
  const t = tabs[tab]

  useEffect(() => {
    let cancelled = false
    getProducts({ sort: t.sort }).then((list) => !cancelled && setProducts(list))
    return () => {
      cancelled = true
    }
  }, [t.sort])

  return (
    <section className="bg-sand pt-10 pb-12 lg:pt-[46px] lg:pb-[42px]" aria-labelledby="best-sellers-title">
      <div className="container-x">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[12px] tracking-[0.3em] text-ink-soft uppercase sm:text-[14px]">{t.eyebrow}</p>
            <h2 id="best-sellers-title" className="mt-1.5 font-serif text-[38px] leading-[1.05] sm:text-[52px]">
              {t.title}
            </h2>
            <p className="mt-2 text-[15px] text-ink-soft sm:text-[16px]">{t.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 lg:mt-[17px] lg:flex-nowrap lg:flex-1 lg:justify-end lg:gap-[9.5%]">
            <div role="tablist" aria-label="Product lists" className="flex w-full rounded-full border border-line-strong/80 bg-sand p-0 sm:w-auto">
              {(Object.keys(tabs) as Tab[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={tab === key}
                  onClick={() => setTab(key)}
                  className={`h-11 flex-1 rounded-full px-4 text-[12px] sm:flex-none font-medium tracking-[0.15em] whitespace-nowrap uppercase transition sm:h-[52px] sm:w-[241px] sm:px-0 sm:text-[14px] ${
                    tab === key ? 'bg-olive text-cream' : 'text-ink hover:bg-chip'
                  }`}
                >
                  {tabs[key].label}
                </button>
              ))}
            </div>
            <Link
              to={`/shop?sort=${t.sort}`}
              className="group flex shrink-0 items-center gap-3 text-[12px] font-medium tracking-[0.15em] whitespace-nowrap uppercase sm:text-[14px]"
            >
              View all
              <ArrowRight className="size-5 transition group-hover:translate-x-1" strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        <div className="mt-6 lg:mt-[30px]" role="tabpanel" aria-labelledby="best-sellers-title">
          {products.length > 0 && (
            <ProductCarousel
              label={t.label}
              items={products}
              getKey={(p) => p.id}
              renderItem={(p) => <ProductCard product={p} badge={t.badge} />}
            />
          )}
        </div>
      </div>
    </section>
  )
}
