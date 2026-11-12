/* Hero scene: a Techi smart living room. Every device is live — hover to see it, tap to control it.
   Lights, floor lamp, curtains, TV, speaker, AC, smart lock (door) and a robot vacuum, plus scenes. */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

const C = (h) => new THREE.Color(h).convertSRGBToLinear();
const M = (h, o = {}) => new THREE.MeshStandardMaterial({ color: C(h), roughness: 0.8, ...o });
const RB = (w, h, d, r = 0.06, s = 3) => new RoundedBoxGeometry(w, h, d, s, r);
const lerp = (a, b, k) => a + (b - a) * k;

export const DEVICES = ["lights", "lamp", "curtains", "tv", "speaker", "ac", "lock", "vacuum"];
export const SCENES = {
  morning: { night: false, lights: false, lamp: false, curtains: true, tv: false, speaker: true, ac: false, lock: true, vacuum: true },
  movie: { night: true, lights: false, lamp: true, curtains: false, tv: true, speaker: true, ac: true, lock: true, vacuum: false },
  night: { night: true, lights: false, lamp: false, curtains: false, tv: false, speaker: false, ac: true, lock: true, vacuum: false },
  home: { night: false, lights: true, lamp: true, curtains: true, tv: false, speaker: true, ac: false, lock: true, vacuum: false },
};

export function createRoom(host, opts = {}) {
  let R;
  try { R = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" }); } catch (e) { return null; }
  const lite = matchMedia("(max-width: 760px)").matches;
  R.setPixelRatio(Math.min(devicePixelRatio || 1, lite ? 1.25 : 1.5));
  R.outputEncoding = THREE.sRGBEncoding; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 0.25;
  R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
  R.domElement.className = "room-canvas"; host.appendChild(R.domElement);

  const scene = new THREE.Scene();
  const bgDay = C("#E4EAF4"), bgNight = C("#0B1730");
  scene.background = bgDay.clone();
  scene.fog = new THREE.Fog(scene.background, 18, 40);
  const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 120);
  cam.position.set(6, 6, 17);

  /* ---------- light ---------- */
  const hemi = new THREE.HemisphereLight(C("#F4F7FF"), C("#8C98B4"), 0.55); scene.add(hemi);
  const fill = new THREE.DirectionalLight(C("#E8EEFF"), 0.35); fill.position.set(4, 5, 12); scene.add(fill);
  const sun = new THREE.DirectionalLight(C("#FFF1DC"), 2.4);
  sun.position.set(9, 9, -14); sun.target.position.set(1, 0, 1); scene.add(sun, sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(lite ? 1024 : 2048, lite ? 1024 : 2048); sun.shadow.bias = -0.0006;
  Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 40 }); sun.shadow.radius = 4;

  const pick = []; // meshes that belong to a device
  const tag = (obj, dev) => { obj.traverse((o) => { if (o.isMesh) { o.userData.dev = dev; pick.push(o); } }); obj.userData.dev = dev; return obj; };
  const shade = (o, c = true, r = true) => { o.traverse((m) => { if (m.isMesh) { m.castShadow = c; m.receiveShadow = r; } }); return o; };

  /* ---------- architecture ---------- */
  const wallM = M("#DCE3EF", { roughness: 0.95 }), wallM2 = M("#E7ECF5", { roughness: 0.95 });
  function wall(w, h, holes, depth, mat) {
    const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h); s.lineTo(-w / 2, h); s.lineTo(-w / 2, 0);
    holes.forEach(([x, aw, top, y0]) => { const p = new THREE.Path(), r = aw / 2; p.moveTo(x - r, y0); p.lineTo(x - r, top - r); p.absarc(x, top - r, r, Math.PI, 0, true); p.lineTo(x + r, y0); p.lineTo(x - r, y0); s.holes.push(p); });
    return shade(new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 36 }), mat));
  }
  const back = wall(12.3, 6.5, [[3, 3.4, 5.4, 1.0]], 0.3, wallM); back.position.set(0, 0, -4.3); scene.add(back);
  const left = wall(8.6, 6.5, [[-2.4, 1.3, 3.1, 0]], 0.3, wallM2); left.rotation.y = Math.PI / 2; left.position.set(-6.15, 0, 0); scene.add(left);
  const floor = shade(new THREE.Mesh(new THREE.BoxGeometry(12.3, 0.3, 9.6), M("#D3DAE7", { roughness: 0.42 })), false, true); floor.position.set(0, -0.15, 0.5); scene.add(floor);
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(12.5, 0.12, 9.8), M("#011738", { roughness: 0.5 })); plinth.position.set(0, -0.36, 0.5); scene.add(plinth);
  const sill = shade(new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.08, 0.5), M("#F4F6FA"))); sill.position.set(3, 1.0, -3.9); scene.add(sill);
  const hall = new THREE.Mesh(new THREE.PlaneGeometry(3, 4), M("#EEF2F8")); hall.rotation.y = Math.PI / 2; hall.position.set(-7.4, 1.8, 2.4); scene.add(hall);

  /* sky + Cairo skyline through the window */
  const skyCv = document.createElement("canvas"); skyCv.width = 4; skyCv.height = 256;
  { const x = skyCv.getContext("2d"), g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, "#6F8FD6"); g.addColorStop(0.6, "#B9C9EC"); g.addColorStop(1, "#F1F4FA"); x.fillStyle = g; x.fillRect(0, 0, 4, 256); }
  const skyTex = new THREE.CanvasTexture(skyCv); skyTex.encoding = THREE.sRGBEncoding;
  const skyMat = new THREE.MeshBasicMaterial({ map: skyTex, fog: false });
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(40, 18), skyMat); sky.position.set(3, 5, -16); scene.add(sky);
  const sunCol = C("#FFF4DE"), moonCol = C("#E8EEFF");
  const sunDisk = new THREE.Mesh(new THREE.CircleGeometry(0.9, 40), new THREE.MeshBasicMaterial({ color: sunCol.clone(), fog: false })); sunDisk.position.set(6, 6.2, -15.9); scene.add(sunDisk);
  const cityM = M("#9FB0D3", { roughness: 1 }), winM = new THREE.MeshBasicMaterial({ color: C("#FFD9A0"), transparent: true, opacity: 0 });
  for (let i = 0; i < 16; i++) {
    const h = 1.2 + ((i * 37) % 9) * 0.45, w = 0.9 + ((i * 13) % 5) * 0.25;
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 1), cityM); b.position.set(-3 + i * 0.95, h / 2 - 0.5, -11 - (i % 3) * 1.4); scene.add(b);
    if (i % 2 === 0) { const wl = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.6, h * 0.55), winM); wl.position.set(b.position.x, b.position.y + 0.1, b.position.z + 0.51); scene.add(wl); }
  }

  /* ---------- furniture ---------- */
  const fabric = M("#33476E", { roughness: 0.95 }), fabric2 = M("#3F5582", { roughness: 0.95 }), white = M("#F4F6FA", { roughness: 0.5 });
  const sofa = new THREE.Group();
  const sp = (g, m, x, y, z) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); sofa.add(o); return o; };
  sp(RB(3.2, 0.42, 1.1, 0.1), fabric, 0, 0.33, 0);
  sp(RB(1.48, 0.22, 0.92, 0.09), fabric2, -0.76, 0.64, 0.06); sp(RB(1.48, 0.22, 0.92, 0.09), fabric2, 0.76, 0.64, 0.06);
  sp(RB(3.2, 0.82, 0.3, 0.12), fabric, 0, 0.86, -0.42);
  sp(RB(0.3, 0.66, 1.1, 0.12), fabric, -1.6, 0.55, 0); sp(RB(0.3, 0.66, 1.1, 0.12), fabric, 1.6, 0.55, 0);
  sp(RB(0.55, 0.5, 0.18, 0.08), M("#EEF1F7", { roughness: 1 }), -1.05, 0.98, -0.22).rotation.z = 0.12;
  sp(RB(0.5, 0.46, 0.18, 0.08), M("#9CC6FF", { roughness: 1 }), 1.05, 0.96, -0.22).rotation.z = -0.1;
  [[-1.5, -0.45], [1.5, -0.45], [-1.5, 0.45], [1.5, 0.45]].forEach(([x, z]) => sp(new THREE.CylinderGeometry(0.04, 0.03, 0.14, 10), M("#011738"), x, 0.07, z));
  sofa.rotation.y = -Math.PI / 2; sofa.position.set(3.7, 0, -0.5); scene.add(shade(sofa));

  const rug = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.02, 64), M("#C3CCDD", { roughness: 1 })); rug.position.set(1.0, 0.01, -0.5); rug.receiveShadow = true; scene.add(rug);
  const table = new THREE.Group();
  table.add(new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.06, 48), white)).position.y = 0.42;
  table.add(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 0.4, 24), M("#011738", { roughness: 0.4, metalness: 0.3 }))).position.y = 0.2;
  const book = new THREE.Mesh(RB(0.5, 0.06, 0.36, 0.02), M("#9CC6FF")); book.position.set(0.15, 0.48, 0.1); book.rotation.y = 0.4; table.add(book);
  table.position.set(1.1, 0, -0.5); scene.add(shade(table));

  const plant = new THREE.Group();
  plant.add(new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.24, 0.62, 24), white)).position.y = 0.31;
  const leafM = M("#5E8C6A", { roughness: 0.9 });
  for (let i = 0; i < 9; i++) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), leafM); const a = i * 2.4; l.scale.set(0.6, 1.9, 0.35); l.position.set(Math.cos(a) * 0.22, 1.0 + (i % 3) * 0.28, Math.sin(a) * 0.22); l.rotation.set(Math.sin(a) * 0.5, a, Math.cos(a) * 0.5); plant.add(l); }
  plant.position.set(-5.2, 0, -3.3); scene.add(shade(plant));

  const art = new THREE.Group();
  art.add(new THREE.Mesh(RB(1.7, 1.15, 0.05, 0.02), M("#011738", { roughness: 0.4 })));
  const artIn = new THREE.Mesh(new THREE.PlaneGeometry(1.56, 1.01), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }));
  artIn.position.z = 0.03; art.add(artIn);
  new THREE.TextureLoader().load("/techi-img/logo-full-navy.png", (t) => {
    const c = document.createElement("canvas"); c.width = 512; c.height = 330; const x = c.getContext("2d");
    x.fillStyle = "#F4F6FA"; x.fillRect(0, 0, 512, 330); const iw = 300, ih = (iw * t.image.height) / t.image.width; x.drawImage(t.image, 106, 165 - ih / 2, iw, ih);
    const ct = new THREE.CanvasTexture(c); ct.encoding = THREE.sRGBEncoding; artIn.material.map = ct; artIn.material.needsUpdate = true;
  });
  art.position.set(-0.6, 2.9, -3.97); scene.add(art);

  /* ---------- devices ---------- */
  const warm = C("#FFD9A8");
  const bulbM = new THREE.MeshStandardMaterial({ color: C("#FFF6E8"), emissive: warm, emissiveIntensity: 0 });
  const pend = new THREE.Group(), pLights = [];
  [[0.75, -1.05], [1.45, 0.05]].forEach(([x, z]) => {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 2.4, 6), M("#011738"))).position.y = 1.2;
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), M("#011738", { roughness: 0.35, metalness: 0.4, side: THREE.DoubleSide })));
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), bulbM); b.position.y = -0.04; g.add(b);
    const L = new THREE.PointLight(warm, 0, 9, 2); L.position.y = -0.2; g.add(L); pLights.push(L);
    g.position.set(x, 3.9, z); pend.add(g);
  });
  scene.add(tag(pend, "lights"));

  const lampShadeM = new THREE.MeshStandardMaterial({ color: C("#F3EEE4"), emissive: warm, emissiveIntensity: 0, side: THREE.DoubleSide, roughness: 0.9 });
  const lamp = new THREE.Group();
  lamp.add(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.04, 24), M("#011738"))).position.y = 0.02;
  lamp.add(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.2, 8), M("#011738"))).position.y = 1.1;
  lamp.add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.34, 0.46, 32, 1, true), lampShadeM)).position.y = 2.25;
  const lampL = new THREE.PointLight(warm, 0, 7, 2); lampL.position.y = 2.1; lamp.add(lampL);
  lamp.position.set(4.6, 0, -2.75); scene.add(tag(shade(lamp, true, false), "lamp"));

  const curtM = new THREE.MeshStandardMaterial({ color: C("#F2F4F8"), roughness: 1, side: THREE.DoubleSide });
  const curtG = new THREE.PlaneGeometry(1.95, 4.5, 48, 1); const cp = curtG.attributes.position;
  for (let i = 0; i < cp.count; i++) cp.setZ(i, Math.sin(cp.getX(i) * 14) * 0.05);
  curtG.computeVertexNormals();
  const curt = new THREE.Group(), cL = new THREE.Mesh(curtG, curtM), cR = new THREE.Mesh(curtG, curtM);
  curt.add(cL, cR);
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 4.6, 8), M("#011738")); rod.rotation.z = Math.PI / 2; rod.position.set(3, 5.55, -3.82); scene.add(rod);
  curt.position.set(0, 3.3, -3.82); scene.add(tag(shade(curt), "curtains"));

  const tvCv = document.createElement("canvas"); tvCv.width = 512; tvCv.height = 288;
  const tvTex = new THREE.CanvasTexture(tvCv); tvTex.encoding = THREE.sRGBEncoding;
  const tvScreen = new THREE.MeshBasicMaterial({ color: C("#05080F") });
  const tv = new THREE.Group();
  tv.add(new THREE.Mesh(RB(2.8, 1.6, 0.07, 0.02), M("#0B1222", { roughness: 0.3, metalness: 0.4 })));
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 1.5), tvScreen); scr.position.z = 0.04; tv.add(scr);
  const tvL = new THREE.PointLight(C("#7FA6FF"), 0, 6, 2); tvL.position.z = 0.8; tv.add(tvL);
  tv.rotation.y = Math.PI / 2; tv.position.set(-5.8, 2.45, -0.8); scene.add(tag(tv, "tv"));
  const con = new THREE.Mesh(RB(3.4, 0.5, 0.55, 0.05), white); con.rotation.y = Math.PI / 2; con.position.set(-5.55, 0.25, -0.8); scene.add(shade(con));

  const ringM = new THREE.MeshBasicMaterial({ color: C("#2C3B57") });
  const spk = new THREE.Group();
  spk.add(new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.3, 32), M("#2B3445", { roughness: 1 }))).position.y = 0.15;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.018, 8, 40), ringM); ring.rotation.x = Math.PI / 2; ring.position.y = 0.3; spk.add(ring);
  const waves = [0, 1, 2].map(() => { const w = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.006, 6, 48), new THREE.MeshBasicMaterial({ color: C("#3D6BFF"), transparent: true, opacity: 0 })); w.rotation.x = Math.PI / 2; w.position.y = 0.3; spk.add(w); return w; });
  spk.position.set(-5.5, 0.5, 0.55); scene.add(tag(shade(spk, true, false), "speaker"));

  const ac = new THREE.Group();
  ac.add(new THREE.Mesh(RB(1.8, 0.48, 0.3, 0.08), M("#F7F9FC", { roughness: 0.4 })));
  const flap = new THREE.Mesh(RB(1.6, 0.05, 0.12, 0.02), M("#E2E7F0")); flap.position.set(0, -0.22, 0.12); ac.add(flap);
  const acLedM = new THREE.MeshBasicMaterial({ color: C("#3a4660") });
  const acLed = new THREE.Mesh(new THREE.CircleGeometry(0.025, 12), acLedM); acLed.position.set(0.72, 0.06, 0.155); ac.add(acLed);
  ac.position.set(-2.8, 4.75, -3.95); scene.add(tag(shade(ac), "ac"));
  const airN = 140, airG = new THREE.BufferGeometry(), airP = new Float32Array(airN * 3), airS = new Float32Array(airN);
  for (let i = 0; i < airN; i++) { airS[i] = Math.random(); airP[i * 3] = -3.6 + Math.random() * 1.6; }
  airG.setAttribute("position", new THREE.BufferAttribute(airP, 3));
  const airM = new THREE.PointsMaterial({ color: C("#9CC6FF"), size: 0.05, transparent: true, opacity: 0, depthWrite: false });
  scene.add(new THREE.Points(airG, airM));

  const doorPivot = new THREE.Group();
  const door = new THREE.Mesh(RB(0.07, 2.95, 1.26, 0.02), M("#011738", { roughness: 0.45 })); door.position.set(0, 1.5, -0.63); doorPivot.add(door);
  const lockBody = new THREE.Mesh(RB(0.05, 0.36, 0.13, 0.02), M("#11192A", { roughness: 0.3, metalness: 0.5 })); lockBody.position.set(0.06, 1.15, -1.08); doorPivot.add(lockBody);
  const lockLedM = new THREE.MeshBasicMaterial({ color: C("#3D6BFF") });
  const lockLed = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.03, 0.08), lockLedM); lockLed.position.set(0.09, 1.25, -1.08); doorPivot.add(lockLed);
  const handle = new THREE.Mesh(RB(0.06, 0.04, 0.24, 0.015), M("#C9D2E3", { metalness: 0.8, roughness: 0.3 })); handle.position.set(0.1, 1.0, -1.0); doorPivot.add(handle);
  doorPivot.position.set(-5.97, 0, 3.05); scene.add(tag(shade(doorPivot), "lock"));

  const sw = new THREE.Group();
  sw.add(new THREE.Mesh(RB(0.5, 0.5, 0.04, 0.03), M("#011738", { roughness: 0.35, metalness: 0.2 })));
  const swLedM = new THREE.MeshBasicMaterial({ color: C("#5E7BB8") });
  for (let i = 0; i < 3; i++) { const d = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.009, 8, 24), swLedM); d.position.set((i - 1) * 0.14, 0, 0.025); sw.add(d); }
  sw.position.set(-4.3, 1.55, -3.98); scene.add(tag(sw, "lights"));

  const vac = new THREE.Group();
  vac.add(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.09, 40), M("#F4F6FA", { roughness: 0.4 }))).position.y = 0.06;
  vac.add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 32), M("#011738", { roughness: 0.3 }))).position.y = 0.115;
  const vacLedM = new THREE.MeshBasicMaterial({ color: C("#3a4660") });
  const vacLed = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.03), vacLedM); vacLed.position.set(0, 0.12, 0.24); vac.add(vacLed);
  const DOCK = new THREE.Vector3(-1.9, 0, -3.55);
  const dock = new THREE.Mesh(RB(0.5, 0.3, 0.16, 0.04), M("#EEF1F6")); dock.position.set(-1.9, 0.15, -3.9); scene.add(dock);
  vac.position.copy(DOCK); scene.add(tag(shade(vac, true, false), "vacuum"));

  /* ---------- state ---------- */
  const S = { night: false, lights: false, lamp: false, curtains: false, tv: false, speaker: false, ac: false, lock: true, vacuum: false };
  const A = { night: 0, lights: 0, lamp: 0, curtains: 0, tv: 0, speaker: 0, ac: 0, door: 0, vac: 0, wake: 0 };
  let woke = false;
  const subs = new Set(), hovers = new Set();
  const emit = () => subs.forEach((f) => f({ ...S }));
  const set = (k, v) => { if (!(k in S) || S[k] === v) return; S[k] = v; emit(); };

  /* ---------- picking ---------- */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let hoverDev = null, px = 0, py = 0, down = null, needPick = false, mx = 0, my = 0;
  const cv = R.domElement;
  const onMove = (e) => { const r = cv.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; ndc.set((px / r.width) * 2 - 1, -(py / r.height) * 2 + 1); needPick = true; };
  const doPick = () => {
    ray.setFromCamera(ndc, cam);
    const hit = ray.intersectObjects(pick, false)[0];
    const d = hit ? hit.object.userData.dev : null;
    if (d !== hoverDev) { hoverDev = d; cv.style.cursor = d ? "pointer" : ""; }
    hovers.forEach((f) => f(hoverDev, px, py));
  };
  const onDown = (e) => { onMove(e); down = { x: e.clientX, y: e.clientY }; };
  const onUp = (e) => {
    if (!down) return; const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y); down = null;
    if (moved > 8) return; onMove(e); doPick();
    if (hoverDev) set(hoverDev, !S[hoverDev]);
  };
  const onLeave = () => { hoverDev = null; cv.style.cursor = ""; hovers.forEach((f) => f(null, 0, 0)); };
  cv.addEventListener("pointermove", onMove); cv.addEventListener("pointerdown", onDown); cv.addEventListener("pointerup", onUp); cv.addEventListener("pointerleave", onLeave);
  const gmv = (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; };
  addEventListener("pointermove", gmv, { passive: true });

  /* ---------- loop ---------- */
  let W = 1, H = 1, scroll = 0, visible = true, running = true, wide = true, frameN = 0;
  const size = () => {
    const r = host.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height); R.setSize(W, H, false);
    cam.aspect = W / H; wide = W / H > 1.15; cam.fov = W / H < 0.8 ? 60 : 40;
    if (wide) cam.setViewOffset(W, H, -W * 0.2 * (opts.rtl ? -1 : 1), H * 0.06, W, H); else cam.setViewOffset(W, H, 0, -H * 0.1, W, H);
    cam.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(size); ro.observe(host); size();
  const io = new IntersectionObserver((e) => (visible = e[0].isIntersecting)); io.observe(host);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const t0 = performance.now(); let last = t0;
  const vPos = new THREE.Vector3(), white3 = new THREE.Color(1, 1, 1), dayHemi = C("#F4F7FF"), nightHemi = C("#5068A0");
  const cOff = C("#3a4660"), cScr = C("#05080F"), cRing = C("#2C3B57"), cRingOn = C("#4FA3FF"), cAc = C("#7FD0FF"), cGreen = C("#47D89A"), cLock = C("#3D6BFF"), cSw = C("#5E7BB8"), cSwOn = C("#9CC6FF");
  const tvDraw = (t) => {
    const x = tvCv.getContext("2d"), g = x.createLinearGradient(0, 0, 512, 288);
    g.addColorStop(0, "#011738"); g.addColorStop(1, "#1E4BB8"); x.fillStyle = g; x.fillRect(0, 0, 512, 288);
    for (let i = 0; i < 5; i++) { x.beginPath(); x.strokeStyle = `rgba(156,198,255,${0.15 + i * 0.08})`; x.lineWidth = 2; for (let k = 0; k <= 512; k += 8) x.lineTo(k, 190 + Math.sin(k * 0.02 + t * (1 + i * 0.3) + i) * (16 + i * 6)); x.stroke(); }
    x.fillStyle = "#fff"; x.font = "600 30px Arial"; x.fillText("TECHI TV", 32, 64);
    x.font = "400 16px Arial"; x.fillStyle = "rgba(255,255,255,.7)"; x.fillText("Movie scene · lights dimmed", 32, 92);
    tvTex.needsUpdate = true;
  };

  (function frame() {
    if (!running) return; requestAnimationFrame(frame); if (!visible || document.hidden) return;
    const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now;
    const t = (now - t0) / 1000, k = reduce ? 1 : 1 - Math.pow(0.02, dt);
    A.night = lerp(A.night, S.night ? 1 : 0, k * 0.6);
    A.lights = lerp(A.lights, S.lights ? 1 : 0, k * 1.4);
    A.lamp = lerp(A.lamp, S.lamp ? 1 : 0, k * 1.4);
    A.curtains = lerp(A.curtains, S.curtains ? 1 : 0, k * 0.7);
    A.tv = lerp(A.tv, S.tv ? 1 : 0, k * 1.6);
    A.speaker = lerp(A.speaker, S.speaker ? 1 : 0, k * 1.4);
    A.ac = lerp(A.ac, S.ac ? 1 : 0, k);
    A.door = lerp(A.door, S.lock ? 0 : 1, k * 0.8);
    A.wake = lerp(A.wake, woke ? 1 : 0, k * 0.35);

    const day = 1 - A.night, open = A.curtains;
    scene.background.copy(bgDay).lerp(bgNight, A.night); scene.fog.color.copy(scene.background);
    skyMat.color.setScalar(lerp(1, 0.16, A.night)); sunDisk.material.color.copy(sunCol).lerp(moonCol, A.night); sunDisk.scale.setScalar(lerp(1, 0.55, A.night));
    winM.opacity = A.night * 0.9;
    sun.intensity = 2.4 * day * (0.12 + 0.88 * open); hemi.intensity = lerp(0.6, 0.16, A.night) * (0.75 + 0.25 * open); hemi.color.copy(dayHemi).lerp(nightHemi, A.night);
    fill.intensity = lerp(0.35, 0.08, A.night);
    R.toneMappingExposure = lerp(0.25, 0.95, A.wake);
    const sc = lerp(1, 0.28, open);
    cL.scale.x = cR.scale.x = sc; cL.position.x = lerp(2.03, 1.55, open); cR.position.x = lerp(3.97, 4.45, open);
    bulbM.emissiveIntensity = A.lights * 3; pLights.forEach((L) => (L.intensity = A.lights * 1.4));
    lampShadeM.emissiveIntensity = A.lamp * 0.9; lampL.intensity = A.lamp * 1.2;
    swLedM.color.copy(cSw).lerp(cSwOn, A.lights);
    if (A.tv > 0.02) { if (tvScreen.map !== tvTex) { tvScreen.map = tvTex; tvScreen.needsUpdate = true; } if ((frameN & 1) === 0) tvDraw(t); }
    else if (tvScreen.map) { tvScreen.map = null; tvScreen.needsUpdate = true; }
    tvScreen.color.copy(cScr).lerp(white3, A.tv); tvL.intensity = A.tv * (0.9 + Math.sin(t * 3) * 0.15);
    ringM.color.copy(cRing).lerp(cRingOn, A.speaker * (0.75 + Math.sin(t * 4) * 0.25));
    waves.forEach((w, i) => { const p = (t * 0.6 + i / 3) % 1; w.scale.setScalar(0.6 + p * 2.2); w.position.y = 0.3 + p * 0.25; w.material.opacity = A.speaker * (1 - p) * 0.7; });
    flap.rotation.x = A.ac * 0.7; acLedM.color.copy(cOff).lerp(cAc, A.ac); airM.opacity = A.ac * 0.55;
    if (A.ac > 0.01) {
      for (let i = 0; i < airN; i++) { airS[i] = (airS[i] + dt * 0.35) % 1; const s = airS[i]; airP[i * 3 + 1] = 4.45 - s * 2.6; airP[i * 3 + 2] = -3.7 + s * 2.2 + Math.sin(s * 9 + i) * 0.08; }
      airG.attributes.position.needsUpdate = true;
    }
    doorPivot.rotation.y = -A.door * 1.15; lockLedM.color.copy(cLock).lerp(cGreen, A.door);
    if (S.vacuum) { A.vac += dt; const a = A.vac * 0.45; vPos.set(0.7 + Math.cos(a) * 2.0, 0, -0.4 + Math.sin(a * 1.3) * 1.65); } else vPos.copy(DOCK);
    const dx = vPos.x - vac.position.x, dz = vPos.z - vac.position.z;
    if (Math.hypot(dx, dz) > 0.01) vac.rotation.y = lerp(vac.rotation.y, Math.atan2(dx, dz), 0.15);
    const vk = S.vacuum ? 0.2 : k * 0.6; vac.position.x = lerp(vac.position.x, vPos.x, vk); vac.position.z = lerp(vac.position.z, vPos.z, vk);
    vacLedM.color.copy(S.vacuum ? cGreen : cOff);
    pend.children.forEach((g, i) => (g.rotation.z = Math.sin(t * 0.8 + i) * 0.015));

    const e = reduce ? 1 : 1 - Math.pow(1 - Math.min(1, A.wake * 1.05), 3);
    const tx = (wide ? 6.2 : 4.6) + mx * 1.4, ty = (wide ? 6.3 : 7.4) - my * 0.6 + (1 - e) * 2.2 + scroll * 1.2;
    cam.position.x += (tx - cam.position.x) * 0.04; cam.position.y += (ty - cam.position.y) * 0.05;
    const tz = (wide ? 14 : 19) + (1 - e) * 5 - scroll * 2.5; cam.position.z += (tz - cam.position.z) * 0.06;
    cam.lookAt(-0.3, 1.3 - scroll * 0.6, -0.6);
    if (needPick && !down) { needPick = false; doPick(); }
    frameN++;
    R.render(scene, cam);
  })();

  return {
    get state() { return { ...S }; },
    set scroll(v) { scroll = v; },
    set: (k, v) => set(k, v),
    toggle: (k) => set(k, !S[k]),
    scene(name) { const s = SCENES[name]; if (!s) return; Object.assign(S, s); emit(); },
    wake() { // "welcome home" automation once the site opens
      if (woke) return; woke = true;
      const steps = [[200, () => set("lock", false)], [900, () => set("lights", true)], [1400, () => set("lamp", true)], [2000, () => set("curtains", true)], [2600, () => set("speaker", true)], [3800, () => set("lock", true)]];
      steps.forEach(([ms, f]) => setTimeout(() => running && f(), reduce ? 0 : ms));
    },
    onChange(f) { subs.add(f); f({ ...S }); return () => subs.delete(f); },
    onHover(f) { hovers.add(f); return () => hovers.delete(f); },
    destroy() {
      running = false; ro.disconnect(); io.disconnect(); removeEventListener("pointermove", gmv);
      cv.removeEventListener("pointermove", onMove); cv.removeEventListener("pointerdown", onDown); cv.removeEventListener("pointerup", onUp); cv.removeEventListener("pointerleave", onLeave);
      R.dispose(); cv.remove();
    },
  };
}
