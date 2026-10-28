import { ArrowRight } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchPage, fetchPageIndex, useWp } from '../api/content'
import { isWoo } from '../api/wp'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { PageLoading, WpHtml } from '../components/WpHtml'
import { contentPages, findContentPage, splitLabel, type ContentPage } from '../data/content'
import { NotFound } from './NotFound'

const helpLinks = [
  { to: '/returns', label: 'Returns & Refunds' },
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/track-order', label: 'Track Your Order' },
  { to: '/faqs', label: 'FAQs' },
  { to: '/contact', label: 'Contact Us' },
]

export function InfoPage() {
  const { page = '' } = useParams()
  const wpPage = useWp(isWoo ? `page:${page}` : null, () => fetchPage(page))
  const index = useWp(isWoo ? 'pages' : null, fetchPageIndex)
  const builtIn = findContentPage(page)

  if (isWoo && wpPage.data === undefined && !wpPage.error) return <PageLoading />
  // A WordPress page with this slug wins; otherwise the built-in copy (if any).
  const wpContent = isWoo ? wpPage.data : null
  if (wpContent) {
    const eyebrow = wpContent.eyebrow
    const related =
      eyebrow === 'Help' || eyebrow === 'Legal'
        ? helpLinks
        : (index.data ?? []).filter((p) => eyebrow && p.eyebrow === eyebrow).map((p) => ({ to: `/${p.slug}`, label: p.title }))
    return (
      <InfoLayout slug={wpContent.slug} title={wpContent.title} eyebrow={eyebrow} intro={wpContent.intro} related={related}>
        <WpHtml html={wpContent.html} className="text-[16.5px] leading-[1.8] text-ink-soft" />
      </InfoLayout>
    )
  }
  if (!builtIn) return <NotFound />
  const related =
    builtIn.eyebrow === 'Help' || builtIn.eyebrow === 'Legal' ? helpLinks : contentPages.filter((p) => p.eyebrow === builtIn.eyebrow).map((p) => ({ to: `/${p.slug}`, label: p.title }))
  return (
    <InfoLayout slug={builtIn.slug} title={builtIn.title} eyebrow={builtIn.eyebrow} intro={builtIn.intro} related={related}>
      <BuiltInSections content={builtIn} />
    </InfoLayout>
  )
}

function BuiltInSections({ content }: { content: ContentPage }) {
  const text = 'text-[16.5px] leading-[1.8] text-ink-soft'
  return (
    <div className="space-y-9">
      {content.sections.map((s) => (
        <section key={s.heading} className={s.level === 3 ? '-mt-3 border-l-2 border-olive/40 pl-4 sm:pl-5' : ''}>
          {s.level === 3 ? (
            <h3 className="text-[16px] font-semibold tracking-[0.01em] text-ink">{s.heading}</h3>
          ) : (
            <h2 className="font-serif text-[28px] leading-tight">{s.heading}</h2>
          )}
          {s.paragraphs?.map((p) => (
            <p key={p} className={`${s.level === 3 ? 'mt-2' : 'mt-3'} ${text}`}>
              {p}
            </p>
          ))}
          {s.list && (
            <ul className="mt-3 space-y-2.5">
              {s.list.map((li) => {
                const label = splitLabel(li)
                return (
                  <li key={li} className="flex gap-3 text-[16.5px] leading-[1.7] text-ink-soft">
                    <span aria-hidden className="mt-[11px] size-1.5 shrink-0 rounded-full bg-olive" />
                    <span>
                      {label ? (
                        <>
                          <strong className="font-semibold text-ink">{label[0]}:</strong> {label[1]}
                        </>
                      ) : (
                        li
                      )}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
          {s.after?.map((p) => (
            <p key={p} className={`mt-3 ${text}`}>
              {p}
            </p>
          ))}
        </section>
      ))}
    </div>
  )
}

function InfoLayout({
  slug,
  title,
  eyebrow,
  intro,
  related,
  children,
}: {
  slug: string
  title: string
  eyebrow: string
  intro: string
  related: { to: string; label: string }[]
  children: ReactNode
}) {
  useEffect(() => {
    document.title = `${title} — Rfaheya`
    return () => {
      document.title = 'Rfaheya — Speak Your Scent'
    }
  }, [title])
  return (
    <div className="pb-16 lg:pb-24">
      <div className="container-x pt-6 lg:pt-8">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: title }]} />
      </div>
      <div className="container-x mt-8 grid gap-12 lg:mt-10 lg:grid-cols-[1fr_17rem] lg:gap-20">
        <div className="max-w-[46rem]">
          {eyebrow && <p className="text-[12px] tracking-[0.3em] text-gold uppercase sm:text-[14px]">{eyebrow}</p>}
          <h1 className="mt-2 font-serif text-[44px] leading-[1] sm:text-[58px]">{title}</h1>
          {intro && <p className="mt-5 text-[18px] leading-[1.7] text-ink-soft">{intro}</p>}
          <div className="mt-10">{children}</div>
        </div>
        <aside className="h-fit lg:sticky lg:top-24">
          {related.length > 0 && <p className="text-[12.5px] font-semibold tracking-[0.14em] uppercase">Related</p>}
          <ul className="mt-3 border-t border-line empty:hidden">
            {related.map((r) => (
              <li key={r.to} className="border-b border-line">
                <Link
                  to={r.to}
                  aria-current={r.to === `/${slug}` ? 'page' : undefined}
                  className="flex items-center justify-between py-3.5 text-[15px] text-ink-soft hover:text-ink aria-[current=page]:font-medium aria-[current=page]:text-ink"
                >
                  {r.label}
                  <ArrowRight className="size-4" strokeWidth={1.5} />
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-lg bg-card p-5 shadow-[0_0_0_1px_rgba(60,45,20,0.06)]">
            <p className="font-serif text-[20px]">Still have questions?</p>
            <Link to="/contact" className="mt-3 inline-flex items-center gap-2 text-[12.5px] tracking-[0.12em] uppercase underline-offset-4 hover:underline">
              Contact us <ArrowRight className="size-4" strokeWidth={1.5} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
