import { ArrowRight, Menu, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { BagIcon, HeartIcon, MoonIcon, SearchIcon, SunIcon, UserIcon } from './LineIcons'
import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTheme } from '../lib/theme'
import { useCart } from '../store/cart'
import { useWishlist } from '../store/wishlist'
import { Logo } from './Logo'
import { useSwipeClose } from '../lib/useSwipeClose'

const SearchOverlay = lazy(() => import('./SearchOverlay').then((m) => ({ default: m.SearchOverlay })))

export const navLinks = [
  { to: '/shop', label: 'Shop' },
  { to: '/shop?sort=best-sellers', label: 'Best Sellers' },
  { to: '/finder', label: 'Rfaheya Finder' },
  { to: '/collections', label: 'Collections' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export function Header() {
  const { count, open } = useCart()
  const wishlist = useWishlist()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useSwipeClose<HTMLDivElement>(() => setMenuOpen(false), { direction: 'left' })
  const [searchOpen, setSearchOpen] = useState(false)
  const [theme, toggleTheme] = useTheme()
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
  }, [location.pathname, location.search])

  // The tab bar's search button (phones).
  useEffect(() => {
    const open = () => setSearchOpen(true)
    window.addEventListener('rf:search', open)
    return () => window.removeEventListener('rf:search', open)
  }, [])

  // "/" or Ctrl/⌘ + K opens search from anywhere (except while typing in a field).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
  }, [menuOpen])

  // At the top the header spans the page (transparent over the home hero); once the page
  // scrolls it becomes a floating rounded bar in the middle.
  const isHome = location.pathname === '/'
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const update = () => setScrolled((was) => (was ? window.scrollY > 12 : window.scrollY > 40))
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
  const clear = isHome && !scrolled && !searchOpen
  const floating = scrolled

  /** "Shop" and "Best Sellers" share /shop, so the query string decides which is active. */
  const isActive = (to: string) => {
    const [path, query] = to.split('?')
    if (!location.pathname.startsWith(path)) return false
    const sort = new URLSearchParams(location.search).get('sort')
    if (query) return location.search.includes(query)
    return path !== '/shop' || sort !== 'best-sellers'
  }

  const iconBtn = 'relative grid size-10 place-items-center rounded-full text-ink transition hover:bg-chip'
  const menuTile = 'rf-white flex flex-col items-center justify-center gap-1.5 rounded-[18px] py-3 text-[11.5px] font-semibold text-ink-soft shadow-[inset_0_0_0_1px_var(--color-line)] transition hover:text-ink'

  return (
    <header
      data-floating={floating || undefined}
      className={`rf-header sticky top-0 z-40 border-b transition-[background-color,border-color,backdrop-filter] duration-500 ${
        floating ? 'pointer-events-none border-transparent bg-transparent' : clear ? 'border-transparent bg-transparent' : 'border-line/70 bg-cream/95 backdrop-blur'
      }`}
    >
      <div className="rf-header-bar container-x pointer-events-auto flex h-16 items-center gap-4 lg:h-[66px]">
        <button type="button" aria-label="Open menu" className={`${iconBtn} -ml-2 lg:hidden`} onClick={() => setMenuOpen(true)}>
          <Menu className="size-[22px]" strokeWidth={1.5} />
        </button>

        <Logo className="h-11 lg:h-[41px]" ownClassName="h-[50px] max-w-[48vw] lg:h-[58px] lg:max-w-[260px]" />

        <nav aria-label="Main" className="ml-6 hidden items-center gap-6 lg:flex xl:ml-10 xl:gap-8 2xl:ml-[4.5%] 2xl:gap-10">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              aria-current={isActive(l.to) ? 'page' : undefined}
              className={`relative py-2 text-[11.5px] font-medium tracking-[0.07em] whitespace-nowrap uppercase transition after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:bg-ink after:transition-transform hover:after:scale-x-100 ${
                isActive(l.to) ? 'after:scale-x-100' : 'after:scale-x-0'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="mr-3 hidden h-[34px] w-[220px] items-center gap-2.5 rounded-full border border-line-strong/70 bg-cream/70 px-3.5 text-[13px] text-muted transition hover:border-olive 2xl:flex"
          >
            <SearchIcon className="size-4 shrink-0" />
            Search fragrances…
            <kbd className="ml-auto rounded border border-line-strong px-1.5 font-sans text-[10px] text-muted">/</kbd>
          </button>
          <button type="button" aria-label="Search" className={`${iconBtn} 2xl:hidden`} onClick={() => setSearchOpen(true)}>
            <SearchIcon className="size-[21px]" />
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-pressed={theme === 'dark'}
            className={iconBtn}
          >
            {theme === 'dark' ? <SunIcon className="size-[21px]" /> : <MoonIcon className="size-[20px]" />}
          </button>
          <Link to="/wishlist" aria-label={`Wishlist (${wishlist.ids.length})`} className={`${iconBtn} hidden sm:grid`}>
            <HeartIcon className="size-[22px]" />
            {wishlist.ids.length > 0 && <CountBadge count={wishlist.ids.length} />}
          </Link>
          <Link to="/account" aria-label="Account" className={`${iconBtn} hidden xs:grid`}>
            <UserIcon className="size-[22px]" />
          </Link>
          <button type="button" aria-label={`Cart, ${count} items`} onClick={open} className={iconBtn} data-cart-target>
            <BagIcon className="size-[22px]" />
            <CountBadge count={count} />
          </button>
        </div>
      </div>

      {/* Outside the header: its blur would otherwise trap these full-screen layers inside the bar. */}
      {searchOpen &&
        createPortal(
          <Suspense fallback={null}>
            <SearchOverlay onClose={() => setSearchOpen(false)} />
          </Suspense>,
          document.body,
        )}

      {menuOpen &&
        createPortal(
          <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
            <div className="absolute inset-0 animate-fade-in bg-ink/45 backdrop-blur-[3px]" onClick={() => setMenuOpen(false)} />
            <div
              ref={menuRef}
              className="absolute inset-y-2 left-2 flex w-[min(23rem,calc(100vw-48px))] flex-col overflow-hidden rounded-[28px] bg-cream shadow-[0_40px_120px_-30px_rgba(16,14,11,0.6)] [animation:slide-in-left_.5s_cubic-bezier(.16,1,.3,1)]"
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <Logo className="h-12" ownClassName="h-14 max-w-[60%]" />
                <button type="button" aria-label="Close menu" className="grid size-11 place-items-center rounded-full bg-chip transition hover:bg-line" onClick={() => setMenuOpen(false)}>
                  <X className="size-5" strokeWidth={1.5} />
                </button>
              </div>

              <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-3 pb-3">
                <ul className="space-y-1">
                  {navLinks.map((l, i) => {
                    const on = isActive(l.to)
                    return (
                      <li key={l.to} className="animate-fade-in" style={{ animationDelay: `${60 + i * 40}ms`, animationFillMode: 'backwards' }}>
                        <Link
                          to={l.to}
                          aria-current={on ? 'page' : undefined}
                          className={`group flex items-center justify-between rounded-[18px] px-4 py-3.5 transition ${on ? 'bg-olive text-on-accent' : 'hover:bg-chip'}`}
                        >
                          <span className="font-serif text-[26px] leading-none">{l.label}</span>
                          <span className={`grid size-8 place-items-center rounded-full transition ${on ? 'bg-white/20' : 'bg-chip group-hover:bg-olive group-hover:text-on-accent'}`}>
                            <ArrowRight className="size-4" strokeWidth={1.6} />
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>

                <Link to="/finder" className="relative mt-4 block overflow-hidden rounded-[22px] bg-[#14110d] p-5 text-white">
                  <p className="text-[10.5px] font-semibold tracking-[0.24em] text-[#f0c27a] uppercase">Not sure where to start?</p>
                  <p className="mt-2 font-serif text-[26px] leading-[1.05]">
                    Find your scent <span className="text-[#f0c27a] italic">in 2 minutes.</span>
                  </p>
                  <span className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-olive px-4 text-[11px] font-semibold tracking-[0.12em] text-on-accent uppercase">
                    Start the finder
                    <ArrowRight className="size-4" strokeWidth={1.6} />
                  </span>
                </Link>
              </nav>

              <div className="grid grid-cols-3 gap-2 border-t border-line p-3">
                <NavLink to="/account" className={menuTile}>
                  <UserIcon className="size-5" />
                  Account
                </NavLink>
                <NavLink to="/wishlist" className={menuTile}>
                  <HeartIcon className="size-5" />
                  Wishlist{wishlist.ids.length > 0 ? ` (${wishlist.ids.length})` : ''}
                </NavLink>
                <button type="button" onClick={toggleTheme} aria-pressed={theme === 'dark'} className={menuTile}>
                  {theme === 'dark' ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
                  {theme === 'dark' ? 'Light' : 'Dark'}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </header>
  )
}

function CountBadge({ count }: { count: number }) {
  return (
    <span aria-hidden data-cart-count className="absolute -top-0.5 -right-0.5 grid h-[21px] min-w-[21px] place-items-center rounded-full bg-olive px-1 text-[10px] leading-none font-semibold text-on-accent">
      {count > 99 ? '99+' : count}
    </span>
  )
}
