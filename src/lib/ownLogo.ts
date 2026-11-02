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
  if (!src || typeof document === 'undefined') return publish('')
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
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return publish('')
      ctx.drawImage(img, 0, 0)
      const data = ctx.getImageData(0, 0, w, h).data
      const empty = (i: number) => data[i + 3] < 12 || (data[i] > 246 && data[i + 1] > 246 && data[i + 2] > 246)
      let top = h
      let bottom = -1
      let left = w
      let right = -1
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (empty((y * w + x) * 4)) continue
          if (y < top) top = y
          if (y > bottom) bottom = y
          if (x < left) left = x
          if (x > right) right = x
        }
      }
      if (bottom < 0) return publish('')
      const pad = Math.round(Math.max(right - left, bottom - top) * 0.01)
      left = Math.max(0, left - pad)
      top = Math.max(0, top - pad)
      right = Math.min(w - 1, right + pad)
      bottom = Math.min(h - 1, bottom + pad)
      const cw = right - left + 1
      const ch = bottom - top + 1
      // Nothing worth cutting: keep the original file.
      if (cw * ch > w * h * 0.92) return publish('')
      const out = document.createElement('canvas')
      out.width = cw
      out.height = ch
      out.getContext('2d')?.drawImage(canvas, left, top, cw, ch, 0, 0, cw, ch)
      const url = out.toDataURL('image/png')
      try {
        if (url.length < 900_000) localStorage.setItem(KEY, JSON.stringify({ src, url }))
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
