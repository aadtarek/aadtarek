import { Plus } from 'lucide-react'
import type { ReactNode } from 'react'

/** Native <details> so it works without JS and stays accessible. */
export function AccordionItem({ title, children, open = false }: { title: string; children: ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group border-b border-line">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[13px] font-medium tracking-[0.12em] uppercase [&::-webkit-details-marker]:hidden">
        {title}
        <Plus className="size-4 shrink-0 transition-transform duration-300 group-open:rotate-45" strokeWidth={1.5} />
      </summary>
      <div className="pb-6 text-[15px] leading-[1.7] text-ink-soft">{children}</div>
    </details>
  )
}
