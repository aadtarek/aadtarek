import { importPsd } from './psd'
import { newDesign, saveDesign, uid, type Design } from './storage'
import { templateToJson, type Template } from './templates'
import { loadImage } from './download'

export async function createBlank(width: number, height: number, title: string) {
  const d = newDesign(width, height, title)
  await saveDesign(d)
  return d.id
}

export async function createFromTemplate(t: Template, title: string) {
  const d = newDesign(t.width, t.height, title, [{ id: uid('p_'), json: templateToJson(t) }])
  await saveDesign(d)
  return d.id
}

export async function createFromPsd(file: File) {
  const res = await importPsd(await file.arrayBuffer())
  const d: Design = newDesign(res.width, res.height, file.name.replace(/\.psd$/i, ''), [
    { id: uid('p_'), json: { version: '7', objects: res.objects, background: '' } },
  ])
  await saveDesign(d)
  return d.id
}

/** New design sized to an image, with the image as a layer (used by background remover). */
export async function createFromImage(dataUrl: string, title: string) {
  const img = await loadImage(dataUrl)
  const d = newDesign(img.naturalWidth, img.naturalHeight, title, [
    {
      id: uid('p_'),
      json: { version: '7', background: '', objects: [{ type: 'Image', src: dataUrl, left: 0, top: 0, name: 'image' }] },
    },
  ])
  await saveDesign(d)
  return d.id
}

/** Project file import/export (lets users move designs between devices). */
export function designToFile(d: Design) {
  return JSON.stringify({ format: 'studio-design', version: 1, design: d })
}

export async function importDesignFile(file: File) {
  const parsed = JSON.parse(await file.text())
  const src: Design = parsed?.design ?? parsed
  if (!src?.pages || !src.width) throw new Error('Invalid file')
  const d = newDesign(src.width, src.height, src.title || 'Imported', src.pages.map((p) => ({ id: uid('p_'), json: p.json })))
  await saveDesign(d)
  return d.id
}
