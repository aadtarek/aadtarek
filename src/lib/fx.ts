/**
 * Small interaction effects: ripple and magnetic buttons, fly-to-cart with a
 * perfume mist, heart bursts, confetti and a light haptic tap. Plain DOM and
 * CSS (no libraries); everything is skipped for visitors who ask for reduced motion.
 */

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches

/** A short vibration on phones that support it (Android; iOS ignores it). */
export function haptic(pattern: number | number[] = 12) {
  if (reduced()) return
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* not supported */
  }
}

function layer(): HTMLElement {
  let el = document.getElementById('rf-fx-layer')
  if (!el) {
    el = document.createElement('div')
    el.id = 'rf-fx-layer'
    el.setAttribute('aria-hidden', 'true')
    document.body.appendChild(el)
  }
  return el
}

const rand = (min: number, max: number) => min + Math.random() * (max - min)

/** The visible cart button: the tab bar's on phones (when shown), otherwise the header's. */
function cartTarget(): HTMLElement | null {
  const onScreen = (el: HTMLElement) => {
    const r = el.getBoundingClientRect()
    return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight
  }
  const all = Array.from(document.querySelectorAll<HTMLElement>('[data-cart-target]')).filter(onScreen)
  return all.find((el) => el.closest('.rf-tabbar')) ?? all[0] ?? null
}

/** Makes the cart buttons bounce and their count pop. */
export function bumpCart() {
  document.querySelectorAll<HTMLElement>('[data-cart-target]').forEach((el) => {
    el.classList.remove('rf-cart-bump')
    void el.offsetWidth
    el.classList.add('rf-cart-bump')
  })
}

/** A soft spray of fine droplets rising from a point, like a spritz of perfume. */
export function mist(x: number, y: number, count = 16) {
  if (reduced()) return
  const host = layer()
  for (let i = 0; i < count; i++) {
    const d = document.createElement('span')
    d.className = 'rf-mist'
    const size = rand(4, 11)
    d.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px;--dx:${rand(-46, 46)}px;--dy:${rand(-90, -36)}px;--d:${rand(650, 1100)}ms;animation-delay:${rand(0, 90)}ms`
    host.appendChild(d)
    d.addEventListener('animationend', () => d.remove(), { once: true })
  }
}

/**
 * The product image flies from the button to the cart, the cart bounces, and a
 * mist rises from the button. Resolves when the flight lands.
 */
export function flyToCart(from: HTMLElement | null, image?: string): Promise<void> {
  haptic(14)
  if (!from || reduced()) {
    bumpCart()
    return Promise.resolve()
  }
  const start = from.getBoundingClientRect()
  mist(start.left + start.width / 2, start.top + start.height / 2)
  const target = cartTarget()
  if (!target || !image) {
    bumpCart()
    return Promise.resolve()
  }
  const end = target.getBoundingClientRect()
  const img = document.createElement('img')
  img.src = image
  img.alt = ''
  img.className = 'rf-fly'
  const size = 64
  const x0 = start.left + start.width / 2 - size / 2
  const y0 = start.top + start.height / 2 - size / 2
  const x1 = end.left + end.width / 2 - size / 2
  const y1 = end.top + end.height / 2 - size / 2
  img.style.cssText = `left:${x0}px;top:${y0}px;width:${size}px;height:${size}px`
  layer().appendChild(img)
  const lift = Math.min(160, Math.abs(y1 - y0) * 0.5 + 60)
  const flight = img.animate(
    [
      { transform: 'translate(0,0) scale(1)', opacity: 1, offset: 0 },
      { transform: `translate(${(x1 - x0) * 0.45}px, ${Math.min(y0, y1) - y0 - lift}px) scale(0.85)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${x1 - x0}px, ${y1 - y0}px) scale(0.18)`, opacity: 0.35, offset: 1 },
    ],
    { duration: 720, easing: 'cubic-bezier(.45,.05,.35,1)' },
  )
  return new Promise((resolve) => {
    const done = () => {
      img.remove()
      bumpCart()
      resolve()
    }
    flight.onfinish = done
    flight.oncancel = done
  })
}

/** Little hearts bursting out of a button (wishlist). */
export function heartBurst(from: HTMLElement | null) {
  haptic(10)
  if (!from || reduced()) return
  const r = from.getBoundingClientRect()
  const host = layer()
  const x = r.left + r.width / 2
  const y = r.top + r.height / 2
  for (let i = 0; i < 9; i++) {
    const h = document.createElement('span')
    h.className = 'rf-heart'
    const angle = (Math.PI * 2 * i) / 9 + rand(-0.25, 0.25)
    const dist = rand(26, 46)
    h.style.cssText = `left:${x}px;top:${y}px;--dx:${Math.cos(angle) * dist}px;--dy:${Math.sin(angle) * dist - 10}px;--s:${rand(0.55, 1)};--d:${rand(600, 900)}ms`
    h.innerHTML =
      '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 4.3 2.4.7-1.2 2.2-2.4 4.3-2.4 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z"/></svg>'
    host.appendChild(h)
    h.addEventListener('animationend', () => h.remove(), { once: true })
  }
}

/** Gold and cream confetti falling from the top of the screen. */
export function confetti(amount = 90) {
  if (reduced()) return
  const canvas = document.createElement('canvas')
  canvas.className = 'rf-confetti'
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const w = window.innerWidth
  const h = window.innerHeight
  canvas.width = w * dpr
  canvas.height = h * dpr
  layer().appendChild(canvas)
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas.remove()
  ctx.scale(dpr, dpr)
  const colors = ['#c9a466', '#8a6a33', '#e8d3a6', '#f4ead6', '#b08d57', '#ffffff']
  const pieces = Array.from({ length: amount }, () => ({
    x: rand(0, w),
    y: rand(-h * 0.5, -10),
    vx: rand(-1.2, 1.2),
    vy: rand(1.6, 3.6),
    r: rand(0, Math.PI * 2),
    vr: rand(-0.12, 0.12),
    sw: rand(5, 9),
    sh: rand(8, 15),
    c: colors[Math.floor(rand(0, colors.length))],
    wob: rand(0, Math.PI * 2),
  }))
  const started = performance.now()
  const frame = (now: number) => {
    const t = now - started
    ctx.clearRect(0, 0, w, h)
    for (const p of pieces) {
      p.wob += 0.06
      p.x += p.vx + Math.sin(p.wob) * 0.6
      p.y += p.vy
      p.r += p.vr
      ctx.save()
      ctx.globalAlpha = Math.max(0, 1 - Math.max(0, t - 2200) / 900)
      ctx.translate(p.x, p.y)
      ctx.rotate(p.r)
      ctx.fillStyle = p.c
      ctx.fillRect(-p.sw / 2, -p.sh / 2, p.sw, p.sh * Math.abs(Math.cos(p.wob)))
      ctx.restore()
    }
    if (t < 3100) requestAnimationFrame(frame)
    else canvas.remove()
  }
  requestAnimationFrame(frame)
}

// ---------------------------------------------------------------- global: ripple + magnetic

/** Buttons and button-like links that get a ripple (text buttons, not icon buttons). */
const RIPPLE = 'button.rounded-full, a.rounded-full, button.rounded-xl, button.rounded-2xl'

function ripple(e: PointerEvent) {
  const el = (e.target as Element | null)?.closest<HTMLElement>(RIPPLE)
  if (!el || el.hasAttribute('disabled') || el.offsetHeight < 30 || el.offsetWidth < 56) return
  const r = el.getBoundingClientRect()
  const size = Math.max(r.width, r.height) * 2.2
  const wave = document.createElement('span')
  wave.className = 'rf-ripple'
  wave.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`
  if (getComputedStyle(el).position === 'static') el.style.position = 'relative'
  el.classList.add('rf-rippling')
  el.appendChild(wave)
  wave.addEventListener(
    'animationend',
    () => {
      wave.remove()
      if (!el.querySelector('.rf-ripple')) el.classList.remove('rf-rippling')
    },
    { once: true },
  )
}

/** Main buttons lean towards the pointer a little (desktop). */
function magnetic(e: PointerEvent) {
  const el = (e.target as Element | null)?.closest<HTMLElement>('.rf-magnetic')
  document.querySelectorAll<HTMLElement>('.rf-magnetic.rf-pulled').forEach((other) => {
    if (other !== el) {
      other.classList.remove('rf-pulled')
      other.style.removeProperty('--mx')
      other.style.removeProperty('--my')
    }
  })
  if (!el) return
  const r = el.getBoundingClientRect()
  const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2)
  const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2)
  el.classList.add('rf-pulled')
  el.style.setProperty('--mx', `${(dx * 6).toFixed(1)}px`)
  el.style.setProperty('--my', `${(dy * 4).toFixed(1)}px`)
}

let installed = false

/** Installs the page-wide effects once (called from main.tsx). */
export function installFx() {
  if (installed || typeof document === 'undefined') return
  installed = true
  document.addEventListener(
    'pointerdown',
    (e) => {
      if (!reduced()) ripple(e)
    },
    { passive: true },
  )
  document.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType === 'mouse' && finePointer() && !reduced()) magnetic(e)
    },
    { passive: true },
  )
}
