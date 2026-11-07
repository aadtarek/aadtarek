import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useApp } from "../context.jsx";
import { Icon, CAT_ICON } from "../components/Icons.jsx";
import { AddButton, BT, BundleGrid, Finale, Frame3D, Money, ProductCard, TLink, Tag } from "../components/ui.jsx";
import { CAT_IMG, CAT_KEYS, P, byId, catLink, fmt, img, isFine, off, pad, reduceMotion } from "../lib/util.js";
import { ScrollTrigger, bgPlace, bgTo, gsap, reveals } from "../lib/motion.js";

const SPOT = [231855, 231759, 231737, 231916, 231686];
const TABS = ["all", "screens", "switches", "security", "voice"];

/* hero product spotlight: rotates through the best sellers */
function Spotlight() {
  const { t, f } = useApp();
  const [i, setI] = useState(0);
  const stage = useRef(null), paused = useRef(false);
  const p = byId[SPOT[i]], o = off(p);
  useEffect(() => {
    if (reduceMotion()) return;
    const iv = setInterval(() => { if (!paused.current) setI((x) => (x + 1) % SPOT.length); }, 4200);
    return () => clearInterval(iv);
  }, []);
  useLayoutEffect(() => {
    if (reduceMotion() || !stage.current) return;
    const el = stage.current;
    gsap.fromTo(el.querySelector(".sp-img"), { opacity: 0, scale: 0.9, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: "expo.out" });
    gsap.fromTo(el.querySelectorAll(".sp-info>*"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.06 });
    gsap.fromTo(el.querySelector(".sp-bar i"), { scaleX: 0 }, { scaleX: 1, duration: 4.2, ease: "none" });
  }, [i]);
  return (
    <div className="hspot" ref={stage} onMouseEnter={() => (paused.current = true)} onMouseLeave={() => (paused.current = false)}>
      <TLink className="sp-stage" to={"/product/" + p.id} data-cursor={t("view")}>
        {o > 0 && <span className="sp-off num">−{o}% {t("h_off")}</span>}
        <img className="sp-img" src={img(p)} alt={f.nm(p)} key={p.id} />
        <span className="sp-chip"><i className="led" />{t("h_works")}</span>
      </TLink>
      <div className="sp-info">
        <span className="sp-cat"><Icon name={CAT_ICON[p.cat]} />{t("cats")[p.cat]}</span>
        <h3>{f.nm(p)}</h3>
        <div className="sp-row">
          <div className="sp-price"><b className="num"><Money n={p.sale} /></b>{p.reg > p.sale && <s className="num">{fmt(p.reg)}</s>}</div>
          <AddButton id={p.id} className="btn btn-white sp-add"><Icon name="plus" />{t("add_short")}</AddButton>
        </div>
      </div>
      <div className="sp-thumbs">
        {SPOT.map((id, k) => (
          <button key={id} className={k === i ? "on" : ""} aria-label={f.nm(byId[id])} onClick={() => setI(k)}>
            <img src={img(byId[id])} alt="" />
          </button>
        ))}
        <span className="sp-bar"><i /></span>
      </div>
    </div>
  );
}

export default function Home() {
  const { t, dir, bg } = useApp();
  const root = useRef(null), grid = useRef(null);
  const [tab, setTab] = useState("all");
  const bundles = P.filter((p) => p.cat === "bundles");
  const devices = P.filter((p) => p.cat !== "bundles");
  const shown = (tab === "all" ? [231855, 231759, 231737, 231916, 231689, 231686, 231925, 231940].map((id) => byId[id]) : devices.filter((p) => p.cat === tab)).slice(0, 8);

  useLayoutEffect(() => {
    const el = root.current, B = bg.current, reduce = reduceMotion(), mob = innerWidth < 900, s = dir;
    const ctx = gsap.context(() => {
      reveals(el, dir);
      if (!reduce) {
        gsap.timeline({ delay: 0.2 })
          .from(".h-title .ln>span", { yPercent: 110, duration: 1.3, ease: "expo.out", stagger: 0.1 })
          .from(".hero2 .tag, .h-p, .h-ctas, .h-trust>*", { y: 24, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.07 }, "-=.9")
          .from(".hspot", { y: 60, opacity: 0, duration: 1.3, ease: "expo.out" }, "-=1.1");
      }
      if (B) {
        const heroPos = () => { bgPlace(B, mob ? 0 : -0.5 * s, mob ? 0.25 : 0.05, mob ? 0.6 : 0.95); bgTo(B, { dim: 0.7 }); };
        heroPos();
        if (!reduce) {
          const stops = [
            ["#prods", () => { bgPlace(B, 0.7 * s, -0.2, 0.6); bgTo(B, { dim: 0.25 }); }],
            ["#xp", () => { bgPlace(B, -0.6 * s, 0.1, 0.7); bgTo(B, { dim: 0.3 }); }],
            ["#bundles", () => { bgPlace(B, 0.65 * s, 0.2, 0.6); bgTo(B, { dim: 0.25 }); }],
            ["#finale", () => { bgPlace(B, 0, 0.1, mob ? 0.9 : 1.2); bgTo(B, { dim: 0.8 }); }],
          ];
          stops.forEach(([sel, fn], i) => ScrollTrigger.create({ trigger: sel, start: "top 65%", onEnter: fn, onLeaveBack: i ? stops[i - 1][1] : heroPos }));
        }
      }
      if (reduce) return;
      gsap.from(".bgrid>*", { y: 70, opacity: 0, duration: 1.1, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: ".bgrid", start: "top 85%" } });
      gsap.from(".cats>*", { y: 50, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.06, scrollTrigger: { trigger: ".cats", start: "top 88%" } });
      const rit = el.querySelector("#ritual"); const items = [...rit.children];
      items.forEach((it, i) => gsap.to(it.querySelector(".bar"), { scaleX: 1, duration: 1.2, ease: "expo.inOut", delay: i * 0.2, scrollTrigger: { trigger: rit, start: "top 80%" }, onComplete: () => it.classList.add("on") }));
    }, el);
    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => { ctx.revert(); if (B) B.lux = 0; };
  }, []); // eslint-disable-line

  /* product grid re-enters when the tab changes */
  useLayoutEffect(() => {
    if (reduceMotion() || !grid.current) return;
    gsap.fromTo(grid.current.children, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "expo.out", stagger: 0.05 });
  }, [tab]);

  const trust = t("h_trust");
  return (
    <div ref={root}>
      {/* ---------- HERO ---------- */}
      <section className="hero2">
        <div className="wrap h-grid">
          <div className="h-copy">
            <Tag>{t("h_tag")}</Tag>
            <h1 className="h-title"><span className="ln"><span>{t("h_title1")}</span></span><span className="ln"><span className="accent">{t("h_title2")}</span></span></h1>
            <p className="h-p">{t("h_p")}</p>
            <div className="h-ctas">
              <TLink className="btn btn-white" to="/shop" data-magnetic=""><BT>{t("h_cta1")}</BT><Icon name="arrow" /></TLink>
              <TLink className="btn btn-line" to="/bundles" data-magnetic=""><BT>{t("h_cta2")}</BT></TLink>
            </div>
            <ul className="h-trust">{trust.map(([ic, a, b]) => <li key={a}><span className="ti"><Icon name={ic} /></span><span><b>{a}</b><small>{b}</small></span></li>)}</ul>
          </div>
          <Spotlight />
        </div>
      </section>

      {/* ---------- CATEGORIES ---------- */}
      <section className="sec2 tight">
        <div className="wrap">
          <div className="cats">
            {CAT_KEYS.map((k) => (
              <TLink key={k} className="cat" to={catLink(k)}>
                <span className="cat-img"><img src={img(byId[CAT_IMG[k]])} alt="" loading="lazy" /></span>
                <span className="cat-txt"><b>{t("cats")[k]}</b><small className="num">{pad(P.filter((p) => p.cat === k).length)} {t("pieces")}</small></span>
                <span className="cat-go"><Icon name="arrow" /></span>
              </TLink>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- PRODUCTS ---------- */}
      <section className="sec2" id="prods">
        <div className="wrap">
          <div className="head2">
            <div><Tag>{t("p_tag")}</Tag><h2>{t("p_h")}</h2><p>{t("p_p")}</p></div>
            <TLink className="btn btn-line" to="/shop"><BT>{t("p_all")}</BT><Icon name="arrow" /></TLink>
          </div>
          <div className="tabs" role="tablist">
            {TABS.map((k) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{k !== "all" && <Icon name={CAT_ICON[k]} />}{k === "all" ? t("all") : t("cats")[k]}</button>)}
          </div>
          <div className="pgrid" ref={grid}>{shown.map((p) => <ProductCard key={p.id} p={p} />)}</div>
        </div>
      </section>

      {/* ---------- 3D TEASER ---------- */}
      <section className="sec2" id="xp">
        <div className="wrap">
          <div className="head2">
            <div><Tag>{t("x_tag")}</Tag><h2>{t("x_h")}</h2><p>{t("x_p")}</p></div>
            <TLink className="btn btn-line" to="/experience"><Icon name="house" /><BT>{t("x_cta")}</BT></TLink>
          </div>
          <Frame3D />
        </div>
      </section>

      {/* ---------- BUNDLES ---------- */}
      <section className="sec2" id="bundles">
        <div className="wrap">
          <div className="head2">
            <div><Tag>{t("b_tag2")}</Tag><h2>{t("b_h2")}</h2><p>{t("b_p2")}</p></div>
            <TLink className="btn btn-line" to="/bundles"><BT>{t("all_bundles")}</BT><Icon name="arrow" /></TLink>
          </div>
          <BundleGrid list={bundles} />
        </div>
      </section>

      {/* ---------- PROCESS ---------- */}
      <section className="sec2">
        <div className="wrap">
          <div className="head2"><div><Tag>{t("s5_tag")}</Tag><h2>{t("s5_h")}</h2></div></div>
          <div className="ritual" id="ritual">
            {t("steps").map(([h, p], i) => <div className="rit" key={i}><i className="bar" /><span className="ri"><Icon name={["pin", "screen", "install", "app"][i]} /></span><span className="n num">{pad(i + 1)}</span><h4>{h}</h4><p>{p}</p></div>)}
          </div>
        </div>
      </section>
      <Finale />
    </div>
  );
}
