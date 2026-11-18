import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useApp } from "../context.jsx";
import { Icon, CAT_ICON } from "./Icons.jsx";
import { fmt, img, isFine, off, pad, reduceMotion, waLink } from "../lib/util.js";

/* link that plays the page transition */
export function TLink({ to, children, onClick, ...rest }) {
  const { go } = useApp();
  return (
    <a href={to} {...rest} onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return; e.preventDefault(); onClick && onClick(e); go(to); }}>
      {children}
    </a>
  );
}

export const Tag = ({ children, led = true }) => <span className="tag">{led && <i className="led" />}{children}</span>;
export const BT = ({ children }) => <span className="bt"><span>{children}</span><span>{children}</span></span>;

/* masked word-by-word heading */
export function Split({ as: As = "h2", text, className, ...rest }) {
  const parts = String(text).split(/(\s+)/);
  return (
    <As className={"split " + (className || "")} data-split="" {...rest}>
      {parts.map((w, i) => (/^\s+$/.test(w) || !w ? w : <span className="w" key={i}><span>{w}</span></span>))}
    </As>
  );
}

export function Money({ n }) {
  const { t } = useApp();
  return <>{fmt(n)}<span className="cur-l">{t("cur")}</span></>;
}

export function AddButton({ id, qty = 1, className = "btn btn-white", children }) {
  const { addToCart } = useApp();
  return <button className={className} data-qty={qty} onClick={(e) => addToCart(id, qty, e.currentTarget)}>{children}</button>;
}

/* product tile: white stage, clear name & price, add-to-cart always visible */
export function ProductCard({ p }) {
  const { t, f, addToCart, cart } = useApp();
  const [done, setDone] = useState(false);
  const o = off(p), alt = p.imgs.length > 1, inCart = cart.some((i) => i.id === p.id), out = p.inStock === false;
  return (
    <article className={"pcard" + (alt ? " has-alt" : "")} data-id={p.id} data-cat={p.cat}>
      <TLink className="pc-media" to={"/product/" + p.id}>
        {o > 0 && <span className="pc-off num">−{o}%</span>}
        <img className="main" src={img(p)} alt={f.nm(p)} loading="lazy" />
        {alt && <img className="alt" src={img(p, 1)} alt="" loading="lazy" />}
      </TLink>
      <div className="pc-body">
        <span className="pc-cat"><Icon name={CAT_ICON[p.cat]} />{t("cats")[p.cat]}</span>
        <h3><TLink to={"/product/" + p.id}>{f.nm(p)}</TLink></h3>
        <span className="pc-var">{f.vr(p)}</span>
        <div className="pc-foot">
          <div className="pc-price"><b className="num"><Money n={p.sale} /></b>{p.reg > p.sale && <s className="num">{fmt(p.reg)}</s>}</div>
          <button className={"pc-add" + (done ? " done" : "") + (inCart && !done ? " in" : "")} disabled={out} aria-label={t("add") + ": " + f.nm(p)}
            onClick={(e) => { addToCart(p.id, 1, e.currentTarget); setDone(true); setTimeout(() => setDone(false), 1400); }}>
            <Icon name={done ? "check" : "plus"} /><span>{out ? t("stock_out") : done ? t("added") : t("add_short")}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

const ITEM_IC = [[/lock|قفل/i, "shield"], [/panel|screen|show|شاش|بانل/i, "screen"], [/switch|مفتاح|سويتش/i, "switch"], [/sensor|حساس|motion|gas|غاز/i, "target"], [/echo|alexa|اليكسا|إيكو/i, "voice"], [/curtain|ستار/i, "stack"], [/valve|محبس|water|مياه/i, "bolt"], [/socket|بريز|فيشة/i, "bolt"], [/ir|remote|ريموت/i, "app"], [/install|تركيب/i, "install"], [/warranty|ضمان/i, "shield"]];
const itemIcon = (n) => (ITEM_IC.find(([r]) => r.test(n)) || [0, "check"])[1];

/* bundles: pick a bundle from the list, see everything inside it */
export function BundleShowcase({ list }) {
  const { t, f } = useApp();
  const [i, setI] = useState(0);
  const stage = useRef(null);
  const p = list[i] || list[0];
  const items = f.its(p) || [], pct = off(p), saved = p.reg - p.sale;
  const count = items.reduce((a, [, q]) => a + (q || 0), 0);
  useEffect(() => {
    if (reduceMotion() || !stage.current) return;
    const el = stage.current;
    gsap.fromTo(el.querySelector(".bs-media img"), { opacity: 0, scale: 0.92, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: "expo.out" });
    gsap.fromTo(el.querySelectorAll(".bs-info>*"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.05 });
    gsap.fromTo(el.querySelectorAll(".bs-chip"), { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)", stagger: 0.03, delay: 0.15 });
    gsap.fromTo(el.querySelector(".bs-meter i"), { scaleX: 0 }, { scaleX: p.sale / p.reg, duration: 1.1, ease: "expo.out", delay: 0.2 });
  }, [i]); // eslint-disable-line
  return (
    <div className="bshow">
      <div className="bs-list" role="tablist">
        {list.map((b, k) => (
          <button key={b.id} role="tab" aria-selected={k === i} className={k === i ? "on" : ""} onClick={() => setI(k)} onMouseEnter={() => isFine() && setI(k)}>
            <span className="bs-i num">{pad(k + 1)}</span>
            <span className="bs-n"><b>{f.nm(b)}</b><small>{f.vr(b)}</small></span>
            <span className="bs-p num"><Money n={b.sale} /></span>
          </button>
        ))}
      </div>
      <div className="bs-stage" ref={stage}>
        <TLink className="bs-media" to={"/product/" + p.id}>
          <img src={img(p)} alt={f.nm(p)} key={p.id} />
          <span className="bs-badges">{i === 0 && <span className="bs-best">{t("b_best")}</span>}{pct > 0 && <span className="bs-off num">−{pct}%</span>}</span>
        </TLink>
        <div className="bs-info">
          <span className="bs-var">{f.vr(p)}{count > 0 && <> · <b className="num">{count}</b> {t("pieces")}</>}</span>
          <h3>{f.nm(p)}</h3>
          <p>{f.pt(p)}</p>
          <div className="bs-items">{items.map(([n, q], k) => <span className="bs-chip" key={k}><Icon name={itemIcon(n)} />{n}{q ? <b className="num">×{q}</b> : null}</span>)}</div>
          <div className="bs-price">
            <div><b className="num"><Money n={p.sale} /></b>{p.reg > p.sale && <s className="num">{fmt(p.reg)}</s>}</div>
            {saved > 0 && <span className="bs-saved">{t("save")} <b className="num"><Money n={saved} /></b></span>}
            <span className="bs-meter"><i /></span>
          </div>
          <div className="bs-acts"><AddButton id={p.id} className="btn btn-white"><Icon name="plus" />{t("add_bundle")}</AddButton><TLink className="btn btn-line" to={"/product/" + p.id}>{t("details")}</TLink></div>
        </div>
      </div>
    </div>
  );
}

export function Finale() {
  const { t } = useApp();
  return (
    <section className="finale fin2" id="finale">
      <div className="wrap">
        <div className="fin-card">
          <div className="fin-l"><span className="fin-k"><i className="led" />Value Mall · New Cairo</span><Split text={t("fin_h")} /></div>
          <div className="fin-r">
            <div className="addr"><Icon name="pin" /><div><b>{t("fin_addr")}</b><span>{t("fin_addr2")}</span></div></div>
            <a className="btn btn-white" href={waLink(t("wa_hi"))} target="_blank" rel="noopener" data-magnetic=""><Icon name="wa" /><BT>{t("wa")}</BT></a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* poster of the 3D walk-through (a real frame of the house) that opens it */
const FR = { en: { tag: "3D HOME", h: "Walk through a Techi home", go: "Step inside" }, ar: { tag: "البيت 3D", h: "اتمشى جوه بيت Techi", go: "ادخل البيت" } };
export function Frame3D({ activate, view = "living" }) {
  const { lang } = useApp();
  const c = FR[lang] || FR.en;
  return (
    <TLink className="walk-poster" to={activate ? "/experience/" + activate : "/experience"} data-cursor={c.go}>
      <picture>
        <source media="(max-width: 760px)" srcSet={`/techi-3d/poster-${view}-m.webp`} />
        <img src={`/techi-3d/poster-${view}.webp`} alt={c.h} loading="lazy" />
      </picture>
      <span className="wp-shade" />
      <span className="wp-copy"><span className="tag"><i className="led" />{c.tag}</span><b>{c.h}</b></span>
      <span className="wp-go"><Icon name="house" />{c.go}</span>
    </TLink>
  );
}
