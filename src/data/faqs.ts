import { FLAT_SHIPPING_RATE, FREE_SHIPPING_THRESHOLD } from '../config'

const threshold = FREE_SHIPPING_THRESHOLD.toLocaleString('en-US')

/** Review these answers against the store's real policies before launch. */
export const faqs: { q: string; a: string }[] = [
  {
    q: 'What does “inspired by” mean?',
    a: 'Each Rfaheya fragrance takes inspiration from a well-known scent, then is composed with our own quality materials and high concentration. They are original Rfaheya creations — not the original brands’ products.',
  },
  {
    q: 'How does “Try 10 ML first” work?',
    a: 'Every fragrance is available as a 10 ML discovery size for 60 EGP. Wear it for a few days, and when it feels like you, choose the full 50 or 100 ML bottle.',
  },
  {
    q: 'How much is shipping?',
    a: `Shipping is free in Cairo & Alexandria on orders over ${threshold} EGP. Other orders ship for a flat ${FLAT_SHIPPING_RATE} EGP.`,
  },
  {
    q: 'How do I pay?',
    a: 'We currently accept cash on delivery. You pay when your order arrives.',
  },
  {
    q: 'What is the zero risk guarantee?',
    a: 'If a fragrance isn’t right for you, contact us and we’ll arrange an easy return — even if used.',
  },
  {
    q: 'How can I track my order?',
    a: 'Use the Track Your Order page with your order number and mobile number, or message us and we’ll update you.',
  },
]
