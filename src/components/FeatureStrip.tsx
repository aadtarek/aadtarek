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
    <section aria-label="Why Rfaheya" className="rf-on-black overflow-hidden border-b border-line">
      {/* Phones: one row gliding sideways (a second copy closes the loop). Desktop: all five side by side. */}
      <div className="rf-marquee flex w-max items-center py-4 lg:container-x lg:w-full lg:justify-between lg:py-0 lg:h-[67px] xl:px-[98px]">
        <Features />
        <Features copy />
      </div>
    </section>
  )
}

function Features({ copy = false }: { copy?: boolean }) {
  return (
    <div aria-hidden={copy || undefined} className={`flex shrink-0 items-center gap-5 pr-5 lg:w-full lg:justify-between lg:gap-4 lg:pr-0 ${copy ? 'lg:hidden' : ''}`}>
      {features.map(({ icon: Icon, title, text }, i) => (
        <Fragment key={title}>
          {i > 0 && <span aria-hidden className="h-8 w-px shrink-0 bg-line" />}
          <div className="rf-feature flex shrink-0 items-center gap-3 xl:gap-[18px]">
            <Icon className="size-[26px] shrink-0 text-olive" strokeWidth={1.25} />
            <div>
              <p className="text-[11px] font-semibold tracking-[0.09em] whitespace-nowrap uppercase">{title}</p>
              <p className="mt-0.5 text-[12px] whitespace-nowrap text-muted">{text}</p>
            </div>
          </div>
        </Fragment>
      ))}
      <span aria-hidden className="h-8 w-px shrink-0 bg-line lg:hidden" />
    </div>
  )
}
