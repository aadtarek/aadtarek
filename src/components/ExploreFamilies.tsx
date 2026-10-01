import { ArrowRight } from 'lucide-react'
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { getFamilies } from '../api/catalog'

export function ExploreFamilies() {
  return (
    <section aria-labelledby="explore-title" className="bg-sand pt-10 pb-12 lg:pt-[34px] lg:pb-[62px]">
      <div className="container-x flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between xl:pr-[77px] xl:pl-[68px]">
        <div>
          <p className="text-[12px] tracking-[0.38em] text-ink uppercase sm:text-[15.5px]">Find your fragrance</p>
          <h2 id="explore-title" className="mt-1 font-serif text-[38px] leading-[1.05] sm:text-[58px]">
            Explore by what you love.
          </h2>
        </div>
        <p className="max-w-[20rem] text-[15px] leading-[1.65] text-ink-soft lg:mb-[30px] lg:max-w-none lg:text-[16px]">
          Different moods. Distinctive characters. <br className="hidden lg:block" />
          Find the fragrance that feels like you.
        </p>
      </div>

      <ul className="no-scrollbar mx-auto mt-6 flex max-w-[1600px] snap-x snap-mandatory scroll-px-4 gap-[13px] overflow-x-auto px-4 sm:scroll-px-6 sm:px-6 lg:mt-[20px] lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-[27px]">
        {getFamilies().map((f) => (
          <li key={f.slug} className="w-[78%] shrink-0 snap-start xs:w-[62%] sm:w-[40%] lg:w-auto">
            <Link
              to={`/shop?family=${f.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-lg bg-[#efe6dc] shadow-[0_1px_2px_rgba(60,45,20,0.05)] transition-shadow hover:shadow-[0_14px_30px_-14px_rgba(60,45,20,0.35)]"
            >
              <div className="aspect-[300/205] overflow-hidden">
                <img
                  src={f.image}
                  alt=""
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                />
              </div>
              <div className="flex flex-1 flex-col bg-gradient-to-b from-[#ede3d8] to-[#f2eae1] px-6 pt-[17px] pb-[22px]">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-serif text-[26px] leading-none uppercase">{f.name}</h3>
                  <span className="grid size-[37px] shrink-0 place-items-center rounded-full bg-olive text-cream transition group-hover:bg-olive-hover">
                    <ArrowRight className="size-4 transition group-hover:translate-x-0.5" strokeWidth={1.5} />
                  </span>
                </div>
                <p className="-mt-[3px] text-[16.5px] text-ink-soft">{f.tagline}</p>
                <p className="mt-[18px] flex flex-wrap items-center gap-x-2 text-[12.5px] text-ink-soft">
                  {f.keywords.map((k, i) => (
                    <Fragment key={k}>
                      {i > 0 && <span aria-hidden className="text-[10px] text-muted">·</span>}
                      <span>{k}</span>
                    </Fragment>
                  ))}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
