import { Eye, EyeOff, Image as ImageIcon, Layers, LayoutTemplate, Lock, PaintBucket, Shapes, Type, Unlock, Upload, Camera, GripVertical } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button, ColorField, Overlay } from '../../components/ui'
import { useI18n } from '../../i18n'
import { fileToImageDataUrl, pickFiles } from '../../lib/download'
import { importPsd } from '../../lib/psd'
import { TEMPLATES, templateToJson } from '../../lib/templates'
import { renderPage, type Obj } from '../../lib/fabricSetup'
import { useEditorUi, type ShapeKind } from './controller'
import { useEditor } from './Editor'

type Tab = 'templates' | 'text' | 'elements' | 'uploads' | 'photos' | 'background' | 'layers'

export function LeftPanel() {
  const { t } = useI18n()
  const [tab, setTab] = useState<Tab>('text')
  const tabs: [Tab, typeof Type, string][] = [
    ['templates', LayoutTemplate, t('templates')],
    ['text', Type, t('text')],
    ['elements', Shapes, t('elements')],
    ['uploads', Upload, t('uploads')],
    ['photos', Camera, t('photos')],
    ['background', PaintBucket, t('background')],
    ['layers', Layers, t('layers')],
  ]
  return (
    <aside className="flex shrink-0 border-e border-slate-200 bg-white">
      <nav className="flex w-[68px] flex-col items-center gap-1 border-e border-slate-100 py-2">
        {tabs.map(([id, Icon, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex w-14 flex-col items-center gap-1 rounded-lg py-2 text-[11px] font-semibold ${
              tab === id ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Icon size={20} />
            {label}
          </button>
        ))}
      </nav>
      <div className="scroll-thin w-64 overflow-y-auto p-3 lg:w-72">
        {tab === 'templates' && <TemplatesTab />}
        {tab === 'text' && <TextTab />}
        {tab === 'elements' && <ElementsTab />}
        {tab === 'uploads' && <UploadsTab />}
        {tab === 'photos' && <PhotosTab />}
        {tab === 'background' && <BackgroundTab />}
        {tab === 'layers' && <LayersTab />}
      </div>
    </aside>
  )
}

function Title({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-slate-400 first:mt-0">{children}</h3>
}

function TemplatesTab() {
  const ctl = useEditor()
  const { lang } = useI18n()
  const [previews, setPreviews] = useState<Record<string, string>>({})
  useEffect(() => {
    let alive = true
    ;(async () => {
      for (const tpl of TEMPLATES) {
        const url = await renderPage(templateToJson(tpl), tpl.width, tpl.height, { multiplier: 240 / Math.max(tpl.width, tpl.height), format: 'jpeg' })
        if (alive) setPreviews((p) => ({ ...p, [tpl.id]: url }))
      }
    })()
    return () => {
      alive = false
    }
  }, [])
  const apply = async (id: string) => {
    const tpl = TEMPLATES.find((x) => x.id === id)!
    const json = templateToJson(tpl) as { objects: Record<string, unknown>[]; background: unknown }
    // Scale template to the current design size
    const s = Math.min(ctl.W / tpl.width, ctl.H / tpl.height)
    const ox = (ctl.W - tpl.width * s) / 2
    const oy = (ctl.H - tpl.height * s) / 2
    const objs = json.objects.map((o) => ({
      ...o,
      left: ((o.left as number) ?? 0) * s + ox,
      top: ((o.top as number) ?? 0) * s + oy,
      scaleX: ((o.scaleX as number) ?? 1) * s,
      scaleY: ((o.scaleY as number) ?? 1) * s,
    }))
    if (typeof json.background === 'string') ctl.setBackgroundColor(json.background)
    else {
      const bg = json.background as { colorStops: { color: string }[] }
      ctl.setBackgroundGradient(bg.colorStops[0].color, bg.colorStops[1].color, 45)
    }
    await ctl.addSerialized(objs)
  }
  return (
    <div className="grid grid-cols-2 gap-2">
      {TEMPLATES.map((tpl) => (
        <button key={tpl.id} onClick={() => apply(tpl.id)} className="overflow-hidden rounded-lg border border-slate-200 hover:border-brand-500" title={tpl[lang]}>
          <div className="flex aspect-square items-center justify-center bg-slate-100 p-1">
            {previews[tpl.id] && <img src={previews[tpl.id]} alt="" className="max-h-full max-w-full" />}
          </div>
          <div className="truncate px-1 py-1 text-xs font-semibold">{tpl[lang]}</div>
        </button>
      ))}
    </div>
  )
}

function TextTab() {
  const ctl = useEditor()
  const { t, lang } = useI18n()
  const combos = [
    { text: lang === 'ar' ? 'عرض خاص' : 'SALE', font: lang === 'ar' ? 'Lalezar' : 'Bebas Neue', color: '#dc2626' },
    { text: lang === 'ar' ? 'شكرًا لكم' : 'Thank you', font: lang === 'ar' ? 'Aref Ruqaa' : 'Pacifico', color: '#7c3aed' },
    { text: lang === 'ar' ? 'جديد' : 'NEW', font: lang === 'ar' ? 'Changa' : 'Montserrat', color: '#0f766e' },
    { text: lang === 'ar' ? 'مبروك' : 'Congrats', font: lang === 'ar' ? 'Reem Kufi' : 'Lobster', color: '#db2777' },
  ]
  return (
    <div className="space-y-2">
      <button onClick={() => ctl.addText('heading', t('headingText'), lang)} className="w-full rounded-lg border border-slate-200 px-3 py-3 text-start text-2xl font-black hover:bg-slate-50">
        {t('addHeading')}
      </button>
      <button onClick={() => ctl.addText('subheading', t('subheadingText'), lang)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-start text-lg font-bold hover:bg-slate-50">
        {t('addSubheading')}
      </button>
      <button onClick={() => ctl.addText('body', t('bodyText'), lang)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-start text-sm hover:bg-slate-50">
        {t('addBody')}
      </button>
      <div className="grid grid-cols-2 gap-2 pt-2">
        {combos.map((c) => (
          <button
            key={c.text}
            onClick={async () => {
              await ctl.addText('heading', c.text, lang)
              ctl.setProps({ fontFamily: c.font, fill: c.color, fontWeight: 'normal' })
            }}
            className="flex h-20 items-center justify-center rounded-lg bg-slate-50 text-2xl hover:bg-slate-100"
            style={{ fontFamily: c.font, color: c.color }}
          >
            {c.text}
          </button>
        ))}
      </div>
    </div>
  )
}

const SHAPES: ShapeKind[] = ['rect', 'rounded', 'circle', 'ellipse', 'triangle', 'star', 'hexagon', 'pentagon', 'diamond', 'arrow', 'heart']
const SHAPE_SVG: Record<string, string> = {
  rect: '<rect x="4" y="4" width="32" height="32"/>',
  rounded: '<rect x="4" y="4" width="32" height="32" rx="7"/>',
  circle: '<circle cx="20" cy="20" r="16"/>',
  ellipse: '<ellipse cx="20" cy="20" rx="18" ry="11"/>',
  triangle: '<polygon points="20,4 36,36 4,36"/>',
  star: '<polygon points="20,3 24.5,14.5 37,15 27,23 30.5,36 20,28.5 9.5,36 13,23 3,15 15.5,14.5"/>',
  hexagon: '<polygon points="20,3 35,11.5 35,28.5 20,37 5,28.5 5,11.5"/>',
  pentagon: '<polygon points="20,3 37,16 30.5,36 9.5,36 3,16"/>',
  diamond: '<polygon points="20,3 37,20 20,37 3,20"/>',
  arrow: '<polygon points="3,14 24,14 24,5 37,20 24,35 24,26 3,26"/>',
  heart: '<path d="M20 35 C8 27 3 20 3 13 C3 7 8 3 13 3 C16 3 19 5 20 8 C21 5 24 3 27 3 C32 3 37 7 37 13 C37 20 32 27 20 35Z" fill="#ef4444"/>',
}
const STICKERS = ['😀', '😍', '🎉', '❤️', '⭐', '🔥', '✅', '📍', '📞', '✉️', '🎁', '🌙', '🕌', '☕', '🍔', '🍕', '🛍️', '💡', '🏆', '🎂', '👍', '💯', '🌸', '🚀']

function ElementsTab() {
  const ctl = useEditor()
  const { t } = useI18n()
  return (
    <div>
      <Title>{t('shapes')}</Title>
      <div className="grid grid-cols-4 gap-2">
        {SHAPES.map((s) => (
          <button key={s} title={s} onClick={() => ctl.addShape(s)} className="flex aspect-square items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100">
            <svg viewBox="0 0 40 40" className="h-9 w-9 fill-brand-600" dangerouslySetInnerHTML={{ __html: SHAPE_SVG[s] }} />
          </button>
        ))}
      </div>
      <Title>{t('lines')}</Title>
      <div className="grid grid-cols-3 gap-2">
        {(['line', 'dashed', 'thick'] as const).map((s) => (
          <button key={s} onClick={() => ctl.addShape(s)} className="flex h-12 items-center justify-center rounded-lg bg-slate-50 px-2 hover:bg-slate-100">
            <div className={`w-full border-slate-800 ${s === 'dashed' ? 'border-t-2 border-dashed' : s === 'thick' ? 'border-t-[6px]' : 'border-t-2'}`} />
          </button>
        ))}
      </div>
      <Title>Stickers</Title>
      <div className="grid grid-cols-6 gap-1">
        {STICKERS.map((e) => (
          <button
            key={e}
            onClick={async () => {
              await ctl.addText('heading', e, 'en')
              ctl.setProps({ fontSize: Math.min(ctl.W, ctl.H) * 0.15, fontWeight: 'normal' })
            }}
            className="aspect-square rounded-lg text-2xl hover:bg-slate-100"
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  )
}

const uploaded: string[] = []

function UploadsTab() {
  const ctl = useEditor()
  const { t } = useI18n()
  const [, force] = useState(0)
  const [busy, setBusy] = useState<string | null>(null)
  return (
    <div className="space-y-3">
      {busy && <Overlay text={busy} />}
      <Button
        variant="primary"
        className="w-full"
        onClick={async () => {
          const files = await pickFiles('image/*', true)
          for (const f of files) {
            const url = await fileToImageDataUrl(f)
            uploaded.unshift(url)
            await ctl.addImage(url, f.name)
          }
          force((x) => x + 1)
        }}
      >
        <ImageIcon size={16} /> {t('uploadImage')}
      </Button>
      <Button
        className="w-full"
        onClick={async () => {
          const [f] = await pickFiles('.psd')
          if (!f) return
          setBusy(t('importingPsd'))
          try {
            const res = await importPsd(await f.arrayBuffer())
            const s = Math.min(ctl.W / res.width, ctl.H / res.height, 1)
            await ctl.addSerialized(
              res.objects.map((o) => ({
                ...o,
                left: ((o.left as number) ?? 0) * s,
                top: ((o.top as number) ?? 0) * s,
                scaleX: ((o.scaleX as number) ?? 1) * s,
                scaleY: ((o.scaleY as number) ?? 1) * s,
              })),
            )
          } catch (e) {
            console.error(e)
            alert(t('psdError'))
          } finally {
            setBusy(null)
          }
        }}
      >
        <Layers size={16} /> {t('uploadPsd')}
      </Button>
      <p className="text-xs text-slate-500">{t('dropHint')}</p>
      <p className="text-xs text-slate-400">{t('psdNote')}</p>
      <div className="grid grid-cols-2 gap-2">
        {uploaded.map((u, i) => (
          <button key={i} onClick={() => ctl.addImage(u)} className="checker aspect-square overflow-hidden rounded-lg border border-slate-200">
            <img src={u} alt="" className="h-full w-full object-contain" />
          </button>
        ))}
      </div>
    </div>
  )
}

interface Photo {
  id: string
  author: string
  width: number
  height: number
}

function PhotosTab() {
  const ctl = useEditor()
  const { t } = useI18n()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    setLoading(true)
    fetch(`https://picsum.photos/v2/list?page=${page}&limit=24`)
      .then((r) => r.json())
      .then((list: Photo[]) => setPhotos((p) => [...p, ...list]))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page])
  return (
    <div>
      <p className="mb-2 text-xs text-slate-500">{t('photosHint')}</p>
      <div className="grid grid-cols-2 gap-2">
        {photos.map((p) => {
          const w = 1600
          const h = Math.round((p.height / p.width) * w)
          return (
            <button
              key={p.id}
              title={p.author}
              onClick={() => ctl.addImage(`https://picsum.photos/id/${p.id}/${w}/${h}`, `Photo · ${p.author}`)}
              onContextMenu={(e) => {
                e.preventDefault()
                ctl.addImage(`https://picsum.photos/id/${p.id}/${w}/${h}`, 'Background', { asBackground: true })
              }}
              className="overflow-hidden rounded-lg"
            >
              <img src={`https://picsum.photos/id/${p.id}/300/200`} alt={p.author} loading="lazy" className="aspect-[3/2] w-full object-cover hover:opacity-80" />
            </button>
          )
        })}
      </div>
      <Button className="mt-3 w-full" disabled={loading} onClick={() => setPage((p) => p + 1)}>
        {loading ? '…' : '+'}
      </Button>
    </div>
  )
}

const GRADIENTS: [string, string][] = [
  ['#7c3aed', '#db2777'],
  ['#06b6d4', '#3b82f6'],
  ['#f97316', '#facc15'],
  ['#10b981', '#06b6d4'],
  ['#0f172a', '#334155'],
  ['#f43f5e', '#fb923c'],
  ['#a78bfa', '#f0abfc'],
  ['#1e3a8a', '#0f172a'],
]

function BackgroundTab() {
  const ctl = useEditor()
  const { t } = useI18n()
  useEditorUi((s) => s.tick)
  return (
    <div className="space-y-4">
      <ColorField label={t('bgColor')} value={ctl.backgroundColor} onChange={(c) => ctl.setBackgroundColor(c)} />
      <div>
        <span className="mb-1 block text-xs font-semibold text-slate-500">{t('gradients')}</span>
        <div className="grid grid-cols-4 gap-2">
          {GRADIENTS.map(([a, b]) => (
            <button key={a + b} onClick={() => ctl.setBackgroundGradient(a, b)} className="aspect-square rounded-lg" style={{ background: `linear-gradient(135deg, ${a}, ${b})` }} />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <span className="block text-xs font-semibold text-slate-500">{t('bgImage')}</span>
        <Button
          className="w-full"
          onClick={async () => {
            const [f] = await pickFiles('image/*')
            if (f) await ctl.addImage(await fileToImageDataUrl(f, 3000), 'Background', { asBackground: true })
          }}
        >
          <ImageIcon size={16} /> {t('uploadImage')}
        </Button>
        {ctl.canvas.backgroundImage && (
          <Button variant="danger" className="w-full" onClick={() => ctl.clearBackgroundImage()}>
            {t('removeBgImage')}
          </Button>
        )}
      </div>
    </div>
  )
}

function LayersTab() {
  const ctl = useEditor()
  const { t } = useI18n()
  const sel = useEditorUi((s) => s.selection)
  useEditorUi((s) => s.tick)
  const [drag, setDrag] = useState<number | null>(null)
  const objs = ctl.canvas.getObjects() as Obj[]
  const selected = new Set(sel ? ('getObjects' in sel && sel.type === 'activeselection' ? (sel as unknown as { getObjects: () => Obj[] }).getObjects() : [sel]) : [])
  const list = objs.map((o, i) => ({ o, i })).reverse()
  return (
    <div className="space-y-1">
      {list.length === 0 && <p className="text-sm text-slate-400">—</p>}
      {list.map(({ o, i }) => (
        <div
          key={i + (o.name ?? '')}
          draggable
          onDragStart={() => setDrag(i)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (drag !== null && drag !== i) ctl.moveLayer(objs[drag], i)
            setDrag(null)
          }}
          onClick={() => ctl.select(o)}
          className={`group flex cursor-pointer items-center gap-1.5 rounded-lg border px-1.5 py-1 text-sm ${
            selected.has(o) ? 'border-brand-500 bg-brand-50' : 'border-transparent hover:bg-slate-50'
          } ${o.visible ? '' : 'opacity-50'}`}
        >
          <GripVertical size={14} className="shrink-0 cursor-grab text-slate-300" />
          <LayerThumb o={o} />
          <LayerName o={o} onRename={(name) => {
            o.name = name
            ctl.modified(o)
          }} />
          <button
            title={o.visible ? t('hide') : t('show')}
            className="rounded p-1 text-slate-500 hover:bg-slate-200"
            onClick={(e) => {
              e.stopPropagation()
              ctl.toggleVisible(o)
            }}
          >
            {o.visible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button
            title={o.locked ? t('unlock') : t('lock')}
            className="rounded p-1 text-slate-500 hover:bg-slate-200"
            onClick={(e) => {
              e.stopPropagation()
              ctl.toggleLock(o)
            }}
          >
            {o.locked ? <Lock size={14} /> : <Unlock size={14} className="opacity-40" />}
          </button>
        </div>
      ))}
    </div>
  )
}

const layerLabel = (o: Obj) => o.name || (o as Obj & { text?: string }).text?.slice(0, 40) || o.type

function LayerName({ o, onRename }: { o: Obj; onRename: (n: string) => void }) {
  const { t } = useI18n()
  const [editing, setEditing] = useState(false)
  if (editing)
    return (
      <input
        autoFocus
        className="min-w-0 flex-1 rounded border border-brand-500 bg-white px-1 outline-none"
        defaultValue={layerLabel(o)}
        onClick={(e) => e.stopPropagation()}
        onBlur={(e) => {
          onRename(e.target.value)
          setEditing(false)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === 'Escape') (e.target as HTMLInputElement).blur()
        }}
      />
    )
  return (
    <span className="min-w-0 flex-1 truncate" title={t('rename')} onDoubleClick={() => setEditing(true)} dir="auto">
      {layerLabel(o)}
    </span>
  )
}

function LayerThumb({ o }: { o: Obj }) {
  const [src, setSrc] = useState<string>('')
  useEffect(() => {
    try {
      const m = 28 / Math.max(o.getScaledWidth(), o.getScaledHeight(), 1)
      setSrc(o.toDataURL({ multiplier: Math.min(1, m * 2) }))
    } catch {
      setSrc('')
    }
  }, [o])
  return (
    <div className="checker flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded border border-slate-200">
      {src && <img src={src} alt="" className="max-h-full max-w-full" />}
    </div>
  )
}
