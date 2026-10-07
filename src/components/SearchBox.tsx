import { Search, X } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAllProducts, matchesSearch, priceRange, sortProducts, useCatalogReady } from '../api/catalog'
import { formatPriceRange } from '../lib/format'

export function SearchBox({ className = '', autoFocus = false, onDone }: { className?: string; autoFocus?: boolean; onDone?: () => void }) {
  const [term, setTerm] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const navigate = useNavigate()
  const wrapper = useRef<HTMLDivElement>(null)
  const listId = useId()
  const ready = useCatalogReady()

  const results = useMemo(
    () => (term.trim() ? sortProducts(getAllProducts().filter((p) => matchesSearch(p, term))).slice(0, 5) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the products may arrive after the search box shows
    [term, ready],
  )

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapper.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const finish = () => {
    setOpen(false)
    setTerm('')
    setActive(-1)
    onDone?.()
  }

  const submit = () => {
    if (active >= 0 && results[active]) navigate(`/product/${results[active].slug}`)
    else navigate(term.trim() ? `/shop?q=${encodeURIComponent(term.trim())}` : '/shop')
    finish()
  }

  const showPanel = open && term.trim().length > 0

  return (
    <div ref={wrapper} className={`relative ${className}`}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        className="flex h-[33px] items-center gap-2.5 rounded-md border border-line-strong/70 bg-cream px-3 transition focus-within:border-olive"
      >
        <Search className="size-4 shrink-0 text-muted" strokeWidth={1.5} />
        <input
          type="search"
          value={term}
          autoFocus={autoFocus}
          onChange={(e) => {
            setTerm(e.target.value)
            setOpen(true)
            setActive(-1)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActive((a) => Math.min(results.length - 1, a + 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((a) => Math.max(-1, a - 1))
            } else if (e.key === 'Escape') {
              setOpen(false)
            }
          }}
          placeholder="Search fragrances..."
          aria-label="Search fragrances"
          aria-controls={listId}
          aria-expanded={showPanel}
          role="combobox"
          className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
        />
        {term && (
          <button type="button" aria-label="Clear search" onClick={() => setTerm('')} className="text-muted hover:text-ink">
            <X className="size-3.5" />
          </button>
        )}
      </form>

      {showPanel && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 min-w-72 animate-fade-in overflow-hidden rounded-lg border border-line bg-card shadow-xl shadow-ink/10 lg:-left-6 lg:w-[22rem]">
          {results.length === 0 ? (
            <p className="px-4 py-5 text-sm text-muted">No fragrances match “{term}”.</p>
          ) : (
            <ul id={listId} role="listbox" className="py-1.5">
              {results.map((p, i) => {
                const range = priceRange(p)
                return (
                  <li key={p.id} role="option" aria-selected={i === active}>
                    <Link
                      to={`/product/${p.slug}`}
                      onClick={finish}
                      onMouseEnter={() => setActive(i)}
                      className={`flex items-center gap-3 px-3 py-2 ${i === active ? 'bg-chip' : ''}`}
                    >
                      <img src={p.images[0].src} alt="" className="size-12 rounded object-cover" />
                      <span className="min-w-0 flex-1">
                        <span className="block font-serif text-[15px] uppercase">{p.name}</span>
                        <span className="block truncate text-xs text-muted">Inspired by {p.inspiredBy}</span>
                      </span>
                      <span className="text-xs font-semibold whitespace-nowrap">{formatPriceRange(range.min, range.max)}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
          <button
            type="button"
            onClick={submit}
            className="w-full border-t border-line px-4 py-3 text-left text-[11px] font-semibold tracking-[0.14em] uppercase hover:bg-chip"
          >
            View all results
          </button>
        </div>
      )}
    </div>
  )
}
