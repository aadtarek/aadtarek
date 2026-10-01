import { ArrowRight, Clock, FlaskConical, Handbag, Heart, Leaf, SlidersHorizontal, Sun, Waves, type LucideIcon } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { getAllProducts, getFamilies, sampleVariation } from '../../api/catalog'
import { ProductCard } from '../../components/ProductCard'
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

  return (
    <div className="bg-[#f2e9df]">
      {/* progress bar summary */}
      <div className="border-b border-[#e3d6c7] bg-[#efe4d8]">
        <div className="container-x flex flex-wrap items-center gap-x-8 gap-y-3 py-4">
          <p className="text-[13px] tracking-[0.14em] uppercase">Rfaheya Finder</p>
          <ol className="hidden flex-1 grid-cols-7 gap-2 md:grid">
            {STEPS.map((s, i) => (
              <li key={s} className="text-center">
                <Link to={`/finder/quiz?step=${i + 1}`} className="group block">
                  <span className="block h-[5px] rounded-full bg-espresso transition group-hover:bg-mocha" />
                  <span className="mt-1.5 block text-[12px] font-medium">{String(i + 1).padStart(2, '0')}</span>
                  <span className="block text-[11.5px] text-muted">{s}</span>
                </Link>
              </li>
            ))}
          </ol>
          <p className="text-[13px] tracking-[0.12em] text-muted uppercase">
            {TOTAL_STEPS} of {TOTAL_STEPS}
          </p>
          <Link
            to="/finder/quiz?step=7"
            className="inline-flex h-11 items-center gap-2.5 rounded-full border border-line-strong px-5 text-[11.5px] tracking-[0.12em] uppercase transition hover:bg-latte"
          >
            <SlidersHorizontal className="size-4" strokeWidth={1.4} />
            Review your choices
          </Link>
        </div>
      </div>

      {/* ---------- Match ---------- */}
      <section className="container-x grid items-start gap-10 py-10 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1fr)] lg:gap-12 lg:py-12">
        <div>
          <p className="text-[13px] tracking-[0.16em] uppercase">Your perfect scent · {percent}% match</p>
          <h1 className="mt-4 font-serif leading-[0.92]">
            <span className="block text-[60px] sm:text-[84px]">{product.name}</span>
            <span className="mt-2 block text-[40px] sm:text-[56px]">is your match</span>
          </h1>
          <p className="mt-5 max-w-[28rem] text-[17px] leading-[1.6] text-muted">{product.description}</p>

          <ul className="mt-6 grid grid-cols-3 gap-3 border-t border-[#e3d6c7] pt-5">
            <Stat icon={Sun} top={longevity.hours} bottom="Longevity" />
            <Stat icon={Waves} top={presenceLabel[product.profile.presence]} bottom="Presence" />
            <Stat icon={Leaf} top={family?.name ?? style} bottom="Scent style" />
          </ul>

          <div className="mt-7 max-w-[23rem] space-y-3">
            <button
              type="button"
              onClick={() => cart.openQuickAdd(product)}
              className="inline-flex h-[54px] w-full items-center justify-center gap-3 rounded-full bg-espresso text-[13.5px] tracking-[0.14em] text-cream uppercase transition hover:bg-espresso-hover"
            >
              <Handbag className="size-5" strokeWidth={1.4} />
              Add to cart
              <ArrowRight className="size-4" strokeWidth={1.4} />
            </button>
            {sample && (
              <button
                type="button"
                onClick={() => cart.add(product.id, sample.id)}
                className="inline-flex h-[54px] w-full items-center justify-center gap-3 rounded-full border border-espresso text-[13.5px] tracking-[0.14em] uppercase transition hover:bg-latte"
              >
                <FlaskConical className="size-5" strokeWidth={1.4} />
                Try {sample.size}
                <ArrowRight className="size-4" strokeWidth={1.4} />
              </button>
            )}
            <button
              type="button"
              onClick={() => wishlist.toggle(product.id)}
              aria-pressed={wished}
              className="inline-flex w-full items-center justify-center gap-2.5 py-2 text-[13px] tracking-[0.14em] uppercase hover:text-mocha"
            >
              <Heart className={`size-4 ${wished ? 'fill-ink' : ''}`} strokeWidth={1.6} />
              {wished ? 'Saved to favorites' : 'Save to favorites'}
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-lg">
          <Link to={`/product/${product.slug}`}>
            <img src={product.images[0].src} alt={product.images[0].alt} className="aspect-[580/510] w-full object-cover" />
          </Link>
          <div className="right-4 bottom-4 mt-3 rounded-lg bg-[#f8f1e8]/95 p-4 backdrop-blur sm:absolute sm:top-6 sm:bottom-auto sm:mt-0 sm:w-[150px]">
            <p className="text-[12px] tracking-[0.16em] text-muted uppercase">Key notes</p>
            <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-1">
              {keyNotes.map((n, i) => (
                <li key={`${n.name}-${i}`}>
                  <span className="grid aspect-[113/80] place-items-center rounded bg-sand">
                    <img src={n.image} alt="" className="h-12 w-auto object-contain" />
                  </span>
                  <p className="mt-1.5 text-[13px] font-medium uppercase">{n.name}</p>
                  <p className="text-[12px] text-muted">{tiers[i]}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- Why ---------- */}
      <section className="container-x pb-12" aria-labelledby="why-title">
        <h2 id="why-title" className="font-serif text-[36px] sm:text-[44px]">
          Why it matches you?
        </h2>
        <ul className="mt-6 grid gap-[13px] sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-lg bg-[#efe4d8] p-6">
              <span className="grid size-14 place-items-center rounded-full bg-latte">
                <Icon className="size-7" strokeWidth={1.2} />
              </span>
              <h3 className="mt-5 max-w-[14rem] font-serif text-[23px] leading-[1.1]">{title}</h3>
              <p className="mt-3 text-[15.5px] leading-[1.45] text-muted">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Also like ---------- */}
      {others.length > 0 && (
        <section className="container-x pb-16 lg:pb-20" aria-labelledby="also-title">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="also-title" className="font-serif text-[36px] sm:text-[44px]">
                You might also like
              </h2>
              <p className="mt-1 text-[17px] text-muted">Other fragrances that match your profile.</p>
            </div>
            <Link to="/shop" className="group inline-flex items-center gap-3 text-[13px] font-medium tracking-[0.14em] uppercase">
              Explore all fragrances
              <ArrowRight className="size-[18px] transition group-hover:translate-x-1" strokeWidth={1.5} />
            </Link>
          </div>
          <ul className="mt-6 grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
            {others.map((m) => (
              <li key={m.product.id}>
                <ProductCard product={m.product} badge={m.percent >= 50 ? `${m.percent}% match` : undefined} />
              </li>
            ))}
          </ul>
          <div className="mt-10 text-center">
            <Link
              to="/finder/quiz?step=1"
              className="inline-flex h-12 items-center rounded-full border border-line-strong px-8 text-[12.5px] tracking-[0.14em] uppercase transition hover:bg-latte"
            >
              Start over
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}

function Stat({ icon: Icon, top, bottom }: { icon: LucideIcon; top: string; bottom: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-6 shrink-0" strokeWidth={1.2} />
      <span>
        <span className="block text-[14.5px] leading-tight">{top}</span>
        <span className="block text-[13px] text-muted">{bottom}</span>
      </span>
    </li>
  )
}
