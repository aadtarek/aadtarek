import { Camera, FileDown, Plus, RotateCcw, Trash2, X } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Layout } from '../../components/Layout'
import { Button, Field, inputCls } from '../../components/ui'
import { useI18n } from '../../i18n'
import type { DictKey } from '../../i18n/dict'
import { fileToImageDataUrl, pickFiles } from '../../lib/download'
import { FONTS } from '../../lib/fonts'
import { A4_W, CvPreview } from './CvPreview'
import { emptyCv, exampleCv, newEntry, newLang, type CvData, type CvEntry, type CvSettings } from './cvData'

const ACCENTS = ['#7c3aed', '#2563eb', '#0f766e', '#dc2626', '#ea580c', '#0f172a', '#be185d', '#4d7c0f']
const STORE_KEY = 'cv-builder-v1'

function load(lang: 'ar' | 'en'): { data: CvData; s: CvSettings } {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return { data: exampleCv(lang), s: { template: 'modern', accent: ACCENTS[0], dir: lang === 'ar' ? 'rtl' : 'ltr', font: lang === 'ar' ? 'Cairo' : 'Inter' } }
}

export default function CvBuilder() {
  const { t, lang } = useI18n()
  const [state, setState] = useState(() => load(lang))
  const { data, s } = state
  const previewWrap = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.7)

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state))
    } catch {
      /* storage full (big photo) — ignore */
    }
  }, [state])

  useLayoutEffect(() => {
    const el = previewWrap.current
    if (!el) return
    const ro = new ResizeObserver(() => setScale(Math.min(1, (el.clientWidth - 16) / A4_W)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const set = (patch: Partial<CvData>) => setState((st) => ({ ...st, data: { ...st.data, ...patch } }))
  const setS = (patch: Partial<CvSettings>) => setState((st) => ({ ...st, s: { ...st.s, ...patch } }))

  const printPdf = () => {
    const node = previewRef.current?.firstElementChild as HTMLElement | null
    if (!node) return
    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'
    document.body.appendChild(iframe)
    const doc = iframe.contentDocument!
    const styles = [...document.querySelectorAll('style, link[rel="stylesheet"]')]
      .map((el) => {
        if (el instanceof HTMLLinkElement) return `<link rel="stylesheet" href="${el.href}">`
        return el.outerHTML
      })
      .join('\n')
    doc.open()
    doc.write(`<!doctype html><html dir="${s.dir}"><head><meta charset="utf-8"><title>${data.name || 'CV'}</title>${styles}
      <style>@page{size:A4;margin:0}html,body{margin:0;background:#fff}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}</style>
      </head><body>${node.outerHTML}</body></html>`)
    doc.close()
    const go = async () => {
      try {
        await iframe.contentWindow!.document.fonts.ready
      } catch {
        /* ignore */
      }
      setTimeout(() => {
        iframe.contentWindow!.focus()
        iframe.contentWindow!.print()
        setTimeout(() => iframe.remove(), 2000)
      }, 300)
    }
    if (doc.readyState === 'complete') go()
    else iframe.onload = go
  }

  return (
    <Layout>
      <div className="mx-auto grid max-w-[1400px] gap-6 px-4 py-6 lg:grid-cols-[460px_1fr]">
        {/* Form */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-black">{t('cvTitle')}</h1>
            <p className="mt-1 text-slate-600">{t('cvSub')}</p>
          </div>

          <Card>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('cvTemplate')}>
                <select className={inputCls} value={s.template} onChange={(e) => setS({ template: e.target.value as CvSettings['template'] })}>
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="minimal">Minimal</option>
                  <option value="bold">Bold</option>
                </select>
              </Field>
              <Field label={t('font')}>
                <select className={inputCls} value={s.font} onChange={(e) => setS({ font: e.target.value })}>
                  {FONTS.filter((f) => f.arabic || s.dir === 'ltr').map((f) => (
                    <option key={f.family}>{f.family}</option>
                  ))}
                </select>
              </Field>
              <Field label={t('cvLanguage')}>
                <div className="flex overflow-hidden rounded-lg border border-slate-200">
                  {(['rtl', 'ltr'] as const).map((d) => (
                    <button key={d} onClick={() => setS({ dir: d })} className={`flex-1 py-2 text-sm font-semibold ${s.dir === d ? 'bg-brand-600 text-white' : 'bg-white'}`}>
                      {d === 'rtl' ? 'عربي' : 'English'}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label={t('cvAccent')}>
                <div className="flex flex-wrap gap-1.5">
                  {ACCENTS.map((c) => (
                    <button key={c} onClick={() => setS({ accent: c })} className={`h-7 w-7 rounded-full ${s.accent === c ? 'ring-2 ring-slate-900 ring-offset-2' : ''}`} style={{ background: c }} />
                  ))}
                  <input type="color" value={s.accent} onChange={(e) => setS({ accent: e.target.value })} className="h-7 w-8" />
                </div>
              </Field>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => setState((st) => ({ ...st, data: exampleCv(st.s.dir === 'rtl' ? 'ar' : 'en') }))}>
                <RotateCcw size={14} /> {t('cvReset')}
              </Button>
              <Button size="sm" variant="danger" onClick={() => set(emptyCv())}>
                <X size={14} /> {t('cvClear')}
              </Button>
            </div>
          </Card>

          <Card title={t('cvPersonal')}>
            <div className="mb-3 flex items-center gap-3">
              <button
                onClick={async () => {
                  const [f] = await pickFiles('image/*')
                  if (f) set({ photo: await fileToImageDataUrl(f, 500) })
                }}
                className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400"
                title={t('cvPhoto')}
              >
                {data.photo ? <img src={data.photo} alt="" className="h-full w-full object-cover" /> : <Camera size={20} />}
              </button>
              {data.photo && (
                <Button size="sm" variant="ghost" onClick={() => set({ photo: '' })}>
                  <Trash2 size={14} /> {t('cvRemove')}
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  ['name', 'cvFullName'],
                  ['title', 'cvJobTitle'],
                  ['email', 'cvEmail'],
                  ['phone', 'cvPhone'],
                  ['location', 'cvLocation'],
                  ['website', 'cvWebsite'],
                ] as [keyof CvData, DictKey][]
              ).map(([k, label]) => (
                <Field key={k} label={t(label)}>
                  <input className={inputCls} value={data[k] as string} onChange={(e) => set({ [k]: e.target.value })} dir="auto" />
                </Field>
              ))}
            </div>
            <div className="mt-3">
              <Field label={t('cvSummary')}>
                <textarea rows={4} className={inputCls} value={data.summary} onChange={(e) => set({ summary: e.target.value })} dir="auto" />
              </Field>
            </div>
          </Card>

          <EntryList title={t('cvExperience')} items={data.experience} onChange={(experience) => set({ experience })} titleLabel={t('cvRole')} subLabel={t('cvCompany')} />
          <EntryList title={t('cvEducation')} items={data.education} onChange={(education) => set({ education })} titleLabel={t('cvDegree')} subLabel={t('cvSchool')} />

          <Card title={t('cvSkills')}>
            <textarea rows={3} className={inputCls} value={data.skills} onChange={(e) => set({ skills: e.target.value })} placeholder={t('cvSkillsHint')} dir="auto" />
            <p className="mt-1 text-xs text-slate-400">{t('cvSkillsHint')}</p>
          </Card>

          <Card title={t('cvLanguages')}>
            <div className="space-y-2">
              {data.languages.map((l, i) => (
                <div key={l.id} className="flex gap-2">
                  <input className={inputCls} placeholder={t('cvName')} value={l.name} dir="auto" onChange={(e) => set({ languages: data.languages.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })} />
                  <input className={inputCls} placeholder={t('cvLevel')} value={l.level} dir="auto" onChange={(e) => set({ languages: data.languages.map((x, j) => (j === i ? { ...x, level: e.target.value } : x)) })} />
                  <button className="rounded-lg px-2 text-slate-400 hover:bg-red-50 hover:text-red-600" onClick={() => set({ languages: data.languages.filter((_, j) => j !== i) })}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <Button size="sm" onClick={() => set({ languages: [...data.languages, newLang()] })}>
                <Plus size={14} /> {t('cvAdd')}
              </Button>
            </div>
          </Card>

          <EntryList title={t('cvProjects')} items={data.projects} onChange={(projects) => set({ projects })} titleLabel={t('cvName')} subLabel={t('cvLink')} />
          <EntryList title={t('cvCertificates')} items={data.certificates} onChange={(certificates) => set({ certificates })} titleLabel={t('cvName')} subLabel={t('cvCompany')} />
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">PDF: {lang === 'ar' ? 'اختار "حفظ كـ PDF" من نافذة الطباعة' : 'choose "Save as PDF" in the print dialog'}</p>
            <Button variant="primary" onClick={printPdf}>
              <FileDown size={16} /> {t('cvDownloadPdf')}
            </Button>
          </div>
          <div ref={previewWrap} className="overflow-hidden rounded-xl bg-slate-200 p-2">
            <div style={{ height: 1123 * scale }} dir="ltr">
              <div ref={previewRef} className="origin-top-left shadow-xl" style={{ transform: `scale(${scale})`, width: A4_W, direction: 'ltr' }}>
                <CvPreview data={data} s={s} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      {title && <h2 className="mb-3 font-bold">{title}</h2>}
      {children}
    </section>
  )
}

function EntryList({ title, items, onChange, titleLabel, subLabel }: { title: string; items: CvEntry[]; onChange: (v: CvEntry[]) => void; titleLabel: string; subLabel: string }) {
  const { t } = useI18n()
  const upd = (i: number, patch: Partial<CvEntry>) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x)))
  return (
    <Card title={title}>
      <div className="space-y-3">
        {items.map((e, i) => (
          <div key={e.id} className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="grid grid-cols-2 gap-2">
              <input className={inputCls} placeholder={titleLabel} value={e.title} dir="auto" onChange={(ev) => upd(i, { title: ev.target.value })} />
              <input className={inputCls} placeholder={subLabel} value={e.subtitle} dir="auto" onChange={(ev) => upd(i, { subtitle: ev.target.value })} />
              <input className={inputCls} placeholder={t('cvStart')} value={e.start} dir="auto" onChange={(ev) => upd(i, { start: ev.target.value })} />
              <input className={inputCls} placeholder={`${t('cvEnd')} (${t('cvPresent')})`} value={e.end} dir="auto" onChange={(ev) => upd(i, { end: ev.target.value })} />
            </div>
            <textarea rows={3} className={inputCls} placeholder={t('cvDescription')} value={e.desc} dir="auto" onChange={(ev) => upd(i, { desc: ev.target.value })} />
            <div className="flex justify-end">
              <Button size="sm" variant="ghost" onClick={() => onChange(items.filter((_, j) => j !== i))}>
                <Trash2 size={14} /> {t('cvRemove')}
              </Button>
            </div>
          </div>
        ))}
        <Button size="sm" onClick={() => onChange([...items, newEntry()])}>
          <Plus size={14} /> {t('cvAdd')}
        </Button>
      </div>
    </Card>
  )
}
