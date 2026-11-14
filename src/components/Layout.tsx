import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AdminBar } from './AdminBar'
import { AnnouncementBar } from './AnnouncementBar'
import { Header } from './Header'
import { installFx } from '../lib/fx'
import { readLogoColor } from '../lib/logoColor'
import { trimOwnLogo } from '../lib/ownLogo'
import { hideShell } from '../lib/shell'
import { Deferred, useAfterLoad } from './Deferred'
import { useCart } from '../store/cart'

// Not needed for the first view: downloaded once the page has loaded (or when first opened).
const Footer = lazy(() => import('./Footer').then((m) => ({ default: m.Footer })))
const CartDrawer = lazy(() => import('./CartDrawer').then((m) => ({ default: m.CartDrawer })))
const QuickAddModal = lazy(() => import('./QuickAddModal').then((m) => ({ default: m.QuickAddModal })))
const RewardsPopup = lazy(() => import('./RewardsPopup').then((m) => ({ default: m.RewardsPopup })))
import { useScrollReveal } from '../lib/useScrollReveal'

export function Layout() {
  const { pathname } = useLocation()
  const main = useRef<HTMLElement>(null)
  // The first page shows at once (fading it in delays the browser's first full paint); later pages fade in.
  const [firstPath] = useState(pathname)
  const animate = pathname !== firstPath
  useScrollReveal(main, pathname)
  const loaded = useAfterLoad()
  const cart = useCart()
  useEffect(installFx, [])
  useEffect(() => {
    // The phone's first screen from index.html: the home slider removes it once its picture
    // is up; anywhere else (or if that never happens) it goes now / shortly.
    if (pathname !== '/') return hideShell()
    const t = window.setTimeout(hideShell, 4000)
    return () => window.clearTimeout(t)
  }, [pathname])
  useEffect(() => {
    // After the page has drawn: neither should hold up the first view.
    const run = () => {
      readLogoColor()
      trimOwnLogo()
    }
    if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 700 })
    else setTimeout(run, 200)
  }, [])
  useEffect(() => {
    // The effect must not return scrollTo's value: some browsers return a Promise.
    window.scrollTo(0, 0)
  }, [pathname])

  // The Vitrine is a full-screen experience: no bar, header or footer, only the page (and the bag).
  if (pathname.startsWith('/vitrine')) {
    return (
      <>
        <AdminBar />
        <main ref={main}>
          <Suspense fallback={<div className="fixed inset-0 bg-black" />}>
            <Outlet />
          </Suspense>
        </main>
        {(loaded || cart.isOpen) && (
          <Suspense fallback={null}>
            <CartDrawer />
          </Suspense>
        )}
      </>
    )
  }

  return (
    <div className="flex min-h-screen flex-col pb-[calc(84px+env(safe-area-inset-bottom))] lg:pb-0">
      <AdminBar />
      <AnnouncementBar />
      <Header />
      {/* At least a screen tall: the footer starts below the first view, so pages whose content
          arrives a moment later don't push it (no layout jump). */}
      <main ref={main} className="min-h-[100svh] flex-1">
        <div key={pathname} className={animate ? 'page-enter' : undefined}>
          <Suspense fallback={<div className="min-h-screen" />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
      {/* Checkout: no banner and only the footer's last line, so nothing pulls away from the order. */}
      {pathname.startsWith('/checkout') ? (
        <Suspense fallback={null}>
          <Footer compact />
        </Suspense>
      ) : (
        // Built when the visitor scrolls near it: the page's start doesn't wait for it.
        <Deferred height={900}>
          <Footer showCta={pathname === '/'} />
        </Deferred>
      )}
      {(loaded || cart.isOpen || cart.quickAdd) && (
        <Suspense fallback={null}>
          <CartDrawer />
          <QuickAddModal />
          {loaded && <RewardsPopup />}
        </Suspense>
      )}
    </div>
  )
}
