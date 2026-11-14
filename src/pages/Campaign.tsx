import { ArrowRight } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getAllProducts } from '../api/catalog'
import { ProductCard } from '../components/ProductCard'
import { CAMPAIGNS, SITE_IMAGES, type Campaign } from '../config'
import { usePageTitle } from '../lib/usePageTitle'
import type { Product } from '../types'
import { NotFound } from './NotFound'

const norm = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim()

/** Everything a fragrance smells of, lowercased: notes, accords and its composition. */
const smells = (p: Product) =>
  [...p.notes.map((n) => n.name), ...p.accords, ...p.composition.opening, ...p.composition.heart, ...p.composition.drydown].join(' ').toLowerCase()

/**
 * The campaign's fragrances: the ones tagged with its name in WooCommerce; with none tagged,
 * those whose notes match (all of its notes first, then any of them).
 */
export function campaignProducts(c: Campaign, all: Product[]) {
  const tag = norm(c.label)
  const slugTag = norm(c.slug.replace(/-/g, ' '))
  const tagged = all.filter((p) => p.tags.some((t) => [tag, slugTag].includes(norm(t))))
  if (tagged.length) return tagged
  const hits = (p: Product) => c.notes.filter((n) => smells(p).includes(n)).length
  return all
    .map((p) => ({ p, n: hits(p) }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .map((x) => x.p)
}

/** The title with the words after the comma in gold italic ("Vanilla, *redefined.*"). */
function Title({ text }: { text: string }) {
  const cut = text.lastIndexOf(',')
  if (cut < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, cut + 1)}
      <br />
      <span className="text-[#f0c27a] italic">{text.slice(cut + 1).trim()}</span>
    </>
  )
}

export function CampaignPage({ slug }: { slug: string }) {
  const c = CAMPAIGNS.find((x) => x.slug === slug)
  usePageTitle(c ? `${c.label} — Rfaheya` : undefined)
  const products = useMemo(() => (c ? campaignProducts(c, getAllProducts()) : []), [c])
  if (!c) return <NotFound />

  // The banner: the campaign picture from the dashboard (Settings → Site images), else the lead bottle.
  const wide = SITE_IMAGES[c.image] || products[0]?.images[0]?.src || ''
  const tall = SITE_IMAGES[c.imageMobile] || wide
  const other = CAMPAIGNS.find((x) => x.slug !== c.slug)

  return (
    <div className="pb-16 lg:pb-24">
      <div className="container-x pt-3 lg:pt-4">
        <section className="relative isolate overflow-hidden rounded-[28px] bg-[#120b06] text-white lg:rounded-[36px]">
          {wide && (
            <picture>
              <source media="(max-width: 767px)" srcSet={tall} />
              <img src={wide} alt="" fetchPriority="high" className="absolute inset-0 -z-10 size-full animate-[rf-campaign-zoom_14s_ease-out_both] object-cover" />
            </picture>
          )}
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0d0804]/95 via-[#0d0804]/45 to-[#0d0804]/10 md:bg-gradient-to-r md:from-[#0d0804]/92 md:via-[#0d0804]/55 md:to-transparent" />
          <div className="flex min-h-[520px] flex-col justify-end px-6 pt-48 pb-9 md:min-h-[560px] md:max-w-[640px] md:justify-center md:px-14 md:py-16">
            <p className="text-[11px] font-semibold tracking-[0.28em] text-[#f0c27a] uppercase">{c.eyebrow}</p>
            <h1 className="mt-4 font-serif text-[52px] leading-[0.95] tracking-[-0.01em] sm:text-[72px] lg:text-[84px]">
              <Title text={c.title} />
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-[1.65] text-white/80 sm:text-[17px]">{c.text}</p>
            <a href="#campaign-products" className="mt-7 inline-flex w-max items-center gap-2 rounded-full bg-olive px-6 py-3.5 text-[12px] font-bold tracking-[0.2em] text-[#1a1206] uppercase transition hover:bg-olive-hover">
              Discover the collection <ArrowRight className="size-4" strokeWidth={1.8} />
            </a>
          </div>
        </section>
      </div>

      <section id="campaign-products" className="container-x mt-10 scroll-mt-24 lg:mt-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.24em] text-gold uppercase">{c.label}</p>
            <h2 className="mt-2 font-serif text-[34px] leading-none sm:text-[44px]">The fragrances</h2>
          </div>
          <p className="text-[13px] text-ink-soft">{products.length} {products.length === 1 ? 'fragrance' : 'fragrances'}</p>
        </div>
        {products.length ? (
          <ul className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4 lg:gap-[18px]">
            {products.map((p, i) => (
              <li key={p.id}>
                <ProductCard product={p} priority={i < 4} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 rounded-[22px] bg-chip px-6 py-10 text-center text-ink-soft">The campaign’s fragrances are arriving soon.</p>
        )}
      </section>

      {other && (
        <div className="container-x mt-12 lg:mt-16">
          <Link to={`/${other.slug}`} className="group flex items-center justify-between gap-4 rounded-[28px] bg-[#120b06] px-6 py-7 text-white transition hover:bg-[#1b110a] lg:px-12 lg:py-10">
            <span>
              <span className="block text-[11px] font-semibold tracking-[0.24em] text-[#f0c27a] uppercase">Also in the spotlight</span>
              <span className="mt-2 block font-serif text-[30px] leading-none sm:text-[40px]">{other.label}</span>
            </span>
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-olive text-[#1a1206] transition group-hover:translate-x-1">
              <ArrowRight className="size-5" strokeWidth={1.8} />
            </span>
          </Link>
        </div>
      )}
    </div>
  )
}
