import {
  ActiveSelection,
  Canvas,
  Circle,
  Ellipse,
  FabricImage,
  Gradient,
  Group,
  Line,
  Path,
  Polygon,
  Rect,
  Shadow,
  Textbox,
  Triangle,
  filters,
  type FabricObject,
  type TFiller,
} from 'fabric'
import { create } from 'zustand'
import { EXTRA_PROPS, renderPage, setLocked, type Obj } from '../../lib/fabricSetup'
import { ensureFont, ensureFontsForJson, hasArabic } from '../../lib/fonts'
import { saveDesign, uid, type Design } from '../../lib/storage'

// ---------- UI-reactive state ----------
interface EditorUi {
  selection: Obj | null
  tick: number
  page: number
  pageCount: number
  zoom: number
  canUndo: boolean
  canRedo: boolean
  saving: boolean
  title: string
}
export const useEditorUi = create<EditorUi>(() => ({
  selection: null,
  tick: 0,
  page: 0,
  pageCount: 1,
  zoom: 1,
  canUndo: false,
  canRedo: false,
  saving: false,
  title: '',
}))
const ui = (p: Partial<EditorUi>) => useEditorUi.setState(p)
const bump = () => useEditorUi.setState((s) => ({ tick: s.tick + 1 }))

export type ShapeKind =
  | 'rect'
  | 'rounded'
  | 'circle'
  | 'ellipse'
  | 'triangle'
  | 'star'
  | 'hexagon'
  | 'pentagon'
  | 'diamond'
  | 'arrow'
  | 'heart'
  | 'line'
  | 'dashed'
  | 'thick'

const SNAP = 8

function starPoints(n: number, outer: number, inner: number) {
  const pts = []
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = (Math.PI / n) * i - Math.PI / 2
    pts.push({ x: outer + r * Math.cos(a), y: outer + r * Math.sin(a) })
  }
  return pts
}
function polyPoints(n: number, r: number) {
  return Array.from({ length: n }, (_, i) => {
    const a = ((2 * Math.PI) / n) * i - Math.PI / 2
    return { x: r + r * Math.cos(a), y: r + r * Math.sin(a) }
  })
}

export class EditorController {
  canvas!: Canvas
  design: Design
  private history: string[][] = []
  private future: string[][] = []
  private loading = false
  private historyTimer = 0
  private saveTimer = 0
  private clipboard: FabricObject | null = null
  private guides: { v: number[]; h: number[] } = { v: [], h: [] }
  private disposed = false

  constructor(design: Design) {
    this.design = design
    this.history = design.pages.map(() => [])
    this.future = design.pages.map(() => [])
  }

  get W() {
    return this.design.width
  }
  get H() {
    return this.design.height
  }
  get pageIndex() {
    return useEditorUi.getState().page
  }

  async mount(el: HTMLCanvasElement) {
    this.canvas = new Canvas(el, {
      width: this.W,
      height: this.H,
      preserveObjectStacking: true,
      backgroundColor: '#ffffff',
      controlsAboveOverlay: true,
      stopContextMenu: true,
      fireRightClick: true,
    })
    const c = this.canvas
    const onChange = () => this.onChanged()
    c.on('object:modified', onChange)
    c.on('object:added', onChange)
    c.on('object:removed', onChange)
    c.on('text:changed', onChange)
    c.on('selection:created', () => this.syncSelection())
    c.on('selection:updated', () => this.syncSelection())
    c.on('selection:cleared', () => this.syncSelection())
    c.on('object:moving', (e) => this.snap(e.target))
    c.on('object:scaling', () => bump())
    c.on('object:rotating', () => bump())
    c.on('mouse:up', () => {
      this.guides = { v: [], h: [] }
      c.requestRenderAll()
    })
    c.on('before:render', () => {
      if (this.guides.v.length || this.guides.h.length) c.clearContext(c.getTopContext())
    })
    c.on('after:render', () => this.drawGuides())
    ui({ page: 0, pageCount: this.design.pages.length, title: this.design.title })
    await this.loadPage(0)
  }

  dispose() {
    if (this.disposed) return
    this.disposed = true
    clearTimeout(this.saveTimer)
    clearTimeout(this.historyTimer)
    this.canvas?.dispose()
  }

  // ---------- serialization ----------
  private serialize() {
    return this.canvas.toObject(EXTRA_PROPS) as Record<string, unknown>
  }

  private async loadJson(json: Record<string, unknown> | null) {
    this.loading = true
    const c = this.canvas
    c.discardActiveObject()
    if (json) {
      await ensureFontsForJson(json)
      await c.loadFromJSON(json)
      if (!c.backgroundColor && !c.backgroundImage) c.backgroundColor = '#ffffff'
    } else {
      c.clear()
      c.backgroundColor = '#ffffff'
    }
    // Restore lock state controls after load
    c.getObjects().forEach((o) => {
      if ((o as Obj).locked) setLocked(o as Obj, true)
    })
    c.requestRenderAll()
    this.loading = false
    this.syncSelection()
  }

  async loadPage(i: number) {
    await this.loadJson(this.design.pages[i].json)
    ui({ page: i, pageCount: this.design.pages.length })
    if (!this.history[i]?.length) this.history[i] = [JSON.stringify(this.serialize())]
    this.updateHistoryUi()
  }

  private flushPage() {
    this.design.pages[this.pageIndex].json = this.serialize()
  }

  private onChanged() {
    if (this.loading || this.disposed) return
    bump()
    clearTimeout(this.historyTimer)
    this.historyTimer = window.setTimeout(() => this.pushHistory(), 250)
    this.scheduleSave()
  }

  private pushHistory() {
    const i = this.pageIndex
    const snap = JSON.stringify(this.serialize())
    const h = this.history[i]
    if (h[h.length - 1] === snap) return
    h.push(snap)
    if (h.length > 60) h.shift()
    this.future[i] = []
    this.updateHistoryUi()
  }

  private updateHistoryUi() {
    const i = this.pageIndex
    ui({ canUndo: (this.history[i]?.length ?? 0) > 1, canRedo: (this.future[i]?.length ?? 0) > 0 })
  }

  async undo() {
    const i = this.pageIndex
    const h = this.history[i]
    if (h.length < 2) return
    this.future[i].push(h.pop()!)
    await this.loadJson(JSON.parse(h[h.length - 1]))
    this.updateHistoryUi()
    this.scheduleSave()
  }

  async redo() {
    const i = this.pageIndex
    const f = this.future[i]
    if (!f.length) return
    const s = f.pop()!
    this.history[i].push(s)
    await this.loadJson(JSON.parse(s))
    this.updateHistoryUi()
    this.scheduleSave()
  }

  scheduleSave() {
    ui({ saving: true })
    clearTimeout(this.saveTimer)
    this.saveTimer = window.setTimeout(() => this.saveNow(), 800)
  }

  async saveNow() {
    if (this.disposed || !this.canvas) return
    this.flushPage()
    let thumb: string | undefined
    try {
      const scale = 320 / Math.max(this.W, this.H)
      thumb = await renderPage(this.design.pages[0].json, this.W, this.H, { multiplier: scale, format: 'jpeg', quality: 0.7 })
    } catch {
      thumb = undefined
    }
    await saveDesign(this.design, thumb)
    ui({ saving: false })
  }

  setTitle(title: string) {
    this.design.title = title
    ui({ title })
    this.scheduleSave()
  }

  // ---------- pages ----------
  async goToPage(i: number) {
    if (i === this.pageIndex || i < 0 || i >= this.design.pages.length) return
    this.flushPage()
    await this.loadPage(i)
  }
  async addPage(copyCurrent = false) {
    this.flushPage()
    const at = this.pageIndex + 1
    const json = copyCurrent ? structuredClone(this.design.pages[this.pageIndex].json) : null
    this.design.pages.splice(at, 0, { id: uid('p_'), json })
    this.history.splice(at, 0, [])
    this.future.splice(at, 0, [])
    await this.loadPage(at)
    this.scheduleSave()
  }
  async deletePage(i = this.pageIndex) {
    if (this.design.pages.length <= 1) return
    this.flushPage()
    this.design.pages.splice(i, 1)
    this.history.splice(i, 1)
    this.future.splice(i, 1)
    await this.loadPage(Math.min(i, this.design.pages.length - 1))
    this.scheduleSave()
  }
  async movePage(from: number, to: number) {
    if (to < 0 || to >= this.design.pages.length) return
    this.flushPage()
    const [p] = this.design.pages.splice(from, 1)
    this.design.pages.splice(to, 0, p)
    const [h] = this.history.splice(from, 1)
    this.history.splice(to, 0, h)
    const [f] = this.future.splice(from, 1)
    this.future.splice(to, 0, f)
    await this.loadPage(to)
    this.scheduleSave()
  }

  /** Flush the live page so exports see the latest state. */
  snapshot(): Design {
    this.flushPage()
    return this.design
  }

  // ---------- zoom ----------
  setZoom(z: number) {
    const zoom = Math.min(4, Math.max(0.05, z))
    this.canvas.setDimensions({ width: Math.round(this.W * zoom), height: Math.round(this.H * zoom) })
    this.canvas.setZoom(zoom)
    ui({ zoom })
  }
  fitTo(w: number, h: number) {
    const z = Math.min((w - 80) / this.W, (h - 80) / this.H)
    this.setZoom(Math.max(0.05, z))
  }

  // ---------- selection ----------
  private syncSelection() {
    ui({ selection: (this.canvas.getActiveObject() as Obj) ?? null })
    bump()
  }
  active(): Obj | null {
    return (this.canvas.getActiveObject() as Obj) ?? null
  }
  select(o: FabricObject) {
    if (!o.visible) return
    this.canvas.setActiveObject(o)
    this.canvas.requestRenderAll()
  }
  modified(o?: FabricObject) {
    o?.setCoords()
    this.canvas.requestRenderAll()
    this.onChanged()
  }
  /** Set properties on the selection (or every member of a multi-selection). */
  setProps(props: Record<string, unknown>) {
    const a = this.active()
    if (!a) return
    const targets = a instanceof ActiveSelection ? a.getObjects() : [a]
    for (const t of targets) {
      t.set(props)
      if (t instanceof Textbox) t.initDimensions()
    }
    a.setCoords()
    this.modified(a)
  }

  // ---------- adding ----------
  private place(o: FabricObject, center = true) {
    if (!(o as Obj).name && !(o instanceof Textbox)) (o as Obj).name = o.type
    if (center) {
      const w = o.getScaledWidth()
      const h = o.getScaledHeight()
      o.set({ left: (this.W - w) / 2, top: (this.H - h) / 2 })
    }
    this.canvas.add(o)
    this.canvas.setActiveObject(o)
    o.setCoords()
    this.canvas.requestRenderAll()
  }

  async addText(kind: 'heading' | 'subheading' | 'body', content: string, lang: 'ar' | 'en') {
    const size = kind === 'heading' ? 0.09 : kind === 'subheading' ? 0.06 : 0.035
    const fontSize = Math.round(Math.min(this.W, this.H) * size)
    const fontFamily = lang === 'ar' ? 'Cairo' : 'Inter'
    const fontWeight = kind === 'body' ? 'normal' : 'bold'
    await ensureFont(fontFamily, fontWeight)
    const rtl = hasArabic(content)
    const t = new Textbox(content, {
      fontFamily,
      fontSize,
      fontWeight,
      fill: '#111827',
      width: Math.min(this.W * 0.8, fontSize * content.length * 0.7 + 40),
      textAlign: 'center',
      direction: rtl ? 'rtl' : 'ltr',
      lineHeight: 1.25,
      splitByGrapheme: false,
    })
    this.place(t)
  }

  addShape(kind: ShapeKind) {
    const s = Math.min(this.W, this.H) * 0.3
    const fill = '#7c3aed'
    let o: FabricObject
    switch (kind) {
      case 'rect':
        o = new Rect({ width: s, height: s, fill })
        break
      case 'rounded':
        o = new Rect({ width: s, height: s, fill, rx: s * 0.15, ry: s * 0.15 })
        break
      case 'circle':
        o = new Circle({ radius: s / 2, fill })
        break
      case 'ellipse':
        o = new Ellipse({ rx: s * 0.7, ry: s * 0.45, fill })
        break
      case 'triangle':
        o = new Triangle({ width: s, height: s, fill })
        break
      case 'star':
        o = new Polygon(starPoints(5, s / 2, s / 4.5), { fill })
        break
      case 'hexagon':
        o = new Polygon(polyPoints(6, s / 2), { fill })
        break
      case 'pentagon':
        o = new Polygon(polyPoints(5, s / 2), { fill })
        break
      case 'diamond':
        o = new Polygon(polyPoints(4, s / 2), { fill })
        break
      case 'arrow':
        o = new Polygon(
          [
            { x: 0, y: s * 0.3 },
            { x: s * 0.6, y: s * 0.3 },
            { x: s * 0.6, y: 0 },
            { x: s, y: s * 0.5 },
            { x: s * 0.6, y: s },
            { x: s * 0.6, y: s * 0.7 },
            { x: 0, y: s * 0.7 },
          ],
          { fill },
        )
        break
      case 'heart':
        o = new Path(
          'M 50 90 C 20 70 0 50 0 30 C 0 12 14 0 30 0 C 40 0 47 6 50 14 C 53 6 60 0 70 0 C 86 0 100 12 100 30 C 100 50 80 70 50 90 Z',
          { fill: '#ef4444', scaleX: s / 100, scaleY: s / 100 },
        )
        break
      case 'line':
      case 'dashed':
      case 'thick':
        o = new Line([0, 0, s * 1.5, 0], {
          stroke: '#111827',
          strokeWidth: kind === 'thick' ? Math.max(8, s * 0.06) : Math.max(3, s * 0.015),
          strokeDashArray: kind === 'dashed' ? [s * 0.08, s * 0.05] : undefined,
          strokeLineCap: 'round',
        })
        break
    }
    ;(o as Obj).name = kind
    this.place(o)
  }

  async addImage(src: string, name = 'image', opts: { asBackground?: boolean } = {}) {
    const img = await FabricImage.fromURL(src, { crossOrigin: 'anonymous' })
    if (opts.asBackground) return this.setBackgroundImage(img)
    const maxW = this.W * 0.7
    const maxH = this.H * 0.7
    const scale = Math.min(1, maxW / img.width, maxH / img.height)
    img.scale(scale)
    ;(img as Obj).name = name
    this.place(img)
  }

  async addSvgIcon(path: string, name: string) {
    const s = Math.min(this.W, this.H) * 0.25
    const p = new Path(path, { fill: '#111827' })
    const scale = s / Math.max(p.width, p.height)
    p.scale(scale)
    ;(p as Obj).name = name
    this.place(p)
  }

  /** Add many serialized objects (e.g. imported PSD layers). */
  async addSerialized(objs: Record<string, unknown>[]) {
    const { util } = await import('fabric')
    await ensureFontsForJson({ objects: objs })
    const enlivened = (await util.enlivenObjects(objs)) as FabricObject[]
    this.loading = true
    enlivened.forEach((o) => {
      if ((o as Obj).locked) setLocked(o as Obj, true)
      this.canvas.add(o)
    })
    this.loading = false
    this.canvas.requestRenderAll()
    this.onChanged()
  }

  // ---------- background ----------
  setBackgroundColor(color: string) {
    this.canvas.backgroundColor = color
    this.canvas.requestRenderAll()
    this.onChanged()
  }
  setBackgroundGradient(a: string, b: string, angle = 135) {
    const rad = (angle * Math.PI) / 180
    const cx = this.W / 2
    const cy = this.H / 2
    const len = Math.abs(this.W * Math.cos(rad)) / 2 + Math.abs(this.H * Math.sin(rad)) / 2
    this.canvas.backgroundColor = new Gradient({
      type: 'linear',
      gradientUnits: 'pixels',
      coords: {
        x1: cx - Math.cos(rad) * len,
        y1: cy - Math.sin(rad) * len,
        x2: cx + Math.cos(rad) * len,
        y2: cy + Math.sin(rad) * len,
      },
      colorStops: [
        { offset: 0, color: a },
        { offset: 1, color: b },
      ],
    }) as unknown as TFiller
    this.canvas.requestRenderAll()
    this.onChanged()
  }
  private setBackgroundImage(img: FabricImage) {
    const scale = Math.max(this.W / img.width, this.H / img.height)
    img.set({
      scaleX: scale,
      scaleY: scale,
      left: (this.W - img.width * scale) / 2,
      top: (this.H - img.height * scale) / 2,
    })
    this.canvas.backgroundImage = img
    this.canvas.requestRenderAll()
    this.onChanged()
  }
  clearBackgroundImage() {
    this.canvas.backgroundImage = undefined
    this.canvas.requestRenderAll()
    this.onChanged()
  }
  get backgroundColor(): string {
    const b = this.canvas?.backgroundColor
    return typeof b === 'string' ? b : '#ffffff'
  }

  // ---------- object operations ----------
  deleteSelection() {
    const a = this.active()
    if (!a) return
    if (a instanceof Textbox && a.isEditing) return
    const objs = a instanceof ActiveSelection ? a.getObjects() : [a]
    this.canvas.discardActiveObject()
    objs.forEach((o) => {
      if (!(o as Obj).locked) this.canvas.remove(o)
    })
    this.canvas.requestRenderAll()
  }

  async duplicate() {
    const a = this.active()
    if (!a) return
    const clone = await a.clone(EXTRA_PROPS)
    this.canvas.discardActiveObject()
    clone.set({ left: (clone.left ?? 0) + 30, top: (clone.top ?? 0) + 30 })
    if (clone instanceof ActiveSelection) {
      clone.canvas = this.canvas
      clone.forEachObject((o) => this.canvas.add(o))
      clone.setCoords()
    } else {
      this.canvas.add(clone)
    }
    this.canvas.setActiveObject(clone)
    this.canvas.requestRenderAll()
  }

  async copy() {
    const a = this.active()
    if (a) this.clipboard = await a.clone(EXTRA_PROPS)
  }
  async paste() {
    if (!this.clipboard) return
    const clone = await this.clipboard.clone(EXTRA_PROPS)
    this.clipboard.set({ left: (this.clipboard.left ?? 0) + 30, top: (this.clipboard.top ?? 0) + 30 })
    this.canvas.discardActiveObject()
    if (clone instanceof ActiveSelection) {
      clone.canvas = this.canvas
      clone.forEachObject((o) => this.canvas.add(o))
      clone.setCoords()
    } else {
      this.canvas.add(clone)
    }
    this.canvas.setActiveObject(clone)
    this.canvas.requestRenderAll()
  }

  group() {
    const a = this.active()
    if (!(a instanceof ActiveSelection)) return
    const objs = a.getObjects()
    this.canvas.discardActiveObject()
    this.loading = true
    this.canvas.remove(...objs)
    this.loading = false
    const g = new Group(objs)
    ;(g as Obj).name = 'group'
    this.canvas.add(g)
    this.canvas.setActiveObject(g)
    this.canvas.requestRenderAll()
  }

  ungroup() {
    const a = this.active()
    if (!(a instanceof Group) || a instanceof ActiveSelection) return
    this.loading = true
    const objs = a.removeAll()
    this.canvas.remove(a)
    this.canvas.add(...objs)
    this.loading = false
    const sel = new ActiveSelection(objs, { canvas: this.canvas })
    this.canvas.setActiveObject(sel)
    this.canvas.requestRenderAll()
    this.onChanged()
  }

  arrange(dir: 'forward' | 'backward' | 'front' | 'back') {
    const a = this.active()
    if (!a) return
    const c = this.canvas
    if (dir === 'forward') c.bringObjectForward(a)
    if (dir === 'backward') c.sendObjectBackwards(a)
    if (dir === 'front') c.bringObjectToFront(a)
    if (dir === 'back') c.sendObjectToBack(a)
    this.modified(a)
  }

  moveLayer(o: FabricObject, toIndex: number) {
    this.canvas.moveObjectTo(o, toIndex)
    this.modified(o)
  }

  toggleLock(o: Obj | null = this.active()) {
    if (!o) return
    setLocked(o, !o.locked)
    this.modified(o)
  }

  toggleVisible(o: Obj) {
    o.visible = !o.visible
    if (!o.visible && this.canvas.getActiveObject() === o) this.canvas.discardActiveObject()
    this.modified(o)
  }

  alignToPage(pos: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') {
    const a = this.active()
    if (!a) return
    // bounding rect is in scene (unzoomed) coordinates
    const r = a.getBoundingRect()
    const bw = r.width
    const bh = r.height
    const left = r.left
    const top = r.top
    let dx = 0
    let dy = 0
    if (pos === 'left') dx = -left
    if (pos === 'center') dx = (this.W - bw) / 2 - left
    if (pos === 'right') dx = this.W - bw - left
    if (pos === 'top') dy = -top
    if (pos === 'middle') dy = (this.H - bh) / 2 - top
    if (pos === 'bottom') dy = this.H - bh - top
    a.set({ left: (a.left ?? 0) + dx, top: (a.top ?? 0) + dy })
    this.modified(a)
  }

  flip(axis: 'x' | 'y') {
    const a = this.active()
    if (!a) return
    if (axis === 'x') a.set('flipX', !a.flipX)
    else a.set('flipY', !a.flipY)
    this.modified(a)
  }

  setShadow(on: boolean) {
    const a = this.active()
    if (!a) return
    a.set('shadow', on ? new Shadow({ color: 'rgba(0,0,0,0.35)', blur: 20, offsetX: 6, offsetY: 8 }) : null)
    this.modified(a)
  }

  // ---------- image filters ----------
  getFilterValue(img: FabricImage, kind: 'Brightness' | 'Contrast' | 'Saturation' | 'Blur' | 'Grayscale'): number {
    const f = img.filters.find((x) => x?.type === kind) as unknown as Record<string, number> | undefined
    if (!f) return 0
    if (kind === 'Grayscale') return 1
    return f[kind.toLowerCase()] ?? 0
  }
  setFilter(img: FabricImage, kind: 'Brightness' | 'Contrast' | 'Saturation' | 'Blur' | 'Grayscale', value: number) {
    img.filters = img.filters.filter((x) => x?.type !== kind)
    if (value !== 0) {
      let f
      if (kind === 'Brightness') f = new filters.Brightness({ brightness: value })
      if (kind === 'Contrast') f = new filters.Contrast({ contrast: value })
      if (kind === 'Saturation') f = new filters.Saturation({ saturation: value })
      if (kind === 'Blur') f = new filters.Blur({ blur: value })
      if (kind === 'Grayscale') f = new filters.Grayscale()
      if (f) img.filters.push(f)
    }
    img.applyFilters()
    this.modified(img)
  }

  async replaceImageSrc(img: FabricImage, src: string) {
    const w = img.getScaledWidth()
    await img.setSrc(src, { crossOrigin: 'anonymous' })
    img.scaleToWidth(w)
    img.applyFilters()
    this.modified(img)
  }

  // ---------- keyboard ----------
  async handleKey(e: KeyboardEvent) {
    const a = this.active()
    if (a instanceof Textbox && a.isEditing) return
    const tag = (e.target as HTMLElement)?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target as HTMLElement)?.isContentEditable) return
    const mod = e.ctrlKey || e.metaKey
    const k = e.key.toLowerCase()
    if (k === 'delete' || k === 'backspace') {
      e.preventDefault()
      this.deleteSelection()
    } else if (mod && k === 'z' && !e.shiftKey) {
      e.preventDefault()
      await this.undo()
    } else if (mod && (k === 'y' || (k === 'z' && e.shiftKey))) {
      e.preventDefault()
      await this.redo()
    } else if (mod && k === 'd') {
      e.preventDefault()
      await this.duplicate()
    } else if (mod && k === 'c') {
      await this.copy()
    } else if (mod && k === 'v') {
      if (this.clipboard) {
        e.preventDefault()
        await this.paste()
      }
    } else if (mod && k === 'g') {
      e.preventDefault()
      if (e.shiftKey) this.ungroup()
      else this.group()
    } else if (mod && k === 'a') {
      e.preventDefault()
      const objs = this.canvas.getObjects().filter((o) => o.visible && o.selectable)
      if (objs.length) this.canvas.setActiveObject(new ActiveSelection(objs, { canvas: this.canvas }))
      this.canvas.requestRenderAll()
    } else if (a && k.startsWith('arrow')) {
      e.preventDefault()
      const step = e.shiftKey ? 10 : 1
      if (k === 'arrowleft') a.set('left', (a.left ?? 0) - step)
      if (k === 'arrowright') a.set('left', (a.left ?? 0) + step)
      if (k === 'arrowup') a.set('top', (a.top ?? 0) - step)
      if (k === 'arrowdown') a.set('top', (a.top ?? 0) + step)
      this.modified(a)
    } else if (k === 'escape') {
      this.canvas.discardActiveObject()
      this.canvas.requestRenderAll()
    }
  }

  // ---------- smart guides ----------
  private snap(o?: FabricObject) {
    if (!o) return
    const w = o.getScaledWidth()
    const h = o.getScaledHeight()
    if (o.angle) {
      this.guides = { v: [], h: [] }
      return
    }
    const z = this.canvas.getZoom()
    const th = SNAP / z
    const v: number[] = []
    const hz: number[] = []
    const xs = [0, this.W / 2, this.W]
    const ys = [0, this.H / 2, this.H]
    // edges & centers of other objects
    for (const other of this.canvas.getObjects()) {
      if (other === o || !other.visible || other.angle) continue
      const ol = other.left ?? 0
      const ot = other.top ?? 0
      const ow = other.getScaledWidth()
      const oh = other.getScaledHeight()
      xs.push(ol, ol + ow / 2, ol + ow)
      ys.push(ot, ot + oh / 2, ot + oh)
    }
    const left = o.left ?? 0
    const top = o.top ?? 0
    const candX = [
      [left, 0],
      [left + w / 2, w / 2],
      [left + w, w],
    ]
    const candY = [
      [top, 0],
      [top + h / 2, h / 2],
      [top + h, h],
    ]
    let snappedX = false
    for (const [val, off] of candX) {
      for (const x of xs) {
        if (!snappedX && Math.abs(val - x) < th) {
          o.set('left', x - off)
          v.push(x)
          snappedX = true
        }
      }
    }
    let snappedY = false
    for (const [val, off] of candY) {
      for (const y of ys) {
        if (!snappedY && Math.abs(val - y) < th) {
          o.set('top', y - off)
          hz.push(y)
          snappedY = true
        }
      }
    }
    this.guides = { v, h: hz }
  }

  private drawGuides() {
    const { v, h } = this.guides
    if (!v.length && !h.length) return
    const ctx = this.canvas.getTopContext()
    const z = this.canvas.getZoom()
    ctx.save()
    ctx.strokeStyle = '#ec4899'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    for (const x of v) {
      ctx.beginPath()
      ctx.moveTo(x * z + 0.5, 0)
      ctx.lineTo(x * z + 0.5, this.H * z)
      ctx.stroke()
    }
    for (const y of h) {
      ctx.beginPath()
      ctx.moveTo(0, y * z + 0.5)
      ctx.lineTo(this.W * z, y * z + 0.5)
      ctx.stroke()
    }
    ctx.restore()
  }
}
