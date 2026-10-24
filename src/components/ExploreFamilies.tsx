import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getFamilies } from '../api/catalog'
import { Aura } from './Ambient'

export function ExploreFamilies() {
  return (
    <section aria-labelledby="explore-title" className="relative isolate overflow-hidden bg-sand py-12 lg:py-16">
      <Aura />
      <div className="container-x flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10.5px] font-medium tracking-[0.32em] text-gold uppercase sm:text-[11px]">Find your fragrance</p>
          <h2 id="explore-title" className="mt-2 font-serif text-[32px] leading-[1.05] sm:text-[44px]">
            Explore by what you love<span className="text-gold italic">.</span>
          </h2>
        </div>
        <p className="max-w-[22rem] text-[14px] leading-[1.6] text-ink-soft lg:text-right">
          Different moods, distinctive characters. Find the fragrance that feels like you.
        </p>
      </div>

      <ul className="no-scrollbar container-x mt-7 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto sm:scroll-px-6 lg:mt-9 lg:grid lg:grid-cols-5 lg:gap-5 lg:overflow-visible">
        {getFamilies().map((f) => (
          <li key={f.slug} className="w-[46%] shrink-0 snap-start sm:w-[30%] lg:w-auto">
            <Link to={`/shop?family=${f.slug}`} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-chip">
                <img
                  src={f.image}
                  alt=""
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                />
                <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/5 to-transparent" />
                <span className="absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-cream/80 text-ink backdrop-blur-sm transition duration-500 [@media(hover:hover)]:translate-y-1 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100">
                  <ArrowUpRight className="size-4" strokeWidth={1.5} />
                </span>
                <div className="absolute inset-x-0 bottom-0 p-3.5 text-cream sm:p-5">
                  <h3 className="font-serif text-[22px] leading-none sm:text-[28px]">{f.name}</h3>
                  <p className="mt-1.5 text-[12px] text-cream/85 sm:text-[13px]">{f.tagline}</p>
                </div>
              </div>
              <p className="mt-2.5 truncate px-0.5 text-[11.5px] text-muted sm:text-[12px]">{f.keywords.join(' · ')}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
