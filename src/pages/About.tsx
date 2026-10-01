import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import hero from '../assets/hero.webp'
import still from '../assets/standard/background.webp'
import { getFamilies } from '../api/catalog'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { pillars } from '../data/pillars'

const steps = [
  {
    title: 'Discover',
    text: 'Start with a 10 ML discovery size. Wear it to work, out to dinner, through a long day.',
  },
  {
    title: 'Live with it',
    text: 'A fragrance reveals itself over hours, not seconds. Notice how it settles, evolves and lingers on your skin.',
  },
  {
    title: 'Commit',
    text: 'When it feels like you, choose the full bottle — in 50 or 100 ML — with our zero risk guarantee.',
  },
]

export function About() {
  return (
    <div>
      {/* ---------- Hero ---------- */}
      <section className="container-x pt-6 lg:pt-8">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Our Story' }]} />
        <div className="mt-8 grid items-center gap-10 lg:mt-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <div>
            <p className="text-[12px] tracking-[0.3em] text-ink-soft uppercase sm:text-[14px]">Our story</p>
            <h1 className="mt-3 font-serif text-[46px] leading-[0.98] sm:text-[64px] xl:text-[76px]">
              Fragrance,
              <br />
              made personal.
            </h1>
            <p className="mt-6 max-w-[34rem] text-[17px] leading-[1.7] text-ink-soft">
              Rfaheya began with a simple belief: a great scent shouldn’t be a luxury you hesitate over. It should be something
              you choose with confidence, wear every day, and recognise as yours.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="group inline-flex h-[50px] items-center gap-3 rounded-[3px] bg-olive px-8 text-[12.5px] font-medium tracking-[0.12em] text-cream uppercase transition hover:bg-olive-hover"
              >
                Explore fragrances
                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" strokeWidth={1.5} />
              </Link>
              <Link
                to="/our-standard"
                className="inline-flex h-[50px] items-center rounded-[3px] border border-ink/80 px-8 text-[12.5px] font-medium tracking-[0.12em] uppercase transition hover:bg-ink hover:text-cream"
              >
                Our standard
              </Link>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg">
            <img src={still} alt="Oud wood, amber, a white flower and glass flasks on a stone plinth" className="aspect-[4/3] w-full object-cover object-bottom lg:aspect-[5/4]" />
          </div>
        </div>
      </section>

      {/* ---------- Manifesto ---------- */}
      <section className="container-x py-16 lg:py-28" aria-label="Our belief">
        <blockquote className="mx-auto max-w-5xl text-center font-serif text-[30px] leading-[1.2] sm:text-[44px] lg:text-[54px]">
          “We evaluate more than how a fragrance smells. We look at how it lives on skin.”
        </blockquote>
        <div className="mx-auto mt-14 grid max-w-5xl gap-10 text-[16.5px] leading-[1.8] text-ink-soft md:grid-cols-2 md:gap-14">
          <div>
            <h2 className="mb-3 text-[13px] font-semibold tracking-[0.14em] text-ink uppercase">Inspired, never ordinary</h2>
            <p>
              Each Rfaheya fragrance takes inspiration from a scent people already love, then is composed with quality
              materials and a high concentration so it performs from morning to night. The result feels familiar, yet carries
              its own signature.
            </p>
          </div>
          <div>
            <h2 className="mb-3 text-[13px] font-semibold tracking-[0.14em] text-ink uppercase">Honest craftsmanship</h2>
            <p>
              No exaggerated promises. Every scent is judged against the Rfaheya Standard™ — character, comfort, density,
              projection, longevity and evolution — before it earns a place in the collection.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- Standard ---------- */}
      <section className="bg-card py-16 lg:py-24" aria-labelledby="about-standard">
        <div className="container-x">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[12px] tracking-[0.3em] text-ink-soft uppercase sm:text-[14px]">Rfaheya Standard™</p>
              <h2 id="about-standard" className="mt-2 font-serif text-[38px] leading-[1.05] sm:text-[52px]">
                Six things we never compromise.
              </h2>
            </div>
            <p className="max-w-sm text-[15.5px] leading-[1.65] text-ink-soft lg:text-right">
              A fragrance only joins the collection when it delivers on every one of them.
            </p>
          </div>
          <ol className="mt-10 grid gap-[13px] sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map((p, i) => (
              <li key={p.title} className="flex items-center gap-5 rounded-lg border border-line bg-sand p-5">
                <img src={p.image} alt="" loading="lazy" className="size-[92px] shrink-0 rounded-full object-cover" />
                <div>
                  <p className="font-serif text-[15px] text-muted">{String(i + 1).padStart(2, '0')}</p>
                  <h3 className="font-serif text-[22px] leading-tight uppercase">{p.title}</h3>
                  <p className="mt-1 text-[14.5px] leading-snug text-ink-soft">{p.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Try first ---------- */}
      <section className="relative overflow-hidden" aria-labelledby="try-first">
        <img src={hero} alt="" aria-hidden className="absolute inset-0 hidden size-full object-cover object-right md:block" />
        <div aria-hidden className="absolute inset-0 hidden bg-gradient-to-r from-[#ebe3d9] from-30% via-[#ebe3d9]/70 via-55% to-transparent to-80% md:block" />
        <div className="container-x relative py-16 lg:py-24">
          <p className="text-[12px] tracking-[0.3em] text-ink-soft uppercase sm:text-[14px]">Try 10 ML first</p>
          <h2 id="try-first" className="mt-2 max-w-xl font-serif text-[38px] leading-[1.05] sm:text-[52px]">
            Discover before you commit.
          </h2>
          <ol className="mt-10 grid max-w-3xl gap-6 sm:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="rounded-lg bg-cream/80 p-6 backdrop-blur-sm">
                <span className="grid size-10 place-items-center rounded-full bg-olive font-serif text-[18px] text-cream">{i + 1}</span>
                <h3 className="mt-4 font-serif text-[22px] uppercase">{s.title}</h3>
                <p className="mt-2 text-[14.5px] leading-[1.6] text-ink-soft">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
        <img src={hero} alt="" aria-hidden className="h-56 w-full object-cover object-[78%_center] md:hidden" />
      </section>

      {/* ---------- Families ---------- */}
      <section className="container-x py-16 lg:py-24" aria-labelledby="about-families">
        <p className="text-[12px] tracking-[0.3em] text-ink-soft uppercase sm:text-[14px]">Five moods</p>
        <h2 id="about-families" className="mt-2 font-serif text-[38px] leading-[1.05] sm:text-[52px]">
          A scent for every side of you.
        </h2>
        <ul className="mt-10 grid grid-cols-2 gap-[13px] md:grid-cols-5">
          {getFamilies().map((f, i) => (
            <li key={f.slug} className={i === 0 ? 'col-span-2 md:col-span-1' : ''}>
              <Link to={`/shop?family=${f.slug}`} className="group relative block overflow-hidden rounded-lg">
                <img
                  src={f.image}
                  alt=""
                  loading="lazy"
                  className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105 max-md:first:aspect-[16/9]"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-4 text-cream">
                  <span className="block font-serif text-[24px] uppercase">{f.name}</span>
                  <span className="block text-[14px] text-cream/85">{f.tagline}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
