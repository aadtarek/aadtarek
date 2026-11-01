import { ArrowRight, ArrowLeft, ChevronDown, Copy, Download, Minus, Plus, Redo2, Trash2, Undo2, Maximize, ArrowUp, ArrowDown } from 'lucide-react'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { LangToggle } from '../../components/Layout'
import { Button, Dropdown, IconButton, MenuItem, Overlay, Spinner } from '../../components/ui'
import { useI18n } from '../../i18n'
import { designToFile } from '../../lib/designFlow'
import { downloadBlob, downloadUrl, fileToImageDataUrl, imagesToPdf, safeName } from '../../lib/download'
import { renderPage } from '../../lib/fabricSetup'
import { loadDesign, takePendingImage } from '../../lib/storage'
import { EditorController, useEditorUi } from './controller'
import { LeftPanel } from './LeftPanel'
import { PropsPanel } from './PropsPanel'

const Ctx = createContext<EditorController | null>(null)
export const useEditor = () => useContext(Ctx)!

export default function Editor() {
  const { id } = useParams()
  const nav = useNavigate()
  const { t, dir } = useI18n()
  const hostRef = useRef<HTMLDivElement>(null)
  const areaRef = useRef<HTMLDivElement>(null)
  const [ctl, setCtl] = useState<EditorController | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const { zoom, canUndo, canRedo, saving, page, pageCount, title } = useEditorUi()

  useEffect(() => {
    let c: EditorController | null = null
    let cancelled = false
    ;(async () => {
      const d = id ? await loadDesign(id) : undefined
      if (!d) {
        nav('/new')
        return
      }
      if (cancelled || !hostRef.current) return
      // Fabric wraps the <canvas> in its own DOM, so it is created outside React.
      const el = document.createElement('canvas')
      hostRef.current.replaceChildren(el)
      c = new EditorController(d)
      await c.mount(el)
      if (cancelled) {
        c.dispose()
        return
      }
      const pending = takePendingImage()
      if (pending) await c.addImage(pending, 'image')
      setCtl(c)
      // Fit once the side panels have rendered and the canvas area has its final size.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const area = areaRef.current
          if (area && c) c.fitTo(area.clientWidth, area.clientHeight)
        }),
      )
    })()
    return () => {
      cancelled = true
      if (c) {
        const ctlToClose = c
        ctlToClose.saveNow().finally(() => ctlToClose.dispose())
      }
    }
  }, [id, nav])

  useEffect(() => {
    if (!ctl) return
    const onKey = (e: KeyboardEvent) => ctl.handleKey(e)
    const onBeforeUnload = () => {
      ctl.saveNow()
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('beforeunload', onBeforeUnload)
    }
  }, [ctl])

  // Ctrl + wheel zoom
  useEffect(() => {
    const area = areaRef.current
    if (!area || !ctl) return
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      ctl.setZoom(useEditorUi.getState().zoom * (e.deltaY < 0 ? 1.1 : 0.9))
    }
    area.addEventListener('wheel', onWheel, { passive: false })
    return () => area.removeEventListener('wheel', onWheel)
  }, [ctl])

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    if (!ctl) return
    for (const f of [...e.dataTransfer.files]) {
      if (f.type.startsWith('image/')) await ctl.addImage(await fileToImageDataUrl(f), f.name)
    }
  }

  const exportAs = async (kind: 'png' | 'png-t' | 'jpg' | 'pdf' | 'json') => {
    if (!ctl) return
    const d = ctl.snapshot()
    const name = safeName(d.title)
    setBusy(t('download') + '…')
    try {
      if (kind === 'json') {
        downloadBlob(designToFile(d), `${name}.json`, 'application/json')
      } else if (kind === 'pdf') {
        const pages = []
        for (const p of d.pages) {
          pages.push({ dataUrl: await renderPage(p.json, d.width, d.height, { multiplier: 2, format: 'jpeg', quality: 0.92 }), width: d.width, height: d.height })
        }
        downloadBlob((await imagesToPdf(pages)) as BlobPart, `${name}.pdf`, 'application/pdf')
      } else {
        const json = d.pages[page].json
        const url = await renderPage(json, d.width, d.height, {
          format: kind === 'jpg' ? 'jpeg' : 'png',
          transparent: kind === 'png-t',
          multiplier: 1,
        })
        const suffix = d.pages.length > 1 ? `-${page + 1}` : ''
        downloadUrl(url, `${name}${suffix}.${kind === 'jpg' ? 'jpg' : 'png'}`)
      }
    } finally {
      setBusy(null)
    }
  }

  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft

  return (
    <Ctx.Provider value={ctl}>
      {busy && <Overlay text={busy} />}
      <div className="flex h-full flex-col bg-slate-100">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-3">
          <Link to="/" title={t('back')} className="rounded-lg p-2 hover:bg-slate-100">
            <BackIcon size={18} />
          </Link>
          <input
            value={title}
            onChange={(e) => ctl?.setTitle(e.target.value)}
            className="w-40 rounded-lg border border-transparent px-2 py-1 font-semibold hover:border-slate-200 focus:border-brand-500 focus:outline-none sm:w-64"
          />
          <span className="hidden items-center gap-1 text-xs text-slate-400 sm:flex">
            {saving ? (
              <>
                <Spinner className="h-3 w-3" /> {t('saving')}
              </>
            ) : (
              t('saved')
            )}
          </span>
          <div className="mx-2 h-6 w-px bg-slate-200" />
          <IconButton title={t('undo')} disabled={!canUndo} onClick={() => ctl?.undo()}>
            <Undo2 size={18} className="rtl:-scale-x-100" />
          </IconButton>
          <IconButton title={t('redo')} disabled={!canRedo} onClick={() => ctl?.redo()}>
            <Redo2 size={18} className="rtl:-scale-x-100" />
          </IconButton>
          <div className="ms-auto flex items-center gap-2">
            <LangToggle className="hidden sm:inline-flex" />
            <Dropdown
              button={(toggle) => (
                <Button variant="primary" onClick={toggle} disabled={!ctl}>
                  <Download size={16} /> {t('download')} <ChevronDown size={14} />
                </Button>
              )}
            >
              {(close) => (
                <>
                  {(
                    [
                      ['png', t('downloadPng')],
                      ['png-t', t('downloadPngTransparent')],
                      ['jpg', t('downloadJpg')],
                      ['pdf', t('downloadPdf')],
                      ['json', t('downloadProject')],
                    ] as const
                  ).map(([k, label]) => (
                    <MenuItem
                      key={k}
                      onClick={() => {
                        close()
                        exportAs(k)
                      }}
                    >
                      {label}
                    </MenuItem>
                  ))}
                </>
              )}
            </Dropdown>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          {ctl && <LeftPanel />}
          <div className="flex min-w-0 flex-1 flex-col">
            <div
              ref={areaRef}
              className="scroll-thin relative flex flex-1 overflow-auto"
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              onMouseDown={(e) => {
                if (e.target === e.currentTarget && ctl) {
                  ctl.canvas.discardActiveObject()
                  ctl.canvas.requestRenderAll()
                }
              }}
            >
              <div className="canvas-host m-auto p-10">
                <div ref={hostRef} className="shadow-xl ring-1 ring-black/5" />
              </div>
            </div>
            {/* Bottom bar: pages + zoom */}
            <div className="flex h-12 shrink-0 items-center gap-2 border-t border-slate-200 bg-white px-3 text-sm">
              <span className="font-semibold text-slate-500">{t('pages')}:</span>
              <div className="scroll-thin flex max-w-[50vw] items-center gap-1 overflow-x-auto">
                {Array.from({ length: pageCount }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => ctl?.goToPage(i)}
                    className={`h-8 min-w-8 rounded-md px-2 font-semibold ${i === page ? 'bg-brand-600 text-white' : 'bg-slate-100 hover:bg-slate-200'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <IconButton title={t('addPage')} onClick={() => ctl?.addPage()}>
                <Plus size={16} />
              </IconButton>
              <IconButton title={t('duplicatePage')} onClick={() => ctl?.addPage(true)}>
                <Copy size={16} />
              </IconButton>
              <IconButton title={t('page') + ' ↑'} disabled={page === 0} onClick={() => ctl?.movePage(page, page - 1)}>
                <ArrowUp size={16} className="-rotate-90 rtl:rotate-90" />
              </IconButton>
              <IconButton title={t('page') + ' ↓'} disabled={page >= pageCount - 1} onClick={() => ctl?.movePage(page, page + 1)}>
                <ArrowDown size={16} className="-rotate-90 rtl:rotate-90" />
              </IconButton>
              <IconButton title={t('deletePage')} disabled={pageCount <= 1} onClick={() => ctl?.deletePage()}>
                <Trash2 size={16} />
              </IconButton>
              <div className="ms-auto flex items-center gap-1" dir="ltr">
                <IconButton title="-" onClick={() => ctl?.setZoom(zoom / 1.2)}>
                  <Minus size={16} />
                </IconButton>
                <span className="w-12 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
                <IconButton title="+" onClick={() => ctl?.setZoom(zoom * 1.2)}>
                  <Plus size={16} />
                </IconButton>
                <IconButton
                  title={t('fit')}
                  onClick={() => areaRef.current && ctl?.fitTo(areaRef.current.clientWidth, areaRef.current.clientHeight)}
                >
                  <Maximize size={16} />
                </IconButton>
              </div>
            </div>
          </div>
          {ctl && <PropsPanel />}
        </div>
      </div>
    </Ctx.Provider>
  )
}
