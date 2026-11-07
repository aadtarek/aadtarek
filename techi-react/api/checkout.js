/* Vercel serverless function: creates the order in WooCommerce.
   Set these in Vercel → Project → Settings → Environment Variables:
     WC_URL          https://techi-eg.com
     WC_KEY          ck_...   (WooCommerce → Settings → Advanced → REST API, Read/Write)
     WC_SECRET       cs_...
     WC_CARD_GATEWAY optional: the WooCommerce gateway id for online card payment (e.g. "paymob")
   Keys stay on the server; the browser never sees them. Prices come from WooCommerce, not from the browser. */

const PHONE = /^01[0-25]\d{8}$/;
const clean = (v, n = 200) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);

export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "method" }); }
  const { WC_URL, WC_KEY, WC_SECRET, WC_CARD_GATEWAY } = process.env;
  if (!WC_URL || !WC_KEY || !WC_SECRET) return res.status(501).json({ error: "not_configured" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { return res.status(400).json({ error: "bad_json" }); } }
  const c = body?.customer || {};
  const items = Array.isArray(body?.items) ? body.items : [];
  const phone = clean(c.phone, 20).replace(/\D/g, "");
  const line_items = items
    .map((i) => ({ product_id: parseInt(i.id, 10), quantity: Math.min(50, Math.max(1, parseInt(i.qty, 10) || 0)) }))
    .filter((i) => Number.isInteger(i.product_id) && i.product_id > 0)
    .slice(0, 40);
  if (!line_items.length) return res.status(400).json({ error: "empty" });
  if (!clean(c.first) || !clean(c.address) || !clean(c.city) || !PHONE.test(phone)) return res.status(400).json({ error: "invalid" });

  const card = body.payment === "card" && WC_CARD_GATEWAY;
  const address = {
    first_name: clean(c.first, 60), last_name: clean(c.last, 60),
    address_1: clean(c.address, 250), city: clean(c.city, 80), state: clean(c.state, 10), country: "EG",
    phone,
  };
  const order = {
    payment_method: card ? WC_CARD_GATEWAY : "cod",
    payment_method_title: card ? "Card" : "Cash on delivery",
    set_paid: false,
    status: card ? "pending" : "processing",
    billing: { ...address, email: /^\S+@\S+\.\S+$/.test(c.email || "") ? clean(c.email, 120) : undefined },
    shipping: address,
    line_items,
    customer_note: clean([c.install ? "يحتاج تركيب / Installation requested" : "", c.notes].filter(Boolean).join(" — "), 1000),
    coupon_lines: clean(body.coupon, 40) ? [{ code: clean(body.coupon, 40) }] : [],
    meta_data: [{ key: "_techi_source", value: "techi-react" }, { key: "_techi_lang", value: clean(body.lang, 4) }],
  };

  try {
    const r = await fetch(`${WC_URL.replace(/\/$/, "")}/wp-json/wc/v3/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Basic " + Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64") },
      body: JSON.stringify(order),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(502).json({ error: "woocommerce", code: data?.code, message: data?.message });
    return res.status(200).json({ id: data.id, number: data.number, total: data.total, currency: data.currency, payment_url: card ? data.payment_url : null });
  } catch (e) {
    return res.status(502).json({ error: "network" });
  }
}
