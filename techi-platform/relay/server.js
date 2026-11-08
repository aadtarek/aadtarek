/* Techi Cloud relay.
   Hubs dial OUT to  wss://relay/hub?hubId=...   (Authorization: Bearer <hub secret>)
   Website/app dial  wss://relay/client?hubId=... then send {"type":"auth","token":"<hub access token>"}
   The relay never stores device data; the hub itself checks the access token.
   HUBS env: comma list of  hubId:sha256(secret)   e.g.  showroom:5e88489...
   Run behind HTTPS (Render, Fly.io, Railway, a VPS with Caddy) so traffic is wss://. */
import http from "node:http";
import crypto from "node:crypto";
import { WebSocketServer, WebSocket } from "ws";

const HUBS = Object.fromEntries((process.env.HUBS || "").split(",").filter(Boolean).map((p) => p.split(":")));
const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");
const eq = (a, b) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && crypto.timingSafeEqual(x, y); };
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

const hubs = new Map(); // hubId -> { ws, clients: Map<cid, {ws, authed}> }
const server = http.createServer((req, res) => {
  if (req.url === "/health") { res.writeHead(200, { "Content-Type": "application/json" }); return res.end(JSON.stringify({ ok: true, hubs: hubs.size })); }
  res.writeHead(404); res.end();
});
const wss = new WebSocketServer({ server, maxPayload: 64 * 1024 });
const send = (ws, m) => ws && ws.readyState === WebSocket.OPEN && ws.send(typeof m === "string" ? m : JSON.stringify(m));

wss.on("connection", (ws, req) => {
  const u = new URL(req.url, "http://x"); const hubId = u.searchParams.get("hubId") || "";
  if (u.pathname === "/hub") {
    const secret = (req.headers.authorization || "").replace(/^Bearer /, "");
    if (!HUBS[hubId] || !eq(sha(secret), HUBS[hubId])) { ws.close(4001, "unauthorized"); return; }
    const old = hubs.get(hubId); if (old) old.ws.close(4000, "replaced");
    const entry = { ws, clients: old ? old.clients : new Map() }; hubs.set(hubId, entry);
    log("hub online", hubId);
    for (const [cid, c] of entry.clients) { c.authed = false; send(c.ws, { type: "hub_online" }); }
    ws.on("message", (raw) => {
      let m; try { m = JSON.parse(raw); } catch (e) { return; }
      if (m.type === "auth_ok" || m.type === "auth_fail") { const c = entry.clients.get(m.cid); if (!c) return; if (m.type === "auth_ok") { c.authed = true; send(c.ws, { type: "auth_ok" }); } else { send(c.ws, { type: "auth_fail" }); c.ws.close(4001, "bad token"); } return; }
      const { to, ...rest } = m;
      if (to === "*") { for (const c of entry.clients.values()) if (c.authed) send(c.ws, rest); }
      else { const c = entry.clients.get(to); if (c && c.authed) send(c.ws, rest); }
    });
    ws.on("close", () => { if (hubs.get(hubId)?.ws === ws) { log("hub offline", hubId); for (const c of entry.clients.values()) send(c.ws, { type: "hub_offline" }); } });
    return;
  }
  if (u.pathname === "/client") {
    let entry = hubs.get(hubId);
    if (!entry) { if (!HUBS[hubId]) { ws.close(4004, "unknown hub"); return; } entry = { ws: null, clients: new Map() }; hubs.set(hubId, entry); }
    const cid = crypto.randomUUID(); const c = { ws, authed: false }; entry.clients.set(cid, c);
    let n = 0, t = Date.now();
    if (!entry.ws || entry.ws.readyState !== WebSocket.OPEN) send(ws, { type: "hub_offline" });
    ws.on("message", (raw) => {
      const now = Date.now(); if (now - t > 1000) { n = 0; t = now; } if (++n > 12) return send(ws, { type: "ack", ok: false, error: "slow down" });
      let m; try { m = JSON.parse(raw); } catch (e) { return; }
      const hub = hubs.get(hubId)?.ws;
      if (m.type === "auth") return send(hub, { type: "auth", cid, token: String(m.token || "") });
      if (!c.authed) return send(ws, { type: "ack", rid: m.rid, ok: false, error: "not authorised" });
      send(hub, { ...m, cid });
    });
    ws.on("close", () => { entry.clients.delete(cid); send(hubs.get(hubId)?.ws, { type: "gone", cid }); });
    return;
  }
  ws.close(4004, "not found");
});
const PORT = +(process.env.PORT || 8790);
server.listen(PORT, () => log(`Techi relay on :${PORT}, ${Object.keys(HUBS).length} hubs registered`));
