import { Copy, Eraser, FileText, FolderOpen, Layers, LayoutTemplate, Plus, Trash2, UserSquare2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Button, Overlay } from '../components/ui'
import { useI18n } from '../i18n'
import { pickFiles } from '../lib/download'
import { deleteDesign, duplicateDesign, listDesigns, type DesignMeta } from '../lib/storage'

export default function Home() {
  const { t } = useI18n()
  const nav = useNavigate()
  const [designs, setDesigns] = useState<DesignMeta[]>([])
  const [busy, setBusy] = useState<string | null>(null)

  const refresh = () => listDesigns().then(setDesigns)
  useEffect(() => {
    refresh()
  }, [])

  const openPsd = async () => {
    const [f] = await pickFiles('.psd,image/vnd.adobe.photoshop')
    if (!f) return
    setBusy(t('importingPsd'))
    try {
      const { createFromPsd } = await import('../lib/designFlow')
      const id = await createFromPsd(f)
      nav(`/editor/${id}`)
    } catch (e) {
      console.error(e)
      alert(t('psdError'))
    } finally {
      setBusy(null)
    }
  }

  const openProject = async () => {
    const [f] = await pickFiles('.json,application/json')
    if (!f) return
    try {
      const { importDesignFile } = await import('../lib/designFlow')
      nav(`/editor/${await importDesignFile(f)}`)
    } catch {
      alert('Invalid file')
    }
  }

  const tools = [
    { to: '/new', icon: LayoutTemplate, title: t('toolDesign'), desc: t('toolDesignDesc'), color: 'from-violet-500 to-fuchsia-500' },
    { onClick: openPsd, icon: Layers, title: t('toolPsd'), desc: t('toolPsdDesc'), color: 'from-sky-500 to-blue-600' },
    { to: '/cv', icon: UserSquare2, title: t('toolCv'), desc: t('toolCvDesc'), color: 'from-emerald-500 to-teal-600' },
    { to: '/remove-bg', icon: Eraser, title: t('toolBg'), desc: t('toolBgDesc'), color: 'from-amber-500 to-orange-600' },
    { to: '/pdf', icon: FileText, title: t('toolPdf'), desc: t('toolPdfDesc'), color: 'from-rose-500 to-red-600' },
  ]

  return (
    <Layout>
      {busy && <Overlay text={busy} />}
      <section className="bg-gradient-to-b from-brand-50 to-transparent">
        <div className="mx-auto max-w-7xl px-4 py-14 text-center">
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">{t('heroTitle')}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">{t('heroSub')}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/new">
              <Button variant="primary" className="h-12 px-6 text-base">
                <Plus size={18} /> {t('startDesign')}
              </Button>
            </Link>
            <Button className="h-12 px-6 text-base" onClick={openProject}>
              <FolderOpen size={18} /> {t('importProject')}
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4">
        <h2 className="mb-4 text-xl font-bold">{t('tools')}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {tools.map((tool) => {
            const inner = (
              <div className="group h-full rounded-2xl border border-slate-200 bg-white p-5 text-start transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${tool.color} text-white`}>
                  <tool.icon size={24} />
                </div>
                <h3 className="font-bold">{tool.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{tool.desc}</p>
              </div>
            )
            return tool.to ? (
              <Link key={tool.title} to={tool.to}>
                {inner}
              </Link>
            ) : (
              <button key={tool.title} onClick={tool.onClick} className="text-start">
                {inner}
              </button>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="mb-4 text-xl font-bold">{t('recentDesigns')}</h2>
        {designs.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">{t('noDesigns')}</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {designs.map((d) => (
              <div key={d.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <Link to={`/editor/${d.id}`} className="checker flex aspect-square items-center justify-center overflow-hidden">
                  {d.thumbnail ? <img src={d.thumbnail} alt="" className="max-h-full max-w-full object-contain shadow" /> : null}
                </Link>
                <div className="flex items-center gap-1 p-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{d.title || t('untitled')}</div>
                    <div className="text-xs text-slate-400" dir="ltr">
                      {d.width}×{d.height}
                    </div>
                  </div>
                  <button
                    title={t('duplicate')}
                    className="rounded p-1.5 text-slate-500 hover:bg-slate-100"
                    onClick={async () => {
                      await duplicateDesign(d.id, '(2)')
                      refresh()
                    }}
                  >
                    <Copy size={15} />
                  </button>
                  <button
                    title={t('delete')}
                    className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                    onClick={async () => {
                      if (confirm(t('confirmDelete'))) {
                        await deleteDesign(d.id)
                        refresh()
                      }
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="mt-8 text-center text-sm text-slate-400">{t('privacyNote')}</p>
      </section>
    </Layout>
  )
}
