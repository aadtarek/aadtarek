import { ArrowRight, BookOpen, CalendarDays, ChevronRight, CircleHelp, FileText, Gift, Search, Sparkles, User, X, type LucideIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import { getAllProducts, getFamilies, priceRange, useCatalogVersion } from '../api/catalog'
import { fetchPosts, useWp } from '../api/content'
import { isWoo, stripHtml } from '../api/wp'
import { collections } from '../data/collections'
import { formatPriceRange } from '../lib/format'
import { FAMILY_ICONS, OCCASIONS, SEASONS } from '../lib/profile'
import { search, type HitKind, type SearchDoc, type SearchHit } from '../lib/search'
import { usePersistentState } from '../lib/storage'
import { useFaqs } from '../lib/useFaqs'
import { Overlay } from './Overlay'

const KIND_ICON: Partial<Record<HitKind, LucideIcon>> = {
  occasion: Sparkles,
  season: CalendarDays,
  gender: User,
  page: FileText,
  faq: CircleHelp,
  post: BookOpen,
  collection: Gift,
}

/** "Search Rfaheya": popular searches and categories, then live results as you type. */
export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const version = useCatalogVersion()
  const [term, setTermState] = useState('')
  const [active, setActive] = useState(-1)
  const setTerm = (value: string) => {
    setTermState(value)
    setActive(-1)
  }
  const [recent, setRecent] = usePersistentState<string[]>('rfaheya.recentSearches', [])
  const input = useRef<HTMLInputElement>(null)

  const posts = useWp(isWoo ? 'posts' : null, fetchPosts).data
  const faqs = useFaqs()
  const extra = useMemo(
    () => ({
      posts: posts?.map((p) => ({ slug: p.slug, title: p.title, excerpt: p.excerpt, category: p.category, image: p.image, text: stripHtml(p.html) })),
      faqs: isWoo ? faqs : undefined,
    }),
    [posts, faqs],
  )
  const key = `${version}:${posts?.length ?? 0}:${faqs.length}`

  const result = useMemo(() => (term.trim() ? search(term, extra, key) : { hits: [] }), [term, extra, key])
  const products = result.hits.filter((h) => h.doc.kind === 'product').slice(0, 4)
  const shown = new Set(products.map((h) => h.doc.product?.id))
  const others = result.hits
    .filter((h) => h.doc.kind !== 'product' && !(h.doc.kind === 'dna' && shown.has(h.doc.product?.id)))
    .slice(0, 7)
  const flat = [...products, ...others]

  useEffect(() => {
    // Focus after the opening animation starts, so mobile keyboards open too.
    const id = requestAnimationFrame(() => input.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [])

  const remember = (q: string) => {
    const clean = q.trim()
    if (clean) setRecent((r) => [clean, ...r.filter((x) => x.toLowerCase() !== clean.toLowerCase())].slice(0, 6))
  }
  const go = (to: string) => {
    remember(term)
    onClose()
    navigate(to)
  }
  const viewAll = () => {
    const q = (result.corrected ?? term).trim()
    go(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop')
  }

  // Rendered on <body>: the sticky header's blur would otherwise box the fixed overlay in.
  return createPortal(
    <Overlay onClose={onClose} label="Search">
      <div className="absolute inset-0 flex flex-col overflow-y-auto bg-cream [animation:rf-search-in_.5s_cubic-bezier(.16,1,.3,1)] sm:inset-x-4 sm:top-[4vh] sm:bottom-auto sm:mx-auto sm:max-h-[92vh] sm:max-w-[1104px] sm:rounded-[22px] sm:shadow-2xl">
        <div className="sticky top-0 z-10 bg-cream px-4 pt-5 pb-4 sm:px-11 sm:pt-9">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-serif text-[34px] leading-none sm:text-[52px]">Search Rfaheya</h2>
              <p className="mt-1.5 text-[14px] text-ink-soft sm:text-[17px]">Find your next signature scent.</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Close search" className="-mt-1 -mr-1 flex flex-col items-center gap-0.5 rounded-full p-2 text-ink hover:bg-chip">
              <X className="size-6" strokeWidth={1.4} />
              <span className="hidden text-[9px] tracking-[0.08em] text-muted uppercase sm:block">Esc</span>
            </button>
          </div>
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault()
              if (active >= 0 && flat[active]) go(flat[active].doc.to)
              else viewAll()
            }}
            className="mt-5 flex h-[54px] items-center gap-3 rounded-full border border-line-strong bg-card px-5 transition focus-within:border-olive focus-within:shadow-[0_0_0_4px_rgba(138,106,51,0.12)] sm:mt-7 sm:h-[62px] sm:px-6"
          >
            <Search className="size-5 shrink-0 text-ink sm:size-6" strokeWidth={1.4} />
            <input
              ref={input}
              type="search"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  setActive((a) => Math.min(flat.length - 1, a + 1))
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  setActive((a) => Math.max(-1, a - 1))
                }
              }}
              placeholder="Search fragrances, DNA, notes, occasions, or anything…"
              aria-label="Search the store"
              autoComplete="off"
              enterKeyHint="search"
              className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted focus:!shadow-none sm:text-[17px] [&::-webkit-search-cancel-button]:hidden"
            />
            {term && (
              <button type="button" aria-label="Clear search" onClick={() => { setTerm(''); input.current?.focus() }} className="rounded-full p-1 text-muted hover:text-ink">
                <X className="size-4" />
              </button>
            )}
          </form>
        </div>

        <div className="px-4 pb-8 sm:px-11 sm:pb-10">
          {!term.trim() ? (
            <Discover recent={recent} onPick={setTerm} onClearRecent={() => setRecent([])} onGo={go} />
          ) : flat.length === 0 ? (
            <NoResults term={term} onPick={setTerm} />
          ) : (
            <div key="results" className="animate-fade-in">
              {result.corrected && result.corrected !== term.trim().toLowerCase() && (
                <p className="mb-4 text-[14px] text-ink-soft">
                  Showing results for{' '}
                  <button type="button" onClick={() => setTerm(result.corrected!)} className="font-semibold text-ink underline decoration-olive/50 underline-offset-4">
                    {result.corrected}
                  </button>
                </p>
              )}
              <div className="grid gap-8 lg:grid-cols-[1fr_1px_1fr] lg:gap-8">
                <section aria-label="Fragrances">
                  <h3 className="font-serif text-[22px]">{products.length ? 'Fragrances' : 'Popular categories'}</h3>
                  {products.length ? (
                    <ul className="mt-4 grid grid-cols-2 gap-3">
                      {products.map((h, i) => (
                        <ProductHit key={h.doc.id} hit={h} active={active === i} onHover={() => setActive(i)} onGo={go} />
                      ))}
                    </ul>
                  ) : (
                    <Categories onGo={go} />
                  )}
                </section>
                <span aria-hidden className="hidden bg-line lg:block" />
                <section aria-label="Suggestions">
                  <h3 className="font-serif text-[22px]">Search suggestions</h3>
                  {others.length === 0 ? (
                    <p className="mt-4 text-[14px] text-muted">More matches are in the fragrances.</p>
                  ) : (
                    <ul className="mt-3 divide-y divide-line border-t border-line">
                      {others.map((h, i) => (
                        <SuggestionRow key={h.doc.id} doc={h.doc} active={active === products.length + i} onHover={() => setActive(products.length + i)} onGo={go} />
                      ))}
                    </ul>
                  )}
                  <button
                    type="button"
                    onClick={viewAll}
                    className="mt-4 flex w-full items-center justify-between rounded-xl bg-chip px-5 py-3.5 text-left font-serif text-[17px] transition hover:bg-line"
                  >
                    View all results for “{result.corrected ?? term.trim()}”
                    <ChevronRight className="size-5" strokeWidth={1.4} />
                  </button>
                </section>
              </div>
            </div>
          )}
        </div>
      </div>
    </Overlay>,
    document.body,
  )
}

function ProductHit({ hit, active, onHover, onGo }: { hit: SearchHit; active: boolean; onHover: () => void; onGo: (to: string) => void }) {
  const p = hit.doc.product!
  const range = priceRange(p)
  return (
    <li>
      <Link
        to={hit.doc.to}
        onClick={(e) => {
          e.preventDefault()
          onGo(hit.doc.to)
        }}
        onMouseEnter={onHover}
        className={`group block rounded-2xl p-1.5 transition ${active ? 'bg-chip' : 'hover:bg-chip/70'}`}
      >
        <span className="block aspect-[5/4] overflow-hidden rounded-xl bg-chip">
          <img src={p.images[0]?.src} alt="" className="size-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        </span>
        <span className="mt-2 block px-1 font-serif text-[18px] leading-tight">{p.name}</span>
        <span className="block truncate px-1 text-[12px] text-muted">{p.inspiredBy ? `Inspired by ${p.inspiredBy}` : p.tagline}</span>
        <span className="mt-0.5 block px-1 pb-1 text-[13px] font-semibold">{formatPriceRange(range.min, range.max)}</span>
      </Link>
    </li>
  )
}

function SuggestionRow({ doc, active, onHover, onGo }: { doc: SearchDoc; active?: boolean; onHover?: () => void; onGo: (to: string) => void }) {
  const Icon = doc.kind === 'family' ? FAMILY_ICONS[doc.id.split(':')[1] as keyof typeof FAMILY_ICONS] : KIND_ICON[doc.kind]
  const label = doc.kind === 'dna' ? 'DNA' : undefined
  return (
    <li>
      <Link
        to={doc.to}
        onClick={(e) => {
          e.preventDefault()
          onGo(doc.to)
        }}
        onMouseEnter={onHover}
        className={`flex items-center gap-3.5 px-1.5 py-2.5 transition ${active ? 'bg-chip' : 'hover:bg-chip/60'}`}
      >
        <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-chip ring-1 ring-line">
          {doc.image && doc.kind !== 'family' ? (
            <img src={doc.image} alt="" className={`size-full ${doc.kind === 'note' ? 'object-contain p-1.5' : 'object-cover'}`} />
          ) : Icon ? (
            <Icon className="size-5 text-ink-soft" strokeWidth={1.4} />
          ) : (
            <Search className="size-5 text-ink-soft" strokeWidth={1.4} />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-serif text-[17px] leading-tight">{doc.title}</span>
          <span className="block truncate text-[12.5px] text-muted">
            {label && <span className="mr-1 font-semibold text-gold">{label}</span>}
            {doc.subtitle}
          </span>
        </span>
        <ChevronRight className="size-4 shrink-0 text-muted" strokeWidth={1.5} />
      </Link>
    </li>
  )
}

/** Real popular searches: the most used notes, families and DNAs in the catalog. */
function usePopular() {
  const version = useCatalogVersion()
  return useMemo(() => {
    const products = getAllProducts()
    const notes = new Map<string, { image: string; count: number }>()
    for (const p of products) for (const n of p.notes) notes.set(n.name, { image: n.image, count: (notes.get(n.name)?.count ?? 0) + 1 })
    const topNotes = [...notes.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 3)
    const families = getFamilies()
    const familyCount = (slug: string) => products.filter((p) => p.families.includes(slug as never)).length
    const topFamilies = [...families].sort((a, b) => familyCount(b.slug) - familyCount(a.slug)).slice(0, 2)
    const best = [...products].sort((a, b) => b.totalSales - a.totalSales)[0]
    const chips: { label: string; image?: string; Icon?: LucideIcon }[] = [
      ...topNotes.map(([name, n]) => ({ label: name, image: n.image })),
      ...topFamilies.map((f) => ({ label: f.name, image: f.image })),
      { label: OCCASIONS.date.label, Icon: OCCASIONS.date.Icon },
      ...(best?.inspiredBy ? [{ label: best.inspiredBy, image: best.images[0]?.src }] : []),
      { label: SEASONS.summer.label, Icon: SEASONS.summer.Icon },
      { label: 'Men', Icon: User },
    ]
    return { chips, best: [...products].sort((a, b) => b.totalSales - a.totalSales).slice(0, 4) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version])
}

function Discover({ recent, onPick, onClearRecent, onGo }: { recent: string[]; onPick: (q: string) => void; onClearRecent: () => void; onGo: (to: string) => void }) {
  const { chips, best } = usePopular()
  return (
    <div className="animate-fade-in">
      {recent.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-[20px]">Recent searches</h3>
            <button type="button" onClick={onClearRecent} className="text-[12px] text-muted underline-offset-4 hover:text-ink hover:underline">
              Clear
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {recent.map((r) => (
              <button key={r} type="button" onClick={() => onPick(r)} className="rounded-full border border-line-strong px-4 py-1.5 text-[13.5px] transition hover:border-ink">
                {r}
              </button>
            ))}
          </div>
        </div>
      )}
      <h3 className="font-serif text-[20px] sm:text-[22px]">Most searched</h3>
      <div className="no-scrollbar -mx-4 mt-3 flex gap-2.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {chips.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={() => onPick(c.label)}
            className="flex shrink-0 items-center gap-2.5 rounded-full bg-chip py-1.5 pr-5 pl-1.5 text-[14px] transition hover:bg-line"
          >
            <span className="grid size-9 place-items-center overflow-hidden rounded-full bg-card">
              {c.image ? <img src={c.image} alt="" className="size-full object-cover" /> : c.Icon && <c.Icon className="size-4 text-ink-soft" strokeWidth={1.5} />}
            </span>
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-8 border-t border-line pt-7 lg:grid-cols-[1fr_1px_1fr]">
        <section aria-label="Popular categories">
          <h3 className="font-serif text-[22px]">Popular categories</h3>
          <Categories onGo={onGo} />
        </section>
        <span aria-hidden className="hidden bg-line lg:block" />
        <section aria-label="Best sellers">
          <h3 className="font-serif text-[22px]">Best sellers</h3>
          <ul className="mt-3 divide-y divide-line border-t border-line">
            {best.map((p) => (
              <SuggestionRow
                key={p.id}
                onGo={onGo}
                doc={{ id: `product:${p.id}`, kind: 'product', title: p.name, subtitle: p.inspiredBy ? `Inspired by ${p.inspiredBy}` : p.tagline, to: `/product/${p.slug}`, image: p.images[0]?.src, fields: [] }}
              />
            ))}
          </ul>
          <Link
            to="/shop"
            onClick={(e) => {
              e.preventDefault()
              onGo('/shop')
            }}
            className="mt-4 flex items-center justify-between rounded-xl bg-chip px-5 py-3.5 font-serif text-[17px] transition hover:bg-line"
          >
            Shop all fragrances
            <ArrowRight className="size-5" strokeWidth={1.4} />
          </Link>
        </section>
      </div>
    </div>
  )
}

function Categories({ onGo }: { onGo: (to: string) => void }) {
  const tiles = [
    ...getFamilies().map((f) => ({ key: f.slug, name: f.name, tagline: f.tagline, image: f.image, to: `/shop?family=${f.slug}` })),
    ...collections.filter((c) => c.slug === 'discovery-sets').map((c) => ({ key: c.slug, name: c.name, tagline: '5 ML samples', image: c.image, to: `/collections/${c.slug}` })),
  ].slice(0, 6)
  return (
    <ul className="mt-4 grid grid-cols-2 gap-3">
      {tiles.map((t) => (
        <li key={t.key}>
          <Link
            to={t.to}
            onClick={(e) => {
              e.preventDefault()
              onGo(t.to)
            }}
            className="group relative flex h-[92px] items-center overflow-hidden rounded-xl bg-chip sm:h-[106px]"
          >
            <img src={t.image} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]" />
            <span aria-hidden className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/5" />
            <span className="relative flex w-full items-center justify-between gap-2 px-4 text-white sm:px-5">
              <span className="min-w-0">
                <span className="block font-serif text-[20px] leading-tight sm:text-[23px]">{t.name}</span>
                <span className="mt-0.5 block truncate text-[9.5px] tracking-[0.16em] text-white/85 uppercase sm:text-[10.5px]">{t.tagline.replace(/\.$/, '')}</span>
              </span>
              <ChevronRight className="size-5 shrink-0 transition group-hover:translate-x-0.5" strokeWidth={1.4} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

function NoResults({ term, onPick }: { term: string; onPick: (q: string) => void }) {
  const { chips } = usePopular()
  return (
    <div className="animate-fade-in py-6 text-center">
      <p className="font-serif text-[26px]">Nothing found for “{term.trim()}”.</p>
      <p className="mt-1 text-[14px] text-ink-soft">Try a note, a mood or the name of a fragrance you love.</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {chips.slice(0, 6).map((c) => (
          <button key={c.label} type="button" onClick={() => onPick(c.label)} className="rounded-full bg-chip px-4 py-1.5 text-[13.5px] hover:bg-line">
            {c.label}
          </button>
        ))}
      </div>
    </div>
  )
}
