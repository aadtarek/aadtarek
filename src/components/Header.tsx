import { Menu, X } from 'lucide-react'
import { BagIcon, HeartIcon, MoonIcon, SearchIcon, SunIcon, UserIcon } from './LineIcons'
import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { wp } from '../api/wp'
import { useTheme } from '../lib/theme'
import { useCart } from '../store/cart'
import { useWishlist } from '../store/wishlist'
import { Logo } from './Logo'

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
  const floating = scrolled && !menuOpen

  /** "Shop" and "Best Sellers" share /shop, so the query string decides which is active. */
  const isActive = (to: string) => {
    const [path, query] = to.split('?')
    if (!location.pathname.startsWith(path)) return false
    const sort = new URLSearchParams(location.search).get('sort')
    if (query) return location.search.includes(query)
    return path !== '/shop' || sort !== 'best-sellers'
  }

  const iconBtn = 'relative grid size-10 place-items-center rounded-full text-ink transition hover:bg-chip'

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

        <Logo className="h-9 lg:h-[41px]" />

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
            className={`${iconBtn} hidden sm:grid`}
          >
            {theme === 'dark' ? <SunIcon className="size-[21px]" /> : <MoonIcon className="size-[20px]" />}
          </button>
          <Link to="/wishlist" aria-label={`Wishlist (${wishlist.ids.length})`} className={iconBtn}>
            <HeartIcon className="size-[22px]" />
            {wishlist.ids.length > 0 && <CountBadge count={wishlist.ids.length} />}
          </Link>
          {/* With WordPress, the account lives in WooCommerce's My Account page. */}
          {wp ? (
            <a href={wp.myAccountUrl} aria-label="Account" className={`${iconBtn} hidden xs:grid`}>
              <UserIcon className="size-[22px]" />
            </a>
          ) : (
            <Link to="/account" aria-label="Account" className={`${iconBtn} hidden xs:grid`}>
              <UserIcon className="size-[22px]" />
            </Link>
          )}
          <button type="button" aria-label={`Cart, ${count} items`} onClick={open} className={iconBtn} data-cart-target>
            <BagIcon className="size-[22px]" />
            <CountBadge count={count} />
          </button>
        </div>
      </div>

      {searchOpen && (
        <Suspense fallback={null}>
          <SearchOverlay onClose={() => setSearchOpen(false)} />
        </Suspense>
      )}

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 animate-fade-in bg-ink/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[min(22rem,88vw)] flex-col bg-cream shadow-2xl [animation:slide-in-left_.5s_cubic-bezier(.16,1,.3,1)]">
            <div className="flex h-16 items-center justify-between border-b border-line px-4">
              <Logo className="h-9" />
              <button type="button" aria-label="Close menu" className={iconBtn} onClick={() => setMenuOpen(false)}>
                <X className="size-5" strokeWidth={1.5} />
              </button>
            </div>
            <nav aria-label="Mobile" className="flex flex-col px-4 py-4">
              {navLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    `border-b border-line py-4 text-[13px] font-medium tracking-[0.1em] uppercase ${isActive ? 'text-olive' : ''}`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              {wp ? (
                <a href={wp.myAccountUrl} className="border-b border-line py-4 text-[13px] font-medium tracking-[0.1em] uppercase">
                  My Account
                </a>
              ) : (
                <NavLink to="/account" className="border-b border-line py-4 text-[13px] font-medium tracking-[0.1em] uppercase">
                  My Account
                </NavLink>
              )}
              <NavLink to="/wishlist" className="border-b border-line py-4 text-[13px] font-medium tracking-[0.1em] uppercase">
                Wishlist ({wishlist.ids.length})
              </NavLink>
              <button
                type="button"
                onClick={toggleTheme}
                aria-pressed={theme === 'dark'}
                className="flex items-center justify-between py-4 text-left text-[13px] font-medium tracking-[0.1em] uppercase"
              >
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                {theme === 'dark' ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
              </button>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

function CountBadge({ count }: { count: number }) {
  return (
    <span aria-hidden data-cart-count className="absolute -top-0.5 -right-0.5 grid h-[21px] min-w-[21px] place-items-center rounded-full bg-ink px-1 text-[10px] leading-none font-semibold text-cream">
      {count > 99 ? '99+' : count}
    </span>
  )
}
