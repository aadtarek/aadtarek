import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { fetchPrices } from "./lib/woo.js";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { I18N } from "./data/i18n.js";
import { byId, img, L, reduceMotion } from "./lib/util.js";
import { getHome } from "./lib/home3d.js";

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

export function AppProvider({ children }) {
  /* ---------- language ---------- */
  const [lang, setLangState] = useState(() => read("techi-lang", "en"));
  const t = useCallback((k) => I18N[lang][k], [lang]);
  const fields = useMemo(() => L(lang), [lang]);
  const dir = lang === "en" ? -1 : 1;
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "en" ? "ltr" : "rtl";
    window.TECHI_LANG = lang;
    write("techi-lang", lang);
    const h = getHome();
    if (h && h.setLang) h.setLang(lang);
  }, [lang]);

  /* ---------- theme: light / dark (follows the system until the visitor picks one) ---------- */
  const sysDark = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-color-scheme: dark)").matches;
  const [themePick, setThemePick] = useState(() => read("techi-theme", null));
  const [sys, setSys] = useState(sysDark);
  const theme = themePick || (sys ? "dark" : "light");
  useEffect(() => {
    const m = matchMedia("(prefers-color-scheme: dark)"), f = (e) => setSys(e.matches);
    m.addEventListener("change", f); return () => m.removeEventListener("change", f);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.content = theme === "dark" ? "#060E20" : "#EEF2F8";
  }, [theme]);
  const toggleTheme = useCallback(() => setThemePick((cur) => { const next = (cur || (sysDark() ? "dark" : "light")) === "dark" ? "light" : "dark"; write("techi-theme", next); return next; }), []);

  /* ---------- shared refs: smooth scroll ---------- */
  const lenis = useRef(null);

  /* ---------- toasts ---------- */
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((title, body, image, alert) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((x) => [{ id, title, body, image, alert }, ...x].slice(0, 4));
    setTimeout(() => setToasts((x) => x.filter((i) => i.id !== id)), 3900);
  }, []);

  /* ---------- cart ---------- */
  const [cart, setCart] = useState(() => read("techi-cart", []).filter((i) => byId[i.id]));
  const [cartOpen, setCartOpen] = useState(false);
  const openTimer = useRef(null);
  useEffect(() => write("techi-cart", cart), [cart]);
  const flyToCart = useCallback((fromEl, p) => {
    if (reduceMotion() || !fromEl) return;
    const s = fromEl.closest(".pcard,.bs-stage,.co-items li,.pp,.dev-card,.xp-item")?.querySelector("img") || fromEl;
    const target = document.getElementById("cartBtn");
    if (!target) return;
    const a = s.getBoundingClientRect(), b = target.getBoundingClientRect();
    const f = document.createElement("img"); f.src = img(p); f.className = "flyimg"; const sz = Math.min(a.width, 170);
    Object.assign(f.style, { width: sz + "px", height: sz + "px", left: a.left + (a.width - sz) / 2 + "px", top: a.top + (a.height - sz) / 2 + "px" });
    document.body.appendChild(f);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    gsap.timeline({ onComplete: () => f.remove() })
      .to(f, { x: dx * 0.4, y: dy * 0.4 - 160, scale: 0.75, rotation: -14, duration: 0.5, ease: "power2.out" })
      .to(f, { x: dx, y: dy, scale: 0.1, rotation: 0, opacity: 0.3, duration: 0.5, ease: "power3.in" });
  }, []);
  const addToCart = useCallback((id, qty = 1, fromEl) => {
    setCart((c) => { const it = c.find((i) => i.id === id); return it ? c.map((i) => (i.id === id ? { ...i, qty: i.qty + qty } : i)) : [...c, { id, qty }]; });
    const p = byId[id];
    flyToCart(fromEl, p);
    gsap.fromTo("#cartCount", { scale: 1 }, { scale: 1.5, duration: 0.2, yoyo: true, repeat: 1 });
    // the drawer opens by itself once the product has flown into the cart icon
    clearTimeout(openTimer.current);
    openTimer.current = setTimeout(() => setCartOpen(true), reduceMotion() ? 0 : 850);
  }, [flyToCart]);
  const clearCart = useCallback(() => setCart([]), []);

  /* live prices & stock from WooCommerce (Store API on the same domain) */
  const [catalogV, setCatalogV] = useState(0);
  useEffect(() => {
    fetchPrices().then((list) => {
      if (!Array.isArray(list)) return;
      list.forEach((x) => { const p = byId[x.id]; if (p && x.sale > 0) { p.sale = x.sale; p.reg = Math.max(x.reg, x.sale); p.inStock = x.in_stock; } });
      setCatalogV((v) => v + 1);
    }).catch(() => {});
  }, []);

  const setQty = useCallback((id, q) => setCart((c) => (q < 1 ? c.filter((i) => i.id !== id) : c.map((i) => (i.id === id ? { ...i, qty: q } : i)))), []);

  /* 3D notifications become toasts */
  useEffect(() => {
    const f = (e) => toast(I18N[window.TECHI_LANG || "ar"].now, e.detail.msg, null, e.detail.alert);
    window.addEventListener("techi:notify", f);
    return () => window.removeEventListener("techi:notify", f);
  }, [toast]);

  /* ---------- "power cut" page transition ---------- */
  const navigate = useNavigate();
  const busy = useRef(false);
  const wipe = useCallback((mid) => {
    if (reduceMotion() || busy.current) { mid(); return; }
    busy.current = true;
    const t1 = document.querySelector("#tr .t1"), t2 = document.querySelector("#tr .t2"), ln = document.querySelector("#tr b");
    const main = document.querySelector("main");
    gsap.timeline({ onComplete: () => { busy.current = false; } })
      .to(main, { rotateX: 8, rotateY: -14, z: -420, opacity: 0.4, transformPerspective: 1600, transformOrigin: "50% 40vh", duration: 0.7, ease: "power3.in" }, 0)
      .to([t1, t2], { yPercent: 0, duration: 0.6, ease: "expo.inOut" }, 0.1)
      .to(ln, { scaleX: 1, opacity: 1, duration: 0.35, ease: "power3.out" }, "-=.15")
      .add(() => { mid(); if (lenis.current) lenis.current.scrollTo(0, { immediate: true }); else window.scrollTo(0, 0); })
      .to(ln, { keyframes: [{ opacity: 0.2, duration: 0.05 }, { opacity: 1, duration: 0.05 }, { opacity: 0.4, duration: 0.06 }, { opacity: 1, duration: 0.08 }] })
      .fromTo(main, { rotateX: -6, rotateY: 14, z: -420, opacity: 0.4 }, { rotateX: 0, rotateY: 0, z: 0, opacity: 1, duration: 1.3, ease: "expo.out", clearProps: "transform,opacity" }, "+=.1")
      .to(t1, { yPercent: -101, duration: 0.9, ease: "expo.inOut" }, "<")
      .to(t2, { yPercent: 101, duration: 0.9, ease: "expo.inOut" }, "<")
      .to(ln, { scaleY: 40, opacity: 0, duration: 0.6, ease: "power2.out" }, "<")
      .set(ln, { scaleX: 0, scaleY: 1 });
  }, []);
  const go = useCallback((to) => { setCartOpen(false); wipe(() => navigate(to)); }, [wipe, navigate]);
  const setLang = useCallback((l) => wipe(() => setLangState(l)), [wipe]);

  const value = { lang, setLang, theme, toggleTheme, t, f: fields, dir, lenis, toast, toasts, cart, setQty, clearCart, addToCart, cartOpen, setCartOpen, go, catalogV };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
