import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import background from '../assets/standard/background.webp'
import character from '../assets/standard/character.webp'
import comfort from '../assets/standard/comfort.webp'
import density from '../assets/standard/density.webp'
import evolution from '../assets/standard/evolution.webp'
import longevity from '../assets/standard/longevity.webp'
import projection from '../assets/standard/projection.webp'

export const pillars = [
  { title: 'Character', text: 'A distinctive olfactive identity.', image: character },
  { title: 'Comfort', text: 'A pleasant wearing experience.', image: comfort },
  { title: 'Density', text: 'A rich and well-rounded presence.', image: density },
  { title: 'Projection', text: 'A noticeable yet balanced trail.', image: projection },
  { title: 'Longevity', text: 'Performance considered throughout the day.', image: longevity },
  { title: 'Evolution', text: 'A fragrance that develops beautifully over time.', image: evolution },
]

export function StandardSection() {
  return (
    <section
      aria-labelledby="standard-title"
      className="relative overflow-hidden bg-[#f4ece1] [--h:clamp(720px,50vw,860px)]"
    >
      {/* Still life on the left, fading into the wall behind the tiles */}
      <img
        src={background}
        alt=""
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 hidden h-(--h) w-auto max-w-none [mask-image:linear-gradient(to_right,black_96%,transparent)] lg:block"
      />
      <div className="grid gap-10 px-4 py-12 sm:px-6 lg:h-(--h) lg:grid-cols-[calc(var(--h)*0.8525)_1fr] lg:gap-0 lg:pt-[calc(var(--h)*0.11)] lg:pr-[15px] lg:pb-0 lg:pl-0">
        <div className="relative lg:pt-[calc(var(--h)*0.012)] lg:pr-6 lg:pl-[calc(var(--h)*0.1288)]">
          <p className="text-[12px] tracking-[0.3em] text-ink-soft uppercase sm:text-[15.5px] lg:text-[17px] lg:tracking-[0.24em]">Rfaheya Standard™</p>
          <h2 id="standard-title" className="mt-4 font-serif text-[44px] leading-[1] sm:text-[60px] lg:mt-[24px] lg:text-[80px] lg:leading-[0.86]">
            More than
            <br />a fragrance.
          </h2>
          <p className="mt-5 max-w-[30rem] text-[16px] leading-[1.65] text-ink-soft sm:text-[19.5px] lg:mt-[30px]">
            We evaluate more than how a fragrance smells. <br className="hidden lg:block" />
            We look at how it lives on skin.
          </p>
          <Link
            to="/our-standard"
            className="group mt-7 inline-flex h-[53px] items-center gap-4 rounded-full bg-olive px-[30px] text-[13px] font-medium tracking-[0.18em] text-cream uppercase transition hover:bg-olive-hover sm:h-[55px] sm:text-[15.5px] lg:mt-[33px]"
          >
            Explore Rfaheya Standard™
            <ArrowRight className="size-[18px] transition group-hover:translate-x-1" strokeWidth={1.5} />
          </Link>
        </div>

        <ol className="relative grid grid-cols-2 gap-[13px] md:grid-cols-3 lg:h-[calc(var(--h)*0.8275)] lg:grid-rows-2 lg:gap-x-[13px] lg:gap-y-[14px]">
          {pillars.map((p, i) => (
            <li
              key={p.title}
              className="flex flex-col items-center rounded-lg border border-[#e8dccd] bg-[#f6eee4]/80 px-4 pt-4 pb-6 text-center backdrop-blur-[2px] lg:px-6 lg:pt-[24px]"
            >
              <span className="self-start font-serif text-[22px] leading-none font-normal lg:text-[27px]">
                {String(i + 1).padStart(2, '0')}
                <span aria-hidden className="mt-[10px] block h-px w-[27px] bg-ink/70" />
              </span>
              <img
                src={p.image}
                alt=""
                loading="lazy"
                className="-mt-3 size-[108px] rounded-full object-cover lg:-mt-[30px] lg:size-[142px]"
              />
              <h3 className="mt-5 font-serif text-[20px] leading-none uppercase lg:mt-[28px] lg:text-[26px]">{p.title}</h3>
              <p className="mt-3 max-w-[13.5rem] text-[14.5px] leading-[1.45] text-muted lg:mt-[16px] lg:text-[18px]">{p.text}</p>
            </li>
          ))}
        </ol>
      </div>
      {/* Mobile still life */}
      <img src={background} alt="" aria-hidden className="h-72 w-full object-cover object-bottom lg:hidden" />
    </section>
  )
}
