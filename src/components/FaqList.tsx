import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useFaqs } from '../lib/useFaqs'
import { WpHtml } from './WpHtml'

/** The FAQs as white numbered cards that open one at a time (Contact, FAQs page, product page). */
export function FaqList({ first = 0 }: { first?: number }) {
  const faqs = useFaqs()
  const [open, setOpen] = useState(first)
  return (
    <ul className="space-y-2">
      {faqs.map((f, i) => {
        const on = open === i
        return (
          <li key={f.q} className={`rf-white overflow-hidden rounded-[22px] transition-shadow duration-300 ${on ? 'shadow-[0_18px_40px_-28px_rgba(60,40,10,0.45)]' : ''}`}>
            <h3>
              <button
                type="button"
                aria-expanded={on}
                onClick={() => setOpen(on ? -1 : i)}
                className="flex w-full items-center gap-3.5 px-4 py-4 text-left sm:gap-4 sm:px-5 sm:py-5"
              >
                <span className={`grid size-9 shrink-0 place-items-center rounded-full text-[12px] font-semibold tabular-nums transition ${on ? 'bg-olive text-on-accent' : 'bg-chip text-gold'}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="flex-1 font-serif text-[19px] leading-tight sm:text-[22px]">{f.q}</span>
                <span className={`grid size-8 shrink-0 place-items-center rounded-full transition duration-300 ${on ? 'rotate-45 bg-[#14110d] text-white' : 'bg-chip'}`}>
                  <Plus className="size-4" strokeWidth={1.8} />
                </span>
              </button>
            </h3>
            <div className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${on ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
              <div className="overflow-hidden">
                <div className="px-4 pb-5 text-[14.5px] leading-[1.7] text-ink-soft sm:pr-16 sm:pl-[4.25rem]">
                  {f.html !== undefined ? <WpHtml html={f.html} /> : <p>{f.text}</p>}
                </div>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
