/* Alternative hero designs. Pick one with ?hero=2 … ?hero=5 (1 = current 3D carousel). */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useApp } from "../context.jsx";
import { Icon, CAT_ICON } from "../components/Icons.jsx";
import { AddButton, BT, Money, TLink, Tag } from "../components/ui.jsx";
import { byId, fmt, img, off, reduceMotion } from "../lib/util.js";
import { gsap } from "../lib/motion.js";

const C = {
  ar: {
    a_h: "كل اللي بيتك محتاجه عشان يبقى ذكي.", a_p: "سويتشات، كوالين، شاشات وحساسات من TYSH وAmazon، بتركيب احترافي.",
    b_h1: "بيتك.", b_h2: "تحت إيدك.", b_p: "نوّر، اقفل الباب، شغّل التكييف، واطمّن على بيتك من موبايلك أو بصوتك. من أي مكان.",
    c_k: "الأكثر مبيعًا", c_h: "افتح باب بيتك بوشّك.", c_p: "كالون ذكي ببصمة الوش 3D والصباع، وانتركم بالفيديو تشوف منه مين على الباب وانت برا.",
    d_h: "بيت ذكي كامل، من أبلكيشن واحد.", d_p: "كل أجهزة Techi بتتربط ببعض على Tuya، وبتشتغل مع Alexa و Google Home كمان.",
    app_hi: "مساء الخير", app_home: "البيت", lights: "النور", lock: "الباب", ac: "التكييف", gas: "الغاز", safe: "آمن", locked: "مقفول", on: "شغال",
    shop: "تسوّق الأجهزة", bundles: "شوف الباقات", from: "يبدأ من",
  },
  en: {
    a_h: "Everything your home needs to get smart.", a_p: "Switches, locks, screens and sensors from TYSH and Amazon, professionally installed.",
    b_h1: "Your home.", b_h2: "In your hand.", b_p: "Lights, door, AC and safety, controlled from your phone or your voice. From anywhere.",
    c_k: "Best seller", c_h: "Unlock your door with your face.", c_p: "A smart lock with 3D face ID, fingerprint and a video intercom so you see who's at the door from anywhere.",
    d_h: "A complete smart home, in one app.", d_p: "Every Techi device links up on Tuya and works with Alexa and Google Home.",
    app_hi: "Good evening", app_home: "Home", lights: "Lights", lock: "Door", ac: "AC", gas: "Gas", safe: "Safe", locked: "Locked", on: "On",
    shop: "Shop devices", bundles: "See bundles", from: "From",
  },
};
const useC = () => { const { lang } = useApp(); return C[lang]; };
const Ctas = () => { const c = useC(); return (
  <div className="h-ctas">
    <TLink className="btn btn-white" to="/shop" data-magnetic=""><BT>{c.shop}</BT><Icon name="arrow" /></TLink>
    <TLink className="btn btn-line" to="/bundles" data-magnetic=""><BT>{c.bundles}</BT></TLink>
  </div>); };
function intro(root, sel) {
  if (reduceMotion() || !root) return;
  gsap.from(root.querySelectorAll(sel), { y: 40, opacity: 0, duration: 1.1, ease: "expo.out", stagger: 0.07, delay: 0.15 });
}

/* ---------- 2: bento product wall ---------- */
const BENTO = [[231855, "tall"], [231759, "wide"], [231737, ""], [231916, ""], [231686, ""], [231933, ""]];
export function HeroBento() {
  const { t, f } = useApp(); const c = useC(); const r = useRef(null);
  useLayoutEffect(() => intro(r.current, ".hb-copy>*, .bento>*"), []);
  return (
    <section className="hx hb" ref={r}>
      <div className="wrap">
        <div className="hb-copy"><Tag>{t("h_tag")}</Tag><h1>{c.a_h}</h1><p>{c.a_p}</p><Ctas /></div>
        <div className="bento">
          {BENTO.map(([id, k]) => { const p = byId[id], o = off(p); return (
            <TLink key={id} to={"/product/" + id} className={"bt-tile " + k} data-tilt="6">
              <img src={img(p)} alt={f.nm(p)} data-z="30" />
              {o > 0 && <span className="bt-off num">−{o}%</span>}
              <span className="bt-cap" data-z="20"><b>{f.nm(p)}</b><span className="num">{fmt(p.sale)} {t("cur")}</span></span>
            </TLink>); })}
        </div>
      </div>
    </section>
  );
}

/* ---------- 3: cinematic product with giant word ---------- */
const ORBIT = [231855, 231759, 231916, 231686, 231933];
export function HeroCinema() {
  const { t, f } = useApp(); const c = useC(); const r = useRef(null);
  const main = byId[231737];
  useLayoutEffect(() => {
    if (reduceMotion()) return;
    const el = r.current;
    const ctx = gsap.context(() => {
      gsap.from(".hc-word span", { yPercent: 100, opacity: 0, duration: 1.4, ease: "expo.out", stagger: 0.05 });
      gsap.from(".hc-main", { scale: 0.6, opacity: 0, y: 80, duration: 1.6, ease: "expo.out", delay: 0.2 });
      gsap.from(".hc-chip", { scale: 0, opacity: 0, duration: 0.9, ease: "back.out(2)", stagger: 0.08, delay: 0.7 });
      gsap.from(".hc-copy>*", { y: 30, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.08, delay: 0.5 });
      gsap.to(".hc-main", { y: -14, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1 });
      el.querySelectorAll(".hc-chip").forEach((ch, i) => gsap.to(ch, { y: i % 2 ? 10 : -10, duration: 2.4 + i * 0.3, ease: "sine.inOut", yoyo: true, repeat: -1 }));
    }, el);
    const mv = (e) => { const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5; gsap.to(el.querySelector(".hc-main"), { rotateY: x * 18, rotateX: -y * 12, duration: 1, ease: "power3" }); gsap.to(el.querySelector(".hc-word"), { x: -x * 40, duration: 1.2, ease: "power3" }); };
    el.addEventListener("pointermove", mv);
    return () => { ctx.revert(); el.removeEventListener("pointermove", mv); };
  }, []);
  return (
    <section className="hx hc" ref={r}>
      <div className="hc-word" aria-hidden="true">{[..."SMART HOME"].map((ch, i) => <span key={i}>{ch === " " ? " " : ch}</span>)}</div>
      <div className="hc-stage">
        <div className="hc-glow" />
        <img className="hc-main" src={img(main)} alt={f.nm(main)} />
        {ORBIT.map((id, i) => { const p = byId[id]; return (
          <TLink key={id} to={"/product/" + id} className={"hc-chip c" + i}><img src={img(p)} alt="" /><span><b>{f.nm(p)}</b><small className="num">{fmt(p.sale)} {t("cur")}</small></span></TLink>); })}
      </div>
      <div className="wrap hc-copy"><h1><span>{c.b_h1}</span> <span className="accent">{c.b_h2}</span></h1><p>{c.b_p}</p><Ctas /></div>
    </section>
  );
}

/* ---------- 4: clean split with one hero product ---------- */
export function HeroSplit() {
  const { t, f } = useApp(); const c = useC(); const r = useRef(null);
  const p = byId[231855], o = off(p);
  const [im, setIm] = useState(0);
  useLayoutEffect(() => intro(r.current, ".hs-copy>*, .hs-card"), []);
  useEffect(() => { if (reduceMotion()) return; const iv = setInterval(() => setIm((x) => (x + 1) % p.imgs.length), 3500); return () => clearInterval(iv); }, [p.imgs.length]);
  return (
    <section className="hx hs" ref={r}>
      <div className="wrap hs-grid">
        <div className="hs-copy">
          <span className="hs-k"><i className="led" />{c.c_k}</span>
          <h1>{c.c_h}</h1><p>{c.c_p}</p>
          <div className="hs-price"><b className="num"><Money n={p.sale} /></b>{p.reg > p.sale && <><s className="num">{fmt(p.reg)}</s><span className="hs-off num">−{o}%</span></>}</div>
          <div className="h-ctas"><AddButton id={p.id}><Icon name="plus" /><BT>{t("add")}</BT></AddButton><TLink className="btn btn-line" to="/shop"><BT>{c.shop}</BT><Icon name="arrow" /></TLink></div>
          <ul className="hs-feat">{(f.ft(p) || []).map((x) => <li key={x}><Icon name="check" />{x}</li>)}</ul>
        </div>
        <TLink to={"/product/" + p.id} className="hs-card" data-tilt="6">
          {p.imgs.map((fl, k) => <img key={fl} src={"/img/" + fl} alt={k ? "" : f.nm(p)} className={k === im ? "on" : ""} data-z="30" />)}
          <span className="hs-dots">{p.imgs.map((_, k) => <i key={k} className={k === im ? "on" : ""} />)}</span>
        </TLink>
      </div>
    </section>
  );
}

/* ---------- 5: the app in a phone, devices around it ---------- */
const AROUND = [[231855, "lock"], [231759, "lights"], [231737, "ac"], [231916, "gas"]];
export function HeroApp() {
  const { t, f } = useApp(); const c = useC(); const r = useRef(null);
  const [st, setSt] = useState({ lights: true, lock: true, ac: false, gas: false });
  useLayoutEffect(() => {
    if (reduceMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(".ha-copy>*", { y: 30, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.08, delay: 0.1 });
      gsap.from(".ha-phone", { rotateY: -40, rotateX: 20, z: -300, opacity: 0, transformPerspective: 1200, duration: 1.6, ease: "expo.out", delay: 0.2 });
      gsap.from(".ha-dev", { scale: 0.4, opacity: 0, duration: 1, ease: "back.out(1.8)", stagger: 0.1, delay: 0.6 });
      gsap.to(".ha-phone", { y: -12, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1 });
    }, r.current);
    const seq = [["ac", true], ["lights", false], ["lock", false], ["lights", true], ["lock", true], ["ac", false]]; let k = 0;
    const iv = setInterval(() => { const [a, v] = seq[k++ % seq.length]; setSt((s) => ({ ...s, [a]: v })); }, 1800);
    return () => { ctx.revert(); clearInterval(iv); };
  }, []);
  const tiles = [["lights", "bolt", c.lights, st.lights ? c.on : "—"], ["lock", "shield", c.lock, st.lock ? c.locked : "—"], ["ac", "voice", c.ac, st.ac ? "24°" : "—"], ["gas", "target", c.gas, c.safe]];
  return (
    <section className="hx ha" ref={r}>
      <div className="wrap ha-grid">
        <div className="ha-copy"><Tag>{t("h_tag")}</Tag><h1>{c.d_h}</h1><p>{c.d_p}</p><Ctas /></div>
        <div className="ha-stage">
          <div className="ha-phone" data-tilt="8">
            <div className="ha-notch" />
            <div className="ha-screen">
              <span className="ha-hi">{c.app_hi}</span><b className="ha-home">{c.app_home}</b>
              <div className="ha-tiles">
                {tiles.map(([k, ic, l, v]) => (
                  <button key={k} className={"ha-tile" + (st[k] || k === "gas" ? " on " + k : "")} onClick={() => k !== "gas" && setSt((s) => ({ ...s, [k]: !s[k] }))}>
                    <Icon name={ic} /><span>{l}</span><small>{v}</small>
                  </button>))}
              </div>
              <div className="ha-scene"><Icon name="sleep" />{t("sc_sleep")}</div>
            </div>
          </div>
          {AROUND.map(([id, k], i) => { const p = byId[id]; return (
            <TLink key={id} to={"/product/" + id} className={"ha-dev d" + i + (st[k] ? " live" : "")}><img src={img(p)} alt={f.nm(p)} /><small className="num">{fmt(p.sale)} {t("cur")}</small></TLink>); })}
        </div>
      </div>
    </section>
  );
}

/* ---------- ROOM: unseen-style architectural 3D room in Techi navy ---------- */
const RC = {
  en: { k: "A SMART HOME STUDIO · CAIRO", s: "Living smart,", a: "a home that gets you.", go: "Shop devices", tour: "3D home tour", scroll: "Scroll" },
  ar: { k: "استوديو البيوت الذكية · القاهرة", s: "Living smart,", a: "بيت بيفهمك.", go: "تسوّق الأجهزة", tour: "جولة في البيت 3D", scroll: "انزل" },
};
export function HeroRoom() {
  const { lang } = useApp();
  const c = RC[lang];
  const host = useRef(null), root = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    let room = null;
    import("../lib/room3d.js").then(({ createRoom }) => { room = createRoom(host.current); });
    const sc = () => { if (room) room.scroll = Math.min(1, scrollY / innerHeight); };
    addEventListener("scroll", sc, { passive: true });
    const t = setTimeout(() => setOn(true), 350);
    return () => { clearTimeout(t); removeEventListener("scroll", sc); room && room.destroy(); };
  }, []);
  const words = (s) => s.split(" ").map((w, i) => <span className="w" key={i}><span>{w}</span></span>);
  return (
    <section className={"hr" + (on ? " in" : "")} ref={root}>
      <div className="hr-gl" ref={host} aria-hidden="true" />
      <div className="hr-vign" aria-hidden="true" />
      <div className="hr-copy">
        <div className="hr-k">{c.k}</div>
        <h1>
          <span className="hr-s chrome" dir="ltr">{words(c.s)}</span>
          <span className="hr-a">{words(c.a)}</span>
        </h1>
        <TLink className="hr-go" to="/shop">{c.go} <Icon name="diag" /></TLink>
      </div>
      <div className="hr-bl"><TLink className="hr-round" to="/experience" aria-label={c.tour}>•••••</TLink><TLink className="hr-pill" to="/experience">{c.tour}</TLink></div>
      <div className="hr-bc" dir="ltr">TECHI <i>◎</i> HOME</div>
      <div className="hr-br" dir="ltr">©2026</div>
    </section>
  );
}
