/* WooCommerce Store API, same origin (headless WordPress, the Rafaheya way).
   The storefront lives in public_html next to WordPress, so it talks to
   /wp-json/wc/store/v1/ directly: no API keys, no server in between.
   A Cart-Token (kept in localStorage) + the Nonce header identify the cart. */

const BASE = (import.meta.env.VITE_WC_URL || "").replace(/\/+$/, "");
const STORE = `${BASE}/wp-json/wc/store/v1/`;
const TOKEN_KEY = "techi.cartToken";

let token = (() => { try { return localStorage.getItem(TOKEN_KEY) || ""; } catch (e) { return ""; } })();
let nonce = "";
const setToken = (t) => { token = t; try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch (e) {} };

export class WooError extends Error {
  constructor(msg, code, status) { super(msg); this.code = code; this.status = status; }
}

async function raw(path, opt = {}) {
  const headers = { Accept: "application/json" };
  if (opt.body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers["Cart-Token"] = token;
  if (nonce) headers.Nonce = nonce;
  const r = await fetch(STORE + path.replace(/^\//, ""), {
    method: opt.method || "GET", credentials: "same-origin", headers,
    body: opt.body === undefined ? undefined : JSON.stringify(opt.body),
  });
  const t = r.headers.get("Cart-Token"); if (t && t !== token) setToken(t);
  const n = r.headers.get("Nonce"); if (n) nonce = n;
  const text = await r.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { throw new WooError("not_woocommerce", "invalid_json", r.status); }
  if (!r.ok) throw new WooError((data && data.message) || `HTTP ${r.status}`, (data && data.code) || "error", r.status);
  return data;
}

/* retry once with a fresh cart when the token / nonce went stale */
async function api(path, opt = {}) {
  try { return await raw(path, opt); }
  catch (e) {
    if (e instanceof WooError && /nonce|cart_token/i.test(e.code) && (opt.method || "GET") !== "GET") { setToken(""); await raw("cart"); return raw(path, opt); }
    throw e;
  }
}

const money = (v, minor = 2) => Math.round((parseInt(v || "0", 10) || 0) / Math.pow(10, minor));

/* live prices + stock for every product */
export async function fetchPrices() {
  const out = [];
  for (let page = 1; page <= 5; page++) {
    const list = await raw(`products?per_page=100&page=${page}`);
    if (!Array.isArray(list)) break;
    list.forEach((p) => {
      const m = p.prices?.currency_minor_unit ?? 2;
      out.push({ id: p.id, sale: money(p.prices?.price, m), reg: money(p.prices?.regular_price || p.prices?.price, m), in_stock: !!p.is_in_stock });
    });
    if (list.length < 100) break;
  }
  return out;
}

/* place an order: fresh cart -> items -> coupon -> checkout */
export async function placeOrder({ items, customer: c, coupon, payment, note }) {
  setToken(""); nonce = "";
  let cart = await raw("cart"); // new empty cart, gives Cart-Token + Nonce
  for (const it of items) cart = await api("cart/add-item", { method: "POST", body: { id: it.id, quantity: it.qty } });
  if (coupon) {
    try { cart = await api("cart/apply-coupon", { method: "POST", body: { code: coupon } }); }
    catch (e) { throw new WooError(e.message, "coupon", e.status); }
  }
  const methods = (cart.payment_methods || []).map((m) => (typeof m === "string" ? m : m.name));
  const card = methods.find((m) => !["cod", "bacs", "cheque"].includes(m));
  const method = payment === "card" && card ? card : methods.includes("cod") ? "cod" : methods[0];
  if (!method) throw new WooError("no payment method", "no_payment", 0);
  const phone = c.phone;
  const address = {
    first_name: c.first, last_name: c.last || "-", address_1: c.address, address_2: "", city: c.city,
    state: c.state || "", postcode: "", country: "EG", phone,
  };
  const order = await api("checkout", {
    method: "POST",
    body: {
      billing_address: { ...address, email: c.email || `${phone}@guest.techi-eg.com` },
      shipping_address: address,
      customer_note: note || "",
      payment_method: method,
      payment_data: [],
    },
  });
  setToken(""); // order placed: next visit starts a new cart
  const redirect = order.payment_result?.redirect_url || "";
  return {
    id: order.order_id, number: order.order_number || order.order_id, status: order.status,
    // card gateways send the customer to pay; cash on delivery stays on the storefront
    payment_url: method !== "cod" && redirect && !/order-received/.test(redirect) ? redirect : null,
  };
}
