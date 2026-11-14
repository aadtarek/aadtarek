import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { petalGeo, leafGeo, roseMaterial } from './Scene3D.jsx'
import { WEDDING as W } from '../config'

/*
  The opening:
  1. A closed burgundy rose bud floats in a dark velvet room, a galaxy of gold particles orbiting it.
  2. Tap → the rose blooms open petal by petal (outer first), a shockwave hits,
     and thousands of particles fly in and assemble the couple's names in glowing gold.
  3. The camera dives into the heart of the rose, particles blast past, and the site opens from inside it.
*/

const clamp01 = (x) => Math.min(1, Math.max(0, x))
const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3)
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const easeOutBack = (x) => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2)
const easeIn = (x) => x * x * x

const ROSE_Y = -0.7

function buildBloomRose() {
  const geos = [
    petalGeo({ cup: 2.4, curl: 0.04, ruffle: 0.01 }),
    petalGeo({ cup: 1.4, curl: 0.25, ruffle: 0.03, seed: 2 }),
    petalGeo({ cup: 0.8, curl: 0.55, ruffle: 0.05, seed: 5 }),
  ]
  const mat = roseMaterial(0x6a0a1e)
  mat.sheenColor = new THREE.Color(0xc0405e)
  mat.emissive = new THREE.Color(0x3a0510)
  mat.emissiveIntensity = 0.18
  const group = new THREE.Group()
  const petals = []
  const layers = [
    { n: 8, s: [0.3, 0.46], rx: [-0.1, 0.12], r: [0.0, 0.03], g: 0, layer: 2 },
    { n: 12, s: [0.55, 0.86], rx: [0.2, 0.78], r: [0.04, 0.13], g: 1, layer: 1 },
    { n: 14, s: [0.9, 1.18], rx: [0.95, 1.42], r: [0.13, 0.22], g: 2, layer: 0 },
  ]
  let k = 0
  layers.forEach((L) => {
    for (let j = 0; j < L.n; j++) {
      const t = j / (L.n - 1)
      const pivot = new THREE.Object3D()
      pivot.rotation.y = k * 2.39996
      k++
      const m = new THREE.Mesh(geos[L.g], mat)
      const s = THREE.MathUtils.lerp(L.s[0], L.s[1], t)
      const open = THREE.MathUtils.lerp(L.rx[0], L.rx[1], t)
      m.userData = {
        s, open, closed: -0.12 + L.layer * 0.06, r: THREE.MathUtils.lerp(L.r[0], L.r[1], t),
        delay: L.layer === 0 ? 0 : L.layer === 1 ? 0.18 : 0.34, jitter: (Math.random() - 0.5) * 0.08,
      }
      pivot.add(m)
      group.add(pivot)
      petals.push(m)
    }
  })
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x2c5a2e, roughness: 0.5, vertexColors: true, side: THREE.DoubleSide })
  const leaves = []
  for (let i = 0; i < 5; i++) {
    const pivot = new THREE.Object3D()
    pivot.rotation.y = (i / 5) * Math.PI * 2 + 0.3
    const l = new THREE.Mesh(leafGeo(), leafMat)
    l.scale.set(0.75, 0.95, 0.75)
    l.position.z = 0.22
    l.position.y = -0.05
    pivot.add(l)
    group.add(pivot)
    leaves.push(l)
  }
  const setBloom = (b) => {
    petals.forEach((m) => {
      const u = m.userData
      const local = easeOutBack(clamp01((b - u.delay) / (1 - u.delay)))
      m.rotation.x = THREE.MathUtils.lerp(u.closed, u.open, local) + u.jitter
      const sc = u.s * (0.62 + 0.38 * Math.min(1, local))
      m.scale.set(sc, sc, sc)
      m.position.z = THREE.MathUtils.lerp(0.01, u.r, local)
    })
    leaves.forEach((l) => (l.rotation.x = THREE.MathUtils.lerp(0.55, 1.95, clamp01(b))))
  }
  setBloom(0)
  return { group, setBloom }
}

function textPoints(lines, count, worldW, centerY) {
  const cv = document.createElement('canvas')
  const W_ = 1200
  const lineH = 260
  const H_ = lineH * lines.length + 40
  cv.width = W_
  cv.height = H_
  const ctx = cv.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  let size = 230
  ctx.font = `${size}px "Great Vibes", cursive`
  const widest = Math.max(...lines.map((l) => ctx.measureText(l).width))
  if (widest > W_ * 0.94) size = Math.floor((size * W_ * 0.94) / widest)
  ctx.font = `${size}px "Great Vibes", cursive`
  lines.forEach((l, i) => ctx.fillText(l, W_ / 2, 20 + lineH * (i + 0.5)))
  const data = ctx.getImageData(0, 0, W_, H_).data
  const pts = []
  for (let y = 0; y < H_; y += 3) {
    for (let x = 0; x < W_; x += 3) {
      if (data[(y * W_ + x) * 4 + 3] > 140) pts.push([x, y])
    }
  }
  const scale = worldW / W_
  const out = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const p = pts.length ? pts[(Math.random() * pts.length) | 0] : [W_ / 2, H_ / 2]
    out[i * 3] = (p[0] - W_ / 2) * scale + (Math.random() - 0.5) * scale * 2
    out[i * 3 + 1] = -(p[1] - H_ / 2) * scale + centerY
    out[i * 3 + 2] = (Math.random() - 0.5) * 0.12
  }
  return out
}

export default function IntroScene({ onOpen, onDone }) {
  const wrap = useRef(null)
  const canvas = useRef(null)
  const go = useRef(null)
  const [stage, setStage] = useState('idle') // idle -> playing -> whiteout -> gone

  useEffect(() => {
    let disposed = false
    const isMobile = innerWidth < 760
    const renderer = new THREE.WebGLRenderer({ canvas: canvas.current, antialias: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.5 : 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    renderer.outputColorSpace = THREE.SRGBColorSpace

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x14030a)
    scene.fog = new THREE.FogExp2(0x14030a, 0.035)
    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environmentIntensity = 0.45

    const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 100)
    camera.position.set(0, 0.6, 9)

    scene.add(new THREE.AmbientLight(0xffe1e6, 0.35))
    const key = new THREE.PointLight(0xffe2c0, 30, 20, 1.5)
    key.position.set(2.5, 3, 4)
    const rim = new THREE.PointLight(0xff5c8a, 45, 20, 1.5)
    rim.position.set(-3, 1, -2)
    const core = new THREE.PointLight(0xffc77a, 0, 6, 1.5)
    core.position.set(0, ROSE_Y + 0.5, 0.6)
    scene.add(key, rim, core)

    // soft glow halo behind the rose
    const haloTex = (() => {
      const c = document.createElement('canvas')
      c.width = c.height = 256
      const g = c.getContext('2d')
      const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128)
      gr.addColorStop(0, 'rgba(255,150,120,0.55)')
      gr.addColorStop(0.35, 'rgba(200,50,90,0.35)')
      gr.addColorStop(1, 'rgba(0,0,0,0)')
      g.fillStyle = gr
      g.fillRect(0, 0, 256, 256)
      return new THREE.CanvasTexture(c)
    })()
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }))
    halo.position.set(0, ROSE_Y + 0.2, -1.5)
    halo.scale.setScalar(7)
    scene.add(halo)

    // the rose
    const rose = buildBloomRose()
    rose.group.position.set(0, ROSE_Y, 0)
    rose.group.rotation.x = 0.55
    rose.group.scale.setScalar(isMobile ? 1.05 : 1.3)
    scene.add(rose.group)

    // particles: galaxy → names
    const N = isMobile ? 3400 : 5200
    const visW = () => 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 9 * camera.aspect
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array(N * 3)
    const rnd = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) rnd.set([Math.random(), Math.random(), Math.random()], i * 3)
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('aRand', new THREE.BufferAttribute(rnd, 3))
    geo.setAttribute('aTarget', new THREE.BufferAttribute(new Float32Array(N * 3), 3))
    const pMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uMorph: { value: 0 }, uExplode: { value: 0 }, uPR: { value: renderer.getPixelRatio() }, uSize: { value: isMobile ? 26 : 30 }, uRoseY: { value: ROSE_Y } },
      vertexShader: /* glsl */ `
        attribute vec3 aRand; attribute vec3 aTarget;
        uniform float uTime, uMorph, uExplode, uPR, uSize, uRoseY;
        varying float vA; varying float vTw; varying float vHot;
        void main(){
          float ang = aRand.y*6.2831 + uTime*(0.15 + aRand.z*0.35) * (aRand.x > 0.5 ? 1.0 : -0.7);
          float r = 1.5 + pow(aRand.x, 0.7)*3.6;
          vec3 g = vec3(cos(ang)*r, uRoseY + 0.3 + sin(ang*2.0 + aRand.x*10.0)*0.25 + (aRand.z-0.5)*1.4*aRand.x, sin(ang)*r*0.6);
          float m = smoothstep(0.0, 1.0, clamp(uMorph*1.3 - aRand.z*0.3, 0.0, 1.0));
          vec3 swirl = vec3(sin(uTime*2.0+aRand.y*30.0), cos(uTime*1.7+aRand.x*30.0), 0.0)*0.015;
          vec3 p = mix(g, aTarget + swirl, m);
          vec3 dir = normalize(p - vec3(0.0, uRoseY, 0.0) + (aRand-0.5)*0.6);
          p += dir * uExplode * (5.0 + aRand.x*12.0);
          p.z += uExplode * 6.0 * aRand.y;
          vec4 mv = modelViewMatrix*vec4(p,1.0);
          vTw = 0.55 + 0.45*sin(uTime*(2.0+aRand.z*3.0) + aRand.y*40.0);
          vHot = m;
          gl_PointSize = uSize*uPR*(0.45+aRand.z*0.9)*(1.0 - m*0.1) / -mv.z;
          gl_Position = projectionMatrix*mv;
          vA = 1.0 - smoothstep(0.4, 1.0, uExplode);
        }`,
      fragmentShader: /* glsl */ `
        varying float vA; varying float vTw; varying float vHot;
        void main(){
          float d = length(gl_PointCoord-0.5);
          float a = smoothstep(0.5, 0.0, d);
          vec3 gold = vec3(1.0, 0.72, 0.32);
          vec3 col = mix(gold, vec3(1.0, 0.95, 0.85), smoothstep(0.22, 0.0, d));
          col = mix(col, vec3(1.0, 0.85, 0.55), vHot*0.5);
          gl_FragColor = vec4(col * (0.6 + vTw*0.7), a*a*vA);
        }`,
    })
    const points = new THREE.Points(geo, pMat)
    points.frustumCulled = false
    scene.add(points)

    // distant dust
    const dGeo = new THREE.BufferGeometry()
    const dp = new Float32Array(600 * 3)
    for (let i = 0; i < 600; i++) dp.set([(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 20, -5 - Math.random() * 15], i * 3)
    dGeo.setAttribute('position', new THREE.BufferAttribute(dp, 3))
    const dust = new THREE.Points(dGeo, new THREE.PointsMaterial({ color: 0xffc7a0, size: 0.05, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }))
    scene.add(dust)

    // post-processing: real bloom glow
    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.55, 0.6, 0.55)
    composer.addPass(bloom)
    composer.addPass(new OutputPass())

    let textReady = false
    const buildText = () => {
      const portrait = innerHeight > innerWidth
      const lines = portrait ? [W.groom, `& ${W.bride}`] : [`${W.groom} & ${W.bride}`]
      const worldW = Math.min(portrait ? 4.6 : 8.5, visW() * 0.9)
      const target = textPoints(lines, N, worldW, portrait ? 2.25 : 2.0)
      geo.attributes.aTarget.array.set(target)
      geo.attributes.aTarget.needsUpdate = true
      textReady = true
    }

    const resize = () => {
      const w = innerWidth, h = innerHeight
      renderer.setSize(w, h, false)
      composer.setSize(w, h)
      camera.aspect = w / h
      camera.fov = w < h ? 62 : 50
      camera.updateProjectionMatrix()
      if (textReady) buildText()
    }
    resize()
    addEventListener('resize', resize)
    ;(document.fonts?.load('100px "Great Vibes"') || Promise.resolve()).then(() => !disposed && buildText()).catch(buildText)

    let pointer = { x: 0, y: 0 }
    const onMove = (e) => {
      pointer = { x: (e.clientX / innerWidth) * 2 - 1, y: (e.clientY / innerHeight) * 2 - 1 }
    }
    addEventListener('pointermove', onMove)

    let tapAt = -1
    const clock = new THREE.Clock()
    go.current = () => {
      if (tapAt >= 0) return
      if (!textReady) buildText()
      tapAt = clock.elapsedTime
    }

    let raf
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const t = clock.getElapsedTime()
      const T = window.__introT != null ? window.__introT : tapAt < 0 ? -1 : t - tapAt

      const b = T < 0 ? 0.04 + 0.03 * Math.sin(t * 1.6) : 0.07 + 0.93 * easeOutCubic(clamp01(T / 2.2))
      rose.setBloom(b)
      rose.group.rotation.y = t * 0.25 + (T > 0 ? easeOutCubic(clamp01(T / 2)) * 2.5 : 0)
      rose.group.position.y = ROSE_Y + Math.sin(t * 1.2) * 0.06

      const morph = T < 0 ? 0 : easeInOut(clamp01((T - 0.35) / 1.7))
      const explode = T < 0 ? 0 : easeIn(clamp01((T - 3.3) / 1.2))
      pMat.uniforms.uTime.value = t
      pMat.uniforms.uMorph.value = morph
      pMat.uniforms.uExplode.value = explode

      const pulse = 0.5 + 0.5 * Math.sin(t * 2.2)
      const flash = T < 0 ? 0 : Math.max(0, 1 - T / 0.6)
      core.intensity = (T < 0 ? 1.5 + pulse * 1.5 : 6 * easeOutCubic(clamp01(T / 1.5))) + flash * 25
      halo.material.opacity = 0.3 + pulse * 0.15 + flash * 0.6
      halo.scale.setScalar(6 + pulse * 0.5 + flash * 5)
      bloom.strength = 0.55 + flash * 1.2 + explode * 1.2

      // camera: gentle parallax, then a dive into the heart of the rose
      const dive = T < 0 ? 0 : easeIn(clamp01((T - 3.2) / 1.35))
      const shake = flash * 0.08
      camera.position.x = pointer.x * 0.4 * (1 - dive) + (Math.random() - 0.5) * shake
      camera.position.y = THREE.MathUtils.lerp(0.6 - pointer.y * 0.3, ROSE_Y + 0.35, dive) + (Math.random() - 0.5) * shake
      camera.position.z = THREE.MathUtils.lerp(9, 0.35, dive)
      camera.fov = THREE.MathUtils.lerp(innerWidth < innerHeight ? 62 : 50, 95, dive)
      camera.updateProjectionMatrix()
      camera.lookAt(0, THREE.MathUtils.lerp(0.5, ROSE_Y, dive), 0)
      dust.rotation.y = t * 0.02

      composer.render()
    }
    tick()

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      removeEventListener('resize', resize)
      removeEventListener('pointermove', onMove)
      composer.dispose?.()
      renderer.dispose()
      pmrem.dispose()
    }
  }, [])

  const start = () => {
    if (stage !== 'idle') return
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission) {
        DeviceOrientationEvent.requestPermission().catch(() => {})
      }
    } catch {}
    navigator.vibrate?.([20, 60, 40])
    go.current?.()
    setStage('playing')
    onOpen()
    setTimeout(() => window.dispatchEvent(new Event('celebrate')), 450)
    setTimeout(() => setStage('whiteout'), 4150)
    setTimeout(() => setStage('whiteout fade'), 5000)
    setTimeout(() => { setStage('gone'); onDone?.() }, 6000)
  }

  if (stage === 'gone') return null
  return (
    <div ref={wrap} className={`intro3d stage-${stage}`} onClick={start} role="button" aria-label="Open invitation">
      <canvas ref={canvas} className="intro3d-canvas" />
      <div className="intro3d-ui">
        <p className="i3-kicker">You are invited</p>
        <p className="i3-sub">to the wedding of</p>
        <div className="i3-reveal">
          <span className="i3-line" />
          <p>are getting married</p>
          <b>26 · 12 · 2026</b>
        </div>
        <div className="i3-tap">
          <span className="i3-ring" />
          <span className="i3-ring r2" />
          <span>Tap the rose to open</span>
        </div>
      </div>
      <div className="intro3d-white" />
    </div>
  )
}
