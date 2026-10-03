# Rfaheya on WordPress + WooCommerce

The storefront is still the React app. WordPress hosts it as a theme, and
WooCommerce supplies the products, cart, shipping, payments, orders, emails and
customer accounts through its Store API (`/wp-json/wc/store/v1/`).

Site: https://aquamarine-mole-770867.hostingersite.com

## Build the release files

```bash
SITE_URL=https://aquamarine-mole-770867.hostingersite.com npm run build:wp
```

This creates:

- `release/rfaheya-theme.zip`: the theme, containing the React build and the product images.
- `release/rfaheya-products.csv`: the product import. Its image URLs point at the theme on `SITE_URL`.

## One-time setup in wp-admin

1. **Plugins → Add New**: install and activate **WooCommerce**. You can skip the setup wizard.
2. **Settings → Permalinks**: choose **Post name** and save.
3. **WooCommerce → Settings → General**:
   - Store address country: **Egypt**.
   - Selling location: **Egypt**.
   - Currency: **Egyptian pound (EGP)**.
   - Thousand separator `,`, decimal separator `.`, number of decimals **0**.
4. **Appearance → Themes → Add New → Upload Theme**:
   - Upload `rfaheya-theme.zip`, then **Activate**.
   - Do this *before* importing products, because the CSV images are served from the theme.
5. **Products → Import**:
   - Upload `rfaheya-products.csv`.
   - Tick nothing else and click **Run the importer**.
   - Result: 4 variable products with 10 ML / 50 ML / 100 ML sizes, families as categories, notes and profile attributes.
6. **WooCommerce → Settings → Payments**:
   - Enable **Cash on delivery**.
   - Enable **Direct bank transfer**, rename its title to **InstaPay**, and put your InstaPay handle or number in its instructions.
7. **WooCommerce → Settings → Shipping → Add zone**:
   - Zone *Cairo & Alexandria* (regions: Cairo, Alexandria):
     - **Free shipping**, requiring a minimum order amount of 1000.
     - **Flat rate** of 70.
   - Zone *Egypt* (region: Egypt):
     - **Flat rate** of 70.
   - Keep **Free shipping** above **Flat rate** in the zone list. WooCommerce selects the first available rate, so orders of 1000+ ship free automatically.
8. **Appearance → Customize → Rfaheya Store**:
   - Email, phone, WhatsApp, hours, location, InstaPay details.
   - Instagram / TikTok / YouTube / Facebook links.

## How it fits together

- **Storefront routes**: every front-end URL (`/`, `/shop`, `/product/…`, `/checkout`, …) is rendered by the React app.
- **My Account**: `/my-account/` stays WooCommerce's own page (login, registration, orders, addresses), styled by the theme.
- **Cart and checkout**: these use the WooCommerce session cookie. Orders appear in **WooCommerce → Orders** and customers get WooCommerce's emails.
- **Gift messages**: these are added to the order note.
- **Nonces and caching**: Hostinger's LiteSpeed cache can serve a page with an expired Store API nonce. The app fetches a fresh one and retries automatically.
- **Managing content**: change prices, stock, images or products in WooCommerce and the site updates on the next page load. Reviews come from WooCommerce product reviews.

## Updating the design later

Run `npm run build:wp` again and upload the new `rfaheya-theme.zip` (WordPress
offers to replace the current theme). There is no need to re-import products.

## Local test without WordPress

```bash
npm run build:wp
node scripts/products-csv.mjs http://localhost:8080 > /tmp/p.csv
node scripts/mock-wp/server.mjs 8080 /tmp/p.csv
```

`scripts/mock-wp/server.mjs` simulates the Store API (cart, shipping zones,
COD/InstaPay checkout, an out-of-stock size, a stale nonce) for testing.
