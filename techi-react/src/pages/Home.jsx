import { useLayoutEffect, useRef } from "react";
import { useApp } from "../context.jsx";
import { Icon, CAT_ICON } from "../components/Icons.jsx";
import { AddButton, BT, Finale, Frame3D, Money, Split, Suites, TLink, Tag } from "../components/ui.jsx";
import { CAT_IMG, CAT_KEYS, FEATURED, GHOST, P, SHOP, byId, catLink, fmt, img, isFine, off, pad, reduceMotion } from "../lib/util.js";
import { ScrollTrigger, bgPlace, bgTo, gsap, reveals } from "../lib/motion.js";

export default function Home() {
  const { t, f, dir, bg, toast } = useApp();
  const root = useRef(null);
  const bundles = P.filter((p) => p.cat === "bundles");
  const maxOff = Math.max(...P.map(off));
  const W = t("hero_w"), W2 = t("hero_w2"), F = t("figs");

  useLayoutEffect(() => {
    const el = root.current; const $ = (s) => el.querySelector(s), $$ = (s) => [...el.querySelectorAll(s)];
    const B = bg.current, reduce = reduceMotion(), fine = isFine(), mob = innerWidth < 900, s = dir;
    const ctx = gsap.context(() => {
      reveals(el, dir);

      /* ---- hero: a glass switch that runs the page ---- */
      const hero = $("#hero"), keys = $$(".key"), words = $$(".word"), sw = $("#sw"), scan = $("#swScan"), rip = $$(".ripples span"), wifi = $("#swWifi");
      const state = [0, 0, 0];
      const set = (k, on, silent) => {
        state[k] = on ? 1 : 0; keys[k].classList.toggle("on", on); keys[k].setAttribute("aria-pressed", on); words[k].classList.toggle("on", on);
        wifi.classList.toggle("on", state.some(Boolean));
        if (reduce) { if (k === 0) { if (B) B.lux = on ? 1 : 0; hero.style.setProperty("--lux", on ? 1 : 0); } return; }
        gsap.fromTo(keys[k], { scale: 0.86 }, { scale: 1, duration: 0.6, ease: "elastic.out(1,.4)" });
        if (k === 0) {
          if (B) gsap.to(B, { lux: on ? 1 : 0, duration: on ? 1.4 : 0.8, ease: "power2.out", overwrite: "auto" });
          gsap.to(hero, { "--lux": on ? 1 : 0, duration: on ? 1.4 : 0.8, ease: "power2.out" });
          if (on) gsap.fromTo(hero.querySelector(".cone"), { opacity: 0 }, { keyframes: [{ opacity: 0.6, duration: 0.05 }, { opacity: 0.1, duration: 0.06 }, { opacity: 0.9, duration: 0.05 }, { opacity: 0.3, duration: 0.08 }, { opacity: 1, duration: 0.3 }], clearProps: "opacity" });
        }
        if (k === 1 && on) { gsap.fromTo(scan, { yPercent: -100, opacity: 1 }, { yPercent: 250, opacity: 0, duration: 1.1, ease: "power2.inOut" }); if (!silent) toast("Techi Home", t("lock_toast")); }
        if (k === 2 && on) { rip.forEach((r, i) => gsap.fromTo(r, { scale: 0.5, opacity: 0.9 }, { scale: 2.6, opacity: 0, duration: 2.2, delay: i * 0.35, ease: "power2.out" })); if (B) gsap.fromTo(B, { spin: 8 }, { spin: 1, duration: 2.5, ease: "power3.out" }); }
      };
      keys.forEach((b, k) => b.addEventListener("click", () => set(k, !state[k])));
      words.forEach((w, k) => w.addEventListener("click", () => set(k, !state[k])));
      if (fine) {
        const rx = gsap.quickTo(sw, "rotationX", { duration: 0.8, ease: "power3" }), ry = gsap.quickTo(sw, "rotationY", { duration: 0.8, ease: "power3" });
        hero.addEventListener("pointermove", (e) => { const r = sw.getBoundingClientRect(); const nx = (e.clientX - (r.left + r.width / 2)) / innerWidth, ny = (e.clientY - (r.top + r.height / 2)) / innerHeight; ry(nx * 28); rx(-ny * 22); sw.querySelector(".sw-glass").style.setProperty("--sheen", nx * 160 + "%"); });
        hero.addEventListener("pointerleave", () => { rx(0); ry(0); });
      }
      if (!reduce) {
        gsap.timeline({ delay: 0.3 })
          .from(".word b", { yPercent: 110, opacity: 0, duration: 1.4, ease: "expo.out", stagger: 0.12 })
          .from(".word em", { opacity: 0, duration: 1, ease: "power3.out", stagger: 0.12 }, "-=1")
          .from(sw, { y: 80, rotationX: 40, opacity: 0, duration: 1.6, ease: "expo.out" }, "-=1.3")
          .from("#hero .tag, #hero [data-fade], .hero-status", { y: 30, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.1 }, "-=1")
          .add(() => set(0, true, true), "+=.1").add(() => set(1, true, true), "+=.7").add(() => set(2, true, true), "+=.7");
        gsap.to(".hero-grid", { yPercent: -12, opacity: 0.2, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
      } else { set(0, true, true); set(1, true, true); set(2, true, true); }

      /* ---- the globe moves with the story ---- */
      if (B) {
        const heroPos = () => { bgPlace(B, mob ? 0 : -0.42 * s, mob ? 0.2 : 0, mob ? 0.62 : 1); bgTo(B, { dim: 1 }); };
        heroPos();
        if (!reduce) {
          const stops = [
            ["#mfSec", () => { bgPlace(B, 0, 0, mob ? 1.1 : 1.55, 2.2); bgTo(B, { dim: 0.75 }, 2); }],
            [".xp-sec", () => { bgPlace(B, 0.55 * s, -0.35, 0.7); bgTo(B, { dim: 0.35 }); }],
            ["#collection", () => { bgPlace(B, 0, 0.05, mob ? 0.9 : 1.25); bgTo(B, { dim: 0.4 }); }],
            ["#rooms", () => { bgPlace(B, -0.6 * s, 0.1, 0.8); bgTo(B, { dim: 0.6 }); }],
            ["#suites", () => { bgPlace(B, 0.65 * s, 0.2, 0.6); bgTo(B, { dim: 0.35 }); }],
            ["#finale", () => { bgPlace(B, 0, 0.1, mob ? 0.9 : 1.3); bgTo(B, { dim: 0.9 }); }],
          ];
          stops.forEach(([sel, fn], i) => ScrollTrigger.create({ trigger: sel, start: "top 65%", onEnter: fn, onLeaveBack: i ? stops[i - 1][1] : heroPos }));
        }
      }
      if (reduce) return;

      /* ---- manifesto lights up word by word ---- */
      const ws = $$("#mf .w");
      ScrollTrigger.create({ trigger: "#mf", start: "top 75%", end: "bottom 45%", scrub: true, onUpdate: (st) => { const n = Math.round(st.progress * ws.length); ws.forEach((w, i) => w.classList.toggle("lit", i < n)); } });

      /* ---- collection: pinned horizontal showcase ---- */
      const col = $("#collection"), track = $("#colTrack");
      if (innerWidth > 900) {
        const slides = $$(".slide"); const dist = () => track.scrollWidth - innerWidth;
        const parts = slides.map((sl) => ({ sl, c: sl.querySelector(".case"), i: sl.querySelector(".s-info"), g: sl.querySelector(".ghost") }));
        const paint = () => { const Wd = innerWidth; parts.forEach((o) => { const r = o.sl.getBoundingClientRect(); const c = (r.left + r.width / 2 - Wd / 2) / Wd; const a = Math.min(1, Math.abs(c) * 1.5);
          gsap.set(o.c, { scale: 1 - 0.38 * a, rotation: c * -16, opacity: 1 - 0.55 * a }); gsap.set(o.i, { opacity: Math.max(0, 1 - a * 1.6), x: c * 60 }); gsap.set(o.g, { x: c * -420, opacity: 1 - a * 0.6 }); }); };
        gsap.to(track, { x: () => dist() * s, ease: "none", scrollTrigger: { trigger: col, start: "top top", end: () => "+=" + dist(), pin: ".col-pin", scrub: 1, invalidateOnRefresh: true,
          onUpdate: (st) => { $("#colBar").style.transform = `scaleX(${st.progress})`; $("#colN").textContent = pad(Math.min(slides.length, Math.round(st.progress * (slides.length - 1)) + 1)); }, onRefresh: paint } });
        gsap.ticker.add(paint); paint();
        return () => gsap.ticker.remove(paint);
      }
      $$(".slide").forEach((sl) => gsap.from(sl.querySelector(".case"), { scale: 0.7, opacity: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: sl, start: "top 80%" } }));
    }, el);

    /* ---- rooms: floating preview follows the cursor ---- */
    const extra = gsap.context(() => {
      if (reduce) return;
      const rooms = el.querySelector("#rooms");
      gsap.from(rooms.children, { y: 60, opacity: 0, duration: 1.1, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: rooms, start: "top 85%" } });
      const figs = el.querySelector("#figs"); const w = figs.scrollWidth / 2; const mq = gsap.to(figs, { x: -w, duration: 40, ease: "none", repeat: -1 });
      ScrollTrigger.create({ trigger: figs, start: "top bottom", end: "bottom top", onUpdate: (st) => gsap.to(mq, { timeScale: 1 + Math.abs(st.getVelocity() / 250), duration: 0.3, overwrite: true, onComplete: () => gsap.to(mq, { timeScale: 1, duration: 1 }) }) });
      const rit = el.querySelector("#ritual"); const items = [...rit.children];
      items.forEach((it, i) => gsap.to(it.querySelector(".bar"), { scaleX: 1, duration: 1.2, ease: "expo.inOut", delay: i * 0.25, scrollTrigger: { trigger: rit, start: "top 75%" }, onComplete: () => it.classList.add("on") }));
      gsap.from(items, { y: 50, opacity: 0, stagger: 0.12, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: rit, start: "top 80%" } });
      if (fine) {
        const hi = document.getElementById("hoverImg");
        const xT = gsap.quickTo(hi, "x", { duration: 0.7, ease: "power3" }), yT = gsap.quickTo(hi, "y", { duration: 0.7, ease: "power3" }); let lastX = 0;
        [...rooms.children].forEach((r) => {
          r.addEventListener("mouseenter", (e) => { gsap.set(hi, { x: e.clientX, y: e.clientY }); lastX = e.clientX; hi.innerHTML = `<img src="${r.dataset.img}" alt="">`; gsap.to(hi, { opacity: 1, scale: 1, duration: 0.6, ease: "expo.out" }); });
          r.addEventListener("mouseleave", () => gsap.to(hi, { opacity: 0, scale: 0.6, duration: 0.4 }));
          r.addEventListener("mousemove", (e) => { xT(e.clientX); yT(e.clientY); gsap.to(hi, { rotation: Math.max(-12, Math.min(12, (e.clientX - lastX) * 0.6)), duration: 0.5 }); lastX = e.clientX; });
        });
      }
    }, el);
    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => { ctx.revert(); extra.revert(); const hi = document.getElementById("hoverImg"); if (hi) { hi.style.opacity = 0; hi.innerHTML = ""; } if (B) B.lux = 0; };
  }, []); // eslint-disable-line

  return (
    <div ref={root}>
      <section className="hero" id="hero">
        <div className="cone" />
        <div className="wrap hero-grid">
          <div>
            <Tag>{t("hero_tag")}</Tag>
            <div className="words">{W.map((w, i) => <div className="word" data-k={i} key={i}><b>{w}</b><em>{W2[i]}</em></div>)}</div>
            <div className="hero-meta" data-fade="">
              <p>{t("hero_p")}</p>
              <div className="hero-ctas">
                <TLink className="btn btn-white" to="/shop" data-magnetic=""><BT>{t("hero_cta1")}</BT><Icon name="arrow" /></TLink>
                <TLink className="btn btn-line" to="/experience" data-magnetic=""><Icon name="house" /><BT>{t("hero_cta2")}</BT></TLink>
              </div>
            </div>
          </div>
          <div className="switch-wrap">
            <div className="ripples"><span /><span /><span /></div>
            <div className="switch" id="sw">
              <div className="sw-edge" />
              <div className="sw-glass"><i className="sw-wifi" id="swWifi" />
                {["bolt", "shield", "voice"].map((ic, i) => <button key={i} className="key" data-k={i} aria-label={t("key_names")[i]} aria-pressed="false"><i><Icon name={ic} /></i><span>{t("key_names")[i]}</span></button>)}
                <div className="sw-scan" id="swScan" />
              </div>
            </div>
            <div className="sw-shadow" />
            <div className="sw-hint"><i />{t("hero_hint")}<i /></div>
          </div>
        </div>
        <div className="hero-status"><Tag>{t("status")}</Tag><span className="clock-big num">Value Mall · New Cairo</span></div>
      </section>

      <section className="sec manifesto" id="mfSec">
        <div className="wrap"><Tag>{t("mf_tag")}</Tag><Split as="p" className="big" id="mf" text={t("mf")} /></div>
      </section>

      <section className="sec xp-sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="shead"><div><Tag>{t("s1_tag")}</Tag><Split text={t("s1_h")} /></div><div className="side"><p data-fade="">{t("s1_p")}</p></div></div>
          <Frame3D />
        </div>
      </section>

      <section className="collection" id="collection">
        <div className="col-pin">
          <div className="wrap col-head"><div><Tag>{t("s2_tag")}</Tag><Split text={t("s2_h")} /></div>
            <div className="col-prog num"><span id="colN">01</span><i><b id="colBar" /></i><span>{pad(FEATURED.length)}</span></div></div>
          <div className="col-track" id="colTrack">
            {FEATURED.map((id, i) => { const p = byId[id], o = off(p); return (
              <article className="slide" key={id}>
                <div className="ghost">{GHOST[id]}</div>
                <div className="s-info">
                  <span className="s-idx num">{pad(i + 1)} / {pad(FEATURED.length)}</span>
                  <span className="room"><Icon name={CAT_ICON[p.cat]} />{t("cats")[p.cat]}</span>
                  <h3>{f.nm(p)}</h3><span className="var">{f.vr(p)}</span><p>{f.pt(p)}</p>
                  <div className="s-price"><b className="num"><Money n={p.sale} /></b>{p.reg > p.sale && <><s className="num">{fmt(p.reg)}</s><span className="off num">−{o}%</span></>}</div>
                  <div className="s-btns"><AddButton id={p.id}><Icon name="plus" /><BT>{t("add")}</BT></AddButton><TLink className="btn btn-line" to={"/product/" + p.id}><BT>{t("details")}</BT></TLink></div>
                </div>
                <div className="case-wrap"><TLink className="case" to={"/product/" + p.id} data-cursor={t("view")}><img src={img(p)} alt={f.nm(p)} loading="lazy" /></TLink><div className="plinth" /></div>
              </article>); })}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="shead"><div><Tag>{t("s3_tag")}</Tag><Split text={t("s3_h")} /></div><div className="side"><p data-fade="">{t("s3_p")}</p></div></div>
          <div className="rooms" id="rooms">
            {CAT_KEYS.map((k) => (
              <TLink key={k} className="room-row" to={catLink(k)} data-img={img(byId[CAT_IMG[k]])}>
                <span className="ri"><Icon name={CAT_ICON[k]} /></span><h3>{t("cats")[k]}</h3><span className="cnt num">{pad(P.filter((p) => p.cat === k).length)} {t("pieces")}</span><span className="go"><Icon name="diag" /></span>
              </TLink>))}
          </div>
        </div>
      </section>

      <div className="figs"><div className="track" id="figs">
        {[0, 1].map((r) => (
          <div key={r} style={{ display: "contents" }}>
            <div className="f"><b>{maxOff}%</b><span>{F[0]}</span></div><div className="f"><b>{SHOP.filter((p) => p.cat !== "bundles").length}</b><span>{F[1]}</span></div>
            <div className="f"><b>{bundles.length}</b><span>{F[2]}</span></div><div className="f"><b>5Y</b><span>{F[3]}</span></div><div className="f"><b>3.0</b><span>{F[4]}</span></div>
          </div>))}
      </div></div>

      <section className="sec">
        <div className="wrap">
          <div className="shead"><div><Tag>{t("s4_tag")}</Tag><Split text={t("s4_h")} /></div><div className="side"><p data-fade="">{t("s4_p")}</p><TLink className="btn btn-line" to="/bundles"><BT>{t("all_bundles")}</BT><Icon name="arrow" /></TLink></div></div>
          <Suites list={bundles} />
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="shead"><div><Tag>{t("s5_tag")}</Tag><Split text={t("s5_h")} /></div></div>
          <div className="ritual" id="ritual">
            {t("steps").map(([h, p], i) => <div className="rit" key={i}><i className="bar" /><span className="ri"><Icon name={["pin", "screen", "install", "app"][i]} /></span><span className="n num">{pad(i + 1)}</span><h4>{h}</h4><p>{p}</p></div>)}
          </div>
        </div>
      </section>
      <Finale />
    </div>
  );
}
