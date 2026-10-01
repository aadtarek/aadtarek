import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getAllAccords, getProducts, type ProductSort } from '../api/catalog'
import { PageHeader } from '../components/PageHeader'
import { ProductCard } from '../components/ProductCard'
import type { Product } from '../types'

const sorts: { value: ProductSort; label: string }[] = [
  { value: 'best-sellers', label: 'Best sellers' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name A–Z' },
]

export function Shop() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const accord = params.get('accord') ?? ''
  const sort = (params.get('sort') as ProductSort) || 'best-sellers'
  const [products, setProducts] = useState<Product[] | null>(null)

  useEffect(() => {
    let cancelled = false
    getProducts({ search: q, accord: accord || undefined, sort }).then((list) => !cancelled && setProducts(list))
    return () => {
      cancelled = true
    }
  }, [q, accord, sort])

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-2 text-[12px] tracking-[0.08em] uppercase transition ${
      active ? 'border-olive bg-olive text-cream' : 'border-line-strong hover:border-ink'
    }`

  return (
    <div className="pb-16">
      <PageHeader eyebrow="The collection" title={q ? `Results for “${q}”` : 'Shop All Fragrances.'}>
        {q && (
          <button type="button" onClick={() => update('q', '')} className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
            <X className="size-4" /> Clear search
          </button>
        )}
      </PageHeader>

      <div className="container-x">
        <div className="flex flex-col gap-4 border-y border-line py-4 md:flex-row md:items-center md:justify-between">
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
            <button type="button" className={chip(!accord)} onClick={() => update('accord', '')}>
              All
            </button>
            {getAllAccords().map((a) => (
              <button key={a} type="button" className={chip(accord === a)} onClick={() => update('accord', accord === a ? '' : a)}>
                {a}
              </button>
            ))}
          </div>
          <label className="flex shrink-0 items-center gap-2 text-[12px] tracking-[0.08em] uppercase">
            Sort by
            <select
              value={sort}
              onChange={(e) => update('sort', e.target.value)}
              className="h-10 rounded-[3px] border border-line-strong bg-cream px-3 text-[13px] tracking-normal normal-case"
            >
              {sorts.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {products && (
          <p className="mt-5 text-[13px] text-muted">
            {products.length} {products.length === 1 ? 'fragrance' : 'fragrances'}
          </p>
        )}

        {products?.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-serif text-3xl">Nothing matches yet.</p>
            <p className="mt-2 text-muted">Try another note, accord or fragrance name.</p>
          </div>
        ) : (
          <ul className="mt-5 grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products?.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
