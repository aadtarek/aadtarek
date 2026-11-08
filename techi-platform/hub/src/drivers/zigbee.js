/* Zigbee devices through Zigbee2MQTT (no vendor cloud).
   Zigbee2MQTT publishes  zigbee2mqtt/<friendly_name>       {state, occupancy, gas, ...}
   and accepts            zigbee2mqtt/<friendly_name>/set   {"state":"ON"} */
import mqtt from "mqtt";

const toZ = (key, v) => (typeof v === "boolean" && /^state/.test(key) ? (v ? "ON" : "OFF") : key === "system_mode" && typeof v === "boolean" ? (v ? "cool" : "off") : v);
const fromZ = (v) => (v === "ON" ? true : v === "OFF" ? false : v === "cool" || v === "heat" || v === "auto" ? true : v === "off" ? false : v);

export function zigbeeDriver({ url, base = "zigbee2mqtt", log }) {
  const client = mqtt.connect(url, { reconnectPeriod: 3000 });
  const devices = new Map(); // address -> device
  let onReport = () => {};
  client.on("connect", () => { log("zigbee: connected to MQTT", url); client.subscribe(`${base}/+`); client.subscribe(`${base}/bridge/state`); });
  client.on("error", (e) => log("zigbee: mqtt error", e.message));
  client.on("message", (topic, buf) => {
    const name = topic.slice(base.length + 1);
    if (name === "bridge/state") { log("zigbee: bridge", buf.toString()); return; }
    const dev = devices.get(name); if (!dev) return;
    let raw; try { raw = JSON.parse(buf.toString()); } catch (e) { return; }
    const patch = {};
    for (const [k, zk] of Object.entries(dev.map || {})) if (zk in raw) patch[k] = fromZ(raw[zk]);
    if ("linkquality" in raw) patch.signal = raw.linkquality;
    if ("battery" in raw) patch.battery = raw.battery;
    onReport(dev.id, patch, true);
  });
  return {
    name: "zigbee",
    add(dev) { devices.set(dev.address, dev); },
    onReport(fn) { onReport = fn; },
    async set(dev, patch) {
      const out = {};
      for (const [k, v] of Object.entries(patch)) { const zk = dev.map?.[k]; if (zk) out[zk] = toZ(zk, v); }
      if (!Object.keys(out).length) return;
      client.publish(`${base}/${dev.address}/set`, JSON.stringify(out));
    },
    get online() { return client.connected; },
    close() { client.end(true); },
  };
}
