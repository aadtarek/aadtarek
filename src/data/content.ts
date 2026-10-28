import { CONTACT } from '../config'

/** Copy for the information pages (the store's Privacy Policy and Returns & Refunds). */

export interface ContentSection {
  heading: string
  /** 3 = a smaller heading inside the section before it */
  level?: 2 | 3
  paragraphs?: string[]
  /** Items may start with “Label: ” — the label is shown in bold. */
  list?: string[]
  /** Paragraphs shown after the list */
  after?: string[]
}

export interface ContentPage {
  slug: string
  eyebrow: string
  title: string
  intro: string
  sections: ContentSection[]
}

export const contentPages: ContentPage[] = [
  {
    slug: 'returns',
    eyebrow: 'Help',
    title: 'Returns & Refunds',
    intro: '',
    sections: [
      {
        heading: 'Our Zero Risk Guarantee',
        paragraphs: [
          'At Rfaheya, we want you to feel confident when choosing your fragrance. If a full-size fragrance isn’t the right match for your taste, you may request an exchange under the conditions outlined below.',
          'To help you discover your preferred scent before committing to a full-size bottle, we also offer 5 ML and 10 ML discovery sizes, the Candy Box, and the Travel Size Box.',
        ],
      },
      {
        heading: 'How to Start an Exchange',
        paragraphs: [
          'To request an exchange due to personal fragrance preference, please contact our customer service team with your order number and the fragrance you’d like to exchange.',
          'The following conditions apply:',
        ],
      },
      {
        heading: 'Eligible Sizes',
        level: 3,
        list: [
          'Exchanges due to personal preference are available for full-size fragrances starting from 30 ML.',
          '5 ML and 10 ML sizes are not eligible for exchanges or refunds due to personal preference.',
        ],
      },
      {
        heading: 'Let Your Fragrance Settle',
        level: 3,
        paragraphs: [
          'After receiving your product, keep your fragrance in a dark, dry place for 2 days before trying it, following the care instructions provided with your order.',
        ],
      },
      {
        heading: 'Exchange Request Window',
        level: 3,
        list: [
          'Exchange requests cannot be submitted immediately upon receiving the product.',
          'You may submit an exchange request starting 3 days after receiving the product and no later than 7 days after receiving it.',
        ],
      },
      {
        heading: 'Bottle Condition',
        level: 3,
        paragraphs: ['The bottle must retain at least 95% of its original contents to qualify for an exchange due to personal preference.'],
      },
      {
        heading: 'Exchange Value',
        level: 3,
        paragraphs: [
          'Exchanges are available for fragrances of equal or higher value than the original fragrance.',
          'If you choose a fragrance of higher value, you must pay the price difference before the exchange is confirmed. Exchanges for fragrances of lower value are not permitted.',
        ],
      },
      {
        heading: 'One Exchange Per Customer',
        level: 3,
        paragraphs: [
          'Each customer is entitled to one exchange due to personal preference only. Once this exchange has been completed, no further exchanges due to personal preference will be accepted from the same customer.',
          'This limitation does not apply to confirmed product defects, damaged shipments, incorrect items, or rights provided under applicable law.',
        ],
      },
      {
        heading: 'Shipping Costs for Exchanges Due to Personal Preference',
        level: 3,
        paragraphs: ['If your original order qualified for free shipping and you request an exchange due to personal preference, the following charges apply:'],
        list: ['The original shipping cost covered by Rfaheya.', 'The exchange shipping cost, calculated at 150% of the original shipping cost.'],
        after: [
          'Example: If the original shipping cost was EGP 100, the total shipping charge for the exchange will be EGP 250: EGP 100 for the original shipment and EGP 150 for the exchange shipment.',
          'Any applicable shipping charges will be communicated to you before the exchange is confirmed.',
          'These charges apply only to exchanges due to personal preference and do not apply to confirmed product defects or order errors attributable to Rfaheya.',
        ],
      },
      {
        heading: 'Damaged Shipments',
        paragraphs: [
          'If your fragrance arrives broken during shipping, please report the damage as soon as you receive the shipment.',
          'To help us assess the issue, please:',
        ],
        list: [
          'Photograph the shipping carton before taking any other action, whenever possible.',
          'Photograph any visible damage to the carton.',
          'Photograph any perfume leakage or liquid inside the carton.',
          'Photograph the broken bottle and its internal packaging.',
          'Send the photographs and your order number to Rfaheya customer service.',
        ],
        after: [
          'Please retain the shipping carton, internal packaging, and damaged product until our team advises you on the next steps.',
          'If you discover the damage only after opening the carton, document the condition as found and contact our team immediately.',
        ],
      },
      {
        heading: 'Incorrect Items',
        paragraphs: [
          'If you receive a fragrance different from the one you ordered, contact Rfaheya customer service with your order number and details of the discrepancy.',
          'Once the error is confirmed, you may choose one of the following options:',
        ],
        list: [
          'Refund: Receive a refund for the price of the incorrect fragrance.',
          'Correct Replacement: Have the correct fragrance sent to you at no additional shipping cost.',
        ],
        after: ['Rfaheya will cover the shipping costs associated with correcting a confirmed order error.'],
      },
      {
        heading: 'Refund Processing Time',
        level: 3,
        paragraphs: ['Approved refunds will be processed within 7 business days from the date the return request is approved.'],
      },
      {
        heading: 'Product Defects: Leakage or Faulty Atomizer',
        paragraphs: ['For the purposes of this policy, product defects are limited to the following physical issues:'],
        list: [
          'Fragrance Leakage: Actual leakage from the bottle or its closure.',
          'Faulty Atomizer: A physical malfunction that prevents the atomizer from dispensing the fragrance properly.',
        ],
        after: [
          'Dissatisfaction with a fragrance’s scent, projection, longevity, or overall wearing performance does not, by itself, constitute a physical product defect under this policy. Fragrance performance can vary depending on the fragrance composition, skin, application, and wearing conditions. Preference-based exchanges remain subject to the exchange conditions outlined above.',
        ],
      },
      {
        heading: 'Reporting Period',
        level: 3,
        paragraphs: ['Product defects must be reported within 14 days of receiving the product.'],
      },
      {
        heading: 'Inspection and Resolution',
        level: 3,
        paragraphs: [
          'The affected bottle must be returned to Rfaheya for inspection. Once the bottle has been received and the reported defect has been confirmed, you may choose one of the following options.',
        ],
      },
      {
        heading: 'Option 1 — Refund',
        level: 3,
        list: [
          'Receive a refund for the affected bottle.',
          'Receive reimbursement for the shipping cost you paid to send the defective bottle to Rfaheya.',
          'The refund will be processed within 7 business days from the date the return request is approved.',
        ],
      },
      {
        heading: 'Option 2 — Replacement',
        level: 3,
        list: [
          'Receive a replacement bottle at no additional product or shipping cost.',
          'Receive reimbursement for the shipping cost you paid to send the defective bottle to Rfaheya.',
        ],
        after: ['Please contact our customer service team before returning the product so we can confirm the return procedure.'],
      },
      {
        heading: 'Discovery Sizes and Fragrance Sets',
        paragraphs: ['To help you explore different fragrances before purchasing a full-size bottle, we offer the following discovery options, subject to availability:'],
        list: [
          '5 ML Fragrance: Try an individual fragrance in a smaller size.',
          '10 ML Fragrance: Explore an individual fragrance in a travel-friendly size.',
          'Candy Box: Choose 20 fragrances, each in a 5 ML bottle.',
          'Travel Size Box: A selection of 5 fragrances, each in a 10 ML bottle.',
        ],
        after: ['These options allow you to explore different scents before committing to a full-size purchase.'],
      },
      {
        heading: 'Need Help?',
        paragraphs: [
          'If you have questions about an exchange, damaged shipment, incorrect item, or product defect, please contact Rfaheya customer service with your order number.',
          'Our team will guide you through the applicable process and explain the next steps.',
          'Rfaheya — Speak Your Scent.',
        ],
      },
    ],
  },
  {
    slug: 'privacy',
    eyebrow: 'Legal',
    title: 'Privacy Policy',
    intro:
      'At Rfaheya, we respect your privacy and are committed to handling your personal information responsibly. This Privacy Policy explains what information we collect, how we use it, when it may be shared, and the choices available to you when using our website.',
    sections: [
      {
        heading: '1. Information We Collect',
        paragraphs: ['We may collect the following types of information:'],
        list: [
          'Contact and Delivery Information: Your name, mobile number, email address, shipping address, and any delivery instructions you provide when placing an order.',
          'Account Information: Details you provide when creating or managing an account on our website.',
          'Order Information: Products purchased, order details, and information needed to process and support your purchases.',
          'Communications: Information you provide when contacting us through our contact form, email, or other customer service channels.',
          'Website and Technical Information: Certain information about your device, browser, and website activity may be collected through cookies and similar technologies, depending on the tools and settings used on our website.',
          'Marketing Preferences: Information about whether you have subscribed to our newsletter or chosen to receive marketing communications.',
        ],
      },
      {
        heading: '2. How We Use Your Information',
        paragraphs: ['We use your information for purposes such as:'],
        list: [
          'Processing, confirming, and delivering your orders.',
          'Providing customer service and responding to your questions.',
          'Managing your account and order history.',
          'Handling exchange, return, refund, and product-related requests.',
          'Maintaining website functionality, security, and performance.',
          'Understanding how visitors use our website and improving the shopping experience, where applicable.',
          'Sending newsletters and promotional communications when you have subscribed or otherwise provided the required consent. You can unsubscribe from marketing emails at any time.',
        ],
      },
      {
        heading: '3. How We Share Your Information',
        paragraphs: [
          'We do not sell your personal information.',
          'We may share the information necessary for specific purposes with trusted service providers, including:',
        ],
        list: [
          'Delivery Companies: To deliver your orders and coordinate shipment.',
          'Website Hosting and Technical Providers: To operate, maintain, and secure our website.',
          'Analytics and Marketing Providers: Where enabled, to measure website performance, understand visitor activity, and support marketing campaigns.',
          'Professional or Public Authorities: Where disclosure is required by applicable law or is necessary to establish, exercise, or defend legal claims.',
        ],
        after: ['We aim to limit shared information to what is reasonably necessary for the relevant purpose.'],
      },
      {
        heading: '4. Cookies and Similar Technologies',
        paragraphs: [
          'Our website may use cookies and similar technologies to keep the shopping cart functioning, remember preferences, improve website performance, and, where enabled, measure traffic or marketing effectiveness.',
          'You can manage or disable cookies through your browser settings. However, disabling certain cookies may affect website functionality, including shopping cart and checkout features.',
          'Where required, we will seek the appropriate consent for non-essential cookies or tracking technologies.',
        ],
      },
      {
        heading: '5. How We Protect Your Information',
        paragraphs: [
          'We take reasonable technical and organizational measures to help protect your personal information against unauthorized access, misuse, loss, or disclosure.',
          'However, no website or electronic transmission can be guaranteed to be completely secure.',
        ],
      },
      {
        heading: '6. How Long We Keep Your Information',
        paragraphs: [
          'We retain personal information only for as long as reasonably necessary for the purposes described in this policy, including fulfilling orders, providing customer service, maintaining required business records, resolving disputes, and complying with applicable legal obligations.',
          'When information is no longer needed, we will take appropriate steps to delete it or otherwise handle it in accordance with applicable requirements.',
        ],
      },
      {
        heading: '7. Your Privacy Rights and Choices',
        paragraphs: [
          'Subject to applicable law, you may contact us to request access to your personal information, correction of inaccurate details, or deletion of information that we are no longer required or permitted to retain.',
          'You may also withdraw your consent to optional marketing communications at any time by using the unsubscribe link in our emails.',
          'To make a privacy-related request, please contact us using the details below. We may need to verify your identity before processing your request.',
        ],
      },
      {
        heading: '8. Third-Party Services and Websites',
        paragraphs: [
          'Our website may use third-party services or contain links to external websites. These services may process information under their own privacy policies.',
          'We encourage you to review the privacy policies of any third-party services or websites you use. Their privacy practices are not controlled by Rfaheya.',
        ],
      },
      {
        heading: '9. Updates to This Privacy Policy',
        paragraphs: [
          'We may update this Privacy Policy from time to time to reflect changes in our website, services, or applicable requirements. Any updated version will be published on this page with its revised effective date, where appropriate.',
        ],
      },
      {
        heading: '10. Contact Us',
        paragraphs: [
          'If you have any questions or requests regarding this Privacy Policy or your personal information, please contact us:',
          `Email: ${CONTACT.email}`,
          'Rfaheya — Speak Your Scent.',
        ],
      },
    ],
  },
]

/** Splits “Label: text” list items so the label can be shown in bold. */
export function splitLabel(item: string): [string, string] | null {
  const m = /^([^:.]{2,48}):\s(.+)$/.exec(item)
  return m ? [m[1], m[2]] : null
}

export function findContentPage(slug: string) {
  return contentPages.find((p) => p.slug === slug)
}
