import { Handbag, Heart, Menu, Search, UserRound, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { wp } from '../api/wp'
import { useCart } from '../store/cart'
import { useWishlist } from '../store/wishlist'
import { Logo } from './Logo'
import { SearchBox } from './SearchBox'

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
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
  }, [menuOpen])

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
    <header className="sticky top-0 z-40 border-b border-line/70 bg-cream">
      <div className="container-x flex h-16 items-center gap-4 lg:h-[66px]">
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
          <SearchBox className="mr-4 hidden w-[220px] 2xl:block" />
          <button type="button" aria-label="Search" className={`${iconBtn} 2xl:hidden`} onClick={() => setSearchOpen((s) => !s)}>
            <Search className="size-[21px]" strokeWidth={1.5} />
          </button>
          <Link to="/wishlist" aria-label={`Wishlist (${wishlist.ids.length})`} className={iconBtn}>
            <Heart className="size-[22px]" strokeWidth={1.5} />
            {wishlist.ids.length > 0 && <CountBadge count={wishlist.ids.length} />}
          </Link>
          {/* With WordPress, the account lives in WooCommerce's My Account page. */}
          {wp ? (
            <a href={wp.myAccountUrl} aria-label="Account" className={`${iconBtn} hidden xs:grid`}>
              <UserRound className="size-[22px]" strokeWidth={1.5} />
            </a>
          ) : (
            <Link to="/account" aria-label="Account" className={`${iconBtn} hidden xs:grid`}>
              <UserRound className="size-[22px]" strokeWidth={1.5} />
            </Link>
          )}
          <button type="button" aria-label={`Cart (${count} items)`} onClick={open} className={iconBtn}>
            <Handbag className="size-[22px]" strokeWidth={1.5} />
            <CountBadge count={count} />
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="container-x animate-fade-in border-t border-line/70 py-3 2xl:hidden">
          <SearchBox autoFocus onDone={() => setSearchOpen(false)} />
        </div>
      )}

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 animate-fade-in bg-ink/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[min(22rem,88vw)] flex-col bg-cream shadow-2xl [animation:slide-in-left_.3s_cubic-bezier(.22,1,.36,1)]">
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
              <NavLink to="/wishlist" className="py-4 text-[13px] font-medium tracking-[0.1em] uppercase">
                Wishlist ({wishlist.ids.length})
              </NavLink>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

function CountBadge({ count }: { count: number }) {
  return (
    <span className="absolute -top-0.5 -right-0.5 grid h-[21px] min-w-[21px] place-items-center rounded-full bg-ink px-1 text-[10px] leading-none font-semibold text-cream">
      {count > 99 ? '99+' : count}
    </span>
  )
}
