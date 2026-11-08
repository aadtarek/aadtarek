import { Suspense, useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnnouncementBar } from './AnnouncementBar'
import { CartDrawer } from './CartDrawer'
import { Footer } from './Footer'
import { Header } from './Header'
import { QuickAddModal } from './QuickAddModal'
import { RewardsPopup } from './RewardsPopup'
import { installFx } from '../lib/fx'
import { readLogoColor } from '../lib/logoColor'
import { trimOwnLogo } from '../lib/ownLogo'
import { hideShell } from '../lib/shell'
import { useScrollReveal } from '../lib/useScrollReveal'

export function Layout() {
  const { pathname } = useLocation()
  const main = useRef<HTMLElement>(null)
  // The first page shows at once (fading it in delays the browser's first full paint); later pages fade in.
  const [firstPath] = useState(pathname)
  const animate = pathname !== firstPath
  useScrollReveal(main, pathname)
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

  return (
    <div className="flex min-h-screen flex-col pb-[calc(84px+env(safe-area-inset-bottom))] lg:pb-0">
      <AnnouncementBar />
      <Header />
      <main ref={main} className="flex-1">
        <div key={pathname} className={animate ? 'page-enter' : undefined}>
          <Suspense fallback={<div className="min-h-screen" />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
      {/* Checkout: no banner and only the footer's last line, so nothing pulls away from the order. */}
      <Footer showCta={pathname === '/'} compact={pathname.startsWith('/checkout')} />
      <CartDrawer />
      <QuickAddModal />
      <RewardsPopup />
    </div>
  )
}
