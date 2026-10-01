import { Link } from 'react-router-dom'
import logo from '../assets/logo.svg'

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link to="/" aria-label="Rfaheya — home" className={`block shrink-0 ${className}`}>
      <img src={logo} alt="Rfaheya — Speak your scent" className="h-full w-auto" draggable={false} />
    </Link>
  )
}
