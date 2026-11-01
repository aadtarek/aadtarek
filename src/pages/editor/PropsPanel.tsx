import { ActiveSelection, FabricImage, Group, Line, Rect, Textbox } from 'fabric'
import {
  AlignCenter,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignHorizontalJustifyStart,
  AlignJustify,
  AlignLeft,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  Bold,
  BringToFront,
  ChevronDown,
  ChevronUp,
  Copy,
  Eraser,
  FlipHorizontal2,
  FlipVertical2,
  Group as GroupIcon,
  Italic,
  Lock,
  SendToBack,
  Trash2,
  Underline,
  Ungroup,
  Unlock,
} from 'lucide-react'
import { useState } from 'react'
import { ColorField, Field, IconButton, inputCls, Slider, Spinner } from '../../components/ui'
import { useI18n } from '../../i18n'
import { removeBackground, type BgModel } from '../../lib/bgRemoval'
import { ensureFont, FONTS, hasArabic } from '../../lib/fonts'
import { useEditorUi } from './controller'
import { useEditor } from './Editor'

export function PropsPanel() {
  const { t } = useI18n()
  const sel = useEditorUi((s) => s.selection)
  useEditorUi((s) => s.tick)
  return (
    <aside className="scroll-thin hidden w-72 shrink-0 overflow-y-auto border-s border-slate-200 bg-white p-4 md:block">
      {!sel ? <p className="mt-10 text-center text-sm text-slate-400">{t('noSelection')}</p> : <Props />}
    </aside>
  )
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 border-b border-slate-100 pb-4 pt-4 first:pt-0 last:border-0">
      {title && <h4 className="text-xs font-bold uppercase tracking-wide text-slate-400">{title}</h4>}
      {children}
    </div>
  )
}

function Props() {
  const ctl = useEditor()
  const { t } = useI18n()
  const o = useEditorUi((s) => s.selection)!
  const isMulti = o instanceof ActiveSelection
  const isGroup = o instanceof Group && !isMulti
  const isText = o instanceof Textbox
  const isImage = o instanceof FabricImage
  const isLine = o instanceof Line
  const isShape = !isText && !isImage && !isGroup && !isMulti
  const fillStr = typeof o.fill === 'string' ? o.fill : '#000000'

  return (
    <div>
      {/* Common actions */}
      <Section>
        <div className="flex flex-wrap gap-1">
          <IconButton title={t('duplicate')} onClick={() => ctl.duplicate()}>
            <Copy size={17} />
          </IconButton>
          <IconButton title={t('delete')} onClick={() => ctl.deleteSelection()}>
            <Trash2 size={17} />
          </IconButton>
          <IconButton title={o.locked ? t('unlock') : t('lock')} active={o.locked} onClick={() => ctl.toggleLock()}>
            {o.locked ? <Lock size={17} /> : <Unlock size={17} />}
          </IconButton>
          {isMulti && (
            <IconButton title={t('group')} onClick={() => ctl.group()}>
              <GroupIcon size={17} />
            </IconButton>
          )}
          {isGroup && (
            <IconButton title={t('ungroup')} onClick={() => ctl.ungroup()}>
              <Ungroup size={17} />
            </IconButton>
          )}
          <IconButton title={t('flipH')} onClick={() => ctl.flip('x')}>
            <FlipHorizontal2 size={17} />
          </IconButton>
          <IconButton title={t('flipV')} onClick={() => ctl.flip('y')}>
            <FlipVertical2 size={17} />
          </IconButton>
        </div>
      </Section>

      {isText && <TextProps o={o as Textbox} />}

      {(isShape || isLine) && (
        <Section title={t('fill')}>
          {!isLine && <ColorField label={t('color')} value={fillStr} onChange={(c) => ctl.setProps({ fill: c })} />}
          <ColorField label={t('stroke')} value={typeof o.stroke === 'string' ? o.stroke : '#000000'} onChange={(c) => ctl.setProps({ stroke: c })} />
          <Slider label={t('strokeWidth')} min={0} max={60} value={o.strokeWidth ?? 0} onChange={(v) => ctl.setProps({ strokeWidth: v, stroke: o.stroke || '#000000' })} />
          {o instanceof Rect && (
            <Slider label={t('cornerRadius')} min={0} max={Math.min(o.width, o.height) / 2} value={o.rx ?? 0} onChange={(v) => ctl.setProps({ rx: v, ry: v })} />
          )}
        </Section>
      )}

      {isImage && <ImageProps o={o as FabricImage} />}

      <Section title={t('opacity')}>
        <Slider label={t('opacity')} min={0} max={1} step={0.01} value={o.opacity ?? 1} onChange={(v) => ctl.setProps({ opacity: v })} format={(v) => Math.round(v * 100) + '%'} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!o.shadow} onChange={(e) => ctl.setShadow(e.target.checked)} /> {t('shadow')}
        </label>
      </Section>

      <Section title={t('alignCanvas')}>
        <div className="grid grid-cols-6 gap-1" dir="ltr">
          <IconButton title={t('left')} onClick={() => ctl.alignToPage('left')}>
            <AlignHorizontalJustifyStart size={17} />
          </IconButton>
          <IconButton title={t('center')} onClick={() => ctl.alignToPage('center')}>
            <AlignHorizontalJustifyCenter size={17} />
          </IconButton>
          <IconButton title={t('right')} onClick={() => ctl.alignToPage('right')}>
            <AlignHorizontalJustifyEnd size={17} />
          </IconButton>
          <IconButton title={t('top')} onClick={() => ctl.alignToPage('top')}>
            <AlignVerticalJustifyStart size={17} />
          </IconButton>
          <IconButton title={t('middle')} onClick={() => ctl.alignToPage('middle')}>
            <AlignVerticalJustifyCenter size={17} />
          </IconButton>
          <IconButton title={t('bottom')} onClick={() => ctl.alignToPage('bottom')}>
            <AlignVerticalJustifyEnd size={17} />
          </IconButton>
        </div>
        <div className="grid grid-cols-4 gap-1">
          <IconButton title={t('bringToFront')} onClick={() => ctl.arrange('front')}>
            <BringToFront size={17} />
          </IconButton>
          <IconButton title={t('bringForward')} onClick={() => ctl.arrange('forward')}>
            <ChevronUp size={17} />
          </IconButton>
          <IconButton title={t('sendBackward')} onClick={() => ctl.arrange('backward')}>
            <ChevronDown size={17} />
          </IconButton>
          <IconButton title={t('sendToBack')} onClick={() => ctl.arrange('back')}>
            <SendToBack size={17} />
          </IconButton>
        </div>
        <div className="grid grid-cols-2 gap-2" dir="ltr">
          {(['left', 'top'] as const).map((k) => (
            <label key={k} className="flex items-center gap-1 text-xs text-slate-500">
              {k === 'left' ? 'X' : 'Y'}
              <input
                type="number"
                className={inputCls + ' py-1'}
                value={Math.round(o[k] ?? 0)}
                onChange={(e) => {
                  o.set(k, Number(e.target.value))
                  ctl.modified(o)
                }}
              />
            </label>
          ))}
          <label className="flex items-center gap-1 text-xs text-slate-500">
            W
            <input
              type="number"
              className={inputCls + ' py-1'}
              value={Math.round(o.getScaledWidth())}
              onChange={(e) => {
                const v = Number(e.target.value)
                if (v > 0) {
                  if (isText) o.set('width', v / (o.scaleX ?? 1))
                  else o.scaleToWidth(v)
                  ctl.modified(o)
                }
              }}
            />
          </label>
          <label className="flex items-center gap-1 text-xs text-slate-500">
            °
            <input
              type="number"
              className={inputCls + ' py-1'}
              value={Math.round(o.angle ?? 0)}
              onChange={(e) => {
                o.rotate(Number(e.target.value))
                ctl.modified(o)
              }}
            />
          </label>
        </div>
      </Section>
    </div>
  )
}

function TextProps({ o }: { o: Textbox }) {
  const ctl = useEditor()
  const { t } = useI18n()
  const arabic = hasArabic(o.text ?? '')
  const fonts = [...FONTS].sort((a, b) => Number(b.arabic === arabic) - Number(a.arabic === arabic))
  return (
    <Section title={t('text')}>
      <Field label={t('font')}>
        <select
          className={inputCls}
          value={o.fontFamily}
          style={{ fontFamily: o.fontFamily }}
          onChange={async (e) => {
            await ensureFont(e.target.value, o.fontWeight as string)
            ctl.setProps({ fontFamily: e.target.value })
          }}
        >
          {fonts.map((f) => (
            <option key={f.family} value={f.family} style={{ fontFamily: f.family }}>
              {f.family}
              {f.arabic ? ' · عربي' : ''}
            </option>
          ))}
        </select>
      </Field>
      <div className="flex items-end gap-2">
        <div className="w-24">
          <Field label={t('fontSize')}>
            <input type="number" min={4} className={inputCls} value={Math.round(o.fontSize ?? 0)} onChange={(e) => ctl.setProps({ fontSize: Math.max(4, Number(e.target.value)) })} />
          </Field>
        </div>
        <IconButton
          title={t('bold')}
          active={o.fontWeight === 'bold' || Number(o.fontWeight) >= 600}
          onClick={async () => {
            const w = o.fontWeight === 'bold' || Number(o.fontWeight) >= 600 ? 'normal' : 'bold'
            await ensureFont(o.fontFamily, w)
            ctl.setProps({ fontWeight: w })
          }}
        >
          <Bold size={17} />
        </IconButton>
        <IconButton title={t('italic')} active={o.fontStyle === 'italic'} onClick={() => ctl.setProps({ fontStyle: o.fontStyle === 'italic' ? 'normal' : 'italic' })}>
          <Italic size={17} />
        </IconButton>
        <IconButton title={t('underline')} active={!!o.underline} onClick={() => ctl.setProps({ underline: !o.underline })}>
          <Underline size={17} />
        </IconButton>
      </div>
      <ColorField label={t('color')} value={typeof o.fill === 'string' ? o.fill : '#000000'} onChange={(c) => ctl.setProps({ fill: c })} />
      <div className="flex items-center gap-1" dir="ltr">
        {(
          [
            ['left', AlignLeft],
            ['center', AlignCenter],
            ['right', AlignRight],
            ['justify', AlignJustify],
          ] as const
        ).map(([a, Icon]) => (
          <IconButton key={a} title={a} active={o.textAlign === a} onClick={() => ctl.setProps({ textAlign: a })}>
            <Icon size={17} />
          </IconButton>
        ))}
        <div className="ms-auto flex overflow-hidden rounded-lg border border-slate-200 text-xs font-bold">
          {(['rtl', 'ltr'] as const).map((d) => (
            <button key={d} onClick={() => ctl.setProps({ direction: d })} className={`px-2 py-1.5 ${o.direction === d ? 'bg-brand-600 text-white' : 'hover:bg-slate-50'}`}>
              {d.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <Slider label={t('lineHeight')} min={0.6} max={3} step={0.05} value={o.lineHeight ?? 1.2} onChange={(v) => ctl.setProps({ lineHeight: v })} />
      <div>
        <Slider label={t('letterSpacing')} min={-100} max={800} step={10} value={o.charSpacing ?? 0} onChange={(v) => ctl.setProps({ charSpacing: v })} />
        {arabic && (o.charSpacing ?? 0) !== 0 && <p className="mt-1 text-xs text-amber-600">{t('letterSpacingArabicWarn')}</p>}
      </div>
      <ColorField label={t('stroke')} value={typeof o.stroke === 'string' ? o.stroke : '#000000'} onChange={(c) => ctl.setProps({ stroke: c, strokeWidth: o.strokeWidth || 2 })} />
      <Slider label={t('strokeWidth')} min={0} max={20} step={0.5} value={o.stroke ? (o.strokeWidth ?? 0) : 0} onChange={(v) => ctl.setProps({ strokeWidth: v, stroke: v ? o.stroke || '#000000' : null, paintFirst: 'stroke' })} />
    </Section>
  )
}

function ImageProps({ o }: { o: FabricImage }) {
  const ctl = useEditor()
  const { t } = useI18n()
  const [bgBusy, setBgBusy] = useState<string | null>(null)
  const [model, setModel] = useState<BgModel>('fast')
  const f = (k: 'Brightness' | 'Contrast' | 'Saturation' | 'Blur') => ctl.getFilterValue(o, k)
  return (
    <>
      <Section title={t('removeBackground')}>
        <select className={inputCls} value={model} onChange={(e) => setModel(e.target.value as BgModel)}>
          <option value="fast">{t('bgFast')}</option>
          <option value="best">{t('bgBest')}</option>
        </select>
        <button
          disabled={!!bgBusy}
          onClick={async () => {
            setBgBusy(t('bgLoadingModel'))
            try {
              const src = o.getSrc()
              const out = await removeBackground(src, model, (stage, pct) =>
                setBgBusy(stage === 'download' ? `${t('bgLoadingModel')} ${pct ?? 0}%` : t('removingBackground')),
              )
              await ctl.replaceImageSrc(o, out)
            } catch (e) {
              console.error(e)
              alert(String(e))
            } finally {
              setBgBusy(null)
            }
          }}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 py-2 font-semibold text-white disabled:opacity-60"
        >
          {bgBusy ? <Spinner /> : <Eraser size={16} />} {bgBusy ?? t('removeBackground')}
        </button>
      </Section>
      <Section title={t('filters')}>
        <Slider label={t('brightness')} min={-0.6} max={0.6} step={0.02} value={f('Brightness')} onChange={(v) => ctl.setFilter(o, 'Brightness', v)} />
        <Slider label={t('contrast')} min={-0.6} max={0.6} step={0.02} value={f('Contrast')} onChange={(v) => ctl.setFilter(o, 'Contrast', v)} />
        <Slider label={t('saturation')} min={-1} max={1} step={0.02} value={f('Saturation')} onChange={(v) => ctl.setFilter(o, 'Saturation', v)} />
        <Slider label={t('blur')} min={0} max={0.5} step={0.01} value={f('Blur')} onChange={(v) => ctl.setFilter(o, 'Blur', v)} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={ctl.getFilterValue(o, 'Grayscale') === 1} onChange={(e) => ctl.setFilter(o, 'Grayscale', e.target.checked ? 1 : 0)} /> {t('grayscale')}
        </label>
      </Section>
      <Section title={t('cornerRadius')}>
        <Slider
          label={t('cornerRadius')}
          min={0}
          max={50}
          value={((o.clipPath as Rect | undefined)?.rx ?? 0) / (Math.min(o.width, o.height) / 100) || 0}
          onChange={(v) => {
            const r = (Math.min(o.width, o.height) / 100) * v
            o.clipPath = v ? new Rect({ width: o.width, height: o.height, rx: r, ry: r, originX: 'center', originY: 'center' }) : undefined
            o.dirty = true
            ctl.modified(o)
          }}
          format={(v) => Math.round(v) + '%'}
        />
      </Section>
    </>
  )
}
