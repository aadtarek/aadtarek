import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnnouncementBar } from './AnnouncementBar'
import { CartDrawer } from './CartDrawer'
import { Footer } from './Footer'
import { Header } from './Header'
import { QuickAddModal } from './QuickAddModal'

export function Layout() {
  const { pathname } = useLocation()
  // Braces matter: some browser extensions make scrollTo return a value, and an
  // effect that returns a non-function crashes React on the next navigation.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer showCta={!pathname.startsWith('/finder')} />
      <CartDrawer />
      <QuickAddModal />
    </div>
  )
}
