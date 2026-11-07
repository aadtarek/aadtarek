/* Procedural 3D models of Techi's devices + the hero carousel stage.
   Each model is ~1 unit tall, centred on the origin, facing +Z. */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const rb = (w, h, d, r, seg = 4) => new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));
const glass = () => new THREE.MeshPhysicalMaterial({ color: 0x07090d, roughness: 0.08, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.04, reflectivity: 0.9 });
const metal = (c = 0xc9d1dc, r = 0.25) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: 0.95 });
const plastic = (c = 0xf3f5f8, r = 0.35) => new THREE.MeshPhysicalMaterial({ color: c, roughness: r, metalness: 0, clearcoat: 0.4, clearcoatRoughness: 0.3 });
const glow = (c) => new THREE.MeshStandardMaterial({ color: 0x000000, emissive: new THREE.Color(c), emissiveIntensity: 2.2, roughness: 0.4 });

function canvasTex(w, h, draw) {
  const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t;
}

/* ---------------- models ---------------- */
function makeSwitch() {
  const g = new THREE.Group(), leds = [];
  const frame = new THREE.Mesh(rb(1.0, 1.0, 0.1, 0.07), metal(0x9aa6b8, 0.3)); g.add(frame);
  const face = new THREE.Mesh(rb(0.94, 0.94, 0.06, 0.05), glass()); face.position.z = 0.04; g.add(face);
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 0.29;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.009, 12, 48), glow(i === 0 ? 0xffc77a : 0x7fb0ff));
    ring.position.set(x, 0.04, 0.075); g.add(ring); leds.push(ring);
    const dot = new THREE.Mesh(new THREE.CircleGeometry(0.018, 24), glow(i === 0 ? 0xffc77a : 0x7fb0ff)); dot.position.set(x, 0.04, 0.076); g.add(dot); leds.push(dot);
    if (i) { const ln = new THREE.Mesh(new THREE.PlaneGeometry(0.003, 0.7), new THREE.MeshBasicMaterial({ color: 0x2a3446 })); ln.position.set(x - 0.145, 0, 0.074); g.add(ln); }
  }
  const wifi = new THREE.Mesh(new THREE.CircleGeometry(0.012, 16), glow(0x5be3a3)); wifi.position.set(0.38, 0.38, 0.076); g.add(wifi);
  g.userData.leds = leds; return g;
}
function makeEcho() {
  const g = new THREE.Group();
  const fabric = canvasTex(256, 256, (x, w, h) => { x.fillStyle = "#26292f"; x.fillRect(0, 0, w, h); for (let i = 0; i < 3000; i++) { x.fillStyle = Math.random() < 0.5 ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.18)"; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); } });
  fabric.wrapS = fabric.wrapT = THREE.RepeatWrapping; fabric.repeat.set(4, 4);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 64, 48, 0, Math.PI * 2, 0, Math.PI * 0.78), new THREE.MeshStandardMaterial({ color: 0xffffff, map: fabric, roughness: 1 }));
  body.position.y = 0.06; g.add(body);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.36, 0.06, 64), new THREE.MeshStandardMaterial({ color: 0x15171b, roughness: 0.6 })); base.position.y = -0.34; g.add(base);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.385, 0.018, 16, 96), glow(0x33c4ff)); ring.rotation.x = Math.PI / 2; ring.position.y = -0.3; g.add(ring);
  [[-0.12, 0.43], [0.12, 0.43], [0, 0.46]].forEach(([x, y]) => { const b = new THREE.Mesh(new THREE.CircleGeometry(0.03, 24), new THREE.MeshStandardMaterial({ color: 0x3a3e45 })); b.position.set(x, y, 0.2); b.lookAt(x * 3, y * 3 + 1, 1.5); g.add(b); });
  g.userData.leds = [ring]; return g;
}
function makeLock() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(rb(0.36, 1.25, 0.12, 0.05), metal(0x2b2f36, 0.35)); g.add(body);
  const face = new THREE.Mesh(rb(0.3, 0.72, 0.03, 0.03), glass()); face.position.set(0, 0.16, 0.06); g.add(face);
  const scr = canvasTex(160, 120, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#0b2a5c"); gr.addColorStop(1, "#05101f"); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.strokeStyle = "#7fb0ff"; x.lineWidth = 4; x.beginPath(); x.arc(w / 2, h / 2 - 6, 24, 0, 7); x.stroke(); x.beginPath(); x.arc(w / 2, h / 2 + 46, 40, Math.PI * 1.15, Math.PI * 1.85); x.stroke(); });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.17), new THREE.MeshBasicMaterial({ map: scr })); screen.position.set(0, 0.38, 0.077); g.add(screen);
  const keyMat = glow(0x9cc0ff);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { const k = new THREE.Mesh(new THREE.CircleGeometry(0.012, 12), keyMat); k.position.set((c - 1) * 0.07, 0.12 - r * 0.07, 0.077); g.add(k); }
  const handle = new THREE.Mesh(rb(0.5, 0.07, 0.07, 0.03), metal(0xc9d1dc, 0.2)); handle.position.set(-0.2, -0.32, 0.12); g.add(handle);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.08, 24), metal(0xc9d1dc, 0.2)); neck.rotation.x = Math.PI / 2; neck.position.set(0.02, -0.32, 0.08); g.add(neck);
  const fp = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.006, 8, 32), glow(0x33c4ff)); fp.position.set(0, -0.52, 0.062); g.add(fp);
  g.userData.leds = [fp]; return g;
}
function makeGas() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.38, 0.5, 64), plastic()); body.rotation.x = Math.PI / 2; g.add(body);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.36, 0.04, 64), plastic(0xffffff, 0.25)); cap.rotation.x = Math.PI / 2; cap.position.z = 0.27; g.add(cap);
  for (let i = 1; i <= 4; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.05 * i + 0.02, 0.006, 8, 64), new THREE.MeshStandardMaterial({ color: 0xc7ccd4, roughness: 0.6 })); r.position.z = 0.292; g.add(r); }
  const led = new THREE.Mesh(rb(0.14, 0.04, 0.02, 0.01), glow(0xff4a3a)); led.position.set(0, 0.2, 0.29); g.add(led);
  const plug = new THREE.Group(); [-0.08, 0.08].forEach((x) => { const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.22, 16), metal(0xd9dde3, 0.2)); pin.rotation.x = Math.PI / 2; pin.position.set(x, 0, -0.36); plug.add(pin); }); g.add(plug);
  g.userData.leds = [led]; return g;
}
function makePanel() {
  const g = new THREE.Group();
  const frame = new THREE.Mesh(rb(1.3, 0.86, 0.08, 0.05), metal(0xb7c0cc, 0.3)); g.add(frame);
  const ui = canvasTex(640, 420, (x, w, h) => {
    const gr = x.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#0e2a5a"); gr.addColorStop(1, "#050b18"); x.fillStyle = gr; x.fillRect(0, 0, w, h);
    x.fillStyle = "#e9eef4"; x.font = "700 64px Archivo, sans-serif"; x.fillText("21:40", 34, 92); x.fillStyle = "#9aa6b6"; x.font = "26px Archivo, sans-serif"; x.fillText("Living room · 24°", 36, 132);
    const tiles = [["#f2a93b", "Lights"], ["#1b2533", "Curtains"], ["#5b9bff", "AC 24°"], ["#1b2533", "Door"], ["#1b2533", "Scenes"], ["#3bc283", "Secure"]];
    tiles.forEach(([c, l], i) => { const cx = 34 + (i % 3) * 196, cy = 170 + Math.floor(i / 3) * 118; x.fillStyle = c; x.beginPath(); x.roundRect ? x.roundRect(cx, cy, 180, 104, 18) : x.rect(cx, cy, 180, 104); x.fill(); x.fillStyle = c === "#1b2533" ? "#e9eef4" : "#0b1220"; x.font = "600 28px Archivo, sans-serif"; x.fillText(l, cx + 18, cy + 64); });
  });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.76), new THREE.MeshBasicMaterial({ map: ui, toneMapped: false })); screen.position.z = 0.042; g.add(screen);
  const sheen = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.76), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.08, roughness: 0.05, clearcoat: 1 })); sheen.position.z = 0.044; g.add(sheen);
  g.userData.leds = [screen]; return g;
}
function makeHub() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(rb(0.8, 0.2, 0.8, 0.09), plastic()); g.add(body);
  const top = new THREE.Mesh(rb(0.7, 0.03, 0.7, 0.01), plastic(0xe8ebf0, 0.5)); top.position.y = 0.105; g.add(top);
  const led = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.012, 12, 48), glow(0x5b9bff)); led.rotation.x = -Math.PI / 2; led.position.y = 0.124; g.add(led);
  const logo = new THREE.Mesh(new THREE.CircleGeometry(0.04, 24), glow(0x5b9bff)); logo.rotation.x = -Math.PI / 2; logo.position.y = 0.125; g.add(logo);
  g.rotation.x = 0.55; g.userData.leds = [led, logo]; return g;
}
function makeMotion() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.36, 0.32, 64), plastic()); g.add(base);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.3, 48, 32, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.15, transmission: 0.4, thickness: 0.3, clearcoat: 1 }));
  dome.position.y = 0.16; g.add(dome);
  const facet = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 1), new THREE.MeshStandardMaterial({ color: 0xdfe4ea, roughness: 0.4, flatShading: true })); facet.position.y = 0.16; facet.scale.y = 0.6; g.add(facet);
  const led = new THREE.Mesh(new THREE.CircleGeometry(0.02, 16), glow(0xff4a3a)); led.position.set(0, -0.02, 0.345); g.add(led);
  g.userData.leds = [led]; return g;
}
export const MODELS = { switch: makeSwitch, echo: makeEcho, lock: makeLock, gas: makeGas, panel: makePanel, hub: makeHub, motion: makeMotion };

/* ---------------- hero carousel stage ---------------- */
export function createDeviceStage(host, items, onChange) {
  let R;
  try { R = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" }); } catch (e) { return null; }
  R.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75)); R.outputEncoding = THREE.sRGBEncoding;
  R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.1; R.setClearColor(0, 0);
  R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
  R.domElement.className = "d3-canvas"; host.appendChild(R.domElement);
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(R); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 60); cam.position.set(0, 1.1, 7.2);
  const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(3, 5, 4); key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4 }); scene.add(key);
  const rim = new THREE.PointLight(0x5b8cff, 2.2, 14); rim.position.set(-3, 2, -3); scene.add(rim);
  const warm = new THREE.PointLight(0xffc27a, 0, 8); warm.position.set(0, 1.5, 2.5); scene.add(warm);

  /* glowing floor ring + contact shadow */
  const floor = new THREE.Mesh(new THREE.CircleGeometry(4, 96), new THREE.ShadowMaterial({ opacity: 0.35 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -0.95; floor.receiveShadow = true; scene.add(floor);
  const ringTex = (() => { const c = document.createElement("canvas"); c.width = c.height = 256; const x = c.getContext("2d"); const g = x.createRadialGradient(128, 128, 60, 128, 128, 128); g.addColorStop(0, "rgba(91,140,255,0)"); g.addColorStop(0.82, "rgba(91,140,255,.55)"); g.addColorStop(0.9, "rgba(200,220,255,.9)"); g.addColorStop(1, "rgba(91,140,255,0)"); x.fillStyle = g; x.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(c); })();
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 6.4), new THREE.MeshBasicMaterial({ map: ringTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); halo.rotation.x = -Math.PI / 2; halo.position.y = -0.94; scene.add(halo);

  /* the carousel */
  const ring = new THREE.Group(); scene.add(ring);
  const RAD = 2.4, N = items.length;
  const nodes = items.map((it, i) => {
    const pivot = new THREE.Group(); const a = (i / N) * Math.PI * 2;
    pivot.position.set(Math.sin(a) * RAD, 0, Math.cos(a) * RAD); pivot.rotation.y = a;
    const m = MODELS[it.model](); m.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.userData.idx = i; } });
    const holder = new THREE.Group(); holder.add(m); pivot.add(holder); ring.add(pivot);
    return { pivot, holder, model: m, a, s: 1 };
  });

  let off = 0.24, active = 0, angle = 0, target = 0, W = 1, H = 1, visible = true, running = true, dragging = false, dragX = 0, dragA = 0, moved = 0, mx = 0, my = 0, lux = 0, scrollP = 0;
  const setActive = (i, silent) => { active = ((i % N) + N) % N; const k = Math.round((target / (Math.PI * 2)) * N); let want = -((active / N) * Math.PI * 2); const turns = Math.round((target - want) / (Math.PI * 2)); target = want + turns * Math.PI * 2; if (!silent) onChange && onChange(active); };
  const size = () => { const r = host.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height); R.setSize(W, H, false); cam.aspect = W / H; cam.position.z = W / H < 0.9 ? 9.6 : 7.6; off = W / H < 0.9 ? 0.3 : 0.24; cam.setViewOffset(W, H, 0, H * off, W, H); cam.updateProjectionMatrix(); };
  const ro = new ResizeObserver(size); ro.observe(host); size();
  const io = new IntersectionObserver((e) => (visible = e[0].isIntersecting)); io.observe(host);

  /* drag to spin, click a device to bring it forward */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const el = R.domElement;
  el.addEventListener("pointerdown", (e) => { dragging = true; dragX = e.clientX; dragA = target; moved = 0; el.setPointerCapture(e.pointerId); });
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - 0.5; my = (e.clientY - r.top) / r.height - 0.5;
    if (!dragging) { ndc.set(mx * 2, -(my - off) * 2); ray.setFromCamera(ndc, cam); el.style.cursor = ray.intersectObject(ring, true).length ? "pointer" : "grab"; return; }
    const dx = e.clientX - dragX; moved = Math.max(moved, Math.abs(dx)); target = dragA + dx * 0.006;
  });
  const up = (e) => {
    if (!dragging) return; dragging = false;
    if (moved < 6) { ndc.set(mx * 2, -(my - off) * 2); ray.setFromCamera(ndc, cam); const h = ray.intersectObject(ring, true)[0]; if (h && h.object.userData.idx !== undefined) setActive(h.object.userData.idx); }
    else { const step = (Math.PI * 2) / N; const i = Math.round(-target / step); setActive(i); }
  };
  el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);

  const clock = new THREE.Clock();
  (function frame() {
    if (!running) return; requestAnimationFrame(frame); if (!visible || document.hidden) return;
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    angle += (target - angle) * (1 - Math.pow(0.002, dt));
    ring.rotation.y = angle;
    ring.position.y = -scrollP * 0.8; ring.rotation.x = scrollP * 0.35;
    nodes.forEach((n, i) => {
      const isA = i === active; n.s += ((isA ? 1.35 : 0.72) - n.s) * (1 - Math.pow(0.004, dt));
      n.holder.scale.setScalar(n.s);
      n.holder.position.y = Math.sin(t * 1.2 + i) * 0.06 + (isA ? 0.12 : 0);
      n.holder.rotation.y = isA ? Math.sin(t * 0.6) * 0.45 + mx * 0.6 : 0;
      n.holder.rotation.x = isA ? my * 0.25 : 0;
      (n.model.userData.leds || []).forEach((l) => { if (l.material.emissive) l.material.emissiveIntensity = isA ? 2 + Math.sin(t * 4) * 0.8 : 0.9; });
    });
    cam.position.x += (mx * 0.8 - cam.position.x) * 0.04; cam.position.y += (1.1 - my * 0.5 - cam.position.y) * 0.04; cam.lookAt(0, 0.1 - scrollP * 0.4, 0);
    warm.intensity = lux * 3; halo.material.opacity = 0.65 + Math.sin(t * 1.5) * 0.15;
    R.render(scene, cam);
  })();

  return {
    setActive: (i) => setActive(i),
    next: () => setActive(active + 1), prev: () => setActive(active - 1),
    get active() { return active; },
    set scroll(v) { scrollP = v; },
    set lux(v) { lux = v; },
    destroy() { running = false; ro.disconnect(); io.disconnect(); R.dispose(); pm.dispose(); el.remove(); },
  };
}

/* ---------------- 3D "TECHI" for the finale ---------------- */
export function createTitle3D(host, fontUrl) {
  let R;
  try { R = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { return null; }
  R.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75)); R.outputEncoding = THREE.sRGBEncoding; R.toneMapping = THREE.ACESFilmicToneMapping; R.setClearColor(0, 0);
  R.domElement.className = "d3-canvas"; host.appendChild(R.domElement);
  const scene = new THREE.Scene(); const pm = new THREE.PMREMGenerator(R); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  const cam = new THREE.PerspectiveCamera(28, 1, 0.1, 100); cam.position.set(0, 0, 16);
  const pl = new THREE.PointLight(0x9cc0ff, 6, 20); pl.position.set(0, 0, 5); scene.add(pl);
  const pl2 = new THREE.PointLight(0xffc27a, 2, 20); pl2.position.set(-6, 3, 4); scene.add(pl2);
  const group = new THREE.Group(); scene.add(group);
  const letters = [];
  let W = 1, H = 1, running = true, visible = true, mx = 0, my = 0, prog = 0;
  import("three/examples/jsm/loaders/FontLoader.js").then(({ FontLoader }) => import("three/examples/jsm/geometries/TextGeometry.js").then(({ TextGeometry }) => {
    new FontLoader().load(fontUrl, (font) => {
      const mat = new THREE.MeshPhysicalMaterial({ color: 0x1b3f86, metalness: 0.85, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.1 });
      const side = new THREE.MeshStandardMaterial({ color: 0x0a1c42, metalness: 0.6, roughness: 0.4 });
      let x = 0; const sp = 0.25;
      [..."TECHI"].forEach((ch) => {
        const geo = new TextGeometry(ch, { font, size: 2.2, height: 0.7, curveSegments: 10, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.05, bevelSegments: 4 });
        geo.computeBoundingBox(); const w = geo.boundingBox.max.x - geo.boundingBox.min.x;
        geo.translate(-w / 2, -1.1, -0.35);
        const m = new THREE.Mesh(geo, [mat, side]); m.position.x = x + w / 2; x += w + sp; group.add(m); letters.push(m);
      });
      group.position.x = -(x - sp) / 2;
    });
  }));
  const size = () => { const r = host.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height); R.setSize(W, H, false); cam.aspect = W / H; cam.position.z = W / H < 1 ? 30 : 15.5; cam.updateProjectionMatrix(); };
  const ro = new ResizeObserver(size); ro.observe(host); size();
  const io = new IntersectionObserver((e) => (visible = e[0].isIntersecting)); io.observe(host);
  const mv = (e) => { const r = host.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - 0.5; my = (e.clientY - r.top) / r.height - 0.5; };
  addEventListener("pointermove", mv, { passive: true });
  const clock = new THREE.Clock();
  (function frame() {
    if (!running) return; requestAnimationFrame(frame); if (!visible || document.hidden) return;
    const t = clock.getElapsedTime();
    letters.forEach((l, i) => {
      const enter = Math.min(1, Math.max(0, prog * 1.6 - i * 0.12));
      const e = 1 - Math.pow(1 - enter, 3);
      l.rotation.x = (1 - e) * -1.4 + Math.sin(t * 1.3 + i * 0.7) * 0.06 + my * 0.3;
      l.rotation.y = mx * 0.5 + Math.sin(t * 0.9 + i) * 0.05;
      l.position.y = (1 - e) * -3 + Math.sin(t * 1.6 + i * 0.8) * 0.12;
      l.position.z = (1 - e) * -6;
    });
    pl.position.set(mx * 14, -my * 6, 5);
    R.render(scene, cam);
  })();
  return { set progress(v) { prog = v; }, destroy() { running = false; ro.disconnect(); io.disconnect(); removeEventListener("pointermove", mv); R.dispose(); pm.dispose(); R.domElement.remove(); } };
}
