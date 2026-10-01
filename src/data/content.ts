import { CONTACT, FLAT_SHIPPING_RATE, FREE_SHIPPING_THRESHOLD } from '../config'

/**
 * Copy for the information pages. These are DRAFTS written to match how the
 * store works today — review every page (especially Privacy, Terms, Returns
 * and Shipping) against the business's real policies before launch.
 */

export interface ContentPage {
  slug: string
  eyebrow: string
  title: string
  intro: string
  sections: { heading: string; paragraphs?: string[]; list?: string[] }[]
}

const threshold = FREE_SHIPPING_THRESHOLD.toLocaleString('en-US')

export const contentPages: ContentPage[] = [
  {
    slug: 'shipping',
    eyebrow: 'Help',
    title: 'Shipping & Delivery',
    intro: 'We deliver across Egypt. Here’s how shipping works.',
    sections: [
      {
        heading: 'Shipping costs',
        list: [
          `Free shipping in Cairo & Alexandria on orders over ${threshold} EGP.`,
          `All other orders ship for a flat ${FLAT_SHIPPING_RATE} EGP.`,
          'Shipping is calculated at checkout once you choose your governorate.',
        ],
      },
      {
        heading: 'Delivery times',
        paragraphs: [
          'Delivery times vary by governorate. After you place your order, our team calls you to confirm the details and the expected delivery date.',
        ],
      },
      {
        heading: 'Payment',
        paragraphs: ['Pay in cash when your order arrives, or by InstaPay transfer. Card, Meeza and valU payments are coming soon.'],
      },
      {
        heading: 'Tracking',
        paragraphs: ['Use the Track Your Order page with your order number and mobile number, or contact us any time.'],
      },
    ],
  },
  {
    slug: 'returns',
    eyebrow: 'Help',
    title: 'Returns & Refunds',
    intro: 'Our zero risk guarantee: if a fragrance isn’t right for you, we’ll make it right — even if used.',
    sections: [
      {
        heading: 'How to start a return',
        list: [
          'Contact us with your order number and the item you’d like to return.',
          'Our team confirms the return and arranges collection.',
          'Once received, we process your refund or exchange.',
        ],
      },
      {
        heading: 'Try before you commit',
        paragraphs: [
          'The best way to avoid a return is to start with a 10 ML discovery size. Wear it for a few days, then choose the full bottle with confidence.',
        ],
      },
      {
        heading: 'Damaged or incorrect items',
        paragraphs: ['If your order arrives damaged or incorrect, contact us right away and we’ll replace it at no cost.'],
      },
    ],
  },
  {
    slug: 'size-guide',
    eyebrow: 'Help',
    title: 'Size Guide',
    intro: 'Every Rfaheya fragrance comes in three sizes.',
    sections: [
      {
        heading: 'Choosing a size',
        list: [
          '10 ML — the discovery size. Roughly 100 sprays; ideal for trying a scent or travelling.',
          '50 ML — the everyday size. Roughly 500 sprays.',
          '100 ML — the signature size. Roughly 1,000 sprays; best value for a fragrance you love.',
        ],
      },
      {
        heading: 'How much to apply',
        paragraphs: [
          'Two to four sprays is enough for most occasions. Fresh scents can take a little more; rich, oriental scents need less.',
        ],
      },
    ],
  },
  {
    slug: 'ingredients',
    eyebrow: 'About',
    title: 'Ingredients & Quality',
    intro: 'What goes into a Rfaheya fragrance — and how we judge it.',
    sections: [
      {
        heading: 'Eau de parfum concentration',
        paragraphs: [
          'Our fragrances are made as eau de parfum: a high concentration of perfume oil designed for rich character and lasting wear.',
        ],
      },
      {
        heading: 'Quality materials',
        paragraphs: [
          'Each composition is built from carefully selected materials so the scent stays true from the first spray to the dry-down.',
        ],
      },
      {
        heading: 'Judged on skin',
        paragraphs: [
          'Before a fragrance joins the collection it is evaluated against the Rfaheya Standard™ — character, comfort, density, projection, longevity and evolution.',
        ],
      },
      {
        heading: 'Skin sensitivity',
        paragraphs: [
          'Fragrances contain natural and synthetic aromatic materials. If you have sensitive skin, patch-test on a small area first and stop use if irritation occurs.',
        ],
      },
    ],
  },
  {
    slug: 'sustainability',
    eyebrow: 'About',
    title: 'Sustainability',
    intro: 'Small choices that make fragrance last longer — and waste less.',
    sections: [
      {
        heading: 'Try first, waste less',
        paragraphs: [
          'Discovery sizes help you find the right scent before buying a full bottle, so fewer bottles end up unused on a shelf.',
        ],
      },
      {
        heading: 'Make it last',
        paragraphs: [
          'Store your fragrance away from heat and sunlight and keep the cap on. A well-kept bottle stays true to its scent for longer.',
        ],
      },
      {
        heading: 'Recycling your bottle',
        paragraphs: ['Glass bottles are recyclable. Once empty, separate the cap and dispose of the glass with your glass recycling.'],
      },
      {
        heading: 'Share your ideas',
        paragraphs: [`We’re always looking for ways to do better. Tell us what you’d like to see at ${CONTACT.email}.`],
      },
    ],
  },
  {
    slug: 'privacy',
    eyebrow: 'Legal',
    title: 'Privacy Policy',
    intro: 'How we collect, use and protect your personal information.',
    sections: [
      {
        heading: 'Information we collect',
        list: [
          'Contact and delivery details you provide at checkout (name, mobile number, email, address).',
          'Account details if you create an account.',
          'Messages you send us through the contact form or newsletter sign-up.',
        ],
      },
      {
        heading: 'How we use it',
        list: [
          'To process, deliver and support your orders.',
          'To reply to your questions.',
          'To send newsletters if you subscribed — you can unsubscribe at any time.',
        ],
      },
      {
        heading: 'Sharing',
        paragraphs: ['We share delivery details only with the courier delivering your order. We do not sell your personal information.'],
      },
      {
        heading: 'Your choices',
        paragraphs: [`To access, correct or delete your information, contact us at ${CONTACT.email}.`],
      },
    ],
  },
  {
    slug: 'terms',
    eyebrow: 'Legal',
    title: 'Terms & Conditions',
    intro: 'The terms that apply when you shop with Rfaheya.',
    sections: [
      {
        heading: 'Orders',
        paragraphs: [
          'Placing an order is an offer to buy. We confirm every order by phone before dispatch and may cancel orders we cannot fulfil, in which case nothing is charged.',
        ],
      },
      {
        heading: 'Prices',
        paragraphs: ['Prices are shown in Egyptian Pounds (EGP). Shipping is calculated at checkout.'],
      },
      {
        heading: 'Inspired fragrances',
        paragraphs: [
          '“Inspired by” describes a scent direction only. Rfaheya fragrances are original Rfaheya products and are not affiliated with, or endorsed by, the brands mentioned.',
        ],
      },
      {
        heading: 'Returns',
        paragraphs: ['Returns are handled under our Returns & Refunds policy.'],
      },
      {
        heading: 'Contact',
        paragraphs: [`Questions about these terms? Email ${CONTACT.email}.`],
      },
    ],
  },
]

export function findContentPage(slug: string) {
  return contentPages.find((p) => p.slug === slug)
}
