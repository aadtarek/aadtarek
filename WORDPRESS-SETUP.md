# Rfaheya — headless WordPress + WooCommerce

```
 Customers ──► Storefront (React, static)          WordPress + WooCommerce
               Vercel / Netlify / any host  ──API──►  aquamarine-mole-770867.hostingersite.com
               /, /shop, /product/…, /checkout        wp-admin, Store API, My Account, emails
```

- **WordPress** is the backend only: products, stock, prices, shipping zones, payment methods, orders, customer accounts and emails.
- **The storefront** is the React app, deployed on its own. It reads and writes through the WooCommerce Store API (`/wp-json/wc/store/v1/`).
- **Cart session**: kept in WooCommerce's `Cart-Token` header. No cookies are involved, so it works across domains.
- **Rfaheya Headless plugin** (small companion plugin):
  - lets the Store API's cart headers through CORS;
  - serves contact details and social links to the storefront (`/wp-json/rfaheya/v1/settings`);
  - ships the product images used by the import;
  - redirects anyone opening a WordPress front-end page to the storefront.
  - These still open on WordPress: wp-admin, My Account and payment pages.

## Release files

```bash
npm run release
```

This uses `VITE_WP_URL` from `.env.headless` (currently `https://aquamarine-mole-770867.hostingersite.com`) and writes:

| File | What it is |
| --- | --- |
| `release/rfaheya-headless.zip` | the WordPress plugin |
| `release/rfaheya-products.csv` | WooCommerce product import |
| `release/rfaheya-storefront.zip` | the built storefront, ready for any static host |

## 1. WordPress (backend)

1. **Plugins → Add New**: install and activate **WooCommerce**. You can skip the setup wizard.
2. **Plugins → Add New → Upload Plugin**: upload `rfaheya-headless.zip` and activate it.
3. **Settings → Permalinks**: choose **Post name** and save. The Store API needs pretty permalinks.
4. **WooCommerce → Settings → General**:
   - Country **Egypt**.
   - Sell to **Egypt**.
   - Currency **EGP**.
   - Thousand separator `,`, decimal separator `.`, number of decimals **0**.
5. **Products → Import**: upload `rfaheya-products.csv` and click **Run the importer**.
   - Result: 4 variable products with 10 ML / 50 ML / 100 ML sizes, families as categories, notes and profile attributes.
6. **WooCommerce → Settings → Payments**:
   - Enable **Cash on delivery**.
   - Enable **Direct bank transfer**, rename its title to **InstaPay**, and put your InstaPay details in its instructions.
7. **WooCommerce → Settings → Shipping**:
   - Zone *Cairo & Alexandria* (regions: Cairo, Alexandria):
     - **Free shipping** with a minimum order amount of 1000, listed first.
     - **Flat rate** of 70.
   - Zone *Egypt* (region: Egypt):
     - **Flat rate** of 70.
8. **Settings → Rfaheya Headless**:
   - Contact details, InstaPay address and social links.
   - The **Storefront URL**, once the storefront is deployed (step 2 below). From then on, opening the WordPress site's pages sends visitors to the storefront.
9. **Caching (Hostinger)**: if LiteSpeed Cache is active, make sure *Cache REST API* stays **off**, or exclude `/wp-json/wc/store/`. Cart responses must never be cached.

## 2. Storefront (frontend)

Pick one.

- **Vercel or Netlify (recommended)**:
  - Import the Git repository. `vercel.json` / `netlify.toml` already set the build command (`npm run build:headless`) and the SPA rewrites.
  - To point at a different WordPress, set the environment variable `VITE_WP_URL`.
- **Any static host** (e.g. a Hostinger subdomain or second site):
  - Upload the contents of `rfaheya-storefront.zip` to its `public_html`.
  - The included `.htaccess` makes deep links like `/shop` work.

Then put the storefront's address in **Settings → Rfaheya Headless → Storefront URL**.

## How the pieces connect

- **Catalog**: prices, sizes, stock, images and reviews come from WooCommerce on every page load. Edit a product in wp-admin and the storefront shows it on the next load.
- **Checkout**:
  - The storefront sends the address to WooCommerce, which picks the shipping rate from your zones and places the order with the chosen payment method.
  - Orders appear in **WooCommerce → Orders**, and WooCommerce sends its emails.
  - Gift messages are added to the order note.
- **Online card gateways** (if you add one later): the customer pays on WordPress's payment page and returns to the storefront's order confirmation. The plugin handles the redirect.
- **My Account**: the storefront's account icon opens WooCommerce's My Account on the WordPress site (sign in, orders, addresses).

## Developing

```bash
npm run dev            # demo data, no WordPress
npm run dev:headless   # live data from VITE_WP_URL
```

`scripts/mock-wp/server.mjs` is a local stand-in for the headless backend. It provides:

- the Store API with CORS and Cart-Token sessions;
- shipping zones and COD/InstaPay checkout;
- an out-of-stock size;
- an expired-session check.

It's used for end-to-end tests without a real site:

```bash
node scripts/products-csv.mjs http://localhost:8080 > /tmp/p.csv
node scripts/mock-wp/server.mjs 8080 /tmp/p.csv http://localhost:4174
VITE_WP_URL=http://localhost:8080 npx vite build --mode headless --outDir dist-woo
npx vite preview --port 4174 --outDir dist-woo
```
