import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StandardSection } from '../components/StandardSection'
import { pillars } from '../data/pillars'

const details: Record<string, string> = {
  Character: 'Does it have a clear identity? A fragrance should be recognizable — familiar in direction, yet with its own Rfaheya signature.',
  Comfort: 'Is it pleasant to wear for hours? We look for compositions that feel good on skin, never harsh or tiring.',
  Density: 'Does it feel rich and complete? A well-rounded scent has depth from the first spray to the dry-down.',
  Projection: 'Is the trail right? Noticeable enough to be appreciated, balanced enough to be worn anywhere.',
  Longevity: 'Does it last through your day? We consider performance from morning to evening, not just the first hour.',
  Evolution: 'Does it develop beautifully? Top, heart and base notes should unfold naturally over time.',
}

export function OurStandard() {
  return (
    <div>
      <StandardSection />
      <section className="container-x py-16 lg:py-24" aria-labelledby="pillars-detail">
        <div className="max-w-3xl">
          <p className="text-[12px] tracking-[0.3em] text-ink-soft uppercase sm:text-[14px]">How we evaluate</p>
          <h2 id="pillars-detail" className="mt-2 font-serif text-[38px] leading-[1.05] sm:text-[52px]">
            Six questions every fragrance must answer.
          </h2>
          <p className="mt-4 text-[17px] leading-[1.7] text-ink-soft">
            A fragrance isn’t judged on a paper strip. We wear it, live with it and revisit it over hours and days — and it only
            joins the collection when it answers all six.
          </p>
        </div>
        <ol className="mt-12 grid gap-x-14 gap-y-10 md:grid-cols-2">
          {pillars.map((p, i) => (
            <li key={p.title} className="flex gap-6 border-t border-line pt-8">
              <img src={p.image} alt="" loading="lazy" className="size-24 shrink-0 rounded-full object-cover sm:size-28" />
              <div>
                <p className="font-serif text-[16px] text-muted">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="font-serif text-[26px] leading-tight uppercase">{p.title}</h3>
                <p className="mt-1 text-[15px] font-medium">{p.text}</p>
                <p className="mt-2 text-[15.5px] leading-[1.7] text-ink-soft">{details[p.title]}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className="bg-olive text-cream">
        <div className="container-x flex flex-col items-start gap-6 py-14 sm:flex-row sm:items-center sm:justify-between lg:py-16">
          <div>
            <p className="font-serif text-[34px] leading-tight sm:text-[42px]">Experience the standard yourself.</p>
            <p className="mt-2 text-cream/80">Start with a 10 ML discovery size — or let the Finder choose for you.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/finder"
              className="inline-flex h-[52px] items-center gap-3 rounded-[3px] bg-cream px-8 text-[12.5px] font-medium tracking-[0.12em] text-olive uppercase transition hover:bg-white"
            >
              Rfaheya Finder <ArrowRight className="size-4" strokeWidth={1.5} />
            </Link>
            <Link
              to="/collections/discovery-sets"
              className="inline-flex h-[52px] items-center rounded-[3px] border border-cream/70 px-8 text-[12.5px] font-medium tracking-[0.12em] uppercase transition hover:bg-cream hover:text-olive"
            >
              Discovery sets
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
