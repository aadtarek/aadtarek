import type { ReactNode } from 'react'

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="container-x pt-10 pb-6 lg:pt-[46px]">
      <p className="text-[12px] tracking-[0.3em] text-ink-soft uppercase sm:text-[14px]">{eyebrow}</p>
      <h1 className="mt-1.5 font-serif text-[38px] leading-[1.05] tracking-[-0.01em] sm:text-[52px]">{title}</h1>
      {children}
    </div>
  )
}
