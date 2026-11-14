import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

export const PALETTES = {
  burgundy: [0x5c0a1c, 0x74101f, 0x4a0716],
  ivory: [0xf3e8d6, 0xfaf3e6, 0xead9bf],
  blush: [0xe9a7b0, 0xf2c1c5, 0xd98d98],
  red: [0xa5122b, 0xbf1d36, 0x8c0d22],
  mix: [0x5c0a1c, 0xf3e8d6, 0xe9a7b0, 0x74101f, 0xfaf3e6, 0xa5122b],
}

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
const lerp = THREE.MathUtils.lerp

/* ---------- realistic petal: rounded, notched, cupped, curled, ruffled, velvety shading ---------- */
export function petalGeo({ cup, curl, ruffle = 0.03, seed = 0 }) {
  const g = new THREE.PlaneGeometry(1, 1, 18, 18)
  const p = g.attributes.position
  const col = new Float32Array(p.count * 3)
  for (let i = 0; i < p.count; i++) {
    const xn = p.getX(i) // -0.5..0.5
    const v = p.getY(i) + 0.5 // 0..1 (base -> tip)
    const w = Math.sqrt(Math.sin(Math.PI * (0.06 + 0.64 * v)))
    const x = xn * w
    const edge = Math.abs(2 * xn)
    const notch = 0.05 * Math.exp(-((xn / 0.08) ** 2)) * v ** 8
    const y = (v * (1 - 0.22 * edge * edge) - notch) * 1.15
    let z = -cup * x * x * (0.6 + 0.4 * (1 - v)) + curl * v ** 3 * (0.55 + 0.45 * edge)
    z += ruffle * Math.sin(xn * 22 + seed) * v * v * edge
    p.setXYZ(i, x, y, z)
    let b = 0.38 + 0.62 * smooth(0, 0.5, v)
    b *= 1 - 0.2 * edge ** 3
    b *= 1 + 0.08 * v
    col.set([b, b, b], i * 3)
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3))
  g.computeVertexNormals()
  return g
}

export function leafGeo() {
  const g = new THREE.PlaneGeometry(1, 1, 10, 16)
  const p = g.attributes.position
  const col = new Float32Array(p.count * 3)
  for (let i = 0; i < p.count; i++) {
    const xn = p.getX(i)
    const v = p.getY(i) + 0.5
    let w = Math.pow(Math.sin(Math.PI * Math.min(1, v * 1.02)), 0.75) * 0.55
    w *= 1 + 0.07 * Math.sin(v * 46)
    const x = xn * w
    const z = -0.35 * Math.abs(x) + 0.12 * v * v
    p.setXYZ(i, x, v * 1.2, z)
    const vein = Math.exp(-((xn / 0.05) ** 2))
    const b = 0.75 + 0.35 * vein + 0.1 * v
    col.set([b, b, b], i * 3)
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3))
  g.computeVertexNormals()
  return g
}

const PETAL_GEOS = () => [
  petalGeo({ cup: 2.4, curl: 0.04, ruffle: 0.01 }),
  petalGeo({ cup: 1.4, curl: 0.25, ruffle: 0.03, seed: 2 }),
  petalGeo({ cup: 0.8, curl: 0.55, ruffle: 0.05, seed: 5 }),
]

export function roseMaterial(hex) {
  const c = new THREE.Color(hex)
  return new THREE.MeshPhysicalMaterial({
    color: c, vertexColors: true, roughness: 0.62, side: THREE.DoubleSide,
    sheen: 0.8, sheenRoughness: 0.42, sheenColor: c.clone().lerp(new THREE.Color(1, 1, 1), 0.15),
  })
}

function makeRose(geos, leaf, mat, leafMat) {
  const group = new THREE.Group()
  const layers = [
    { n: 7, s: [0.3, 0.46], rx: [-0.1, 0.12], r: [0.0, 0.03], g: 0 },
    { n: 12, s: [0.55, 0.86], rx: [0.2, 0.78], r: [0.04, 0.13], g: 1 },
    { n: 13, s: [0.9, 1.15], rx: [0.9, 1.38], r: [0.13, 0.21], g: 2 },
  ]
  let k = 0
  layers.forEach((L) => {
    for (let j = 0; j < L.n; j++) {
      const t = j / (L.n - 1)
      const pivot = new THREE.Object3D()
      pivot.rotation.y = k * 2.39996 + (Math.random() - 0.5) * 0.2
      k++
      const m = new THREE.Mesh(geos[L.g], mat)
      const s = lerp(L.s[0], L.s[1], t)
      m.scale.set(s * (0.9 + Math.random() * 0.2), s, s)
      m.position.z = lerp(L.r[0], L.r[1], t)
      m.rotation.x = lerp(L.rx[0], L.rx[1], t) + (Math.random() - 0.5) * 0.08
      m.rotation.z = (Math.random() - 0.5) * 0.15
      pivot.add(m)
      group.add(pivot)
    }
  })
  for (let i = 0; i < 4; i++) {
    const pivot = new THREE.Object3D()
    pivot.rotation.y = (i / 4) * Math.PI * 2 + 0.5
    const l = new THREE.Mesh(leaf, leafMat)
    l.scale.set(0.9, 1.1, 0.9)
    l.position.z = 0.25
    l.position.y = -0.05
    l.rotation.x = 1.85 + Math.random() * 0.2
    pivot.add(l)
    group.add(pivot)
  }
  return group
}

const goldMetal = (rough = 0.22) => new THREE.MeshStandardMaterial({ color: 0xf0c869, metalness: 1, roughness: rough, side: THREE.DoubleSide })

function wingTexture(variant) {
  const cv = document.createElement('canvas')
  cv.width = cv.height = 256
  const ctx = cv.getContext('2d')
  const palettes = [['#fff8e4', '#e8c56e', '#a8801f'], ['#ffffff', '#f3e3bd', '#c9a24a'], ['#fffaf0', '#d9b45a', '#8a6620']]
  const [a, b, edge] = palettes[variant % palettes.length]
  const wing = (cx, cy, rx, ry, rot) => {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rot)
    const g = ctx.createRadialGradient(-rx * 0.7, 0, 4, 0, 0, rx * 1.05)
    g.addColorStop(0, a)
    g.addColorStop(0.7, b)
    g.addColorStop(1, edge)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = edge
    ctx.lineWidth = 3
    ctx.stroke()
    ctx.strokeStyle = 'rgba(140,100,30,0.45)'
    ctx.lineWidth = 1.2
    for (let k = -2; k <= 2; k++) {
      ctx.beginPath()
      ctx.moveTo(-rx, 0)
      ctx.quadraticCurveTo(0, k * ry * 0.3, rx * 0.95, k * ry * 0.35)
      ctx.stroke()
    }
    ctx.fillStyle = '#ffffff'
    for (let k = 0; k < 4; k++) {
      ctx.beginPath()
      ctx.arc(rx * (0.4 + k * 0.14), (k % 2 ? 1 : -1) * ry * 0.38, 4 - k * 0.5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }
  wing(110, 92, 100, 66, -0.35)
  wing(88, 178, 74, 52, 0.45)
  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function makeButterfly(variant) {
  const group = new THREE.Group()
  const geo = new THREE.PlaneGeometry(1, 1)
  geo.translate(0.5, 0, 0)
  geo.rotateX(-Math.PI / 2)
  const mat = new THREE.MeshBasicMaterial({ map: wingTexture(variant), transparent: true, side: THREE.DoubleSide, depthWrite: false, toneMapped: false })
  const right = new THREE.Mesh(geo, mat)
  const left = new THREE.Mesh(geo, mat)
  left.scale.x = -1
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.55, 4, 8), goldMetal(0.3))
  body.rotation.x = Math.PI / 2
  group.add(right, left, body)
  group.userData = { left, right }
  return group
}

function makeGlitter(count, topY, bottomY) {
  const geo = new THREE.BufferGeometry()
  const pos = new Float32Array(count * 3)
  const phase = new Float32Array(count)
  const size = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 16
    pos[i * 3 + 1] = lerp(bottomY, topY, Math.random())
    pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 1
    phase[i] = Math.random() * 100
    size[i] = 0.7 + Math.random() * 2
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uPR: { value: Math.min(window.devicePixelRatio, 2) } },
    vertexShader: /* glsl */ `
      attribute float aPhase; attribute float aSize;
      uniform float uTime; uniform float uPR;
      varying float vBlink;
      void main(){
        vec3 p = position;
        p.x += sin(uTime*0.3 + aPhase) * 0.6;
        p.y += sin(uTime*0.22 + aPhase*1.7) * 0.5;
        p.z += cos(uTime*0.25 + aPhase) * 0.4;
        vec4 mv = modelViewMatrix * vec4(p,1.0);
        float b = 0.5 + 0.5*sin(uTime*(0.9 + fract(aPhase)*1.6) + aPhase);
        vBlink = pow(b, 3.0);
        gl_PointSize = aSize * uPR * 55.0 * (0.35 + vBlink) / -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      varying float vBlink;
      void main(){
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        float star = max(0.0, 1.0 - abs(c.x)*14.0) * smoothstep(0.5, 0.0, abs(c.y))
                   + max(0.0, 1.0 - abs(c.y)*14.0) * smoothstep(0.5, 0.0, abs(c.x));
        float core = smoothstep(0.22, 0.0, d);
        float halo = smoothstep(0.5, 0.0, d) * 0.3;
        float a = clamp(star*0.8 + core + halo, 0.0, 1.0);
        vec3 col = mix(vec3(0.72, 0.53, 0.2), vec3(0.95, 0.78, 0.42), core);
        gl_FragColor = vec4(col, a * vBlink * 0.85);
      }`,
  })
  return new THREE.Points(geo, mat)
}

/* ---------- component ---------- */
export default function Scene3D({ settings, burst }) {
  const canvasRef = useRef(null)
  const api = useRef(null)
  const live = useRef(settings)
  live.current = settings

  useEffect(() => { api.current?.apply(settings) }, [settings])
  useEffect(() => { if (burst) api.current?.burstCenter(1) }, [burst])

  useEffect(() => {
    const canvas = canvasRef.current
    const isMobile = window.innerWidth < 760
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.75 : 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    renderer.outputColorSpace = THREE.SRGBColorSpace

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0xfaf1ee, 0.03)
    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environmentIntensity = 0.85

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.set(0, 0, 10)

    const ambient = new THREE.AmbientLight(0xfff4ee, 1.0)
    const key = new THREE.PointLight(0xffd9a8, 55, 30, 1.6)
    const rim = new THREE.PointLight(0xff9db0, 30, 30, 1.6)
    const top = new THREE.DirectionalLight(0xfff2e0, 1.2)
    top.position.set(2, 5, 6)
    scene.add(ambient, key, rim, top)

    const PAGE_DEPTH = 64

    /* roses */
    const geos = PETAL_GEOS()
    const leaf = leafGeo()
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2c5a2e, roughness: 0.5, vertexColors: true, side: THREE.DoubleSide })
    const roses = []
    const spots = []
    for (let i = 0, y = 2; y > -66; i++, y -= 4.6 + Math.random() * 1.2) {
      spots.push([i % 2 ? 3.3 : -3.3, y, -1 - Math.random()])
    }
    spots.forEach(([x, y, z]) => {
      const mat = roseMaterial(0x5c0a1c)
      const r = makeRose(geos, leaf, mat, leafMat)
      const sx = isMobile ? Math.sign(x) * 2.7 : x
      r.position.set(sx, y, isMobile ? z - 1 : z)
      r.rotation.set(0.85 + Math.random() * 0.5, Math.random() * 6, x > 0 ? -0.45 : 0.45)
      const s = (isMobile ? 0.62 : 0.8) + Math.random() * 0.25
      r.userData = { isRose: true, mat, base: r.position.clone(), seed: Math.random() * 10, bloom: 0, s, spin: 0 }
      scene.add(r)
      roses.push(r)
    })

    /* rings */
    const rings = new THREE.Group()
    const gold = new THREE.MeshStandardMaterial({ color: 0xf2c86e, metalness: 1, roughness: 0.14 })
    const torus = new THREE.TorusGeometry(1, 0.1, 40, 120)
    const r1 = new THREE.Mesh(torus, gold)
    const r2 = new THREE.Mesh(torus, gold)
    r1.position.x = -0.55
    r2.position.x = 0.55
    r2.rotation.y = Math.PI / 2.4
    const diamond = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.28, 0),
      new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0, clearcoat: 1, emissive: 0xeaf6ff, emissiveIntensity: 0.5 })
    )
    diamond.scale.y = 1.25
    diamond.position.set(-0.55, 1.28, 0)
    rings.add(r1, r2, diamond)
    rings.position.set(0, -20, 0.5)
    rings.scale.setScalar(isMobile ? 0.62 : 0.8)
    scene.add(rings)
    const ringGlow = new THREE.PointLight(0xffe3a8, 30, 8, 1.5)
    scene.add(ringGlow)

    /* falling petals + gold flakes */
    const dummy = new THREE.Object3D()
    const makeFalling = (max, geo, mat) => {
      const mesh = new THREE.InstancedMesh(geo, mat, max)
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
      const data = []
      for (let i = 0; i < max; i++) {
        data.push({
          x: (Math.random() - 0.5) * 14, y: Math.random() * 14 - 7, z: (Math.random() - 0.5) * 8,
          vy: 0.3 + Math.random() * 0.55, sway: Math.random() * 6,
          rx: Math.random() * 6, ry: Math.random() * 6, rz: Math.random() * 6, sr: 0.5 + Math.random() * 1.6,
          bv: new THREE.Vector3(),
        })
      }
      scene.add(mesh)
      return { mesh, data, max }
    }
    const fallGeo = petalGeo({ cup: 0.7, curl: 0.3, ruffle: 0.04 })
    fallGeo.scale(0.2, 0.2, 0.2)
    const petals = makeFalling(isMobile ? 90 : 170, fallGeo, roseMaterial(0xffffff))
    const flakeGeo = new THREE.PlaneGeometry(0.075, 0.06, 3, 3)
    const fp = flakeGeo.attributes.position
    for (let i = 0; i < fp.count; i++) fp.setZ(i, (Math.random() - 0.5) * 0.015)
    flakeGeo.computeVertexNormals()
    const flakes = makeFalling(isMobile ? 45 : 90, flakeGeo, goldMetal(0.18))
    const falling = [petals, flakes]

    /* butterflies */
    const butterflies = []
    const BCOUNT = isMobile ? 8 : 12
    for (let i = 0; i < BCOUNT; i++) {
      const bf = makeButterfly(i)
      bf.scale.setScalar(0.55 + Math.random() * 0.4)
      bf.userData.path = {
        cy: 2 - (i / BCOUNT) * 66,
        ax: 2.5 + Math.random() * 3, ay: 1 + Math.random() * 2, az: 1.5 + Math.random() * 2,
        fa: 0.12 + Math.random() * 0.12, fb: 0.17 + Math.random() * 0.15, fc: 0.1 + Math.random() * 0.1,
        seed: Math.random() * 100, flap: 8 + Math.random() * 5,
      }
      scene.add(bf)
      butterflies.push(bf)
    }

    const glitter = makeGlitter(isMobile ? 260 : 460, 8, -72)
    scene.add(glitter)

    /* settings from the Flower Studio */
    let wind = 1
    let sizeMul = 1
    const col = new THREE.Color()
    const apply = (s) => {
      const pal = PALETTES[s.palette] || PALETTES.mix
      roses.forEach((r, i) => {
        const m = r.userData.mat
        m.color.set(pal[i % pal.length])
        m.sheenColor.copy(m.color).lerp(new THREE.Color(1, 1, 1), 0.15)
        r.userData.spin += 4 // a little twirl to show the change
      })
      for (let i = 0; i < petals.max; i++) petals.mesh.setColorAt(i, col.set(pal[(i * 7) % pal.length]))
      petals.mesh.instanceColor.needsUpdate = true
      petals.mesh.count = Math.round(petals.max * s.petals)
      flakes.mesh.count = s.gold ? Math.round(flakes.max * Math.max(0.3, s.petals)) : 0
      butterflies.forEach((b) => (b.visible = s.butterflies))
      glitter.visible = s.gold
      wind = s.wind
      sizeMul = s.size
    }

    const tmp = new THREE.Vector3()
    let camY = 0
    const burstAt = (pt, n, power = 1) => {
      falling.forEach(({ mesh, data }, fi) => {
        const cnt = mesh.count
        if (!cnt) return
        const m = fi === 0 ? n : n / 2
        for (let k = 0; k < m; k++) {
          const p = data[(Math.random() * cnt) | 0]
          p.x = pt.x + (Math.random() - 0.5) * 0.4
          p.y = pt.y + (Math.random() - 0.5) * 0.4
          p.z = pt.z + 0.6
          p.bv.set((Math.random() - 0.5) * 12 * power, (Math.random() - 0.15) * 10 * power, (Math.random() - 0.2) * 6 * power)
        }
      })
    }
    const burstCenter = (power = 1) => burstAt(tmp.set(0, camY, 2), 140, power)
    api.current = { apply, burstCenter }
    apply(live.current)
    const onBurst = () => burstCenter(0.8)
    window.addEventListener('petal-burst', onBurst)

    /* interaction: parallax + tap a rose to twirl it */
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
    const onMove = (e) => {
      const p = e.touches ? e.touches[0] : e
      pointer.tx = (p.clientX / window.innerWidth) * 2 - 1
      pointer.ty = (p.clientY / window.innerHeight) * 2 - 1
    }
    const onOrient = (e) => {
      if (e.gamma == null) return
      pointer.tx = THREE.MathUtils.clamp(e.gamma / 30, -1, 1)
      pointer.ty = THREE.MathUtils.clamp((e.beta - 45) / 30, -1, 1)
    }
    const ray = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    let down = null
    const onDown = (e) => (down = { x: e.clientX, y: e.clientY })
    const onUp = (e) => {
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 10) return
      if (e.target.closest && e.target.closest('a,button,input,label,.studio,.scratch,.no-rose')) return
      ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1)
      ray.setFromCamera(ndc, camera)
      const hit = ray.intersectObjects(roses, true)[0]
      if (!hit) return
      let o = hit.object
      while (o && !o.userData.isRose) o = o.parent
      if (!o) return
      o.userData.spin += 9
      o.userData.pop = 1
      burstAt(hit.point, 40, 0.7)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('deviceorientation', onOrient)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)

    const resize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.fov = w < h ? 60 : 45
      camera.updateProjectionMatrix()
    }
    resize()
    window.addEventListener('resize', resize)

    const anchor = document.querySelector('.rings-anchor')
    const clock = new THREE.Clock()
    let raf

    const tick = () => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(clock.getDelta(), 0.05)
      const t = clock.elapsedTime

      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const targetY = -(window.scrollY / max) * PAGE_DEPTH
      camY += (targetY - camY) * Math.min(1, dt * 4)
      pointer.x += (pointer.tx - pointer.x) * dt * 2.5
      pointer.y += (pointer.ty - pointer.y) * dt * 2.5
      camera.position.set(pointer.x * 0.8, camY - pointer.y * 0.5, 10)
      camera.lookAt(0, camY, 0)

      const breath = 0.85 + 0.15 * Math.sin(t * 0.7)
      ambient.intensity = 1.0 * breath
      key.intensity = 45 * breath
      key.position.set(4 * Math.sin(t * 0.4), camY + 3, 5)
      rim.position.set(-4 * Math.cos(t * 0.33), camY - 2, 4)
      glitter.material.uniforms.uTime.value = t

      roses.forEach((r) => {
        const d = r.userData
        const near = Math.abs(d.base.y - camY) < 10 ? 1 : 0
        d.bloom += (near - d.bloom) * dt * 1.5
        d.pop = (d.pop || 0) * (1 - dt * 3)
        r.position.y = d.base.y + Math.sin(t * 0.6 + d.seed) * 0.2
        r.rotation.y += dt * (0.1 + d.spin)
        d.spin *= 1 - dt * 1.8
        r.scale.setScalar(d.s * sizeMul * (0.25 + 0.75 * d.bloom) * (1 + d.pop * 0.25))
      })

      if (anchor) {
        const rc = anchor.getBoundingClientRect()
        const cy = rc.top + rc.height / 2
        const visH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (10 - rings.position.z)
        rings.position.y = camera.position.y - ((cy - window.innerHeight / 2) / window.innerHeight) * visH
        ringGlow.position.set(0, rings.position.y + 0.7, 3)
      }
      rings.rotation.y = t * 0.45
      rings.rotation.x = Math.sin(t * 0.5) * 0.25
      diamond.rotation.y = -t * 1.5
      ringGlow.intensity = 30 * (0.75 + 0.25 * Math.sin(t * 2.2))

      falling.forEach(({ mesh, data }) => {
        for (let i = 0; i < mesh.count; i++) {
          const p = data[i]
          p.x += p.bv.x * dt
          p.y += p.bv.y * dt
          p.z += p.bv.z * dt
          p.bv.multiplyScalar(1 - dt * 1.4)
          p.y -= p.vy * dt * wind
          p.x += Math.sin(t * 0.8 + p.sway) * dt * 0.4 * wind + dt * 0.15 * (wind - 1)
          if (p.y < camY - 7) { p.y = camY + 7; p.x = (Math.random() - 0.5) * 14 }
          if (p.y > camY + 8) p.y = camY - 6
          if (p.x > 9) p.x = -9
          dummy.position.set(p.x, p.y, p.z)
          dummy.rotation.set(p.rx + t * p.sr * wind, p.ry + t * p.sr * 0.7, p.rz + t * 0.3)
          dummy.updateMatrix()
          mesh.setMatrixAt(i, dummy.matrix)
        }
        mesh.instanceMatrix.needsUpdate = true
      })

      butterflies.forEach((bf) => {
        if (!bf.visible) return
        const P = bf.userData.path
        const tt = t + P.seed
        const pos = (time, out) =>
          out.set(Math.sin(time * P.fa * 2) * P.ax, P.cy + Math.sin(time * P.fb * 2) * P.ay, Math.cos(time * P.fc * 2) * P.az)
        pos(tt, bf.position)
        pos(tt + 0.1, tmp)
        bf.lookAt(tmp)
        const f = Math.sin(t * P.flap + P.seed)
        bf.userData.right.rotation.z = f * 1.05
        bf.userData.left.rotation.z = -f * 1.05
      })

      renderer.render(scene, camera)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('petal-burst', onBurst)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('deviceorientation', onOrient)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('resize', resize)
      renderer.dispose()
      pmrem.dispose()
    }
  }, [])

  return <canvas ref={canvasRef} className="scene3d" aria-hidden="true" />
}
