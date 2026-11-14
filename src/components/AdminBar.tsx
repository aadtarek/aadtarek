import { ExternalLink, LayoutDashboard, LogOut, Pencil, Plus, Receipt, Settings } from 'lucide-react'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getAllProducts } from '../api/catalog'
import { useRewards, type AdminLinks } from '../store/rewards'

/** What "Edit" opens for the page on screen. */
function editFor(path: string, a: AdminLinks): { label: string; href: string } {
  const tab = (t: string) => a.settingsTab.replace('__TAB__', t)
  const product = path.match(/^\/product\/([^/?#]+)/)
  if (product) {
    const p = getAllProducts().find((x) => x.slug === decodeURIComponent(product[1]))
    if (p) return { label: `Edit ${p.name}`, href: a.editPost.replace('__ID__', String(p.id)) }
    return { label: 'Edit products', href: a.products }
  }
  if (path === '/') return { label: 'Edit home page', href: tab('home') }
  if (/^\/(vanilla-redefined|oud-rose-redefined)/.test(path)) return { label: 'Edit campaign', href: tab('campaigns') }
  if (/^\/(vitrine|collections|our-standard|finder)/.test(path)) return { label: 'Edit pictures', href: tab('images') }
  if (path.startsWith('/shop')) return { label: 'Edit products', href: a.products }
  if (path.startsWith('/reviews')) return { label: 'Edit reviews', href: a.reviews }
  if (path.startsWith('/faqs')) return { label: 'Edit FAQs', href: a.faqs }
  if (path.startsWith('/journal')) return { label: 'Edit posts', href: a.posts }
  if (path.startsWith('/checkout') || path.startsWith('/account')) return { label: 'Orders', href: a.orders }
  return { label: 'Store settings', href: a.settings }
}

/**
 * The admin bar on the storefront, for staff only (like WordPress's own): its "Edit" button
 * follows the page on screen (on a product it opens that product in the dashboard).
 */
export function AdminBar() {
  const { admin } = useRewards()
  const { pathname } = useLocation()
  useEffect(() => {
    document.documentElement.classList.toggle('rf-has-adminbar', !!admin)
    return () => document.documentElement.classList.remove('rf-has-adminbar')
  }, [admin])
  if (!admin) return null
  const edit = editFor(pathname, admin)
  const item = 'inline-flex h-full items-center gap-1.5 px-2.5 text-[12.5px] whitespace-nowrap text-white/85 transition hover:bg-white/10 hover:text-[#f0c27a]'
  return (
    <div role="navigation" aria-label="Admin" className="rf-adminbar fixed inset-x-0 top-0 z-[80] flex h-8 items-stretch bg-[#1d2327] text-white shadow-[0_1px_0_rgba(0,0,0,0.3)]">
      <a href={admin.dashboard} className={`${item} font-semibold`} title="Dashboard">
        <LayoutDashboard className="size-4" strokeWidth={1.6} />
        <span className="hidden sm:inline">Dashboard</span>
      </a>
      <a href={edit.href} className={`${item} bg-[#e49b2d]/15 text-[#f0c27a]`}>
        <Pencil className="size-3.5" strokeWidth={1.8} />
        <span className="max-w-[46vw] truncate">{edit.label}</span>
      </a>
      <a href={admin.newProduct} className={`${item} max-sm:hidden`}>
        <Plus className="size-4" strokeWidth={1.8} /> New product
      </a>
      <a href={admin.orders} className={item} title="Orders">
        <Receipt className="size-4" strokeWidth={1.6} />
        <span className="hidden md:inline">Orders</span>
      </a>
      <a href={admin.offers} className={`${item} max-lg:hidden`}>
        <ExternalLink className="size-3.5" strokeWidth={1.6} /> Offers
      </a>
      <a href={admin.settings} className={item} title="Store settings">
        <Settings className="size-4" strokeWidth={1.6} />
        <span className="hidden md:inline">Settings</span>
      </a>
      <span className="ml-auto hidden items-center px-3 text-[12.5px] text-white/60 md:inline-flex">Hi, {admin.name}</span>
      <a href={admin.logout} className={`${item} max-md:ml-auto`} title="Log out">
        <LogOut className="size-4" strokeWidth={1.6} />
      </a>
    </div>
  )
}
