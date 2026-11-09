import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useApp } from "../context.jsx";
import { Icon, CAT_ICON } from "./Icons.jsx";
import { D3MAP, byId, fmt, img, isFine, off, pad, reduceMotion, waLink } from "../lib/util.js";
import { getHome } from "../lib/home3d.js";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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

/* bundle card: image, what's inside, savings, price */
export function BundleCard({ p, big, best }) {
  const { t, f } = useApp();
  const items = f.its(p) || [];
  const show = big ? items.slice(0, 8) : items.slice(0, 4);
  const pct = off(p);
  return (
    <article className={"bcard" + (big ? " big" : "")} data-tilt={big ? "5" : "8"}>
      <TLink className="bc-media" to={"/product/" + p.id} data-cursor={t("view")} data-z="40">
        <img src={img(p)} alt={f.nm(p)} loading="lazy" />
        <span className="bc-badges">{best && <span className="bc-best">{t("b_best")}</span>}{pct > 0 && <span className="bc-save num">{t("b_save_pct")} {pct}%</span>}</span>
      </TLink>
      <div className="bc-body">
        <div className="bc-head"><span className="bc-var">{f.vr(p)}</span><h3><TLink to={"/product/" + p.id}>{f.nm(p)}</TLink></h3>{big && <p>{f.pt(p)}</p>}</div>
        <div className="bc-inc">
          <span className="bc-inc-l">{t("b_includes")}</span>
          <ul>{show.map(([n, q], i) => <li key={i}><Icon name="check" /><span>{n}</span>{q ? <b className="num">×{q}</b> : null}</li>)}</ul>
          {items.length > show.length && <span className="bc-more num">+{items.length - show.length} {t("b_more")}</span>}
        </div>
        <div className="bc-foot" data-z="24">
          <div className="bc-price"><b className="num"><Money n={p.sale} /></b>{p.reg > p.sale && <s className="num">{fmt(p.reg)}</s>}</div>
          <div className="bc-acts"><AddButton id={p.id} className="btn btn-white bc-btn"><Icon name="plus" />{t("add_bundle")}</AddButton><TLink className="btn btn-line bc-btn" to={"/product/" + p.id}>{t("details")}</TLink></div>
        </div>
      </div>
    </article>
  );
}
export function BundleGrid({ list }) { return <BundleShowcase list={list} />; }

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

export function Suites({ list }) {
  const { t, f } = useApp();
  const [on, setOn] = useState(0);
  const fine = isFine();
  return (
    <div className="suites" id="suites">
      {list.map((p, i) => (
        <article key={p.id} className={"suite" + (i === on ? " on" : "")} tabIndex={0}
          onClick={() => setOn(i)} onKeyDown={(e) => e.key === "Enter" && setOn(i)} onMouseEnter={() => fine && setOn(i)}>
          <div className="tab"><span className="num si">{pad(i + 1)}</span><h4>{f.nm(p)}</h4><span className="pr num">{fmt(p.sale)} {t("cur")}</span></div>
          <div className="body">
            <TLink className="bimg" to={"/product/" + p.id} data-cursor={t("view")}><img src={img(p)} alt={f.nm(p)} loading="lazy" /></TLink>
            <div className="info">
              <span className="num si">{pad(i + 1)} / {pad(list.length)}</span><h3>{f.nm(p)}</h3><span className="v">{f.vr(p)}</span><p>{f.pt(p)}</p>
              <ul>{(f.its(p) || []).slice(0, 8).map(([n, q], k) => <li key={k}><span>{n}</span>{q ? <b className="num">× {q}</b> : null}</li>)}</ul>
              <div className="pr-big"><b className="num"><Money n={p.sale} /></b><s className="num">{fmt(p.reg)}</s>{p.reg > p.sale && <span className="save num">{t("save")} {fmt(p.reg - p.sale)} {t("cur")}</span>}</div>
              <div className="row-btns"><AddButton id={p.id}><Icon name="plus" /><BT>{t("add_bundle")}</BT></AddButton><TLink className="btn btn-line" to={"/product/" + p.id}><BT>{t("details")}</BT></TLink></div>
            </div>
          </div>
        </article>
      ))}
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

/* the 3D apartment, mounted into this frame */
export function Frame3D({ full, activate }) {
  const { t, f, lang } = useApp();
  const host = useRef(null), card = useRef(null);
  const [dev, setDev] = useState(null);
  const [day, setDay] = useState(false);
  const [pins, setPins] = useState(true);
  const [run, setRun] = useState(null);
  const [ok, setOk] = useState(true);
  useEffect(() => {
    const h = getHome();
    if (!h) { setOk(false); return; }
    h.setLang && h.setLang(lang);
    h.mount(host.current);
    const offFn = h.on((id, did) => { if (!id) return; const d = h.devices.find((x) => x.id === id); setDev({ id, did, room: d.room, name: d.name }); });
    let timer;
    if (activate) timer = setTimeout(() => h.activate(activate, true), 1600);
    return () => { offFn(); clearTimeout(timer); h.unmount(); };
  }, [activate]); // eslint-disable-line
  useEffect(() => { if (dev && card.current && !reduceMotion()) gsap.fromTo(card.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }); }, [dev]);
  const h = () => getHome();
  const p = dev ? byId[D3MAP[dev.id]] : null;
  return (
    <div className={"t3d-frame" + (full ? " full" : "") + (pins ? "" : " nopins")} data-lenis-prevent="">
      <div className="t3d-host" ref={host}>{!ok && <div className="t3d-fallback">{t("no3d")}</div>}</div>
      <div className="t3d-ui">
        <div className="t3d-top">
          <div className="t3d-title">{full ? <><h2>{t("t3d_title")}</h2><p>{t("t3d_p")}</p></> : <p className="t3d-hint">{t("t3d_hint")}</p>}</div>
          <div className="t3d-tools">
            <button className="glass-btn" aria-pressed={day} onClick={() => { setDay(!day); h()?.setDay(!day); }}><Icon name={day ? "moon" : "sun"} /><span>{day ? t("night") : t("day")}</span></button>
            <button className="glass-btn" aria-pressed={pins} onClick={() => setPins(!pins)}><Icon name="target" /><span>{t("pins")}</span></button>
            <button className="glass-btn" onClick={() => h()?.home()}><Icon name="house" /><span>{t("whole")}</span></button>
          </div>
        </div>
        <div className="t3d-bottom">
          <div className="scenes3d">
            {[["sleep", "sleep", "sc_sleep"], ["away", "away", "sc_away"], ["home", "arrive", "sc_home"]].map(([s, ic, k]) => (
              <button key={s} className={"glass-btn" + (run === s ? " run" : "")} onClick={() => { h()?.runScene(s); setRun(s); setTimeout(() => setRun(null), 2600); }}><Icon name={ic} />{t(k)}</button>
            ))}
          </div>
          {p && (
            <div className="dev-card" ref={card}>
              <img src={img(p)} alt="" />
              <div><span className="r">{dev.room} · {dev.name}</span><h4>{f.nm(p)}</h4><div className="did">{dev.did}</div></div>
              <div className="row">
                <span className="p num">{fmt(p.sale)} {t("cur")}<small>{p.reg > p.sale ? fmt(p.reg) : ""}</small></span>
                <span style={{ display: "flex", gap: 6 }}>
                  <TLink className="mini-add alt" to={"/product/" + p.id}>{t("details")}</TLink>
                  <AddButton id={p.id} className="mini-add"><Icon name="plus" />{t("add")}</AddButton>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
