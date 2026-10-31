import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import heroBg from '../assets/standard-page/hero.webp'
import heroMobile from '../assets/standard-page/m-hero.webp'
import whyBg from '../assets/standard-page/why.webp'
import { dimensions } from '../data/standard'
import { pillars } from '../data/pillars'

const eyebrow = 'text-[11px] font-semibold tracking-[0.24em] text-gold uppercase'
const imageOf = (title: string) => pillars.find((p) => p.title === title)?.image

/**
 * The Rfaheya Standard™: what it is, why it exists, and the six dimensions —
 * one at a time in a viewer (?dimension= keeps the open one in the address).
 */
export function OurStandard() {
  const [params, setParams] = useSearchParams()
  const initial = Math.max(0, dimensions.findIndex((d) => d.slug === params.get('dimension')))
  const [active, setActive] = useState(initial)
  const viewer = useRef<HTMLElement>(null)
  const firstRender = useRef(true)

  // Keep ?dimension= in the address so a dimension can be shared or reloaded.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      if (params.get('dimension')) viewer.current?.scrollIntoView({ block: 'start' })
      return
    }
    setParams({ dimension: dimensions[active].slug }, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  const pick = (i: number) => {
    setActive(i)
    viewer.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const d = dimensions[active]
  const go = (step: number) => setActive((active + step + dimensions.length) % dimensions.length)

  return (
    <div className="container-x space-y-4 pt-3 pb-16 [font-variant-numeric:lining-nums] lg:space-y-5 lg:pt-4 lg:pb-20">
      {/* ---------- Hero ---------- */}
      <section aria-labelledby="standard-hero-title" className="relative overflow-hidden rounded-[28px] bg-[#1c120b] lg:rounded-[36px]">
        <picture>
          <source media="(max-width: 767px)" srcSet={heroMobile} />
          <img src={heroBg} alt="" fetchPriority="high" className="absolute inset-0 size-full object-cover object-[70%_center]" />
        </picture>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#140c07]/90 via-[#140c07]/35 to-transparent md:bg-gradient-to-r md:from-[#140c07]/85 md:via-[#140c07]/40" />
        <div className="relative flex min-h-[600px] flex-col justify-end px-6 pt-40 pb-8 md:min-h-[640px] md:justify-center md:px-14 md:py-16">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-[#f0c27a] uppercase">The Rfaheya Standard™</p>
          <h1 id="standard-hero-title" className="mt-4 font-serif text-[60px] leading-[0.92] text-white sm:text-[88px] lg:text-[104px]">
            More than
            <br />
            <span className="text-[#f0c27a] italic">a fragrance.</span>
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-[1.6] text-white/80 sm:text-[17px]">
            A fragrance is more than its first impression. We look at how it feels, how it performs, and how it evolves over time.
          </p>
          <ul className="mt-7 flex flex-wrap gap-2">
            {dimensions.map((x, i) => (
              <li key={x.slug}>
                <button type="button" onClick={() => pick(i)} className="rounded-full bg-white/15 px-3.5 py-2 text-[12.5px] font-semibold text-white backdrop-blur-md transition hover:bg-white/30">
                  <span className="mr-1.5 text-[11px] text-[#f0c27a]">{x.num}</span>
                  {x.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Why we created it ---------- */}
      <section aria-labelledby="why-standard-title" className="rf-white grid overflow-hidden rounded-[28px] border border-line lg:grid-cols-2 lg:rounded-[36px]">
        <div className="px-5 py-9 lg:p-12">
          <p className={eyebrow}>Why we created it</p>
          <h2 id="why-standard-title" className="mt-3 font-serif text-[40px] leading-[0.98] sm:text-[56px]">
            Not just <span className="text-gold italic">how it smells.</span>
          </h2>
          <p className="mt-5 text-[15px] leading-[1.7] text-ink-soft sm:text-[16px]">
            A fragrance is personal. Performance is experienced. That’s why we created the Rfaheya Standard™ — a framework designed to evaluate the complete fragrance experience.
          </p>
          <div className="mt-7 rounded-[22px] bg-chip p-5">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-muted uppercase">A fragrance should do more than smell good</p>
            <p className="mt-2 font-serif text-[28px] leading-[1.05] text-gold">From the first spray to the last trace.</p>
          </div>
        </div>
        <img src={whyBg} alt="" loading="lazy" className="h-64 w-full object-cover object-right lg:h-full" />
      </section>

      {/* ---------- The six dimensions ---------- */}
      <section aria-labelledby="six-title" className="rounded-[28px] bg-[#14110d] px-5 py-9 text-white lg:rounded-[36px] lg:p-12">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.24em] text-olive uppercase">The six dimensions</p>
            <h2 id="six-title" className="mt-3 font-serif text-[40px] leading-[0.98] text-white sm:text-[56px]">
              How we read <span className="text-[#f0c27a] italic">a fragrance.</span>
            </h2>
          </div>
          <p className="max-w-sm text-[14.5px] text-[#b9ae9c]">Every Rfaheya fragrance is rated on each of these. Tap one to see its levels.</p>
        </div>
        <ol className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6 lg:gap-3">
          {dimensions.map((x, i) => (
            <li key={x.slug}>
              <button
                type="button"
                onClick={() => pick(i)}
                className={`flex h-full w-full flex-col gap-3 rounded-[22px] border p-4 text-left transition ${
                  i === active ? 'border-olive bg-[#2a2016]' : 'border-[#2c261f] bg-[#1f1b16] hover:border-[#4b4236]'
                }`}
              >
                {imageOf(x.title) && <img src={imageOf(x.title)} alt="" loading="lazy" className="size-14 rounded-full object-cover" />}
                <span>
                  <span className="block text-[11px] font-semibold tracking-[0.12em] text-olive">{x.num}</span>
                  <span className="block font-serif text-[24px] leading-tight text-white">{x.title}</span>
                  <span className="mt-0.5 block text-[12.5px] text-[#a99d8b]">{x.summary.join(' ')}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- Dimension viewer ---------- */}
      <section ref={viewer} id="dimension-viewer" aria-label="The Rfaheya Standard dimensions" className="scroll-mt-24">
        <div role="tablist" aria-label="Dimensions" className="no-scrollbar mb-3 flex gap-1.5 overflow-x-auto rounded-full bg-chip p-[5px]">
          {dimensions.map((x, i) => (
            <button
              key={x.slug}
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={`h-10 shrink-0 flex-1 rounded-full px-4 text-[12.5px] font-semibold whitespace-nowrap transition ${
                i === active ? 'rf-white text-ink shadow-[0_4px_12px_-6px_rgba(60,40,10,0.3)]' : 'text-muted hover:text-ink'
              }`}
            >
              <span className="mr-1 text-[11px] text-gold">{x.num}</span> {x.title}
            </button>
          ))}
        </div>

        <div key={d.slug} className="rf-white animate-fade-in grid gap-8 rounded-[28px] border border-line px-5 py-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12 lg:rounded-[36px] lg:p-12">
          <div>
            <div className="flex items-center gap-4">
              <span className="font-serif text-[88px] leading-[0.8] text-gold lg:text-[120px]">{d.num}</span>
              <span aria-hidden className="h-16 w-px bg-line-strong" />
              <div>
                <h2 className="font-serif text-[40px] leading-none lg:text-[52px]">{d.title}</h2>
                <p className="mt-1 font-serif text-[20px] text-muted italic">{d.subtitle}</p>
              </div>
            </div>
            <p className="mt-7 font-serif text-[28px] leading-[1.15] lg:text-[34px]">{d.question.join(' ')}</p>
            <p className="mt-4 text-[15px] leading-[1.7] text-ink-soft">{d.desc.join(' ')}</p>
            <p className="mt-4 rounded-[18px] bg-chip px-4 py-3 text-[13.5px] text-ink-soft">{d.note.join(' ')}</p>
            <div className="mt-6 flex items-center gap-3">
              <button type="button" onClick={() => go(-1)} aria-label="Previous dimension" className="grid size-12 place-items-center rounded-full border border-line transition hover:border-ink">
                <ArrowLeft className="size-5" strokeWidth={1.5} />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Next dimension" className="grid size-12 place-items-center rounded-full bg-[#14110d] text-white transition hover:bg-[#2e2820]">
                <ArrowRight className="size-5" strokeWidth={1.5} />
              </button>
              <span className="ml-1 text-[13px] text-muted tabular-nums">
                {d.num} / {String(dimensions.length).padStart(2, '0')}
              </span>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] text-muted uppercase">The levels</p>
            {/* The scale, from the lightest level to the strongest */}
            <div className="relative mt-5 mb-2 h-1.5 rounded-full bg-gradient-to-r from-[#f3e3c9] via-[#f0c27a] to-olive" aria-hidden>
              {d.levels.map((_, i) => (
                <span
                  key={i}
                  className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-olive shadow"
                  style={{ left: `${d.levels.length === 1 ? 50 : (i / (d.levels.length - 1)) * 100}%` }}
                />
              ))}
            </div>
            <ol className={`mt-6 grid gap-2.5 ${d.levels.length >= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
              {d.levels.map((l, i) => (
                <li key={l.name} className="rounded-[22px] bg-sand p-5">
                  <p className="text-[11px] font-semibold tracking-[0.14em] text-gold">Level {i + 1}</p>
                  <h3 className="mt-1.5 font-serif text-[26px] leading-none">{l.name}</h3>
                  {l.lead.length > 0 && <p className="mt-2.5 text-[14px] font-semibold text-ink">{l.lead.join(' ')}</p>}
                  <p className="mt-1.5 text-[13.5px] leading-[1.55] text-ink-soft">{l.text.join(' ')}</p>
                </li>
              ))}
            </ol>
            <p className="mt-5 text-[13px] text-muted">
              Each fragrance page shows where it sits on every dimension.{' '}
              <Link to="/shop" className="font-semibold text-gold hover:underline">
                See the fragrances
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
