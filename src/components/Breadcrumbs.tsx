import { ChevronRight } from 'lucide-react'
import { Fragment } from 'react'
import { Link } from 'react-router-dom'

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[12px] tracking-[0.08em] text-muted uppercase">
      {items.map((item, i) => (
        <Fragment key={item.label}>
          {i > 0 && <ChevronRight className="size-3.5" strokeWidth={1.5} />}
          {item.to ? (
            <Link to={item.to} className="transition hover:text-ink">
              {item.label}
            </Link>
          ) : (
            <span aria-current="page" className="text-ink">
              {item.label}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  )
}
