import { lazy, type ComponentType } from 'react'
import { ROUTE_TABLE } from './routeTable'

/**
 * Pages other than the home page load on demand, keeping the first download
 * small. `preloadRoute` (main.tsx) fetches the current page's code together
 * with the catalogue, so the first render has it and nothing jumps.
 */
function page<P extends object>(load: () => Promise<ComponentType<P>>) {
  let loaded: ComponentType<P> | null = null
  let pending: Promise<void> | null = null
  const preload = () =>
    (pending ??= load().then((c) => {
      loaded = c
    }))
  const Lazy = lazy(() => preload().then(() => ({ default: loaded! })))
  function Page(props: P) {
    const C = loaded
    return C ? <C {...props} /> : <Lazy {...props} />
  }
  Page.preload = preload
  return Page
}

const About = page(() => import('./pages/About').then((m) => m.About))
const Account = page(() => import('./pages/Account').then((m) => m.Account))
const Checkout = page(() => import('./pages/Checkout').then((m) => m.Checkout))
const Contact = page(() => import('./pages/Contact').then((m) => m.Contact))
const FaqSection = page(() => import('./pages/Contact').then((m) => m.FaqSection))
const InfoPage = page(() => import('./pages/InfoPage').then((m) => m.InfoPage))
const CollectionPage = page(() => import('./pages/Collections').then((m) => m.CollectionPage))
const CollectionsIndex = page(() => import('./pages/Collections').then((m) => m.CollectionsIndex))
const Article = page(() => import('./pages/Journal').then((m) => m.Article))
const Journal = page(() => import('./pages/Journal').then((m) => m.Journal))
const OurStandard = page(() => import('./pages/OurStandard').then((m) => m.OurStandard))
const FinderLanding = page(() => import('./pages/finder/FinderLanding').then((m) => m.FinderLanding))
const FinderQuiz = page(() => import('./pages/finder/FinderQuiz').then((m) => m.FinderQuiz))
const FinderResult = page(() => import('./pages/finder/FinderResult').then((m) => m.FinderResult))
const OrderReceived = page(() => import('./pages/OrderReceived').then((m) => m.OrderReceived))
const ProductPage = page(() => import('./pages/ProductPage').then((m) => m.ProductPage))
const Reviews = page(() => import('./pages/Reviews').then((m) => m.Reviews))
const Shop = page(() => import('./pages/Shop').then((m) => m.Shop))
const TrackOrder = page(() => import('./pages/TrackOrder').then((m) => m.TrackOrder))
const Wishlist = page(() => import('./pages/Wishlist').then((m) => m.Wishlist))

const byModule: Record<string, { preload: () => Promise<void> }> = {
  'src/pages/Shop.tsx': Shop,
  'src/pages/ProductPage.tsx': ProductPage,
  'src/pages/Wishlist.tsx': Wishlist,
  'src/pages/Account.tsx': Account,
  'src/pages/OrderReceived.tsx': OrderReceived,
  'src/pages/Checkout.tsx': Checkout,
  'src/pages/Reviews.tsx': Reviews,
  'src/pages/TrackOrder.tsx': TrackOrder,
  'src/pages/About.tsx': About,
  'src/pages/Contact.tsx': Contact,
  'src/pages/finder/FinderQuiz.tsx': FinderQuiz,
  'src/pages/finder/FinderResult.tsx': FinderResult,
  'src/pages/finder/FinderLanding.tsx': FinderLanding,
  'src/pages/Collections.tsx': CollectionsIndex,
  'src/pages/OurStandard.tsx': OurStandard,
  'src/pages/Journal.tsx': Journal,
  'src/pages/InfoPage.tsx': InfoPage,
}

/** Starts loading the code of the page at `path` (the home page is always included). */
export function preloadRoute(path: string): Promise<void> {
  const hit = ROUTE_TABLE.find(([pattern]) => new RegExp(pattern).test(path))
  return hit ? byModule[hit[1]].preload() : Promise.resolve()
}

export { About, Account, Checkout, Contact, FaqSection, InfoPage, CollectionPage, CollectionsIndex, Article, Journal, OurStandard, FinderLanding, FinderQuiz, FinderResult, OrderReceived, ProductPage, Reviews, Shop, TrackOrder, Wishlist }
