import { Download, Eraser, ImagePlus, PenTool } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Button, Spinner, inputCls } from '../components/ui'
import { useI18n } from '../i18n'
import { removeBackground, type BgModel } from '../lib/bgRemoval'
import { createFromImage } from '../lib/designFlow'
import { downloadUrl, fileToImageDataUrl, loadImage, pickFiles } from '../lib/download'

const BGS = ['transparent', '#ffffff', '#000000', '#f43f5e', '#3b82f6', '#22c55e', '#facc15', '#7c3aed']

export default function RemoveBg() {
  const { t } = useI18n()
  const nav = useNavigate()
  const [src, setSrc] = useState<string | null>(null)
  const [name, setName] = useState('image')
  const [out, setOut] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [model, setModel] = useState<BgModel>('fast')
  const [bg, setBg] = useState('transparent')

  const run = async (url: string, m = model) => {
    setOut(null)
    setStatus(t('bgLoadingModel'))
    try {
      const res = await removeBackground(url, m, (stage, pct) => setStatus(stage === 'download' ? `${t('bgLoadingModel')} ${pct ?? 0}%` : t('bgProcessing')))
      setOut(res)
      setStatus(null)
    } catch (e) {
      console.error(e)
      setStatus(null)
      alert(String(e))
    }
  }

  const choose = async (file?: File) => {
    const f = file ?? (await pickFiles('image/*'))[0]
    if (!f) return
    const url = await fileToImageDataUrl(f, 2048)
    setName(f.name.replace(/\.[^.]+$/, ''))
    setSrc(url)
    run(url)
  }

  /** Flatten the result on a colour when the user picked one. */
  const finalImage = async () => {
    if (!out) return null
    if (bg === 'transparent') return out
    const img = await loadImage(out)
    const c = document.createElement('canvas')
    c.width = img.naturalWidth
    c.height = img.naturalHeight
    const ctx = c.getContext('2d')!
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, c.width, c.height)
    ctx.drawImage(img, 0, 0)
    return c.toDataURL('image/png')
  }

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-4 py-8" onDragOver={(e) => e.preventDefault()} onDrop={(e) => {
        e.preventDefault()
        const f = e.dataTransfer.files[0]
        if (f?.type.startsWith('image/')) choose(f)
      }}>
        <h1 className="text-3xl font-black">{t('bgTitle')}</h1>
        <p className="mt-2 text-slate-600">{t('bgSub')}</p>

        <div className="mt-6 flex flex-wrap items-end gap-3">
          <Button variant="primary" className="h-12 px-6" onClick={() => choose()}>
            <ImagePlus size={18} /> {t('bgChoose')}
          </Button>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-500">{t('bgModel')}</span>
            <select
              className={inputCls}
              value={model}
              onChange={(e) => {
                const m = e.target.value as BgModel
                setModel(m)
                if (src) run(src, m)
              }}
            >
              <option value="fast">{t('bgFast')}</option>
              <option value="best">{t('bgBest')}</option>
            </select>
          </label>
        </div>

        {!src && (
          <button onClick={() => choose()} className="mt-6 flex h-72 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-white text-slate-500 hover:border-brand-500">
            <Eraser size={40} />
            {t('bgChoose')}
          </button>
        )}

        {src && (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <div className="mb-2 text-sm font-semibold text-slate-500">{t('bgOriginal')}</div>
              <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <img src={src} alt="" className="max-h-full max-w-full object-contain" />
              </div>
            </div>
            <div>
              <div className="mb-2 text-sm font-semibold text-slate-500">{t('bgResult')}</div>
              <div
                className={`flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-slate-200 ${bg === 'transparent' ? 'checker' : ''}`}
                style={bg !== 'transparent' ? { background: bg } : undefined}
              >
                {out ? (
                  <img src={out} alt="" className="max-h-full max-w-full object-contain" />
                ) : (
                  <div className="flex items-center gap-2 rounded-xl bg-white/90 px-4 py-3 font-semibold">
                    <Spinner className="text-brand-600" /> {status}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {out && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-slate-500">{t('bgReplace')}:</span>
            {BGS.map((c) => (
              <button
                key={c}
                title={c === 'transparent' ? t('transparent') : c}
                onClick={() => setBg(c)}
                className={`h-8 w-8 rounded-lg border ${c === 'transparent' ? 'checker' : ''} ${bg === c ? 'ring-2 ring-brand-500 ring-offset-1' : 'border-slate-300'}`}
                style={c !== 'transparent' ? { background: c } : undefined}
              />
            ))}
            <input type="color" value={bg.startsWith('#') ? bg : '#ffffff'} onChange={(e) => setBg(e.target.value)} className="h-8 w-10" />
            <div className="ms-auto flex gap-2">
              <Button
                variant="primary"
                onClick={async () => {
                  const url = await finalImage()
                  if (url) downloadUrl(url, `${name}-no-bg.png`)
                }}
              >
                <Download size={16} /> {t('bgDownload')}
              </Button>
              <Button
                onClick={async () => {
                  const url = await finalImage()
                  if (url) nav(`/editor/${await createFromImage(url, name)}`)
                }}
              >
                <PenTool size={16} /> {t('bgOpenInEditor')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
