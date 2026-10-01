import type { Review } from '../types'

/**
 * PLACEHOLDER reviews copied from the design mock-up. Replace with real,
 * verified customer reviews (WooCommerce `/wc/store/v1/products/reviews`)
 * before launch — never publish invented reviews.
 */
export const reviews: Review[] = [
  {
    id: 1,
    productId: 101,
    size: '100 ML',
    author: 'Ahmed M.',
    rating: 5,
    text: 'The fragrance feels much more expensive than I expected. The scent develops beautifully and I keep getting asked what I’m wearing.',
    verified: true,
    date: '2026-09-18',
  },
  {
    id: 2,
    productId: 104,
    size: '100 ML',
    author: 'Sara K.',
    rating: 5,
    text: 'Clean, versatile and long-lasting. Perfect for daily wear in the office and still performs well in the evening.',
    verified: true,
    date: '2026-09-10',
  },
  {
    id: 3,
    productId: 102,
    size: '100 ML',
    author: 'Omar H.',
    rating: 5,
    text: 'Elegant and sophisticated. Rose done right — not too sweet and very refined. It lasts all day on my skin.',
    verified: true,
    date: '2026-09-02',
  },
]
