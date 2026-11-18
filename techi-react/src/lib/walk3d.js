/* Techi walk-through: a realistic apartment you can walk around in first person.
   Real-world scale (metres), CC0 Poly Haven furniture, PBR textures and HDRI lighting.
   Every Techi device in the home can be tapped: it shows the product and does what it does. */
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

const BASE = "/techi-3d/";
const H = 2.9;           // ceiling height
const EYE = 1.62;        // eye height
const C = (h) => new THREE.Color(h).convertSRGBToLinear();

/* ---------- floor plan (metres). x → east, z → south ---------- */
export const ROOMS = [
  { id: "living", x0: 0, x1: 7, z0: 4, z1: 9, name: { en: "Living room", ar: "الليفينج" }, view: [6.25, 4.55, 2.3] },
  { id: "kitchen", x0: 0, x1: 4, z0: 0, z1: 4, name: { en: "Kitchen", ar: "المطبخ" }, view: [3.3, 3.45, 0.75] },
  { id: "entrance", x0: 4, x1: 7, z0: 0, z1: 4, name: { en: "Entrance", ar: "المدخل" }, view: [5.5, 0.9, Math.PI] },
  { id: "bedroom", x0: 7, x1: 12, z0: 0, z1: 9, name: { en: "Bedroom", ar: "أوضة النوم" }, view: [7.6, 0.95, -2.6] },
];
/* camera view: [x, z, yaw]; yaw 0 looks to -z (north), PI looks to +z (south) */

export const DEVICES = [
  { id: "lock", room: "entrance", name: { en: "Face-ID smart lock", ar: "كالون بصمة وش" }, act: { en: "Unlocked", ar: "اتفتح" } },
  { id: "light_living", room: "living", name: { en: "Living room lights", ar: "نور الليفينج" }, act: { en: "Lights switched", ar: "النور اتغيّر" } },
  { id: "curtain_living", room: "living", name: { en: "Smart curtains", ar: "ستارة ذكية" }, act: { en: "Curtains moving", ar: "الستارة بتتحرك" } },
  { id: "panel", room: "living", name: { en: "10.1\" control screen", ar: "شاشة تحكم 10.1" }, act: { en: "Scene: Welcome home", ar: "مشهد: أهلاً بيك" } },
  { id: "echo", room: "living", name: { en: "Alexa · Echo Dot", ar: "أليكسا · إيكو دوت" }, act: { en: "\"Alexa, movie time\"", ar: "\"أليكسا، وقت الفيلم\"" } },
  { id: "socket", room: "living", name: { en: "Smart socket", ar: "بريزة ذكية" }, act: { en: "Socket switched", ar: "البريزة اتغيرت" } },
  { id: "motion", room: "living", name: { en: "Motion sensor", ar: "حساس حركة" }, act: { en: "Motion detected", ar: "فيه حركة" } },
  { id: "light_kitchen", room: "kitchen", name: { en: "Kitchen lights", ar: "نور المطبخ" }, act: { en: "Lights switched", ar: "النور اتغيّر" } },
  { id: "gas", room: "kitchen", name: { en: "Gas detector", ar: "حساس غاز" }, act: { en: "Gas check: safe", ar: "الغاز: آمن" } },
  { id: "valve", room: "kitchen", name: { en: "Water valve controller", ar: "محبس مية ذكي" }, act: { en: "Water valve switched", ar: "المحبس اتغيّر" } },
  { id: "hub", room: "entrance", name: { en: "Zigbee hub", ar: "هاب زيجبي" }, act: { en: "All devices online", ar: "كل الأجهزة متصلة" } },
  { id: "light_bedroom", room: "bedroom", name: { en: "Bedroom lights", ar: "نور أوضة النوم" }, act: { en: "Lights switched", ar: "النور اتغيّر" } },
  { id: "curtain_bed", room: "bedroom", name: { en: "Bedroom curtains", ar: "ستارة أوضة النوم" }, act: { en: "Curtains moving", ar: "الستارة بتتحرك" } },
];

/* walls: [x0,z0,x1,z1, thickness, openings[]] ; opening = [centre along wall, width, bottom, top, kind] */
const WALLS = [
  [0, 0, 12, 0, 0.2, [[2, 1.4, 0.95, 2.25, "win"], [5.5, 1.0, 0, 2.2, "door"]]],             // north
  [0, 9, 12, 9, 0.2, [[3.5, 3.6, 0.02, 2.5, "win"], [9.6, 2.2, 0.55, 2.45, "win"]]],         // south
  [0, 0, 0, 9, 0.2, [[6.6, 1.6, 0.6, 2.4, "win"]]],                                         // west
  [12, 0, 12, 9, 0.2, [[3.0, 1.4, 0.8, 2.3, "win"]]],                                       // east
  [7, 0, 7, 9, 0.12, [[2.1, 0.9, 0, 2.15, "open"]]],                                          // living|bedroom
  [0, 4, 7, 4, 0.12, [[2.1, 3.4, 0, 2.45, "open"], [5.5, 1.4, 0, 2.45, "open"]]],              // kitchen,entrance|living
  [4, 0, 4, 4, 0.12, [[2.6, 1.0, 0, 2.15, "open"]]],                                           // kitchen|entrance
];
/* areas you can stand in (rooms shrunk a bit + doorways) */
const WALK = [
  ...ROOMS.map((r) => [r.x0 + 0.32, r.z0 + 0.32, r.x1 - 0.32, r.z1 - 0.32]),
  [6.6, 1.62, 7.4, 2.58], [0.4, 3.6, 3.8, 4.4], [4.8, 3.6, 6.2, 4.4], [3.6, 2.12, 4.4, 3.08],
];

export function createWalk(host, opts = {}) {
  let R;
  try { R = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" }); } catch (e) { return null; }
  const mobile = matchMedia("(max-width: 820px), (pointer: coarse)").matches;
  let lang = opts.lang || "en";
  R.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 1.75));
  R.outputEncoding = THREE.sRGBEncoding;
  R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 0.82;
  R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
  R.domElement.className = "walk-canvas"; host.appendChild(R.domElement);
  RectAreaLightUniformsLib.init();

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(mobile ? 72 : 64, 1, 0.05, 400);
  const manager = new THREE.LoadingManager();
  const listeners = { progress: new Set(), device: new Set(), room: new Set(), ready: new Set() };
  const emit = (k, ...a) => listeners[k].forEach((f) => f(...a));
  manager.onProgress = (_, l, t) => emit("progress", l / t);

  /* ---------- environment: real interior light for reflections, a real city outside the windows ---------- */
  const pmrem = new THREE.PMREMGenerator(R);
  new RGBELoader(manager).load(BASE + "hdri/hotel_room_1k.hdr", (t) => { scene.environment = pmrem.fromEquirectangular(t).texture; t.dispose(); });
  new RGBELoader(manager).load(BASE + "hdri/homecoming_center_rooftop_2k.hdr", (t) => { t.mapping = THREE.EquirectangularReflectionMapping; scene.background = t; });
  scene.backgroundIntensity = 1;

  /* ---------- materials ---------- */
  const TL = new THREE.TextureLoader(manager);
  const texCache = {};
  const tex = (file, srgb, tile) => {
    const k = file + tile; if (texCache[k]) return texCache[k];
    const t = TL.load(BASE + "tex/" + file); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
    if (srgb) t.encoding = THREE.sRGBEncoding; t.repeat.set(1 / tile, 1 / tile);
    return (texCache[k] = t);
  };
  const pbr = (name, tile, o = {}) => new (o.fabric ? THREE.MeshPhysicalMaterial : THREE.MeshStandardMaterial)({
    ...(o.fabric ? { sheen: 1, sheenRoughness: 0.75, sheenColor: C(o.sheen || "#9AA6C4") } : {}),
    map: o.noDiff ? null : tex(name + "_diff.webp", true, tile), normalMap: tex(name + "_nor.webp", false, tile),
    roughnessMap: tex(name + "_arm.webp", false, tile), aoMap: o.ao === false ? null : tex(name + "_arm.webp", false, tile),
    normalScale: new THREE.Vector2(o.ns ?? 1, o.ns ?? 1), color: o.color ? C(o.color) : 0xffffff, roughness: o.rough ?? 1, metalness: 0, envMapIntensity: o.env ?? 0.9,
  });
  const M = {
    floor: pbr("oak_wood_planks", 2.2, { env: 1.0 }),
    wall: pbr("painted_plaster_wall", 2.5, { noDiff: true, color: "#E8E5DF", ns: 0.55, env: 0.6 }),
    ceil: pbr("white_plaster_02", 3, { noDiff: true, color: "#F7F6F3", ns: 0.3, env: 1.2 }),
    tiles: pbr("long_white_tiles", 0.9, { env: 1.1 }),
    sofa: pbr("denim_fabric_04", 0.22, { noDiff: true, color: "#28324D", ns: 1.6, env: 0.5, fabric: true, sheen: "#6E7FA8" }),
    sofaLight: pbr("denim_fabric_04", 0.22, { noDiff: true, color: "#C2BAAD", ns: 1.4, env: 0.5, fabric: true, sheen: "#F2ECE2" }),
    linen: pbr("fabric_pattern_05", 0.18, { noDiff: true, color: "#ECE8E1", ns: 1.2, env: 0.5, fabric: true, sheen: "#FFFFFF" }),
    rug: pbr("fabric_pattern_05", 0.12, { noDiff: true, color: "#B3A999", ns: 2.2, env: 0.3, fabric: true, sheen: "#E8DFD0" }),
    oak: pbr("kitchen_wood", 1.2, { env: 0.9 }),
    cab: new THREE.MeshStandardMaterial({ color: C("#1C2A44"), roughness: 0.55, envMapIntensity: 0.8 }),
    quartz: new THREE.MeshPhysicalMaterial({ color: C("#F2F1EE"), roughness: 0.18, clearcoat: 0.6, clearcoatRoughness: 0.15, envMapIntensity: 1.1 }),
    skirting: new THREE.MeshStandardMaterial({ color: C("#F4F2EE"), roughness: 0.5 }),
    frame: new THREE.MeshStandardMaterial({ color: C("#1E2125"), roughness: 0.35, metalness: 0.6 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.02, metalness: 0, transparent: true, opacity: 0.12, envMapIntensity: 1.4, depthWrite: false }),
    steel: new THREE.MeshStandardMaterial({ color: C("#C9CCD0"), roughness: 0.28, metalness: 1 }),
    black: new THREE.MeshStandardMaterial({ color: C("#0B0C0E"), roughness: 0.25, metalness: 0.2 }),
    blackGlass: new THREE.MeshPhysicalMaterial({ color: C("#07080A"), roughness: 0.06, clearcoat: 1, envMapIntensity: 1.3 }),
    white: new THREE.MeshStandardMaterial({ color: C("#F5F5F3"), roughness: 0.4 }),
    doorWood: pbr("kitchen_wood", 1.0, { color: "#E9E2D8", env: 0.8 }),
    navyDoor: new THREE.MeshStandardMaterial({ color: C("#0E1C36"), roughness: 0.45, metalness: 0.1 }),
  };
  [M.floor, M.wall, M.ceil, M.tiles].forEach((m) => (m.aoMapIntensity = 0.6));
  M.ceil.emissive = C("#FFF7EC"); M.ceil.emissiveIntensity = 0.12;

  const root = new THREE.Group(); scene.add(root);
  const solids = [];   // meshes that block the view / cast shadows
  const pickables = []; // device meshes
  const obstacles = []; // [x0,z0,x1,z1] footprints you can't walk through

  /* box with UVs in metres (so textures tile at real size) + uv2 for aoMap */
  function box(w, h, d, mat, x, y, z, opt = {}) {
    const g = opt.round ? new RoundedBoxGeometry(w, h, d, 3, opt.round) : new THREE.BoxGeometry(w, h, d);
    const uv = g.attributes.uv;
    if (!opt.round) {
      const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
      for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) { const k = f * 4 + i; uv.setXY(k, uv.getX(k) * dims[f][0], uv.getY(k) * dims[f][1]); }
    } else for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * Math.max(w, d), uv.getY(i) * h);
    g.setAttribute("uv2", uv);
    const m = new THREE.Mesh(g, mat); m.position.set(x, y, z);
    m.castShadow = opt.cast !== false; m.receiveShadow = true;
    (opt.parent || root).add(m);
    return m;
  }

  /* ---------- soft contact shadows (ambient occlusion stand-ins) ---------- */
  const gradTex = (radial) => {
    const c = document.createElement("canvas"); c.width = c.height = 128; const x = c.getContext("2d");
    const g = radial ? x.createRadialGradient(64, 64, 4, 64, 64, 64) : x.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, "rgba(0,0,0,1)"); g.addColorStop(radial ? 0.45 : 0.25, "rgba(0,0,0,.45)"); g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g; x.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); return t;
  };
  const aoLin = gradTex(false), aoRad = gradTex(true);
  const aoMat = (t, o) => new THREE.MeshBasicMaterial({ color: 0x000000, alphaMap: t, transparent: true, opacity: o, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  const aoFloorMat = aoMat(aoLin, 0.32), aoWallMat = aoMat(aoLin, 0.22), aoCeilMat = aoMat(aoLin, 0.18), aoBlobMat = aoMat(aoRad, 0.55);
  /* a strip that darkens towards one edge: (cx,cy,cz) centre, size, rotation, which way the dark edge faces */
  const aoStrip = (mat, w, h, x, y, z, rx, ry, flip) => {
    const g = new THREE.PlaneGeometry(w, h); if (flip) { const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setY(i, 1 - uv.getY(i)); }
    const m = new THREE.Mesh(g, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, 0, "YXZ"); m.renderOrder = 2; root.add(m); return m;
  };
  const wallAO = (alongX, c, w, at, t, b, top) => {
    const D = 0.32;
    [-1, 1].forEach((side) => {
      const off = at + side * (t / 2 + 0.002);
      if (alongX) {
        if (b < 0.01) { aoStrip(aoFloorMat, w, D, c, 0.003, off + side * D / 2, -Math.PI / 2, 0, side > 0); aoStrip(aoWallMat, w, 0.3, c, 0.15, off, 0, side > 0 ? 0 : Math.PI, true); }
        if (top > H - 0.01) aoStrip(aoCeilMat, w, D, c, H - 0.002, off + side * D / 2, Math.PI / 2, 0, side < 0);
      } else {
        if (b < 0.01) { aoStrip(aoFloorMat, w, D, off + side * D / 2, 0.003, c, -Math.PI / 2, Math.PI / 2, side < 0); aoStrip(aoWallMat, w, 0.3, off, 0.15, c, 0, side > 0 ? Math.PI / 2 : -Math.PI / 2, true); }
        if (top > H - 0.01) aoStrip(aoCeilMat, w, D, off + side * D / 2, H - 0.002, c, Math.PI / 2, Math.PI / 2, side > 0);
      }
    });
  };
  const blob = (x0, z0, x1, z1, pad = 0.18) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0 + pad * 2, z1 - z0 + pad * 2), aoBlobMat);
    m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, 0.004, (z0 + z1) / 2); m.renderOrder = 2; root.add(m);
  };

  /* ---------- architecture ---------- */
  const floor = box(12.2, 0.1, 9.2, M.floor, 6, -0.05, 4.5, { cast: false });
  floor.name = "floor";
  box(12.2, 0.08, 9.2, M.ceil, 6, H + 0.04, 4.5, { cast: false });
  const windows = [];
  WALLS.forEach(([x0, z0, x1, z1, t, ops]) => {
    const alongX = z0 === z1, len = alongX ? x1 - x0 : z1 - z0, a0 = alongX ? x0 : z0;
    const piece = (s, e, b, top) => {
      if (e - s < 0.01 || top - b < 0.01) return;
      const c = (s + e) / 2, w = e - s, hh = top - b, y = b + hh / 2;
      const m = alongX ? box(w, hh, t, M.wall, c, y, z0) : box(t, hh, w, M.wall, x0, y, c);
      solids.push(m);
      wallAO(alongX, c, w, alongX ? z0 : x0, t, b, top);
      if (b < 0.01) { // skirting on both faces
        if (alongX) { box(w, 0.09, 0.016, M.skirting, c, 0.045, z0 - t / 2 - 0.008, { cast: false }); box(w, 0.09, 0.016, M.skirting, c, 0.045, z0 + t / 2 + 0.008, { cast: false }); }
        else { box(0.016, 0.09, w, M.skirting, x0 - t / 2 - 0.008, 0.045, c, { cast: false }); box(0.016, 0.09, w, M.skirting, x0 + t / 2 + 0.008, 0.045, c, { cast: false }); }
      }
    };
    let cur = a0;
    [...ops].sort((p, q) => p[0] - q[0]).forEach(([c, w, b, top, kind]) => {
      const s = c - w / 2, e = c + w / 2;
      piece(cur, s, 0, H); piece(s, e, 0, b); piece(s, e, top, H); cur = e;
      if (kind === "win") windows.push({ alongX, at: alongX ? z0 : x0, c, w, b, top, t, outward: alongX ? (z0 === 0 ? -1 : 1) : (x0 === 0 ? -1 : 1) });
      if (kind === "door") windows.push({ door: true, alongX, at: alongX ? z0 : x0, c, w, b, top, t });
    });
    piece(cur, a0 + len, 0, H);
  });

  /* windows: slim black aluminium frames, glass, daylight pouring in */
  const winLights = [];
  windows.filter((w) => !w.door).forEach((w) => {
    const hh = w.top - w.b, y = w.b + hh / 2, fw = 0.05;
    const g = new THREE.Group(); root.add(g);
    const place = (m) => g.add(m);
    if (w.alongX) {
      [[w.c - w.w / 2 + fw / 2, y, fw, hh], [w.c + w.w / 2 - fw / 2, y, fw, hh]].forEach(([x, yy, ww, h2]) => place(box(ww, h2, w.t * 0.6, M.frame, x, yy, w.at)));
      place(box(w.w, fw, w.t * 0.6, M.frame, w.c, w.b + fw / 2, w.at)); place(box(w.w, fw, w.t * 0.6, M.frame, w.c, w.top - fw / 2, w.at));
      const n = Math.max(1, Math.round(w.w / 1.2)); for (let i = 1; i < n; i++) place(box(0.04, hh, w.t * 0.5, M.frame, w.c - w.w / 2 + (w.w * i) / n, y, w.at));
      const gl = new THREE.Mesh(new THREE.PlaneGeometry(w.w, hh), M.glass); gl.position.set(w.c, y, w.at); g.add(gl);
      if (w.b > 0.3) box(w.w + 0.1, 0.03, w.t + 0.12, M.white, w.c, w.b - 0.015, w.at, { cast: false }); // sill
      if (!mobile) { const L = new THREE.RectAreaLight(C("#EAF2FF"), 3.2, w.w, hh); L.position.set(w.c, y, w.at - w.outward * 0.15); L.lookAt(w.c, y, w.at - w.outward * 5); root.add(L); winLights.push(L); }
    } else {
      [[w.c - w.w / 2 + fw / 2], [w.c + w.w / 2 - fw / 2]].forEach(([z]) => place(box(w.t * 0.6, hh, fw, M.frame, w.at, y, z)));
      place(box(w.t * 0.6, fw, w.w, M.frame, w.at, w.b + fw / 2, w.c)); place(box(w.t * 0.6, fw, w.w, M.frame, w.at, w.top - fw / 2, w.c));
      const gl = new THREE.Mesh(new THREE.PlaneGeometry(w.w, hh), M.glass); gl.rotation.y = Math.PI / 2; gl.position.set(w.at, y, w.c); g.add(gl);
      box(w.t + 0.12, 0.03, w.w + 0.1, M.white, w.at, w.b - 0.015, w.c, { cast: false });
      if (!mobile) { const L = new THREE.RectAreaLight(C("#EAF2FF"), 3.2, w.w, hh); L.position.set(w.at - w.outward * 0.15, y, w.c); L.lookAt(w.at - w.outward * 5, y, w.c); root.add(L); winLights.push(L); }
    }
  });

  /* ---------- light ---------- */
  scene.add(new THREE.HemisphereLight(C("#F7F9FD"), C("#D8CFC2"), mobile ? 0.85 : 0.55));
  const sun = new THREE.DirectionalLight(C("#FFE9CF"), 3.2);
  sun.position.set(-6, 9, 22); sun.target.position.set(5, 0, 5); scene.add(sun, sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
  Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 50 }); sun.shadow.radius = 5;

  /* room lights (switchable) */
  const roomLights = {};
  const warm = C("#FFD9AE");
  const addLight = (room, x, z, intensity = 0.9, real = 1) => {
    const L = real ? new THREE.PointLight(warm, 0, 8, 2) : { intensity: 0, isFake: true }; if (real) { L.position.set(x, H - 0.35, z); root.add(L); }
    const disc = new THREE.Mesh(new THREE.CircleGeometry(0.07, 24), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: warm, emissiveIntensity: 0 }));
    disc.rotation.x = Math.PI / 2; disc.position.set(x, H - 0.001, z); root.add(disc);
    (roomLights[room] = roomLights[room] || { on: false, list: [] }).list.push({ L, disc, intensity });
  };
  [[2.4, 6.5, 1], [5.2, 6.5, 1], [1.6, 8.0, 0], [5.2, 8.2, 0]].forEach(([x, z, real]) => addLight("living", x, z, 1.1, real));
  [[1.2, 1.2, 0], [2.0, 2.4, 1], [1.2, 2.8, 0]].forEach(([x, z, real]) => addLight("kitchen", x, z, 1.2, real));
  [[5.5, 1.6, 1], [5.5, 3.0, 0]].forEach(([x, z, real]) => addLight("entrance", x, z, 0.8, real));
  [[9.5, 2.5, 0], [9.6, 5.2, 1]].forEach(([x, z, real]) => addLight("bedroom", x, z, 1.2, real));

  /* ---------- furniture ---------- */
  const gltf = new GLTFLoader(manager);
  const models = {};
  const load = (name) => models[name] || (models[name] = new Promise((res) => gltf.load(`${BASE}models/${name}/${name}.gltf`, (g) => res(g.scene), undefined, () => res(null))));
  const place = async (name, x, z, rotY = 0, opt = {}) => {
    const src = await load(name); if (!src) return null;
    const o = src.clone(true);
    o.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; if (m.material) m.material.envMapIntensity = 0.9; } });
    if (opt.scale) o.scale.setScalar(opt.scale);
    o.rotation.y = rotY; root.add(o);
    const b = new THREE.Box3().setFromObject(o);
    o.position.set(x - (b.min.x + b.max.x) / 2, (opt.y || 0) - b.min.y, z - (b.min.z + b.max.z) / 2);
    if (opt.block !== false) { const bb = new THREE.Box3().setFromObject(o); obstacles.push([bb.min.x, bb.min.z, bb.max.x, bb.max.z]); }
    return o;
  };
  const block = (x0, z0, x1, z1) => obstacles.push([x0, z0, x1, z1]);

  // living room: navy linen sofa facing the TV wall
  (function sofa(x, z) {
    const g = new THREE.Group(); root.add(g); const P = { parent: g };
    box(0.95, 0.42, 2.6, M.sofa, 0, 0.26, 0, { ...P, round: 0.05 });
    box(0.22, 0.78, 2.6, M.sofa, -0.37, 0.46, 0, { ...P, round: 0.07 });
    [-0.66, 0.66].forEach((zz) => box(0.78, 0.2, 1.26, M.sofa, 0.06, 0.55, zz, { ...P, round: 0.08 }));
    [-1.38, 1.38].forEach((zz) => box(0.95, 0.6, 0.18, M.sofa, 0, 0.37, zz, { ...P, round: 0.07 }));
    [[-0.2, -0.85], [-0.2, 0.2], [-0.2, 0.9]].forEach(([xx, zz], i) => { const c = box(0.16, 0.48, 0.5, i === 1 ? M.sofaLight : M.linen, xx, 0.86, zz, { ...P, round: 0.08 }); c.rotation.z = -0.25; });
    [[-0.4, -1.2], [0.4, -1.2], [-0.4, 1.2], [0.4, 1.2]].forEach(([xx, zz]) => box(0.04, 0.06, 0.04, M.black, xx, 0.03, zz, P));
    g.position.set(x, 0, z); block(x - 0.5, z - 1.5, x + 0.5, z + 1.5);
  })(2.55, 6.6);
  box(2.4, 0.012, 3.0, M.rug, 3.9, 0.006, 6.6, { cast: false });
  place("coffee_table_round_01", 3.9, 6.6, 0);
  place("modern_arm_chair_01", 4.6, 8.35, Math.PI * 0.85);
  place("mid_century_lounge_chair", 1.0, 8.2, Math.PI * 0.8);
  place("side_table_01", 1.0, 7.25, 0);
  place("potted_plant_02", 0.55, 4.6, 0);
  place("potted_plant_04", 6.55, 8.55, 0);
  const topOf = (o) => new THREE.Box3().setFromObject(o).max.y;
  place("modern_wooden_cabinet", 6.7, 6.6, -Math.PI / 2).then((c) => {
    if (!c) return; const top = topOf(c);
    place("ceramic_vase_01", 6.72, 7.45, 0, { y: top, block: false });
    echoG.position.y = top + 0.019;
  });
  place("modern_ceiling_lamp_01", 3.9, 6.6, 0, { y: H - 0.62, block: false });
  place("modern_ceiling_lamp_01", 2.0, 2.4, 0, { y: H - 0.62, block: false });

  // TV on the wall + soundbar
  const tv = new THREE.Group(); root.add(tv);
  box(0.035, 0.92, 1.62, M.black, 0, 0, 0, { parent: tv, round: 0.01 });
  const tvCv = document.createElement("canvas"); tvCv.width = 1024; tvCv.height = 576;
  const tvTex = new THREE.CanvasTexture(tvCv); tvTex.encoding = THREE.sRGBEncoding;
  const tvScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.58, 0.88), new THREE.MeshPhysicalMaterial({ color: C("#050608"), roughness: 0.12, clearcoat: 0.5, envMapIntensity: 0.5, emissive: 0xffffff, emissiveMap: tvTex, emissiveIntensity: 0 }));
  tvScreen.rotation.y = -Math.PI / 2; tvScreen.position.x = -0.02; tv.add(tvScreen);
  tv.position.set(6.92, 1.55, 6.6);

  // dining in the kitchen
  box(1.6, 0.04, 0.9, M.oak, 2.0, 0.75, 2.4, { round: 0.01 });
  [[-0.7, -0.35], [0.7, -0.35], [-0.7, 0.35], [0.7, 0.35]].forEach(([dx, dz]) => box(0.04, 0.73, 0.04, M.black, 2.0 + dx, 0.365, 2.4 + dz));
  block(1.1, 1.85, 2.9, 2.95);
  place("dining_chair_02", 1.55, 1.75, 0, { block: false }); place("dining_chair_02", 2.45, 1.75, 0, { block: false });
  place("dining_chair_02", 1.55, 3.05, Math.PI, { block: false }); place("dining_chair_02", 2.45, 3.05, Math.PI, { block: false });

  // kitchen: navy cabinets, quartz top, white tiles
  box(3.6, 0.86, 0.6, M.cab, 1.9, 0.43, 0.42); box(3.62, 0.04, 0.64, M.quartz, 1.9, 0.88, 0.42);
  box(0.6, 0.86, 2.4, M.cab, 0.42, 0.43, 1.9); box(0.64, 0.04, 2.42, M.quartz, 0.42, 0.88, 1.9);
  box(3.6, 0.62, 0.012, M.tiles, 1.9, 1.21, 0.11, { cast: false }); box(0.012, 0.62, 2.6, M.tiles, 0.11, 1.21, 2.0, { cast: false });
  box(0.36, 0.72, 2.4, M.cab, 0.29, 2.05, 1.9); // upper cabinets
  for (let i = 0; i < 6; i++) box(0.012, 0.012, 0.16, M.steel, 0.73, 0.78, 0.45 + i * 0.6, { cast: false });
  for (let i = 0; i < 6; i++) box(0.16, 0.012, 0.012, M.steel, 0.4 + i * 0.6, 0.78, 0.73, { cast: false });
  box(0.7, 0.02, 0.45, M.steel, 2.0, 0.905, 0.42, { cast: false }); // sink
  box(0.03, 0.32, 0.03, M.steel, 2.0, 1.06, 0.2); box(0.03, 0.03, 0.2, M.steel, 2.0, 1.21, 0.3);
  box(0.6, 0.012, 0.52, M.blackGlass, 0.42, 0.907, 2.6, { cast: false }); // cooktop
  box(0.7, 2.05, 0.68, M.steel, 3.55, 1.025, 0.45); // fridge
  block(0, 0, 4, 0.8); block(0, 0, 0.8, 3.2);

  // entrance: shelves, basket, bench
  place("wooden_display_shelves_01", 4.3, 1.0, Math.PI / 2);
  place("wicker_basket_01", 4.35, 3.55, 0);
  place("hanging_picture_frame_01", 6.9, 3.0, -Math.PI / 2, { y: 1.3, block: false });

  // front door (navy) + smart lock
  const door = new THREE.Group(); root.add(door);
  box(0.96, 2.16, 0.05, M.navyDoor, 0.48, 1.08, 0, { parent: door });
  box(0.02, 0.02, 0.16, M.steel, 0.86, 1.02, 0.05, { parent: door });
  door.position.set(5.0, 0, 0.06);
  const lockG = new THREE.Group(); door.add(lockG);
  box(0.075, 0.36, 0.03, M.black, 0, 0, 0, { parent: lockG, round: 0.012 });
  const lockScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.055, 0.08), new THREE.MeshStandardMaterial({ color: 0x000000, emissive: C("#3D6BFF"), emissiveIntensity: 0.6 }));
  lockScreen.position.set(0, 0.09, 0.016); lockG.add(lockScreen);
  lockG.position.set(0.86, 1.18, 0.045);

  // bedroom: bed, nightstands, wardrobe
  (function bed(x, z) {
    const g = new THREE.Group(); root.add(g); const P = { parent: g };
    box(2.1, 0.3, 1.9, M.sofaLight, 0, 0.2, 0, { ...P, round: 0.04 });
    box(1.95, 0.22, 1.8, M.white, 0.05, 0.45, 0, { ...P, round: 0.06 });
    box(1.5, 0.08, 1.88, M.linen, 0.28, 0.58, 0, { ...P, round: 0.04 });
    box(0.12, 1.15, 2.0, M.sofaLight, -1.02, 0.58, 0, { ...P, round: 0.05 });
    [-0.45, 0.45].forEach((zz) => { const p = box(0.36, 0.15, 0.62, M.linen, -0.72, 0.64, zz, { ...P, round: 0.07 }); p.rotation.z = -0.25; });
    g.position.set(x, 0, z); block(x - 1.1, z - 1.0, x + 1.05, z + 1.0);
  })(10.85, 6.2);
  place("side_table_01", 11.55, 4.85, 0); place("side_table_01", 11.55, 7.55, 0).then((st) => { if (st) place("ceramic_vase_03", 11.55, 7.55, 0, { y: topOf(st), block: false }); });
  place("Ottoman_01", 9.4, 6.2, Math.PI / 2);
  place("hanging_picture_frame_02", 11.9, 6.2, -Math.PI / 2, { y: 1.45, block: false });
  place("potted_plant_04", 7.45, 8.5, 0);
  box(2.6, 2.4, 0.6, M.oak, 9.3, 1.2, 0.42); block(8.0, 0.1, 10.6, 0.75);
  for (let i = 0; i < 4; i++) box(0.012, 0.5, 0.02, M.steel, 8.32 + i * 0.65, 1.2, 0.73, { cast: false });


  /* lamps & finishing touches */
  const shadeM = new THREE.MeshStandardMaterial({ color: C("#F1EADF"), roughness: 0.9, side: THREE.DoubleSide, emissive: warm, emissiveIntensity: 0.0, transparent: true, opacity: 0.96 });
  const lamps = [];
  const lamp = (x, z, y0, h, r) => {
    const g = new THREE.Group(); root.add(g);
    if (h > 0.6) { box(0.03, h, 0.03, M.black, 0, h / 2, 0, { parent: g }); box(0.3, 0.02, 0.3, M.black, 0, 0.01, 0, { parent: g, round: 0.008 }); }
    else { const base = new THREE.Mesh(new THREE.SphereGeometry(0.09, 32, 24), M.white); base.position.y = 0.09; base.castShadow = true; g.add(base); }
    const sh = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.8, r, r * 1.1, 40, 1, true), shadeM.clone()); sh.position.y = h + r * 0.4; sh.castShadow = true; g.add(sh);
    g.position.set(x, y0, z); lamps.push(sh); return g;
  };
  lamp(1.55, 8.65, 0, 1.45, 0.2); // living floor lamp beside the lounge chair
  box(2.6, 0.012, 2.0, M.rug, 9.6, 0.006, 6.2, { cast: false }); // bedroom rug
  Promise.all([load("side_table_01")]).then(() => setTimeout(() => { lamp(11.55, 4.85, 0.55, 0.12, 0.13); lamp(11.55, 7.55, 0.55, 0.12, 0.13); }, 0));
  const ac = new THREE.Group(); root.add(ac);
  box(0.95, 0.3, 0.22, M.white, 0, 0, 0, { parent: ac, round: 0.04 }); box(0.85, 0.02, 0.05, M.skirting, 0, -0.12, 0.09, { parent: ac, cast: false });
  ac.rotation.y = -Math.PI / 2; ac.position.set(11.88, 2.45, 6.2);
  place("potted_plant_02", 7.5, 0.55, 0);
  place("hanging_picture_frame_02", 3.9, 4.08, Math.PI, { y: 1.35, block: false });

  /* ---------- curtains (motorised) ---------- */
  const curtM = new THREE.MeshStandardMaterial({ color: C("#EEE9E1"), roughness: 1, side: THREE.DoubleSide, normalMap: tex("fabric_pattern_05_nor.webp", false, 0.3) });
  const curtains = {};
  const makeCurtain = (id, cx, z, width, top) => {
    const hh = top - 0.03, half = width / 2 + 0.25;
    const geo = new THREE.PlaneGeometry(half, hh, 60, 1), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 22) * 0.035);
    geo.computeVertexNormals();
    const L = new THREE.Mesh(geo, curtM), Rr = new THREE.Mesh(geo, curtM);
    [L, Rr].forEach((m) => { m.castShadow = true; m.position.y = hh / 2 + 0.02; m.position.z = z; root.add(m); });
    box(width + 0.6, 0.025, 0.025, M.frame, cx, top + 0.04, z, { cast: false });
    curtains[id] = { L, Rr, cx, half, open: 1, t: 1 };
  };
  makeCurtain("curtain_living", 3.5, 8.72, 3.6, 2.62);
  makeCurtain("curtain_bed", 9.6, 8.72, 2.2, 2.6);

  /* ---------- Techi devices (tappable) ---------- */
  const devMeshes = {};
  const tag = (obj, id) => { obj.traverse((m) => { if (m.isMesh) { m.userData.dev = id; pickables.push(m); } }); devMeshes[id] = obj; return obj; };
  const glassSwitch = (id, x, y, z, rotY, gang = 2) => {
    const g = new THREE.Group(); root.add(g);
    box(0.086, 0.086, 0.01, M.blackGlass, 0, 0, 0, { parent: g, round: 0.004, cast: false });
    const leds = [];
    for (let i = 0; i < gang; i++) {
      const r = new THREE.Mesh(new THREE.RingGeometry(0.008, 0.0105, 24), new THREE.MeshBasicMaterial({ color: C("#7FA8FF") }));
      r.position.set((i - (gang - 1) / 2) * 0.03, 0, 0.0056); g.add(r); leds.push(r);
    }
    g.position.set(x, y, z); g.rotation.y = rotY; g.userData.leds = leds; return tag(g, id);
  };
  glassSwitch("light_living", 4.55, 1.2, 4.075, 0, 2);
  glassSwitch("curtain_living", 4.7, 1.2, 4.075, 0, 3);
  glassSwitch("light_kitchen", 3.925, 1.2, 1.85, -Math.PI / 2, 1);
  glassSwitch("light_bedroom", 7.075, 1.2, 2.75, Math.PI / 2, 2);
  glassSwitch("curtain_bed", 7.075, 1.2, 2.9, Math.PI / 2, 3);
  tag(lockG, "lock");
  // control screen on the living wall
  const panelCv = document.createElement("canvas"); panelCv.width = 512; panelCv.height = 320;
  const panelTex = new THREE.CanvasTexture(panelCv); panelTex.encoding = THREE.sRGBEncoding;
  const panel = new THREE.Group(); root.add(panel);
  box(0.26, 0.17, 0.012, M.black, 0, 0, 0, { parent: panel, round: 0.006, cast: false });
  const pScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.15), new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: panelTex, emissiveIntensity: 1 }));
  pScreen.position.z = 0.0065; panel.add(pScreen); panel.position.set(6.55, 1.45, 4.07); tag(panel, "panel");
  // Echo Dot on the TV cabinet
  const echoG = new THREE.Group(); root.add(echoG);
  const echo = new THREE.Mesh(new THREE.SphereGeometry(0.05, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.62), pbr("denim_fabric_04", 0.05, { noDiff: true, color: "#2E3238", ns: 1 }));
  echo.castShadow = true; echoG.add(echo);
  const echoRing = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.004, 8, 48), new THREE.MeshBasicMaterial({ color: C("#1C2433") }));
  echoRing.rotation.x = Math.PI / 2; echoRing.position.y = -0.03; echoG.add(echoRing);
  echoG.position.set(6.72, 0.6, 5.95); tag(echoG, "echo");
  // smart socket under the TV
  const sock = new THREE.Group(); root.add(sock);
  box(0.012, 0.086, 0.086, M.blackGlass, 0, 0, 0, { parent: sock, round: 0.004, cast: false });
  sock.position.set(6.935, 0.32, 7.35); tag(sock, "socket");
  // sensors: motion (living corner), gas (kitchen ceiling), hub (entrance shelf), valve (under the sink)
  const motion = new THREE.Mesh(new THREE.SphereGeometry(0.03, 24, 16), M.white); motion.position.set(6.85, H - 0.12, 8.85); root.add(motion); tag(motion, "motion");
  const gas = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.03, 32), M.white); gas.position.set(0.9, H - 0.015, 1.0); root.add(gas); tag(gas, "gas");
  const hub = new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.025, 0.1, 3, 0.01), M.white); hub.position.set(4.3, 1.05, 1.0); root.add(hub); tag(hub, "hub");
  const valve = new THREE.Mesh(new RoundedBoxGeometry(0.09, 0.07, 0.06, 3, 0.01), M.black); valve.position.set(2.0, 0.2, 0.8); root.add(valve); tag(valve, "valve");

  /* ---------- device behaviour ---------- */
  const state = { lights: { living: false, kitchen: false, entrance: true, bedroom: false }, tv: false, socket: true, locked: true };
  const setRoomLight = (room, on) => { state.lights[room] = on; };
  const act = (id) => {
    const d = DEVICES.find((x) => x.id === id); if (!d) return "";
    if (id.startsWith("light_")) { const r = id.slice(6); setRoomLight(r, !state.lights[r]); }
    else if (id.startsWith("curtain_")) curtains[id].open = curtains[id].open > 0.5 ? 0 : 1;
    else if (id === "lock") { state.locked = !state.locked; }
    else if (id === "echo" || id === "panel") { state.tv = id === "echo" ? !state.tv : state.tv; if (id === "panel") { setRoomLight("living", true); curtains.curtain_living.open = 1; } if (id === "echo") { curtains.curtain_living.open = state.tv ? 0 : 1; setRoomLight("living", !state.tv); } }
    else if (id === "socket") state.socket = !state.socket;
    pulse(id);
    return d.act[lang];
  };
  const pulses = [];
  const pulse = (id) => { const o = devMeshes[id]; if (!o) return; const p = new THREE.Vector3(); o.getWorldPosition(p); pulses.push({ p, t: 0 }); };
  const ringGeo = new THREE.RingGeometry(0.06, 0.075, 48), ringMat = new THREE.MeshBasicMaterial({ color: C("#7FA8FF"), transparent: true, depthWrite: false, side: THREE.DoubleSide });

  /* ---------- hotspots (HTML dots over each device) ---------- */
  const hotLayer = document.createElement("div"); hotLayer.className = "walk-hots"; host.appendChild(hotLayer);
  const hots = DEVICES.map((d) => {
    const b = document.createElement("button"); b.className = "walk-hot"; b.type = "button"; b.dataset.id = d.id;
    b.setAttribute("aria-label", d.name[lang]); b.innerHTML = `<i></i><span>${d.name[lang]}</span>`;
    b.addEventListener("click", (e) => { e.stopPropagation(); select(d.id); });
    hotLayer.appendChild(b); return { d, b };
  });

  /* ---------- walking ---------- */
  let yaw = Math.PI, pitch = -0.05, tYaw = yaw, tPitch = pitch;
  const pos = new THREE.Vector3(5.5, EYE, 0.95);
  let W = 1, Hh = 1, running = true, visible = true, curRoom = null;
  const keys = {};
  const walkable = (x, z) => WALK.some(([a, b, c, d]) => x >= a && x <= c && z >= b && z <= d) && !obstacles.some(([a, b, c, d]) => x > a - 0.22 && x < c + 0.22 && z > b - 0.22 && z < d + 0.22);
  const tryMove = (dx, dz) => {
    if (walkable(pos.x + dx, pos.z + dz)) { pos.x += dx; pos.z += dz; return true; }
    if (walkable(pos.x + dx, pos.z)) { pos.x += dx; return true; }
    if (walkable(pos.x, pos.z + dz)) { pos.z += dz; return true; }
    return false;
  };
  /* a clicked floor point you can't stand on (by a wall, under a table) → the nearest standable point on the way there */
  const reach = (x, z) => { for (let t = 1; t > 0.02; t -= 0.02) { const xx = pos.x + (x - pos.x) * t, zz = pos.z + (z - pos.z) * t; if (walkable(xx, zz)) return [xx, zz]; } return null; };
  const roomAt = (x, z) => (ROOMS.find((r) => x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1) || {}).id;

  /* floor cursor for click-to-walk */
  const cursor = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.2, 48), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, depthWrite: false }));
  cursor.rotation.x = -Math.PI / 2; cursor.visible = false; scene.add(cursor);

  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let drag = null, moved = 0, glide = null;
  const cv = R.domElement;
  const setNdc = (e) => { const r = cv.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); };
  const pickAt = (e) => {
    setNdc(e); ray.setFromCamera(ndc, cam);
    const hits = ray.intersectObjects([...pickables, floor, ...solids], false);
    return hits[0] || null;
  };
  const onDown = (e) => { drag = { x: e.clientX, y: e.clientY, yaw: tYaw, pitch: tPitch }; moved = 0; cv.setPointerCapture && cv.setPointerCapture(e.pointerId); };
  const onMove = (e) => {
    if (drag) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y; moved = Math.max(moved, Math.abs(dx) + Math.abs(dy));
      const s = mobile ? 0.0055 : 0.0042;
      tYaw = drag.yaw + dx * s; tPitch = Math.max(-1.1, Math.min(1.0, drag.pitch + dy * s));
      cursor.visible = false; return;
    }
    if (mobile) return;
    const h = pickAt(e);
    const to = h && (h.object === floor || solids.includes(h.object)) && reach(h.point.x, h.point.z);
    if (to) { cursor.visible = true; cursor.position.set(to[0], 0.005, to[1]); cv.style.cursor = "pointer"; }
    else { cursor.visible = false; cv.style.cursor = h && h.object.userData.dev ? "pointer" : "grab"; }
  };
  const onUp = (e) => {
    const wasDrag = drag && moved > 6; drag = null; if (wasDrag) return;
    const h = pickAt(e); if (!h) return;
    if (h.object.userData.dev) { select(h.object.userData.dev); return; }
    const to = (h.object === floor || solids.includes(h.object)) && reach(h.point.x, h.point.z); // floor or a wall: walk towards it
    if (to) walkTo(to[0], to[1]);
  };
  cv.addEventListener("pointerdown", onDown); addEventListener("pointermove", onMove); addEventListener("pointerup", onUp);
  const kd = (e) => { if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return; keys[e.key.toLowerCase()] = true; if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(e.key.toLowerCase())) e.preventDefault(); glide = null; };
  const ku = (e) => { keys[e.key.toLowerCase()] = false; };
  addEventListener("keydown", kd); addEventListener("keyup", ku);

  function walkTo(x, z, look) {
    glide = { x, z, look };
    if (look !== undefined) { tYaw = look[0]; tPitch = look[1]; }
  }
  const lookAtPoint = (p) => { const dx = p.x - pos.x, dz = p.z - pos.z, dy = p.y - EYE; return [Math.atan2(-dx, -dz), Math.atan2(dy, Math.hypot(dx, dz))]; };
  function select(id) {
    const o = devMeshes[id]; if (!o) return;
    const p = new THREE.Vector3(); o.getWorldPosition(p);
    // stand ~1.6 m in front of the device, inside its room
    const d = DEVICES.find((x) => x.id === id), r = ROOMS.find((x) => x.id === d.room);
    let best = null;
    for (let a = 0; a < 24; a++) {
      const ang = (a / 24) * Math.PI * 2, x = p.x + Math.cos(ang) * 1.6, z = p.z + Math.sin(ang) * 1.6;
      if (x < r.x0 || x > r.x1 || z < r.z0 || z > r.z1 || !walkable(x, z)) continue;
      const dist = Math.hypot(x - pos.x, z - pos.z); if (!best || dist < best.d) best = { x, z, d: dist };
    }
    const save = pos.clone();
    if (best) { pos.set(best.x, EYE, best.z); }
    const look = lookAtPoint(p); pos.copy(save);
    walkTo(best ? best.x : pos.x, best ? best.z : pos.z, look);
    emit("device", id);
  }

  /* ---------- per-frame ---------- */
  const size = () => { const r = host.getBoundingClientRect(); W = Math.max(1, r.width); Hh = Math.max(1, r.height); R.setSize(W, Hh, false); cam.aspect = W / Hh; cam.updateProjectionMatrix(); };
  const ro = new ResizeObserver(size); ro.observe(host); size();
  const io = new IntersectionObserver((e) => (visible = e[0].isIntersecting)); io.observe(host);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let last = performance.now(), frame = 0;
  const v3 = new THREE.Vector3(), fwd = new THREE.Vector3(), right = new THREE.Vector3();
  const drawPanel = (t) => {
    const x = panelCv.getContext("2d"), g = x.createLinearGradient(0, 0, 512, 320);
    g.addColorStop(0, "#0B1A36"); g.addColorStop(1, "#1C3E8A"); x.fillStyle = g; x.fillRect(0, 0, 512, 320);
    x.fillStyle = "#fff"; x.font = "600 54px Arial"; const d = new Date(); x.fillText(String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"), 28, 80);
    x.font = "400 20px Arial"; x.fillStyle = "rgba(255,255,255,.7)"; x.fillText("Living room · 24°C", 30, 112);
    const tiles = [["Lights", state.lights.living], ["Curtains", curtains.curtain_living.open > 0.5], ["TV", state.tv], ["Lock", state.locked]];
    tiles.forEach(([n, on], i) => { const xx = 28 + i * 120; x.fillStyle = on ? "#fff" : "rgba(255,255,255,.12)"; x.beginPath(); x.roundRect ? x.roundRect(xx, 170, 104, 110, 16) : x.rect(xx, 170, 104, 110); x.fill(); x.fillStyle = on ? "#0B1A36" : "#fff"; x.font = "600 19px Arial"; x.fillText(n, xx + 14, 210); x.font = "400 15px Arial"; x.fillText(on ? "On" : "Off", xx + 14, 238); });
    panelTex.needsUpdate = true;
  };
  const drawTV = (t) => {
    const x = tvCv.getContext("2d"), g = x.createLinearGradient(0, 0, 1024, 576);
    g.addColorStop(0, "#081430"); g.addColorStop(1, "#24418C"); x.fillStyle = g; x.fillRect(0, 0, 1024, 576);
    for (let i = 0; i < 6; i++) { x.beginPath(); x.strokeStyle = `rgba(156,198,255,${0.12 + i * 0.07})`; x.lineWidth = 3; for (let k = 0; k <= 1024; k += 12) x.lineTo(k, 380 + Math.sin(k * 0.01 + t * (0.6 + i * 0.2) + i) * (30 + i * 10)); x.stroke(); }
    x.fillStyle = "#fff"; x.font = "600 64px Arial"; x.fillText("TECHI", 70, 130); x.font = "400 30px Arial"; x.fillStyle = "rgba(255,255,255,.75)"; x.fillText("Movie scene · lights dimmed · curtains closed", 72, 180);
    tvTex.needsUpdate = true;
  };
  drawPanel(0);
  const tick = () => {
    if (!running) return; requestAnimationFrame(tick); if (!visible || document.hidden) return;
    const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now; const t = now / 1000;
    // look
    const k = reduce ? 1 : 1 - Math.pow(0.0006, dt);
    yaw += (tYaw - yaw) * k; pitch += (tPitch - pitch) * k;
    // keyboard walk
    fwd.set(-Math.sin(yaw), 0, -Math.cos(yaw)); right.set(Math.cos(yaw), 0, -Math.sin(yaw));
    let mx = 0, mz = 0; const sp = (keys.shift ? 3.2 : 1.9) * dt;
    if (keys.w || keys.arrowup) { mx += fwd.x; mz += fwd.z; } if (keys.s || keys.arrowdown) { mx -= fwd.x; mz -= fwd.z; }
    if (keys.a) { mx -= right.x; mz -= right.z; } if (keys.d) { mx += right.x; mz += right.z; }
    if (keys.arrowleft) tYaw += 1.8 * dt; if (keys.arrowright) tYaw -= 1.8 * dt;
    if (mx || mz) { const l = Math.hypot(mx, mz); tryMove((mx / l) * sp, (mz / l) * sp); }
    // glide to a clicked point
    if (glide) {
      const dx = glide.x - pos.x, dz = glide.z - pos.z, d = Math.hypot(dx, dz);
      if (d < 0.02) glide = null;
      else { const step = Math.min(d, Math.max(0.6, d * 2.6) * dt); if (!tryMove((dx / d) * step, (dz / d) * step)) glide = null; }
    }
    const bob = glide || mx || mz ? Math.sin(t * 9) * 0.012 : 0;
    cam.position.set(pos.x, EYE + bob, pos.z);
    cam.rotation.set(pitch, yaw, 0, "YXZ");
    const rnow = roomAt(pos.x, pos.z); if (rnow && rnow !== curRoom) { curRoom = rnow; emit("room", rnow); }
    // lights
    Object.entries(roomLights).forEach(([room, L]) => { const on = state.lights[room] ? 1 : 0; L.list.forEach((x) => { x.L.intensity += (on * x.intensity - x.L.intensity) * 0.12; x.disc.material.emissiveIntensity = x.L.intensity * 3; }); });
    lamps.forEach((sh, i) => { const on = i === 0 ? state.lights.living : state.lights.bedroom; sh.material.emissiveIntensity += ((on ? 0.9 : 0) - sh.material.emissiveIntensity) * 0.1; });
    // curtains
    Object.values(curtains).forEach((c) => { c.t += (c.open - c.t) * Math.min(1, dt * 1.6); const sc = 0.22 + 0.78 * (1 - c.t); c.L.scale.x = c.Rr.scale.x = sc; c.L.position.x = c.cx - c.half - 0.05 + (c.half * sc) / 2; c.Rr.position.x = c.cx + c.half + 0.05 - (c.half * sc) / 2; });
    // daylight dims as curtains close
    const lc = curtains.curtain_living.t, bc = curtains.curtain_bed.t;
    sun.intensity = 3.2 * (0.35 + 0.65 * (lc + bc) / 2);
    winLights.forEach((L) => (L.intensity = 3.2 * (0.45 + 0.55 * Math.min(lc + 0.3, 1))));
    // tv, lock, leds
    tvScreen.material.emissiveIntensity += ((state.tv ? 2.2 : 0) - tvScreen.material.emissiveIntensity) * 0.1;
    if (state.tv && (frame & 1) === 0) drawTV(t);
    door.rotation.y += ((state.locked ? 0 : -1.1) - door.rotation.y) * 0.06;
    lockScreen.material.emissive.copy(state.locked ? C("#3D6BFF") : C("#36D399"));
    echoRing.material.color.copy(state.tv ? C("#48B6FF") : C("#1C2433"));
    ["light_living", "curtain_living", "light_kitchen", "light_bedroom", "curtain_bed"].forEach((id) => { const on = id.startsWith("light_") ? state.lights[id.slice(6)] : curtains[id].open > 0.5; devMeshes[id].userData.leds.forEach((r) => r.material.color.copy(on ? C("#9CC6FF") : C("#3A4660"))); });
    if ((frame % 60) === 0) drawPanel(t);
    // pulses
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i]; if (!p.m) { p.m = new THREE.Mesh(ringGeo, ringMat.clone()); scene.add(p.m); }
      p.t += dt; p.m.position.copy(p.p); p.m.lookAt(cam.position); p.m.scale.setScalar(1 + p.t * 6); p.m.material.opacity = Math.max(0, 1 - p.t * 1.4);
      if (p.t > 0.8) { scene.remove(p.m); pulses.splice(i, 1); }
    }
    // hotspots follow their devices
    hots.forEach(({ d, b }) => {
      devMeshes[d.id].getWorldPosition(v3); const dist = v3.distanceTo(cam.position); v3.project(cam);
      const vis = v3.z < 1 && Math.abs(v3.x) < 1.05 && Math.abs(v3.y) < 1.05 && dist < 7.5;
      b.style.opacity = vis ? 1 : 0; b.style.pointerEvents = vis ? "auto" : "none";
      if (vis) b.style.transform = `translate(${((v3.x + 1) / 2) * W}px,${((1 - v3.y) / 2) * Hh}px) scale(${Math.max(0.7, Math.min(1, 2.6 / dist))})`;
    });
    frame++;
    R.render(scene, cam);
  };
  manager.onLoad = () => { obstacles.forEach(([a, b, c, d]) => blob(a, b, c, d)); emit("ready"); };
  requestAnimationFrame(tick);

  return {
    rooms: ROOMS, devices: DEVICES,
    on(ev, f) { listeners[ev].add(f); return () => listeners[ev].delete(f); },
    goRoom(id) { const r = ROOMS.find((x) => x.id === id); if (!r) return; pos.set(r.view[0], EYE, r.view[1]); glide = null; tYaw = yaw = r.view[2]; tPitch = pitch = -0.08; },
    select, act,
    pose(x, z, y, p) { pos.set(x, EYE, z); glide = null; tYaw = yaw = y; tPitch = pitch = p || 0; },
    get room() { return curRoom; },
    state: () => ({ ...state, lights: { ...state.lights }, curtains: Object.fromEntries(Object.entries(curtains).map(([k, c]) => [k, c.open > 0.5])) }),
    setLang(l) { lang = l; hots.forEach(({ d, b }) => { b.querySelector("span").textContent = d.name[l]; b.setAttribute("aria-label", d.name[l]); }); },
    destroy() {
      running = false; ro.disconnect(); io.disconnect();
      removeEventListener("pointermove", onMove); removeEventListener("pointerup", onUp); removeEventListener("keydown", kd); removeEventListener("keyup", ku);
      R.dispose(); pmrem.dispose(); cv.remove(); hotLayer.remove();
    },
  };
}
