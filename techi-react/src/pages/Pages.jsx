import { useLayoutEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Flip } from "gsap/Flip";
import { useApp } from "../context.jsx";
import { Icon, CAT_ICON } from "../components/Icons.jsx";
import { AddButton, BT, BundleGrid, Finale, Frame3D, Money, ProductCard, Split, Suites, TLink, Tag } from "../components/ui.jsx";
import { CAT_KEYS, D3MAP, P, SHOP, byId, catLink, fmt, img, off, pad, reduceMotion, src, waLink } from "../lib/util.js";
import { ScrollTrigger, bgPlace, bgTo, gsap, reveals } from "../lib/motion.js";
import { getHome } from "../lib/home3d.js";

gsap.registerPlugin(Flip);

/* every inner page: reveals + globe parked in a corner */
function usePage(extra) {
  const { bg, dir } = useApp();
  const root = useRef(null);
  useLayoutEffect(() => {
    const B = bg.current; const mob = innerWidth < 900;
    if (B) { bgPlace(B, 0.62 * -dir, 0.15, mob ? 0.55 : 0.75); bgTo(B, { dim: 0.55 }); }
    const ctx = gsap.context(() => { reveals(root.current, dir); extra && extra(root.current); }, root.current);
    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => ctx.revert();
  }, []); // eslint-disable-line
  return root;
}

function PHead({ tag, h, p, count }) {
  return (
    <section className="phead"><div className="wrap"><Tag>{tag}</Tag><Split as="h1" text={h} />
      <div className="sub"><p data-fade="">{p}</p>{count && <span className="count num" data-fade="">{count}</span>}</div></div></section>
  );
}

/* ---------------- SHOP ---------------- */
export function Shop() {
  const { t } = useApp();
  const { cat } = useParams();
  const [c, setC] = useState(cat && CAT_KEYS.includes(cat) ? cat : "all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("pop");
  const grid = useRef(null), chips = useRef(null), pill = useRef(null), flipState = useRef(null);
  const root = usePage((el) => { if (!reduceMotion()) gsap.from(el.querySelectorAll("#shopGrid .pcard"), { y: 80, opacity: 0, duration: 1.2, ease: "expo.out", stagger: 0.05, delay: 0.5 }); });
  const order = SHOP.map((p) => p.id);
  const list = SHOP.filter((p) => (c === "all" || p.cat === c) && (!q || (p.ar + " " + p.en + " " + p.variant + " " + p.variantEn).toLowerCase().includes(q.toLowerCase())))
    .sort((A, B) => (sort === "lo" ? A.sale - B.sale : sort === "hi" ? B.sale - A.sale : sort === "off" ? off(B) - off(A) : order.indexOf(A.id) - order.indexOf(B.id)));
  const capture = () => { if (!reduceMotion() && grid.current) flipState.current = Flip.getState(grid.current.querySelectorAll(".pcard")); };
  useLayoutEffect(() => {
    const on = chips.current.querySelector("button.on"); if (on && pill.current) { pill.current.style.left = on.offsetLeft + "px"; pill.current.style.width = on.offsetWidth + "px"; }
    if (flipState.current) { Flip.from(flipState.current, { duration: 0.8, ease: "expo.inOut", scale: true, absolute: true, stagger: 0.015, onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.6 }) }); flipState.current = null; }
  }, [c, q, sort]);
  const counts = Object.fromEntries(CAT_KEYS.map((k) => [k, P.filter((p) => p.cat === k).length]));
  return (
    <div ref={root}>
      <PHead tag={t("shop_tag")} h={t("shop_h")} p={t("shop_p")} count={`${pad(P.length)} ${t("pieces")}`} />
      <section className="wrap" style={{ paddingBottom: 40 }}>
        <div className="toolbar">
          <div className="chips" ref={chips}>
            <span className="pill" ref={pill} />
            <button className={c === "all" ? "on" : ""} onClick={() => { capture(); setC("all"); window.history.replaceState(null, "", "/shop"); }}>{t("all")}<sup className="num">{P.length}</sup></button>
            {CAT_KEYS.map((k) => <button key={k} className={c === k ? "on" : ""} onClick={() => { capture(); setC(k); window.history.replaceState(null, "", "/shop/" + k); }}><Icon name={CAT_ICON[k]} />{t("cats")[k]}<sup className="num">{counts[k]}</sup></button>)}
          </div>
          <div className="tsearch">
            <input type="search" placeholder={t("search")} aria-label={t("search")} value={q} onChange={(e) => { capture(); setQ(e.target.value); }} />
            <select aria-label="sort" value={sort} onChange={(e) => { capture(); setSort(e.target.value); }}>{t("sort").map((s, i) => <option key={i} value={["pop", "lo", "hi", "off"][i]}>{s}</option>)}</select>
          </div>
        </div>
        <div className="pgrid" id="shopGrid" ref={grid}>{list.map((p) => <ProductCard key={p.id} p={p} />)}</div>
        {!list.length && <p className="empty">{t("empty")}</p>}
      </section>
    </div>
  );
}

/* ---------------- BUNDLES ---------------- */
export function Bundles() {
  const { t } = useApp();
  const root = usePage();
  const b = P.filter((p) => p.cat === "bundles");
  return (
    <div ref={root}>
      <PHead tag={t("b_tag")} h={t("b_h")} p={t("b_p")} count={pad(b.length)} />
      <section className="wrap" style={{ paddingBottom: 60 }}><BundleGrid list={b} /></section>
    </div>
  );
}

/* ---------------- PRODUCT ---------------- */
export function Product() {
  const { id } = useParams();
  const p = byId[+id];
  return p ? <ProductView p={p} key={p.id} /> : <Shop />;
}
function ProductView({ p }) {
  const { t, f, dir } = useApp();
  const [qty, setQty] = useState(1);
  const [cur, setCur] = useState(0);
  const [zoom, setZoom] = useState(false);
  const gi = useRef(null);
  const root = usePage((el) => { if (!reduceMotion()) gsap.from(el.querySelector(".gal-main"), { scale: 0.85, opacity: 0, rotationY: -20 * dir, duration: 1.6, ease: "expo.out", delay: 0.15 }); });
  const o = off(p); const d3 = Object.keys(D3MAP).find((k) => D3MAP[k] === p.id);
  const rel = P.filter((x) => x.cat === p.cat && x.id !== p.id).concat(P.filter((x) => x.cat !== p.cat && x.cat !== "bundles")).slice(0, 4);
  const list = (f.ft(p) || []).map((x) => [x, 0]).concat(f.its(p) || []); const specs = f.sp(p) || [];
  const pick = (i) => { if (i === cur) return; if (reduceMotion()) { setCur(i); return; } gsap.to(gi.current, { opacity: 0, scale: 0.94, duration: 0.25, onComplete: () => { setCur(i); gsap.to(gi.current, { opacity: 1, scale: 1, duration: 0.6, ease: "expo.out" }); } }); };
  return (
    <div ref={root}>
      <section className="pp wrap">
        <nav className="crumbs" aria-label="breadcrumb"><TLink to="/">{t("crumbs_home")}</TLink><span>/</span><TLink to={catLink(p.cat)}>{t("cats")[p.cat]}</TLink><span>/</span><span>{f.nm(p)}</span></nav>
        <div className="pp-grid">
          <div className="gal">
            <div className="gal-stage" data-tilt="7">
              <div className={"gal-main" + (zoom ? " zoom" : "")} data-cursor={t("zoom")} onClick={() => setZoom(!zoom)} onPointerLeave={() => setZoom(false)}
                onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); gi.current.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`; }}>
                {o > 0 && <span className="badge num">−{o}%</span>}<img ref={gi} src={src(p.imgs[cur])} alt={f.nm(p)} />
              </div>
            </div>
            {p.imgs.length > 1 && <div className="thumbs">{p.imgs.map((fl, i) => <button key={i} className={i === cur ? "on" : ""} aria-label={String(i + 1)} onClick={() => pick(i)}><img src={src(fl)} alt="" /></button>)}</div>}
          </div>
          <div className="pinfo">
            <span className="pc" data-fade=""><Icon name={CAT_ICON[p.cat]} />{t("cats")[p.cat]} · {f.vr(p)}</span>
            <Split as="h1" text={f.nm(p)} />
            <div className="en" data-fade="">{f.alt(p)}</div>
            <p className="lead" data-fade="">{f.pt(p)}</p>
            <div className="pbig" data-fade=""><b className="num"><Money n={p.sale} /></b>{p.reg > p.sale && <><s className="num">{fmt(p.reg)} {t("cur")}</s><span className="save num">{t("save")} {fmt(p.reg - p.sale)} {t("cur")}</span></>}</div>
            {list.length > 0 && <ul className="feat" data-fade="">{list.map(([n, q], i) => <li key={i}><i className="num">{pad(i + 1)}</i><span>{n}</span>{q ? <b className="num">× {q}</b> : null}</li>)}</ul>}
            <div className="buy" data-fade="">
              <div className="qty"><button aria-label={t("qty_less")} onClick={() => setQty(Math.max(1, qty - 1))}>−</button><span className="num">{qty}</span><button aria-label={t("qty_more")} onClick={() => setQty(Math.min(20, qty + 1))}>+</button></div>
              <AddButton id={p.id} qty={qty}><Icon name="plus" /><BT>{t("add")}</BT></AddButton>
              <a className="btn btn-wa" href={waLink(t("wa_order") + f.nm(p) + " (" + f.vr(p) + ")")} target="_blank" rel="noopener"><Icon name="wa" /><BT>{t("order_wa")}</BT></a>
            </div>
            {d3 && <TLink className="btn btn-line" to={"/experience/" + d3} style={{ justifySelf: "start" }} data-fade=""><Icon name="house" /><BT>{t("see3d")}</BT></TLink>}
            <div className="perks" data-fade="" data-tilt="6">{t("perks").map(([b, s], i) => <div key={i}><Icon name={["install", "pin", "app"][i]} /><b>{b}</b><span>{s}</span></div>)}</div>
            {specs.length > 0 && <div className="specs" data-fade=""><table><caption>{t("specs")}</caption><tbody>{specs.map(([k, v], i) => <tr key={i}><td>{k}</td><td>{v}</td></tr>)}</tbody></table></div>}
          </div>
        </div>
      </section>
      <section className="sec"><div className="wrap"><div className="shead"><div><Tag>{t("pairs_tag")}</Tag><Split text={t("pairs")} /></div></div><div className="pgrid" data-stagger="">{rel.map((x) => <ProductCard key={x.id} p={x} />)}</div></div></section>
    </div>
  );
}

/* ---------------- 3D EXPERIENCE ---------------- */
export function Experience() {
  const { t, lenis } = useApp();
  const { dev } = useParams();
  const root = usePage();
  const h = getHome();
  return (
    <div ref={root}>
      <section className="xp"><Frame3D full activate={dev} /></section>
      <section className="sec"><div className="wrap">
        <div className="shead"><div><Tag>{t("xp_tag")}</Tag><Split text={t("xp_h")} /></div><div className="side"><p data-fade="">{t("xp_p")}</p></div></div>
        <div className="xp-list" data-stagger="">
          {(h ? h.devices : []).map((d) => { const p = byId[D3MAP[d.id]]; return (
            <button key={d.id} className="xp-item" onClick={() => { lenis.current ? lenis.current.scrollTo(0, { duration: 1.2 }) : window.scrollTo({ top: 0, behavior: "smooth" }); setTimeout(() => h.activate(d.id, true), reduceMotion() ? 0 : 700); }}>
              <img src={img(p)} alt="" /><span><b>{d.name}</b><small>{d.room} · {fmt(p.sale)} {t("cur")}</small></span><span className="n num">{pad(d.n)}</span>
            </button>); })}
        </div>
      </div></section>
    </div>
  );
}

/* ---------------- ABOUT ---------------- */
export function About() {
  const { t } = useApp();
  const root = usePage();
  return (
    <div ref={root}>
      <PHead tag={t("ab_tag")} h="Techi." p={t("ab_p")} />
      <section className="sec" style={{ paddingTop: 60 }}><div className="wrap about-grid">
        <p className="big" data-fade="">{t("ab_big")}</p>
        <div className="facts" data-fade="">{t("facts").map(([b, s], i) => <div key={i}><Icon name={["pin", "install", "shield", "app"][i]} /><b>{b}</b><span>{s}</span></div>)}</div>
      </div></section>
      <Finale />
    </div>
  );
}
