import { SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getAllAccords, getAllProducts, getFamilies, getProducts, matchesSearch, type ProductSort } from '../api/catalog'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { Overlay } from '../components/Overlay'
import { ProductCard } from '../components/ProductCard'
import type { FamilySlug, Product } from '../types'

const sorts: { value: ProductSort; label: string }[] = [
  { value: 'best-sellers', label: 'Best sellers' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name A–Z' },
]

const list = (v: string | null) => (v ? v.split(',').filter(Boolean) : [])

export function Shop() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const sort = (params.get('sort') as ProductSort) || 'best-sellers'
  const familyParam = params.get('family')
  const accordParam = params.get('accord')
  const families = useMemo(() => list(familyParam) as FamilySlug[], [familyParam])
  const accords = useMemo(() => list(accordParam), [accordParam])
  const [products, setProducts] = useState<Product[] | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    getProducts({ search: q, accords, families, sort }).then((r) => !cancelled && setProducts(r))
    return () => {
      cancelled = true
    }
  }, [q, accords, families, sort])

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }
  const toggle = (key: 'family' | 'accord', current: string[], value: string) =>
    setParam(key, (current.includes(value) ? current.filter((v) => v !== value) : [...current, value]).join(','))
  const clearAll = () => setParams(sort !== 'best-sellers' ? { sort } : {}, { replace: true })

  const allFamilies = getFamilies()
  const single = families.length === 1 && !q ? allFamilies.find((f) => f.slug === families[0]) : undefined
  const activeCount = families.length + accords.length + (q ? 1 : 0)
  const filterProps = { families, accords, q, toggle, clearAll, activeCount }

  return (
    <div className="pb-16 lg:pb-24">
      <div className="container-x pt-8 lg:pt-10">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Shop' }]} />
        <div className="mt-6 flex flex-col gap-4 lg:mt-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[12px] tracking-[0.3em] text-ink-soft uppercase sm:text-[14px]">
              {single ? single.tagline : 'The collection'}
            </p>
            <h1 className="mt-1.5 font-serif text-[40px] leading-[1.05] sm:text-[56px]">
              {q ? `Results for “${q}”` : single ? `${single.name} Fragrances.` : 'Shop All Fragrances.'}
            </h1>
          </div>
          <p className="max-w-[26rem] text-[15px] leading-[1.65] text-ink-soft lg:mb-2 lg:text-right">
            Inspired fragrances crafted with quality materials and high concentration. Try any scent in 10 ML before you
            commit.
          </p>
        </div>

        {/* Family quick-filters */}
        <ul className="no-scrollbar -mx-4 mt-8 flex gap-3 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-6 lg:gap-[13px] lg:overflow-visible lg:px-0">
          <li className="shrink-0">
            <FamilyTile label="All" active={families.length === 0} onClick={() => setParam('family', '')} />
          </li>
          {allFamilies.map((f) => (
            <li key={f.slug} className="shrink-0">
              <FamilyTile label={f.name} image={f.image} active={families.includes(f.slug)} onClick={() => toggle('family', families, f.slug)} />
            </li>
          ))}
        </ul>
      </div>

      <div className="container-x mt-8 grid gap-10 lg:mt-12 lg:grid-cols-[250px_1fr] xl:gap-14">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-[90px]">
            <Filters {...filterProps} />
          </div>
        </aside>

        <div>
          <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-line-strong px-5 text-[12px] font-medium tracking-[0.12em] uppercase lg:hidden"
            >
              <SlidersHorizontal className="size-4" strokeWidth={1.5} />
              Filters{activeCount > 0 && ` (${activeCount})`}
            </button>
            <p className="hidden text-[14px] text-muted lg:block" aria-live="polite">
              {products ? `${products.length} ${products.length === 1 ? 'fragrance' : 'fragrances'}` : ''}
            </p>
            <label className="flex items-center gap-3 text-[12px] tracking-[0.12em] uppercase">
              <span className="hidden sm:inline">Sort by</span>
              <select
                value={sort}
                onChange={(e) => setParam('sort', e.target.value === 'best-sellers' ? '' : e.target.value)}
                className="h-11 rounded-full border border-line-strong bg-sand px-4 text-[13px] tracking-normal normal-case outline-none focus:border-olive"
              >
                {sorts.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {activeCount > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {q && <Pill label={`“${q}”`} onRemove={() => setParam('q', '')} />}
              {families.map((f) => (
                <Pill key={f} label={allFamilies.find((x) => x.slug === f)?.name ?? f} onRemove={() => toggle('family', families, f)} />
              ))}
              {accords.map((a) => (
                <Pill key={a} label={a} onRemove={() => toggle('accord', accords, a)} />
              ))}
              <button
                type="button"
                onClick={clearAll}
                className="ml-1 text-[12px] tracking-[0.1em] text-muted uppercase underline-offset-4 hover:text-ink hover:underline"
              >
                Clear all
              </button>
            </div>
          )}

          {products?.length === 0 ? (
            <div className="mt-6 rounded-lg bg-card px-6 py-16 text-center shadow-[0_0_0_1px_rgba(60,45,20,0.05)]">
              <p className="font-serif text-[32px]">Nothing matches yet.</p>
              <p className="mx-auto mt-2 max-w-sm text-ink-soft">
                We’re always crafting new scents. Try another family or note — or explore the full collection.
              </p>
              <button
                type="button"
                onClick={clearAll}
                className="mt-6 inline-flex h-12 items-center rounded-[3px] bg-olive px-8 text-[12px] font-medium tracking-[0.12em] text-cream uppercase hover:bg-olive-hover"
              >
                View all fragrances
              </button>
            </div>
          ) : (
            <ul className="mt-6 grid gap-[18px] sm:grid-cols-2 xl:grid-cols-3">
              {products?.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          )}

          <TryFirstBanner />
        </div>
      </div>

      {filtersOpen && (
        <Overlay onClose={() => setFiltersOpen(false)} label="Filters">
          <div className="absolute inset-y-0 left-0 flex w-[min(22rem,90vw)] flex-col bg-cream shadow-2xl [animation:slide-in-left_.3s_cubic-bezier(.22,1,.36,1)]">
            <div className="flex h-16 items-center justify-between border-b border-line px-5">
              <p className="text-[13px] font-semibold tracking-[0.14em] uppercase">Filters</p>
              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setFiltersOpen(false)}
                className="grid size-9 place-items-center rounded-full hover:bg-chip"
              >
                <X className="size-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <Filters {...filterProps} />
            </div>
            <div className="border-t border-line p-5">
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="h-[50px] w-full rounded-[3px] bg-olive text-[12px] font-medium tracking-[0.12em] text-cream uppercase"
              >
                Show {products?.length ?? 0} {products?.length === 1 ? 'result' : 'results'}
              </button>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  )
}

function FamilyTile({ label, image, active, onClick }: { label: string; image?: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group flex h-[68px] w-[168px] items-center gap-3 rounded-lg border p-2 pr-4 text-left transition lg:w-full ${
        active ? 'border-olive bg-olive text-cream' : 'border-line bg-card hover:border-line-strong'
      }`}
    >
      <span className={`grid size-[52px] shrink-0 place-items-center overflow-hidden rounded-md ${image ? '' : active ? 'bg-cream/10' : 'bg-chip'}`}>
        {image ? (
          <img src={image} alt="" className="size-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <span aria-hidden className="font-serif text-[22px]">
            ✦
          </span>
        )}
      </span>
      <span className="font-serif text-[17px] uppercase">{label}</span>
    </button>
  )
}

function Pill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-chip py-1.5 pr-2 pl-3.5 text-[13px]">
      {label}
      <button type="button" onClick={onRemove} aria-label={`Remove ${label}`} className="grid size-5 place-items-center rounded-full hover:bg-line">
        <X className="size-3.5" />
      </button>
    </span>
  )
}

function Filters({
  families,
  accords,
  q,
  toggle,
  clearAll,
  activeCount,
}: {
  families: FamilySlug[]
  accords: string[]
  q: string
  toggle: (key: 'family' | 'accord', current: string[], value: string) => void
  clearAll: () => void
  activeCount: number
}) {
  // Counts reflect the current search so customers can see what each filter will return.
  const base = getAllProducts().filter((p) => matchesSearch(p, q))
  return (
    <div className="space-y-8">
      <FilterGroup title="Fragrance family">
        {getFamilies().map((f) => (
          <Check
            key={f.slug}
            label={f.name}
            count={base.filter((p) => p.families.includes(f.slug)).length}
            checked={families.includes(f.slug)}
            onChange={() => toggle('family', families, f.slug)}
          />
        ))}
      </FilterGroup>
      <FilterGroup title="Main accords">
        {getAllAccords().map((a) => (
          <Check
            key={a}
            label={a}
            count={base.filter((p) => p.accords.includes(a)).length}
            checked={accords.includes(a)}
            onChange={() => toggle('accord', accords, a)}
          />
        ))}
      </FilterGroup>
      {activeCount > 0 && (
        <button type="button" onClick={clearAll} className="text-[12px] tracking-[0.12em] uppercase underline underline-offset-4">
          Clear all filters
        </button>
      )}
    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 text-[12.5px] font-semibold tracking-[0.14em] uppercase">{title}</legend>
      <div className="space-y-1">{children}</div>
    </fieldset>
  )
}

function Check({ label, count, checked, onChange }: { label: string; count: number; checked: boolean; onChange: () => void }) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-md px-1 py-1.5 text-[15px] transition hover:bg-chip ${
        count === 0 && !checked ? 'opacity-45' : ''
      }`}
    >
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        aria-hidden
        className="grid size-[18px] shrink-0 place-items-center rounded-[4px] border border-line-strong transition peer-checked:border-olive peer-checked:bg-olive peer-focus-visible:outline-2 peer-focus-visible:outline-olive"
      >
        <svg viewBox="0 0 12 12" className={`size-3 text-cream ${checked ? '' : 'invisible'}`}>
          <path d="M2.5 6.2l2.3 2.3L9.5 3.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="flex-1">{label}</span>
      <span className="text-[12.5px] text-muted tabular-nums">{count}</span>
    </label>
  )
}

function TryFirstBanner() {
  return (
    <div className="mt-12 grid items-center gap-6 overflow-hidden rounded-lg bg-olive p-8 text-cream sm:grid-cols-[1fr_auto] lg:mt-16 lg:p-10">
      <div>
        <p className="text-[12px] tracking-[0.3em] text-cream/70 uppercase">Not sure yet?</p>
        <p className="mt-2 font-serif text-[30px] leading-[1.1] sm:text-[36px]">Try any scent in 10 ML for 60 EGP.</p>
        <p className="mt-2 max-w-lg text-[15px] text-cream/75">Live with it for a few days — then commit to the full bottle.</p>
      </div>
      <Link
        to="/discover"
        className="inline-flex h-[50px] items-center justify-center rounded-[3px] border border-cream/70 px-8 text-[12px] font-medium tracking-[0.12em] uppercase transition hover:bg-cream hover:text-olive"
      >
        Find your scent
      </Link>
    </div>
  )
}
