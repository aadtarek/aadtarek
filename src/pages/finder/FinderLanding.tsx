import { ArrowRight, Clock, Sparkles, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { landing, STEPS, TOTAL_STEPS } from '../../finder/data'
import heroSmall from '../../assets/finder/landing-hero-1024.webp'
import forMen from '../../assets/finder/for-men.webp'
import forWomen from '../../assets/finder/for-women.webp'
import forUnisex from '../../assets/finder/for-unisex.webp'

const startClass =
  'group inline-flex h-[54px] items-center gap-2.5 rounded-full bg-olive px-8 text-[12.5px] font-semibold tracking-[0.12em] text-white uppercase transition hover:bg-olive-hover'

/**
 * Rfaheya Finder landing: what it is, the questions it asks, how it works,
 * and a start button that is never far away.
 */
export function FinderLanding() {
  const start = (
    <Link to="/finder/quiz" className={startClass}>
      Start the finder
      <ArrowRight className="size-[18px] transition group-hover:translate-x-1" strokeWidth={1.6} />
    </Link>
  )

  return (
    <div className="container-x space-y-4 pt-3 pb-16 lg:space-y-5 lg:pt-4 lg:pb-20">
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden rounded-[28px] bg-[#1c120b] lg:rounded-[36px]">
        <img
          src={landing.hero}
          srcSet={`${heroSmall} 1024w, ${landing.hero} 2048w`}
          sizes="100vw"
          width={2048}
          height={1092}
          alt="Rfaheya bottle on stone with vanilla, a white flower, amber and roses"
          className="absolute inset-0 size-full object-cover object-[70%_center]"
          fetchPriority="high"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#140c07]/90 via-[#140c07]/40 to-transparent md:bg-gradient-to-r md:from-[#140c07]/85 md:via-[#140c07]/40" />
        <div className="relative flex min-h-[600px] flex-col justify-end px-6 pt-40 pb-9 md:min-h-[640px] md:justify-center md:px-14 md:py-16">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-[#f0c27a] uppercase">A personalized fragrance experience</p>
          <h1 className="mt-4 font-serif text-[60px] leading-[0.92] text-white sm:text-[88px] lg:text-[104px]">
            Rfaheya <span className="text-[#f0c27a] italic">Finder</span>
          </h1>
          <p className="mt-4 max-w-md font-serif text-[24px] leading-[1.2] text-white/90 sm:text-[30px]">Find the fragrance that feels like you.</p>
          <p className="mt-3 max-w-sm text-[15px] leading-[1.6] text-white/75">Answer a few simple questions and discover the fragrances that match your taste.</p>
          <div className="mt-7">{start}</div>
          <ul className="mt-5 flex flex-wrap gap-2 text-[12.5px] font-semibold text-white">
            <li className="flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2 backdrop-blur-md">
              <Target className="size-4 text-[#f0c27a]" strokeWidth={1.6} /> {TOTAL_STEPS} questions
            </li>
            <li className="flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2 backdrop-blur-md">
              <Clock className="size-4 text-[#f0c27a]" strokeWidth={1.6} /> Less than 2 minutes
            </li>
            <li className="flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2 backdrop-blur-md">
              <Sparkles className="size-4 text-[#f0c27a]" strokeWidth={1.6} /> Free, no sign-up
            </li>
          </ul>
        </div>
      </section>

      {/* ---------- Quick start: who it's for ---------- */}
      <section aria-labelledby="who-title" className="rf-white rounded-[28px] border border-line px-5 py-8 lg:rounded-[36px] lg:p-12">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.24em] text-gold uppercase">Step 1 of {TOTAL_STEPS}</p>
            <h2 id="who-title" className="mt-3 font-serif text-[38px] leading-none sm:text-[52px]">
              Who are you shopping for?
            </h2>
          </div>
          <p className="text-[14.5px] text-ink-soft">Pick one to begin — the rest takes under two minutes.</p>
        </div>
        <ul className="mt-7 grid grid-cols-3 gap-2.5 lg:gap-4">
          {[
            { label: 'Men', image: forMen },
            { label: 'Women', image: forWomen },
            { label: 'Unisex', image: forUnisex },
          ].map((c) => (
            <li key={c.label}>
              <Link to="/finder/quiz" className="group relative block aspect-[3/4] overflow-hidden rounded-[22px] bg-[#1c120b] sm:aspect-[4/3] lg:rounded-[28px]">
                <img src={c.image} alt="" loading="lazy" className="size-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105" />
                <span className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2 rounded-2xl bg-white/85 py-2 pr-2 pl-3.5 text-[#14110d] backdrop-blur-xl lg:inset-x-3 lg:bottom-3 lg:rounded-[20px] lg:py-3 lg:pl-5">
                  <span className="font-serif text-[20px] leading-none lg:text-[28px]">{c.label}</span>
                  <span className="grid size-[30px] shrink-0 place-items-center rounded-full bg-[#14110d] text-white transition group-hover:translate-x-0.5 lg:size-[38px]">
                    <ArrowRight className="size-4" strokeWidth={1.6} />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- How it works ---------- */}
      <section aria-labelledby="how-title" className="rounded-[28px] bg-chip px-5 py-9 lg:rounded-[36px] lg:p-12">
        <p className="text-[11px] font-semibold tracking-[0.24em] text-gold uppercase">How it works</p>
        <h2 id="how-title" className="mt-3 font-serif text-[38px] leading-none sm:text-[52px]">
          Three steps to <span className="text-gold italic">your scent.</span>
        </h2>
        <ol className="mt-8 grid gap-2.5 md:grid-cols-3 lg:gap-4">
          {[
            { title: 'Answer', text: 'Tell us what you like — your style, your moments, the notes you love.' },
            { title: 'We match', text: 'We match your preferences with every Rfaheya fragrance.' },
            { title: 'Discover', text: 'Get your personal recommendations, and try any in 5 ml first.' },
          ].map((s, i) => (
            <li key={s.title} className="rf-white relative overflow-hidden rounded-[24px] p-6">
              <span aria-hidden className="absolute -top-3 right-4 font-serif text-[110px] leading-none text-chip">
                {i + 1}
              </span>
              <span className="relative grid size-10 place-items-center rounded-full bg-olive text-[14px] font-semibold text-white">{i + 1}</span>
              <h3 className="relative mt-5 font-serif text-[28px] leading-none">{s.title}</h3>
              <p className="relative mt-2 text-[14px] leading-[1.55] text-ink-soft">{s.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex flex-wrap gap-2" aria-label="The questions">
          {STEPS.map((s, i) => (
            <span key={s} className="rf-white rounded-full px-3.5 py-2 text-[12.5px] font-medium text-ink-soft">
              <span className="mr-1.5 text-[11px] font-semibold text-gold">{String(i + 1).padStart(2, '0')}</span>
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* ---------- More than a quiz ---------- */}
      <section aria-labelledby="quiz-title" className="rf-white rounded-[28px] border border-line px-5 py-9 lg:rounded-[36px] lg:p-12">
        <p className="text-[11px] font-semibold tracking-[0.24em] text-gold uppercase">It’s more than a quiz</p>
        <h2 id="quiz-title" className="mt-3 max-w-2xl font-serif text-[38px] leading-none sm:text-[52px]">
          We’ll get to know your scent preferences.
        </h2>
        <ul className="mt-8 grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-4">
          {landing.cards.map((c) => (
            <li key={c.title} className="group relative aspect-[4/5] overflow-hidden rounded-[22px] bg-[#1c120b] lg:rounded-[28px]">
              <img src={c.image} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-[1400ms] group-hover:scale-105" />
              <div className="absolute inset-x-2 bottom-2 rounded-2xl bg-white/85 p-3 text-[#14110d] backdrop-blur-xl lg:inset-x-3 lg:bottom-3 lg:rounded-[20px] lg:p-4">
                <h3 className="font-serif text-[20px] leading-none lg:text-[24px]">{c.title}</h3>
                <p className="mt-1.5 text-[12px] leading-snug text-[#5b5145] lg:text-[13px]">{c.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="relative overflow-hidden rounded-[28px] bg-[#14110d] lg:rounded-[36px]">
        <img src={landing.cta} alt="" aria-hidden loading="lazy" className="absolute inset-0 size-full object-cover object-right opacity-70" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[#14110d] via-[#14110d]/70 to-transparent" />
        <div className="relative px-6 py-12 lg:px-14 lg:py-20">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-olive uppercase">Ready to find yours?</p>
          <h2 className="mt-3 font-serif text-[44px] leading-[0.98] text-white sm:text-[64px]">
            Start your
            <br />
            <span className="text-[#f0c27a] italic">fragrance journey.</span>
          </h2>
          <div className="mt-8">{start}</div>
        </div>
      </section>
    </div>
  )
}
