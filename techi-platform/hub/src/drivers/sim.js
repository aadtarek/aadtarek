/* Simulator: behaves like real devices so the whole platform can be tried without hardware.
   Sensors trip now and then (motion often, gas rarely) so automations can be seen working. */
export function simDriver({ log }) {
  const devs = new Map();
  let onReport = () => {};
  const timers = [];
  return {
    name: "sim",
    add(dev) {
      devs.set(dev.id, dev);
      const init = { light: { on: false }, socket: { on: false }, curtain: { position: 100 }, valve: { on: true }, gas: { alarm: false }, motion: { motion: false }, ac: { on: false, temp: 24 } }[dev.type] || {};
      setTimeout(() => onReport(dev.id, { ...init, online: true, signal: 120 + Math.round(Math.random() * 100) }, true), 50);
      if (dev.type === "motion") timers.push(setInterval(() => { onReport(dev.id, { motion: true }, true); setTimeout(() => onReport(dev.id, { motion: false }, true), 8000); }, 45000 + Math.random() * 30000));
    },
    onReport(fn) { onReport = fn; },
    async set(dev, patch) {
      await new Promise((r) => setTimeout(r, 120 + Math.random() * 180)); // radio latency
      if (dev.type === "curtain" && "position" in patch) { // curtains travel, they don't jump
        const to = patch.position; let cur = dev._pos ?? 100; const step = to > cur ? 10 : -10;
        const iv = setInterval(() => { cur = Math.abs(to - cur) <= 10 ? to : cur + step; dev._pos = cur; onReport(dev.id, { position: cur }, true); if (cur === to) clearInterval(iv); }, 250);
        return;
      }
      onReport(dev.id, patch, true);
    },
    trigger(id, patch) { onReport(id, patch, true); },
    close() { timers.forEach(clearInterval); },
  };
}
