# Techi Smart Home — React (Vite)

موقع Techi: React 18 + Vite + GSAP + Lenis + Three.js، عربي وإنجليزي.

## تشغيل على جهازك
```bash
npm install
npm run dev
```

## النشر على Vercel
1. ادخل vercel.com → **Add New → Project** → اختار الريبو `aadtarek/aadtarek`.
2. في **Root Directory** اختار `techi-react`.
3. Vercel هيعرف إنه Vite لوحده (Build: `npm run build` · Output: `dist`) → **Deploy**.
4. الدومين: Project → Settings → Domains → ضيف `techi-eg.com` أو `new.techi-eg.com` واتبع سجلات الـ DNS اللي هيطلبها.

`vercel.json` بيخلي أي لينك زي `/shop` أو `/product/231855` يفتح مباشرة.

## تعديلات مهمة
- رقم الواتساب: `src/lib/util.js` → `WA_NUMBER`.
- المنتجات والأسعار: `src/data/products.js`.
- النصوص العربي والإنجليزي: `src/data/i18n.js`.
- الصور: `public/img/`.

## الهيكل
- `src/pages/` الصفحات (الرئيسية، المتجر، المنتج، الباقات، البيت 3D، عن Techi)
- `src/components/` الهيدر، السلة، الكروت، إطار الـ 3D، الأيقونات
- `src/lib/home3d.js` الشقة الـ 3D · `src/lib/bgmesh.js` خلفية شبكة اللوجو · `src/lib/motion.js` الأنيميشن

## ربط المتجر بـ WooCommerce (WordPress)
أرقام المنتجات في `src/data/products.js` هي نفس IDs المنتجات في WooCommerce، فالطلبات بتتسجل على نفس المنتجات.

1. في WordPress: **WooCommerce → Settings → Advanced → REST API → Add key**، الصلاحية **Read/Write**.
2. في Vercel: **Project → Settings → Environment Variables** ضيف:
   - `WC_URL` = `https://techi-eg.com`
   - `WC_KEY` = `ck_...`
   - `WC_SECRET` = `cs_...`
   - `WC_CARD_GATEWAY` (اختياري) = ID بوابة الدفع بالكارت في WooCommerce، مثلًا `paymob`
3. اعمل **Redeploy**.

بعدها:
- `/api/checkout` بيعمل الأوردر في WooCommerce (الدفع عند الاستلام → حالة Processing، الكارت → بيحوّل العميل لصفحة الدفع).
- `/api/products` بيجيب الأسعار والمخزون الحالية من المتجر، فأي تعديل سعر في WordPress بيظهر في الموقع.
- المفاتيح بتفضل على السيرفر ومش بتوصل للمتصفح، والأسعار في الأوردر بتتحسب من WooCommerce نفسه.

لو المتغيرات دي مش متظبطة، صفحة إتمام الطلب بتحوّل الطلب على واتساب بدل ما يضيع.
لتجربة الـ API على جهازك: `npx vercel dev` بدل `npm run dev`.
