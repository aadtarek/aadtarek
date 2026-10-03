# Rfaheya: headless WordPress + WooCommerce on one domain

WordPress and the storefront live in the same `public_html`
(`aquamarine-mole-770867.hostingersite.com`). There is no theme, no separate
hosting and no CORS. `.htaccess` decides who answers each URL.

```
public_html/
  .htaccess                       ← DirectoryIndex index.html index.php + routing
  index.html  assets/  import/    ← the storefront
  index.php  wp-admin/  wp-content/  wp-includes/ …   ← WordPress as usual
```

WooCommerce is the backend: products, stock, prices, shipping, payments,
orders, customer accounts and emails. The storefront reads and writes through the WooCommerce Store API
(`/wp-json/wc/store/v1/`). The cart session is kept in WooCommerce's
`Cart-Token` header, so page caching can't break it.

## Release file

```bash
npm run release
```

This writes **one** file, `release/rfaheya-public_html.zip`. It mirrors `public_html`, so extracting it there puts everything in place:

| In the zip | What it is |
| --- | --- |
| `index.html`, `assets/`, `import/` | the storefront (product images for the import are in `import/`) |
| `.htaccess` | routing between the storefront and WordPress |
| `wp-content/mu-plugins/rfaheya.php` | store settings page + no postcode for Egypt; runs automatically |
| `rfaheya-setup/rfaheya-products.csv` | WooCommerce product import |
| `rfaheya-setup/README.txt` | these steps, short version |

`.env.headless` sets `VITE_WP_URL=/` (WordPress on the same domain) and
`SITE_URL` (used for the image links in the CSV).

## Setup

1. **WooCommerce**:
   - Plugins → Add New: install and activate WooCommerce. You can skip the wizard.
2. **Permalinks**:
   - Settings → Permalinks: choose **Post name** and save.
   - The Store API needs pretty permalinks.
3. **File Manager → public_html**:
   - Delete the old storefront files (`index.html`, `assets/`). Leave WordPress's files alone.
   - Upload `rfaheya-public_html.zip` and **Extract** it right there, overwriting.
   - If your `.htaccess` had other blocks (e.g. LiteSpeed Cache), add them back below the Rfaheya block.
   - The mu-plugin runs automatically, with nothing to activate. It provides:
     - **Settings → Rfaheya Store**: contact details, InstaPay address, social links;
     - no postcode for Egyptian addresses.
4. **WooCommerce → Settings → General**:
   - Country **Egypt**, sell to **Egypt**.
   - Currency **EGP**, **0** decimals.
5. **Products → Import**:
   - Download `rfaheya-setup/rfaheya-products.csv` from File Manager, choose it here → Run the importer. You can delete `rfaheya-setup/` afterwards.
   - Images are pulled from `/import/`, so step 3 must be done first.
6. **Payments**:
   - Enable **Cash on delivery**.
   - Enable **Direct bank transfer**, titled **InstaPay**, with your InstaPay details.
7. **Shipping**:
   - Zone *Cairo & Alexandria*:
     - **Free shipping** (minimum order 1000), listed first.
     - **Flat rate** 70.
   - Zone *Egypt*:
     - **Flat rate** 70.
8. **Caching**: in LiteSpeed Cache, keep *Cache REST API* off, or exclude `/wp-json/wc/store/`.

## What you edit where

Everything on the storefront comes from WordPress. Once, click **Settings → Rfaheya Store → Import starter content**. It copies the built-in articles, pages, FAQs, home texts and images into WordPress, and fills each product's details box from its attributes. It is safe to run again: existing content is left untouched.

| On the storefront | In WordPress |
| --- | --- |
| Journal (`/journal`) | **Posts**: title, featured image, content, category, excerpt |
| Info pages (`/shipping`, `/returns`, any `/page-slug`) | **Pages**: the excerpt is the intro, and the "Storefront" box sets the section label. Pages with the same label are listed as Related. |
| FAQs (`/faqs`, Contact) | **FAQs**: the question is the title, the answer is the content, and Order sets the order |
| Announcement bar, hero text and image | **Settings → Rfaheya Store → Home page** |
| Contact details, InstaPay, social links | **Settings → Rfaheya Store** |
| Fragrance families (name, tagline, image) | **Products → Categories**: description and thumbnail |
| Products, sizes, prices, stock, gallery | **Products** (variations) |
| Inspired by, accords, notes, Finder profile | **Product edit → "Rfaheya details"** box. Empty fields fall back to the attributes. |
| Reviews | **Products → Reviews** |
| Images in any of the above | **Media** |

## Updating the storefront

Run `npm run release`. In File Manager, delete `index.html` and `assets/`, then upload and extract the new `rfaheya-public_html.zip`.
WordPress and the products are untouched.

## What goes where (`.htaccess`)

| URL | Served by |
| --- | --- |
| `/`, `/shop`, `/product/…`, `/collections/…`, `/finder…`, `/checkout`, `/checkout/order-received/…`, any other page | storefront (`index.html`) |
| `/wp-admin`, `/wp-login.php`, `/wp-content/…`, real files | as-is |
| `/wp-json/…`, `/my-account/…`, `/checkout/order-pay/…`, `/wc-api/…`, `/wp-sitemap…`, `/feed`, `?rest_route=`, `?wc-ajax=`, `?p=`, `?preview=`, `?s=` | WordPress |

To keep another WordPress path (for example a blog at `/blog`), add it to the
"WordPress pages" rule in the Rfaheya block.

- **My Account**: the storefront's account icon opens WooCommerce's My Account (sign in, orders, addresses).
- **Online card gateways** (if you add one later): they use `/checkout/order-pay/…` on WordPress, then return to the storefront's order confirmation.

## Developing and testing

```bash
npm run dev            # demo data, no WordPress
```

`scripts/mock-wp/` tests the whole setup locally with real Apache and the real
`.htaccess`:

- `server.mjs` stands in for WordPress/WooCommerce. It provides:
  - the Store API with Cart-Token sessions;
  - shipping zones;
  - COD/InstaPay checkout;
  - the settings endpoint.
- `apache-test.sh` builds a fake `public_html` (the storefront + `.htaccess` + an `index.php` that forwards to the mock) and serves it on :8090.

```bash
npm run build:headless && SITE_URL=http://localhost:8090 node scripts/package-release.mjs
unzip -p release/rfaheya-public_html.zip rfaheya-setup/rfaheya-products.csv > /tmp/p.csv
node scripts/mock-wp/server.mjs 8080 /tmp/p.csv http://localhost:8090 &
scripts/mock-wp/apache-test.sh
```
