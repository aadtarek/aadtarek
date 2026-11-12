import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

const GOLD = new THREE.Color(0xd9b45a)
const DAY_FOG = new THREE.Color(0xfbf7ef)
const NIGHT_FOG = new THREE.Color(0x0d0b08)

/* ---------- geometry helpers ---------- */

// Cupped, curled petal; base at origin, grows along +y. Tips fade to gold (vertex colours).
function petalGeometry(cup = 0.9, curl = 0.35, goldTip = 0) {
  const g = new THREE.PlaneGeometry(1, 1.3, 12, 12)
  const p = g.attributes.position
  const colors = new Float32Array(p.count * 3)
  const white = new THREE.Color(1, 1, 1)
  const c = new THREE.Color()
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    const y = p.getY(i)
    const ny = (y + 0.65) / 1.3
    const w = 0.25 + 0.75 * Math.sin(Math.min(1, ny * 1.15) * Math.PI * 0.62)
    const nx = x * w
    p.setXYZ(i, nx, ny * 1.3, -cup * nx * nx + curl * ny * ny * ny)
    const edge = Math.max(0, (ny - 0.78) / 0.22) * goldTip
    c.copy(white).lerp(GOLD, edge)
    colors.set([c.r, c.g, c.b], i * 3)
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  g.computeVertexNormals()
  return g
}

const goldMetal = (rough = 0.22) => new THREE.MeshStandardMaterial({ color: 0xf0c869, metalness: 1, roughness: rough, side: THREE.DoubleSide })

function makeRose(color) {
  const group = new THREE.Group()
  const base = new THREE.Color(color)
  const N = 26
  const geo = petalGeometry(0.9, 0.35, 0.85)
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1)
    const pivot = new THREE.Object3D()
    pivot.rotation.y = i * 2.39996
    const col = base.clone().offsetHSL(0, 0, (t - 0.6) * 0.06)
    const mat = new THREE.MeshPhysicalMaterial({
      color: col, vertexColors: true, roughness: 0.55, sheen: 1, sheenColor: 0xffffff, sheenRoughness: 0.5,
      side: THREE.DoubleSide, emissive: col, emissiveIntensity: 0.06,
    })
    const m = new THREE.Mesh(geo, mat)
    const s = 0.35 + t * 0.85
    m.scale.set(s, s * (0.9 + t * 0.2), s)
    m.position.z = 0.04 + t * 0.32
    m.rotation.x = 0.12 + t * 1.05
    pivot.add(m)
    group.add(pivot)
  }
  // gold leaves
  const leafGeo = petalGeometry(0.4, 0.2)
  const leafMat = goldMetal(0.28)
  for (let i = 0; i < 3; i++) {
    const pivot = new THREE.Object3D()
    pivot.rotation.y = (i / 3) * Math.PI * 2 + 0.4
    const leaf = new THREE.Mesh(leafGeo, leafMat)
    leaf.scale.set(0.8, 1.4, 0.8)
    leaf.position.z = 0.2
    leaf.rotation.x = 1.75
    pivot.add(leaf)
    group.add(pivot)
  }
  return group
}

function wingTexture(variant) {
  const cv = document.createElement('canvas')
  cv.width = cv.height = 256
  const ctx = cv.getContext('2d')
  const palettes = [
    ['#fff8e4', '#e8c56e', '#a8801f'],
    ['#ffffff', '#f3e3bd', '#c9a24a'],
    ['#fffaf0', '#d9b45a', '#8a6620'],
  ]
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

/* ---------- twinkling gold glitter ---------- */
function makeGlitter(count, topY, bottomY) {
  const geo = new THREE.BufferGeometry()
  const pos = new Float32Array(count * 3)
  const phase = new Float32Array(count)
  const size = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 16
    pos[i * 3 + 1] = THREE.MathUtils.lerp(bottomY, topY, Math.random())
    pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 1
    phase[i] = Math.random() * 100
    size[i] = 0.7 + Math.random() * 2
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uTime: { value: 0 }, uNight: { value: 0 }, uPR: { value: Math.min(window.devicePixelRatio, 2) } },
    vertexShader: /* glsl */ `
      attribute float aPhase; attribute float aSize;
      uniform float uTime; uniform float uPR; uniform float uNight;
      varying float vBlink;
      void main(){
        vec3 p = position;
        p.x += sin(uTime*0.3 + aPhase) * 0.6;
        p.y += sin(uTime*0.22 + aPhase*1.7) * 0.5;
        p.z += cos(uTime*0.25 + aPhase) * 0.4;
        vec4 mv = modelViewMatrix * vec4(p,1.0);
        float b = 0.5 + 0.5*sin(uTime*(0.9 + fract(aPhase)*1.6) + aPhase);
        vBlink = pow(b, 3.0);
        gl_PointSize = aSize * uPR * (34.0 + 40.0*uNight) * (0.35 + vBlink) / -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uNight; varying float vBlink;
      void main(){
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        // four-point star sparkle + soft core
        float star = max(0.0, 1.0 - abs(c.x)*14.0) * smoothstep(0.5, 0.0, abs(c.y))
                   + max(0.0, 1.0 - abs(c.y)*14.0) * smoothstep(0.5, 0.0, abs(c.x));
        float core = smoothstep(0.22, 0.0, d);
        float halo = smoothstep(0.5, 0.0, d) * 0.35 * uNight;
        float a = clamp(star*0.8 + core + halo, 0.0, 1.0);
        vec3 deep = vec3(0.72, 0.53, 0.16);
        vec3 bright = vec3(1.0, 0.86, 0.52);
        vec3 col = mix(mix(deep, bright, uNight), vec3(1.0), core*0.6*uNight);
        gl_FragColor = vec4(col, a * vBlink);
      }`,
  })
  return new THREE.Points(geo, mat)
}

/* ---------- component ---------- */
export default function Scene3D({ lightsOff, burst }) {
  const canvasRef = useRef(null)
  const state = useRef({ lightsOff, burst: 0 })
  state.current.lightsOff = lightsOff

  useEffect(() => {
    if (burst) state.current.burst = performance.now()
  }, [burst])

  useEffect(() => {
    const canvas = canvasRef.current
    const isMobile = window.innerWidth < 760
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.75 : 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    renderer.outputColorSpace = THREE.SRGBColorSpace

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(DAY_FOG.clone(), 0.04)
    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.set(0, 0, 10)

    const ambient = new THREE.AmbientLight(0xfff8ee, 1.2)
    const key = new THREE.PointLight(0xffe2b0, 40, 30, 1.6)
    const rim = new THREE.PointLight(0xfff1d6, 25, 30, 1.6)
    scene.add(ambient, key, rim)

    const PAGE_DEPTH = 46

    /* white & champagne roses with gold-dipped tips */
    const roseColors = [0xffffff, 0xfff4e4, 0xf6e7cc, 0xfffaf5, 0xf3e2c0]
    const roses = []
    const roseSpots = [
      [-3.3, 1.9, -1], [3.4, -1.6, -1.5], [-3.6, -6, -2], [3.2, -9.5, -1],
      [-3.0, -14, -1.2], [3.5, -19, -2], [-3.4, -24, -1], [3.1, -29, -1.5],
      [-3.2, -34, -1], [3.3, -39, -1.2], [0, -45.5, -2.5],
    ]
    roseSpots.forEach(([x, y, z], i) => {
      const r = makeRose(roseColors[i % roseColors.length])
      const sx = isMobile ? Math.sign(x || 1) * 2.75 : x
      r.position.set(sx, y, isMobile ? z - 1 : z)
      r.rotation.set(0.9 + Math.random() * 0.5, Math.random() * 6, x > 0 ? -0.4 : 0.4)
      const s = (isMobile ? 0.6 : 0.75) + Math.random() * 0.25
      r.userData = { base: r.position.clone(), seed: Math.random() * 10, bloom: 0, s }
      scene.add(r)
      roses.push(r)
    })

    /* interlocked gold rings + diamond */
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
      new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0, clearcoat: 1, emissive: 0xeaf6ff, emissiveIntensity: 0.35 })
    )
    diamond.scale.y = 1.25
    diamond.position.set(-0.55, 1.28, 0)
    rings.add(r1, r2, diamond)
    rings.position.set(0, -12.2, 0.5)
    rings.scale.setScalar(isMobile ? 0.62 : 0.8)
    scene.add(rings)
    const ringGlow = new THREE.PointLight(0xffe3a8, 20, 8, 1.5)
    ringGlow.position.set(0, -11.5, 3)
    scene.add(ringGlow)

    /* falling white petals + gold leaf flakes */
    const dummy = new THREE.Object3D()
    const makeFalling = (count, geo, mat, colors) => {
      const mesh = new THREE.InstancedMesh(geo, mat, count)
      const data = []
      const col = new THREE.Color()
      for (let i = 0; i < count; i++) {
        data.push({
          x: (Math.random() - 0.5) * 14, y: Math.random() * 14 - 7, z: (Math.random() - 0.5) * 8,
          vy: 0.3 + Math.random() * 0.55, sway: Math.random() * 6,
          rx: Math.random() * 6, ry: Math.random() * 6, rz: Math.random() * 6, sr: 0.5 + Math.random() * 1.6,
          bv: new THREE.Vector3(),
        })
        if (colors) mesh.setColorAt(i, col.set(colors[i % colors.length]))
      }
      scene.add(mesh)
      return { mesh, data, count }
    }
    const petalGeo = petalGeometry(0.6, 0.25, 0.6)
    petalGeo.scale(0.16, 0.16, 0.16)
    const petals = makeFalling(
      isMobile ? 55 : 110,
      petalGeo,
      new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.5, sheen: 1, sheenColor: 0xffffff, side: THREE.DoubleSide, emissive: 0xffffff, emissiveIntensity: 0.08 }),
      [0xffffff, 0xfff6e6, 0xf7ead2]
    )
    const flakeGeo = new THREE.PlaneGeometry(0.075, 0.06, 3, 3)
    const fp = flakeGeo.attributes.position
    for (let i = 0; i < fp.count; i++) fp.setZ(i, (Math.random() - 0.5) * 0.015)
    flakeGeo.computeVertexNormals()
    const flakes = makeFalling(isMobile ? 45 : 90, flakeGeo, goldMetal(0.18))
    const falling = [petals, flakes]

    /* gold butterflies */
    const butterflies = []
    const BCOUNT = isMobile ? 7 : 11
    for (let i = 0; i < BCOUNT; i++) {
      const bf = makeButterfly(i)
      bf.scale.setScalar(0.55 + Math.random() * 0.4)
      bf.userData.path = {
        cy: 2 - (i / BCOUNT) * 48,
        ax: 2.5 + Math.random() * 3, ay: 1 + Math.random() * 2, az: 1.5 + Math.random() * 2,
        fa: 0.12 + Math.random() * 0.12, fb: 0.17 + Math.random() * 0.15, fc: 0.1 + Math.random() * 0.1,
        seed: Math.random() * 100, flap: 8 + Math.random() * 5,
      }
      scene.add(bf)
      butterflies.push(bf)
    }

    /* glitter */
    const glitter = makeGlitter(isMobile ? 240 : 420, 8, -52)
    scene.add(glitter)

    /* interaction */
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
    window.addEventListener('pointermove', onMove)
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('deviceorientation', onOrient)

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
    const tmp = new THREE.Vector3()
    let camY = 0
    let night = 0
    let wasNight = false
    let raf

    const tick = () => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(clock.getDelta(), 0.05)
      const t = clock.elapsedTime
      const s = state.current

      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const targetY = -(window.scrollY / max) * PAGE_DEPTH
      camY += (targetY - camY) * Math.min(1, dt * 4)
      pointer.x += (pointer.tx - pointer.x) * dt * 2.5
      pointer.y += (pointer.ty - pointer.y) * dt * 2.5
      camera.position.set(pointer.x * 0.8, camY - pointer.y * 0.5, 10)
      camera.lookAt(0, camY, 0)

      // day (ivory) <-> night (black & gold) blend
      night += ((s.lightsOff ? 1 : 0) - night) * Math.min(1, dt * 2)
      if (s.lightsOff !== wasNight) {
        glitter.material.blending = s.lightsOff ? THREE.AdditiveBlending : THREE.NormalBlending
        glitter.material.needsUpdate = true
        wasNight = s.lightsOff
      }
      scene.fog.color.copy(DAY_FOG).lerp(NIGHT_FOG, night)
      const breath = 0.85 + 0.15 * Math.sin(t * 0.7)
      ambient.intensity = THREE.MathUtils.lerp(1.2, 0.18, night) * breath
      key.intensity = THREE.MathUtils.lerp(40, 55, night) * breath
      rim.intensity = THREE.MathUtils.lerp(25, 10, night)
      key.position.set(4 * Math.sin(t * 0.4), camY + 3, 5)
      rim.position.set(-4 * Math.cos(t * 0.33), camY - 2, 4)
      glitter.material.uniforms.uTime.value = t
      glitter.material.uniforms.uNight.value = night
      ringGlow.intensity = THREE.MathUtils.lerp(18, 45, night) * (0.75 + 0.25 * Math.sin(t * 2.2))

      roses.forEach((r) => {
        const d = r.userData
        const near = Math.abs(d.base.y - camY) < 9 ? 1 : 0
        d.bloom += (near - d.bloom) * dt * 1.5
        r.position.y = d.base.y + Math.sin(t * 0.6 + d.seed) * 0.2
        r.rotation.y += dt * 0.12
        r.scale.setScalar(d.s * (0.25 + 0.75 * d.bloom))
      })

      if (anchor) {
        const rc = anchor.getBoundingClientRect()
        const cy = rc.top + rc.height / 2
        const visH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (10 - rings.position.z)
        rings.position.y = camera.position.y - ((cy - window.innerHeight / 2) / window.innerHeight) * visH
        ringGlow.position.y = rings.position.y + 0.7
      }
      rings.rotation.y = t * 0.45
      rings.rotation.x = Math.sin(t * 0.5) * 0.25
      diamond.rotation.y = -t * 1.5

      const since = (performance.now() - s.burst) / 1000
      const fresh = s.burst && since < 0.05
      falling.forEach(({ mesh, data, count }) => {
        for (let i = 0; i < count; i++) {
          const p = data[i]
          if (fresh && !p.fired) {
            p.fired = true
            p.x = (Math.random() - 0.5) * 1
            p.y = camY + (Math.random() - 0.5) * 1
            p.z = 2
            p.bv.set((Math.random() - 0.5) * 16, (Math.random() - 0.2) * 12, (Math.random() - 0.5) * 6)
          }
          p.x += p.bv.x * dt
          p.y += p.bv.y * dt
          p.z += p.bv.z * dt
          p.bv.multiplyScalar(1 - dt * 1.4)
          p.y -= p.vy * dt
          p.x += Math.sin(t * 0.8 + p.sway) * dt * 0.4
          if (p.y < camY - 7) { p.y = camY + 7; p.x = (Math.random() - 0.5) * 14 }
          if (p.y > camY + 8) p.y = camY - 6
          dummy.position.set(p.x, p.y, p.z)
          dummy.rotation.set(p.rx + t * p.sr, p.ry + t * p.sr * 0.7, p.rz + t * 0.3)
          dummy.updateMatrix()
          mesh.setMatrixAt(i, dummy.matrix)
        }
        mesh.instanceMatrix.needsUpdate = true
      })

      butterflies.forEach((bf) => {
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
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('deviceorientation', onOrient)
      window.removeEventListener('resize', resize)
      renderer.dispose()
      pmrem.dispose()
    }
  }, [])

  return <canvas ref={canvasRef} className="scene3d" aria-hidden="true" />
}
