import { ArrowRight, Clock, FlaskConical, Handbag, Heart, Leaf, SlidersHorizontal, Sun, Waves, type LucideIcon } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { getAllProducts, getFamilies, sampleVariation } from '../../api/catalog'
import { ProductCard } from '../../components/ProductCard'
import { addWithFlight } from '../../lib/addToCart'
import {
  allNotes,
  firstOpenStep,
  fromSearch,
  label,
  longevityOptions,
  occasionOptions,
  presenceLabel,
  STEPS,
  styleOptions,
  TOTAL_STEPS,
} from '../../finder/data'
import { rankProducts } from '../../finder/match'
import { useCart } from '../../store/cart'
import { useWishlist } from '../../store/wishlist'
import { tintFor } from '../../lib/tints'

export function FinderResult() {
  const [params] = useSearchParams()
  const answers = useMemo(() => fromSearch(params), [params])
  const ranked = useMemo(() => rankProducts(getAllProducts(), answers), [answers])
  const cart = useCart()
  const wishlist = useWishlist()

  useEffect(() => {
    document.title = ranked[0] ? `${ranked[0].product.name} is your match — Rfaheya Finder` : 'Rfaheya Finder'
    return () => {
      document.title = 'Rfaheya — Speak Your Scent'
    }
  }, [ranked])

  if (firstOpenStep(answers) < TOTAL_STEPS) return <Navigate to="/finder/quiz" replace />

  const { product, percent } = ranked[0]
  const others = ranked.slice(1, 4)
  const sample = sampleVariation(product)
  const wished = wishlist.has(product.id)
  const longevity = longevityOptions.find((o) => o.value === product.profile.longevity)!
  const family = getFamilies().find((f) => f.slug === product.families[0])
  const occasion = label(occasionOptions, answers.occasion)
  const style = label(styleOptions, answers.style)
  const noteLabels = answers.notes.map((n) => allNotes.find((o) => o.value === n)?.label ?? n)
  const keyNotes = [product.notes[0], product.notes[Math.floor(product.notes.length / 2)], product.notes[product.notes.length - 1]]
  const tiers = ['Top notes', 'Heart notes', 'Base notes']

  const reasons: { icon: LucideIcon; title: string; text: string }[] = [
    {
      icon: Sun,
      title: answers.occasion === 'everyday' || answers.occasion === 'work' ? 'Perfect for your daily routine' : `Made for ${occasion.toLowerCase()}`,
      text: `${product.tagline.replace(/\.$/, '')} — an easy choice for ${occasion.toLowerCase()}.`,
    },
    {
      icon: Clock,
      title: 'Lasts as long as you need',
      text: `${longevity.hours} of wear — ${longevity.value === answers.longevity ? 'exactly the longevity you asked for' : 'close to the longevity you asked for'}.`,
    },
    {
      icon: Waves,
      title: 'Matches your scent preferences',
      text: `${noteLabels.join(' and ')} ${noteLabels.length > 1 ? 'notes' : 'note'} with a ${style.toLowerCase()} character.`,
    },
    {
      icon: Leaf,
      title: `${presenceLabel[product.profile.presence]} presence`,
      text:
        product.profile.presence === 'bold'
          ? 'A confident trail that people remember.'
          : product.profile.presence === 'soft'
            ? 'Close to the skin and quietly elegant.'
            : 'Noticeable but not overwhelming — right for professional and casual settings.',
    },
  ]

  const tint = tintFor(product)
  const gold = 'bg-olive text-on-accent shadow-[0_14px_28px_-16px_rgba(160,100,20,0.9)] transition hover:bg-olive-hover'

  return (
    <div className="container-x space-y-4 pt-3 pb-16 lg:space-y-5 lg:pt-4 lg:pb-20">
      {/* ---------- Your answers ---------- */}
      <div className="rf-white flex flex-wrap items-center gap-x-6 gap-y-3 rounded-[24px] px-4 py-3.5 shadow-[inset_0_0_0_1px_var(--color-line)] lg:rounded-full lg:px-6">
        <p className="text-[11px] font-semibold tracking-[0.24em] text-gold uppercase">Rfaheya Finder</p>
        <ol className="hidden flex-1 grid-cols-7 gap-2 md:grid" aria-label="Your answers">
          {STEPS.map((s, i) => (
            <li key={s}>
              <Link to={`/finder/quiz?step=${i + 1}`} className="group block" title={`Edit ${s}`}>
                <span className="block h-[5px] rounded-full bg-olive transition group-hover:bg-olive-hover" />
                <span className="mt-1.5 block truncate text-[11.5px] font-medium text-muted group-hover:text-ink">{s}</span>
              </Link>
            </li>
          ))}
        </ol>
        <Link to="/finder/quiz?step=7" className="ml-auto inline-flex h-10 items-center gap-2 rounded-full bg-chip px-4 text-[11.5px] font-semibold tracking-[0.1em] uppercase transition hover:bg-olive hover:text-on-accent md:ml-0">
          <SlidersHorizontal className="size-4" strokeWidth={1.6} />
          Review choices
        </Link>
      </div>

      {/* ---------- The match ---------- */}
      <section className="rf-white grid overflow-hidden rounded-[28px] shadow-[inset_0_0_0_1px_var(--color-line)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:rounded-[36px]">
        <div className="order-2 px-5 py-8 lg:order-1 lg:p-12">
          <p className="inline-flex items-center gap-2 rounded-full bg-[#f3e3c9] py-1.5 pr-3.5 pl-1.5 text-[12px] font-semibold text-gold">
            <span className="grid h-6 place-items-center rounded-full bg-olive px-2 text-[11.5px] text-on-accent tabular-nums">{percent}%</span>
            Your perfect match
          </p>
          <h1 className="mt-5 font-serif leading-[0.92]">
            <span className="block text-[56px] sm:text-[80px]">{product.name}</span>
            <span className="mt-1 block text-[30px] text-gold italic sm:text-[44px]">is your scent.</span>
          </h1>
          <p className="mt-5 max-w-[30rem] text-[15.5px] leading-[1.65] text-ink-soft">{product.description}</p>

          <ul className="mt-7 grid grid-cols-3 gap-2">
            <Stat icon={Clock} top={longevity.hours} bottom="Longevity" />
            <Stat icon={Waves} top={presenceLabel[product.profile.presence]} bottom="Presence" />
            <Stat icon={Leaf} top={family?.name ?? style} bottom="Scent style" />
          </ul>

          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={() => cart.openQuickAdd(product)}
              className={`inline-flex h-[54px] flex-1 items-center justify-center gap-2.5 rounded-full text-[12.5px] font-semibold tracking-[0.12em] uppercase ${gold}`}
            >
              <Handbag className="size-[18px]" strokeWidth={1.5} />
              Add to cart
            </button>
            {sample && (
              <button
                type="button"
                onClick={(e) => addWithFlight(cart, e.currentTarget, product, sample.id)}
                className="inline-flex h-[54px] flex-1 items-center justify-center gap-2.5 rounded-full text-[12.5px] font-semibold tracking-[0.12em] text-gold uppercase shadow-[inset_0_0_0_1.5px_var(--color-olive)] transition hover:bg-olive hover:text-on-accent"
              >
                <FlaskConical className="size-[18px]" strokeWidth={1.5} />
                Try {sample.size.replace(/\s*ML$/i, ' ml')} first
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => wishlist.toggle(product.id)}
            aria-pressed={wished}
            className="mt-3 inline-flex items-center gap-2 py-2 text-[12px] font-semibold tracking-[0.12em] uppercase transition hover:text-gold"
          >
            <Heart className={`size-4 ${wished ? 'fill-olive text-olive' : ''}`} strokeWidth={1.6} />
            {wished ? 'Saved to favorites' : 'Save to favorites'}
          </button>
        </div>

        <div className="relative order-1 p-2 lg:order-2 lg:p-3">
          <Link to={`/product/${product.slug}`} className="block overflow-hidden rounded-[22px] lg:h-full lg:rounded-[28px]" style={{ background: tint.tint }}>
            <img src={product.images[0].src} alt={product.images[0].alt} className="aspect-[4/3] w-full object-cover lg:aspect-auto lg:h-full" />
          </Link>
          <div className="absolute inset-x-4 bottom-4 rounded-[20px] bg-white/85 p-3 text-[#14110d] backdrop-blur-xl lg:inset-x-6 lg:bottom-6 lg:p-4">
            <p className="text-[10.5px] font-semibold tracking-[0.2em] text-[#5b5145] uppercase">Key notes</p>
            <ul className="mt-2 grid grid-cols-3 gap-2">
              {keyNotes.map((n, i) => (
                <li key={`${n.name}-${i}`} className="flex items-center gap-2">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white">
                    <img src={n.image} alt="" className="size-7 object-contain" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-semibold">{n.name}</span>
                    <span className="block truncate text-[11px] text-[#5b5145]">{tiers[i]}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- Why ---------- */}
      <section className="rounded-[28px] bg-chip px-5 py-9 lg:rounded-[36px] lg:p-12" aria-labelledby="why-title">
        <p className="text-[11px] font-semibold tracking-[0.24em] text-gold uppercase">Why this one</p>
        <h2 id="why-title" className="mt-3 font-serif text-[38px] leading-none sm:text-[52px]">
          Why it <span className="text-gold italic">matches you.</span>
        </h2>
        <ul className="mt-8 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {reasons.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="rf-white relative overflow-hidden rounded-[24px] p-6">
              <span aria-hidden className="absolute -top-3 right-4 font-serif text-[100px] leading-none text-chip">
                {i + 1}
              </span>
              <span className="relative grid size-12 place-items-center rounded-full bg-olive text-on-accent">
                <Icon className="size-6" strokeWidth={1.5} />
              </span>
              <h3 className="relative mt-5 font-serif text-[24px] leading-[1.08]">{title}</h3>
              <p className="relative mt-2 text-[14px] leading-[1.55] text-ink-soft">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Also like ---------- */}
      {others.length > 0 && (
        <section className="rf-white rounded-[28px] px-4 py-9 shadow-[inset_0_0_0_1px_var(--color-line)] lg:rounded-[36px] lg:p-12" aria-labelledby="also-title">
          <div className="flex flex-col gap-3 px-1 lg:flex-row lg:items-end lg:justify-between lg:px-0">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.24em] text-gold uppercase">Also for you</p>
              <h2 id="also-title" className="mt-3 font-serif text-[38px] leading-none sm:text-[52px]">
                You might also like
              </h2>
            </div>
            <Link to="/shop" className="group inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.12em] uppercase hover:text-gold">
              Explore all fragrances
              <ArrowRight className="size-4 transition group-hover:translate-x-1" strokeWidth={1.6} />
            </Link>
          </div>
          <ul className="mt-7 grid grid-cols-2 gap-2.5 lg:grid-cols-3 lg:gap-4">
            {others.map((m) => (
              <li key={m.product.id}>
                <ProductCard product={m.product} badge={m.percent >= 50 ? `${m.percent}% match` : undefined} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------- Start over ---------- */}
      <section className="relative overflow-hidden rounded-[28px] bg-[#14110d] px-6 py-10 text-white lg:rounded-[36px] lg:px-14 lg:py-14">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.24em] text-[#f0c27a] uppercase">Changed your mind?</p>
            <h2 className="mt-3 font-serif text-[38px] leading-none sm:text-[52px]">
              Try it <span className="text-[#f0c27a] italic">again.</span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link to="/finder/quiz?step=1" className={`inline-flex h-[54px] items-center gap-2 rounded-full px-7 text-[12.5px] font-semibold tracking-[0.12em] uppercase ${gold}`}>
              Start over
              <ArrowRight className="size-4" strokeWidth={1.6} />
            </Link>
            <Link to="/finder/quiz?step=7" className="inline-flex h-[54px] items-center gap-2 rounded-full bg-white/10 px-7 text-[12.5px] font-semibold tracking-[0.12em] uppercase backdrop-blur-md transition hover:bg-white/20">
              Edit my answers
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function Stat({ icon: Icon, top, bottom }: { icon: LucideIcon; top: string; bottom: string }) {
  return (
    <li className="rounded-[18px] bg-sand p-3 sm:p-4">
      <Icon className="size-5 text-gold" strokeWidth={1.6} />
      <span className="mt-2 block text-[14px] leading-tight font-semibold sm:text-[15px]">{top}</span>
      <span className="block text-[11.5px] text-muted sm:text-[12.5px]">{bottom}</span>
    </li>
  )
}
