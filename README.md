# Rfaheya — Storefront

React + TypeScript + Vite + Tailwind storefront for Rfaheya fragrances. Built to be connected to
WordPress / WooCommerce (headless) later.

## Run

```bash
npm install
npm start        # builds and opens the site at http://localhost:4173 — easiest way to view it
npm run dev      # development mode with live reload (http://localhost:5173)
npm run build    # production build in dist/
```

> If `npm run dev` shows the page for a second and then keeps reloading, something on the
> machine (a browser extension, Brave Shields, antivirus or VPN) is dropping Vite's live-reload
> WebSocket. Use `npm start` instead, or try another browser / disable the extension for localhost.

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
- **Shop** (`/shop`): family tiles, multi-select family/accord filters with live counts, sort,
  active-filter pills, mobile filter drawer — all state in the URL so filtered views are shareable
- **Product** (`/product/:slug`): gallery, size picker (10 / 50 / 100 ML), quantity, wishlist,
  "try 10 ML first", accordions, notes, Rfaheya Standard, product reviews, related products,
  sticky add-to-cart bar on mobile
- **About** (`/about`) and **Contact** (`/contact`, form + FAQs; `/faqs` on its own)
- **Rfaheya Finder** (`/finder`): landing → 7-step quiz (`/finder/quiz`, full-screen) with answer chips,
  "explore more notes" popup (max 3 notes) and a review/edit popup → results (`/finder/result?...`,
  shareable URL). Matching logic lives in `src/finder/match.ts`; product attributes it uses are in
  each product's `profile` in `src/data/products.ts`.
- **Collections** (`/collections`): Perfume Lab, Ledger (men), Serenity (women), a build-your-own
  Discovery Set, and Gift Boxes with a gift message that travels through cart → order
- **Our Standard**, **Journal** (3 articles), Shipping, Returns, Size Guide, Ingredients,
  Sustainability, Privacy, Terms
- **Checkout**: cash on delivery or InstaPay transfer (instructions shown after ordering)
- Wishlist, account (sign up / sign in / orders)
- Cart, wishlist, account and orders persist in `localStorage`

## Before launch — content to replace

- `src/config.ts` → `CONTACT` (email, phone, WhatsApp, hours, InstaPay address) and `SOCIAL_LINKS` are placeholders
- `src/data/products.ts` → each product's Finder `profile` (gender, occasions, seasons, presence, longevity)
- `src/data/content.ts` → Shipping / Returns / Privacy / Terms etc. are drafts — have them reviewed
- Gift Boxes promise to include the message with the gift — make sure fulfilment does
- `src/data/reviews.ts` → placeholder reviews from the mock-up
- `src/data/faqs.ts`, About page copy → review against real policies
- `FLAT_SHIPPING_RATE` (70 EGP) is an assumption

## Deploying

`npm run build` outputs a static site in `dist/`. It uses client-side routing, so the host must
serve `index.html` for unknown paths (Netlify/Vercel do this with a one-line rewrite; on Apache
use a `.htaccess` fallback).

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
