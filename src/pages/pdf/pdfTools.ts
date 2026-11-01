import { degrees, PDFDocument } from 'pdf-lib'
import { GlobalWorkerOptions, getDocument, type PDFDocumentProxy } from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { dataUrlToBytes } from '../../lib/download'
import { renderPage } from '../../lib/fabricSetup'

GlobalWorkerOptions.workerSrc = workerUrl

export interface PdfPageState {
  src: number // index in the original document
  baseRotation: number
  extraRotation: number
  overlay: Record<string, unknown> | null
  deleted: boolean
}

export async function openPdf(bytes: Uint8Array) {
  // pdf.js may transfer the buffer to its worker, so give it a copy.
  const doc = await getDocument({ data: bytes.slice() }).promise
  const pages: PdfPageState[] = []
  for (let i = 0; i < doc.numPages; i++) {
    const p = await doc.getPage(i + 1)
    pages.push({ src: i, baseRotation: p.rotate, extraRotation: 0, overlay: null, deleted: false })
  }
  return { doc, pages }
}

/** Size (in PDF points) of a page as the user sees it. */
export async function viewSize(doc: PDFDocumentProxy, st: PdfPageState) {
  const p = await doc.getPage(st.src + 1)
  const vp = p.getViewport({ scale: 1, rotation: (st.baseRotation + st.extraRotation) % 360 })
  return { width: vp.width, height: vp.height }
}

export async function renderPdfPage(doc: PDFDocumentProxy, st: PdfPageState, scale: number) {
  const p = await doc.getPage(st.src + 1)
  const vp = p.getViewport({ scale, rotation: (st.baseRotation + st.extraRotation) % 360 })
  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(vp.width)
  canvas.height = Math.ceil(vp.height)
  await p.render({ canvas, canvasContext: canvas.getContext('2d')!, viewport: vp }).promise
  return canvas
}

const hasObjects = (o: Record<string, unknown> | null) => !!o && Array.isArray(o.objects) && o.objects.length > 0

/**
 * Writes a new PDF: original pages are kept as-is (text stays selectable), page
 * rotations / deletions are applied, and each page's additions are stamped on top
 * as a transparent high-resolution image (keeps Arabic text shaping perfect).
 */
export async function savePdf(original: Uint8Array, doc: PDFDocumentProxy, pages: PdfPageState[]) {
  const pdf = await PDFDocument.load(original, { ignoreEncryption: true })
  const out = await PDFDocument.create()
  const kept = pages.filter((p) => !p.deleted)
  const copied = await out.copyPages(
    pdf,
    kept.map((p) => p.src),
  )
  for (let i = 0; i < kept.length; i++) {
    const st = kept[i]
    const page = out.addPage(copied[i])
    const rot = (st.baseRotation + st.extraRotation) % 360
    if (st.extraRotation) page.setRotation(degrees(rot))
    if (!hasObjects(st.overlay)) continue
    const { width: vw, height: vh } = await viewSize(doc, st)
    const png = await renderPage(st.overlay, vw, vh, { multiplier: 3, format: 'png', transparent: true })
    const img = await out.embedPng(dataUrlToBytes(png))
    const box = page.getCropBox()
    const w = box.width
    const h = box.height
    const x0 = box.x
    const y0 = box.y
    if (rot === 0) page.drawImage(img, { x: x0, y: y0, width: w, height: h })
    else if (rot === 90) page.drawImage(img, { x: x0 + w, y: y0, width: h, height: w, rotate: degrees(90) })
    else if (rot === 180) page.drawImage(img, { x: x0 + w, y: y0 + h, width: w, height: h, rotate: degrees(180) })
    else page.drawImage(img, { x: x0, y: y0 + h, width: h, height: w, rotate: degrees(270) })
  }
  return out.save()
}
