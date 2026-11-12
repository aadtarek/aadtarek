import { useLayoutEffect, useRef, useState } from "react";
import { useApp } from "../context.jsx";
import { Icon, CAT_ICON } from "../components/Icons.jsx";
import { BT, BundleShowcase, Finale, Frame3D, ProductCard, TLink, Tag } from "../components/ui.jsx";
import { CAT_IMG, CAT_KEYS, P, byId, catLink, img, pad, reduceMotion } from "../lib/util.js";
import { ScrollTrigger, flipIn, gsap, reveals } from "../lib/motion.js";
import H3D from "../components/H3D.jsx";
import HeroRoom from "./HeroRoom.jsx";

const TABS = ["all", "screens", "switches", "security", "voice"];
const FEATURED = [231855, 231759, 231737, 231916, 231689, 231686, 231925, 231940];

export default function Home() {
  const { t, dir } = useApp();
  const root = useRef(null), grid = useRef(null);
  const [tab, setTab] = useState("all");
  const bundles = P.filter((p) => p.cat === "bundles");
  const devices = P.filter((p) => p.cat !== "bundles");
  const shown = (tab === "all" ? FEATURED.map((id) => byId[id]) : devices.filter((p) => p.cat === tab)).slice(0, 8);

  useLayoutEffect(() => {
    const el = root.current, reduce = reduceMotion();
    const ctx = gsap.context(() => {
      reveals(el, dir);
      if (reduce) return;
      flipIn(el.querySelector(".cats"), { rotY: -70, stagger: 0.06 });
      flipIn(el.querySelector("#ritual"), { rotY: 60, stagger: 0.12 });
      const rit = el.querySelector("#ritual"); const items = [...rit.children];
      items.forEach((it, i) => gsap.to(it.querySelector(".bar"), { scaleX: 1, duration: 1.2, ease: "expo.inOut", delay: i * 0.2, scrollTrigger: { trigger: rit, start: "top 80%" }, onComplete: () => it.classList.add("on") }));
    }, el);
    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => ctx.revert();
  }, []); // eslint-disable-line

  /* product grid re-enters when the tab changes */
  useLayoutEffect(() => {
    if (reduceMotion() || !grid.current) return;
    flipIn(grid.current, { now: true, stagger: 0.05 });
  }, [tab]);

  return (
    <div ref={root}>
      <HeroRoom />

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
          <BundleShowcase list={bundles} />
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
