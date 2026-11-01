import type { ReactNode } from 'react'
import fallback from '../assets/about/hero.webp'

/** The title with its last word in gold italic, as on the story pages. */
function GoldTail({ text }: { text: string }) {
  const clean = text.replace(/\.$/, '')
  const cut = clean.lastIndexOf(' ')
  if (cut < 0) return <>{clean}</>
  return (
    <>
      {clean.slice(0, cut)} <span className="text-gold italic">{clean.slice(cut + 1)}</span>
    </>
  )
}

/**
 * A page title island: eyebrow, large serif title (last word in gold) and
 * anything below it on one side, a photo on the other (on top on phones).
 */
export function PageHeader({
  eyebrow,
  title,
  children,
  aside,
  image = fallback,
}: {
  eyebrow: string
  title: string
  children?: ReactNode
  aside?: ReactNode
  image?: string
}) {
  return (
    <div className="container-x pt-3 lg:pt-4">
      <header className="grid overflow-hidden rounded-[28px] bg-chip lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:rounded-[36px]">
        <div className="order-2 flex flex-col justify-end px-5 pt-6 pb-7 lg:order-1 lg:px-12 lg:py-12">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-gold uppercase">{eyebrow}</p>
          <h1 className="mt-2.5 font-serif text-[42px] leading-[0.98] tracking-[-0.01em] sm:text-[58px] lg:text-[64px]">
            <GoldTail text={title} />
          </h1>
          {children}
          {aside && <div className="mt-6">{aside}</div>}
        </div>
        <div className="order-1 p-2 lg:order-2 lg:p-3">
          <img src={image} alt="" fetchPriority="high" className="h-40 w-full rounded-[22px] object-cover sm:h-52 lg:h-full lg:min-h-[300px] lg:rounded-[28px]" />
        </div>
      </header>
    </div>
  )
}

/** A friendly empty or finished state: an icon in a soft circle, a title, a line and actions. */
export function EmptyState({ icon, title, text, children }: { icon: ReactNode; title: string; text?: ReactNode; children?: ReactNode }) {
  return (
    <div className="rf-white flex flex-col items-center rounded-[28px] border border-line px-6 py-14 text-center sm:py-20">
      <span className="grid size-20 place-items-center rounded-full bg-chip text-gold">{icon}</span>
      <p className="mt-5 font-serif text-[32px] leading-none sm:text-[40px]">{title}</p>
      {text && <div className="mx-auto mt-3 max-w-md text-[15px] text-ink-soft">{text}</div>}
      {children && <div className="mt-7 flex flex-wrap justify-center gap-2.5">{children}</div>}
    </div>
  )
}

export const primaryButton =
  'inline-flex h-12 items-center justify-center gap-2 rounded-full bg-olive px-7 text-[12px] font-semibold tracking-[0.12em] text-white uppercase transition hover:bg-olive-hover'
export const ghostButton =
  'rf-white inline-flex h-12 items-center justify-center gap-2 rounded-full border border-line px-6 text-[12px] font-semibold tracking-[0.12em] uppercase transition hover:border-ink'
