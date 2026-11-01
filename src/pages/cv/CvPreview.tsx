import { Globe, Mail, MapPin, Phone } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import { CV_LABELS, type CvData, type CvEntry, type CvSettings } from './cvData'

// A4 at 96 dpi
export const A4_W = 794
export const A4_H = 1123

export function CvPreview({ data, s }: { data: CvData; s: CvSettings }) {
  const L = CV_LABELS[s.dir === 'rtl' ? 'ar' : 'en']
  const skills = data.skills
    .split(/[,،\n]/)
    .map((x) => x.trim())
    .filter(Boolean)
  const style: CSSProperties = { width: A4_W, minHeight: A4_H, fontFamily: `"${s.font}", sans-serif`, direction: s.dir, ['--accent' as string]: s.accent }

  const contact = [
    data.email && { icon: Mail, text: data.email },
    data.phone && { icon: Phone, text: data.phone },
    data.location && { icon: MapPin, text: data.location },
    data.website && { icon: Globe, text: data.website },
  ].filter(Boolean) as { icon: typeof Mail; text: string }[]

  const Entries = ({ items }: { items: CvEntry[] }) => (
    <div className="space-y-3">
      {items.map((e) => (
        <div key={e.id} className="break-inside-avoid">
          <div className="flex items-baseline justify-between gap-3">
            <div className="font-bold text-slate-900">{e.title}</div>
            {(e.start || e.end) && (
              <div className="shrink-0 text-xs text-slate-500">
                {e.start}
                {e.start && ' – '}
                {e.end || (e.start ? L.present : '')}
              </div>
            )}
          </div>
          {e.subtitle && <div className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>{e.subtitle}</div>}
          {e.desc && <div className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-slate-600">{e.desc}</div>}
        </div>
      ))}
    </div>
  )

  const H = ({ children, light }: { children: ReactNode; light?: boolean }) => {
    if (s.template === 'classic')
      return <h2 className="mb-2 border-b-2 pb-1 text-sm font-black uppercase tracking-widest" style={{ borderColor: 'var(--accent)', color: light ? '#fff' : 'var(--accent)' }}>{children}</h2>
    if (s.template === 'minimal')
      return <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{children}</h2>
    if (s.template === 'bold')
      return (
        <h2 className="mb-3 inline-block rounded-md px-3 py-1 text-sm font-black text-white" style={{ background: 'var(--accent)' }}>
          {children}
        </h2>
      )
    return (
      <h2 className="mb-2 flex items-center gap-2 text-base font-black" style={{ color: light ? '#fff' : 'var(--accent)' }}>
        <span className="h-4 w-1.5 rounded-full" style={{ background: light ? '#fff' : 'var(--accent)' }} />
        {children}
      </h2>
    )
  }

  const main = (
    <>
      {data.summary && (
        <section className="mb-5">
          <H>{L.summary}</H>
          <p className="text-[13px] leading-relaxed text-slate-600">{data.summary}</p>
        </section>
      )}
      {data.experience.length > 0 && (
        <section className="mb-5">
          <H>{L.experience}</H>
          <Entries items={data.experience} />
        </section>
      )}
      {data.education.length > 0 && (
        <section className="mb-5">
          <H>{L.education}</H>
          <Entries items={data.education} />
        </section>
      )}
      {data.projects.length > 0 && (
        <section className="mb-5">
          <H>{L.projects}</H>
          <Entries items={data.projects} />
        </section>
      )}
      {data.certificates.length > 0 && (
        <section className="mb-5">
          <H>{L.certificates}</H>
          <Entries items={data.certificates} />
        </section>
      )}
    </>
  )

  const Photo = ({ size = 120, ring = '#fff' }: { size?: number; ring?: string }) =>
    data.photo ? <img src={data.photo} alt="" className="rounded-full object-cover" style={{ width: size, height: size, boxShadow: `0 0 0 4px ${ring}` }} /> : null

  if (s.template === 'modern') {
    return (
      <div className="cv-page flex bg-white" style={style}>
        <aside className="w-[265px] shrink-0 space-y-6 p-7 text-white" style={{ background: 'var(--accent)' }}>
          <div className="flex justify-center">
            <Photo size={130} ring="rgba(255,255,255,0.35)" />
          </div>
          {contact.length > 0 && (
            <section>
              <H light>{L.contact}</H>
              <ul className="space-y-2 text-[12.5px]">
                {contact.map((c) => (
                  <li key={c.text} className="flex items-start gap-2 break-all">
                    <c.icon size={14} className="mt-0.5 shrink-0" /> <span dir="auto">{c.text}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {skills.length > 0 && (
            <section>
              <H light>{L.skills}</H>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((k) => (
                  <span key={k} className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold">
                    {k}
                  </span>
                ))}
              </div>
            </section>
          )}
          {data.languages.length > 0 && (
            <section>
              <H light>{L.languages}</H>
              <ul className="space-y-1 text-[13px]">
                {data.languages.map((l) => (
                  <li key={l.id} className="flex justify-between gap-2">
                    <span className="font-semibold">{l.name}</span>
                    <span className="opacity-80">{l.level}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
        <main className="flex-1 p-9">
          <header className="mb-7">
            <h1 className="text-4xl font-black text-slate-900">{data.name}</h1>
            <div className="mt-1 text-lg font-semibold" style={{ color: 'var(--accent)' }}>{data.title}</div>
          </header>
          {main}
        </main>
      </div>
    )
  }

  // Single-column templates
  const side = (
    <>
      {skills.length > 0 && (
        <section className="mb-5">
          <H>{L.skills}</H>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((k) => (
              <span key={k} className="rounded-md px-2.5 py-1 text-xs font-semibold" style={{ background: 'color-mix(in srgb, var(--accent) 12%, white)', color: 'var(--accent)' }}>
                {k}
              </span>
            ))}
          </div>
        </section>
      )}
      {data.languages.length > 0 && (
        <section className="mb-5">
          <H>{L.languages}</H>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-[13px]">
            {data.languages.map((l) => (
              <span key={l.id}>
                <b>{l.name}</b> {l.level && <span className="text-slate-500">— {l.level}</span>}
              </span>
            ))}
          </div>
        </section>
      )}
    </>
  )

  return (
    <div className="cv-page bg-white" style={style}>
      {s.template === 'bold' ? (
        <header className="flex items-center gap-6 px-10 py-9 text-white" style={{ background: 'var(--accent)' }}>
          <Photo size={110} ring="rgba(255,255,255,0.35)" />
          <div className="min-w-0 flex-1">
            <h1 className="text-4xl font-black">{data.name}</h1>
            <div className="mt-1 text-lg font-semibold opacity-90">{data.title}</div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] opacity-95">
              {contact.map((c) => (
                <span key={c.text} className="flex items-center gap-1.5">
                  <c.icon size={13} /> <span dir="auto">{c.text}</span>
                </span>
              ))}
            </div>
          </div>
        </header>
      ) : (
        <header className={`flex items-center gap-6 px-10 pt-10 ${s.template === 'classic' ? 'pb-4 text-center flex-col' : 'pb-6'}`}>
          <Photo size={100} ring="#e2e8f0" />
          <div className="min-w-0 flex-1">
            <h1 className={`font-black text-slate-900 ${s.template === 'minimal' ? 'text-3xl font-bold' : 'text-4xl'}`}>{data.name}</h1>
            <div className="mt-1 text-lg font-semibold" style={{ color: 'var(--accent)' }}>{data.title}</div>
            <div className={`mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] text-slate-600 ${s.template === 'classic' ? 'justify-center' : ''}`}>
              {contact.map((c) => (
                <span key={c.text} className="flex items-center gap-1.5">
                  <c.icon size={13} style={{ color: 'var(--accent)' }} /> <span dir="auto">{c.text}</span>
                </span>
              ))}
            </div>
          </div>
        </header>
      )}
      {s.template === 'minimal' && <div className="mx-10 h-px" style={{ background: 'var(--accent)' }} />}
      <div className="px-10 py-7">
        {main}
        {side}
      </div>
    </div>
  )
}
