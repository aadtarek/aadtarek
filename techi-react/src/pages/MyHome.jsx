/* "My Home": live control of real devices through a Techi Hub (no Tuya cloud). */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useApp } from "../context.jsx";
import { Icon } from "../components/Icons.jsx";
import { Frame3D, Tag } from "../components/ui.jsx";
import H3D from "../components/H3D.jsx";
import { getHome } from "../lib/home3d.js";
import { reduceMotion } from "../lib/util.js";

const COPY = {
  ar: {
    tag: "Techi Home · تحكم مباشر", h: "بيتي.", p: "اتحكم في أجهزة بيتك الحقيقية من هنا، من غير أبلكيشن Tuya. كل حاجة بتعدي على Techi Hub اللي في بيتك.",
    connect: "اتصل بالـ Hub", via: "طريقة الاتصال", relay: "من أي مكان (Techi Cloud)", lan: "من جوه البيت (نفس الواي فاي)",
    relayUrl: "عنوان Techi Cloud", hubId: "رقم الـ Hub", lanUrl: "عنوان الـ Hub على الشبكة", token: "كود الدخول", go: "اتصل", disconnect: "اقطع الاتصال",
    connecting: "بنتصل…", online: "متصل", offline: "الـ Hub مش متصل دلوقتي", bad: "كود الدخول غلط", failed: "مش قادرين نوصل للـ Hub. اتأكد من العنوان.",
    rooms: { living: "الصالة", kitchen: "المطبخ", bedroom: "أوضة النوم", entrance: "المدخل" },
    on: "شغال", off: "مطفي", open: "مفتوح", closed: "مقفول", safe: "آمن", leak: "تسريب غاز!", motion: "فيه حركة", idle: "مفيش حركة", offlineDev: "مش متصل",
    scenes: "السيناريوهات", autos: "الأتمتة", log: "آخر الأحداث", sim: "وضع المحاكاة: الأجهزة افتراضية للتجربة", simGas: "جرّب تسريب غاز", simMotion: "جرّب حركة", simClear: "رجّع الغاز آمن",
    hint: "أول مرة؟ شغّل الـ Hub بالأمر npm run sim عشان تجرب من غير أجهزة.", temp: "درجة الحرارة", position: "الفتح",
  },
  en: {
    tag: "Techi Home · Live control", h: "My home.", p: "Control the real devices in your home from here, with no Tuya app. Everything goes through the Techi Hub in your home.",
    connect: "Connect to your hub", via: "Connection", relay: "From anywhere (Techi Cloud)", lan: "At home (same Wi-Fi)",
    relayUrl: "Techi Cloud address", hubId: "Hub ID", lanUrl: "Hub address on your network", token: "Access code", go: "Connect", disconnect: "Disconnect",
    connecting: "Connecting…", online: "Online", offline: "The hub is offline right now", bad: "Wrong access code", failed: "Can't reach the hub. Check the address.",
    rooms: { living: "Living room", kitchen: "Kitchen", bedroom: "Bedroom", entrance: "Entrance" },
    on: "On", off: "Off", open: "Open", closed: "Closed", safe: "Safe", leak: "Gas leak!", motion: "Motion", idle: "Clear", offlineDev: "Offline",
    scenes: "Scenes", autos: "Automations", log: "Recent events", sim: "Simulator mode: devices are virtual, for testing", simGas: "Simulate gas leak", simMotion: "Simulate motion", simClear: "Clear gas alarm",
    hint: "First time? Start the hub with npm run sim to try it without hardware.", temp: "Temperature", position: "Open",
  },
};
const TYPE_ICON = { light: "bolt", socket: "switch", curtain: "screen", valve: "target", gas: "shield", motion: "target", ac: "voice", lock: "shield" };
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

/* one connection object, same protocol for LAN and relay */
function useHub() {
  const [status, setStatus] = useState("idle");
  const [hub, setHub] = useState(null);
  const [devices, setDevices] = useState({});
  const [events, setEvents] = useState([]);
  const ws = useRef(null), rid = useRef(1), pending = useRef({});
  const close = () => { if (ws.current) { ws.current.onclose = null; ws.current.close(); ws.current = null; } setStatus("idle"); setHub(null); setDevices({}); };
  const open = (conn) => {
    close(); setStatus("connecting");
    let url;
    try {
      url = conn.mode === "lan" ? `${conn.lanUrl.replace(/^http/, "ws").replace(/\/$/, "")}/ws?token=${encodeURIComponent(conn.token)}` : `${conn.relayUrl.replace(/\/$/, "")}/client?hubId=${encodeURIComponent(conn.hubId)}`;
      new URL(url);
    } catch (e) { setStatus("failed"); return; }
    const s = new WebSocket(url); ws.current = s;
    s.onopen = () => { if (conn.mode !== "lan") s.send(JSON.stringify({ type: "auth", token: conn.token })); };
    s.onerror = () => setStatus((x) => (x === "connecting" ? "failed" : x));
    s.onclose = (e) => { setStatus(e.code === 4001 ? "bad" : "failed"); };
    s.onmessage = (ev) => {
      let m; try { m = JSON.parse(ev.data); } catch (e) { return; }
      if (m.type === "hub_offline") setStatus("offline");
      if (m.type === "hub_online") s.send(JSON.stringify({ type: "auth", token: conn.token }));
      if (m.type === "auth_fail") setStatus("bad");
      if (m.type === "hello") { setHub({ ...m.hub, scenes: m.scenes, automations: m.automations }); setDevices(Object.fromEntries(m.devices.map((d) => [d.id, d]))); setEvents(m.events || []); setStatus("online"); }
      if (m.type === "state") setDevices((d) => (d[m.id] ? { ...d, [m.id]: { ...d[m.id], state: m.state } } : d));
      if (m.type === "event") setEvents((e) => [m.event, ...e].slice(0, 20));
      if (m.type === "automation") setHub((h) => h && { ...h, automations: h.automations.map((a) => (a.id === m.id ? { ...a, enabled: m.enabled } : a)) });
      if (m.type === "ack" && pending.current[m.rid]) { pending.current[m.rid](m); delete pending.current[m.rid]; }
    };
  };
  const send = (msg) => new Promise((res) => {
    if (!ws.current || ws.current.readyState !== 1) return res({ ok: false, error: "offline" });
    const r = rid.current++; pending.current[r] = res; ws.current.send(JSON.stringify({ ...msg, rid: r }));
    setTimeout(() => { if (pending.current[r]) { delete pending.current[r]; res({ ok: false, error: "timeout" }); } }, 8000);
  });
  useEffect(() => () => close(), []); // eslint-disable-line
  return { status, hub, devices, events, open, close, send };
}

function Tile({ d, c, lang, send, toast }) {
  const st = d.state || {}; const nm = d.name?.[lang] || d.id; const off = st.online === false;
  const [busy, setBusy] = useState(false);
  const act = async (patch) => { setBusy(true); const r = await send({ type: "set", id: d.id, patch }); setBusy(false); if (!r.ok) toast(nm, r.error || "error", null, true); };
  let value = "", on = false, control = null;
  if (["light", "socket", "valve"].includes(d.type)) {
    on = !!st.on; value = d.type === "valve" ? (on ? c.open : c.closed) : on ? c.on : c.off;
    control = <button className={"mh-sw" + (on ? " on" : "")} role="switch" aria-checked={on} aria-label={nm} disabled={busy || off} onClick={() => act({ on: !on })}><i /></button>;
  } else if (d.type === "curtain") {
    const pos = st.position ?? 0; on = pos > 0; value = `${pos}%`;
    control = <input className="mh-range" type="range" min="0" max="100" step="10" value={pos} aria-label={c.position} disabled={off} onChange={(e) => act({ position: +e.target.value })} />;
  } else if (d.type === "ac") {
    on = !!st.on; const tmp = st.temp ?? 24; value = on ? `${tmp}°` : c.off;
    control = (
      <div className="mh-ac">
        <button disabled={busy || off || !on} aria-label="−" onClick={() => act({ temp: tmp - 1 })}>−</button>
        <button className={"mh-sw" + (on ? " on" : "")} role="switch" aria-checked={on} aria-label={nm} disabled={busy || off} onClick={() => act({ on: !on })}><i /></button>
        <button disabled={busy || off || !on} aria-label="+" onClick={() => act({ temp: tmp + 1 })}>+</button>
      </div>);
  } else if (d.type === "gas") { on = !!st.alarm; value = on ? c.leak : c.safe; }
  else if (d.type === "motion") { on = !!st.motion; value = on ? c.motion : c.idle; }
  const alert = d.type === "gas" && on;
  return (
    <div className={"mh-tile" + (on ? " on" : "") + (alert ? " alert" : "") + (off ? " off" : "") + " t-" + d.type} data-tilt="6">
      <div className="mh-top"><span className="mh-ic" data-z="30"><Icon name={TYPE_ICON[d.type] || "bolt"} /></span>{control}</div>
      <b data-z="16">{nm}</b>
      <span className="mh-val">{off ? c.offlineDev : value}{busy && <i className="mh-spin" />}</span>
    </div>
  );
}

export default function MyHome() {
  const { lang, toast, dir } = useApp();
  const c = COPY[lang];
  const hubApi = useHub();
  const { status, hub, devices, events, open, close, send } = hubApi;
  const [conn, setConn] = useState(() => read("techi-hub-conn", { mode: "relay", relayUrl: "", hubId: "", lanUrl: "http://techi-hub.local:8787", token: "" }));
  const root = useRef(null);
  const set = (k) => (e) => setConn((x) => { const n = { ...x, [k]: e.target.value }; return n; });
  const connect = (e) => { e.preventDefault(); const { token, ...rest } = conn; write("techi-hub-conn", rest); open(conn); };

  /* the 3D apartment mirrors the real home */
  useEffect(() => { const h = getHome(); if (!h || !h.mirror) return; Object.values(devices).forEach((d) => d.role3d && h.mirror(d.role3d, d.state)); }, [devices]);
  /* alarms become toasts */
  const lastEv = useRef(0);
  useEffect(() => { const e = events[0]; if (!e || e.ts <= lastEv.current) return; lastEv.current = e.ts; if (e.level === "alert") toast("Techi Hub", e.msg, null, true); }, [events, toast]);
  useLayoutEffect(() => { if (reduceMotion() || status !== "online") return; gsap.fromTo(".mh-tile", { rotateY: -50 * dir, z: -200, opacity: 0, transformPerspective: 1000 }, { rotateY: 0, z: 0, opacity: 1, duration: 1, ease: "expo.out", stagger: 0.04, clearProps: "transform,opacity" }); }, [status, dir]);

  const rooms = {}; Object.values(devices).forEach((d) => (rooms[d.room] ||= []).push(d));
  return (
    <div className="mh wrap" ref={root}>
      <div className="mh-head">
        <div><Tag>{c.tag}</Tag><H3D as="h1" text={c.h} /><p>{c.p}</p></div>
        {status === "online" && <div className="mh-status"><i className="led" />{hub.name} · {c.online}<button className="btn btn-line mh-dis" onClick={close}>{c.disconnect}</button></div>}
      </div>

      {status !== "online" && (
        <form className="mh-connect co-box" onSubmit={connect}>
          <h2>{c.connect}</h2>
          <div className="mh-modes">
            {[["relay", c.relay], ["lan", c.lan]].map(([v, l]) => <label key={v} className={"pay" + (conn.mode === v ? " on" : "")}><input type="radio" name="mode" value={v} checked={conn.mode === v} onChange={set("mode")} /><span className="dot" /><span><b>{l}</b></span></label>)}
          </div>
          {conn.mode === "relay" ? (
            <div className="row2">
              <label className="fld"><span>{c.relayUrl}</span><input dir="ltr" placeholder="wss://cloud.techi-eg.com" value={conn.relayUrl} onChange={set("relayUrl")} /></label>
              <label className="fld"><span>{c.hubId}</span><input dir="ltr" placeholder="showroom" value={conn.hubId} onChange={set("hubId")} /></label>
            </div>
          ) : (
            <label className="fld"><span>{c.lanUrl}</span><input dir="ltr" value={conn.lanUrl} onChange={set("lanUrl")} /></label>
          )}
          <label className="fld"><span>{c.token}</span><input dir="ltr" type="password" autoComplete="current-password" value={conn.token} onChange={set("token")} /></label>
          {["bad", "failed", "offline"].includes(status) && <p className="co-fail" role="alert">{c[status]}</p>}
          <button className="btn btn-white" type="submit" disabled={status === "connecting"}>{status === "connecting" ? c.connecting : c.go}</button>
          <p className="mh-hint">{c.hint}</p>
        </form>
      )}

      {status === "online" && (
        <>
          {hub.sim && (
            <div className="mh-sim">
              <span><Icon name="target" />{c.sim}</span>
              <div>
                <button className="btn btn-line mh-sbtn" onClick={() => send({ type: "sim", id: "kitchen_gas", patch: { alarm: true } })}>{c.simGas}</button>
                <button className="btn btn-line mh-sbtn" onClick={() => send({ type: "sim", id: "kitchen_gas", patch: { alarm: false } })}>{c.simClear}</button>
                <button className="btn btn-line mh-sbtn" onClick={() => { send({ type: "sim", id: "hall_motion", patch: { motion: true } }); setTimeout(() => send({ type: "sim", id: "hall_motion", patch: { motion: false } }), 6000); }}>{c.simMotion}</button>
              </div>
            </div>
          )}
          <div className="mh-grid">
            <div className="mh-main">
              <div className="mh-scenes">
                {hub.scenes.map((s) => <button key={s.id} className="mh-scene" data-tilt="8" onClick={async () => { const r = await send({ type: "scene", id: s.id }); if (r.ok) toast("Techi Hub", s.name[lang]); }}><Icon name={s.id === "sleep" ? "sleep" : s.id === "away" ? "away" : "arrive"} />{s.name[lang]}</button>)}
              </div>
              {Object.entries(rooms).map(([r, list]) => (
                <section key={r} className="mh-room">
                  <h3>{c.rooms[r] || r}</h3>
                  <div className="mh-tiles">{list.map((d) => <Tile key={d.id} d={d} c={c} lang={lang} send={send} toast={toast} />)}</div>
                </section>
              ))}
            </div>
            <aside className="mh-side">
              <div className="mh-3d"><Frame3D /></div>
              <div className="co-box">
                <h3>{c.autos}</h3>
                {hub.automations.map((a) => (
                  <label key={a.id} className="mh-auto">
                    <span>{a.name[lang]}</span>
                    <button type="button" className={"mh-sw" + (a.enabled ? " on" : "")} role="switch" aria-checked={a.enabled} aria-label={a.name[lang]} onClick={() => send({ type: "automation", id: a.id, enabled: !a.enabled })}><i /></button>
                  </label>
                ))}
              </div>
              <div className="co-box">
                <h3>{c.log}</h3>
                <ul className="mh-log">{events.slice(0, 8).map((e) => <li key={e.ts + e.msg} className={e.level}><span className="num">{new Date(e.ts).toLocaleTimeString(lang === "en" ? "en-GB" : "ar-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>{e.msg}</li>)}</ul>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
