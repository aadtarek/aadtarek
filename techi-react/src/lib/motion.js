import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isFine, reduceMotion } from "./util.js";

gsap.registerPlugin(ScrollTrigger);
export { gsap, ScrollTrigger };

/* shared reveal choreography for any page root */
export function reveals(root, dir = 1) {
  if (reduceMotion()) return;
  const $$ = (s) => [...root.querySelectorAll(s)];
  const head = root.querySelector(".phead");
  if (head) {
    gsap.from(head.querySelectorAll("[data-split] .w>span"), { yPercent: 120, duration: 1.4, ease: "expo.out", stagger: 0.08, delay: 0.2 });
    gsap.from(head.querySelectorAll("[data-fade],.tag"), { y: 30, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.1, delay: 0.5 });
  }
  $$("[data-split]").filter((el) => !el.closest(".phead,.hero")).forEach((el) =>
    gsap.from(el.querySelectorAll(".w>span"), { yPercent: 120, duration: 1.3, ease: "expo.out", stagger: 0.06, scrollTrigger: { trigger: el, start: "top 88%" } }));
  $$("[data-fade]").filter((el) => !el.closest(".phead,#hero")).forEach((el) =>
    gsap.from(el, { y: 40, opacity: 0, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" } }));
  $$("[data-stagger]").forEach((g) =>
    gsap.from(g.children, { y: 80, opacity: 0, duration: 1.2, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: g, start: "top 85%" } }));
  $$(".t3d-frame:not(.full)").forEach((f) =>
    gsap.from(f, { clipPath: "inset(18% 14% 18% 14% round 60px)", duration: 1.8, ease: "expo.out", scrollTrigger: { trigger: f, start: "top 85%" } }));
  const su = root.querySelector("#suites");
  if (su) gsap.from(su.children, { y: 120, opacity: 0, duration: 1.4, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: su, start: "top 85%" } });
  const fin = root.querySelector("#finale");
  if (fin) {
    const g = fin.querySelector(".giant");
    gsap.from(g, { yPercent: 30, opacity: 0, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: fin, start: "top 80%" } });
    const mv = (e) => { const r = g.getBoundingClientRect(); g.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%"); g.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%"); };
    fin.addEventListener("pointermove", mv);
    if (!isFine()) gsap.to(g, { "--mx": "100%", duration: 4, yoyo: true, repeat: -1, ease: "sine.inOut" });
  }
  magnetic(root);
}

export function magnetic(root) {
  if (!isFine()) return;
  root.querySelectorAll("[data-magnetic]").forEach((el) => {
    const xT = gsap.quickTo(el, "x", { duration: 0.8, ease: "elastic.out(1,.4)" }), yT = gsap.quickTo(el, "y", { duration: 0.8, ease: "elastic.out(1,.4)" });
    el.addEventListener("pointermove", (e) => { const r = el.getBoundingClientRect(); xT((e.clientX - r.left - r.width / 2) * 0.35); yT((e.clientY - r.top - r.height / 2) * 0.45); });
    el.addEventListener("pointerleave", () => { xT(0); yT(0); });
  });
}

/* move the mesh globe: x,y in fractions of the half-viewport, s = scale */
export function bgPlace(bg, x, y, s, d = 1.8) {
  if (!bg) return;
  const hw = bg.halfWidth();
  const target = { x: x * hw, y: y * hw * (innerHeight / innerWidth), z: 0 };
  if (reduceMotion()) { bg.g.position.set(target.x, target.y, 0); bg.g.scale.setScalar(s); return; }
  gsap.to(bg.g.position, { ...target, duration: d, ease: "expo.inOut", overwrite: "auto" });
  gsap.to(bg.g.scale, { x: s, y: s, z: s, duration: d, ease: "expo.inOut", overwrite: "auto" });
}
export function bgTo(bg, v, d = 1.6) {
  if (!bg) return;
  if (reduceMotion()) Object.assign(bg, v);
  else gsap.to(bg, { duration: d, ease: "expo.inOut", overwrite: "auto", ...v });
}
