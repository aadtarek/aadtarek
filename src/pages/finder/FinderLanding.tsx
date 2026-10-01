import { ArrowRight } from 'lucide-react'
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { landing, TOTAL_STEPS } from '../../finder/data'

export function FinderLanding() {
  const start = (
    <Link
      to="/finder/quiz"
      className="group inline-flex h-[52px] items-center gap-3 rounded-[4px] bg-[#f3e4cf] px-12 text-[13px] font-medium tracking-[0.14em] text-ink uppercase transition hover:bg-[#fbefdd]"
    >
      Start the finder
      <ArrowRight className="size-[18px] transition group-hover:translate-x-1" strokeWidth={1.5} />
    </Link>
  )

  return (
    <div className="bg-[#efe6dc]">
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden bg-[#1c120b] text-cream">
        <img
          src={landing.hero}
          alt="Rfaheya bottle on stone with vanilla, a white flower, amber and roses"
          className="h-72 w-full object-cover object-[70%_center] sm:h-96 md:absolute md:inset-0 md:h-full md:object-right"
          fetchPriority="high"
        />
        <div aria-hidden className="absolute inset-0 hidden bg-gradient-to-r from-[#1c120b]/85 via-[#1c120b]/40 to-transparent md:block" />
        <div className="container-x relative py-12 md:flex md:min-h-[600px] md:flex-col md:justify-center lg:min-h-[640px]">
          <p className="text-[12px] tracking-[0.3em] text-cream/85 uppercase sm:text-[13.5px]">A personalized fragrance experience</p>
          <h1 className="mt-4 font-serif text-[64px] leading-[0.92] sm:text-[88px]">
            Rfaheya
            <br />
            <span className="text-[#ecd2b4]">Finder</span>
          </h1>
          <p className="mt-5 font-serif text-[30px] leading-[1.15] text-[#ecd2b4] sm:text-[36px]">
            Find the fragrance
            <br />
            that feels like you.
          </p>
          <p className="mt-5 max-w-[24rem] text-[16px] leading-[1.55] text-cream/90">
            Answer a few simple questions and discover the fragrances that match your taste.
          </p>
          <div className="mt-8">{start}</div>
          <p className="mt-4 text-[14px] text-cream/80">
            {TOTAL_STEPS} questions <span className="mx-2">·</span> Less than 2 minutes
          </p>
        </div>
      </section>

      {/* ---------- What happens next ---------- */}
      <section className="bg-[#efe6dc] py-14 lg:py-16" aria-labelledby="next-title">
        <div className="container-x text-center">
          <p id="next-title" className="text-[12px] tracking-[0.3em] text-ink-soft uppercase sm:text-[13px]">
            What happens next?
          </p>
          <ol className="mx-auto mt-10 grid max-w-5xl items-start gap-10 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:gap-6">
            {[
              { title: 'Answer', text: 'Tell us what you like.' },
              { title: 'We match', text: 'We match your preferences with our fragrances.' },
              { title: 'Discover', text: 'Get your personal Rfaheya recommendations.' },
            ].map((s, i) => (
              <Fragment key={s.title}>
                {i > 0 && <span aria-hidden className="mt-9 hidden h-px w-14 bg-line-strong sm:block" />}
                <li>
                  <span className="font-serif text-[48px] leading-none text-mocha">{String(i + 1).padStart(2, '0')}</span>
                  <h2 className="mt-3 font-serif text-[22px] uppercase">{s.title}</h2>
                  <p className="mx-auto mt-1 max-w-[16rem] text-[15.5px] leading-snug text-ink-soft">{s.text}</p>
                </li>
              </Fragment>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- More than a quiz ---------- */}
      <section className="bg-[#e5d9cb] py-14 lg:py-16" aria-labelledby="quiz-title">
        <div className="container-x">
          <p className="text-center text-[12px] tracking-[0.3em] text-ink-soft uppercase sm:text-[13px]">It’s more than a quiz.</p>
          <h2 id="quiz-title" className="mt-2 text-center font-serif text-[34px] leading-[1.1] sm:text-[46px]">
            We’ll get to know your scent preferences.
          </h2>
          <ul className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-[10px]">
            {landing.cards.map((c) => (
              <li key={c.title} className="relative aspect-[230/226] overflow-hidden rounded-[4px] bg-[#1c120b]">
                <img src={c.image} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#140c07]/95 via-[#140c07]/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-cream sm:p-6">
                  <h3 className="font-serif text-[18px] uppercase sm:text-[22px]">{c.title}</h3>
                  <span aria-hidden className="mt-2 block h-px w-6 bg-cream/70" />
                  <p className="mt-2 max-w-[13rem] text-[13px] leading-snug text-cream/85 sm:text-[14.5px]">{c.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="relative overflow-hidden bg-[#1c120b] text-cream">
        <img src={landing.cta} alt="" aria-hidden loading="lazy" className="absolute inset-0 size-full object-cover object-right" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[#1c120b]/80 via-[#1c120b]/30 to-transparent" />
        <div className="container-x relative py-16 lg:py-24">
          <p className="text-[12px] tracking-[0.3em] text-cream/85 uppercase sm:text-[13px]">Ready to find yours?</p>
          <h2 className="mt-3 font-serif text-[44px] leading-[1] sm:text-[60px]">
            Start your
            <br />
            fragrance journey.
          </h2>
          <div className="mt-8">{start}</div>
        </div>
      </section>
    </div>
  )
}
