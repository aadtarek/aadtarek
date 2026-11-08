import { useSyncExternalStore } from 'react'
import { HOME } from '../config'

/**
 * The dashboard logo with its empty margins cut off, so it can be shown as large as the
 * space allows (a logo saved with wide transparent or white padding otherwise looks tiny).
 * The trimmed copy is remembered in the browser, so later visits show it from the first paint.
 */
const KEY = 'rfaheya.logoTrim'
const listeners = new Set<() => void>()
let trimmed = ''
let ready = false

function remembered(src: string) {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null') as { src?: string; url?: string } | null
    if (saved?.src === src && saved.url) return saved.url
  } catch {
    /* no storage */
  }
  return ''
}

// A trim from an earlier visit shows from the first paint.
if (HOME.logo && typeof window !== 'undefined') {
  trimmed = remembered(HOME.logo)
  ready = Boolean(trimmed)
}

function publish(url: string) {
  trimmed = url
  ready = true
  listeners.forEach((l) => l())
}

/** Cuts the transparent / white margins around the logo; keeps the original when it can't be read. */
export function trimOwnLogo() {
  const src = HOME.logo
  if (!src || typeof document === 'undefined' || HOME.logoReady) return publish('')
  const saved = remembered(src)
  if (saved) return publish(saved)
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.decoding = 'async'
  const give = window.setTimeout(() => !ready && publish(''), 1500)
  img.onerror = () => {
    window.clearTimeout(give)
    publish('')
  }
  img.onload = () => {
    window.clearTimeout(give)
    try {
      const w = img.naturalWidth
      const h = img.naturalHeight
      if (!w || !h) return publish('')
      // Look for the edges on a small copy (fast on any phone, whatever the file's size).
      const scale = Math.min(1, 480 / Math.max(w, h))
      const sw = Math.max(1, Math.round(w * scale))
      const sh = Math.max(1, Math.round(h * scale))
      const canvas = document.createElement('canvas')
      canvas.width = sw
      canvas.height = sh
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return publish('')
      ctx.drawImage(img, 0, 0, sw, sh)
      const data = ctx.getImageData(0, 0, sw, sh).data
      const empty = (i: number) => data[i + 3] < 12 || (data[i] > 246 && data[i + 1] > 246 && data[i + 2] > 246)
      let top = sh
      let bottom = -1
      let left = sw
      let right = -1
      for (let y = 0; y < sh; y++) {
        for (let x = 0; x < sw; x++) {
          if (empty((y * sw + x) * 4)) continue
          if (y < top) top = y
          if (y > bottom) bottom = y
          if (x < left) left = x
          if (x > right) right = x
        }
      }
      if (bottom < 0) return publish('')
      // Back to the full-size picture, with a hair of margin.
      const pad = 2
      const x0 = Math.max(0, (left - pad) / scale)
      const y0 = Math.max(0, (top - pad) / scale)
      const x1 = Math.min(w, (right + 1 + pad) / scale)
      const y1 = Math.min(h, (bottom + 1 + pad) / scale)
      const cw = x1 - x0
      const ch = y1 - y0
      // Nothing worth cutting: keep the original file.
      if (cw * ch > w * h * 0.92) return publish('')
      // Kept just big enough for the footer on a sharp screen (≈ 260 px tall), so it stays small.
      const k = Math.min(1, 260 / ch)
      const out = document.createElement('canvas')
      out.width = Math.max(1, Math.round(cw * k))
      out.height = Math.max(1, Math.round(ch * k))
      const octx = out.getContext('2d')
      if (!octx) return publish('')
      octx.imageSmoothingQuality = 'high'
      octx.drawImage(img, x0, y0, cw, ch, 0, 0, out.width, out.height)
      let url = out.toDataURL('image/webp', 0.92)
      if (!url.startsWith('data:image/webp')) url = out.toDataURL('image/png')
      try {
        if (url.length < 400_000) localStorage.setItem(KEY, JSON.stringify({ src, url }))
      } catch {
        /* full storage: trims again next visit */
      }
      publish(url)
    } catch {
      publish('')
    }
  }
  img.src = src
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

/** `{ src, ready }`: the logo to show (trimmed when possible), and whether the trim has finished. */
export function useOwnLogo() {
  const url = useSyncExternalStore(subscribe, () => trimmed)
  const done = useSyncExternalStore(subscribe, () => ready)
  return { src: url || HOME.logo, ready: done || !HOME.logo }
}
