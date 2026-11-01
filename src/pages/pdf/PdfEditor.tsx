import { Canvas, FabricImage, PencilBrush, Rect, Textbox } from 'fabric'
import { FileUp, Highlighter, ImagePlus, MousePointer2, PenLine, RotateCw, Save, Signature, Square, Trash2, Type, Eraser } from 'lucide-react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Layout } from '../../components/Layout'
import { Button, ColorField, IconButton, Modal, Overlay, Slider } from '../../components/ui'
import { useI18n } from '../../i18n'
import { downloadBlob, fileToImageDataUrl, pickFiles, safeName } from '../../lib/download'
import { EXTRA_PROPS } from '../../lib/fabricSetup'
import { ensureFont, hasArabic } from '../../lib/fonts'
import { openPdf, renderPdfPage, savePdf, viewSize, type PdfPageState } from './pdfTools'

type Tool = 'select' | 'text' | 'whiteout' | 'highlight' | 'rect' | 'draw'

export default function PdfEditor() {
  const { t, lang } = useI18n()
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array } | null>(null)
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null)
  const [pages, setPages] = useState<PdfPageState[]>([])
  const [cur, setCur] = useState(0)
  const [thumbs, setThumbs] = useState<Record<number, string>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [tool, setTool] = useState<Tool>('select')
  const [color, setColor] = useState('#111827')
  const [size, setSize] = useState(16)
  const [sigOpen, setSigOpen] = useState(false)
  const [hasSel, setHasSel] = useState(false)
  const hostRef = useRef<HTMLDivElement>(null)
  const areaRef = useRef<HTMLDivElement>(null)
  const fc = useRef<Canvas | null>(null)
  const pagesRef = useRef(pages)
  pagesRef.current = pages
  const curRef = useRef(cur)
  curRef.current = cur
  const toolRef = useRef(tool)
  toolRef.current = tool
  const styleRef = useRef({ color, size })
  styleRef.current = { color, size }

  const visible = pages.map((p, i) => ({ p, i })).filter((x) => !x.p.deleted)

  const open = async (f?: File) => {
    const picked = f ?? (await pickFiles('application/pdf,.pdf'))[0]
    if (!picked) return
    setBusy(t('pdfLoading'))
    try {
      const bytes = new Uint8Array(await picked.arrayBuffer())
      const res = await openPdf(bytes)
      setFile({ name: picked.name.replace(/\.pdf$/i, ''), bytes })
      setDoc(res.doc)
      setPages(res.pages)
      setThumbs({})
      setCur(0)
    } catch (e) {
      console.error(e)
      alert(String(e))
    } finally {
      setBusy(null)
    }
  }

  // Store the current page's overlay before switching / saving.
  const flush = useCallback(() => {
    const c = fc.current
    if (!c) return
    const json = c.toObject(EXTRA_PROPS) as Record<string, unknown>
    delete json.backgroundImage
    const i = curRef.current
    setPages((ps) => ps.map((p, j) => (j === i ? { ...p, overlay: json } : p)))
    pagesRef.current = pagesRef.current.map((p, j) => (j === i ? { ...p, overlay: json } : p))
  }, [])

  // Thumbnails
  useEffect(() => {
    if (!doc) return
    let alive = true
    ;(async () => {
      for (let i = 0; i < pages.length; i++) {
        const key = i * 1000 + pages[i].extraRotation
        if (thumbs[key]) continue
        const c = await renderPdfPage(doc, pages[i], 0.25)
        if (!alive) return
        setThumbs((tt) => ({ ...tt, [key]: c.toDataURL('image/jpeg', 0.7) }))
      }
    })()
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc, pages.map((p) => p.extraRotation).join()])

  // Mount/refresh the editing canvas for the current page
  useEffect(() => {
    if (!doc || !hostRef.current || !pages[cur]) return
    let alive = true
    ;(async () => {
      const st = pagesRef.current[cur]
      const { width, height } = await viewSize(doc, st)
      const avail = (areaRef.current?.clientWidth ?? 900) - 48
      const zoom = Math.min(2, Math.max(0.4, avail / width))
      const bg = await renderPdfPage(doc, st, zoom * Math.min(2, window.devicePixelRatio || 1) * 1.25)
      if (!alive) return
      fc.current?.dispose()
      const el = document.createElement('canvas')
      hostRef.current!.replaceChildren(el)
      const c = new Canvas(el, { width: width * zoom, height: height * zoom, preserveObjectStacking: true })
      c.setZoom(zoom)
      fc.current = c
      if (st.overlay) await c.loadFromJSON(st.overlay)
      const img = new FabricImage(bg)
      img.scale(width / bg.width)
      c.backgroundImage = img
      c.requestRenderAll()
      c.on('selection:created', () => setHasSel(true))
      c.on('selection:cleared', () => setHasSel(false))
      c.on('mouse:down', (e) => onCanvasDown(c, e.scenePoint, !!e.target))
      applyTool(c)
    })()
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc, cur, pages[cur]?.extraRotation])

  useEffect(
    () => () => {
      fc.current?.dispose()
    },
    [],
  )

  const applyTool = (c: Canvas) => {
    const tl = toolRef.current
    c.isDrawingMode = tl === 'draw'
    if (tl === 'draw') {
      const b = new PencilBrush(c)
      b.color = styleRef.current.color
      b.width = Math.max(1, styleRef.current.size / 6)
      c.freeDrawingBrush = b
    }
    c.selection = tl === 'select'
    c.defaultCursor = tl === 'select' ? 'default' : 'crosshair'
  }
  useEffect(() => {
    if (fc.current) applyTool(fc.current)
  }, [tool, color, size])

  const onCanvasDown = async (c: Canvas, pt: { x: number; y: number }, onObject: boolean) => {
    const tl = toolRef.current
    if (tl === 'select' || tl === 'draw' || onObject) return
    const { color: col, size: sz } = styleRef.current
    if (tl === 'text') {
      const sample = lang === 'ar' ? 'اكتب هنا' : 'Type here'
      const fontFamily = lang === 'ar' ? 'Cairo' : 'Inter'
      await ensureFont(fontFamily)
      const tb = new Textbox(sample, {
        left: pt.x,
        top: pt.y - sz * 0.6,
        width: sz * 10,
        fontSize: sz,
        fill: col,
        fontFamily,
        direction: hasArabic(sample) ? 'rtl' : 'ltr',
        textAlign: lang === 'ar' ? 'right' : 'left',
      })
      if (lang === 'ar') tb.set('left', pt.x - tb.width)
      c.add(tb)
      c.setActiveObject(tb)
      tb.enterEditing()
      tb.selectAll()
    } else {
      const w = tl === 'highlight' ? 160 : 120
      const h = tl === 'highlight' ? 18 : 40
      const r = new Rect({
        left: pt.x,
        top: pt.y,
        width: w,
        height: h,
        fill: tl === 'whiteout' ? '#ffffff' : tl === 'highlight' ? 'rgba(250,204,21,0.45)' : 'transparent',
        stroke: tl === 'rect' ? col : undefined,
        strokeWidth: tl === 'rect' ? 2 : 0,
        globalCompositeOperation: tl === 'highlight' ? 'multiply' : 'source-over',
      })
      c.add(r)
      c.setActiveObject(r)
    }
    setTool('select')
    c.requestRenderAll()
  }

  const addImage = async (url: string, widthPt = 150) => {
    const c = fc.current
    if (!c) return
    const img = await FabricImage.fromURL(url)
    img.scaleToWidth(widthPt)
    const z = c.getZoom()
    img.set({ left: (c.getWidth() / z - img.getScaledWidth()) / 2, top: (c.getHeight() / z - img.getScaledHeight()) / 2 })
    c.add(img)
    c.setActiveObject(img)
    c.requestRenderAll()
  }

  const deleteSelected = () => {
    const c = fc.current
    if (!c) return
    const a = c.getActiveObject()
    if (!a || (a instanceof Textbox && a.isEditing)) return
    c.remove(...c.getActiveObjects())
    c.discardActiveObject()
    c.requestRenderAll()
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'Delete' || e.key === 'Backspace') deleteSelected()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const goTo = (i: number) => {
    if (i === cur) return
    flush()
    setCur(i)
  }

  const rotate = () => {
    flush()
    setPages((ps) => ps.map((p, j) => (j === cur ? { ...p, extraRotation: (p.extraRotation + 90) % 360 } : p)))
  }

  const removePage = () => {
    if (visible.length <= 1) return
    const next = visible.find((x) => x.i > cur)?.i ?? visible.filter((x) => x.i < cur).pop()?.i ?? 0
    setPages((ps) => ps.map((p, j) => (j === cur ? { ...p, deleted: true } : p)))
    setCur(next)
  }

  const save = async () => {
    if (!file || !doc) return
    flush()
    setBusy(t('pdfSaving'))
    try {
      const bytes = await savePdf(file.bytes, doc, pagesRef.current)
      downloadBlob(bytes as BlobPart, `${safeName(file.name)}-edited.pdf`, 'application/pdf')
    } catch (e) {
      console.error(e)
      alert(String(e))
    } finally {
      setBusy(null)
    }
  }

  const activeObj = fc.current?.getActiveObject()

  if (!doc) {
    return (
      <Layout>
        {busy && <Overlay text={busy} />}
        <div
          className="mx-auto max-w-3xl px-4 py-10"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const f = e.dataTransfer.files[0]
            if (f) open(f)
          }}
        >
          <h1 className="text-3xl font-black">{t('pdfTitle')}</h1>
          <p className="mt-2 text-slate-600">{t('pdfSub')}</p>
          <button onClick={() => open()} className="mt-8 flex h-72 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-white text-slate-500 hover:border-brand-500">
            <FileUp size={44} />
            <span className="font-semibold">{t('pdfChoose')}</span>
          </button>
        </div>
      </Layout>
    )
  }

  const tools: [Tool, typeof Type, string][] = [
    ['select', MousePointer2, t('pdfSelect')],
    ['text', Type, t('pdfAddText')],
    ['whiteout', Eraser, t('pdfWhiteout')],
    ['highlight', Highlighter, t('pdfHighlight')],
    ['rect', Square, t('pdfRect')],
    ['draw', PenLine, t('pdfDraw')],
  ]

  return (
    <Layout>
      {busy && <Overlay text={busy} />}
      <SignatureModal open={sigOpen} onClose={() => setSigOpen(false)} onUse={(url) => addImage(url, 160)} />
      <div className="flex h-[calc(100vh-56px)] flex-col">
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-white px-3 py-2">
          {tools.map(([id, Icon, label]) => (
            <button
              key={id}
              onClick={() => setTool(id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold ${tool === id ? 'bg-brand-100 text-brand-700' : 'hover:bg-slate-100'}`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
          <button
            onClick={async () => {
              const [f] = await pickFiles('image/*')
              if (f) addImage(await fileToImageDataUrl(f, 1600))
            }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold hover:bg-slate-100"
          >
            <ImagePlus size={16} /> {t('pdfAddImage')}
          </button>
          <button onClick={() => setSigOpen(true)} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold hover:bg-slate-100">
            <Signature size={16} /> {t('pdfSignature')}
          </button>
          <div className="mx-2 h-6 w-px bg-slate-200" />
          <IconButton title={t('pdfDeleteSel')} disabled={!hasSel} onClick={deleteSelected}>
            <Trash2 size={17} />
          </IconButton>
          <div className="ms-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => open()}>
              <FileUp size={15} /> {t('pdfChoose')}
            </Button>
            <Button variant="primary" onClick={save}>
              <Save size={16} /> {t('pdfSave')}
            </Button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* thumbnails */}
          <div className="scroll-thin w-36 shrink-0 space-y-3 overflow-y-auto border-e border-slate-200 bg-white p-3">
            {visible.map(({ p, i }, n) => (
              <button key={i} onClick={() => goTo(i)} className={`block w-full rounded-lg border-2 p-1 ${i === cur ? 'border-brand-500' : 'border-transparent hover:border-slate-200'}`}>
                {thumbs[i * 1000 + p.extraRotation] ? <img src={thumbs[i * 1000 + p.extraRotation]} alt="" className="w-full shadow" /> : <div className="aspect-[3/4] animate-pulse bg-slate-100" />}
                <div className="mt-1 text-xs font-semibold text-slate-500">{n + 1}</div>
              </button>
            ))}
          </div>

          {/* page */}
          <div ref={areaRef} className="scroll-thin flex min-w-0 flex-1 flex-col overflow-auto bg-slate-100">
            <div className="flex items-center justify-center gap-2 py-2 text-sm text-slate-600">
              {t('pdfPageOf', { n: visible.findIndex((x) => x.i === cur) + 1, total: visible.length })}
              <IconButton title={t('pdfRotatePage')} onClick={rotate}>
                <RotateCw size={16} />
              </IconButton>
              <IconButton title={t('pdfDeletePage')} disabled={visible.length <= 1} onClick={removePage}>
                <Trash2 size={16} />
              </IconButton>
            </div>
            <div className="canvas-host mx-auto px-6 pb-10">
              <div ref={hostRef} className="bg-white shadow-xl" />
            </div>
          </div>

          {/* style panel */}
          <div className="hidden w-64 shrink-0 space-y-4 border-s border-slate-200 bg-white p-4 md:block">
            <ColorField
              label={t('color')}
              value={color}
              onChange={(c) => {
                setColor(c)
                const a = fc.current?.getActiveObject()
                if (a) {
                  if (a instanceof Textbox) a.set('fill', c)
                  else if (a instanceof Rect && a.stroke) a.set('stroke', c)
                  else if (a.type === 'path') a.set('stroke', c)
                  fc.current?.requestRenderAll()
                }
              }}
            />
            <Slider
              label={t('fontSize')}
              min={6}
              max={72}
              value={size}
              onChange={(v) => {
                setSize(v)
                if (activeObj instanceof Textbox) {
                  activeObj.set('fontSize', v)
                  fc.current?.requestRenderAll()
                }
              }}
            />
          </div>
        </div>
      </div>
    </Layout>
  )
}

function SignatureModal({ open, onClose, onUse }: { open: boolean; onClose: () => void; onUse: (url: string) => void }) {
  const { t } = useI18n()
  const ref = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const [color, setColor] = useState('#1e3a8a')

  useEffect(() => {
    if (!open) return
    const c = ref.current!
    const ctx = c.getContext('2d')!
    ctx.clearRect(0, 0, c.width, c.height)
  }, [open])

  const pos = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * ref.current!.width, y: ((e.clientY - r.top) / r.height) * ref.current!.height }
  }

  const trimmed = () => {
    const c = ref.current!
    const ctx = c.getContext('2d')!
    const { data, width, height } = ctx.getImageData(0, 0, c.width, c.height)
    let minX = width,
      minY = height,
      maxX = 0,
      maxY = 0
    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++)
        if (data[(y * width + x) * 4 + 3] > 0) {
          minX = Math.min(minX, x)
          maxX = Math.max(maxX, x)
          minY = Math.min(minY, y)
          maxY = Math.max(maxY, y)
        }
    if (maxX <= minX) return null
    const out = document.createElement('canvas')
    out.width = maxX - minX + 10
    out.height = maxY - minY + 10
    out.getContext('2d')!.drawImage(c, minX - 5, minY - 5, out.width, out.height, 0, 0, out.width, out.height)
    return out.toDataURL('image/png')
  }

  return (
    <Modal open={open} onClose={onClose} title={t('sigTitle')}>
      <canvas
        ref={ref}
        width={900}
        height={300}
        className="w-full touch-none rounded-xl border border-slate-200 bg-slate-50"
        onPointerDown={(e) => {
          drawing.current = true
          const ctx = ref.current!.getContext('2d')!
          const p = pos(e)
          ctx.strokeStyle = color
          ctx.lineWidth = 5
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return
          const ctx = ref.current!.getContext('2d')!
          const p = pos(e)
          ctx.lineTo(p.x, p.y)
          ctx.stroke()
        }}
        onPointerUp={() => (drawing.current = false)}
      />
      <div className="mt-3 flex items-center gap-2">
        {['#1e3a8a', '#111827', '#b91c1c'].map((c) => (
          <button key={c} onClick={() => setColor(c)} className={`h-7 w-7 rounded-full ${color === c ? 'ring-2 ring-brand-500 ring-offset-2' : ''}`} style={{ background: c }} />
        ))}
        <Button size="sm" variant="ghost" onClick={() => ref.current!.getContext('2d')!.clearRect(0, 0, 900, 300)}>
          {t('sigClear')}
        </Button>
        <div className="ms-auto flex gap-2">
          <Button size="sm" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              const url = trimmed()
              if (url) onUse(url)
              onClose()
            }}
          >
            {t('sigUse')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
