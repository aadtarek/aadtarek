import { Suspense, type ReactNode } from 'react'
import { BrowserRouter, HashRouter, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { isCatalogReady, useCatalogVersion } from './api/catalog'
import { NO_PRODUCTS } from './routeTable'
import { AnnouncementBar } from './components/AnnouncementBar'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { HeroSlider } from './components/HeroSlider'
import { HERO_SLIDER } from './config'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Layout } from './components/Layout'
import { TabBar } from './components/TabBar'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { AccountProvider } from './store/account'
import { CartProvider } from './store/cart'
import { RewardsProvider } from './store/rewards'
import { WishlistProvider } from './store/wishlist'
import { IntroReveal } from './components/IntroReveal'
import { About, Account, Checkout, Contact, FaqSection, InfoPage, CollectionPage, CollectionsIndex, Article, Journal, OurStandard, Vitrine, FinderLanding, FinderQuiz, FinderResult, OrderReceived, ProductPage, Reviews, Shop, TrackOrder, Wishlist } from './routes'

/** `npm run build:preview` uses #/ URLs so the site works from a single static file host (shareable preview link). */
const Router = import.meta.env.VITE_HASH_ROUTER ? HashRouter : BrowserRouter

/** Shown until the products have loaded (usually a blink): the header and, on the home page, the hero — no loader. */
function Startup() {
  const home = useLocation().pathname === '/'
  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        {home && (HERO_SLIDER.enabled ? <HeroSlider /> : <Hero />)}
      </main>
    </div>
  )
}


function RouteGate({ children }: { children: ReactNode }) {
  useCatalogVersion()
  const { pathname } = useLocation()
  return isCatalogReady() || NO_PRODUCTS.test(pathname) ? children : <Startup />
}

/** /shop/<product> (WooCommerce's product link) → the storefront's product page. */
function ProductAlias() {
  const { slug = '' } = useParams()
  const { search } = useLocation()
  return <Navigate to={`/product/${slug}${search}`} replace />
}

export default function App() {
  return (
    <ErrorBoundary>
    <Router>
      <AccountProvider>
        <WishlistProvider>
          <CartProvider>
            <RewardsProvider>
            {/* The opening animation plays over the start (and hides any wait for the products). */}
            <IntroReveal />
            <RouteGate>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="shop" element={<Shop />} />
                <Route path="product/:slug" element={<ProductPage />} />
                {/* WooCommerce's own product links (product base "shop" or "product") */}
                <Route path="shop/:slug" element={<ProductAlias />} />
                <Route path="wishlist" element={<Wishlist />} />
                <Route path="account" element={<Account />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="checkout/order-received/:id" element={<OrderReceived />} />
                <Route path="cart" element={<Navigate to="/checkout" replace />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="track-order" element={<TrackOrder />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="faqs" element={<div className="pb-16 lg:pb-20"><FaqSection asPage /></div>} />
                <Route path="finder" element={<FinderLanding />} />
                <Route path="finder/quiz" element={<Suspense fallback={<div className="min-h-[70vh]" />}><FinderQuiz /></Suspense>} />
                <Route path="finder/result" element={<FinderResult />} />
                <Route path="discover" element={<Navigate to="/finder" replace />} />
                <Route path="collections" element={<CollectionsIndex />} />
                <Route path="collections/:slug" element={<CollectionPage />} />
                <Route path="our-standard" element={<OurStandard />} />
                <Route path="vitrine" element={<Vitrine />} />
                <Route path="journal" element={<Journal />} />
                <Route path="journal/:slug" element={<Article />} />
                <Route path=":page" element={<InfoPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            </RouteGate>
            {/* Outside the page tree: it shows with the first paint and stays while pages change. */}
            <TabBar />
            </RewardsProvider>
          </CartProvider>
        </WishlistProvider>
      </AccountProvider>
    </Router>
    </ErrorBoundary>
  )
}
