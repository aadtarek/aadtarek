/**
 * The Vitrine in WebGL: a marble wall with a niche carved for every bottle. Each niche has its
 * own downlight (a lamp that glows, a soft cone of light with dust drifting in it, a pool of light
 * on the stone), a marble plinth and the bottle. The view is seen through a pane of wet glass
 * whose drops bend the light, with bloom, a vignette and a little film grain on top.
 *
 * The page (src/pages/Vitrine.tsx) drives it: scrolling moves the camera along the wall, the
 * mouse or the phone's tilt leans it, a click or tap flies into a niche.
 */
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export interface ShowcaseItem {
  image: string
  name: string
  price: string
}

export interface EngineEvents {
  onProgress?: (share: number) => void
  onReady?: () => void
  onHover?: (index: number | null) => void
  onPick?: (index: number) => void
  onScroll?: (share: number) => void
}

const MAX = 120 // niches the shaders hold

// Sizes in scene units (one niche is about one unit wide).
const CELL_W = 1
const CELL_H = 1.5
const IN_W = 0.82
const IN_H = 1.3
const DEPTH = 0.78
const PLINTH_W = 0.46
const PLINTH_H = 0.3
const PLINTH_D = 0.4
const BOTTLE_H = 0.5

/* ------------------------------------------------------------------ shaders */

const NOISE = /* glsl */ `
float hash(vec3 p) { p = fract(p * 0.3183099 + .1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x) {
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}`

/** Marble lit by its niche's lamp: a spotlight pointing down, with relief taken from the stone. */
const stoneVertex = /* glsl */ `
attribute float aNiche;
varying vec3 vPos;
varying vec3 vNormal;
varying float vNiche;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vPos = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  vNiche = aNiche;
  gl_Position = projectionMatrix * viewMatrix * world;
}`

const stoneFragment = /* glsl */ `
uniform sampler2D uMap;
uniform vec4 uLamps[${MAX}];
uniform float uTint;
uniform float uGloss;
uniform vec3 uWarm;
varying vec3 vPos;
varying vec3 vNormal;
varying float vNiche;

vec3 stone(vec2 uv) { return texture2D(uMap, uv).rgb; }

void main() {
  vec3 n = normalize(vNormal);
  vec3 an = abs(n);
  // Planar mapping on the face's own plane (the texture is never stretched).
  vec2 uv = an.y > 0.5 ? vPos.xz : an.x > 0.5 ? vPos.zy : vPos.xy;
  uv = uv * 0.42 + vec2(vNiche * 0.137, vNiche * 0.291);
  vec3 albedo = stone(uv);
  albedo = pow(albedo, vec3(2.2)) * uTint; // the texture is sRGB
  // Relief: the stone's brightness as a bump (veins sit a little proud and polished).
  float h0 = dot(albedo, vec3(0.333));
  float hx = dot(pow(stone(uv + vec2(0.002, 0.0)), vec3(2.2)), vec3(0.333));
  float hy = dot(pow(stone(uv + vec2(0.0, 0.002)), vec3(2.2)), vec3(0.333));
  vec3 t = an.y > 0.5 ? vec3(1, 0, 0) : an.x > 0.5 ? vec3(0, 0, 1) : vec3(1, 0, 0);
  vec3 b = normalize(cross(n, t));
  t = cross(b, n);
  n = normalize(n - (t * (hx - h0) + b * (hy - h0)) * 9.0);

  int k = int(vNiche + 0.5);
  vec4 lamp = uLamps[k];
  vec3 L = lamp.xyz - vPos;
  float d = length(L);
  vec3 l = L / d;
  float cosA = dot(-l, vec3(0.0, -1.0, 0.0));
  float spot = smoothstep(0.5, 0.9, cosA);
  float att = lamp.w / (1.0 + 1.1 * d * d);
  float diff = max(dot(n, l), 0.0);
  vec3 v = normalize(cameraPosition - vPos);
  vec3 hlf = normalize(l + v);
  float gloss = uGloss * (0.4 + 0.6 * smoothstep(0.35, 0.8, h0 * 3.0));
  float spec = pow(max(dot(n, hlf), 0.0), 60.0) * gloss;
  // A little light everywhere in the niche (bounced off the stone), more close to the lamp.
  float fill = lamp.w * 0.05 / (1.0 + 1.5 * d * d);
  vec3 col = albedo * (0.012 + fill + diff * spot * att * 2.6 * uWarm) + spec * spot * att * uWarm * 1.1;
  gl_FragColor = vec4(col, 1.0);
}`

/** The wall the niches are cut into: dark, polished, faintly catching the glow of the nearest lamps. */
const wallFragment = /* glsl */ `
uniform sampler2D uMap;
uniform vec4 uLamps[${MAX}];
uniform int uCount;
uniform vec3 uWarm;
varying vec3 vPos;
varying vec3 vNormal;
void main() {
  vec2 uv = vPos.xy * 0.42;
  vec3 albedo = pow(texture2D(uMap, uv).rgb, vec3(2.2)) * 0.55;
  vec3 glow = vec3(0.0);
  for (int i = 0; i < ${MAX}; i++) {
    if (i >= uCount) break;
    vec4 lamp = uLamps[i];
    vec2 dd = vPos.xy - lamp.xy;
    float r = length(dd * vec2(1.0, 0.8));
    glow += uWarm * lamp.w * 0.05 / (1.0 + 18.0 * r * r);
  }
  vec3 v = normalize(cameraPosition - vPos);
  float sheen = pow(1.0 - max(dot(v, vec3(0.0, 0.0, 1.0)), 0.0), 3.0) * 0.04;
  gl_FragColor = vec4(albedo * (0.02 + glow) + sheen * albedo, 1.0);
}`

const plainVertex = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`

/** The bottle: lit from above, darker in the dark, with a streak of light crossing the glass. */
const bottleFragment = /* glsl */ `
uniform sampler2D uMap;
uniform float uLight;
uniform float uSheen;
uniform float uTime;
varying vec2 vUv;
void main() {
  vec4 tex = texture2D(uMap, vUv);
  if (tex.a < 0.02) discard;
  vec3 c = pow(tex.rgb, vec3(2.2));
  float top = mix(0.75, 1.15, vUv.y); // the lamp is above
  vec3 col = c * (0.03 + uLight * top * 0.82);
  // The streak: a soft diagonal band sweeping across every few seconds.
  float s = fract(uTime * 0.19);
  float pos = mix(-0.4, 1.5, s);
  float band = smoothstep(0.13, 0.0, abs((vUv.x + vUv.y * 0.35) - pos)) * step(s, 0.55);
  col += vec3(1.0, 0.92, 0.82) * band * 0.45 * uSheen * min(uLight, 1.0);
  gl_FragColor = vec4(col, tex.a);
}`

/** A cone of light: brightest at its axis and near the lamp, softly moving like air. */
const beamVertex = /* glsl */ `
varying vec3 vPos;
varying vec3 vNormal;
varying float vY;
void main() {
  vY = uv.y;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vPos = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}`
const beamFragment = /* glsl */ `
${NOISE}
uniform float uLight;
uniform float uTime;
uniform vec3 uWarm;
varying vec3 vPos;
varying vec3 vNormal;
varying float vY;
void main() {
  vec3 v = normalize(cameraPosition - vPos);
  float edge = pow(abs(dot(normalize(vNormal), v)), 2.2);
  float fall = pow(vY, 1.6);
  float air = 0.65 + 0.35 * noise(vec3(vPos.x * 7.0, vPos.y * 5.0 - uTime * 0.35, vPos.z * 7.0 + uTime * 0.1));
  float a = edge * fall * air * uLight * 0.16;
  gl_FragColor = vec4(uWarm * a, 1.0);
}`

/** Dust drifting in the beams (each mote knows its niche, and fades with its lamp). */
const dustVertex = /* glsl */ `
attribute float aNiche;
attribute vec3 aSeed;
uniform vec4 uLamps[${MAX}];
uniform float uTime;
uniform float uPixel;
varying float vAlpha;
void main() {
  vec4 lamp = uLamps[int(aNiche + 0.5)];
  float t = uTime * (0.05 + aSeed.z * 0.05) + aSeed.x * 10.0;
  float y = fract(aSeed.y - t * 0.6);
  float r = (0.02 + 0.2 * (1.0 - y)) * aSeed.z;
  vec3 p = lamp.xyz + vec3(cos(t * 6.28 + aSeed.x * 20.0) * r, -0.08 - y * (${IN_H.toFixed(2)} - ${PLINTH_H.toFixed(2)} - 0.12), sin(t * 6.28 + aSeed.y * 20.0) * r * 0.8);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = max(1.0, uPixel * (0.005 + aSeed.z * 0.009) / -mv.z);
  vAlpha = lamp.w * smoothstep(0.0, 0.15, y) * smoothstep(1.0, 0.7, y) * (0.35 + 0.65 * aSeed.z);
}`
const dustFragment = /* glsl */ `
uniform vec3 uWarm;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d) * vAlpha;
  gl_FragColor = vec4(uWarm * a * 1.6, 1.0);
}`

/** The pane of glass in front: drops bend the image behind them, plus vignette, grain and a touch of colour fringing. */
const GlassShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    tDrops: { value: null as THREE.Texture | null },
    uTime: { value: 0 },
    uAspect: { value: 1 },
    uFocus: { value: 0 },
  },
  vertexShader: plainVertex,
  fragmentShader: /* glsl */ `
uniform sampler2D tDiffuse;
uniform sampler2D tDrops;
uniform float uTime;
uniform float uFocus;
varying vec2 vUv;
float rand(vec2 c) { return fract(sin(dot(c, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  vec4 drop = texture2D(tDrops, vUv);
  vec2 nrm = (drop.rg - 0.5) * 2.0;
  float thick = drop.b * drop.a;
  // Through a drop the world is seen small and upside down, so the offset is large and inverted.
  vec2 uv = vUv - nrm * 0.055 * thick;
  vec2 ca = (vUv - 0.5) * 0.0025 * (1.0 + thick * 4.0);
  vec3 col;
  col.r = texture2D(tDiffuse, uv + ca).r;
  col.g = texture2D(tDiffuse, uv).g;
  col.b = texture2D(tDiffuse, uv - ca).b;
  // Drops catch light on their upper-left rim and darken at the lower edge.
  float rim = clamp(dot(nrm, normalize(vec2(-0.6, 0.8))), -1.0, 1.0);
  col *= 1.0 + thick * (0.25 + rim * 0.35);
  col += vec3(1.0, 0.95, 0.9) * pow(max(rim, 0.0), 6.0) * thick * 0.35;
  // Vignette and grain.
  vec2 q = vUv - 0.5;
  float vig = smoothstep(0.95, 0.25, length(q * vec2(1.0, 1.15)));
  col *= mix(0.35, 1.0, vig);
  col += (rand(vUv * 731.0 + fract(uTime)) - 0.5) * 0.018;
  gl_FragColor = vec4(col, 1.0);
}`,
}

/* ------------------------------------------------------------------ drops on the glass */

/**
 * The drops are drawn into a small canvas as a normal map (red/green = which way the surface
 * faces, blue = thickness), which the glass pass reads to bend the image.
 */
class DropMap {
  canvas = document.createElement('canvas')
  texture: THREE.CanvasTexture
  private ctx: CanvasRenderingContext2D
  private sprite: HTMLCanvasElement
  private beads: { x: number; y: number; r: number }[] = []
  private runners: { x: number; y: number; r: number; v: number; sway: number; trail: { x: number; y: number }[] }[] = []
  private next = 800
  private w = 1
  private h = 1

  private density: number

  constructor(density: number) {
    this.density = density
    this.ctx = this.canvas.getContext('2d')!
    this.texture = new THREE.CanvasTexture(this.canvas)
    this.texture.minFilter = THREE.LinearFilter
    this.texture.generateMipmaps = false
    // One drop: a hemisphere's normals, encoded as colour.
    const S = 64
    this.sprite = document.createElement('canvas')
    this.sprite.width = S
    this.sprite.height = S
    const s = this.sprite.getContext('2d')!
    const img = s.createImageData(S, S)
    for (let y = 0; y < S; y++)
      for (let x = 0; x < S; x++) {
        const nx = (x + 0.5) / (S / 2) - 1
        const ny = (y + 0.5) / (S / 2) - 1
        const d = Math.hypot(nx, ny)
        const o = (y * S + x) * 4
        if (d >= 1) {
          img.data[o + 3] = 0
          continue
        }
        const nz = Math.sqrt(1 - d * d)
        img.data[o] = (nx * 0.5 + 0.5) * 255
        img.data[o + 1] = (-ny * 0.5 + 0.5) * 255
        img.data[o + 2] = Math.pow(nz, 0.6) * 255
        img.data[o + 3] = Math.min(1, (1 - d) * 6) * 255
      }
    s.putImageData(img, 0, 0)
  }

  resize(w: number, h: number) {
    this.w = Math.max(1, Math.round(w))
    this.h = Math.max(1, Math.round(h))
    this.canvas.width = this.w
    this.canvas.height = this.h
    const n = Math.round(((this.w * this.h) / 900) * this.density)
    this.beads = Array.from({ length: n }, () => this.bead())
  }

  private bead() {
    const big = Math.random() < 0.1
    return { x: Math.random() * this.w, y: Math.random() * this.h, r: (big ? 2.6 + Math.random() * 3 : 0.7 + Math.random() * 1.6) * (this.w / 600) }
  }

  update(dt: number, still: boolean) {
    const { ctx, w, h } = this
    if (!still) {
      this.next -= dt
      if (this.next <= 0) {
        const r = (2.4 + Math.random() * 2.6) * (w / 600)
        this.runners.push({ x: Math.random() * w, y: Math.random() * h * 0.4, r, v: 0, sway: (Math.random() - 0.5) * 0.5, trail: [] })
        this.next = (1300 + Math.random() * 2600) / this.density
      }
      if (this.beads.length < ((w * h) / 900) * this.density && Math.random() < 0.6) this.beads.push(this.bead())
      for (const r of this.runners) {
        r.v = Math.min(w / 140, r.v + 0.012 * (w / 600) + r.r * 0.002)
        r.y += r.v * (dt / 16)
        r.x += Math.sin(r.y / (w / 40)) * r.sway
        r.trail.push({ x: r.x, y: r.y })
        if (r.trail.length > 40) r.trail.shift()
        this.beads = this.beads.filter((b) => !(Math.abs(b.x - r.x) < r.r + b.r && Math.abs(b.y - r.y) < r.r + b.r))
        if (Math.random() < 0.06) this.beads.push({ x: r.x + (Math.random() - 0.5) * r.r, y: r.y - r.r * 2.5, r: r.r * (0.25 + Math.random() * 0.25) })
      }
      this.runners = this.runners.filter((r) => r.y < h + 20)
    }
    ctx.fillStyle = 'rgb(128,128,0)'
    ctx.fillRect(0, 0, w, h)
    for (const b of this.beads) ctx.drawImage(this.sprite, b.x - b.r, b.y - b.r, b.r * 2, b.r * 2)
    for (const r of this.runners) {
      for (let i = 0; i < r.trail.length; i += 3) {
        const p = r.trail[i]
        const s = r.r * 0.35 * (i / r.trail.length)
        ctx.drawImage(this.sprite, p.x - s, p.y - s, s * 2, s * 2)
      }
      ctx.drawImage(this.sprite, r.x - r.r, r.y - r.r * 1.2, r.r * 2, r.r * 2.4)
    }
    this.texture.needsUpdate = true
  }
}

/* ------------------------------------------------------------------ the engine */

function labelTexture(name: string, price: string) {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 160
  const g = c.getContext('2d')!
  g.textAlign = 'center'
  g.fillStyle = '#f6e9d4'
  g.font = '600 34px Roboto, Arial, sans-serif'
  g.letterSpacing = '6px'
  g.fillText(name.toUpperCase(), 256, 64)
  g.font = '400 38px Roboto, Arial, sans-serif'
  g.fillStyle = '#e49b2d' // Rfaheya gold
  g.fillText(price, 256, 122)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

export class VitrineEngine {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera
  private composer: EffectComposer
  private bloom: UnrealBloomPass
  private glass: ShaderPass
  private drops: DropMap
  private clock = new THREE.Timer()
  private raf = 0
  private disposed = false
  private still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  private cols: number
  private rows: number
  private lamps: THREE.Vector4[] = []
  private lampUniform: { value: THREE.Vector4[] }
  private levels: number[] = [] // light in each niche (eased)
  private intro: number[] = [] // when each lamp comes on (seconds)
  private bottles: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>[] = []
  private beams: THREE.ShaderMaterial[] = []
  private lampDiscs: THREE.MeshBasicMaterial[] = []
  private labels: THREE.MeshBasicMaterial[] = []
  private hits: THREE.Mesh[] = []
  private ray = new THREE.Raycaster()
  private pointer = new THREE.Vector2(9, 9)

  private hover: number | null = null
  private focus: number | null = null
  private scrollY = 0 // camera height along the wall (scene units, 0 = top row)
  private scrollTarget = 0
  private tilt = new THREE.Vector2()
  private tiltTarget = new THREE.Vector2()
  private camPos = new THREE.Vector3()
  private camLook = new THREE.Vector3()
  private viewShift = new THREE.Vector2() // eased view offset (moves the subject off-centre)
  private width = 1
  private height = 1
  private startedAt = -1 // set once everything has loaded
  private slowFrames = 0

  private canvas: HTMLCanvasElement
  private items: ShowcaseItem[]
  private phone: boolean
  private events: EngineEvents

  constructor(canvas: HTMLCanvasElement, items: ShowcaseItem[], phone: boolean, marbleUrl: string, events: EngineEvents = {}) {
    this.canvas = canvas
    this.phone = phone
    this.events = events
    this.items = items.slice(0, MAX)
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', alpha: false })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, phone ? 1.6 : 1.75))
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.05
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.scene.background = new THREE.Color(0x020101)

    this.cols = phone ? 2 : window.innerWidth >= 1280 ? 5 : 4
    this.rows = Math.ceil(this.items.length / this.cols)
    this.camera = new THREE.PerspectiveCamera(phone ? 34 : 30, 1, 0.05, 60)

    const n = this.items.length
    for (let i = 0; i < MAX; i++) this.lamps.push(new THREE.Vector4(0, 0, 0, 0))
    this.lampUniform = { value: this.lamps }
    this.levels = Array(n).fill(0)
    // Lamps come on from the top row down, left to right, a beat apart.
    this.intro = this.items.map((_, i) => 0.6 + (Math.floor(i / this.cols) * this.cols + (i % this.cols)) * 0.16 + Math.random() * 0.08)

    // Loading: the marble and every bottle; the page shows the progress.
    const manager = new THREE.LoadingManager()
    manager.onProgress = (_u, loaded, total) => events.onProgress?.(loaded / total)
    manager.onLoad = () => {
      this.startedAt = this.now()
      events.onReady?.()
    }
    const loader = new THREE.TextureLoader(manager)
    const marble = loader.load(marbleUrl)
    marble.wrapS = marble.wrapT = THREE.MirroredRepeatWrapping // no seams where the tiles meet
    marble.anisotropy = this.renderer.capabilities.getMaxAnisotropy()

    // Rfaheya's gold, as warm light.
    const warm = new THREE.Color(1.0, 0.74, 0.44)
    this.build(marble, loader, warm)

    // Post: bloom on the lamps and highlights, then the glass.
    this.composer = new EffectComposer(this.renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType }))
    this.composer.addPass(new RenderPass(this.scene, this.camera))
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.7, 0.5, 0.92)
    this.composer.addPass(this.bloom)
    this.drops = new DropMap(phone ? 0.8 : 1)
    this.glass = new ShaderPass(GlassShader)
    this.glass.uniforms.tDrops.value = this.drops.texture
    this.composer.addPass(this.glass)
    this.composer.addPass(new OutputPass())

    this.resize()
    this.placeCamera(true)
    // Recording a demo frame by frame (tests only): the page asks for each frame.
    const w = window as unknown as { __vxManual?: boolean; __vxTick?: (ms: number) => void }
    if (w.__vxManual) w.__vxTick = (ms) => this.frame(ms / 1000)
    else this.loop()
  }
  private virtual = 0

  /* -------------------------------------------------------------- building the wall */

  private nicheCenter(i: number) {
    const c = i % this.cols
    const r = Math.floor(i / this.cols)
    return new THREE.Vector3((c - (this.cols - 1) / 2) * CELL_W, -r * CELL_H, 0)
  }

  private build(marble: THREE.Texture, loader: THREE.TextureLoader, warm: THREE.Color) {
    const n = this.items.length
    const stoneUniforms = (tint: number, gloss: number) => ({
      uMap: { value: marble },
      uLamps: this.lampUniform,
      uTint: { value: tint },
      uGloss: { value: gloss },
      uWarm: { value: new THREE.Vector3(warm.r, warm.g, warm.b) },
    })

    // The wall: one surface with an opening for every niche.
    const w = this.cols * CELL_W + 6
    const top = CELL_H / 2 + 3
    const bottom = -(this.rows - 1) * CELL_H - CELL_H / 2 - 3
    const shape = new THREE.Shape()
    shape.moveTo(-w / 2, bottom)
    shape.lineTo(w / 2, bottom)
    shape.lineTo(w / 2, top)
    shape.lineTo(-w / 2, top)
    shape.closePath()
    for (let i = 0; i < n; i++) {
      const p = this.nicheCenter(i)
      const hole = new THREE.Path()
      hole.moveTo(p.x - IN_W / 2, p.y - IN_H / 2)
      hole.lineTo(p.x - IN_W / 2, p.y + IN_H / 2)
      hole.lineTo(p.x + IN_W / 2, p.y + IN_H / 2)
      hole.lineTo(p.x + IN_W / 2, p.y - IN_H / 2)
      hole.closePath()
      shape.holes.push(hole)
    }
    const wall = new THREE.Mesh(
      new THREE.ShapeGeometry(shape),
      new THREE.ShaderMaterial({
        uniforms: { uMap: { value: marble }, uLamps: this.lampUniform, uCount: { value: n }, uWarm: { value: new THREE.Vector3(warm.r, warm.g, warm.b) } },
        vertexShader: stoneVertex.replace('attribute float aNiche;', '').replace('vNiche = aNiche;', 'vNiche = 0.0;'),
        fragmentShader: wallFragment,
      }),
    )
    this.scene.add(wall)

    // The niches (inside faces of a box) and the plinths, merged into two meshes.
    const insides: THREE.BufferGeometry[] = []
    const plinths: THREE.BufferGeometry[] = []
    const tag = (g: THREE.BufferGeometry, i: number) => {
      g.setAttribute('aNiche', new THREE.Float32BufferAttribute(new Array(g.attributes.position.count).fill(i), 1))
      return g
    }
    for (let i = 0; i < n; i++) {
      const p = this.nicheCenter(i)
      // A box seen from inside (its front face is turned away from the camera, so the niche is open).
      const box = new THREE.BoxGeometry(IN_W, IN_H, DEPTH)
      box.scale(-1, 1, 1) // turn the faces inward…
      const nrm = box.attributes.normal as THREE.BufferAttribute
      for (let k = 0; k < nrm.count; k++) nrm.setXYZ(k, -nrm.getX(k), -nrm.getY(k), -nrm.getZ(k)) // …and their normals too
      box.translate(p.x, p.y, -DEPTH / 2)
      insides.push(tag(box.toNonIndexed(), i))
      const pl = new THREE.BoxGeometry(PLINTH_W, PLINTH_H, PLINTH_D)
      pl.translate(p.x, p.y - IN_H / 2 + PLINTH_H / 2, -DEPTH * 0.52)
      plinths.push(tag(pl.toNonIndexed(), i))
    }
    const inside = new THREE.Mesh(
      mergeGeometries(insides),
      new THREE.ShaderMaterial({ uniforms: stoneUniforms(1.0, 0.55), vertexShader: stoneVertex, fragmentShader: stoneFragment, side: THREE.FrontSide }),
    )
    this.scene.add(inside)
    const plinth = new THREE.Mesh(
      mergeGeometries(plinths),
      new THREE.ShaderMaterial({ uniforms: stoneUniforms(0.8, 0.9), vertexShader: stoneVertex, fragmentShader: stoneFragment }),
    )
    this.scene.add(plinth)

    // Per niche: lamp, beam, bottle, contact shadow, label, and a hit area for the pointer.
    const discGeo = new THREE.CircleGeometry(0.075, 40)
    const ringGeo = new THREE.RingGeometry(0.075, 0.1, 40)
    const beamGeo = new THREE.CylinderGeometry(0.06, 0.36, IN_H - PLINTH_H - 0.04, 48, 1, true)
    beamGeo.translate(0, -(IN_H - PLINTH_H - 0.04) / 2, 0)
    const hitGeo = new THREE.PlaneGeometry(CELL_W, CELL_H)
    const shadowTex = (() => {
      const c = document.createElement('canvas')
      c.width = c.height = 128
      const g = c.getContext('2d')!
      const grad = g.createRadialGradient(64, 64, 4, 64, 64, 64)
      grad.addColorStop(0, 'rgba(0,0,0,0.85)')
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      g.fillStyle = grad
      g.fillRect(0, 0, 128, 128)
      return new THREE.CanvasTexture(c)
    })()
    const dustSeeds: number[] = []
    const dustNiche: number[] = []
    const dustPos: number[] = []
    const perNiche = this.phone ? 26 : 36

    for (let i = 0; i < n; i++) {
      const p = this.nicheCenter(i)
      const lampPos = new THREE.Vector3(p.x, p.y + IN_H / 2 - 0.005, -DEPTH * 0.52)
      this.lamps[i].set(lampPos.x, lampPos.y, lampPos.z, 0)

      const discMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0, 0, 0) })
      const disc = new THREE.Mesh(discGeo, discMat)
      disc.rotation.x = Math.PI / 2
      disc.position.copy(lampPos).add(new THREE.Vector3(0, -0.002, 0))
      this.scene.add(disc)
      this.lampDiscs.push(discMat)
      const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x0b0807 }))
      ring.rotation.x = Math.PI / 2
      ring.position.copy(disc.position).add(new THREE.Vector3(0, -0.001, 0))
      this.scene.add(ring)

      const beamMat = new THREE.ShaderMaterial({
        uniforms: { uLight: { value: 0 }, uTime: { value: 0 }, uWarm: { value: new THREE.Vector3(warm.r, warm.g, warm.b) } },
        vertexShader: beamVertex,
        fragmentShader: beamFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      })
      const beam = new THREE.Mesh(beamGeo, beamMat)
      beam.position.copy(lampPos)
      beam.renderOrder = 3
      this.scene.add(beam)
      this.beams.push(beamMat)

      const plinthTop = p.y - IN_H / 2 + PLINTH_H
      const shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(0.3, 0.16),
        new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }),
      )
      shadow.rotation.x = -Math.PI / 2
      shadow.position.set(p.x, plinthTop + 0.002, -DEPTH * 0.52)
      this.scene.add(shadow)

      const bottleMat = new THREE.ShaderMaterial({
        uniforms: { uMap: { value: null }, uLight: { value: 0 }, uSheen: { value: 0 }, uTime: { value: 0 } },
        vertexShader: plainVertex,
        fragmentShader: bottleFragment,
        transparent: true,
        depthWrite: false,
      })
      const bottle = new THREE.Mesh(new THREE.PlaneGeometry(BOTTLE_H * 0.6, BOTTLE_H), bottleMat)
      bottle.position.set(p.x, plinthTop + BOTTLE_H / 2, -DEPTH * 0.52)
      bottle.renderOrder = 2
      this.scene.add(bottle)
      this.bottles.push(bottle)
      loader.load(this.items[i].image, (t) => {
        t.colorSpace = THREE.NoColorSpace // decoded by hand in the shader
        t.anisotropy = 4
        bottleMat.uniforms.uMap.value = t
        const img = t.image as { width: number; height: number }
        const aspect = img.width / img.height
        bottle.geometry.dispose()
        bottle.geometry = new THREE.PlaneGeometry(BOTTLE_H * aspect, BOTTLE_H)
      })

      const labelMat = new THREE.MeshBasicMaterial({ map: labelTexture(this.items[i].name, this.items[i].price), transparent: true, depthWrite: false, color: 0x000000 })
      const label = new THREE.Mesh(new THREE.PlaneGeometry(PLINTH_W * 0.86, PLINTH_W * 0.86 * (160 / 512)), labelMat)
      label.position.set(p.x, p.y - IN_H / 2 + PLINTH_H * 0.5, -DEPTH * 0.52 + PLINTH_D / 2 + 0.002)
      this.scene.add(label)
      this.labels.push(labelMat)

      const hit = new THREE.Mesh(hitGeo, new THREE.MeshBasicMaterial({ visible: false }))
      hit.position.set(p.x, p.y, 0.01)
      hit.userData.index = i
      this.scene.add(hit)
      this.hits.push(hit)

      for (let k = 0; k < perNiche; k++) {
        dustNiche.push(i)
        dustSeeds.push(Math.random(), Math.random(), Math.random())
        dustPos.push(0, 0, 0)
      }
    }

    const dustGeo = new THREE.BufferGeometry()
    dustGeo.setAttribute('position', new THREE.Float32BufferAttribute(dustPos, 3))
    dustGeo.setAttribute('aNiche', new THREE.Float32BufferAttribute(dustNiche, 1))
    dustGeo.setAttribute('aSeed', new THREE.Float32BufferAttribute(dustSeeds, 3))
    this.dustMat = new THREE.ShaderMaterial({
      uniforms: { uLamps: this.lampUniform, uTime: { value: 0 }, uPixel: { value: 300 }, uWarm: { value: new THREE.Vector3(warm.r, warm.g, warm.b) } },
      vertexShader: dustVertex,
      fragmentShader: dustFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const dust = new THREE.Points(dustGeo, this.dustMat)
    dust.frustumCulled = false
    dust.renderOrder = 4
    this.scene.add(dust)
  }
  private dustMat!: THREE.ShaderMaterial

  /* -------------------------------------------------------------- input */

  /** Pointer position in the canvas, in -1..1 (null when it leaves). */
  pointerAt(x: number | null, y = 0) {
    if (x === null) this.pointer.set(9, 9)
    else this.pointer.set(x, y)
    if (!this.phone && x !== null) this.tiltTarget.set(x, y)
  }
  /** The phone's tilt, roughly -1..1. */
  setTilt(x: number, y: number) {
    this.tiltTarget.set(Math.max(-1, Math.min(1, x)), Math.max(-1, Math.min(1, y)))
  }
  /** Moves along the wall (scene units). */
  scrollBy(dy: number) {
    if (this.focus !== null) return
    this.scrollTarget = Math.max(0, Math.min(this.maxScroll(), this.scrollTarget + dy))
  }
  /** Which niche is under a point (-1..1), or null. */
  pick(x: number, y: number) {
    this.ray.setFromCamera(new THREE.Vector2(x, y), this.camera)
    const hit = this.ray.intersectObjects(this.hits)[0]
    return hit ? (hit.object.userData.index as number) : null
  }
  setFocus(i: number | null) {
    this.focus = i
    if (i !== null) {
      this.scrollTarget = Math.max(0, Math.min(this.maxScroll(), Math.floor(i / this.cols) * CELL_H - this.visibleRows() * 0.5 * CELL_H + CELL_H / 2))
      this.flicker(i)
    }
  }
  /** A quick flicker when a lamp is chosen. */
  private flicker(i: number) {
    this.intro[i] = this.now() - this.startedAt + 0.02
  }

  private visibleRows() {
    const dist = this.overviewDistance()
    const vh = 2 * dist * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2))
    return vh / CELL_H
  }
  private maxScroll() {
    return Math.max(0, (this.rows - 1) * CELL_H - (this.visibleRows() - 1) * CELL_H * 0.5 + 0.1)
  }
  private overviewDistance() {
    const aspect = this.width / this.height
    const vfov = THREE.MathUtils.degToRad(this.camera.fov)
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect)
    const wallW = this.cols * CELL_W + (this.phone ? 0.08 : 0.3)
    const byWidth = wallW / 2 / Math.tan(hfov / 2)
    const byHeight = (CELL_H * (this.phone ? 1.0 : 1.1)) / 2 / Math.tan(vfov / 2)
    return Math.max(byWidth, this.phone ? 0 : byHeight)
  }

  resize() {
    const r = this.canvas.parentElement?.getBoundingClientRect()
    this.width = Math.max(1, r?.width ?? window.innerWidth)
    this.height = Math.max(1, r?.height ?? window.innerHeight)
    this.renderer.setSize(this.width, this.height, false)
    this.composer.setSize(this.width, this.height)
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()
    const pr = this.renderer.getPixelRatio()
    this.bloom.resolution.set((this.width * pr) / 2, (this.height * pr) / 2)
    this.drops.resize(this.width * (this.phone ? 0.5 : 0.42), this.height * (this.phone ? 0.5 : 0.42))
    this.dustMat.uniforms.uPixel.value = this.height * pr * 0.9
    this.scrollTarget = Math.min(this.scrollTarget, this.maxScroll())
  }

  /* -------------------------------------------------------------- the loop */

  private placeCamera(jump = false) {
    const k = jump ? 1 : 0.06
    let pos: THREE.Vector3
    let look: THREE.Vector3
    let shift = new THREE.Vector2()
    if (this.focus !== null) {
      const p = this.nicheCenter(this.focus)
      const vfov = THREE.MathUtils.degToRad(this.camera.fov)
      const dist = (IN_H * (this.phone ? 0.95 : 0.56)) / 2 / Math.tan(vfov / 2)
      const target = new THREE.Vector3(p.x, p.y - IN_H / 2 + PLINTH_H + BOTTLE_H * 0.55, -DEPTH * 0.52)
      look = target.clone()
      pos = target.clone().add(new THREE.Vector3(this.tilt.x * 0.12, -this.tilt.y * 0.08 + 0.04, dist + 0.25))
      shift = this.phone ? new THREE.Vector2(0, -0.2) : new THREE.Vector2(0.17, 0)
    } else {
      const dist = this.overviewDistance()
      const y = -this.scrollY + (this.phone ? -CELL_H * 0.35 : 0)
      const introPull = this.startedAt < 0 ? 1 : Math.max(0, 1 - (this.now() - this.startedAt) / 2.6)
      look = new THREE.Vector3(0, y, -DEPTH * 0.3)
      pos = new THREE.Vector3(this.tilt.x * (this.phone ? 0.18 : 0.32), y - this.tilt.y * 0.16, dist - introPull * introPull * dist * 0.45)
    }
    if (jump) {
      this.camPos.copy(pos)
      this.camLook.copy(look)
      this.viewShift.copy(shift)
    } else {
      this.camPos.lerp(pos, k)
      this.camLook.lerp(look, k)
      this.viewShift.lerp(shift, k)
    }
    this.camera.position.copy(this.camPos)
    this.camera.lookAt(this.camLook)
    // Off-centre framing (the card sits beside or below the bottle).
    const fw = this.width
    const fh = this.height
    if (Math.abs(this.viewShift.x) + Math.abs(this.viewShift.y) > 0.0005) this.camera.setViewOffset(fw, fh, this.viewShift.x * fw, -this.viewShift.y * fh, fw, fh)
    else this.camera.clearViewOffset()
  }

  private loop = () => {
    if (this.disposed) return
    this.raf = requestAnimationFrame(this.loop)
    this.clock.update()
    this.frame(Math.min(0.05, this.clock.getDelta()))
  }

  private now() {
    return (window as unknown as { __vxManual?: boolean }).__vxManual ? this.virtual : this.clock.getElapsed()
  }

  private frame(dt: number) {
    this.virtual += dt
    const t = this.now()
    const since = this.startedAt >= 0 ? t - this.startedAt : -1

    // Ease the scroll and the lean.
    this.scrollY += (this.scrollTarget - this.scrollY) * Math.min(1, dt * 7)
    this.tilt.lerp(this.tiltTarget, Math.min(1, dt * (this.phone ? 3 : 4)))
    if (this.phone && !this.still && this.tiltTarget.lengthSq() === 0) this.tilt.set(Math.sin(t * 0.45) * 0.45, Math.sin(t * 0.31) * 0.2)
    this.placeCamera()

    // Hover (computers): the niche under the pointer.
    if (!this.phone && this.focus === null && this.pointer.x < 2) {
      const h = this.pick(this.pointer.x, this.pointer.y)
      if (h !== this.hover) {
        this.hover = h
        this.events.onHover?.(h)
        if (h !== null) this.flicker(h)
      }
    } else if (this.hover !== null && (this.pointer.x > 2 || this.focus !== null)) {
      this.hover = null
      this.events.onHover?.(null)
    }

    // Light in each niche: on in turn at the start (with a flicker), brightest where you look.
    const n = this.items.length
    for (let i = 0; i < n; i++) {
      let target = 1
      if (this.focus !== null) target = i === this.focus ? 1.35 : 0.1
      else if (this.hover !== null) target = i === this.hover ? 1.3 : 0.32
      let on = 0
      if (since >= 0) {
        const s = since - this.intro[i]
        on = s < 0 ? 0 : s < 0.5 ? (Math.sin(s * 90) > 0.2 ? 1 : 0.12) * Math.min(1, s * 4 + 0.3) : 1
      }
      this.levels[i] += (target * on - this.levels[i]) * Math.min(1, dt * (on < 1 ? 30 : 5))
      const level = this.levels[i]
      this.lamps[i].w = level
      this.beams[i].uniforms.uLight.value = level
      this.beams[i].uniforms.uTime.value = t
      const b = this.bottles[i].material
      b.uniforms.uLight.value = Math.min(1.2, level)
      b.uniforms.uTime.value = t + i * 1.7
      b.uniforms.uSheen.value = this.focus === i || this.hover === i ? 1 : 0.35
      this.lampDiscs[i].color.setRGB(9 * level, 7 * level, 5 * level)
      this.labels[i].color.setScalar(0.12 + Math.min(1, level) * 0.88)
    }
    this.dustMat.uniforms.uTime.value = t
    this.glass.uniforms.uTime.value = t
    this.drops.update(dt * 1000, this.still)

    this.composer.render(dt)
    this.events.onScroll?.(this.maxScroll() > 0 ? this.scrollY / this.maxScroll() : 0)

    // A slow device: draw fewer pixels.
    if (since > 1 && since < 8) {
      if (dt > 1 / 32) this.slowFrames++
      if (this.slowFrames > 40 && this.renderer.getPixelRatio() > 1) {
        this.slowFrames = 0
        this.renderer.setPixelRatio(1)
        this.resize()
      }
    }
  }

  dispose() {
    this.disposed = true
    cancelAnimationFrame(this.raf)
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh
      m.geometry?.dispose()
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : []
      for (const mat of mats) {
        for (const v of Object.values((mat as THREE.ShaderMaterial).uniforms ?? {})) if (v.value instanceof THREE.Texture) v.value.dispose()
        ;(mat as THREE.MeshBasicMaterial).map?.dispose()
        mat.dispose()
      }
    })
    this.drops.texture.dispose()
    this.composer.dispose()
    this.renderer.dispose()
  }
}

export function webglAvailable() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}
