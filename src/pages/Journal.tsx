import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchPost, fetchPosts, useWp, type WpArticle } from '../api/content'
import { isWoo } from '../api/wp'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { PageLoading, WpHtml } from '../components/WpHtml'
import { articles as demoArticles, findArticle, type Article as ArticleData } from '../data/journal'
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
      <div className="container-x pt-6 pb-24 lg:pt-8">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Journal' }]} />
        <h1 className="mt-8 font-serif text-[44px] leading-[1] sm:text-[60px]">Notes on fragrance.</h1>
        <p className="mt-4 text-ink-soft">New articles are on their way.</p>
      </div>
    )
  return (
    <div className="pb-16 lg:pb-24">
      <div className="container-x pt-6 lg:pt-8">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Journal' }]} />
        <p className="mt-8 text-[12px] tracking-[0.3em] text-ink-soft uppercase sm:text-[14px]">The Rfaheya Journal</p>
        <h1 className="mt-2 font-serif text-[44px] leading-[1] sm:text-[60px]">Notes on fragrance.</h1>
      </div>

      <div className="container-x mt-10">
        <Link to={`/journal/${lead.slug}`} className="group grid overflow-hidden rounded-lg bg-card shadow-[0_0_0_1px_rgba(60,45,20,0.06)] lg:grid-cols-2">
          <img src={lead.image || undefined} alt="" className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] lg:aspect-auto lg:h-full" />
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
              <Link to={`/journal/${a.slug}`} className="group block h-full overflow-hidden rounded-lg bg-card shadow-[0_0_0_1px_rgba(60,45,20,0.06)]">
                {a.image && <img src={a.image} alt="" loading="lazy" className="aspect-[16/9] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />}
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
  return (
    <article className="pb-16 lg:pb-24">
      <div className="container-x pt-6 lg:pt-8">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Journal', to: '/journal' }, { label: a.category }]} />
      </div>
      <header className="container-x mt-8 max-w-4xl text-center">
        <p className="text-[12px] tracking-[0.16em] text-muted uppercase">
          {a.category} · {a.readMinutes} min read · {date(a.date)}
        </p>
        <h1 className="mt-4 font-serif text-[40px] leading-[1.05] sm:text-[58px]">{a.title}</h1>
        <p className="mx-auto mt-4 max-w-xl text-[18px] text-ink-soft">{a.excerpt}</p>
      </header>
      {a.image && (
        <div className="container-x mt-10">
          <img src={a.image} alt="" className="aspect-[21/9] w-full rounded-lg object-cover" />
        </div>
      )}
      <div className="container-x mt-12 max-w-[44rem] text-[17.5px] leading-[1.8] text-ink-soft">
        {'html' in a && <WpHtml html={a.html} />}
        {a.body.map((s, i) => (
          <section key={i} className="mt-8 first:mt-0">
            {s.heading && <h2 className="mb-3 font-serif text-[28px] leading-tight text-ink">{s.heading}</h2>}
            {s.paragraphs.map((p) => (
              <p key={p} className="mt-3 first:mt-0">
                {p}
              </p>
            ))}
          </section>
        ))}
        <div className="mt-12 rounded-lg bg-olive p-8 text-cream">
          <p className="font-serif text-[28px] leading-tight">Not sure where to start?</p>
          <p className="mt-2 text-cream/80">Answer 7 quick questions and we’ll match you with your scent.</p>
          <Link
            to="/finder"
            className="mt-5 inline-flex h-12 items-center gap-3 rounded-[3px] border border-cream/70 px-7 text-[12px] font-medium tracking-[0.12em] uppercase transition hover:bg-cream hover:text-olive"
          >
            Try the Rfaheya Finder <ArrowRight className="size-4" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
      {others.length > 0 && (
      <div className="container-x mt-16 max-w-5xl">
        <div className="flex items-end justify-between">
          <h2 className="font-serif text-[30px]">Keep reading</h2>
          <Link to="/journal" className="inline-flex items-center gap-2 text-[12.5px] tracking-[0.14em] uppercase">
            <ArrowLeft className="size-4" strokeWidth={1.5} /> All articles
          </Link>
        </div>
        <ul className="mt-6 grid gap-[13px] sm:grid-cols-2">
          {others.map((o) => (
            <li key={o.slug}>
              <Link to={`/journal/${o.slug}`} className="group flex items-center gap-4 overflow-hidden rounded-lg bg-card p-3 shadow-[0_0_0_1px_rgba(60,45,20,0.06)]">
                {o.image && <img src={o.image} alt="" loading="lazy" className="size-24 shrink-0 rounded object-cover" />}
                <span className="font-serif text-[20px] leading-tight group-hover:underline">{o.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      )}
    </article>
  )
}
