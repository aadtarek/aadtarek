import type { ReactNode } from 'react'

/** A page title on a soft island (as on the shop): eyebrow, large serif title, anything below it. */
export function PageHeader({ eyebrow, title, children, aside }: { eyebrow: string; title: string; children?: ReactNode; aside?: ReactNode }) {
  return (
    <div className="container-x pt-3 lg:pt-4">
      <header className="grid gap-5 pt-4 pb-2 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-10 lg:rounded-[36px] lg:bg-chip lg:px-12 lg:py-11">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.24em] text-gold uppercase">{eyebrow}</p>
          <h1 className="mt-2.5 font-serif text-[42px] leading-[0.98] tracking-[-0.01em] sm:text-[60px]">{title.replace(/\.$/, '')}</h1>
          {children}
        </div>
        {aside}
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
