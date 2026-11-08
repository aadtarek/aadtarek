/* Tuya Wi-Fi devices controlled LOCALLY over the home network (no Tuya cloud at runtime).
   Each device needs its id, local key, IP and protocol version (3.1 / 3.3 / 3.4).
   The local key is read once (see README); after that the device is driven directly on the LAN.
   "map" ties our keys to Tuya data-points, e.g. { "on": "1" } or { "position": "2" }. */
import TuyAPI from "tuyapi";

const toDps = (k, v) => (k === "position" ? Math.max(0, Math.min(100, Math.round(v))) : v);

export function tuyaDriver({ log }) {
  const conns = new Map();
  let onReport = () => {};
  function connect(dev) {
    const a = dev.address;
    const t = new TuyAPI({ id: a.id, key: a.key, ip: a.ip, version: a.version || "3.3", issueRefreshOnConnect: true });
    const c = { t, online: false, dev, retry: null };
    const report = (dps) => {
      const patch = {};
      for (const [k, dp] of Object.entries(dev.map || {})) if (dps && dp in dps) patch[k] = dps[dp];
      if (Object.keys(patch).length) onReport(dev.id, patch, true);
    };
    const go = () => t.find({ timeout: 8 }).then(() => t.connect()).catch((e) => { log(`tuya: ${dev.id} ${e.message}`); schedule(); });
    const schedule = () => { clearTimeout(c.retry); c.retry = setTimeout(go, 10000); };
    t.on("connected", () => { c.online = true; log(`tuya: ${dev.id} connected`); onReport(dev.id, { online: true }, false); t.get({ schema: true }).then((d) => report(d?.dps)).catch(() => {}); });
    t.on("disconnected", () => { c.online = false; onReport(dev.id, { online: false }, false); schedule(); });
    t.on("error", (e) => log(`tuya: ${dev.id} error ${e.message}`));
    t.on("data", (d) => report(d?.dps));
    t.on("dp-refresh", (d) => report(d?.dps));
    conns.set(dev.id, c); go();
  }
  return {
    name: "tuya",
    add(dev) { connect(dev); },
    onReport(fn) { onReport = fn; },
    async set(dev, patch) {
      const c = conns.get(dev.id); if (!c || !c.online) throw new Error("device offline");
      const data = {};
      for (const [k, v] of Object.entries(patch)) { const dp = dev.map?.[k]; if (dp) data[dp] = toDps(k, v); }
      if (Object.keys(data).length) await c.t.set({ multiple: true, data });
    },
    close() { for (const c of conns.values()) { clearTimeout(c.retry); c.t.disconnect(); } },
  };
}
