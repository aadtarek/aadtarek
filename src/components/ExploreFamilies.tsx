import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getAllProducts, getFamilies } from '../api/catalog'
import { TINTS } from '../lib/tints'

/** Home: the families as a bento — Oriental large, the other four beside it — each with a glass label. */
export function ExploreFamilies() {
  const all = getFamilies()
  const families = [...all.filter((f) => f.slug === 'oriental'), ...all.filter((f) => f.slug !== 'oriental')]
  const products = getAllProducts()

  return (
    <section aria-labelledby="explore-title" className="container-x py-12 lg:py-16">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.24em] text-gold uppercase">Find your fragrance</p>
          <h2 id="explore-title" className="mt-2.5 font-serif text-[36px] leading-none sm:text-[52px]">
            Explore by what you love
          </h2>
        </div>
        <Link
          to="/finder"
          className="rf-white group inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-line px-4 text-[10.5px] font-semibold tracking-[0.12em] uppercase transition hover:border-ink sm:h-[42px] sm:px-[18px] sm:text-[11px]"
        >
          Take the quiz
          <ArrowRight className="size-4 transition group-hover:translate-x-1" strokeWidth={1.5} />
        </Link>
      </div>

      <ul className="mt-6 grid grid-cols-2 grid-rows-[230px_165px_165px] gap-2.5 sm:grid-rows-[260px_200px_200px] lg:mt-8 lg:grid-cols-[1.4fr_1fr_1fr] lg:grid-rows-[250px_250px] lg:gap-4">
        {families.map((f, i) => {
          const count = products.filter((p) => p.families.includes(f.slug)).length
          return (
            <li key={f.slug} className={i === 0 ? 'col-span-2 lg:col-span-1 lg:row-span-2' : ''}>
              <Link
                to={`/shop?family=${f.slug}`}
                className="group relative block size-full overflow-hidden rounded-[22px] lg:rounded-[28px]"
                style={{ background: TINTS[f.slug]?.tint }}
              >
                <img
                  src={f.image}
                  alt=""
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                />
                <span className="absolute inset-x-2 bottom-2 flex items-center gap-2.5 rounded-2xl bg-white/85 py-2 pr-2 pl-3 text-[#14110d] backdrop-blur-xl lg:inset-x-3 lg:bottom-3 lg:rounded-[20px] lg:py-3 lg:pr-3 lg:pl-[18px]">
                  <span className="min-w-0 flex-1">
                    <span className={`block font-serif leading-none ${i === 0 ? 'text-[28px] lg:text-[36px]' : 'text-[20px] lg:text-[26px]'}`}>{f.name}</span>
                    <span className={`mt-1 truncate text-[12px] text-[#7b6e5b] ${i === 0 ? 'block' : 'hidden lg:block'}`}>{f.keywords.slice(0, 3).join(' · ')}</span>
                  </span>
                  {count > 0 && (
                    <span className={`shrink-0 text-[11px] font-semibold tracking-[0.06em] text-[#a8650c] ${i === 0 ? 'inline' : 'hidden lg:inline'}`}>
                      {count} {count === 1 ? 'scent' : 'scents'}
                    </span>
                  )}
                  <span className="grid size-[30px] shrink-0 place-items-center rounded-full bg-[#14110d] text-white transition group-hover:translate-x-0.5 lg:size-[38px]">
                    <ArrowRight className="size-4" strokeWidth={1.6} />
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
