import { createStore, del, entries, get, set } from 'idb-keyval'

// Designs are saved in the browser (IndexedDB). Metadata is kept separately so the
// home screen can list designs without loading every image.

export interface PageData {
  id: string
  json: Record<string, unknown> | null
}

export interface Design {
  id: string
  title: string
  width: number
  height: number
  pages: PageData[]
  createdAt: number
  updatedAt: number
}

export interface DesignMeta {
  id: string
  title: string
  width: number
  height: number
  thumbnail?: string
  updatedAt: number
}

const designStore = createStore('studio-designs', 'designs')
const metaStore = createStore('studio-meta', 'meta')

export const uid = (p = '') => p + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)

export async function saveDesign(d: Design, thumbnail?: string) {
  d.updatedAt = Date.now()
  await set(d.id, d, designStore)
  const prev = await get<DesignMeta>(d.id, metaStore)
  const meta: DesignMeta = {
    id: d.id,
    title: d.title,
    width: d.width,
    height: d.height,
    thumbnail: thumbnail ?? prev?.thumbnail,
    updatedAt: d.updatedAt,
  }
  await set(d.id, meta, metaStore)
}

export const loadDesign = (id: string) => get<Design>(id, designStore)

export async function listDesigns(): Promise<DesignMeta[]> {
  const all = await entries<string, DesignMeta>(metaStore)
  return all.map(([, m]) => m).sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function deleteDesign(id: string) {
  await del(id, designStore)
  await del(id, metaStore)
}

export async function duplicateDesign(id: string, suffix: string) {
  const d = await loadDesign(id)
  const meta = await get<DesignMeta>(id, metaStore)
  if (!d) return
  const copy: Design = structuredClone(d)
  copy.id = uid('d_')
  copy.title = `${d.title} ${suffix}`
  copy.createdAt = Date.now()
  copy.pages = copy.pages.map((p) => ({ ...p, id: uid('p_') }))
  await saveDesign(copy, meta?.thumbnail)
}

export function newDesign(width: number, height: number, title: string, pages?: PageData[]): Design {
  return {
    id: uid('d_'),
    title,
    width: Math.round(width),
    height: Math.round(height),
    pages: pages ?? [{ id: uid('p_'), json: null }],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

// Hand-off of a freshly created image between tools (e.g. background remover -> editor)
let pendingImage: string | null = null
export const setPendingImage = (url: string | null) => (pendingImage = url)
export const takePendingImage = () => {
  const v = pendingImage
  pendingImage = null
  return v
}
