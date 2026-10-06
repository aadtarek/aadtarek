import { BrowserRouter, HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Layout } from './components/Layout'
import { About } from './pages/About'
import { Account } from './pages/Account'
import { Checkout } from './pages/Checkout'
import { Contact, FaqSection } from './pages/Contact'
import { Home } from './pages/Home'
import { InfoPage } from './pages/InfoPage'
import { CollectionPage, CollectionsIndex } from './pages/Collections'
import { Article, Journal } from './pages/Journal'
import { OurStandard } from './pages/OurStandard'
import { FinderLanding } from './pages/finder/FinderLanding'
import { FinderQuiz } from './pages/finder/FinderQuiz'
import { FinderResult } from './pages/finder/FinderResult'
import { NotFound } from './pages/NotFound'
import { OrderReceived } from './pages/OrderReceived'
import { ProductPage } from './pages/ProductPage'
import { Reviews } from './pages/Reviews'
import { Shop } from './pages/Shop'
import { TrackOrder } from './pages/TrackOrder'
import { Wishlist } from './pages/Wishlist'
import { AccountProvider } from './store/account'
import { CartProvider } from './store/cart'
import { WishlistProvider } from './store/wishlist'

/** `npm run build:preview` uses #/ URLs so the site works from a single static file host (shareable preview link). */
const Router = import.meta.env.VITE_HASH_ROUTER ? HashRouter : BrowserRouter

export default function App() {
  return (
    <ErrorBoundary>
    <Router>
      <AccountProvider>
        <WishlistProvider>
          <CartProvider>
            <Routes>
              <Route path="finder/quiz" element={<FinderQuiz />} />
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
          </CartProvider>
        </WishlistProvider>
      </AccountProvider>
    </Router>
    </ErrorBoundary>
  )
}
