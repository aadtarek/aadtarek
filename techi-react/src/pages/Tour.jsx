import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { gsap } from "gsap";
import { useApp } from "../context.jsx";
import { Icon } from "../components/Icons.jsx";
import { AddButton, TLink } from "../components/ui.jsx";
import { D3MAP, byId, fmt, img, isFine, pad, reduceMotion } from "../lib/util.js";
import { getHome } from "../lib/home3d.js";

const HOLD_MS = 1100;

/* letters rise out of a mask, one by one */
function Stacked({ text, className }) {
  /* Arabic letters must stay joined, so Arabic rises word by word */
  const arabic = /[؀-ۿ]/.test(text);
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <span className={"stacked " + (className || "")} aria-label={text}>
      {words.map((w, wi) => (
        <span className="wd" key={wi} aria-hidden="true">
          {(arabic ? [w] : [...w]).map((ch, i) => <span className="ch" key={i}><span>{ch}</span></span>)}
        </span>
      ))}
    </span>
  );
}

export default function Tour() {
  const { t, f, lang, bg } = useApp();
  const { dev } = useParams();
  const host = useRef(null), ring = useRef(null), ringFill = useRef(null), title = useRef(null), panel = useRef(null);
  const holdTween = useRef(null), busy = useRef(false);
  const [ok, setOk] = useState(true);
  const [room, setRoom] = useState(null);
  const [hover, setHover] = useState(null);
  const [sel, setSel] = useState(null);
  const [did, setDid] = useState("");
  const h = getHome();
  if (h && h.lang !== lang) h.setLang(lang);
  const rooms = h ? h.rooms : [];
  const devs = h ? h.devices : [];
  const cur = rooms.find((r) => r.id === room);

  /* the cinematic jump: liquid distortion peaks while the camera flies */
  const travel = useCallback((go) => {
    if (!h || busy.current) return;
    busy.current = true; setSel(null);
    const done = () => { busy.current = false; };
    if (reduceMotion()) { go(); done(); return; }
    gsap.killTweensOf(h.fx);
    gsap.timeline({ onComplete: done })
      .to(h.fx, { p: 1, duration: 0.85, ease: "power3.in" })
      .add(go, 0.35)
      .to(h.fx, { p: 0, hold: 0, duration: 1.3, ease: "power3.out" });
  }, [h]);
  const enter = useCallback((id) => travel(() => h.enterRoom(id, 1.9)), [travel, h]);
  const leave = useCallback(() => travel(() => h.overview(1.9)), [travel, h]);

  /* mount the house in tour mode */
  useEffect(() => {
    if (!h) { setOk(false); return; }
    document.body.classList.add("tour-on");
    h.setLang && h.setLang(lang);
    h.mount(host.current);
    h.setMode("tour");
    if (bg.current) bg.current.dim = 0;
    const offRoom = h.onRoom(({ room, hover }) => { setRoom(room); setHover(hover); });
    const offDev = h.on((id, text) => { if (id) { setSel(id); setDid(text); } });
    let timer;
    if (dev) { const r = h.rooms.find((x) => x.devices.includes(dev)); if (r) timer = setTimeout(() => { enter(r.id); setTimeout(() => h.activate(dev, false), 2200); }, 1400); }
    if (!reduceMotion()) gsap.fromTo(h.fx, { p: 1 }, { p: 0, duration: 2.2, ease: "power3.out" });
    return () => { clearTimeout(timer); offRoom(); offDev(); h.unmount(); document.body.classList.remove("tour-on"); if (bg.current) gsap.to(bg.current, { dim: 0.55, duration: 1 }); };
  }, []); // eslint-disable-line

  /* click & hold a room to enter it */
  useEffect(() => {
    const el = host.current; if (!el || !h) return;
    const start = (e) => {
      if (room || !h.hoverRoom || busy.current) return;
      const id = h.hoverRoom;
      holdTween.current && holdTween.current.kill();
      holdTween.current = gsap.timeline()
        .to(h.fx, { hold: 1, duration: HOLD_MS / 1000, ease: "none" }, 0)
        .fromTo(ringFill.current, { strokeDashoffset: 189 }, { strokeDashoffset: 0, duration: HOLD_MS / 1000, ease: "none" }, 0)
        .add(() => enter(id));
    };
    const cancel = () => {
      if (!holdTween.current) return; holdTween.current.kill(); holdTween.current = null;
      if (!busy.current) { gsap.to(h.fx, { hold: 0, duration: 0.5 }); gsap.to(ringFill.current, { strokeDashoffset: 189, duration: 0.4 }); }
    };
    const label = (e) => { const l = e.target.closest && e.target.closest(".tour-label"); if (l && !room && !busy.current) enter(l.dataset.room); };
    el.addEventListener("pointerdown", start); addEventListener("pointerup", cancel); el.addEventListener("pointerleave", cancel); el.addEventListener("click", label);
    return () => { el.removeEventListener("pointerdown", start); removeEventListener("pointerup", cancel); el.removeEventListener("pointerleave", cancel); el.removeEventListener("click", label); };
  }, [room, h, enter]);

  /* hold ring follows the pointer */
  useEffect(() => {
    if (!isFine() || reduceMotion()) return;
    const xT = gsap.quickTo(ring.current, "x", { duration: 0.25, ease: "power3" }), yT = gsap.quickTo(ring.current, "y", { duration: 0.25, ease: "power3" });
    const mv = (e) => { xT(e.clientX); yT(e.clientY); };
    addEventListener("pointermove", mv);
    return () => removeEventListener("pointermove", mv);
  }, []);

  /* room title + product list choreography */
  useLayoutEffect(() => {
    if (!room || reduceMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(title.current.querySelectorAll(".ch>span"), { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.035, delay: 0.9 });
      gsap.from(title.current.querySelectorAll(".tour-meta>*"), { opacity: 0, y: 14, duration: 0.8, ease: "power3.out", stagger: 0.08, delay: 1.1 });
      gsap.from(panel.current.querySelectorAll(".tp-row"), { opacity: 0, x: 40 * (lang === "en" ? 1 : -1), duration: 0.9, ease: "expo.out", stagger: 0.07, delay: 1.2 });
    });
    return () => ctx.revert();
  }, [room, lang]);

  useEffect(() => { const k = (e) => { if (e.key === "Escape" && room) leave(); }; addEventListener("keydown", k); return () => removeEventListener("keydown", k); }, [room, leave]);

  const idx = cur ? rooms.findIndex((r) => r.id === cur.id) : -1;
  const nextRoom = idx >= 0 ? rooms[(idx + 1) % rooms.length] : null;
  return (
    <div className={"tour" + (room ? " in-room" : "") + (hover && !room ? " hovering" : "")}>
      <div className="tour-host" ref={host} data-lenis-prevent="">{!ok && <div className="t3d-fallback">{t("no3d")}</div>}</div>

      <div className={"hold-ring" + (hover && !room ? " show" : "")} ref={ring} aria-hidden="true">
        <svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" className="track" /><circle cx="32" cy="32" r="30" className="fill" ref={ringFill} /></svg>
        <span>{t("tour_hold")}</span>
      </div>

      {/* overview chrome */}
      <div className="tour-ui">
        <div className="tour-top">
          {room ? (
            <div className="tour-title" ref={title} key={room + lang}>
              <span className="tag"><i className="led" /><bdi dir="ltr">{pad(cur.n)} / {pad(rooms.length)}</bdi></span>
              <h1><Stacked text={cur.name} /></h1>
              <div className="tour-meta"><span>{cur.devices.length} {t("tour_devices")}</span><span>{t("tour_drag_room")}</span></div>
            </div>
          ) : (
            <div className="tour-intro">
              <span className="tag"><i className="led" />{t("tour_tag")}</span>
              <h1><Stacked text={t("tour_h")} key={lang} /></h1>
              <p>{t("tour_p")}</p>
            </div>
          )}
        </div>

        <div className="tour-bottom">
          <div className="tour-hint">{room ? <button className="tour-back" onClick={leave}><Icon name="arrow" /><span>{t("tour_back")}</span></button> : <><span>{t("tour_drag")}</span><span className="sep" /><span>{isFine() ? t("tour_hold_hint") : t("tour_tap_hint")}</span></>}</div>
          <nav className="tour-nav" aria-label={t("tour_rooms")}>
            {rooms.map((r) => (
              <button key={r.id} className={(room === r.id ? "on " : "") + (hover === r.id ? "hv" : "")} onClick={() => (room === r.id ? null : enter(r.id))}>
                <i>{pad(r.n)}</i><span>{r.name}</span>
              </button>
            ))}
          </nav>
          {room && nextRoom && <button className="tour-next" onClick={() => enter(nextRoom.id)}><span>{t("tour_next")}</span><b>{nextRoom.name}</b><Icon name="arrow" /></button>}
        </div>
      </div>

      {/* products in this room */}
      {room && (
        <aside className="tour-panel" ref={panel} key={room + lang}>
          <span className="tp-head">{t("tour_in_room")}</span>
          {cur.devices.map((id, i) => {
            const d = devs.find((x) => x.id === id), p = byId[D3MAP[id]], open = sel === id;
            return (
              <div key={id} className={"tp-row" + (open ? " open" : "")} onMouseEnter={() => h.focusDevice(id)} onMouseLeave={() => h.focusDevice(null)}>
                <button className="tp-main" onClick={() => { h.activate(id, false); setSel(id); }}>
                  <i className="num">{pad(i + 1)}</i>
                  <img src={img(p)} alt="" />
                  <span className="tp-txt"><b>{d.name}</b><small>{f.nm(p)}</small></span>
                  <span className="tp-pr num">{fmt(p.sale)}<em>{t("cur")}</em></span>
                </button>
                {open && (
                  <div className="tp-more">
                    <p className="tp-did"><span className="led" />{did}</p>
                    <div className="tp-acts">
                      <AddButton id={p.id} className="btn btn-white tp-btn"><Icon name="plus" />{t("add")}</AddButton>
                      <TLink className="btn btn-line tp-btn" to={"/product/" + p.id}>{t("details")}</TLink>
                      <button className="btn btn-line tp-btn" onClick={() => h.activate(id, false)}>{t("tour_again")}</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </aside>
      )}
    </div>
  );
}
