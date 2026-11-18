/* 3D home: walk through a realistic Techi apartment in first person and try every device. */
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useApp } from "../context.jsx";
import { Icon } from "../components/Icons.jsx";
import { AddButton, TLink } from "../components/ui.jsx";
import { D3MAP, byId, fmt, img } from "../lib/util.js";

const WT = {
  en: {
    tag: "TECHI HOME · WALK-THROUGH", h: "Walk through a Techi home.", load: "Opening the door…",
    hint: "Drag to look around · Click the floor to walk · W A S D to move", hintM: "Drag to look · Tap the floor to walk",
    rooms: "Rooms", devs: "Devices in this home", tryIt: "Try it", add: "Add to cart", details: "Details", close: "Close", tap: "Tap any glowing dot",
  },
  ar: {
    tag: "بيت TECHI · جولة حقيقية", h: "اتمشى جوه بيت Techi.", load: "بنفتحلك الباب…",
    hint: "اسحب عشان تبص حواليك · دوس على الأرض عشان تمشي · W A S D للحركة", hintM: "اسحب عشان تبص · دوس على الأرض عشان تمشي",
    rooms: "الأوض", devs: "الأجهزة في البيت", tryIt: "جرّبه", add: "أضف للسلة", details: "التفاصيل", close: "اقفل", tap: "دوس على أي نقطة منوّرة",
  },
};

export default function Tour() {
  const { t, f, lang } = useApp();
  const c = WT[lang] || WT.en;
  const { dev } = useParams();
  const host = useRef(null), walk = useRef(null);
  const [ok, setOk] = useState(true);
  const [pct, setPct] = useState(0);
  const [ready, setReady] = useState(false);
  const [room, setRoom] = useState(null);
  const [sel, setSel] = useState(null);
  const [did, setDid] = useState("");
  const [list, setList] = useState(false);

  useEffect(() => {
    document.body.classList.add("tour-on");
    let w = null, alive = true;
    import("../lib/walk3d.js").then(({ createWalk }) => {
      if (!alive) return;
      w = createWalk(host.current, { lang });
      if (!w) { setOk(false); return; }
      walk.current = w;
      w.on("progress", (p) => setPct(p));
      w.on("room", setRoom);
      w.on("device", (id) => { setSel(id); setDid(""); setList(false); });
      w.on("ready", () => { setReady(true); if (dev) setTimeout(() => w.select(dev), 600); });
    });
    return () => { alive = false; document.body.classList.remove("tour-on"); w && w.destroy(); walk.current = null; };
  }, []); // eslint-disable-line
  useEffect(() => { walk.current && walk.current.setLang(lang); }, [lang]);
  useEffect(() => { const k = (e) => e.key === "Escape" && setSel(null); addEventListener("keydown", k); return () => removeEventListener("keydown", k); }, []);

  const w = walk.current;
  const rooms = w ? w.rooms : [];
  const devices = w ? w.devices : [];
  const d = sel && devices.find((x) => x.id === sel);
  const p = d && byId[D3MAP[d.id]];
  const mobile = typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches;

  return (
    <div className={"walk" + (ready ? " ready" : "")}>
      <div className="walk-host" ref={host} data-lenis-prevent="">{!ok && <div className="t3d-fallback">{t("no3d")}</div>}</div>

      <div className={"walk-load" + (ready ? " done" : "")} aria-hidden={ready}>
        <span className="tag"><i className="led" />{c.tag}</span>
        <b>{c.load}</b>
        <span className="walk-bar"><i style={{ transform: `scaleX(${Math.max(0.04, pct)})` }} /></span>
        <span className="num">{Math.round(pct * 100)}%</span>
      </div>

      <div className="walk-top">
        <span className="tag"><i className="led" />{c.tag}</span>
        <h1>{room ? (rooms.find((r) => r.id === room) || {}).name?.[lang] : c.h}</h1>
      </div>

      <div className="walk-bottom">
        <p className="walk-hint">{mobile ? c.hintM : c.hint}</p>
        <nav className="walk-rooms" aria-label={c.rooms}>
          {rooms.map((r) => <button key={r.id} className={room === r.id ? "on" : ""} onClick={() => w.goRoom(r.id)}>{r.name[lang]}</button>)}
          <button className={"walk-devbtn" + (list ? " on" : "")} onClick={() => setList((v) => !v)} aria-expanded={list}><Icon name="target" />{devices.length}</button>
        </nav>
      </div>

      {list && (
        <aside className="walk-list" aria-label={c.devs}>
          <b>{c.devs}</b>
          {devices.map((x) => { const pp = byId[D3MAP[x.id]]; return (
            <button key={x.id} onClick={() => w.select(x.id)}>
              <img src={img(pp)} alt="" /><span><b>{x.name[lang]}</b><small>{(rooms.find((r) => r.id === x.room) || {}).name?.[lang]}</small></span>
            </button>
          ); })}
        </aside>
      )}

      {d && p && (
        <aside className="walk-card" key={d.id}>
          <button className="walk-x" aria-label={c.close} onClick={() => setSel(null)}><Icon name="close" /></button>
          <div className="wc-img"><img src={img(p)} alt={f.nm(p)} /></div>
          <div className="wc-body">
            <span className="wc-dev">{d.name[lang]}</span>
            <h3>{f.nm(p)}</h3>
            <div className="wc-price"><b className="num">{fmt(p.sale)}</b><em>{t("cur")}</em>{p.reg > p.sale && <s className="num">{fmt(p.reg)}</s>}</div>
            {did && <p className="wc-did"><i className="led" />{did}</p>}
            <div className="wc-acts">
              <button className="btn btn-line" onClick={() => setDid(w.act(d.id))}><Icon name="bolt" />{c.tryIt}</button>
              <AddButton id={p.id} className="btn btn-white"><Icon name="plus" />{c.add}</AddButton>
            </div>
            <TLink className="wc-more" to={"/product/" + p.id}>{c.details} <Icon name="arrow" /></TLink>
          </div>
        </aside>
      )}
    </div>
  );
}
