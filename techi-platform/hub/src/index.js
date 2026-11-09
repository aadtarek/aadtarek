/* Techi Hub — the brain that lives in the customer's home.
   - Talks to Zigbee devices (Zigbee2MQTT) and Wi-Fi Tuya devices (local LAN), no vendor cloud.
   - Runs automations and scenes locally, so the home keeps working without internet.
   - Serves a WebSocket + REST API on the LAN, and links out to the Techi relay for remote access. */
import fs from "node:fs";
import http from "node:http";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { WebSocketServer, WebSocket } from "ws";
import { simDriver } from "./drivers/sim.js";

const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const CFG_PATH = process.env.TECHI_CONFIG || fileURLToPath(new URL("../devices.json", import.meta.url));
const EXAMPLE = fileURLToPath(new URL("../devices.example.json", import.meta.url));
const cfg = JSON.parse(fs.readFileSync(fs.existsSync(CFG_PATH) ? CFG_PATH : EXAMPLE, "utf8"));
const SIM = process.env.TECHI_SIM === "1";
const TOKEN = process.env.TECHI_TOKEN || cfg.hub.token;
if (!TOKEN || TOKEN.startsWith("CHANGE-ME")) log("WARNING: set a real hub token (TECHI_TOKEN or hub.token)");

/* ---------- what each device type may be asked to do ---------- */
const ALLOWED = {
  light: { on: "bool" }, socket: { on: "bool" }, valve: { on: "bool" },
  curtain: { position: "pct" }, ac: { on: "bool", temp: "temp" },
  gas: {}, motion: {}, lock: {}, // sensors are read-only; locks are never opened remotely by this hub
};
function validate(dev, patch) {
  const rules = ALLOWED[dev.type] || {}; const out = {};
  for (const [k, v] of Object.entries(patch || {})) {
    const r = rules[k];
    if (r === "bool" && typeof v === "boolean") out[k] = v;
    else if (r === "pct" && Number.isFinite(v)) out[k] = Math.max(0, Math.min(100, Math.round(v)));
    else if (r === "temp" && Number.isFinite(v)) out[k] = Math.max(16, Math.min(30, Math.round(v)));
  }
  return out;
}

/* ---------- drivers ---------- */
const drivers = {};
async function driverFor(name) {
  if (SIM) return (drivers.sim ||= simDriver({ log }));
  if (drivers[name]) return drivers[name];
  if (name === "zigbee") { const { zigbeeDriver } = await import("./drivers/zigbee.js"); drivers.zigbee = zigbeeDriver({ url: process.env.TECHI_MQTT || cfg.hub.mqtt, log }); }
  else if (name === "tuya") { const { tuyaDriver } = await import("./drivers/tuya.js"); drivers.tuya = tuyaDriver({ log }); }
  else throw new Error("unknown driver " + name);
  return drivers[name];
}

/* ---------- device registry ---------- */
const devices = new Map();
const state = {};
const automations = (cfg.automations || []).map((a) => ({ ...a, enabled: a.enabled !== false }));
const events = [];
const publicDevice = (d) => ({ id: d.id, name: d.name, room: d.room, type: d.type, role3d: d.role3d, driver: SIM ? "sim" : d.driver, state: state[d.id] || {} });
function event(level, msg, extra = {}) { const e = { ts: Date.now(), level, msg, ...extra }; events.unshift(e); events.length = Math.min(events.length, 50); broadcast({ type: "event", event: e }); }

function report(id, patch, fromDevice) {
  const prev = state[id] || {}; const next = { ...prev, ...patch, updated: Date.now() };
  state[id] = next; broadcast({ type: "state", id, state: next });
  if (fromDevice) runAutomations(id, prev, next);
}
async function setDevice(id, patch, by = "user") {
  const dev = devices.get(id); if (!dev) throw new Error("unknown device");
  const clean = validate(dev, patch); if (!Object.keys(clean).length) throw new Error("not allowed");
  const drv = await driverFor(dev.driver); await drv.set(dev, clean);
  log(`set ${id}`, JSON.stringify(clean), `(${by})`);
  return clean;
}
async function runScene(id, by = "user") {
  const sc = (cfg.scenes || []).find((s) => s.id === id); if (!sc) throw new Error("unknown scene");
  const results = await Promise.allSettled(sc.actions.map((a) => setDevice(a.device, a.set, "scene:" + id)));
  const failed = results.filter((r) => r.status === "rejected").length;
  event(failed ? "warn" : "info", `scene ${id}${failed ? ` (${failed} failed)` : ""}`, { scene: id, by });
}
function runAutomations(id, prev, next) {
  for (const a of automations) {
    if (!a.enabled || a.when.device !== id) continue;
    const k = a.when.key; if (prev[k] === next[k] || next[k] !== a.when.equals) continue;
    log(`automation ${a.id} fired`);
    event(a.notify ? "alert" : "info", `automation ${a.id}`, { automation: a.id, device: id });
    for (const act of a.then) setDevice(act.device, act.set, "auto:" + a.id).catch((e) => log("automation step failed", e.message));
  }
}

for (const d of cfg.devices) {
  devices.set(d.id, d); state[d.id] = { online: false };
  const drv = await driverFor(d.driver); drv.onReport(report); drv.add(d);
}

/* ---------- message protocol (same for LAN clients and the relay) ---------- */
function hello() {
  return { type: "hello", hub: { name: cfg.hub.name, sim: SIM }, devices: [...devices.values()].map(publicDevice),
    scenes: (cfg.scenes || []).map(({ id, name }) => ({ id, name })), automations: automations.map(({ id, name, enabled }) => ({ id, name, enabled })), events: events.slice(0, 20) };
}
async function handle(msg, reply) {
  const ack = (ok, error, extra) => reply({ type: "ack", rid: msg.rid, ok, error, ...extra });
  try {
    if (msg.type === "get") return reply(hello());
    if (msg.type === "set") { const applied = await setDevice(msg.id, msg.patch); return ack(true, undefined, { applied }); }
    if (msg.type === "scene") { await runScene(msg.id); return ack(true); }
    if (msg.type === "automation") { const a = automations.find((x) => x.id === msg.id); if (!a) throw new Error("unknown automation"); a.enabled = !!msg.enabled; broadcast({ type: "automation", id: a.id, enabled: a.enabled }); return ack(true); }
    if (msg.type === "sim" && SIM) { drivers.sim.trigger(msg.id, msg.patch); return ack(true); }
    ack(false, "unknown message");
  } catch (e) { ack(false, e.message); }
}
const safeEq = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };
function limiter() { let n = 0, t = Date.now(); return () => { const now = Date.now(); if (now - t > 1000) { n = 0; t = now; } return ++n <= 12; }; }

/* ---------- LAN server ---------- */
const lan = new Set();
let cloud = { send() {} };
const send = (ws, m) => ws.readyState === WebSocket.OPEN && ws.send(JSON.stringify(m));
function broadcast(m) { for (const ws of lan) send(ws, m); cloud.send({ ...m, to: "*" }); }
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Authorization, Content-Type", "Access-Control-Allow-Methods": "GET, POST, OPTIONS" };
const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") { res.writeHead(204, cors); return res.end(); }
  const json = (code, body) => { res.writeHead(code, { "Content-Type": "application/json", ...cors }); res.end(JSON.stringify(body)); };
  if (req.url === "/health") return json(200, { ok: true, name: cfg.hub.name, sim: SIM });
  if (!safeEq((req.headers.authorization || "").replace(/^Bearer /, ""), TOKEN)) return json(401, { error: "unauthorized" });
  if (req.method === "GET" && req.url === "/api/state") return json(200, hello());
  if (req.method === "POST" && req.url.startsWith("/api/")) {
    let body = ""; for await (const c of req) { body += c; if (body.length > 10000) return json(413, { error: "too large" }); }
    let msg; try { msg = JSON.parse(body || "{}"); } catch (e) { return json(400, { error: "bad json" }); }
    const [, , kind, id] = req.url.split("/"); // /api/devices/<id> | /api/scenes/<id>
    let out; await handle({ type: kind === "scenes" ? "scene" : "set", id, patch: msg }, (m) => (out = m));
    return json(out.ok ? 200 : 400, out);
  }
  json(404, { error: "not found" });
});
const wss = new WebSocketServer({ server, path: "/ws" });
wss.on("connection", (ws, req) => {
  const tok = new URL(req.url, "http://x").searchParams.get("token");
  if (!safeEq(tok || "", TOKEN)) { ws.close(4001, "unauthorized"); return; }
  lan.add(ws); const ok = limiter(); send(ws, hello());
  ws.on("message", (raw) => { if (!ok()) return send(ws, { type: "ack", ok: false, error: "slow down" }); let m; try { m = JSON.parse(raw); } catch (e) { return; } handle(m, (r) => send(ws, r)); });
  ws.on("close", () => lan.delete(ws));
});
const PORT = +(process.env.PORT || cfg.hub.port || 8787);
server.listen(PORT, () => log(`Techi Hub "${cfg.hub.name}" on :${PORT}${SIM ? " (simulator)" : ""} — ${devices.size} devices`));

/* ---------- cloud link (outbound only, so no ports open on the home router) ---------- */
cloud = (() => {
  const c = cfg.hub.cloud || {}; const url = process.env.TECHI_RELAY || c.url, hubId = process.env.TECHI_HUB_ID || c.hubId, secret = process.env.TECHI_HUB_SECRET || c.secret;
  let ws = null, wait = 2000;
  const authed = new Set();
  function open() {
    if (!url || !hubId || !secret) return;
    ws = new WebSocket(`${url.replace(/\/$/, "")}/hub?hubId=${encodeURIComponent(hubId)}`, { headers: { authorization: "Bearer " + secret } });
    ws.on("open", () => { wait = 2000; log("cloud: linked to", url); });
    ws.on("message", (raw) => {
      let m; try { m = JSON.parse(raw); } catch (e) { return; }
      const to = m.cid, reply = (r) => ws.send(JSON.stringify({ ...r, to }));
      if (m.type === "auth") { if (safeEq(m.token || "", TOKEN)) { authed.add(to); ws.send(JSON.stringify({ type: "auth_ok", cid: to })); reply(hello()); } else ws.send(JSON.stringify({ type: "auth_fail", cid: to })); return; }
      if (m.type === "gone") { authed.delete(to); return; }
      if (!authed.has(to)) return;
      handle(m, reply);
    });
    ws.on("close", () => { authed.clear(); setTimeout(open, (wait = Math.min(wait * 2, 60000))); });
    ws.on("error", (e) => log("cloud:", e.message));
  }
  open();
  return { send(m) { if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(m)); } };
})();

for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => { Object.values(drivers).forEach((d) => d.close && d.close()); process.exit(0); });
