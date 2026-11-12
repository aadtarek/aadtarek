import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/* ---------- geometry helpers ---------- */

// A cupped, slightly curled petal. Base at the origin, grows along +y.
function petalGeometry(cup = 0.9, curl = 0.35) {
  const g = new THREE.PlaneGeometry(1, 1.3, 12, 12)
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    const y = p.getY(i)
    const ny = (y + 0.65) / 1.3 // 0 at base -> 1 at tip
    const w = 0.25 + 0.75 * Math.sin(Math.min(1, ny * 1.15) * Math.PI * 0.62)
    const nx = x * w
    const z = -cup * nx * nx + curl * ny * ny * ny
    p.setXYZ(i, nx, ny * 1.3, z)
  }
  g.computeVertexNormals()
  return g
}

function makeRose(color) {
  const group = new THREE.Group()
  const base = new THREE.Color(color)
  const N = 26
  const geo = petalGeometry()
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1)
    const pivot = new THREE.Object3D()
    pivot.rotation.y = i * 2.39996
    const c = base.clone().offsetHSL(0, 0, (t - 0.5) * -0.12)
    const mat = new THREE.MeshStandardMaterial({
      color: c,
      roughness: 0.5,
      metalness: 0.05,
      side: THREE.DoubleSide,
      emissive: c,
      emissiveIntensity: 0.12,
    })
    const m = new THREE.Mesh(geo, mat)
    const s = 0.35 + t * 0.85
    m.scale.set(s, s * (0.9 + t * 0.2), s)
    m.position.z = 0.04 + t * 0.32
    m.rotation.x = 0.12 + t * 1.05
    pivot.add(m)
    group.add(pivot)
  }
  // leaves
  const leafGeo = petalGeometry(0.4, 0.2)
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x2f6b45, roughness: 0.6, side: THREE.DoubleSide })
  for (let i = 0; i < 3; i++) {
    const pivot = new THREE.Object3D()
    pivot.rotation.y = (i / 3) * Math.PI * 2 + 0.4
    const leaf = new THREE.Mesh(leafGeo, leafMat)
    leaf.scale.set(0.9, 1.5, 0.9)
    leaf.position.z = 0.2
    leaf.rotation.x = 1.75
    pivot.add(leaf)
    group.add(pivot)
  }
  return group
}

function wingTexture(c1, c2) {
  const cv = document.createElement('canvas')
  cv.width = cv.height = 256
  const ctx = cv.getContext('2d')
  const wing = (cx, cy, rx, ry, rot, a, b) => {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rot)
    const g = ctx.createRadialGradient(-rx * 0.6, 0, 4, 0, 0, rx * 1.1)
    g.addColorStop(0, a)
    g.addColorStop(0.65, b)
    g.addColorStop(1, 'rgba(255,255,255,0.9)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
    ctx.fill()
    // veins
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'
    ctx.lineWidth = 1.5
    for (let k = -2; k <= 2; k++) {
      ctx.beginPath()
      ctx.moveTo(-rx, 0)
      ctx.quadraticCurveTo(0, k * ry * 0.3, rx * 0.95, k * ry * 0.35)
      ctx.stroke()
    }
    // glowing dots
    for (let k = 0; k < 4; k++) {
      const dx = rx * (0.35 + k * 0.15)
      const dy = (k % 2 ? 1 : -1) * ry * 0.35
      const dg = ctx.createRadialGradient(dx, dy, 0, dx, dy, 9)
      dg.addColorStop(0, 'rgba(255,255,255,1)')
      dg.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = dg
      ctx.beginPath()
      ctx.arc(dx, dy, 9, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }
  // hinge on the left edge (x = 0), wing extends to the right
  wing(110, 92, 100, 66, -0.35, c1, c2) // fore wing
  wing(88, 178, 74, 52, 0.45, c2, c1) // hind wing
  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function makeButterfly(c1, c2) {
  const group = new THREE.Group()
  const geo = new THREE.PlaneGeometry(1, 1)
  geo.translate(0.5, 0, 0)
  geo.rotateX(-Math.PI / 2)
  const mat = new THREE.MeshBasicMaterial({
    map: wingTexture(c1, c2),
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const right = new THREE.Mesh(geo, mat)
  const left = new THREE.Mesh(geo, mat)
  left.scale.x = -1
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.035, 0.55, 4, 8),
    new THREE.MeshBasicMaterial({ color: 0x1a0f22 })
  )
  body.rotation.x = Math.PI / 2
  group.add(right, left, body)
  group.userData = { left, right }
  return group
}

/* ---------- glowing fireflies ---------- */
function makeFireflies(count, topY, bottomY) {
  const geo = new THREE.BufferGeometry()
  const pos = new Float32Array(count * 3)
  const phase = new Float32Array(count)
  const size = new Float32Array(count)
  const hue = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 16
    pos[i * 3 + 1] = THREE.MathUtils.lerp(bottomY, topY, Math.random())
    pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 1
    phase[i] = Math.random() * 100
    size[i] = 0.8 + Math.random() * 2.2
    hue[i] = Math.random()
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
  geo.setAttribute('aHue', new THREE.BufferAttribute(hue, 1))
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uGlow: { value: 1 },
      uPR: { value: Math.min(window.devicePixelRatio, 2) },
    },
    vertexShader: /* glsl */ `
      attribute float aPhase; attribute float aSize; attribute float aHue;
      uniform float uTime; uniform float uPR; uniform float uGlow;
      varying float vBlink; varying float vHue;
      void main(){
        vec3 p = position;
        p.x += sin(uTime*0.3 + aPhase) * 0.6;
        p.y += sin(uTime*0.22 + aPhase*1.7) * 0.5;
        p.z += cos(uTime*0.25 + aPhase) * 0.4;
        vec4 mv = modelViewMatrix * vec4(p,1.0);
        float b = 0.5 + 0.5*sin(uTime*(0.9 + fract(aPhase)*1.6) + aPhase);
        vBlink = pow(b, 3.0);
        vHue = aHue;
        gl_PointSize = aSize * uPR * (40.0 + 30.0*uGlow) * (0.4 + vBlink) / -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uGlow; varying float vBlink; varying float vHue;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        a = a*a*0.8 + smoothstep(0.12, 0.0, d);
        vec3 gold = vec3(1.0, 0.82, 0.45);
        vec3 pink = vec3(1.0, 0.55, 0.75);
        vec3 col = mix(gold, pink, step(0.72, vHue));
        gl_FragColor = vec4(col, a * vBlink * (0.55 + 0.6*uGlow));
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
    state.current.burst = performance.now()
  }, [burst])

  useEffect(() => {
    const canvas = canvasRef.current
    const isMobile = window.innerWidth < 760
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.75 : 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.outputColorSpace = THREE.SRGBColorSpace

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x12081f, 0.045)
    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.set(0, 0, 10)

    const ambient = new THREE.AmbientLight(0xffe2f0, 0.5)
    const key = new THREE.PointLight(0xffc98a, 40, 30, 1.6)
    const rim = new THREE.PointLight(0xff6fa8, 30, 30, 1.6)
    scene.add(ambient, key, rim)

    const PAGE_DEPTH = 46 // world units the camera travels over the full scroll

    /* roses along the page */
    const roseColors = [0xb3123a, 0xf7b6c8, 0xfff1ea, 0xe8606f, 0xf2a37d, 0x8e0f2e, 0xffd3df]
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
      r.rotation.set(0.9 + Math.random() * 0.5, Math.random() * 6, (x > 0 ? -0.4 : 0.4))
      const s = (isMobile ? 0.6 : 0.75) + Math.random() * 0.25
      r.scale.setScalar(s)
      r.userData = { base: r.position.clone(), seed: Math.random() * 10, bloom: 0, s }
      scene.add(r)
      roses.push(r)
    })

    /* interlocked gold rings + diamond */
    const rings = new THREE.Group()
    const gold = new THREE.MeshStandardMaterial({ color: 0xffc46b, metalness: 1, roughness: 0.16 })
    const torus = new THREE.TorusGeometry(1, 0.1, 40, 120)
    const r1 = new THREE.Mesh(torus, gold)
    const r2 = new THREE.Mesh(torus, gold)
    r1.position.x = -0.55
    r2.position.x = 0.55
    r2.rotation.y = Math.PI / 2.4
    const diamond = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.28, 0),
      new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.2, roughness: 0, emissive: 0xbfe6ff, emissiveIntensity: 0.6 })
    )
    diamond.scale.y = 1.25
    diamond.position.set(-0.55, 1.28, 0)
    rings.add(r1, r2, diamond)
    rings.position.set(0, -12.2, 0.5)
    rings.scale.setScalar(isMobile ? 0.62 : 0.8)
    scene.add(rings)
    const ringGlow = new THREE.PointLight(0xffd59a, 25, 8, 1.5)
    ringGlow.position.set(0, -11.5, 3)
    scene.add(ringGlow)

    /* falling petals */
    const PETALS = isMobile ? 70 : 140
    const petalGeo = petalGeometry(0.6, 0.25)
    petalGeo.scale(0.16, 0.16, 0.16)
    const petalMat = new THREE.MeshStandardMaterial({ roughness: 0.55, side: THREE.DoubleSide, emissive: 0x401020, emissiveIntensity: 0.4 })
    const petals = new THREE.InstancedMesh(petalGeo, petalMat, PETALS)
    const petalData = []
    const pc = [0xff9ab8, 0xffd6e0, 0xe0435f, 0xfff4ec, 0xf7b267]
    const col = new THREE.Color()
    for (let i = 0; i < PETALS; i++) {
      petalData.push({
        x: (Math.random() - 0.5) * 14,
        y: Math.random() * 14 - 7,
        z: (Math.random() - 0.5) * 8,
        vy: 0.35 + Math.random() * 0.6,
        sway: Math.random() * 6,
        rx: Math.random() * 6, ry: Math.random() * 6, rz: Math.random() * 6,
        sr: 0.5 + Math.random() * 1.5,
        burstV: new THREE.Vector3(),
      })
      petals.setColorAt(i, col.set(pc[i % pc.length]))
    }
    scene.add(petals)

    /* butterflies */
    const bColors = [
      ['#ff7ac6', '#7b5cff'], ['#66e7ff', '#a26bff'], ['#ffd27a', '#ff6f91'],
      ['#ffffff', '#ff9ad5'], ['#7affd2', '#4aa8ff'], ['#ffb86b', '#ff4f8b'],
    ]
    const butterflies = []
    const BCOUNT = isMobile ? 8 : 12
    for (let i = 0; i < BCOUNT; i++) {
      const [a, b] = bColors[i % bColors.length]
      const bf = makeButterfly(a, b)
      bf.scale.setScalar(0.6 + Math.random() * 0.45)
      bf.userData.path = {
        cy: 2 - (i / BCOUNT) * 48,
        ax: 2.5 + Math.random() * 3, ay: 1 + Math.random() * 2, az: 1.5 + Math.random() * 2,
        fa: 0.12 + Math.random() * 0.12, fb: 0.17 + Math.random() * 0.15, fc: 0.1 + Math.random() * 0.1,
        seed: Math.random() * 100, flap: 9 + Math.random() * 6,
      }
      scene.add(bf)
      butterflies.push(bf)
    }

    /* fireflies */
    const flies = makeFireflies(isMobile ? 260 : 480, 8, -52)
    scene.add(flies)

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
    const dummy = new THREE.Object3D()
    const tmp = new THREE.Vector3()
    let camY = 0
    let glow = 1
    let raf

    const tick = () => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(clock.getDelta(), 0.05)
      const t = clock.elapsedTime
      const s = state.current

      // scroll -> camera depth
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const targetY = -(window.scrollY / max) * PAGE_DEPTH
      camY += (targetY - camY) * Math.min(1, dt * 4)
      pointer.x += (pointer.tx - pointer.x) * dt * 2.5
      pointer.y += (pointer.ty - pointer.y) * dt * 2.5
      camera.position.set(pointer.x * 0.8, camY - pointer.y * 0.5, 10)
      camera.lookAt(0, camY, 0)

      // lights breathe; "lights off" mode dims the room so the glow takes over
      const targetGlow = s.lightsOff ? 1.7 : 1
      glow += (targetGlow - glow) * dt * 2
      const dim = s.lightsOff ? 0.18 : 1
      const breath = 0.78 + 0.22 * Math.sin(t * 0.7)
      ambient.intensity += (0.55 * dim * breath - ambient.intensity) * dt * 3
      key.intensity += (45 * dim * breath - key.intensity) * dt * 3
      rim.intensity += ((s.lightsOff ? 14 : 30) * (1.2 - breath * 0.4) - rim.intensity) * dt * 3
      key.position.set(4 * Math.sin(t * 0.4), camY + 3, 5)
      rim.position.set(-4 * Math.cos(t * 0.33), camY - 2, 4)
      flies.material.uniforms.uTime.value = t
      flies.material.uniforms.uGlow.value = glow
      ringGlow.intensity = (s.lightsOff ? 45 : 22) * (0.7 + 0.3 * Math.sin(t * 2.2))

      // burst after opening
      const since = (performance.now() - s.burst) / 1000
      const bursting = s.burst && since < 4

      // roses: bloom in when near, float + slow spin
      roses.forEach((r) => {
        const d = r.userData
        const near = Math.abs(d.base.y - camY) < 9 ? 1 : 0
        d.bloom += (near - d.bloom) * dt * 1.5
        r.position.y = d.base.y + Math.sin(t * 0.6 + d.seed) * 0.2
        r.rotation.y += dt * 0.12
        r.scale.setScalar(d.s * (0.25 + 0.75 * d.bloom))
      })

      // keep the rings pinned to their section in the page
      if (anchor) {
        const r = anchor.getBoundingClientRect()
        const cy = r.top + r.height / 2
        const visH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (10 - rings.position.z)
        rings.position.y = camera.position.y - ((cy - window.innerHeight / 2) / window.innerHeight) * visH
        ringGlow.position.y = rings.position.y + 0.7
      }
      rings.rotation.y = t * 0.45
      rings.rotation.x = Math.sin(t * 0.5) * 0.25
      diamond.rotation.y = -t * 1.5

      // petals
      for (let i = 0; i < PETALS; i++) {
        const p = petalData[i]
        if (bursting && since < 0.05 && p.burstV.lengthSq() === 0) {
          p.x = (Math.random() - 0.5) * 1
          p.y = camY + (Math.random() - 0.5) * 1
          p.z = 2
          p.burstV.set((Math.random() - 0.5) * 16, (Math.random() - 0.2) * 12, (Math.random() - 0.5) * 6)
        }
        p.x += p.burstV.x * dt
        p.y += p.burstV.y * dt
        p.z += p.burstV.z * dt
        p.burstV.multiplyScalar(1 - dt * 1.4)
        if (p.burstV.lengthSq() < 0.01) p.burstV.set(0, 0, 0)
        p.y -= p.vy * dt
        p.x += Math.sin(t * 0.8 + p.sway) * dt * 0.4
        if (p.y < camY - 7) { p.y = camY + 7; p.x = (Math.random() - 0.5) * 14 }
        if (p.y > camY + 8) p.y = camY - 6
        dummy.position.set(p.x, p.y, p.z)
        dummy.rotation.set(p.rx + t * p.sr, p.ry + t * p.sr * 0.7, p.rz + t * 0.3)
        dummy.updateMatrix()
        petals.setMatrixAt(i, dummy.matrix)
      }
      petals.instanceMatrix.needsUpdate = true

      // butterflies
      butterflies.forEach((bf) => {
        const P = bf.userData.path
        const tt = t + P.seed
        const pos = (time, out) =>
          out.set(
            Math.sin(time * P.fa * 2) * P.ax,
            P.cy + Math.sin(time * P.fb * 2) * P.ay,
            Math.cos(time * P.fc * 2) * P.az
          )
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
