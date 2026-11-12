import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useApp } from "../context.jsx";
import { Icon } from "../components/Icons.jsx";
import { BT, Money, TLink, Tag } from "../components/ui.jsx";
import { GOV_CODES } from "../data/i18n2.js";
import { WooError, placeOrder } from "../lib/woo.js";
import { byId, fmt, img, reduceMotion, waLink } from "../lib/util.js";
import { bgPlace, bgTo } from "../lib/motion.js";

const PHONE = /^01[0-25]\d{8}$/;
const read = (k, d) => { try { return JSON.parse(sessionStorage.getItem(k)) ?? d; } catch (e) { return d; } };
const write = (k, v) => { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

function orderText(t, f, cart, form) {
  let total = 0;
  const lines = cart.map((i) => { const p = byId[i.id]; total += p.sale * i.qty; return `• ${f.nm(p)} (${f.vr(p)}) × ${i.qty} = ${fmt(p.sale * i.qty)} ${t("cur")}`; });
  const who = form ? `\n\n${form.first} ${form.last}\n${form.phone}\n${t("govs")[form.gov] || ""} — ${form.city}\n${form.address}${form.install ? "\n✓ " + t("co_install") : ""}${form.notes ? "\n" + form.notes : ""}` : "";
  return `${t("order_hi")}\n${lines.join("\n")}\n\n${t("order_total")}: ${fmt(total)} ${t("cur")}${who}`;
}

function Field({ id, label, error, children }) {
  return (
    <label className={"fld" + (error ? " bad" : "")} htmlFor={id}>
      <span>{label}</span>{children}{error && <em role="alert">{error}</em>}
    </label>
  );
}

export function Checkout() {
  const { t, f, lang, cart, setQty, clearCart, go, bg, dir } = useApp();
  const root = useRef(null);
  const [form, setForm] = useState(() => read("techi-co", { first: "", last: "", phone: "", email: "", gov: 0, city: "", address: "", notes: "", install: true, pay: "cod" }));
  const [coupon, setCoupon] = useState("");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [fail, setFail] = useState("");
  const set = (k) => (e) => { const v = e.target.type === "checkbox" ? e.target.checked : e.target.value; setForm((x) => { const n = { ...x, [k]: v }; write("techi-co", n); return n; }); };

  useLayoutEffect(() => {
    const B = bg.current; if (B) { bgPlace(B, 0.7 * -dir, 0.3, 0.5); bgTo(B, { dim: 0.25 }); }
    if (reduceMotion()) return;
    const ctx = gsap.context(() => gsap.from(".co-col>*", { y: 40, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.06, delay: 0.15 }), root);
    return () => ctx.revert();
  }, []); // eslint-disable-line

  let sub = 0, saved = 0;
  cart.forEach((i) => { const p = byId[i.id]; sub += p.sale * i.qty; saved += (p.reg - p.sale) * i.qty; });

  const validate = () => {
    const e = {}, req = t("co_req");
    if (!form.first.trim()) e.first = req;
    if (!form.city.trim()) e.city = req;
    if (!form.address.trim()) e.address = req;
    if (!PHONE.test(form.phone.replace(/\D/g, ""))) e.phone = t("co_bad_phone");
    setErrors(e);
    if (Object.keys(e).length) { const first = root.current.querySelector(`#co-${Object.keys(e)[0]}`); first && first.focus(); }
    return !Object.keys(e).length;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setFail("");
    if (!cart.length || !validate()) return;
    setBusy(true);
    const payload = {
      lang, payment: form.pay, coupon,
      customer: { first: form.first, last: form.last, phone: form.phone.replace(/\D/g, ""), email: form.email, state: GOV_CODES[form.gov], city: form.city, address: form.address, notes: form.notes, install: form.install },
      items: cart.map((i) => ({ id: i.id, qty: i.qty })),
    };
    const text = orderText(t, f, cart, form);
    try {
      const data = await placeOrder({
        items: payload.items, customer: payload.customer, coupon: payload.coupon.trim(), payment: payload.payment,
        note: [form.install ? "يحتاج تركيب / Installation requested" : "", form.notes].filter(Boolean).join(" — "),
      });
      write("techi-last", { mode: "ok", number: data.number || data.id, text });
      clearCart();
      if (data.payment_url) { window.location.href = data.payment_url; return; }
      go("/order/received");
    } catch (e) {
      // no WooCommerce on this domain (e.g. a preview deploy): fall back to WhatsApp ordering
      if (!(e instanceof WooError) || e.code === "invalid_json" || e.status === 404) { write("techi-last", { mode: "wa", text }); clearCart(); go("/order/received"); return; }
      setFail(e.code === "coupon" ? e.message : t("co_err") + (e.message && e.code !== "error" ? " (" + e.message.replace(/<[^>]+>/g, "") + ")" : "")); setBusy(false);
    }
  };

  if (!cart.length) {
    return (
      <div className="co-page wrap" ref={root}>
        <div className="co-empty"><Icon name="bag" /><h1>{t("co_empty")}</h1><TLink className="btn btn-white" to="/shop"><BT>{t("hero_cta1")}</BT></TLink></div>
      </div>
    );
  }

  return (
    <div className="co-page wrap" ref={root}>
      <nav className="crumbs" aria-label="breadcrumb"><TLink to="/">{t("crumbs_home")}</TLink><span>/</span><span>{t("co_title")}</span></nav>
      <h1 className="co-h">{t("co_title")}</h1>
      <form className="co-grid" onSubmit={submit} noValidate>
        <div className="co-col">
          <fieldset className="co-box">
            <legend><span className="num">01</span>{t("co_contact")}</legend>
            <div className="row2">
              <Field id="co-first" label={t("co_first")} error={errors.first}><input id="co-first" autoComplete="given-name" value={form.first} onChange={set("first")} /></Field>
              <Field id="co-last" label={t("co_last")}><input id="co-last" autoComplete="family-name" value={form.last} onChange={set("last")} /></Field>
            </div>
            <div className="row2">
              <Field id="co-phone" label={t("co_phone")} error={errors.phone}><input id="co-phone" type="tel" inputMode="tel" dir="ltr" autoComplete="tel" placeholder="01xxxxxxxxx" value={form.phone} onChange={set("phone")} /></Field>
              <Field id="co-email" label={t("co_email")}><input id="co-email" type="email" dir="ltr" autoComplete="email" value={form.email} onChange={set("email")} /></Field>
            </div>
          </fieldset>

          <fieldset className="co-box">
            <legend><span className="num">02</span>{t("co_ship")}</legend>
            <div className="row2">
              <Field id="co-gov" label={t("co_gov")}><select id="co-gov" value={form.gov} onChange={set("gov")}>{t("govs").map((g, i) => <option key={i} value={i}>{g}</option>)}</select></Field>
              <Field id="co-city" label={t("co_city")} error={errors.city}><input id="co-city" autoComplete="address-level2" value={form.city} onChange={set("city")} /></Field>
            </div>
            <Field id="co-address" label={t("co_addr")} error={errors.address}><input id="co-address" autoComplete="street-address" value={form.address} onChange={set("address")} /></Field>
            <Field id="co-notes" label={t("co_notes")}><textarea id="co-notes" rows={2} value={form.notes} onChange={set("notes")} /></Field>
            <label className="chk" htmlFor="co-install"><input id="co-install" type="checkbox" checked={form.install} onChange={set("install")} /><span className="box"><Icon name="check" /></span><span>{t("co_install")}</span></label>
          </fieldset>

          <fieldset className="co-box">
            <legend><span className="num">03</span>{t("co_pay")}</legend>
            {[["cod", "co_cod", "co_cod_d"], ["card", "co_card", "co_card_d"]].map(([v, a, b]) => (
              <label key={v} className={"pay" + (form.pay === v ? " on" : "")} htmlFor={"co-pay-" + v}>
                <input id={"co-pay-" + v} type="radio" name="pay" value={v} checked={form.pay === v} onChange={set("pay")} />
                <span className="dot" /><span><b>{t(a)}</b><small>{t(b)}</small></span>
              </label>
            ))}
            <p className="co-secure"><Icon name="shield" />{t("co_secure")}</p>
          </fieldset>
        </div>

        <aside className="co-col co-sum">
          <div className="co-box sticky">
            <h2>{t("co_summary")}</h2>
            <ul className="co-items">
              {cart.map((i) => { const p = byId[i.id]; return (
                <li key={p.id}>
                  <span className="ci-img"><img src={img(p)} alt="" /><b className="num">{i.qty}</b></span>
                  <span className="ci-txt"><b>{f.nm(p)}</b><small>{f.vr(p)}</small>
                    <span className="q"><button type="button" aria-label={t("qty_less")} onClick={() => setQty(p.id, i.qty - 1)}>−</button><span className="num">{i.qty}</span><button type="button" aria-label={t("qty_more")} onClick={() => setQty(p.id, i.qty + 1)}>+</button></span></span>
                  <span className="ci-pr num">{fmt(p.sale * i.qty)}</span>
                </li>); })}
            </ul>
            <div className="co-coupon"><input aria-label={t("co_coupon")} placeholder={t("co_coupon")} value={coupon} onChange={(e) => setCoupon(e.target.value)} dir="ltr" /></div>
            <dl className="co-tot">
              <div><dt>{t("co_sub")}</dt><dd className="num"><Money n={sub} /></dd></div>
              {saved > 0 && <div className="sv"><dt>{t("saved")}</dt><dd className="num">{fmt(saved)} {t("cur")}</dd></div>}
              <div><dt>{t("co_shipping")}</dt><dd>{t("co_shipping_v")}</dd></div>
              <div className="tt"><dt>{t("co_total")}</dt><dd className="num"><Money n={sub} /></dd></div>
            </dl>
            {fail && <p className="co-fail" role="alert">{fail}</p>}
            <button className="btn btn-white co-place" type="submit" disabled={busy}>{busy ? t("co_placing") : <><BT>{t("co_place")}</BT><Icon name="arrow" /></>}</button>
            <a className="co-wa" href={waLink(orderText(t, f, cart, form))} target="_blank" rel="noopener"><Icon name="wa" />{t("co_wa_alt")}</a>
          </div>
        </aside>
      </form>
    </div>
  );
}

export function OrderReceived() {
  const { t } = useApp();
  const [last] = useState(() => read("techi-last", null));
  const root = useRef(null);
  useLayoutEffect(() => {
    if (reduceMotion()) return;
    const ctx = gsap.context(() => gsap.from(".ok-card>*", { y: 30, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.08, delay: 0.2 }), root);
    return () => ctx.revert();
  }, []);
  const wa = !last || last.mode === "wa";
  return (
    <div className="co-page wrap" ref={root}>
      <div className="ok-card">
        <span className={"ok-ico" + (wa ? " wa" : "")}><Icon name={wa ? "wa" : "check"} /></span>
        <Tag>Techi</Tag>
        <h1>{wa ? t("ok_wa_title") : t("ok_title")}</h1>
        <p>{wa ? t("ok_wa_p") : t("ok_p")}</p>
        {!wa && last.number && <div className="ok-num"><span>{t("ok_num")}</span><b className="num">#{last.number}</b></div>}
        <div className="ok-acts">
          {wa && last && <a className="btn btn-wa" href={waLink(last.text)} target="_blank" rel="noopener"><Icon name="wa" /><BT>{t("ok_wa_btn")}</BT></a>}
          <TLink className="btn btn-line" to="/shop"><BT>{t("ok_back")}</BT></TLink>
        </div>
      </div>
    </div>
  );
}
