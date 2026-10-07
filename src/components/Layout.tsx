import { Suspense, useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnnouncementBar } from './AnnouncementBar'
import { CartDrawer } from './CartDrawer'
import { Footer } from './Footer'
import { Header } from './Header'
import { QuickAddModal } from './QuickAddModal'
import { useScrollReveal } from '../lib/useScrollReveal'

export function Layout() {
  const { pathname } = useLocation()
  const main = useRef<HTMLElement>(null)
  // The first page shows at once (fading it in delays the browser's first full paint); later pages fade in.
  const [firstPath] = useState(pathname)
  const animate = pathname !== firstPath
  useScrollReveal(main, pathname)
  useEffect(() => {
    // The effect must not return scrollTo's value: some browsers return a Promise.
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <Header />
      <main ref={main} className="flex-1">
        <div key={pathname} className={animate ? 'page-enter' : undefined}>
          <Suspense fallback={<div className="min-h-screen" />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
      <Footer showCta={!pathname.startsWith('/finder')} />
      <CartDrawer />
      <QuickAddModal />
    </div>
  )
}
