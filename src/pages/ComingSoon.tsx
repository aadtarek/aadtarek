import { Link } from 'react-router-dom'

/** Placeholder for sections whose designs haven't been shared yet. */
export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="container-x flex min-h-[55vh] flex-col items-center justify-center py-16 text-center">
      <p className="text-[12px] tracking-[0.3em] text-ink-soft uppercase">Coming soon</p>
      <h1 className="mt-2 font-serif text-[44px] sm:text-[52px]">{title}.</h1>
      <p className="mt-2 max-w-md text-muted">We’re crafting this page with the same care as our fragrances.</p>
      <Link
        to="/shop"
        className="mt-6 inline-flex h-12 items-center rounded-[3px] bg-olive px-8 text-[12px] font-medium tracking-[0.12em] text-cream uppercase hover:bg-olive-hover"
      >
        Explore fragrances
      </Link>
    </div>
  )
}
