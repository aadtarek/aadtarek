import { Droplet, Gift, ShieldCheck, Truck, type LucideIcon } from 'lucide-react'
import { FREE_SHIPPING } from '../config'
import { formatPrice } from '../lib/format'

const features = (): { icon: LucideIcon; title: string; text: string }[] => [
  FREE_SHIPPING.enabled
    ? { icon: Truck, title: 'Free shipping', text: `Over ${formatPrice(FREE_SHIPPING.min)}` }
    : { icon: Truck, title: 'Fast delivery', text: 'Across Egypt' },
  { icon: Droplet, title: 'Try 5 ml first', text: 'Before the full bottle' },
  { icon: ShieldCheck, title: 'Long-lasting', text: 'Rfaheya Standard™' },
  { icon: Gift, title: 'Gift ready', text: 'Boxes & sets' },
]

/** Four small light cards under the hero; a sideways row on phones. */
export function FeatureStrip() {
  return (
    <section aria-label="Why Rfaheya" className="container-x pt-6 lg:pt-8">
      <ul className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-3 lg:overflow-visible lg:px-0">
        {features().map(({ icon: Icon, title, text }) => (
          <li key={title} className="rf-feature flex shrink-0 items-center gap-3 rounded-[20px] border border-line rf-white py-3 pr-4 pl-3 lg:gap-3.5 lg:rounded-[22px] lg:py-[18px] lg:pr-5 lg:pl-5">
            <span className="grid size-[38px] shrink-0 place-items-center rounded-full bg-chip text-gold lg:size-[46px]">
              <Icon className="size-[19px] lg:size-5" strokeWidth={1.5} />
            </span>
            <span>
              <span className="block text-[13px] font-semibold whitespace-nowrap lg:text-[14.5px]">{title}</span>
              <span className="block text-[11.5px] whitespace-nowrap text-muted lg:text-[12.5px]">{text}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
