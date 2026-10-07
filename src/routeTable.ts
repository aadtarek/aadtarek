/**
 * URL → page module, for pages loaded on demand. Used by src/routes.tsx (to
 * preload the current page with the catalogue) and vite.config.ts (to start
 * downloading it from index.html). The first match wins.
 */
export const ROUTE_TABLE: [pattern: string, module: string][] = [
  ['^/shop', 'src/pages/Shop.tsx'],
  ['^/product/', 'src/pages/ProductPage.tsx'],
  ['^/wishlist', 'src/pages/Wishlist.tsx'],
  ['^/account', 'src/pages/Account.tsx'],
  ['^/checkout/order-received', 'src/pages/OrderReceived.tsx'],
  ['^/checkout', 'src/pages/Checkout.tsx'],
  ['^/reviews', 'src/pages/Reviews.tsx'],
  ['^/track-order', 'src/pages/TrackOrder.tsx'],
  ['^/about', 'src/pages/About.tsx'],
  ['^/contact', 'src/pages/Contact.tsx'],
  ['^/faqs', 'src/pages/Contact.tsx'],
  ['^/finder/quiz', 'src/pages/finder/FinderQuiz.tsx'],
  ['^/finder/result', 'src/pages/finder/FinderResult.tsx'],
  ['^/finder', 'src/pages/finder/FinderLanding.tsx'],
  ['^/collections', 'src/pages/Collections.tsx'],
  ['^/our-standard', 'src/pages/OurStandard.tsx'],
  ['^/journal', 'src/pages/Journal.tsx'],
  ['^/[^/]+/?$', 'src/pages/InfoPage.tsx'],
]
