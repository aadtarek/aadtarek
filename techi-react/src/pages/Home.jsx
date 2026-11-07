import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useApp } from "../context.jsx";
import { Icon, CAT_ICON } from "../components/Icons.jsx";
import { AddButton, BT, BundleGrid, Finale, Frame3D, Money, ProductCard, TLink, Tag } from "../components/ui.jsx";
import { CAT_IMG, CAT_KEYS, P, byId, catLink, fmt, img, isFine, off, pad, reduceMotion } from "../lib/util.js";
import { ScrollTrigger, bgPlace, bgTo, flipIn, gsap, reveals } from "../lib/motion.js";
import { createDeviceStage } from "../lib/devices3d.js";
import H3D from "../components/H3D.jsx";
import { HeroApp, HeroBento, HeroCinema, HeroSplit } from "./Heroes.jsx";

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

const STAGE = [["lock", 231855], ["panel", 231759], ["echo", 231737], ["switch", 231686], ["gas", 231916], ["hub", 231933], ["motion", 231925]];
/* hero: real 3D devices on a carousel you can spin */
function Hero3D() {
  const { t, f } = useApp();
  const host = useRef(null), stage = useRef(null), info = useRef(null);
  const [i, setI] = useState(0);
  const [ok, setOk] = useState(true);
  useEffect(() => {
    const s = createDeviceStage(host.current, STAGE.map(([model]) => ({ model })), setI);
    if (!s) { setOk(false); return; }
    stage.current = s;
    let iv = !reduceMotion() && setInterval(() => { if (!host.current.matches(":hover")) s.next(); }, 4500);
    const st = ScrollTrigger.create({ trigger: host.current, start: "top top+=90", end: "bottom top", scrub: true, onUpdate: (x) => (s.scroll = x.progress) });
    return () => { clearInterval(iv); st.kill(); s.destroy(); };
  }, []);
  useLayoutEffect(() => {
    if (reduceMotion() || !info.current) return;
    gsap.fromTo(info.current.querySelectorAll(".hi-anim"), { rotateX: -80, y: 20, opacity: 0, transformPerspective: 600, transformOrigin: "50% 100%" }, { rotateX: 0, y: 0, opacity: 1, duration: 0.8, ease: "expo.out", stagger: 0.05 });
  }, [i]);
  if (!ok) return <Spotlight />;
  const p = byId[STAGE[i][1]], o = off(p);
  return (
    <div className="h3d-stage">
      <div className="h3d-canvas" ref={host} data-cursor={t("drag3d")} />
      <div className="h3d-info" ref={info}>
        <div className="hi-top">
          <span className="hi-anim sp-cat"><Icon name={CAT_ICON[p.cat]} />{t("cats")[p.cat]}</span>
          {o > 0 && <span className="hi-anim hi-off num">−{o}%</span>}
        </div>
        <h3 className="hi-anim">{f.nm(p)}</h3>
        <div className="hi-row">
          <div className="hi-anim sp-price"><b className="num"><Money n={p.sale} /></b>{p.reg > p.sale && <s className="num">{fmt(p.reg)}</s>}</div>
          <div className="hi-acts">
            <TLink className="btn btn-line hi-btn" to={"/product/" + p.id}>{t("details")}</TLink>
            <AddButton id={p.id} className="btn btn-white hi-btn"><Icon name="plus" />{t("add_short")}</AddButton>
          </div>
        </div>
        <div className="hi-nav">
          <button aria-label="prev" onClick={() => stage.current && stage.current.prev()}><Icon name="arrow" /></button>
          <div className="hi-dots">{STAGE.map((_, k) => <button key={k} className={k === i ? "on" : ""} aria-label={String(k + 1)} onClick={() => stage.current && stage.current.setActive(k)} />)}</div>
          <button aria-label="next" onClick={() => stage.current && stage.current.next()}><Icon name="arrow" /></button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const hero = new URLSearchParams(window.location.search).get("hero") || "3";
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
          .from(".h3d-stage,.hspot", { rotateY: -30, z: -400, opacity: 0, transformPerspective: 1400, duration: 1.6, ease: "expo.out" }, "-=1.1");
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
      flipIn(el.querySelector(".bgrid"), { rotY: 40 });
      flipIn(el.querySelector(".cats"), { rotY: -70, stagger: 0.06 });
      flipIn(el.querySelector("#ritual"), { rotY: 60, stagger: 0.12 });
      const rit = el.querySelector("#ritual"); const items = [...rit.children];
      items.forEach((it, i) => gsap.to(it.querySelector(".bar"), { scaleX: 1, duration: 1.2, ease: "expo.inOut", delay: i * 0.2, scrollTrigger: { trigger: rit, start: "top 80%" }, onComplete: () => it.classList.add("on") }));
    }, el);
    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => { ctx.revert(); if (B) B.lux = 0; };
  }, []); // eslint-disable-line

  /* product grid re-enters when the tab changes */
  useLayoutEffect(() => {
    if (reduceMotion() || !grid.current) return;
    flipIn(grid.current, { now: true, stagger: 0.05 });
  }, [tab]);

  const trust = t("h_trust");
  return (
    <div ref={root}>
      {/* ---------- HERO ---------- */}
      {hero === "2" ? <HeroBento /> : hero === "3" ? <HeroCinema /> : hero === "4" ? <HeroSplit /> : hero === "5" ? <HeroApp /> : (
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
          <Hero3D />
        </div>
      </section>)}

      {/* ---------- CATEGORIES ---------- */}
      <section className="sec2 tight">
        <div className="wrap">
          <div className="cats">
            {CAT_KEYS.map((k) => (
              <TLink key={k} className="cat" to={catLink(k)} data-tilt="14">
                <span className="cat-img" data-z="40"><img src={img(byId[CAT_IMG[k]])} alt="" loading="lazy" /></span>
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
            <div><Tag>{t("p_tag")}</Tag><H3D text={t("p_h")} /><p>{t("p_p")}</p></div>
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
            <div><Tag>{t("x_tag")}</Tag><H3D text={t("x_h")} /><p>{t("x_p")}</p></div>
            <TLink className="btn btn-line" to="/experience"><Icon name="house" /><BT>{t("x_cta")}</BT></TLink>
          </div>
          <Frame3D />
        </div>
      </section>

      {/* ---------- BUNDLES ---------- */}
      <section className="sec2" id="bundles">
        <div className="wrap">
          <div className="head2">
            <div><Tag>{t("b_tag2")}</Tag><H3D text={t("b_h2")} /><p>{t("b_p2")}</p></div>
            <TLink className="btn btn-line" to="/bundles"><BT>{t("all_bundles")}</BT><Icon name="arrow" /></TLink>
          </div>
          <BundleGrid list={bundles} />
        </div>
      </section>

      {/* ---------- PROCESS ---------- */}
      <section className="sec2">
        <div className="wrap">
          <div className="head2"><div><Tag>{t("s5_tag")}</Tag><H3D text={t("s5_h")} /></div></div>
          <div className="ritual" id="ritual">
            {t("steps").map(([h, p], i) => <div className="rit" key={i} data-tilt="10"><i className="bar" /><span className="ri" data-z="50"><Icon name={["pin", "screen", "install", "app"][i]} /></span><span className="n num">{pad(i + 1)}</span><h4>{h}</h4><p>{p}</p></div>)}
          </div>
        </div>
      </section>
      <Finale />
    </div>
  );
}
