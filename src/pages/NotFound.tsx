import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="container-x flex min-h-[55vh] flex-col items-center justify-center py-16 text-center">
      <p className="text-[12px] tracking-[0.3em] text-ink-soft uppercase">404</p>
      <h1 className="mt-2 font-serif text-[44px]">Page not found.</h1>
      <p className="mt-2 text-muted">The page you’re looking for doesn’t exist or has moved.</p>
      <Link
        to="/"
        className="mt-6 inline-flex h-12 items-center rounded-[3px] bg-olive px-8 text-[12px] font-medium tracking-[0.12em] text-cream uppercase hover:bg-olive-hover"
      >
        Back to home
      </Link>
    </div>
  )
}
