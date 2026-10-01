import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import hero from '../assets/hero.webp'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#e9e1d6]">
      {/* Mobile: image on top, copy below */}
      <img
        src={hero}
        alt="Rfaheya Vanilla Oud bottle on a stone plinth with vanilla pods, flowers and oud wood"
        className="h-56 w-full object-cover object-[78%_center] xs:h-64 sm:h-80 md:absolute md:inset-0 md:h-full md:object-[right_center]"
        fetchPriority="high"
      />
      {/* Soft wash so copy stays legible when the image narrows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-[#ebe3d9] via-[#ebe3d9]/70 to-transparent md:block xl:via-transparent xl:from-[#ebe3d9]/40"
      />

      <div className="container-x relative py-8 md:flex md:h-[clamp(332px,21.6vw,420px)] md:flex-col md:justify-center md:py-0">
        <p className="text-[10px] font-medium tracking-[0.32em] text-ink-soft uppercase sm:text-[11px]">
          Fragrances made personal
        </p>
        <h1 className="mt-3 text-[44px] leading-[0.9] font-bold tracking-[-0.015em] uppercase sm:text-[56px] lg:mt-[14px] lg:text-[61px]">
          Speak
          <br />
          your scent.
        </h1>
        <p className="mt-3 max-w-[372px] text-[15px] leading-[1.25] text-ink sm:text-[16px] lg:mt-[16px]">
          Discover inspired fragrances crafted with quality materials, high concentration and a signature Rfaheya
          experience.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 lg:mt-[18px] lg:gap-[11px]">
          <Link
            to="/shop"
            className="group inline-flex h-[43px] items-center justify-center gap-2.5 rounded-[3px] bg-olive px-[34px] text-[12px] font-medium tracking-[0.1em] text-cream uppercase transition hover:bg-olive-hover"
          >
            Explore fragrances
            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" strokeWidth={1.5} />
          </Link>
          <Link
            to="/discover"
            className="inline-flex h-[43px] items-center justify-center rounded-[3px] border border-ink/80 px-[33px] text-[12px] font-medium tracking-[0.1em] text-ink uppercase transition hover:bg-ink hover:text-cream"
          >
            Find your scent
          </Link>
        </div>
      </div>
    </section>
  )
}
