import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import hero from '../assets/hero.webp'
import { HOME } from '../config'

/** "SPEAK YOUR SCENT." → "Speak your scent." (titles typed in capitals read better in the serif) */
const sentenceCase = (line: string) => (line === line.toUpperCase() ? line.charAt(0) + line.slice(1).toLowerCase() : line)

export function Hero() {
  const copy = HOME.hero
  const lines = copy.title.split(/\r?\n/)
  return (
    // Pulled up under the transparent header (see Header).
    <section className="relative -mt-16 overflow-hidden bg-latte lg:-mt-[67px]">
      {/* Mobile: image on top, copy below */}
      <img
        src={copy.image || hero}
        srcSet={copy.image ? copy.srcset || undefined : undefined}
        // On phones the wide image is cropped to a tall box, so it needs a wider file (same as rfaheya.php).
        sizes="(max-width: 767px) 250vw, 100vw"
        width={1600}
        height={900}
        alt={copy.image ? '' : 'Rfaheya Vanilla Oud bottle on a stone plinth with vanilla pods, flowers and oud wood'}
        className="h-[340px] w-full object-cover object-[78%_center] xs:h-[380px] sm:h-[460px] md:absolute md:inset-0 md:h-full md:object-[right_center]"
        fetchPriority="high"
      />
      {/* Soft wash so copy stays legible when the image narrows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-[#e5e2df] via-[#e5e2df]/70 to-transparent md:block xl:via-transparent xl:from-[#e5e2df]/40"
      />

      <div className="container-x relative py-8 md:flex md:h-[clamp(560px,40vw,780px)] md:flex-col md:justify-center md:py-0 md:pt-[67px]">
        <p className="text-[10px] font-medium tracking-[0.32em] text-gold uppercase sm:text-[11px]">
          {copy.eyebrow}
        </p>
        <h1 className="mt-3 font-serif text-[54px] leading-[0.92] sm:text-[72px] lg:mt-[14px] lg:text-[92px]">
          {lines.map((line, i) => (
            <span key={i} className={i > 0 && i === lines.length - 1 ? 'text-gold italic' : undefined}>
              {i > 0 && <br />}
              {sentenceCase(line)}
            </span>
          ))}
        </h1>
        <p className="mt-3 max-w-[372px] text-[15px] leading-[1.25] text-ink sm:text-[16px] lg:mt-[16px]">
          {copy.text}
        </p>
        <div className="mt-4 flex flex-wrap gap-3 lg:mt-[18px] lg:gap-[11px]">
          <Link
            to="/shop"
            className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-olive px-8 text-[11.5px] font-medium tracking-[0.12em] text-cream uppercase transition hover:bg-olive-hover"
          >
            Explore fragrances
            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" strokeWidth={1.5} />
          </Link>
          <Link
            to="/finder"
            className="inline-flex h-12 items-center justify-center rounded-full bg-cream/75 px-8 text-[11.5px] font-medium tracking-[0.12em] text-ink uppercase backdrop-blur-md transition hover:bg-cream"
          >
            Find your scent
          </Link>
        </div>
      </div>
    </section>
  )
}
