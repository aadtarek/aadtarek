import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

/** Whether a menu link leaves the store (a full web address, email or phone). */
export const isExternal = (to: string) => /^(https?:)?\/\/|^(mailto|tel):/i.test(to)

/** A menu link from the dashboard: a store page opens inside the store, a web address in a new tab. */
export function MenuLink({ to, className, children, ...rest }: { to: string; className?: string; children: ReactNode; 'aria-current'?: 'page' | undefined }) {
  if (isExternal(to))
    return (
      <a href={to} className={className} {...(/^(mailto|tel):/i.test(to) ? {} : { target: '_blank', rel: 'noopener noreferrer' })}>
        {children}
      </a>
    )
  return (
    <Link to={to} className={className} {...rest}>
      {children}
    </Link>
  )
}
