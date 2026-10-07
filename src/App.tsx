import { Suspense, type ReactNode } from 'react'
import { BrowserRouter, HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useCatalogReady } from './api/catalog'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { AccountProvider } from './store/account'
import { CartProvider } from './store/cart'
import { WishlistProvider } from './store/wishlist'
import { About, Account, Checkout, Contact, FaqSection, InfoPage, CollectionPage, CollectionsIndex, Article, Journal, OurStandard, FinderLanding, FinderQuiz, FinderResult, OrderReceived, ProductPage, Reviews, Shop, TrackOrder, Wishlist } from './routes'

/** `npm run build:preview` uses #/ URLs so the site works from a single static file host (shareable preview link). */
const Router = import.meta.env.VITE_HASH_ROUTER ? HashRouter : BrowserRouter

export default function App() {
  // The pages show before the products have loaded.
  const ready = useCatalogReady()
  // Pages that are mostly products: their content waits for them (header and footer show already).
  const products = (page: ReactNode) => (ready ? page : <div className="min-h-screen" />)
  return (
    <ErrorBoundary>
    <Router>
      <AccountProvider>
        <WishlistProvider>
          <CartProvider>
            <Routes>
              <Route path="finder/quiz" element={<Suspense fallback={<div className="min-h-screen bg-sand" />}><FinderQuiz /></Suspense>} />
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="shop" element={products(<Shop />)} />
                <Route path="product/:slug" element={products(<ProductPage />)} />
                <Route path="wishlist" element={products(<Wishlist />)} />
                <Route path="account" element={<Account />} />
                <Route path="checkout" element={products(<Checkout />)} />
                <Route path="checkout/order-received/:id" element={products(<OrderReceived />)} />
                <Route path="cart" element={<Navigate to="/checkout" replace />} />
                <Route path="reviews" element={products(<Reviews />)} />
                <Route path="track-order" element={<TrackOrder />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="faqs" element={<div className="pt-2 pb-24"><FaqSection asPage /></div>} />
                <Route path="finder" element={<FinderLanding />} />
                <Route path="finder/result" element={products(<FinderResult />)} />
                <Route path="discover" element={<Navigate to="/finder" replace />} />
                <Route path="collections" element={products(<CollectionsIndex />)} />
                <Route path="collections/:slug" element={products(<CollectionPage />)} />
                <Route path="our-standard" element={<OurStandard />} />
                <Route path="journal" element={<Journal />} />
                <Route path="journal/:slug" element={<Article />} />
                <Route path=":page" element={<InfoPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </CartProvider>
        </WishlistProvider>
      </AccountProvider>
    </Router>
    </ErrorBoundary>
  )
}
