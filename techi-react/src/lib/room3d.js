/* Hero scene: a calm, architectural smart-home room in Techi navy & ice.
   Arches, a reflective water floor, a floating iridescent orb and a glowing Techi switch. */
import * as THREE from "three";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";

export function createRoom(host, opts = {}) {
  let R;
  try { R = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" }); } catch (e) { return null; }
  const lite = matchMedia("(max-width: 760px)").matches;
  R.setPixelRatio(Math.min(devicePixelRatio || 1, lite ? 1.25 : 1.5));
  R.outputEncoding = THREE.sRGBEncoding; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 0.9;
  R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
  R.domElement.className = "room-canvas"; host.appendChild(R.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#DCE3EF");
  scene.fog = new THREE.Fog("#D6DEEC", 12, 32);
  const cam = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  cam.position.set(1.2, 2.8, 15);

  scene.add(new THREE.HemisphereLight("#F2F6FF", "#7E8DAE", 0.6));
  const sun = new THREE.DirectionalLight("#FFF6EA", 2.4);
  sun.position.set(-7, 8, 5); sun.castShadow = true; sun.shadow.mapSize.set(lite ? 1024 : 2048, lite ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12 }); sun.shadow.radius = 6; scene.add(sun);

  const plaster = new THREE.MeshStandardMaterial({ color: "#BCC9E0", roughness: 0.95 });
  const plaster2 = new THREE.MeshStandardMaterial({ color: "#CAD5E8", roughness: 0.95 });

  function archWall(w, h, arches, depth, mat) {
    const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h); s.lineTo(-w / 2, h); s.lineTo(-w / 2, 0);
    arches.forEach(([x, aw, ah, y0 = 0]) => { const p = new THREE.Path(); const r = aw / 2; p.moveTo(x - r, y0); p.lineTo(x - r, ah - r); p.absarc(x, ah - r, r, Math.PI, 0, true); p.lineTo(x + r, y0); p.lineTo(x - r, y0); s.holes.push(p); });
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 40 }), mat); m.castShadow = m.receiveShadow = true; return m;
  }
  const back = archWall(16, 9, [[0.7, 1.5, 3.6, 0.8], [4.8, 1.6, 6.4, 2.4]], 0.5, plaster); back.position.set(0, -0.4, -4.5); scene.add(back);
  const left = archWall(14, 9, [[-2, 1.9, 4.6, -0.4], [1.4, 1.9, 4.6, -0.4]], 0.5, plaster2); left.rotation.y = Math.PI / 2; left.position.set(-5.2, -0.4, 1); scene.add(left);

  const skyTex = (() => { const c = document.createElement("canvas"); c.width = 4; c.height = 256; const x = c.getContext("2d"); const g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, "#6F8FD6"); g.addColorStop(0.55, "#B9C9EC"); g.addColorStop(1, "#EEF2FA"); x.fillStyle = g; x.fillRect(0, 0, 4, 256); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t; })();
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), new THREE.MeshBasicMaterial({ map: skyTex, fog: false })); sky.position.set(0, 6, -14); scene.add(sky);
  const sky2 = sky.clone(); sky2.rotation.y = Math.PI / 2; sky2.position.set(-16, 6, 0); scene.add(sky2);
  const hill = new THREE.Mesh(new THREE.SphereGeometry(8, 48, 24), new THREE.MeshStandardMaterial({ color: "#7E92C4", roughness: 1 })); hill.scale.set(1.6, 0.35, 1); hill.position.set(-14, -1.6, -2); scene.add(hill);

  for (let i = 0; i < 6; i++) { const st = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.32, 1.6), plaster2); st.position.set(0.2, -0.25 + i * 0.32, -1.2 - i * 0.42); st.castShadow = st.receiveShadow = true; scene.add(st); }
  const ledge = new THREE.Mesh(new THREE.BoxGeometry(6, 0.5, 2.2), plaster); ledge.position.set(4.2, 1.2, -3.2); ledge.castShadow = ledge.receiveShadow = true; scene.add(ledge);

  function rock(r, x, y, z) {
    const g = new THREE.IcosahedronGeometry(r, lite ? 5 : 7); const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const v = new THREE.Vector3().fromBufferAttribute(p, i); v.multiplyScalar(1 + (Math.sin(v.x * 3.1) + Math.cos(v.y * 2.7) + Math.sin(v.z * 3.7)) * 0.06); p.setXYZ(i, v.x, v.y * 0.62, v.z); }
    g.computeVertexNormals(); const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: "#C9CCD6", roughness: 0.9 })); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; scene.add(m); return m;
  }
  rock(1.15, 3.4, -0.25, 0.6); rock(0.9, 5.6, -0.35, 2.6);

  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.95, 96, 64), new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.06, metalness: 0.15, iridescence: 1, iridescenceIOR: 1.6, iridescenceThicknessRange: [200, 900], clearcoat: 1 }));
  orb.position.set(3.2, 2.4, -3); orb.castShadow = true; scene.add(orb);

  /* the Techi switch on the wall */
  const sw = new THREE.Group();
  sw.add(new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.06), new THREE.MeshStandardMaterial({ color: new THREE.Color("#011738").convertSRGBToLinear(), roughness: 0.35, metalness: 0.2 })));
  const ledMat = new THREE.MeshBasicMaterial({ color: "#9CC6FF" });
  for (let i = 0; i < 3; i++) { const d = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.013, 10, 32), ledMat); d.position.set((i - 1) * 0.22, 0, 0.035); sw.add(d); }
  sw.position.set(-1.6, 1.8, -3.97); scene.add(sw);
  const glow = new THREE.PointLight("#9CC6FF", 0.25, 3); glow.position.set(-1.6, 1.8, -3.5); scene.add(glow);

  const refl = new Reflector(new THREE.PlaneGeometry(60, 60), { textureWidth: lite ? 512 : 768, textureHeight: lite ? 512 : 768, color: 0x9aa6c4 });
  refl.rotation.x = -Math.PI / 2; refl.position.y = -0.42; scene.add(refl);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(60, 60, 48, 48), new THREE.MeshPhysicalMaterial({ color: "#8FA0C8", roughness: 0.15, transparent: true, opacity: 0.4, clearcoat: 1 }));
  water.rotation.x = -Math.PI / 2; water.position.y = -0.4; water.receiveShadow = true; scene.add(water);
  const wp = water.geometry.attributes.position, wbase = wp.array.slice();

  const mg = new THREE.BufferGeometry(); const mp = new Float32Array(160 * 3);
  for (let i = 0; i < 160; i++) { mp[i * 3] = (Math.random() - 0.5) * 14; mp[i * 3 + 1] = Math.random() * 6; mp[i * 3 + 2] = (Math.random() - 0.5) * 10; }
  mg.setAttribute("position", new THREE.BufferAttribute(mp, 3));
  const motes = new THREE.Points(mg, new THREE.PointsMaterial({ color: "#fff", size: 0.03, transparent: true, opacity: 0.7 })); scene.add(motes);

  let W = 1, H = 1, mx = 0, my = 0, scroll = 0, visible = true, running = true, frameN = 0;
  const size = () => { const r = host.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height); R.setSize(W, H, false); cam.aspect = W / H; cam.fov = W / H < 0.8 ? 58 : 42; cam.updateProjectionMatrix(); };
  const ro = new ResizeObserver(size); ro.observe(host); size();
  const io = new IntersectionObserver((e) => (visible = e[0].isIntersecting)); io.observe(host);
  const mv = (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; };
  addEventListener("pointermove", mv, { passive: true });
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const t0 = performance.now();
  (function frame() {
    if (!running) return; requestAnimationFrame(frame); if (!visible || document.hidden) return;
    const t = (performance.now() - t0) / 1000, e = reduce ? 1 : 1 - Math.pow(1 - Math.min(1, t / 4), 3);
    const tx = 1.2 + mx * 1.2, ty = 1.45 - my * 0.5 + (1 - e) * 1.4 - scroll * 0.6;
    cam.position.x += (tx - cam.position.x) * 0.04; cam.position.y += (ty - cam.position.y) * 0.05;
    cam.position.z = (W / H < 0.8 ? 13 : 11) + (1 - e) * 4 - scroll * 2.5; cam.lookAt(0.8, 1.9 - scroll * 0.4, -3);
    orb.position.y = 2.45 + Math.sin(t * 0.9) * 0.08; orb.rotation.y = t * 0.15;
    if (!reduce) { for (let i = 0; i < wp.count; i++) { const x = wbase[i * 3], y = wbase[i * 3 + 1]; wp.setZ(i, Math.sin(x * 0.9 + t * 1.2) * 0.025 + Math.cos(y * 1.3 + t * 0.9) * 0.025); } wp.needsUpdate = true; if ((frameN++ & 3) === 0) water.geometry.computeVertexNormals(); }
    motes.rotation.y = t * 0.02; ledMat.color.setHSL(0.6, 0.8, 0.75 + Math.sin(t * 2) * 0.08);
    R.render(scene, cam);
  })();
  return {
    set scroll(v) { scroll = v; },
    destroy() { running = false; ro.disconnect(); io.disconnect(); removeEventListener("pointermove", mv); R.dispose(); R.domElement.remove(); },
  };
}
