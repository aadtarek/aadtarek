import { HOME } from '../config'

/**
 * Reads the dashboard logo once: its main colour becomes `--rf-logo-color` (used for
 * “Inspired by” on the product cards), and a mostly dark logo is marked so it can be
 * shown light on dark backgrounds. Falls back quietly (gold) when it can't be read.
 */
export function readLogoColor() {
  const src = HOME.logo
  if (!src || typeof document === 'undefined') return
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.decoding = 'async'
  img.onload = () => {
    try {
      const size = 64
      const canvas = document.createElement('canvas')
      const ratio = img.naturalWidth / Math.max(1, img.naturalHeight)
      canvas.width = ratio >= 1 ? size : Math.max(1, Math.round(size * ratio))
      canvas.height = ratio >= 1 ? Math.max(1, Math.round(size / ratio)) : size
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
      let seen = 0
      let light = 0
      let r = 0
      let g = 0
      let b = 0
      let coloured = 0
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 140) continue
        const [pr, pg, pb] = [data[i], data[i + 1], data[i + 2]]
        // Skip a white / near-white background.
        if (pr > 242 && pg > 242 && pb > 242) continue
        seen++
        const max = Math.max(pr, pg, pb)
        const min = Math.min(pr, pg, pb)
        const luma = (0.299 * pr + 0.587 * pg + 0.114 * pb) / 255
        light += luma
        const saturation = max === 0 ? 0 : (max - min) / max
        if (saturation > 0.28 && luma > 0.18 && luma < 0.9) {
          coloured++
          r += pr
          g += pg
          b += pb
        }
      }
      if (!seen) return
      const root = document.documentElement
      if (light / seen < 0.45) root.setAttribute('data-logo-dark', '')
      if (coloured / seen > 0.03) root.style.setProperty('--rf-logo-color', `rgb(${Math.round(r / coloured)} ${Math.round(g / coloured)} ${Math.round(b / coloured)})`)
    } catch {
      /* a logo from another site can't be read; the defaults stay */
    }
  }
  img.src = src
}
