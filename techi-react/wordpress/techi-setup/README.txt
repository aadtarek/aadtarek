TECHI — HEADLESS WOOCOMMERCE STOREFRONT (one zip)
=================================================
Same setup as Rfaheya: the React storefront sits in public_html next to WordPress
and talks to WooCommerce directly (Store API). No API keys, no Vercel, no .htaccess edits.

INSTALL (5 minutes)
1) Backup first (cPanel > Backup, or your host's backup).
2) cPanel > File Manager > public_html
   - Upload techi-site.zip > right-click > Extract (overwrite: yes).
   - It adds only these (nothing of WordPress is replaced):
       techi-app.html                     the storefront page
       techi-assets/  techi-img/          the storefront files and images
       wp-content/mu-plugins/techi.php    runs automatically (no activation)
       techi-setup/                       this file
3) Open the site. Done.

WHAT STAYS WITH WORDPRESS
   wp-admin, /wp-json (REST API), /my-account, payment pages
   (/checkout/order-pay, /checkout/order-received), wc-api callbacks, sitemaps, feeds.
   Everything else (/, /shop, /product/123, /bundles, /experience, /about,
   /checkout, /my-home) is the new storefront.
   Old product links (/product/slug/) redirect to the new product pages.

WOOCOMMERCE SETTINGS TO CHECK
   - General: Egypt, currency EGP, 0 decimals.
   - Payments: enable "Cash on delivery". Card payment (e.g. Paymob) works when its
     WooCommerce plugin is enabled: the customer is sent to its payment page.
   - Shipping zones: the shipping you set in WooCommerce is added to the order.
   - LiteSpeed Cache (if used): keep "Cache REST API" OFF.

CHECK
   https://techi-eg.com/wp-json/wc/store/v1/products   must show your products as JSON.
   Orders appear in WooCommerce > Orders (tagged _techi_source = techi-storefront).

SWITCH OFF / GO BACK TO THE OLD THEME
   Delete wp-content/mu-plugins/techi.php   (or add to wp-config.php:
   define( 'TECHI_STOREFRONT_OFF', true ); ). The old site is back immediately.

UPDATES
   Upload the new techi-site.zip and extract over the old one.
