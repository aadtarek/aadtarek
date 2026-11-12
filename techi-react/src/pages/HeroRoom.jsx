/* Home hero: an interactive Techi smart living room (3D scene in lib/room3d.js). */
import { useEffect, useRef, useState } from "react";
import { useApp } from "../context.jsx";
import { Icon } from "../components/Icons.jsx";
import { TLink } from "../components/ui.jsx";

const RC = {
  en: { k: "SMART HOME STUDIO · CAIRO", s: "Living smart,", a: "a home that gets you.", p: "This room is live. Tap the lights, curtains, TV or the lock and watch it respond, just like your home will.", go: "Shop devices", tour: "3D home tour",
    room: "Living room", live: "LIVE", devs: "devices", tap: "Tap to toggle", scenes: "Scenes",
    d: { lights: "Ceiling lights", lamp: "Floor lamp", curtains: "Curtains", tv: "TV", speaker: "Speaker", ac: "AC", lock: "Smart lock", vacuum: "Robot vacuum" },
    st: { on: "On", off: "Off", open: "Open", closed: "Closed", locked: "Locked", unlocked: "Unlocked" },
    sc: { home: "Welcome home", morning: "Morning", movie: "Movie", night: "Good night" } },
  ar: { k: "استوديو البيوت الذكية · القاهرة", s: "Living smart,", a: "بيت بيفهمك.", p: "الأوضة دي شغالة بجد. دوس على النور أو الستارة أو التلفزيون أو القفل وشوف بيتصرف إزاي، زي بيتك بالظبط.", go: "تسوّق الأجهزة", tour: "جولة في البيت 3D",
    room: "الليفينج", live: "مباشر", devs: "أجهزة", tap: "دوس عشان تشغّل/تقفل", scenes: "المشاهد",
    d: { lights: "نور السقف", lamp: "الأباجورة", curtains: "الستارة", tv: "التلفزيون", speaker: "السماعة", ac: "التكييف", lock: "القفل الذكي", vacuum: "المكنسة الروبوت" },
    st: { on: "شغّال", off: "مقفول", open: "مفتوحة", closed: "مقفولة", locked: "مقفول", unlocked: "مفتوح" },
    sc: { home: "أهلاً بيك", morning: "صباح الخير", movie: "وقت فيلم", night: "تصبح على خير" } },
};
const DEV = [["lights", "bolt"], ["lamp", "sun"], ["curtains", "stack"], ["tv", "screen"], ["speaker", "voice"], ["ac", "target"], ["lock", "shield"], ["vacuum", "house"]];
const SCN = [["home", "arrive"], ["morning", "sun"], ["movie", "screen"], ["night", "moon"]];
const stateTxt = (c, k, v) => (k === "curtains" ? (v ? c.st.open : c.st.closed) : k === "lock" ? (v ? c.st.locked : c.st.unlocked) : v ? c.st.on : c.st.off);

export default function HeroRoom() {
  const { lang, theme } = useApp();
  const c = RC[lang];
  const host = useRef(null), roomRef = useRef(null), tip = useRef(null);
  const [on, setOn] = useState(false);
  const [st, setSt] = useState(null);
  const [hov, setHov] = useState(null);
  const [scene, setScene] = useState(null);
  useEffect(() => {
    let room = null, offs = [], alive = true;
    import("../lib/room3d.js").then(({ createRoom }) => {
      if (!alive) return;
      room = createRoom(host.current, { rtl: lang === "ar", night: document.documentElement.dataset.theme === "dark" }); roomRef.current = room;
      if (!room) return;
      offs.push(room.onChange((s) => setSt(s)));
      offs.push(room.onHover((d, x, y) => { setHov(d); if (tip.current && d) tip.current.style.transform = `translate(${x}px,${y}px)`; }));
      setTimeout(() => room && room.wake(), 500);
    });
    const sc = () => { if (room) room.scroll = Math.min(1, scrollY / innerHeight); };
    addEventListener("scroll", sc, { passive: true });
    const t = setTimeout(() => setOn(true), 350);
    return () => { alive = false; clearTimeout(t); removeEventListener("scroll", sc); offs.forEach((f) => f()); room && room.destroy(); roomRef.current = null; };
  }, []);
  useEffect(() => { if (roomRef.current) roomRef.current.themeNight = theme === "dark"; }, [theme]);
  const toggle = (k) => { roomRef.current && roomRef.current.toggle(k); setScene(null); };
  const runScene = (k) => { roomRef.current && roomRef.current.scene(k); setScene(k); };
  const words = (s) => s.split(" ").flatMap((w, i) => [i ? " " : null, <span className="w" key={i}><span>{w}</span></span>]);
  const n = st ? DEV.filter(([k]) => (k === "lock" ? false : st[k])).length : 0;
  return (
    <section className={"hr hr2" + (on ? " in" : "") + ((st && st.night) || theme === "dark" ? " dark" : "")}>
      <div className="hr-gl" ref={host} />
      <div className="hr-vign" aria-hidden="true" />
      <div className="hr-copy">
        <div className="hr-k"><i className="led" />{c.k}</div>
        <h1>
          <span className="hr-s chrome" dir="ltr">{words(c.s)}</span>
          <span className="hr-a">{words(c.a)}</span>
        </h1>
        <p className="hr-p">{c.p}</p>
        <div className="hr-ctas">
          <TLink className="hr-go" to="/shop">{c.go} <Icon name="diag" /></TLink>
          <TLink className="hr-pill" to="/experience">{c.tour}</TLink>
        </div>
      </div>
      <div className={"hr-tip" + (hov && st ? " on" : "")} ref={tip} aria-hidden="true">
        {hov && st && <><b>{c.d[hov]}</b><span className={st[hov] ? "y" : ""}>{stateTxt(c, hov, st[hov])}</span><small>{c.tap}</small></>}
      </div>
      {st && (
        <aside className="hr-panel" aria-label={c.room}>
          <div className="hp-head"><span><b>{c.room}</b><small className="num">{n}/{DEV.length - 1} {c.devs}</small></span><span className="hp-live"><i />{c.live}</span></div>
          <div className="hp-scenes" role="group" aria-label={c.scenes}>
            {SCN.map(([k, ic]) => <button key={k} className={scene === k ? "on" : ""} onClick={() => runScene(k)}><Icon name={ic} />{c.sc[k]}</button>)}
          </div>
          <div className="hp-devs">
            {DEV.map(([k, ic]) => {
              const v = st[k], active = v;
              return (
                <button key={k} className={"hp-dev" + (active ? " on" : "") + (hov === k ? " hv" : "")} onClick={() => toggle(k)} aria-pressed={!!v}>
                  <span className="hd-ic"><Icon name={ic} /></span>
                  <span className="hd-t"><b>{c.d[k]}</b><small>{stateTxt(c, k, v)}</small></span>
                </button>
              );
            })}
          </div>
        </aside>
      )}
    </section>
  );
}
