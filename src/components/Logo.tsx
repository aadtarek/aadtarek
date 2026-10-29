import { Link } from 'react-router-dom'
import logo from '../assets/logo.svg'
import { HOME } from '../config'

/** The store logo: the one chosen in the dashboard (Settings → Rfaheya Store), else the built-in one. */
export function Logo({ className = '' }: { className?: string }) {
  const own = HOME.logo
  return (
    <Link to="/" aria-label="Rfaheya — home" className={`block shrink-0 ${className}`}>
      <img
        src={own || logo}
        alt="Rfaheya — Speak your scent"
        width={own ? undefined : 1098}
        height={own ? undefined : 327}
        className={`h-full w-auto ${own ? 'rf-own-logo' : ''}`}
        draggable={false}
      />
    </Link>
  )
}
