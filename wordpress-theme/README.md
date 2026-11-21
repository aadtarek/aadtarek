# Pottery Hub — WordPress / WooCommerce theme

Upload `potteryhub.zip` in **Appearance → Themes → Add New → Upload Theme**, then activate.
Cart & checkout switch to the theme's design automatically on activation.

## One-click setup — Appearance → Pottery Hub
1. Cart & checkout design (already done on activation; run again if needed)
2. Arabic language for WordPress & WooCommerce
3. Arabic product & category names
4. About, Workshops, Contact & Journal pages (English + Arabic)
5. Branded order emails (colours + logo)
6. Delivery prices: Cairo & Giza / rest of Egypt
7. **Email delivery (SMTP)** — connect a real mailbox (e.g. Gmail with an App password) so order emails arrive; includes a "Send a test email" button and shows the last error if sending fails

Contact & workshop form messages and newsletter subscribers are listed on the same screen.

## Checkout
Asks for four things only: full name, phone (Egyptian number check), governorate (sets the delivery price) and full address. Country is always Egypt. Customers who don't log in give no email, so only the store gets the order email; logged-in customers also get a confirmation.

## Customize → Pottery Hub
Hero slides, promo banners, workshop section, footer & product texts, social links, **Contact details** (phone, WhatsApp, email, address, hours, map) — every text has an Arabic field.

## Arabic site
English: `example.com/shop/` · Arabic: `example.com/ar/shop/` (switch button in the header).
Each URL has one language, so page caching is safe and Google gets `hreflang` tags.
Arabic texts: product / category "Arabic name" fields, and the "Arabic version" box on pages and posts.

## Before going live — test on a staging copy
- Turn off WooCommerce "Coming soon" (WooCommerce → Settings → Site visibility) if it's on.
- Cache plugin (LiteSpeed / WP Rocket…): keep WooCommerce's default exclusions for cart, checkout and my-account.
- Place a test order (Cash on delivery) and check the email arrives.
- Card / wallet payments: install a gateway plugin such as Paymob.
- SEO: the theme prints basic description & sharing tags; an SEO plugin (Yoast / Rank Math) replaces them automatically.
