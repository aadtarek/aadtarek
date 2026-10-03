RFAHEYA — HEADLESS WOOCOMMERCE (one zip)
========================================

1) WordPress:
   - Install + activate WooCommerce.
   - Settings > Permalinks > "Post name" > Save.

2) File Manager > public_html:
   - Delete the old storefront files (index.html, assets/). Don't touch WordPress files.
   - Upload rfaheya-public_html.zip > Extract here (overwrite).
     It adds:
       - the storefront: index.html, assets/, import/
       - .htaccess
       - wp-content/mu-plugins/rfaheya.php (store settings; runs automatically)
       - rfaheya-setup/ (this file + the products CSV)

3) WooCommerce > Settings > General:
   - Country Egypt, sell to Egypt.
   - Currency EGP, 0 decimals.

4) Products > Import:
   - Download rfaheya-setup/rfaheya-products.csv from File Manager, choose it, Run the importer.

5) Payments:
   - Enable Cash on delivery.
   - Enable Direct bank transfer, with the title "InstaPay".

6) Shipping:
   - Zone "Cairo & Alexandria": Free shipping (minimum 1000) first, then Flat rate 70.
   - Zone "Egypt": Flat rate 70.

7) Settings > Rfaheya Store:
   - Contact details, InstaPay, social links, home page texts and hero image.
   - Click "Import starter content" once: it copies the storefront's articles,
     pages, FAQs and images into WordPress so you can edit them.

What you edit where:
   - Articles (Journal)      > Posts (title, featured image, content, category)
   - Info pages (/shipping…) > Pages (excerpt = intro, "Storefront" box = section label)
   - FAQs                    > FAQs
   - Home page               > Settings > Rfaheya Store
   - Fragrance families      > Products > Categories (description + thumbnail)
   - Product extras          > Product edit > "Rfaheya details" box
   - Reviews                 > Products > Reviews

8) LiteSpeed Cache: keep "Cache REST API" off.

You can delete the rfaheya-setup folder after importing.

Check: https://YOUR-DOMAIN/wp-json/wc/store/v1/products should show your products as JSON.
