/* Vercel serverless function: live prices and stock from the public WooCommerce Store API.
   Needs only WC_URL. The site uses its built-in catalogue if this is not set or fails. */
export default async function handler(req, res) {
  const { WC_URL } = process.env;
  if (!WC_URL) return res.status(501).json({ error: "not_configured" });
  try {
    const out = [];
    for (let page = 1; page <= 5; page++) {
      const r = await fetch(`${WC_URL.replace(/\/$/, "")}/wp-json/wc/store/v1/products?per_page=100&page=${page}`);
      if (!r.ok) break;
      const list = await r.json();
      list.forEach((p) => {
        const minor = p.prices?.currency_minor_unit ?? 2, div = Math.pow(10, minor);
        out.push({ id: p.id, sale: Math.round(+p.prices.price / div), reg: Math.round(+(p.prices.regular_price || p.prices.price) / div), in_stock: !!p.is_in_stock });
      });
      if (list.length < 100) break;
    }
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=3600");
    return res.status(200).json(out);
  } catch (e) {
    return res.status(502).json({ error: "network" });
  }
}
