import { Box, FlaskConical, Leaf, RotateCw, ShieldCheck, type LucideIcon } from 'lucide-react'
import { Fragment } from 'react'

const features: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Leaf, title: 'Quality materials', text: 'Thoughtfully selected.' },
  { icon: FlaskConical, title: 'Thoughtfully crafted', text: 'Every detail has a purpose.' },
  { icon: ShieldCheck, title: 'Rfaheya Standard™', text: 'Our standard for fragrance.' },
  { icon: Box, title: 'Try 5 ML first', text: 'Discover before you commit.' },
  { icon: RotateCw, title: 'Zero risk guarantee', text: 'Shop with confidence.' },
]

export function FeatureStrip() {
  return (
    <section aria-label="Why Rfaheya" className="border-b border-line bg-cream">
      <div className="container-x no-scrollbar flex snap-x snap-mandatory scroll-px-4 items-center gap-5 sm:scroll-px-6 overflow-x-auto py-4 lg:h-[67px] lg:justify-between lg:gap-4 lg:py-0 xl:px-[98px]">
        {features.map(({ icon: Icon, title, text }, i) => (
          <Fragment key={title}>
            {i > 0 && <span aria-hidden className="h-8 w-px shrink-0 bg-line" />}
            <div className="flex shrink-0 snap-start items-center gap-3 xl:gap-[18px]">
              <Icon className="size-[26px] shrink-0 text-ink" strokeWidth={1.25} />
              <div>
                <p className="text-[11px] font-semibold tracking-[0.09em] whitespace-nowrap uppercase">{title}</p>
                <p className="mt-0.5 text-[12px] whitespace-nowrap text-muted">{text}</p>
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </section>
  )
}
