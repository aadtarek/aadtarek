import { Suspense, type ReactNode } from 'react'
import { BrowserRouter, HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { isCatalogReady, useCatalogVersion } from './api/catalog'
import { AnnouncementBar } from './components/AnnouncementBar'
import { FeatureStrip } from './components/FeatureStrip'
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
import { About, Account, Checkout, Contact, FaqSection, InfoPage, CollectionPage, CollectionsIndex, Article, Journal, OurStandard, FinderLanding, FinderQuiz, FinderResult, OrderReceived, ProductPage, Reviews, Shop, TrackOrder, Wishlist } from './routes'

/** `npm run build:preview` uses #/ URLs so the site works from a single static file host (shareable preview link). */
const Router = import.meta.env.VITE_HASH_ROUTER ? HashRouter : BrowserRouter

/** Shown until the products have loaded: header, the home hero and a few placeholder cards. */
function Startup() {
  const home = useLocation().pathname === '/'
  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        {home && (HERO_SLIDER.enabled ? <HeroSlider /> : <Hero />)}
        {home && <FeatureStrip />}
        <section className="container-x rf-loading-section" role="status" aria-label="Loading fragrances">
          <p className="rf-loading-label">Loading fragrances…</p>
          <div className="rf-loading-cards" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="rf-loading-card">
                <div className="rf-loading-image" />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

function RouteGate({ children }: { children: ReactNode }) {
  useCatalogVersion()
  return isCatalogReady() ? children : <Startup />
}

export default function App() {
  return (
    <ErrorBoundary>
    <Router>
      <AccountProvider>
        <WishlistProvider>
          <CartProvider>
            <RewardsProvider>
            <RouteGate>
            <Routes>
              <Route path="finder/quiz" element={<Suspense fallback={<div className="min-h-screen bg-sand" />}><FinderQuiz /></Suspense>} />
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="shop" element={<Shop />} />
                <Route path="product/:slug" element={<ProductPage />} />
                <Route path="wishlist" element={<Wishlist />} />
                <Route path="account" element={<Account />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="checkout/order-received/:id" element={<OrderReceived />} />
                <Route path="cart" element={<Navigate to="/checkout" replace />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="track-order" element={<TrackOrder />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="faqs" element={<div className="pt-2 pb-24"><FaqSection asPage /></div>} />
                <Route path="finder" element={<FinderLanding />} />
                <Route path="finder/result" element={<FinderResult />} />
                <Route path="discover" element={<Navigate to="/finder" replace />} />
                <Route path="collections" element={<CollectionsIndex />} />
                <Route path="collections/:slug" element={<CollectionPage />} />
                <Route path="our-standard" element={<OurStandard />} />
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
