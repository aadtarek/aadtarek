# Rfaheya: headless WordPress + WooCommerce on one domain

WordPress and the storefront live in the same `public_html`
(`aquamarine-mole-770867.hostingersite.com`). There is no theme, no separate
hosting and no CORS. `.htaccess` decides who answers each URL.

```
public_html/
  .htaccess                       ← DirectoryIndex index.html index.php + routing
  index.html  assets/  import/    ← the storefront (contents of dist.zip)
  index.php  wp-admin/  wp-content/  wp-includes/ …   ← WordPress as usual
```

WooCommerce is the backend: products, stock, prices, shipping, payments,
orders, customer accounts and emails. The storefront reads and writes through the WooCommerce Store API
(`/wp-json/wc/store/v1/`). The cart session is kept in WooCommerce's
`Cart-Token` header, so page caching can't break it.

## Release files

```bash
npm run release
```

| File | Where it goes |
| --- | --- |
| `release/dist.zip` | extract into `public_html` (index.html, assets/, import/ next to WordPress) |
| `release/htaccess.txt` | contents of `public_html/.htaccess` |
| `release/rfaheya.php` | `public_html/wp-content/mu-plugins/rfaheya.php` |
| `release/rfaheya-products.csv` | Products → Import |

`.env.headless` sets `VITE_WP_URL=/` (WordPress on the same domain) and
`SITE_URL` (used for the image links in the CSV).

## Setup

1. **WooCommerce**:
   - Plugins → Add New: install and activate WooCommerce. You can skip the wizard.
2. **Permalinks**:
   - Settings → Permalinks: choose **Post name** and save.
   - The Store API needs pretty permalinks.
3. **File Manager → public_html**:
   - Upload `dist.zip` and **Extract** it right there. You should now have `public_html/index.html`, `assets/` and `import/` next to WordPress's files. Remove any old storefront files first.
   - Open `.htaccess` (enable "show hidden files"). Replace its contents with `htaccess.txt`. If it has other blocks (e.g. LiteSpeed Cache), keep them below.
   - Create the folder `wp-content/mu-plugins` if it doesn't exist and upload `rfaheya.php` into it. It runs automatically, with nothing to activate. It provides:
     - **Settings → Rfaheya Store**: contact details, InstaPay address, social links;
     - no postcode for Egyptian addresses.
4. **WooCommerce → Settings → General**:
   - Country **Egypt**, sell to **Egypt**.
   - Currency **EGP**, **0** decimals.
5. **Products → Import**:
   - Upload `rfaheya-products.csv` → Run the importer.
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

## Updating the storefront

Run `npm run release`. In File Manager, delete `index.html` and `assets/`, then upload and extract the new `dist.zip`.
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
node scripts/mock-wp/server.mjs 8080 release/rfaheya-products.csv http://localhost:8090 &
scripts/mock-wp/apache-test.sh
```
