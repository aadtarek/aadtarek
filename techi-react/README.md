# Techi Smart Home — React storefront (headless WooCommerce)

موقع Techi: React 18 + Vite + GSAP + Lenis + Three.js، إنجليزي (الأساسي) وعربي.
الموقع بيشتغل جنب WordPress على نفس الدومين وبيكلّم WooCommerce مباشرة (Store API)، زي طريقة رفاهية.

## تشغيل على جهازك
```bash
npm install
npm run dev
```
من غير WordPress، الأسعار بتيجي من `src/data/products.js`، وإتمام الطلب بيتحوّل على واتساب.

## النشر على WordPress (techi-eg.com)
```bash
./wordpress/pack.sh
```
بيطلع `techi-site.zip`: فكّه في `public_html` من File Manager وخلاص.
الخطوات كاملة في `wordpress/techi-setup/README.txt`.

- `wordpress/wp-content/mu-plugins/techi.php` بيعرض الموقع على الدومين، ويسيب لـ WordPress:
  `wp-admin` و`wp-json` و`my-account` وصفحات الدفع.
- `src/lib/woo.js` بيجيب الأسعار والمخزون، ويعمل السلة والأوردر من خلال `/wp-json/wc/store/v1/`.
- أرقام المنتجات في `src/data/products.js` هي نفس IDs المنتجات في WooCommerce.

## تعديلات مهمة
- رقم الواتساب: `src/lib/util.js` → `WA_NUMBER`.
- المنتجات: `src/data/products.js` · الصور: `public/techi-img/`.
- النصوص: `src/data/i18n.js` و`src/data/i18n2.js`.

## الهيكل
- `src/pages/` الصفحات:
  - `Home` و`HeroRoom` (الأوضة الذكية في الهيرو)
  - `Pages` (المتجر، المنتج، الباقات، عن Techi)
  - `Tour` (البيت 3D)
  - `Checkout`
  - `MyHome` (التحكم في الأجهزة الحقيقية)
- `src/components/`:
  - `Chrome` (الهيدر، البريلودر، السلة، الفوتر)
  - `ui` (الكروت، الباقات، إطار الـ 3D)
  - `Icons`
- `src/lib/`:
  - `room3d.js` الأوضة التفاعلية في الهيرو
  - `home3d.js` الشقة الـ 3D
  - `bgmesh.js` خلفية الشبكة
  - `motion.js` الأنيميشن
  - `woo.js` WooCommerce
- `src/styles.css` كل الستايل.
