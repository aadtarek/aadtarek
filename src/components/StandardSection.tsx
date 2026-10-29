import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { pillars } from '../data/pillars'

/** Home: Rfaheya Standard as a black island — the copy on one side, the six pillars as dark cards. */
export function StandardSection() {
  return (
    <section aria-labelledby="standard-title" className="container-x py-6 lg:py-8">
      <div className="grid items-center gap-7 overflow-hidden rounded-[28px] bg-[#14110d] px-5 py-8 text-white ring-1 ring-white/5 lg:grid-cols-[0.8fr_1.2fr] lg:gap-10 lg:rounded-[36px] lg:p-14">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.24em] text-[#e49b2d] uppercase">Rfaheya Standard™</p>
          <h2 id="standard-title" className="mt-3 font-serif text-[42px] leading-[0.98] text-white lg:text-[60px]">
            More than
            <br />a fragrance.
          </h2>
          <p className="mt-4 max-w-[26rem] text-[14.5px] leading-[1.55] text-[#b9ae9c] lg:text-[16px]">
            We evaluate more than how a fragrance smells. We look at how it lives on skin.
          </p>
          <Link
            to="/our-standard"
            className="rf-magnetic group mt-6 inline-flex h-[50px] items-center gap-2.5 rounded-full bg-olive px-[26px] text-[12px] font-semibold tracking-[0.12em] text-white uppercase transition hover:bg-olive-hover"
          >
            Explore the standard
            <ArrowRight className="size-4 transition group-hover:translate-x-1" strokeWidth={1.6} />
          </Link>
        </div>

        <ol className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
          {pillars.map((p, i) => (
            <li key={p.title} className="flex w-[200px] shrink-0 flex-col gap-3.5 rounded-[22px] border border-[#2c261f] bg-[#1f1b16] p-[18px] lg:w-auto lg:rounded-[24px]">
              <img src={p.image} alt="" loading="lazy" className="size-16 rounded-full object-cover" />
              <div>
                <p className="text-[11px] font-semibold tracking-[0.12em] text-[#e49b2d]">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="mt-0.5 font-serif text-[26px] leading-tight text-white">{p.title}</h3>
                <p className="mt-0.5 text-[13px] leading-[1.4] text-[#a99d8b]">{p.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
