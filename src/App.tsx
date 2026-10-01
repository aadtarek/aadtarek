import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Account } from './pages/Account'
import { Checkout } from './pages/Checkout'
import { Home } from './pages/Home'
import { CollectionPage, InfoPage } from './pages/InfoPage'
import { NotFound } from './pages/NotFound'
import { ProductPage } from './pages/ProductPage'
import { Reviews } from './pages/Reviews'
import { Shop } from './pages/Shop'
import { TrackOrder } from './pages/TrackOrder'
import { Wishlist } from './pages/Wishlist'
import { AccountProvider } from './store/account'
import { CartProvider } from './store/cart'
import { WishlistProvider } from './store/wishlist'

export default function App() {
  return (
    <BrowserRouter>
      <AccountProvider>
        <WishlistProvider>
          <CartProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="shop" element={<Shop />} />
                <Route path="product/:slug" element={<ProductPage />} />
                <Route path="wishlist" element={<Wishlist />} />
                <Route path="account" element={<Account />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="track-order" element={<TrackOrder />} />
                <Route path="collections/:slug" element={<CollectionPage />} />
                <Route path=":page" element={<InfoPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </CartProvider>
        </WishlistProvider>
      </AccountProvider>
    </BrowserRouter>
  )
}
