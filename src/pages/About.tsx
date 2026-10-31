import { ArrowRight, FlaskConical, Leaf, Sun, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import heroBg from '../assets/about/hero.webp'
import blobFlower from '../assets/about/blob-flower.webp'
import blobWood from '../assets/about/blob-wood.webp'
import blobAmber from '../assets/about/blob-amber.webp'
import value1 from '../assets/about/value-1.webp'
import value2 from '../assets/about/value-2.webp'
import value3 from '../assets/about/value-3.webp'
import value4 from '../assets/about/value-4.webp'
import dnaOriginal from '../assets/about/dna-original.webp'
import dnaRfaheya from '../assets/about/dna-rfaheya.webp'
import { pillars } from '../data/pillars'
import { getAllProducts } from '../api/catalog'
import { TINTS } from '../lib/tints'

// ---------------------------------------------------------------- content

const why: { image: string; Icon: LucideIcon; title: string; text: string; tint: string }[] = [
  { image: blobFlower, Icon: Leaf, title: 'Quality with purpose', text: 'Thoughtfully selected materials.', tint: TINTS.floral.tint },
  { image: blobWood, Icon: FlaskConical, title: 'Crafted with intention', text: 'From formulation to maceration, every detail has a purpose.', tint: TINTS.oriental.tint },
  { image: blobAmber, Icon: Sun, title: 'Made for real life', text: 'Fragrance should fit your days, your moments, and your personality.', tint: TINTS.sweet.tint },
]

const values = [
  { image: value1, title: 'Honesty', text: 'Clear about what you’re wearing.' },
  { image: value2, title: 'Craft', text: 'Every detail has a purpose.' },
  { image: value3, title: 'Balance', text: 'More than intensity.' },
  { image: value4, title: 'Value', text: 'The value should be in the fragrance.' },
]

/** Note intensity (0–1) for the original and the Rfaheya interpretation. */
const dnaNotes = [
  { note: 'Grapefruit', original: 0.42, rfaheya: 1 },
  { note: 'Black pepper', original: 0.74, rfaheya: 0.28 },
  { note: 'Licorice', original: 0.4, rfaheya: 0.26 },
]

const eyebrow = 'text-[11px] font-semibold tracking-[0.24em] text-gold uppercase'
const h2 = 'mt-3 font-serif text-[40px] leading-[0.98] sm:text-[56px]'

/**
 * About: a story told in rounded islands — the brand line over the photograph,
 * why Rfaheya exists, what it stands for, the Standard and the DNA approach.
 */
export function About() {
  const count = getAllProducts().length
  return (
    <div className="container-x space-y-4 pt-3 pb-16 lg:space-y-5 lg:pt-4 lg:pb-20">
      {/* ---------- Hero ---------- */}
      <section aria-labelledby="about-title" className="relative overflow-hidden rounded-[28px] bg-[#1c120b] lg:rounded-[36px]">
        <img src={heroBg} alt="" fetchPriority="high" className="absolute inset-0 size-full object-cover object-[72%_center]" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#140c07]/85 via-[#140c07]/30 to-transparent md:bg-gradient-to-r md:from-[#140c07]/80 md:via-[#140c07]/35" />
        <div className="relative flex min-h-[560px] flex-col justify-end px-6 pt-40 pb-9 md:min-h-[620px] md:justify-center md:px-14 md:py-16">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-[#f0c27a] uppercase">About Rfaheya</p>
          <h1 id="about-title" className="mt-4 font-serif text-[64px] leading-[0.9] text-white sm:text-[96px] lg:text-[120px]">
            Speak
            <br />
            <span className="text-[#f0c27a] italic">your scent.</span>
          </h1>
          <p className="mt-5 max-w-md text-[16px] leading-[1.6] text-white/85 sm:text-[18px]">Fragrance is more than how you smell. It’s how you express yourself.</p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <Link to="/shop" className="inline-flex h-12 items-center gap-2 rounded-full bg-olive px-7 text-[12px] font-semibold tracking-[0.12em] text-white uppercase transition hover:bg-olive-hover">
              Shop the collection <ArrowRight className="size-4" strokeWidth={1.6} />
            </Link>
            <Link to="/finder" className="inline-flex h-12 items-center rounded-full bg-white/15 px-6 text-[12px] font-semibold tracking-[0.12em] text-white uppercase backdrop-blur-md transition hover:bg-white/25">
              Find your scent
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- A few numbers ---------- */}
      <ul className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-4" aria-label="Rfaheya in numbers">
        {[
          { big: count > 0 ? `${count}` : '100+', small: 'Inspired fragrances' },
          { big: '6', small: 'Standard™ dimensions' },
          { big: '5 ml', small: 'To try any scent first' },
          { big: '2–4', small: 'Days to your door' },
        ].map((n) => (
          <li key={n.small} className="rf-white rounded-[22px] border border-line px-5 py-5 lg:rounded-[28px] lg:px-7 lg:py-6">
            <p className="font-serif text-[44px] leading-none lg:text-[56px]">{n.big}</p>
            <p className="mt-2 text-[12px] font-semibold tracking-[0.12em] text-muted uppercase">{n.small}</p>
          </li>
        ))}
      </ul>

      {/* ---------- Why Rfaheya ---------- */}
      <section aria-labelledby="why-title" className="rf-white grid gap-8 rounded-[28px] border border-line px-5 py-9 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-12 lg:rounded-[36px] lg:p-12">
        <div>
          <p className={eyebrow}>Why Rfaheya</p>
          <h2 id="why-title" className={h2}>
            Fragrance should <span className="text-gold italic">speak for you.</span>
          </h2>
          <p className="mt-5 font-serif text-[22px] leading-[1.35] text-ink">We created Rfaheya for people who see fragrance as more than something they wear — but as something they express.</p>
          <p className="mt-4 text-[15px] leading-[1.7] text-ink-soft">
            Great fragrances shouldn’t be limited by price, labels, or expectations. Rfaheya makes a carefully crafted fragrance experience more accessible — without losing the details
            that make it worth wearing.
          </p>
        </div>
        <ul className="grid gap-2.5 sm:grid-cols-3 lg:gap-3">
          {why.map(({ image, Icon, title, text, tint }) => (
            <li key={title} className="flex items-center gap-4 rounded-[24px] p-4 sm:flex-col sm:items-start sm:p-5" style={{ background: tint }}>
              <img src={image} alt="" loading="lazy" className="size-20 shrink-0 object-contain sm:size-28" />
              <div>
                <Icon className="size-5 text-gold" strokeWidth={1.4} />
                <h3 className="mt-2 font-serif text-[22px] leading-[1.05]">{title}</h3>
                <p className="mt-1.5 text-[13px] leading-[1.5] text-ink-soft">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- What we stand for ---------- */}
      <section aria-labelledby="values-title" className="rounded-[28px] bg-chip px-5 py-9 lg:rounded-[36px] lg:p-12">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className={eyebrow}>What we stand for</p>
            <h2 id="values-title" className={h2}>
              Well made. Well understood.
              <br />
              <span className="text-gold italic">Worth wearing.</span>
            </h2>
          </div>
        </div>
        <ol className="mt-8 grid grid-cols-2 gap-2.5 lg:mt-10 lg:grid-cols-4 lg:gap-4">
          {values.map((v, i) => (
            <li key={v.title} className="rf-white flex flex-col rounded-[24px] p-4 lg:p-6">
              <span className="text-[11px] font-semibold tracking-[0.14em] text-gold">{String(i + 1).padStart(2, '0')}</span>
              <img src={v.image} alt="" loading="lazy" className="mt-3 aspect-[4/3] w-full rounded-[16px] object-cover" />
              <h3 className="mt-3 font-serif text-[26px] leading-none lg:text-[30px]">{v.title}</h3>
              <p className="mt-2 text-[13px] leading-[1.5] text-ink-soft lg:text-[14px]">{v.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- The Standard ---------- */}
      <section aria-labelledby="standard-title" className="grid gap-8 rounded-[28px] bg-[#14110d] px-5 py-9 text-white lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-12 lg:rounded-[36px] lg:p-12">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.24em] text-olive uppercase">The Rfaheya Standard™</p>
          <h2 id="standard-title" className="mt-3 font-serif text-[44px] leading-[0.98] text-white sm:text-[60px]">
            We put it
            <br />
            <span className="text-[#f0c27a] italic">to the test.</span>
          </h2>
          <p className="mt-4 max-w-sm text-[15px] leading-[1.6] text-[#b9ae9c]">Every Rfaheya fragrance is evaluated beyond the scent — on six dimensions of how it lives on skin.</p>
          <Link to="/our-standard" className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-olive px-7 text-[12px] font-semibold tracking-[0.12em] text-white uppercase transition hover:bg-olive-hover">
            Explore the standard <ArrowRight className="size-4" strokeWidth={1.6} />
          </Link>
        </div>
        <ol className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:gap-3">
          {pillars.map((p, i) => (
            <li key={p.title} className="flex flex-col gap-3 rounded-[22px] border border-[#2c261f] bg-[#1f1b16] p-4">
              <img src={p.image} alt="" loading="lazy" className="size-14 rounded-full object-cover" />
              <div>
                <p className="text-[11px] font-semibold tracking-[0.12em] text-olive">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="font-serif text-[22px] leading-tight text-white">{p.title}</h3>
                <p className="mt-0.5 text-[12.5px] leading-[1.4] text-[#a99d8b]">{p.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- DNA approach ---------- */}
      <section aria-labelledby="dna-title" className="rf-white rounded-[28px] border border-line px-5 py-9 lg:rounded-[36px] lg:p-12">
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-12">
          <div>
            <p className={eyebrow}>Our DNA approach</p>
            <h2 id="dna-title" className={h2}>
              Same inspiration.
              <br />
              <span className="text-gold italic">A distinct experience.</span>
            </h2>
          </div>
          <p className="text-[15px] leading-[1.7] text-ink-soft lg:text-[16px]">
            Every Rfaheya fragrance has a clear DNA — an original fragrance that guides its olfactive direction. We take that direction and create our own fragrance experience around it.
          </p>
        </div>
        <div className="mt-8 grid gap-2.5 md:grid-cols-2 lg:mt-10 lg:gap-4">
          {[
            { eyebrow: 'Original fragrance', name: 'Sauvage Elixir', brand: 'Dior', image: dnaOriginal, key: 'original' as const, bg: 'bg-sand', bar: 'bg-line-strong' },
            { eyebrow: 'Rfaheya interpretation', name: 'Elexerium', brand: 'Rfaheya', image: dnaRfaheya, key: 'rfaheya' as const, bg: 'bg-[#f3e3c9]', bar: 'bg-gradient-to-r from-[#f0c27a] to-olive' },
          ].map((c) => (
            <div key={c.key} className={`${c.bg} grid items-center gap-4 rounded-[24px] p-5 sm:grid-cols-[1fr_1.1fr] lg:p-6`}>
              <img src={c.image} alt={`${c.name} by ${c.brand}`} loading="lazy" className="mx-auto w-full max-w-[260px] rounded-[18px] object-cover" />
              <div>
                <p className="text-[10.5px] font-semibold tracking-[0.2em] text-gold uppercase">{c.eyebrow}</p>
                <p className="mt-1.5 font-serif text-[32px] leading-none">{c.name}</p>
                <p className="mt-1 text-[11px] font-semibold tracking-[0.2em] text-muted uppercase">{c.brand}</p>
                <ul className="mt-5 space-y-3">
                  {dnaNotes.map((n) => (
                    <li key={n.note}>
                      <p className="flex justify-between text-[12.5px]">
                        <span className="text-ink-soft">{n.note}</span>
                        <span className="text-muted tabular-nums">{Math.round(n[c.key] * 100)}%</span>
                      </p>
                      <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-white/70">
                        <span className={`block h-full rounded-full ${c.bar}`} style={{ width: `${n[c.key] * 100}%` }} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        <Link to="/shop" className="rf-white mt-7 inline-flex h-12 items-center gap-2 rounded-full border border-line px-6 text-[12px] font-semibold tracking-[0.12em] uppercase transition hover:border-ink">
          Explore products <ArrowRight className="size-4" strokeWidth={1.6} />
        </Link>
      </section>
    </div>
  )
}
