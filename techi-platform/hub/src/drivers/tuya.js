/* Tuya Wi-Fi devices controlled LOCALLY over the home network (no Tuya cloud at runtime).
   Each physical device needs its id, local key, IP and protocol version (3.1 / 3.3 / 3.4).
   The local key is read once (see README); after that the device is driven directly on the LAN.
   "map" ties our keys to Tuya data-points, e.g. { "on": "1" } or { "position": "2" }.
   A 2/3/4-gang switch is ONE physical device: list each gang as its own device with the same
   address and a different data-point ("1", "2", "3"); they share a single connection. */
import TuyAPI from "tuyapi";

const toDps = (k, v) => (k === "position" ? Math.max(0, Math.min(100, Math.round(v))) : v);

export function tuyaDriver({ log }) {
  const conns = new Map(); // tuya id -> { t, online, devs: [] }
  let onReport = () => {};
  function report(c, dps) {
    if (!dps) return;
    for (const dev of c.devs) {
      const patch = {};
      for (const [k, dp] of Object.entries(dev.map || {})) if (dp in dps) patch[k] = dps[dp];
      if (Object.keys(patch).length) onReport(dev.id, patch, true);
    }
  }
  function connect(a) {
    const t = new TuyAPI({ id: a.id, key: a.key, ip: a.ip, version: a.version || "3.3", issueRefreshOnConnect: true });
    const c = { t, online: false, devs: [], retry: null };
    const go = () => t.find({ timeout: 8 }).then(() => t.connect()).catch((e) => { log(`tuya: ${a.id} ${e.message}`); schedule(); });
    const schedule = () => { clearTimeout(c.retry); c.retry = setTimeout(go, 10000); };
    t.on("connected", () => { c.online = true; log(`tuya: ${a.id} connected (${c.devs.map((d) => d.id).join(", ")})`); c.devs.forEach((d) => onReport(d.id, { online: true }, false)); t.get({ schema: true }).then((d) => { log(`tuya: ${a.id} data-points`, JSON.stringify(d?.dps)); report(c, d?.dps); }).catch(() => {}); });
    t.on("disconnected", () => { c.online = false; c.devs.forEach((d) => onReport(d.id, { online: false }, false)); schedule(); });
    t.on("error", (e) => log(`tuya: ${a.id} error ${e.message}`));
    t.on("data", (d) => report(c, d?.dps));
    t.on("dp-refresh", (d) => report(c, d?.dps));
    conns.set(a.id, c); setTimeout(go, 100);
    return c;
  }
  return {
    name: "tuya",
    add(dev) { const c = conns.get(dev.address.id) || connect(dev.address); c.devs.push(dev); },
    onReport(fn) { onReport = fn; },
    async set(dev, patch) {
      const c = conns.get(dev.address.id); if (!c || !c.online) throw new Error("device offline");
      const data = {};
      for (const [k, v] of Object.entries(patch)) { const dp = dev.map?.[k]; if (dp) data[dp] = toDps(k, v); }
      if (Object.keys(data).length) await c.t.set({ multiple: true, data });
    },
    close() { for (const c of conns.values()) { clearTimeout(c.retry); c.t.disconnect(); } },
  };
}
