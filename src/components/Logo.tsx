import { Link } from 'react-router-dom'
import logo from '../assets/logo.svg'
import { useOwnLogo } from '../lib/ownLogo'
import { HOME } from '../config'

/**
 * The store logo: the one chosen in the dashboard (Settings → Rfaheya Store, its empty
 * margins cut off), else the built-in one. `ownClassName` sizes the dashboard logo, which
 * is usually a script mark that needs more height than the built-in wordmark to read well.
 */
export function Logo({ className = '', ownClassName }: { className?: string; ownClassName?: string }) {
  const own = useOwnLogo()
  const mine = Boolean(HOME.logo)
  return (
    <Link to="/" aria-label="Rfaheya — home" data-own-logo={mine || undefined} className={`block shrink-0 ${mine && ownClassName ? ownClassName : className}`}>
      <img
        src={mine ? own.src : logo}
        alt="Rfaheya — Speak your scent"
        width={mine ? undefined : 1098}
        height={mine ? undefined : 327}
        className={`h-full w-auto ${mine ? 'rf-own-logo object-contain object-left transition-opacity duration-300' : ''}`}
        style={mine && !own.ready ? { opacity: 0 } : undefined}
        draggable={false}
      />
    </Link>
  )
}
