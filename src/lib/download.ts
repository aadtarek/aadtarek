export function downloadUrl(url: string, filename: string) {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

export function downloadBlob(data: BlobPart, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([data], { type }))
  downloadUrl(url, filename)
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

export function dataUrlToBytes(dataUrl: string): Uint8Array {
  const b64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

export const safeName = (s: string) => (s || 'design').replace(/[\\/:*?"<>|]+/g, '_').slice(0, 80)

/** Build a PDF where each page is one image. Sizes are in CSS pixels (96 dpi). */
export async function imagesToPdf(pages: { dataUrl: string; width: number; height: number }[]) {
  const { PDFDocument } = await import('pdf-lib')
  const pdf = await PDFDocument.create()
  for (const p of pages) {
    const bytes = dataUrlToBytes(p.dataUrl)
    const img = p.dataUrl.startsWith('data:image/png') ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes)
    const w = p.width * 0.75
    const h = p.height * 0.75
    const page = pdf.addPage([w, h])
    page.drawImage(img, { x: 0, y: 0, width: w, height: h })
  }
  return pdf.save()
}

export function readFileAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.onerror = () => reject(r.error)
    r.readAsDataURL(file)
  })
}

/** Downscale very large photos so designs stay light. */
export async function fileToImageDataUrl(file: Blob, maxSide = 2500): Promise<string> {
  const url = await readFileAsDataUrl(file)
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') return url
  const img = await loadImage(url)
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight))
  if (scale === 1) return url
  const c = document.createElement('canvas')
  c.width = Math.round(img.naturalWidth * scale)
  c.height = Math.round(img.naturalHeight * scale)
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
  return file.type === 'image/jpeg' ? c.toDataURL('image/jpeg', 0.9) : c.toDataURL('image/png')
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export function pickFiles(accept: string, multiple = false): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.multiple = multiple
    input.onchange = () => resolve(input.files ? [...input.files] : [])
    input.click()
  })
}
