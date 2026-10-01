import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Account } from './pages/Account'
import { Checkout } from './pages/Checkout'
import { ComingSoon } from './pages/ComingSoon'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { ProductPage } from './pages/ProductPage'
import { Shop } from './pages/Shop'
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
                <Route path="discover" element={<ComingSoon title="Find Your Scent" />} />
                <Route path="collections" element={<ComingSoon title="Collections" />} />
                <Route path="our-standard" element={<ComingSoon title="Our Standard" />} />
                <Route path="journal" element={<ComingSoon title="Journal" />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </CartProvider>
        </WishlistProvider>
      </AccountProvider>
    </BrowserRouter>
  )
}
