import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchPost, fetchPosts, useWp, type WpArticle } from '../api/content'
import { isWoo } from '../api/wp'
import { PageHeader } from '../components/PageHeader'
import { PageLoading, WpHtml } from '../components/WpHtml'
import { articles as demoArticles, findArticle, type Article as ArticleData } from '../data/journal'
import journalImage from '../assets/headers/journal-1200.webp'
import { NotFound } from './NotFound'

const date = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

export function Journal() {
  const { data, error } = useWp(isWoo ? 'posts' : null, fetchPosts)
  if (!isWoo) return <JournalView articles={demoArticles} />
  if (error) return <NotFound />
  if (!data) return <PageLoading />
  return <JournalView articles={data} />
}

function JournalView({ articles }: { articles: ArticleData[] }) {
  const [lead, ...rest] = articles
  if (!lead)
    return (
      <div className="pb-24">
        <PageHeader eyebrow="The Rfaheya Journal" title="Notes on fragrance" image={journalImage}>
          <p className="mt-3 text-ink-soft">New articles are on their way.</p>
        </PageHeader>
      </div>
    )
  return (
    <div className="pb-16 lg:pb-24">
      <PageHeader eyebrow="The Rfaheya Journal" title="Notes on fragrance" image={journalImage}>
        <p className="mt-3 max-w-xl text-[15px] text-ink-soft sm:text-[16px]">Guides, stories and small rituals for wearing fragrance well.</p>
      </PageHeader>

      <div className="container-x mt-6 lg:mt-8">
        <Link to={`/journal/${lead.slug}`} className="group grid rf-white overflow-hidden rounded-[28px] border border-line lg:grid-cols-2">
          <img src={lead.image || undefined} srcSet={(lead as Partial<WpArticle>).srcset} sizes="(max-width: 1023px) 100vw, 50vw" fetchPriority="high" alt="" className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] lg:aspect-auto lg:h-full" />
          <div className="flex flex-col justify-center p-6 sm:p-10">
            <p className="text-[12px] tracking-[0.16em] text-muted uppercase">
              {lead.category} · {lead.readMinutes} min read
            </p>
            <h2 className="mt-3 font-serif text-[32px] leading-[1.1] sm:text-[42px]">{lead.title}</h2>
            <p className="mt-3 text-[16.5px] text-ink-soft">{lead.excerpt}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-[12.5px] font-medium tracking-[0.14em] uppercase">
              Read article <ArrowRight className="size-4 transition group-hover:translate-x-1" strokeWidth={1.5} />
            </span>
          </div>
        </Link>

        <ul className="mt-[13px] grid gap-[13px] md:grid-cols-2">
          {rest.map((a) => (
            <li key={a.slug}>
              <Link to={`/journal/${a.slug}`} className="group block h-full rf-white overflow-hidden rounded-[28px] border border-line">
                {a.image && <img src={a.image} srcSet={(a as Partial<WpArticle>).srcset} sizes="(max-width: 767px) 100vw, 33vw" alt="" loading="lazy" className="aspect-[16/9] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />}
                <div className="p-6">
                  <p className="text-[12px] tracking-[0.16em] text-muted uppercase">
                    {a.category} · {a.readMinutes} min read
                  </p>
                  <h2 className="mt-2 font-serif text-[26px] leading-[1.15]">{a.title}</h2>
                  <p className="mt-2 text-[15.5px] text-ink-soft">{a.excerpt}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function Article() {
  const { slug = '' } = useParams()
  const post = useWp(isWoo ? `post:${slug}` : null, () => fetchPost(slug))
  const list = useWp(isWoo ? 'posts' : null, fetchPosts)
  if (!isWoo) {
    const a = findArticle(slug)
    return a ? <ArticleView a={a} others={demoArticles.filter((x) => x.slug !== a.slug)} /> : <NotFound />
  }
  if (post.error || post.data === null) return <NotFound />
  if (!post.data) return <PageLoading />
  return <ArticleView a={post.data} others={(list.data ?? []).filter((x) => x.slug !== slug).slice(0, 4)} />
}

function ArticleView({ a, others }: { a: ArticleData | WpArticle; others: ArticleData[] }) {
  useEffect(() => {
    if (!a) return
    document.title = `${a.title} — Rfaheya Journal`
    return () => {
      document.title = 'Rfaheya — Speak Your Scent'
    }
  }, [a])
  const headings = a.body.filter((s) => s.heading).map((s) => s.heading as string)
  return (
    <article className="container-x space-y-4 pt-3 pb-16 lg:space-y-5 lg:pt-4 lg:pb-20">
      {/* ---------- Hero: the photo with the title on glass ---------- */}
      <header className="relative overflow-hidden rounded-[28px] bg-[#1c120b] lg:rounded-[36px]">
        {a.image && (
          <img src={a.image} srcSet={(a as Partial<WpArticle>).srcset} sizes="100vw" fetchPriority="high" alt="" className="absolute inset-0 size-full object-cover" />
        )}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#140c07]/85 via-[#140c07]/25 to-transparent" />
        <div className="relative flex min-h-[460px] flex-col justify-between p-5 text-white sm:min-h-[520px] lg:p-10">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] text-white/80 uppercase">
            <Link to="/" className="hover:text-white">Home</Link>
            <span aria-hidden>›</span>
            <Link to="/journal" className="hover:text-white">Journal</Link>
            <span aria-hidden>›</span>
            <span className="text-white">{a.category}</span>
          </nav>
          <div className="max-w-3xl">
            <p className="inline-flex flex-wrap items-center gap-2 text-[12px] font-semibold">
              <span className="rounded-full bg-olive px-3 py-1 text-on-accent">{a.category}</span>
              <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur-md">{a.readMinutes} min read</span>
              <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur-md">{date(a.date)}</span>
            </p>
            <h1 className="mt-4 font-serif text-[42px] leading-[0.98] sm:text-[64px]">{a.title}</h1>
            <p className="mt-3 max-w-xl text-[16px] text-white/80 sm:text-[18px]">{a.excerpt}</p>
          </div>
        </div>
      </header>

      {/* ---------- Body ---------- */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-5">
        <div className="rf-white rounded-[28px] px-5 py-8 shadow-[inset_0_0_0_1px_var(--color-line)] sm:px-10 sm:py-12 lg:rounded-[36px] lg:px-14">
          <div className="max-w-[44rem] text-[17px] leading-[1.8] text-ink-soft">
            {'html' in a && <WpHtml html={a.html} />}
            {a.body.map((s, i) => {
              const n = s.heading ? headings.indexOf(s.heading) + 1 : 0
              return (
                <section key={i} id={n ? `part-${n}` : undefined} className="mt-10 scroll-mt-28 first:mt-0">
                  {s.heading && (
                    <h2 className="mb-3 flex items-center gap-3 font-serif text-[28px] leading-tight text-ink sm:text-[32px]">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#f3e3c9] font-sans text-[12px] font-semibold text-gold">{String(n).padStart(2, '0')}</span>
                      {s.heading}
                    </h2>
                  )}
                  {s.paragraphs.map((p) => (
                    <p key={p} className="mt-3 first:mt-0">
                      {p}
                    </p>
                  ))}
                </section>
              )
            })}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {headings.length > 1 && (
            <nav aria-label="In this article" className="hidden rounded-[28px] bg-chip p-5 lg:block">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-gold uppercase">In this article</p>
              <ol className="mt-3 space-y-1">
                {headings.map((h, i) => (
                  <li key={h}>
                    <a href={`#part-${i + 1}`} className="flex gap-2.5 rounded-[14px] px-2.5 py-2 text-[14px] text-ink-soft transition hover:bg-white hover:text-ink">
                      <span className="text-[11.5px] font-semibold text-gold tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                      {h}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <div className="rounded-[28px] bg-[#14110d] p-6 text-white">
            <p className="text-[11px] font-semibold tracking-[0.24em] text-[#f0c27a] uppercase">Rfaheya Finder</p>
            <p className="mt-2.5 font-serif text-[28px] leading-[1.05]">
              Not sure where <span className="text-[#f0c27a] italic">to start?</span>
            </p>
            <p className="mt-2 text-[14px] text-white/65">Answer 7 quick questions and we’ll match you with your scent.</p>
            <Link
              to="/finder"
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-olive px-5 text-[11.5px] font-semibold tracking-[0.12em] text-on-accent uppercase transition hover:bg-olive-hover"
            >
              Try the finder <ArrowRight className="size-4" strokeWidth={1.6} />
            </Link>
          </div>
        </aside>
      </div>

      {/* ---------- Keep reading ---------- */}
      {others.length > 0 && (
        <section className="rounded-[28px] bg-chip px-4 py-8 lg:rounded-[36px] lg:p-12" aria-labelledby="more-title">
          <div className="flex items-end justify-between gap-4 px-1 lg:px-0">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.24em] text-gold uppercase">The journal</p>
              <h2 id="more-title" className="mt-2.5 font-serif text-[36px] leading-none sm:text-[48px]">
                Keep <span className="text-gold italic">reading.</span>
              </h2>
            </div>
            <Link to="/journal" className="inline-flex shrink-0 items-center gap-2 text-[12px] font-semibold tracking-[0.12em] uppercase hover:text-gold">
              <ArrowLeft className="size-4" strokeWidth={1.6} /> All articles
            </Link>
          </div>
          <ul className="mt-7 grid gap-2.5 sm:grid-cols-2 lg:gap-4">
            {others.map((o) => (
              <li key={o.slug}>
                <Link to={`/journal/${o.slug}`} className="group rf-white flex h-full items-center gap-4 overflow-hidden rounded-[24px] p-2 pr-5 transition hover:-translate-y-0.5">
                  {o.image && <img src={o.image} alt="" loading="lazy" className="size-24 shrink-0 rounded-[18px] object-cover sm:size-28" />}
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-semibold tracking-[0.14em] text-gold uppercase">{o.category}</span>
                    <span className="mt-1 block font-serif text-[21px] leading-tight">{o.title}</span>
                  </span>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-olive text-on-accent transition group-hover:translate-x-0.5">
                    <ArrowRight className="size-4" strokeWidth={1.6} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
