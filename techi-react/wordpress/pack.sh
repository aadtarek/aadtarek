#!/usr/bin/env bash
# Builds the storefront and packs techi-site.zip for public_html (headless WooCommerce).
set -e
cd "$(dirname "$0")/.."
npx vite build
OUT=wordpress/build; rm -rf "$OUT"; mkdir -p "$OUT"
cp dist/index.html "$OUT/techi-app.html"
cp -r dist/techi-assets dist/techi-img "$OUT/"
cp -r wordpress/wp-content wordpress/techi-setup "$OUT/"
rm -f techi-site.zip; (cd "$OUT" && zip -qr ../../techi-site.zip .)
rm -rf "$OUT"
echo "techi-site.zip ready"
