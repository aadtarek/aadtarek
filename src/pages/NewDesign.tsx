import { Layers } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Button, Field, inputCls, Overlay } from '../components/ui'
import { useI18n } from '../i18n'
import { createBlank, createFromPsd, createFromTemplate } from '../lib/designFlow'
import { pickFiles } from '../lib/download'
import { renderPage } from '../lib/fabricSetup'
import { SIZES, TEMPLATES, templateToJson } from '../lib/templates'

export default function NewDesign() {
  const { t, lang } = useI18n()
  const nav = useNavigate()
  const [w, setW] = useState(1080)
  const [h, setH] = useState(1080)
  const [busy, setBusy] = useState<string | null>(null)
  const [previews, setPreviews] = useState<Record<string, string>>({})

  useEffect(() => {
    let alive = true
    ;(async () => {
      for (const tpl of TEMPLATES) {
        const url = await renderPage(templateToJson(tpl), tpl.width, tpl.height, {
          multiplier: 360 / Math.max(tpl.width, tpl.height),
          format: 'jpeg',
          quality: 0.8,
        })
        if (!alive) return
        setPreviews((p) => ({ ...p, [tpl.id]: url }))
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const go = async (p: Promise<string>) => nav(`/editor/${await p}`)

  return (
    <Layout>
      {busy && <Overlay text={busy} />}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-black">{t('newDesign')}</h1>

        <h2 className="mb-3 text-lg font-bold">{t('chooseSize')}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {SIZES.map((s) => {
            const r = Math.min(56 / s.width, 56 / s.height)
            return (
              <button
                key={s.id}
                onClick={() => go(createBlank(s.width, s.height, s[lang]))}
                className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-brand-500 hover:shadow"
              >
                <div className="flex h-16 items-center">
                  <div className="rounded border-2 border-brand-500 bg-brand-50" style={{ width: s.width * r, height: s.height * r }} />
                </div>
                <div className="text-center text-sm font-semibold leading-tight">{s[lang]}</div>
                <div className="text-xs text-slate-400" dir="ltr">
                  {s.width}×{s.height}
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <div className="font-bold">{t('customSize')}</div>
          <div className="w-28">
            <Field label={t('width')}>
              <input type="number" min={10} max={8000} className={inputCls} value={w} onChange={(e) => setW(+e.target.value)} />
            </Field>
          </div>
          <div className="w-28">
            <Field label={t('height')}>
              <input type="number" min={10} max={8000} className={inputCls} value={h} onChange={(e) => setH(+e.target.value)} />
            </Field>
          </div>
          <Button variant="primary" onClick={() => w > 0 && h > 0 && go(createBlank(Math.min(8000, w), Math.min(8000, h), t('untitled')))}>
            {t('create')}
          </Button>
          <div className="ms-auto">
            <Button
              onClick={async () => {
                const [f] = await pickFiles('.psd')
                if (!f) return
                setBusy(t('importingPsd'))
                try {
                  await go(createFromPsd(f))
                } catch {
                  alert(t('psdError'))
                } finally {
                  setBusy(null)
                }
              }}
            >
              <Layers size={16} /> {t('orUploadPsd')}
            </Button>
          </div>
        </div>

        <h2 className="mb-3 mt-10 text-lg font-bold">{t('templates')}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => go(createFromTemplate(tpl, tpl[lang]))}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white text-start transition hover:border-brand-500 hover:shadow-lg"
            >
              <div className="flex aspect-square items-center justify-center bg-slate-100 p-3">
                {previews[tpl.id] ? (
                  <img src={previews[tpl.id]} alt="" className="max-h-full max-w-full rounded shadow" />
                ) : (
                  <div className="h-1/2 w-1/2 animate-pulse rounded bg-slate-200" />
                )}
              </div>
              <div className="p-3 text-sm font-semibold">{tpl[lang]}</div>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  )
}
