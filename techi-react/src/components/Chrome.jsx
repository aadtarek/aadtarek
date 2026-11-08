import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { useApp } from "../context.jsx";
import { Icon } from "./Icons.jsx";
import { BT, TLink } from "./ui.jsx";
import { byId, fmt, img, isFine, pad, reduceMotion, waLink } from "../lib/util.js";
import { createBG } from "../lib/bgmesh.js";

const NAV = [["/", "nav_home", "home"], ["/shop", "nav_shop", "shop"], ["/bundles", "nav_bundles", "bundles"], ["/experience", "nav_xp", "experience"], ["/about", "nav_about", "about"], ["/my-home", "nav_myhome", "my-home"]];
export function routeKey(pathname) {
  if (pathname.startsWith("/product/")) { const p = byId[+pathname.split("/")[2]]; return p && p.cat === "bundles" ? "bundles" : "shop"; }
  const k = pathname.split("/")[1]; return k || "home";
}

/* ---------- living mesh background ---------- */
export function MeshBG() {
  const { bg } = useApp();
  const cv = useRef(null);
  useEffect(() => { if (!bg.current) bg.current = createBG(cv.current); }, [bg]);
  return <canvas id="bg" ref={cv} aria-hidden="true" />;
}

/* ---------- preloader: the logo's network unfolds into the globe ---------- */
export function Preloader({ onReady }) {
  const { bg } = useApp();
  const el = useRef(null), num = useRef(null);
  useEffect(() => {
    const b = bg.current;
    if (!b || reduceMotion()) { if (b) b.morph = 1; onReady(); el.current && el.current.remove(); return; }
    b.morph = 0; b.dim = 0; b.g.position.set(0, 0, 0); b.g.scale.setScalar(innerWidth < 700 ? 0.7 : 0.9);
    const o = { v: 0 };
    const tl = gsap.timeline()
      .to(b, { dim: 1, duration: 1, ease: "power2.out" })
      .to(o, { v: 100, duration: 1.8, ease: "power2.inOut", onUpdate: () => { if (num.current) num.current.textContent = String(Math.round(o.v)).padStart(3, "0"); } }, 0)
      .to(el.current.querySelector(".pre-in"), { opacity: 0, y: -20, duration: 0.5, ease: "power3.in" }, "+=.1")
      .to(b, { morph: 1, duration: 2.2, ease: "power2.inOut" }, "-=.2")
      .add(() => onReady(), "-=1.4")
      .to(el.current, { opacity: 0, duration: 0.8, onComplete: () => el.current && (el.current.style.display = "none") }, "<");
    return () => tl.kill();
  }, []); // eslint-disable-line
  return <div className="pre" ref={el} aria-hidden="true"><div className="pre-in"><span className="pre-l">TECHI · ZIGBEE MESH</span><span className="pre-n num" ref={num}>000</span></div></div>;
}

export const Transition = () => <div className="tr" id="tr" aria-hidden="true"><i className="t1" /><i className="t2" /><b /></div>;

/* ---------- cursor ---------- */
export function Cursor() {
  const el = useRef(null), txt = useRef(null);
  const { pathname } = useLocation();
  useEffect(() => {
    if (!isFine() || reduceMotion()) return;
    const c = el.current, cx = gsap.quickTo(c, "x", { duration: 0.12 }), cy = gsap.quickTo(c, "y", { duration: 0.12 });
    const mv = (e) => { document.body.classList.add("cur-on"); cx(e.clientX); cy(e.clientY); };
    const over = (e) => { const t = e.target.closest && e.target.closest("[data-cursor]"); if (t) { txt.current.textContent = t.dataset.cursor; c.classList.add("big"); } else c.classList.remove("big"); };
    addEventListener("pointermove", mv, { passive: true }); document.addEventListener("pointerover", over);
    return () => { removeEventListener("pointermove", mv); document.removeEventListener("pointerover", over); };
  }, []);
  useEffect(() => { el.current && el.current.classList.remove("big"); }, [pathname]);
  return <div className="cur" ref={el} aria-hidden="true"><span className="ct" ref={txt} /></div>;
}

/* ---------- header ---------- */
export function Header({ onMenu }) {
  const { t, lang, setLang, cart, setCartOpen } = useApp();
  const { pathname } = useLocation();
  const cap = useRef(null), pill = useRef(null);
  const [hide, setHide] = useState(false);
  const [clock, setClock] = useState("");
  const rk = routeKey(pathname);
  useLayoutEffect(() => {
    const measure = () => {
      const on = cap.current && cap.current.querySelector("a.on");
      if (!pill.current) return;
      if (!on) { pill.current.style.opacity = 0; return; }
      pill.current.style.opacity = 1; pill.current.style.left = on.offsetLeft + "px"; pill.current.style.width = on.offsetWidth + "px";
    };
    measure();
    const ro = new ResizeObserver(measure); [...cap.current.children].forEach((c) => ro.observe(c));
    document.fonts && document.fonts.ready.then(measure);
    return () => ro.disconnect();
  }, [rk, lang]);
  useEffect(() => {
    let last = 0; const f = () => { const y = scrollY; setHide(y > last && y > 300); last = y; };
    addEventListener("scroll", f, { passive: true });
    const tick = () => { try { setClock("CAIRO " + new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Cairo", hour: "2-digit", minute: "2-digit" }).format(new Date())); } catch (e) {} };
    tick(); const iv = setInterval(tick, 20000);
    return () => { removeEventListener("scroll", f); clearInterval(iv); };
  }, []);
  const count = cart.reduce((a, i) => a + i.qty, 0);
  return (
    <header className={"hdr" + (hide ? " hide" : "")}>
      <div className="wrap">
        <TLink to="/" aria-label="Techi"><img className="logo" src="/img/logo-white.png" alt="Techi" /></TLink>
        <nav className="capsule" ref={cap} aria-label="Menu">
          <span className="pill" ref={pill} />
          {NAV.map(([to, k, r]) => <TLink key={to} to={to} className={rk === r ? "on" : ""}>{t(k)}</TLink>)}
        </nav>
        <div className="hdr-end">
          <span className="clock num">{clock}</span>
          <button className="icon-btn lang-btn" aria-label={t("lang_label")} onClick={() => setLang(lang === "en" ? "ar" : "en")}>{t("lang")}</button>
          <button className="icon-btn" id="cartBtn" onClick={() => setCartOpen(true)}><Icon name="bag" /><span className="hide-sm">{t("cart")}</span><span className="cart-count num" id="cartCount">{count}</span></button>
          <button className="icon-btn menu-btn" aria-label={t("menu")} onClick={onMenu}><Icon name="menu" /></button>
        </div>
      </div>
    </header>
  );
}

export function MobileMenu({ open, onClose }) {
  const { t, lenis } = useApp();
  const el = useRef(null);
  useEffect(() => {
    const m = el.current; if (!m) return;
    if (open) {
      m.hidden = false; lenis.current && lenis.current.stop();
      gsap.fromTo(m, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.9, ease: "expo.inOut" });
      gsap.from(m.querySelectorAll("a span"), { yPercent: 110, duration: 1, ease: "expo.out", stagger: 0.06, delay: 0.35 });
    } else if (!m.hidden) {
      lenis.current && lenis.current.start();
      gsap.to(m, { clipPath: "inset(100% 0 0% 0)", duration: 0.7, ease: "expo.inOut", onComplete: () => (m.hidden = true) });
    }
  }, [open]); // eslint-disable-line
  return (
    <div className="mmenu" ref={el} hidden>
      <button className="icon-btn close-m" aria-label={t("close")} onClick={onClose}><Icon name="close" /></button>
      {NAV.map(([to, k], i) => <TLink key={to} to={to} onClick={onClose}><span>{t(k)}</span><em className="num">{pad(i + 1)}</em></TLink>)}
    </div>
  );
}

/* ---------- cart drawer ---------- */
export function CartDrawer() {
  const { t, f, cart, setQty, cartOpen, setCartOpen, lenis, dir } = useApp();
  const list = useRef(null);
  useEffect(() => {
    if (cartOpen) { lenis.current && lenis.current.stop(); if (!reduceMotion() && list.current) gsap.from(list.current.children, { x: -60 * dir, opacity: 0, stagger: 0.07, duration: 0.8, ease: "expo.out", delay: 0.2 }); }
    else lenis.current && lenis.current.start();
  }, [cartOpen]); // eslint-disable-line
  useEffect(() => { const k = (e) => e.key === "Escape" && setCartOpen(false); addEventListener("keydown", k); return () => removeEventListener("keydown", k); }, [setCartOpen]);
  let total = 0, saved = 0, count = 0;
  cart.forEach((i) => { const p = byId[i.id]; total += p.sale * i.qty; saved += (p.reg - p.sale) * i.qty; count += i.qty; });
  const order = t("order_hi") + "\n" + cart.map((i) => `• ${f.nm(byId[i.id])} (${f.vr(byId[i.id])}) × ${i.qty} = ${fmt(byId[i.id].sale * i.qty)} ${t("cur")}`).join("\n") + `\n\n${t("order_total")}: ${fmt(total)} ${t("cur")}`;
  return (
    <>
      <div className={"scrim" + (cartOpen ? " on" : "")} onClick={() => setCartOpen(false)} />
      <aside className={"drawer" + (cartOpen ? " on" : "")} data-lenis-prevent="" aria-label={t("cart")}>
        <div className="dh"><h3><span>{t("cart")}</span> <em className="num">{count ? pad(count) : ""}</em></h3><button className="x" aria-label={t("close")} onClick={() => setCartOpen(false)}><Icon name="close" /></button></div>
        <div className="dl" ref={list}>
          {!cart.length ? (
            <div className="dempty"><Icon name="bag" /><b>{t("cart_empty")}</b><span>{t("cart_empty_p")}</span><TLink className="btn btn-white" to="/shop"><BT>{t("hero_cta1")}</BT></TLink></div>
          ) : cart.map((i) => { const p = byId[i.id]; return (
            <div className="ci" key={p.id}>
              <img src={img(p)} alt="" />
              <div><h4>{f.nm(p)}</h4><div className="cv">{f.vr(p)}</div>
                <div className="q"><button aria-label={t("qty_less")} onClick={() => setQty(p.id, i.qty - 1)}>−</button><span className="num">{i.qty}</span><button aria-label={t("qty_more")} onClick={() => setQty(p.id, i.qty + 1)}>+</button><button className="rm" onClick={() => setQty(p.id, 0)}>{t("remove")}</button></div></div>
              <div className="lp num">{fmt(p.sale * i.qty)}</div>
            </div>); })}
        </div>
        {cart.length > 0 && (
          <div className="df">
            {saved > 0 && <div className="r s"><span>{t("saved")}</span><span className="num">{fmt(saved)} {t("cur")}</span></div>}
            <div className="r t"><span>{t("total")}</span><span className="num">{fmt(total)} {t("cur")}</span></div>
            <TLink className="btn btn-white" to="/checkout"><BT>{t("checkout")}</BT><Icon name="arrow" /></TLink>
            <a className="d-wa" href={waLink(order)} target="_blank" rel="noopener"><Icon name="wa" />{t("order_on_wa")}</a>
          </div>
        )}
      </aside>
    </>
  );
}

export function Toasts() {
  const { toasts } = useApp();
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((x) => (
        <div key={x.id} className={"toast toast-in" + (x.alert ? " alert" : "")}>
          <div className="ti">{x.image ? <img src={x.image} alt="" /> : x.alert ? "!" : <img src="/img/logo-navy.png" alt="" />}</div>
          <div><small>{x.title}</small><span>{x.body}</span></div>
        </div>
      ))}
    </div>
  );
}

export function Footer() {
  const { t } = useApp();
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="fg">
          <div><img src="/img/logo-white.png" alt="Techi" style={{ height: 28, width: "auto", marginBottom: 18 }} /><p className="fp">{t("foot_p")}</p></div>
          <div><h5>{t("nav_shop")}</h5>{["screens", "switches", "security", "voice"].map((k) => <TLink key={k} to={"/shop/" + k}>{t("cats")[k]}</TLink>)}</div>
          <div><h5>Techi</h5><TLink to="/bundles">{t("nav_bundles")}</TLink><TLink to="/experience">{t("nav_xp")}</TLink><TLink to="/about">{t("nav_about")}</TLink></div>
          <div><h5>{t("foot_contact")}</h5><a href={waLink("Techi")} target="_blank" rel="noopener">WhatsApp</a><a href="https://techi-eg.com/" target="_blank" rel="noopener">techi-eg.com</a></div>
        </div>
        <div className="legal"><span>© {new Date().getFullYear()} Techi. All Rights Reserved.</span><span className="num">ZIGBEE 3.0 · TUYA · ALEXA · GOOGLE HOME</span></div>
      </div>
    </footer>
  );
}
