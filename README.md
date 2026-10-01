# Rfaheya — Storefront

React + TypeScript + Vite + Tailwind storefront for Rfaheya fragrances. Built to be connected to
WordPress / WooCommerce (headless) later.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## What works now

- Announcement bar (arrows, auto-rotate on mobile), sticky header, mobile menu
- Live search (keyboard navigation) → `/shop?q=`
- Hero + feature strip
- Best Sellers / New Arrivals tabs, infinite swipeable carousel with arrows and dots
- Product cards: wishlist heart, **Add to cart** (size picker: 50 / 100 ML), **Try 10 ML** sample
- Cart drawer (quantities, remove, free-shipping progress), checkout (validation, Egyptian
  governorates, cash on delivery), order confirmation
- "Explore by what you love" fragrance families → filtered shop (`/shop?family=fresh`)
- Rfaheya Standard section, customer reviews carousel + `/reviews` page with rating summary
- Footer: CTA banner, link columns (every link routes), newsletter sign-up, currency picker,
  order tracking (`/track-order`)
- Shop page (accord / family filters, sorting), product page, wishlist, account (sign up / sign in / orders)
- Cart, wishlist, account and orders persist in `localStorage`

## Structure

```
src/
  api/catalog.ts    ← the ONLY place that reads product data (swap to WooCommerce here)
  data/products.ts  ← mock catalogue (replaced by WooCommerce products)
  data/families.ts  ← fragrance families (→ WooCommerce categories)
  data/reviews.ts   ← PLACEHOLDER reviews from the mock-up — replace with real reviews
  store/            ← cart, wishlist, account/orders (React context)
  components/       ← UI building blocks
  pages/            ← routes
  types.ts          ← domain types shaped after the WooCommerce Store API
  config.ts         ← shipping rules
```

## WooCommerce integration plan

1. Products → `GET /wp-json/wc/store/v1/products` (variable products; sizes = variations;
   notes / accords / "inspired by" as attributes or ACF meta). Re-implement `src/api/catalog.ts`.
2. Cart → Store API cart endpoints (`/cart/add-item`, `/cart/update-item`, …) behind `store/cart.tsx`.
3. Reviews → `GET /wp-json/wc/store/v1/products/reviews`.
4. Checkout → `POST /wc/store/v1/checkout`.
5. Accounts → JWT auth plugin or same-domain cookie auth, replacing `store/account.tsx`.

> The local account system is a stand-in for development only; passwords are not secured.
