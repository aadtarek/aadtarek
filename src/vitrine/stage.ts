/**
 * The characters' stage, in the same WebGL scene as the wall: the characters stand on round
 * marble podiums along a turning ring, each under its own spotlight (a glowing lamp, a cone of
 * light with dust in it, a pool of light on the floor). The floor is a dark polished mirror that
 * really reflects them. The one at the front of the ring is lit, the others wait in the dark.
 */
import * as THREE from 'three'
import { Reflector } from 'three/examples/jsm/objects/Reflector.js'

export interface StageCharacter {
  /** The person's full-length photo, background cut out; none = a gold silhouette */
  image?: string
  name: string
}

const NOISE = /* glsl */ `
float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x) {
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}`

/** A person: lit from above by its spotlight, with a warm rim where the light catches the outline. */
const personVertex = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`
const personFragment = /* glsl */ `
uniform sampler2D uMap;
uniform float uLight;
uniform float uFade;
uniform float uTime;
uniform vec3 uWarm;
uniform vec2 uTexel;
varying vec2 vUv;
void main() {
  vec4 tex = texture2D(uMap, vUv);
  if (tex.a < 0.01) discard;
  vec3 c = pow(tex.rgb, vec3(2.2));
  float l = uLight;
  // The spotlight is above: brighter on the head and shoulders, falling off to the feet.
  float top = mix(0.32, 1.12, smoothstep(0.0, 0.92, vUv.y));
  vec3 col = c * (0.035 + l * top * 1.05) * mix(vec3(1.0), uWarm * 1.15, 0.28);
  // Out of the light the colours fade towards grey.
  float g = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(g), col, 0.35 + 0.65 * min(l, 1.0));
  // Rim light: where the outline is, against the dark (alpha changes nearby).
  float aL = texture2D(uMap, vUv - vec2(uTexel.x * 4.0, 0.0)).a;
  float aR = texture2D(uMap, vUv + vec2(uTexel.x * 4.0, 0.0)).a;
  float aU = texture2D(uMap, vUv + vec2(0.0, uTexel.y * 4.0)).a;
  float rim = clamp((tex.a - min(min(aL, aR), aU)) * 1.6, 0.0, 1.0);
  col += uWarm * rim * (0.08 + l * 0.9) * smoothstep(0.1, 0.9, vUv.y);
  // A soft shimmer moving up the figure while it is in the light.
  float sweep = smoothstep(0.08, 0.0, abs(vUv.y - fract(uTime * 0.12) * 1.6 + 0.3));
  col += uWarm * sweep * 0.08 * l;
  gl_FragColor = vec4(col, tex.a * uFade);
}`

/** A tall cone of light from the spotlight to the floor. */
const coneVertex = /* glsl */ `
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
const coneFragment = /* glsl */ `
${NOISE}
uniform float uLight;
uniform float uTime;
uniform vec3 uWarm;
varying vec3 vPos;
varying vec3 vNormal;
varying float vY;
void main() {
  vec3 v = normalize(cameraPosition - vPos);
  float edge = pow(abs(dot(normalize(vNormal), v)), 2.4);
  float fall = pow(vY, 1.3);
  float air = 0.6 + 0.4 * noise(vec3(vPos.x * 3.0, vPos.y * 2.0 - uTime * 0.3, vPos.z * 3.0 + uTime * 0.08));
  float a = edge * fall * air * uLight * 0.12;
  gl_FragColor = vec4(uWarm * a, 1.0);
}`

/** The podium: dark marble, lit on top by its spotlight. */
const podiumVertex = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPos;
void main() {
  vUv = uv;
  vNormal = normalize(mat3(modelMatrix) * normal);
  vec4 w = modelMatrix * vec4(position, 1.0);
  vPos = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`
const podiumFragment = /* glsl */ `
uniform sampler2D uMap;
uniform float uLight;
uniform vec3 uWarm;
uniform vec3 uCenter;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPos;
void main() {
  vec3 m = pow(texture2D(uMap, vPos.xz * 0.9 + vec2(vPos.y * 0.6, 0.0)).rgb, vec3(2.2));
  vec3 n = normalize(vNormal);
  float up = max(n.y, 0.0);
  float d = length(vPos.xz - uCenter.xz);
  float pool = smoothstep(0.55, 0.0, d);
  vec3 v = normalize(cameraPosition - vPos);
  vec3 h = normalize(vec3(0.0, 1.0, 0.0) + v);
  float spec = pow(max(dot(n, h), 0.0), 60.0) * 0.6;
  float side = (1.0 - up) * 0.18;
  vec3 col = m * 0.55 * uWarm * uLight * (up * (0.25 + pool * 1.1) + side) + uWarm * spec * uLight * up + m * 0.012;
  gl_FragColor = vec4(col, 1.0);
}`

/** The floor: a dark mirror, with pools of light under the lamps and a marble grain. */
const floorVertex = /* glsl */ `
uniform mat4 textureMatrix;
varying vec4 vMirror;
varying vec3 vPos;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vPos = w.xyz;
  vMirror = textureMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * viewMatrix * w;
}`
const floorFragment = /* glsl */ `
${NOISE}
uniform sampler2D tDiffuse;
uniform sampler2D uMap;
uniform vec4 uSpots[16];
uniform int uCount;
uniform vec3 uWarm;
uniform vec3 uOrigin;
uniform float uLight;
varying vec4 vMirror;
varying vec3 vPos;
void main() {
  vec2 p = vPos.xz - uOrigin.xz;
  vec3 m = pow(texture2D(uMap, p * 0.22).rgb, vec3(2.2));
  float pools = 0.0;
  for (int i = 0; i < 16; i++) {
    if (i >= uCount) break;
    vec4 s = uSpots[i];
    float d = length(vPos.xz - s.xz);
    pools += s.w * (smoothstep(1.3, 0.0, d) * 0.55 + smoothstep(0.62, 0.15, d) * 0.9);
  }
  // A soft wash in the middle of the stage.
  float wash = smoothstep(7.0, 0.0, length(p - vec2(0.0, -1.5))) * 0.05;
  // The reflection, rippled a little by the stone, fading with distance.
  vec4 uv = vMirror;
  uv.xy += (noise(vec3(p * 9.0, 0.0)) - 0.5) * 0.004 * uv.w;
  vec3 refl = texture2DProj(tDiffuse, uv).rgb;
  float far = smoothstep(11.0, 2.0, length(p));
  vec3 col = m * 0.6 * uWarm * (pools + wash) * uLight + refl * 0.34 * far;
  gl_FragColor = vec4(col, 1.0);
}`

/** Dust in the air over the stage, bright where the spotlights are. */
const motesVertex = /* glsl */ `
attribute vec3 aSeed;
uniform float uTime;
uniform float uPixel;
uniform vec3 uOrigin;
uniform vec4 uSpots[16];
uniform int uCount;
varying float vAlpha;
void main() {
  float t = uTime * (0.015 + aSeed.z * 0.02);
  vec3 p = uOrigin + vec3((aSeed.x - 0.5) * 9.0 + sin(t * 6.0 + aSeed.y * 30.0) * 0.25, fract(aSeed.y + t) * 3.6, (aSeed.z - 0.5) * 6.0 - 1.2);
  float lit = 0.0;
  for (int i = 0; i < 16; i++) {
    if (i >= uCount) break;
    float d = length(p.xz - uSpots[i].xz);
    lit += uSpots[i].w * smoothstep(0.9, 0.0, d);
  }
  vec4 mv = viewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = max(1.0, uPixel * (0.006 + aSeed.z * 0.012) / -mv.z);
  float y = fract(aSeed.y + t);
  vAlpha = (0.05 + lit * 0.95) * smoothstep(0.0, 0.1, y) * smoothstep(1.0, 0.8, y) * (0.3 + 0.7 * aSeed.x);
}`
const motesFragment = /* glsl */ `
uniform vec3 uWarm;
uniform float uLight;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  gl_FragColor = vec4(uWarm * smoothstep(0.5, 0.0, d) * vAlpha * uLight * 1.4, 1.0);
}`

/** A gold silhouette (until the dashboard has the character's photo). */
function silhouette() {
  const c = document.createElement('canvas')
  c.width = 240
  c.height = 600
  const g = c.getContext('2d')!
  g.scale(2, 2)
  const grad = g.createLinearGradient(0, 0, 0, 300)
  grad.addColorStop(0, '#b98c4c')
  grad.addColorStop(0.55, '#7a5220')
  grad.addColorStop(1, '#2e1c08')
  g.fillStyle = grad
  g.fill(
    new Path2D(
      'M60 8c11 0 19 9 19 21s-8 22-19 22-19-10-19-22S49 8 60 8Zm-24 50h48c10 0 17 7 18 17l6 78c1 6-3 10-8 10s-8-3-9-8l-5-55v198c0 7-5 11-11 11s-10-4-11-11l-3-110h-2l-3 110c-1 7-5 11-11 11s-11-4-11-11V100l-5 55c-1 5-4 8-9 8s-9-4-8-10l6-78c1-10 8-17 18-17Z',
    ),
  )
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.NoColorSpace
  return t
}

const PERSON_H = 1.72
const PODIUM_H = 0.14
const LAMP_Y = 3.6

export class Stage {
  group = new THREE.Group()
  /** Where the ring stands (float: 0 = the first character at the front) */
  pos = 0
  target = 0
  /** How much the stage is lit (0 = dark, when the wall is on screen) */
  light = 0
  private lightTarget = 1
  private people: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>[] = []
  private podiums: THREE.Group[] = []
  private podiumMats: THREE.ShaderMaterial[] = []
  private rings: THREE.MeshBasicMaterial[] = []
  private cones: THREE.ShaderMaterial[] = []
  private lampMats: THREE.MeshBasicMaterial[] = []
  private glows: THREE.Mesh[] = []
  private spots: THREE.Vector4[] = []
  private floorMat: THREE.ShaderMaterial
  private motesMat: THREE.ShaderMaterial
  private mirror: Reflector
  private hits: THREE.Mesh[] = []
  private levels: number[] = []
  private intro: number[] = []
  private litAt = -1
  private radius: number
  private step: number
  private n: number
  private phone: boolean

  constructor(
    characters: StageCharacter[],
    textures: Map<string, THREE.Texture>,
    marble: THREE.Texture,
    warm: THREE.Color,
    phone: boolean,
    origin: THREE.Vector3,
  ) {
    this.phone = phone
    this.group.position.copy(origin)
    this.n = characters.length
    this.radius = phone ? 2.8 : 4.4
    this.step = phone ? 0.66 : 0.58
    const warmV = new THREE.Vector3(warm.r, warm.g, warm.b)
    for (let i = 0; i < 16; i++) this.spots.push(new THREE.Vector4())

    // The mirror floor.
    const size = 30
    const mirrorRes = phone ? 0.35 : 0.5
    this.mirror = new Reflector(new THREE.PlaneGeometry(size, size), {
      textureWidth: Math.round(window.innerWidth * mirrorRes * Math.min(2, window.devicePixelRatio || 1)),
      textureHeight: Math.round(window.innerHeight * mirrorRes * Math.min(2, window.devicePixelRatio || 1)),
      clipBias: 0.003,
      shader: {
        name: 'RfaheyaFloor',
        uniforms: {
          color: { value: null },
          tDiffuse: { value: null },
          textureMatrix: { value: null },
          uMap: { value: marble },
          uSpots: { value: this.spots },
          uCount: { value: Math.min(16, this.n) },
          uWarm: { value: warmV },
          uOrigin: { value: origin.clone() },
          uLight: { value: 0 },
        },
        vertexShader: floorVertex,
        fragmentShader: floorFragment,
      },
    })
    this.mirror.rotation.x = -Math.PI / 2
    this.mirror.position.z = -2
    this.floorMat = this.mirror.material as THREE.ShaderMaterial
    // (the Reflector copies its uniforms: point these back at the shared ones)
    this.floorMat.uniforms.uSpots.value = this.spots
    this.floorMat.uniforms.uMap.value = marble
    this.group.add(this.mirror)

    // A dark backdrop far behind, with a faint warm glow.
    const back = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 14),
      new THREE.ShaderMaterial({
        uniforms: { uWarm: { value: warmV }, uLight: { value: 0 } },
        vertexShader: personVertex,
        fragmentShader: /* glsl */ `
uniform vec3 uWarm;
uniform float uLight;
varying vec2 vUv;
void main() {
  vec2 q = (vUv - vec2(0.5, 0.42)) * vec2(2.2, 1.0);
  float glow = (smoothstep(0.7, 0.0, length(q)) * 0.022 + smoothstep(0.3, 0.0, length(q)) * 0.018) * smoothstep(0.12, 0.4, vUv.y);
  gl_FragColor = vec4(uWarm * glow * uLight, 1.0);
}`,
        depthWrite: false,
        transparent: true,
        blending: THREE.AdditiveBlending, // only adds its glow: the wall behind stays visible on the way in
      }),
    )
    back.position.set(0, 4, -this.radius * 2 - 4)
    back.userData.light = true
    this.group.add(back)
    this.backMat = back.material as THREE.ShaderMaterial

    // Per character: podium, gold ring, spotlight, cone, photo, hit area.
    const podiumGeo = new THREE.CylinderGeometry(0.44, 0.48, PODIUM_H, 72)
    podiumGeo.translate(0, PODIUM_H / 2, 0)
    const ringGeo = new THREE.TorusGeometry(0.44, 0.006, 8, 96)
    const coneGeo = new THREE.CylinderGeometry(0.07, 0.95, LAMP_Y - 0.05, 64, 1, true)
    coneGeo.translate(0, -(LAMP_Y - 0.05) / 2, 0)
    const lampGeo = new THREE.CylinderGeometry(0.09, 0.12, 0.08, 32)
    const glowGeo = new THREE.CircleGeometry(0.11, 32)
    const shadowTex = (() => {
      const c = document.createElement('canvas')
      c.width = c.height = 128
      const g = c.getContext('2d')!
      const grad = g.createRadialGradient(64, 64, 4, 64, 64, 64)
      grad.addColorStop(0, 'rgba(0,0,0,0.8)')
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      g.fillStyle = grad
      g.fillRect(0, 0, 128, 128)
      return new THREE.CanvasTexture(c)
    })()
    let ghost: THREE.Texture | null = null

    characters.forEach((ch, i) => {
      const pod = new THREE.Group()
      const podMat = new THREE.ShaderMaterial({
        uniforms: { uMap: { value: marble }, uLight: { value: 0 }, uWarm: { value: warmV }, uCenter: { value: new THREE.Vector3() } },
        vertexShader: podiumVertex,
        fragmentShader: podiumFragment,
      })
      pod.add(new THREE.Mesh(podiumGeo, podMat))
      this.podiumMats.push(podMat)
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x000000 })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.rotation.x = Math.PI / 2
      ring.position.y = PODIUM_H + 0.002
      pod.add(ring)
      this.rings.push(ringMat)
      const shadow = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.36), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }))
      shadow.rotation.x = -Math.PI / 2
      shadow.position.y = PODIUM_H + 0.004
      pod.add(shadow)

      // The spotlight above.
      const lampMat = new THREE.MeshBasicMaterial({ color: 0x000000 })
      const lamp = new THREE.Mesh(lampGeo, new THREE.MeshBasicMaterial({ color: 0x0b0807 }))
      lamp.position.y = LAMP_Y + 0.05
      pod.add(lamp)
      const glow = new THREE.Mesh(glowGeo, lampMat)
      glow.rotation.x = Math.PI / 2
      glow.position.y = LAMP_Y
      pod.add(glow)
      this.glows.push(glow)
      this.lampMats.push(lampMat)
      const coneMat = new THREE.ShaderMaterial({
        uniforms: { uLight: { value: 0 }, uTime: { value: 0 }, uWarm: { value: warmV } },
        vertexShader: coneVertex,
        fragmentShader: coneFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      })
      const cone = new THREE.Mesh(coneGeo, coneMat)
      cone.position.y = LAMP_Y
      cone.renderOrder = 5
      pod.add(cone)
      this.cones.push(coneMat)

      // The person.
      let tex = ch.image ? textures.get(ch.image) : undefined
      if (!tex) tex = ghost ??= silhouette()
      const img = tex.image as { width: number; height: number } | undefined
      const aspect = img?.width && img?.height ? img.width / img.height : 0.4
      const personMat = new THREE.ShaderMaterial({
        uniforms: {
          uMap: { value: tex },
          uLight: { value: 0 },
          uFade: { value: 1 },
          uTime: { value: 0 },
          uWarm: { value: warmV },
          uTexel: { value: new THREE.Vector2(1 / (img?.width || 512), 1 / (img?.height || 1024)) },
        },
        vertexShader: personVertex,
        fragmentShader: personFragment,
        transparent: true,
        depthWrite: false,
      })
      const h = Math.min(PERSON_H, 1.0 / aspect)
      const person = new THREE.Mesh(new THREE.PlaneGeometry(h * aspect, h), personMat)
      person.position.y = PODIUM_H + h / 2 - 0.01
      person.renderOrder = 2
      person.userData.index = i
      pod.add(person)
      this.people.push(person)
      const hit = new THREE.Mesh(new THREE.PlaneGeometry(1.0, PERSON_H + 0.3), new THREE.MeshBasicMaterial({ visible: false }))
      hit.position.y = (PERSON_H + 0.3) / 2
      hit.userData.index = i
      pod.add(hit)
      this.hits.push(hit)

      this.group.add(pod)
      this.podiums.push(pod)
      this.levels.push(0)
      this.intro.push(0.35 + Math.abs(i) * 0.22)
    })

    // Dust over the stage.
    const count = phone ? 260 : 520
    const seeds: number[] = []
    for (let k = 0; k < count; k++) seeds.push(Math.random(), Math.random(), Math.random())
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(new Array(count * 3).fill(0), 3))
    geo.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 3))
    this.motesMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixel: { value: 600 },
        uOrigin: { value: origin.clone() },
        uSpots: { value: this.spots },
        uCount: { value: Math.min(16, this.n) },
        uWarm: { value: warmV },
        uLight: { value: 0 },
      },
      vertexShader: motesVertex,
      fragmentShader: motesFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const motes = new THREE.Points(geo, this.motesMat)
    motes.frustumCulled = false
    motes.renderOrder = 6
    this.group.add(motes)
    this.place(0)
  }
  private backMat: THREE.ShaderMaterial

  get count() {
    return this.people.length
  }

  /** The lights come on, one after another from the front (the start, and coming back). */
  lightUp(now: number) {
    this.litAt = now
    this.lightTarget = 1
    const front = Math.round(this.target)
    this.intro = this.intro.map((_, i) => 0.3 + Math.abs(i - front) * 0.2 + Math.random() * 0.05)
  }
  /** The lights go out (leaving for the wall). */
  dim() {
    this.lightTarget = 0
  }

  setPixel(px: number) {
    this.motesMat.uniforms.uPixel.value = px
  }

  /** The camera on the stage: a little above, before the front character (local units). */
  view(tiltX: number, tiltY: number) {
    const dist = this.phone ? 6.6 : 6.0
    return {
      pos: new THREE.Vector3(tiltX * 0.5, 1.3 - tiltY * 0.18, dist).add(this.group.position),
      look: new THREE.Vector3(tiltX * 0.12, this.phone ? 0.6 : 0.72, -0.6).add(this.group.position),
    }
  }
  /** The front character's head, for the flight into its wall. */
  front() {
    return new THREE.Vector3(0, PODIUM_H + PERSON_H * 0.85, 0).add(this.group.position)
  }

  pick(ray: THREE.Raycaster) {
    const hit = ray.intersectObjects(this.hits)[0]
    return hit ? (hit.object.userData.index as number) : null
  }

  /** Places everyone on the ring. */
  private place(t: number) {
    const camZ = this.phone ? 6.6 : 6.0
    this.podiums.forEach((pod, i) => {
      const d = i - this.pos
      const a = d * this.step
      const x = Math.sin(a) * this.radius
      const z = (Math.cos(a) - 1) * this.radius
      pod.position.set(x, 0, z)
      // Face the audience (the camera), each with a slight turn of its own.
      pod.rotation.y = Math.atan2(-x, camZ - z) * 0.85
      const person = this.people[i]
      person.scale.y = 1 + Math.sin(t * 1.4 + i * 1.7) * 0.004 // breathing
      const fade = 1 - THREE.MathUtils.smoothstep(Math.abs(d), 2.6, 3.8)
      person.material.uniforms.uFade.value = fade
      pod.visible = fade > 0.01
      this.podiumMats[i].uniforms.uCenter.value.copy(pod.position).add(this.group.position)
    })
  }

  update(dt: number, t: number, still: boolean) {
    this.pos += (this.target - this.pos) * (still ? 1 : Math.min(1, dt * 4.2))
    this.light += (this.lightTarget - this.light) * Math.min(1, dt * (this.lightTarget > this.light ? 1.6 : 3))
    this.place(t)
    const since = this.litAt >= 0 ? t - this.litAt : -1
    for (let i = 0; i < this.n; i++) {
      const d = Math.abs(i - this.pos)
      const want = (d < 0.5 ? 1.25 : 0.1 + 0.35 * Math.max(0, 1 - (d - 0.5) / 1.5)) * this.lightTarget
      let on = 0
      if (since >= 0) {
        const s = since - this.intro[i]
        on = s < 0 ? 0 : s < 0.45 ? (Math.sin(s * 80) > 0.1 ? 1 : 0.15) * Math.min(1, s * 4 + 0.3) : 1
      }
      this.levels[i] += (want * on - this.levels[i]) * Math.min(1, dt * (on < 1 ? 30 : this.lightTarget ? 4 : 1.6))
      const l = this.levels[i]
      this.people[i].material.uniforms.uLight.value = l
      this.people[i].material.uniforms.uTime.value = t + i * 2.3
      this.podiumMats[i].uniforms.uLight.value = l
      this.rings[i].color.setRGB(2.2 * l, 1.45 * l, 0.55 * l)
      this.cones[i].uniforms.uLight.value = l
      this.cones[i].uniforms.uTime.value = t
      this.lampMats[i].color.setRGB(10 * l, 7.6 * l, 5 * l)
      if (i < 16) {
        const p = this.podiums[i].position
        this.spots[i].set(p.x + this.group.position.x, 0, p.z + this.group.position.z, l * (this.podiums[i].visible ? 1 : 0))
      }
    }
    this.floorMat.uniforms.uLight.value = this.light
    this.backMat.uniforms.uLight.value = this.light
    this.motesMat.uniforms.uTime.value = t
    this.motesMat.uniforms.uLight.value = this.light
    // Nothing of the stage is drawn (nor reflected) while it is dark.
    this.group.visible = this.light > 0.003 || this.lightTarget > 0
  }

  dispose() {
    this.mirror.dispose()
  }
}
