import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import heroBg from '../assets/about/hero.webp'
import { primaryButton } from '../components/PageHeader'

/** 404: a photo island with a big “404”, a line and the ways back. */
export function NotFound() {
  return (
    <div className="container-x pt-3 pb-8 lg:pt-4 lg:pb-12">
      <section className="relative overflow-hidden rounded-[28px] bg-[#1c120b] lg:rounded-[36px]">
        <img src={heroBg} alt="" className="absolute inset-0 size-full object-cover object-[70%_center]" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#140c07]/90 via-[#140c07]/45 to-[#140c07]/10 md:bg-gradient-to-r md:from-[#140c07]/85 md:via-[#140c07]/45" />
        <div className="relative flex min-h-[520px] flex-col justify-end px-6 py-9 text-white md:min-h-[560px] md:justify-center md:px-14">
          <p className="font-serif text-[120px] leading-[0.8] text-[#f0c27a] sm:text-[170px]">404</p>
          <h1 className="mt-4 font-serif text-[40px] leading-none sm:text-[56px]">
            This scent has <span className="text-[#f0c27a] italic">faded.</span>
          </h1>
          <p className="mt-3 max-w-md text-[15.5px] text-white/75">The page you’re looking for doesn’t exist or has moved. Let’s find you something better.</p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <Link to="/shop" className={primaryButton}>
              Shop fragrances
              <ArrowRight className="size-4" strokeWidth={1.6} />
            </Link>
            <Link to="/finder" className="inline-flex h-12 items-center rounded-full bg-white/15 px-6 text-[12px] font-semibold tracking-[0.12em] uppercase backdrop-blur-md transition hover:bg-white/25">
              Find your scent
            </Link>
            <Link to="/" className="inline-flex h-12 items-center rounded-full px-4 text-[12px] font-semibold tracking-[0.12em] text-white/80 uppercase underline-offset-4 hover:underline">
              Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
