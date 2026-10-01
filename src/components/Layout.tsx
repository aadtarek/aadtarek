import { useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { AnnouncementBar } from './AnnouncementBar'
import { CartDrawer } from './CartDrawer'
import { Header, navLinks } from './Header'
import { QuickAddModal } from './QuickAddModal'

export function Layout() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      {/* Placeholder footer — will be replaced once the footer design is shared. */}
      <footer className="bg-olive text-cream/80">
        <div className="container-x flex flex-col gap-4 py-8 text-[12px] tracking-[0.08em] uppercase sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Rfaheya — Speak your scent</p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} className="hover:text-cream">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
      <CartDrawer />
      <QuickAddModal />
    </div>
  )
}
