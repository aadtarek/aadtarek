import { useEffect, useLayoutEffect, useRef, useState, type ComponentType } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { wp } from '../api/wp'
import { haptic } from '../lib/fx'
import { BagIcon, HeartIcon, HomeIcon, SearchIcon, ShopIcon, UserIcon, type LineIconProps } from './LineIcons'
import { useCart } from '../store/cart'
import { useWishlist } from '../store/wishlist'

type Tab = { key: string; label: string; Icon: ComponentType<LineIconProps>; to?: string; href?: string; onTap?: () => void; badge?: number; cart?: boolean }

/**
 * Phones: a floating "liquid glass" tab bar (iOS style) with a round search button.
 * The highlight slides to the current tab; the bar tucks away while scrolling down
 * and comes back on the way up.
 */
export function TabBar() {
  const { pathname } = useLocation()
  const cart = useCart()
  const wishlist = useWishlist()
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    // Hides after a deliberate scroll down and comes back on a short scroll up, so it doesn't flicker.
    let last = window.scrollY
    let travel = 0
    const onScroll = () => {
      const y = window.scrollY
      const step = y - last
      last = y
      travel = Math.sign(step) === Math.sign(travel) ? travel + step : step
      if (y < 140) setHidden(false)
      else if (travel > 48) setHidden(true)
      else if (travel < -24) setHidden(false)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  // A new page starts with the bar shown.
  useEffect(() => setHidden(false), [pathname])

  const tabs: Tab[] = [
    { key: 'home', label: 'Home', Icon: HomeIcon, to: '/' },
    { key: 'shop', label: 'Shop', Icon: ShopIcon, to: '/shop' },
    { key: 'wishlist', label: 'Wishlist', Icon: HeartIcon, to: '/wishlist', badge: wishlist.ids.length },
    { key: 'cart', label: 'Cart', Icon: BagIcon, onTap: cart.open, badge: cart.count, cart: true },
    wp ? { key: 'account', label: 'Account', Icon: UserIcon, href: wp.myAccountUrl } : { key: 'account', label: 'Account', Icon: UserIcon, to: '/account' },
  ]
  const current =
    pathname === '/' ? 'home' : pathname.startsWith('/shop') || pathname.startsWith('/product') || pathname.startsWith('/collections') ? 'shop' : pathname.startsWith('/wishlist') ? 'wishlist' : pathname.startsWith('/account') ? 'account' : ''

  // The glass highlight slides under the current tab.
  const bar = useRef<HTMLDivElement>(null)
  const [lens, setLens] = useState<{ x: number; w: number; glide: boolean } | null>(null)
  useLayoutEffect(() => {
    const measure = () => {
      const on = bar.current?.querySelector<HTMLElement>('[data-current="true"]')
      setLens((prev) => (on ? { x: on.offsetLeft, w: on.offsetWidth, glide: prev !== null } : null))
    }
    measure()
    const observer = new ResizeObserver(measure)
    if (bar.current) observer.observe(bar.current)
    return () => observer.disconnect()
  }, [current])

  const tap = (e: React.PointerEvent<HTMLElement>) => {
    haptic(8)
    const icon = e.currentTarget.querySelector('svg')
    icon?.classList.remove('rf-tab-pop')
    void (icon as SVGElement | null)?.getBoundingClientRect()
    icon?.classList.add('rf-tab-pop')
  }

  // The quiz is a full-screen flow of its own.
  if (pathname.startsWith('/finder/quiz')) return null

  return (
    <nav
      aria-label="Quick navigation"
      data-hidden={hidden || undefined}
      className="rf-tabbar fixed inset-x-0 bottom-0 z-40 flex items-end justify-center gap-2 px-3 pb-[calc(10px+env(safe-area-inset-bottom))] lg:hidden"
    >
      <div ref={bar} className="rf-glass relative flex h-[62px] min-w-0 flex-1 items-stretch rounded-full p-1">
        {lens && (
          <span
            aria-hidden
            className={`rf-glass-lens absolute top-1 bottom-1 left-0 rounded-full ${lens.glide ? 'transition-[transform,width] duration-500 ease-[cubic-bezier(0.34,1.4,0.64,1)]' : ''}`}
            style={{ width: lens.w, transform: `translateX(${lens.x}px)` }}
          />
        )}
        {tabs.map((t) => {
          const on = t.key === current
          const body = (
            <>
              <span className="relative">
                <t.Icon className={`size-[22px] transition ${on ? 'text-ink' : 'text-ink-soft'}`} strokeWidth={on ? 1.7 : 1.3} />
                {t.badge ? (
                  <span
                    data-cart-count={t.cart ? '' : undefined}
                    className="absolute -top-1.5 -right-2.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-olive px-1 text-[9.5px] leading-none font-semibold text-on-accent"
                  >
                    {t.badge > 99 ? '99+' : t.badge}
                  </span>
                ) : null}
              </span>
              <span className={`mt-0.5 text-[10px] leading-none ${on ? 'font-semibold text-ink' : 'text-ink-soft'}`}>{t.label}</span>
            </>
          )
          const cls = 'relative z-[1] flex min-w-0 flex-1 flex-col items-center justify-center rounded-full'
          if (t.onTap)
            return (
              <button key={t.key} type="button" onClick={t.onTap} onPointerDown={tap} aria-label={`${t.label}, ${t.badge ?? 0} items`} data-cart-target={t.cart ? '' : undefined} className={cls}>
                {body}
              </button>
            )
          if (t.href)
            return (
              <a key={t.key} href={t.href} onPointerDown={tap} data-current={on} aria-current={on ? 'page' : undefined} className={cls}>
                {body}
              </a>
            )
          return (
            <Link key={t.key} to={t.to!} onPointerDown={tap} data-current={on} aria-current={on ? 'page' : undefined} className={cls}>
              {body}
            </Link>
          )
        })}
      </div>
      <button
        type="button"
        aria-label="Search"
        onPointerDown={tap}
        onClick={() => window.dispatchEvent(new Event('rf:search'))}
        className="rf-glass grid size-[62px] shrink-0 place-items-center rounded-full text-ink"
      >
        <SearchIcon className="size-[22px]" />
      </button>
    </nav>
  )
}
