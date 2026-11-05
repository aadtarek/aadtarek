import { PRODUCTS } from "../data/products.js";

/* ضع رقم واتساب الشركة هنا بصيغة دولية من غير + (مثال: 201012345678) */
export const WA_NUMBER = "201000000000";

export const P = PRODUCTS;
export const byId = Object.fromEntries(P.map((p) => [p.id, p]));
export const SHOP = P.filter((p) => p.cat !== "bundles").concat(P.filter((p) => p.cat === "bundles"));
export const CAT_KEYS = ["screens", "switches", "security", "voice", "bundles"];
export const CAT_IMG = { screens: 231759, switches: 231686, security: 231855, voice: 231737, bundles: 231792 };
export const D3MAP = { light_living: 231840, light_kitchen: 231840, light_bedroom: 231840, curtain_living: 231686, curtain_bed: 231711, ac: 231783, socket: 231689, hub: 231933, echo: 231737, panel: 231759, lock: 231855, motion: 231925, gas: 231916, valve: 231940 };
export const GHOST = { 231855: "LOCK", 231759: "PANEL", 231737: "ECHO", 231916: "GAS", 231689: "SOCKET", 231686: "CURTAIN", 231925: "MOTION", 231940: "VALVE" };
export const FEATURED = [231855, 231759, 231737, 231916, 231689, 231686, 231925, 231940];

export const fmt = (n) => n.toLocaleString("en-US");
export const off = (p) => (p.reg > p.sale ? Math.round((1 - p.sale / p.reg) * 100) : 0);
export const src = (f) => "/img/" + f;
export const img = (p, i = 0) => src(p.imgs[i] || p.imgs[0]);
export const pad = (n) => String(n).padStart(2, "0");
export const waLink = (s) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(s)}`;
export const catLink = (k) => (k === "bundles" ? "/bundles" : "/shop/" + k);

export const isFine = () => typeof window !== "undefined" && window.matchMedia("(hover:hover) and (pointer:fine)").matches;
export const reduceMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* product fields in the active language */
export const L = (lang) => {
  const en = lang === "en";
  return {
    nm: (p) => (en ? p.en : p.ar),
    vr: (p) => (en ? p.variantEn : p.variant),
    pt: (p) => (en ? p.pitchEn : p.pitch),
    ft: (p) => (en ? p.featEn : p.feat),
    its: (p) => (en ? p.itemsEn : p.items),
    sp: (p) => (en ? p.specsEn : p.specs),
    alt: (p) => (en ? p.ar : p.en),
  };
};
