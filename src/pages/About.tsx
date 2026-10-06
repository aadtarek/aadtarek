import { ArrowRight, FlaskConical, Leaf, Sun, type LucideIcon } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import heroBg from '../assets/about/hero.webp'
import blobFlower from '../assets/about/blob-flower.webp'
import blobWood from '../assets/about/blob-wood.webp'
import blobAmber from '../assets/about/blob-amber.webp'
import valuesBg from '../assets/about/values.webp'
import value1 from '../assets/about/value-1.webp'
import value2 from '../assets/about/value-2.webp'
import value3 from '../assets/about/value-3.webp'
import value4 from '../assets/about/value-4.webp'
import standardBg from '../assets/about/standard.webp'
import standard1 from '../assets/about/standard-1.webp'
import standard2 from '../assets/about/standard-2.webp'
import standard3 from '../assets/about/standard-3.webp'
import standard4 from '../assets/about/standard-4.webp'
import standard5 from '../assets/about/standard-5.webp'
import standard6 from '../assets/about/standard-6.webp'
import dnaBg from '../assets/about/dna.webp'
import dnaOriginal from '../assets/about/dna-original.webp'
import dnaRfaheya from '../assets/about/dna-rfaheya.webp'

/**
 * About page, built from the design comps (1536/1600 px wide).
 *
 * On large screens each section is an "art panel": the photograph with the
 * text erased (src/assets/about) and the copy laid over it at the design's
 * coordinates, sized in container units so it scales exactly like the comp.
 * Smaller screens get a stacked layout of the same content.
 */

const INK = '#120b06'
const BROWN = '#86451e'
const SOFT = '#3b2f26'

// ---------------------------------------------------------------- content

const why = [
  { image: blobFlower, icon: Leaf, title: ['Quality', 'with purpose'], text: ['Thoughtfully selected', 'materials.'] },
  { image: blobWood, icon: FlaskConical, title: ['Crafted', 'with intention'], text: ['From formulation to', 'maceration, every detail', 'has a purpose.'] },
  { image: blobAmber, icon: Sun, title: ['Made', 'for real life'], text: ['Fragrance should fit', 'your days, your moments,', 'and your personality.'] },
]

const values = [
  { image: value1, title: 'Honesty', text: ['Clear about what', 'you’re wearing.'] },
  { image: value2, title: 'Craft', text: ['Every detail', 'has a purpose.'] },
  { image: value3, title: 'Balance', text: ['More than', 'intensity.'] },
  { image: value4, title: 'Value', text: ['The value should be', 'in the fragrance.'] },
]

const standard = [
  { image: standard1, label: 'Character' },
  { image: standard2, label: 'Comfort' },
  { image: standard3, label: 'Density' },
  { image: standard4, label: 'Projection' },
  { image: standard5, label: 'Longevity' },
  { image: standard6, label: 'Evolution' },
]

const dnaText = [
  'Every Rfaheya fragrance has a clear',
  'DNA — an original fragrance that',
  'guides its olfactive direction. We take',
  'that direction and create our own',
  'fragrance experience around it.',
]

/** Note intensity (0–1) for the original and the Rfaheya interpretation. */
const dnaNotes = [
  { note: 'Grapefruit', original: 0.42, rfaheya: 1 },
  { note: 'Black pepper', original: 0.74, rfaheya: 0.28 },
  { note: 'Licorice', original: 0.4, rfaheya: 0.26 },
]

// ---------------------------------------------------------------- art panel helpers

/** A section drawn at the comp's size; children use design pixels via px(). */
function Panel({ image, w, h, children, label }: { image: string; w: number; h: number; children: ReactNode; label?: string }) {
  return (
    <div
      className="relative w-full overflow-hidden bg-cover bg-center"
      style={{ aspectRatio: `${w} / ${h}`, backgroundImage: `url(${image})`, containerType: 'inline-size' }}
      role={label ? 'img' : undefined}
      aria-label={label}
    >
      {children}
    </div>
  )
}

/** Converts comp pixels to container width units for a comp `base` px wide. */
const unit = (base: number) => (n: number) => `${((n / base) * 100).toFixed(4)}cqw`

type TextProps = {
  base: number
  x: number
  y: number
  size: number
  ls?: number
  font?: 'serif' | 'sans'
  weight?: number
  color?: string
  center?: boolean
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3'
  className?: string
  children: ReactNode
}

/** One line of text at a comp position (x = left edge, or centre with `center`). */
function T({ base, x, y, size, ls = 0, font = 'serif', weight = 400, color = INK, center, as: Tag = 'span', className = '', children }: TextProps) {
  const u = unit(base)
  const style: CSSProperties = {
    position: 'absolute',
    left: u(x),
    top: u(y),
    fontSize: u(size),
    letterSpacing: `${ls}em`,
    lineHeight: 1,
    fontWeight: weight,
    color,
    whiteSpace: 'nowrap',
    transform: center ? 'translateX(-50%)' : undefined,
  }
  return (
    <Tag className={`${font === 'serif' ? 'font-serif' : 'font-sans'} ${className}`} style={style}>
      {children}
    </Tag>
  )
}

/** A thin rule at comp coordinates. */
function Rule({ base, x, y, w, h = 1, color = BROWN, opacity = 0.7 }: { base: number; x: number; y: number; w: number; h?: number; color?: string; opacity?: number }) {
  const u = unit(base)
  return <span aria-hidden className="absolute" style={{ left: u(x), top: u(y), width: u(w), height: `max(1px, ${u(h)})`, background: color, opacity }} />
}

function VRule({ base, x, y0, y1, color = BROWN, opacity = 0.35 }: { base: number; x: number; y0: number; y1: number; color?: string; opacity?: number }) {
  const u = unit(base)
  return <span aria-hidden className="absolute w-px" style={{ left: u(x), top: u(y0), height: u(y1 - y0), background: color, opacity }} />
}

function PanelButton({ base, x, y, w, h, to, size, ls, children }: { base: number; x: number; y: number; w: number; h: number; to: string; size: number; ls: number; children: ReactNode }) {
  const u = unit(base)
  return (
    <Link
      to={to}
      className="group absolute flex items-center justify-center rounded-full bg-[#1d130d] font-sans font-medium text-cream uppercase transition hover:bg-[#3a2618]"
      style={{ left: u(x), top: u(y), width: u(w), height: u(h), fontSize: u(size), letterSpacing: `${ls}em`, gap: u(size * 1.6) }}
    >
      {children}
      <ArrowRight className="transition group-hover:translate-x-1" style={{ width: u(size * 1.5), height: u(size * 1.5) }} strokeWidth={1.4} />
    </Link>
  )
}

// ---------------------------------------------------------------- mobile helpers

function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`flex items-center gap-4 font-sans text-[11px] font-semibold tracking-[0.4em] uppercase ${className}`} style={{ color: BROWN }}>
      {children}
      <span aria-hidden className="h-px w-16 opacity-70" style={{ background: BROWN }} />
    </p>
  )
}

function Title({ dark, brown, className = '' }: { dark: string; brown: string; className?: string }) {
  return (
    <h2 className={`font-serif font-semibold leading-[0.95] tracking-[-0.04em] uppercase ${className}`} style={{ color: INK }}>
      {dark}
      <br />
      <span style={{ color: BROWN }}>{brown}</span>
    </h2>
  )
}

/** Object photo cut from the comp, faded into the page at the edges. */
function Soft({ src, className = '' }: { src: string; className?: string }) {
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      className={className}
      style={{ maskImage: 'radial-gradient(closest-side, #000 62%, transparent)', WebkitMaskImage: 'radial-gradient(closest-side, #000 62%, transparent)' }}
    />
  )
}

// ---------------------------------------------------------------- sections

function Hero() {
  const B = 1536
  return (
    <section aria-labelledby="about-title">
      {/* large screens: the comp */}
      <div className="hidden md:block">
        <Panel image={heroBg} w={1536} h={545}>
          <T base={B} x={103} y={161.4} size={12.7} ls={0.48} font="sans" weight={600} color={BROWN} as="p">
            ABOUT RFAHEYA
          </T>
          <Rule base={B} x={304} y={167} w={95} />
          <h1 id="about-title">
            <T base={B} x={99} y={177} size={115} ls={-0.053} weight={600}>
              SPEAK
            </T>
            <T base={B} x={102} y={277.6} size={112} ls={-0.082} weight={600} color={BROWN}>
              YOUR SCENT.
            </T>
          </h1>
          <T base={B} x={103} y={403} size={29.7} as="p">
            Fragrance is more than how you smell.
          </T>
          <T base={B} x={103} y={441} size={29.7} as="p">
            It’s how you express yourself.
          </T>
        </Panel>
      </div>
      {/* phones */}
      <div className="md:hidden">
        <img src={heroBg} alt="" className="h-64 w-full object-cover object-[80%_center] xs:h-72" />
        <div className="bg-[#f4ece1] px-4 pt-8 pb-10">
          <Eyebrow>About Rfaheya</Eyebrow>
          <h1 className="mt-4 font-serif text-[64px] font-semibold leading-[0.88] tracking-[-0.06em] xs:text-[76px]" style={{ color: INK }}>
            SPEAK
            <br />
            <span style={{ color: BROWN }}>YOUR SCENT.</span>
          </h1>
          <p className="mt-5 font-serif text-[21px] leading-[1.3]" style={{ color: INK }}>
            Fragrance is more than how you smell. It’s how you express yourself.
          </p>
        </div>
      </div>
    </section>
  )
}

function Why() {
  const B = 1536
  const u = unit(B)
  const cols = [855, 1114, 1370]
  const blobs = [
    { x: 775, y: 40, w: 189 },
    { x: 1019, y: 39, w: 201 },
    { x: 1272, y: 37, w: 193 },
  ]
  const lineTops = [
    [357, 381],
    [355, 378, 402],
    [355, 378, 402],
  ]
  return (
    <section aria-labelledby="why-title" className="bg-[#f4ece1]">
      <div className="hidden xl:block">
        <div className="relative w-full" style={{ aspectRatio: '1536 / 479', containerType: 'inline-size' }}>
          <T base={B} x={97} y={46.4} size={12.7} ls={0.64} font="sans" weight={600} color={BROWN} as="p">
            WHY RFAHEYA
          </T>
          <Rule base={B} x={270} y={597 - 545} w={82} />
          <h2 id="why-title">
            <T base={B} x={96} y={74.9} size={65.4} ls={-0.063} weight={600}>
              FRAGRANCE SHOULD
            </T>
            <T base={B} x={93} y={138.3} size={68.3} ls={-0.047} weight={600} color={BROWN}>
              SPEAK FOR YOU.
            </T>
          </h2>
          <T base={B} x={98} y={233.3} size={22.8} as="p">
            We created Rfaheya for people who see fragrance as more
          </T>
          <T base={B} x={97} y={265.3} size={22.8} as="p">
            than something they wear — but as something they express.
          </T>
          {['Great fragrances shouldn’t be limited by price, labels, or expectations.', 'Rfaheya makes a carefully crafted fragrance experience more accessible —', 'without losing the details that make it worth wearing.'].map((line, i) => (
            <T key={line} base={B} x={97} y={324.6 + i * 27} size={17.2} font="sans" color={SOFT} as="p">
              {line}
            </T>
          ))}
          <VRule base={B} x={989} y0={71} y1={438} />
          <VRule base={B} x={1243} y0={71} y1={438} />
          {why.map((c, i) => {
            const Icon: LucideIcon = c.icon
            return (
              <div key={c.title.join(' ')}>
                <img src={c.image} alt="" className="absolute" style={{ left: u(blobs[i].x), top: u(blobs[i].y), width: u(blobs[i].w) }} />
                <Icon className="absolute -translate-x-1/2" style={{ left: u(cols[i]), top: u(226), width: u(36), height: u(36), color: BROWN }} strokeWidth={1.2} />
                <h3>
                  {c.title.map((t, j) => (
                    <T key={t} base={B} x={cols[i]} y={279.1 + j * 25} size={22.9} ls={-0.08} weight={600} center>
                      {t.toUpperCase()}
                    </T>
                  ))}
                </h3>
                <Rule base={B} x={cols[i] - 28.5} y={341} w={57} />
                {c.text.map((t, j) => (
                  <T key={t} base={B} x={cols[i]} y={lineTops[i][j]} size={15} font="sans" color={SOFT} center as="p">
                    {t}
                  </T>
                ))}
              </div>
            )
          })}
        </div>
      </div>

      <div className="container-x py-14 xl:hidden">
        <Eyebrow>Why Rfaheya</Eyebrow>
        <Title dark="Fragrance should" brown="Speak for you." className="mt-4 text-[44px] sm:text-[60px]" />
        <p className="mt-6 max-w-2xl font-serif text-[20px] leading-[1.4]" style={{ color: INK }}>
          We created Rfaheya for people who see fragrance as more than something they wear — but as something they express.
        </p>
        <p className="mt-4 max-w-2xl text-[16px] leading-[1.6]" style={{ color: SOFT }}>
          Great fragrances shouldn’t be limited by price, labels, or expectations. Rfaheya makes a carefully crafted fragrance
          experience more accessible — without losing the details that make it worth wearing.
        </p>
        <ul className="mt-10 grid gap-10 sm:grid-cols-3 sm:gap-6">
          {why.map((c) => {
            const Icon: LucideIcon = c.icon
            return (
              <li key={c.title.join(' ')} className="flex flex-col items-center text-center">
                <img src={c.image} alt="" loading="lazy" className="w-44" />
                <Icon className="mt-4 size-8" style={{ color: BROWN }} strokeWidth={1.2} />
                <h3 className="mt-3 font-serif text-[20px] font-semibold leading-[1.1] tracking-[-0.04em] uppercase" style={{ color: INK }}>
                  {c.title[0]}
                  <br />
                  {c.title[1]}
                </h3>
                <span aria-hidden className="mt-3 h-px w-14" style={{ background: BROWN, opacity: 0.7 }} />
                <p className="mt-3 max-w-[15rem] text-[15px] leading-[1.55]" style={{ color: SOFT }}>
                  {c.text.join(' ')}
                </p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

function Values() {
  const B = 1600
  const centers = [229, 531, 820, 1112]
  const nums = [133, 437, 727, 1018]
  return (
    <section aria-labelledby="values-title" className="bg-[#f3e4d1]">
      <div className="hidden xl:block">
        <Panel image={valuesBg} w={1600} h={569}>
          <T base={B} x={115} y={70.4} size={12.7} ls={0.48} font="sans" weight={600} color={BROWN} as="p">
            WHAT WE STAND FOR
          </T>
          <Rule base={B} x={368} y={76} w={114} />
          <h2 id="values-title">
            <T base={B} x={114} y={104.2} size={58.9} ls={-0.015} weight={600}>
              WELL MADE. WELL UNDERSTOOD.
            </T>
            <T base={B} x={115} y={165.2} size={58.9} ls={0.007} weight={600} color={BROWN}>
              WORTH WEARING.
            </T>
          </h2>
          {[386, 676, 966].map((x) => (
            <VRule key={x} base={B} x={x} y0={267} y1={484} />
          ))}
          {values.map((v, i) => (
            <div key={v.title}>
              <T base={B} x={nums[i]} y={268.4} size={12.7} ls={0.09} font="sans" weight={600} color={BROWN}>
                {`0${i + 1}`}
              </T>
              <Rule base={B} x={nums[i] + 27} y={274} w={70} opacity={0.55} />
              <h3>
                <T base={B} x={centers[i]} y={383.9} size={28.6} ls={-0.035} weight={600} center>
                  {v.title.toUpperCase()}
                </T>
              </h3>
              {v.text.map((t, j) => (
                <T key={t} base={B} x={centers[i]} y={427 + j * 26} size={19.5} color={SOFT} center as="p">
                  {t}
                </T>
              ))}
            </div>
          ))}
        </Panel>
      </div>

      <div className="container-x py-14 xl:hidden">
        <Eyebrow>What we stand for</Eyebrow>
        <Title dark="Well made. Well understood." brown="Worth wearing." className="mt-4 text-[38px] sm:text-[54px]" />
        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {values.map((v, i) => (
            <li key={v.title} className="flex flex-col items-center text-center">
              <p className="flex items-center gap-3 self-start font-sans text-[12px] font-semibold tracking-[0.1em]" style={{ color: BROWN }}>
                {`0${i + 1}`}
                <span aria-hidden className="h-px w-12 opacity-60" style={{ background: BROWN }} />
              </p>
              <Soft src={v.image} className="mt-2 w-40" />
              <h3 className="mt-2 font-serif text-[22px] font-semibold tracking-[-0.03em] uppercase" style={{ color: INK }}>
                {v.title}
              </h3>
              <p className="mt-1 font-serif text-[16px] leading-[1.4]" style={{ color: SOFT }}>
                {v.text.join(' ')}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Standard() {
  const B = 1600
  const centers = [236, 451, 665, 880, 1104, 1326]
  return (
    <section aria-labelledby="standard-title" className="bg-[#f1e3d2]">
      <div className="hidden xl:block">
        <Panel image={standardBg} w={1600} h={569}>
          <T base={B} x={149} y={55.2} size={14} ls={0.25} font="sans" weight={600} color={BROWN} as="p">
            THE RFAHEYA STANDARD™
          </T>
          <Rule base={B} x={430} y={61} w={105} />
          <h2 id="standard-title">
            <T base={B} x={149} y={77.8} size={80.8} ls={-0.032} weight={600}>
              WE PUT IT TO
            </T>
            <T base={B} x={151} y={147.8} size={80.8} ls={-0.02} weight={600} color={BROWN}>
              THE TEST.
            </T>
          </h2>
          <T base={B} x={150} y={234.2} size={28.2} as="p">
            Every Rfaheya fragrance is evaluated beyond the scent.
          </T>
          {[344.5, 558.5, 773.5, 989, 1216].map((x) => (
            <VRule key={x} base={B} x={x} y0={305} y1={428} />
          ))}
          {standard.map((s, i) => (
            <div key={s.label}>
              <T base={B} x={centers[i]} y={390} size={18.6} ls={-0.04} weight={600} center as="p">
                {s.label.toUpperCase()}
              </T>
              <Rule base={B} x={centers[i] - 23.5} y={426} w={47} />
            </div>
          ))}
          <PanelButton base={B} x={616} y={461} w={375} h={48} to="/our-standard" size={12.7} ls={0.28}>
            Explore Rfaheya Standard™
          </PanelButton>
        </Panel>
      </div>

      <div className="container-x py-14 xl:hidden">
        <Eyebrow>The Rfaheya Standard™</Eyebrow>
        <Title dark="We put it to" brown="the test." className="mt-4 text-[48px] sm:text-[64px]" />
        <p className="mt-4 font-serif text-[20px] leading-[1.35]" style={{ color: INK }}>
          Every Rfaheya fragrance is evaluated beyond the scent.
        </p>
        <ul className="mt-8 grid grid-cols-3 gap-x-3 gap-y-6 md:grid-cols-6">
          {standard.map((s) => (
            <li key={s.label} className="flex flex-col items-center text-center">
              <Soft src={s.image} className="w-28" />
              <p className="mt-1 font-serif text-[14px] font-semibold tracking-[-0.02em] uppercase" style={{ color: INK }}>
                {s.label}
              </p>
              <span aria-hidden className="mt-2 h-px w-10 opacity-70" style={{ background: BROWN }} />
            </li>
          ))}
        </ul>
        <Link
          to="/our-standard"
          className="mt-10 inline-flex h-12 items-center gap-3 rounded-full bg-[#1d130d] px-8 font-sans text-[12px] font-medium tracking-[0.24em] text-cream uppercase"
        >
          Explore Rfaheya Standard™ <ArrowRight className="size-4" strokeWidth={1.4} />
        </Link>
      </div>
    </section>
  )
}

function NoteBar({ base, x, y, w, level, label, labelY }: { base: number; x: number; y: number; w: number; level: number; label: string; labelY: number }) {
  const u = unit(base)
  return (
    <>
      <T base={base} x={x + 1} y={labelY} size={12.7} ls={0.14} font="sans" weight={500} color={SOFT} as="p">
        {label.toUpperCase()}
      </T>
      <span
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(level * 100)}
        className="absolute"
        style={{ left: u(x), top: u(y), width: u(w), height: u(12), border: `1px solid ${BROWN}`, background: 'rgba(255,250,243,.35)' }}
      >
        <span className="block h-full" style={{ width: `${level * 100}%`, background: 'linear-gradient(90deg,#5a2c12,#86451e)' }} />
      </span>
    </>
  )
}

function Dna() {
  const B = 1600
  const left = [
    { x: 541, w: 104, y: 314, labelY: 293.4 },
    { x: 528, w: 93, y: 430, labelY: 409.4 },
    { x: 517, w: 90, y: 548, labelY: 527.4 },
  ]
  const right = [
    { x: 1069, w: 113, y: 314, labelY: 293.4 },
    { x: 1069, w: 90, y: 430, labelY: 409.4 },
    { x: 1069, w: 89, y: 548, labelY: 527.4 },
  ]
  return (
    <section aria-labelledby="dna-title" className="bg-[#f3e3cf]">
      <div className="hidden xl:block">
        <Panel image={dnaBg} w={1600} h={800}>
          <T base={B} x={93} y={87.2} size={14} ls={0.42} font="sans" weight={600} color={BROWN} as="p">
            OUR DNA APPROACH
          </T>
          <Rule base={B} x={348} y={94} w={135} />
          <h2 id="dna-title">
            {['SAME', 'INSPIRATION.', 'A DISTINCT', 'EXPERIENCE.'].map((line, i) => (
              <T key={line} base={B} x={91} y={[132.1, 200.1, 269.1, 337.1][i]} size={69.4} ls={[-0.024, -0.075, -0.05, -0.054][i]} weight={600} color={i < 2 ? INK : BROWN}>
                {line}
              </T>
            ))}
          </h2>
          {dnaText.map((line, i) => (
            <T key={line} base={B} x={94} y={427.7 + i * 27.5} size={20.9} as="p">
              {line}
            </T>
          ))}
          <PanelButton base={B} x={91} y={588} w={358} h={60} to="/shop" size={14} ls={0.4}>
            Explore products
          </PanelButton>

          <T base={B} x={770.5} y={116} size={15.5} ls={0.19} font="sans" weight={600} color={BROWN} center as="p">
            ORIGINAL FRAGRANCE
          </T>
          <Rule base={B} x={747} y={147} w={51} />
          <T base={B} x={775.5} y={158} size={41.9} weight={500} center as="p">
            Sauvage Elixir
          </T>
          <T base={B} x={775} y={225.2} size={14} ls={0.22} font="sans" weight={600} color={BROWN} center as="p">
            DIOR
          </T>

          <T base={B} x={1322} y={116} size={15.5} ls={0.27} font="sans" weight={600} color={BROWN} center as="p">
            RFAHEYA INTERPRETATION
          </T>
          <Rule base={B} x={1305} y={147} w={50} />
          <T base={B} x={1336.5} y={159.9} size={47} ls={-0.02} weight={600} center as="p">
            ELEXERIUM
          </T>
          <T base={B} x={1336} y={225.2} size={14} ls={0.26} font="sans" weight={600} color={BROWN} center as="p">
            RFAHEYA
          </T>

          {dnaNotes.map((n, i) => (
            <NoteBar key={`o-${n.note}`} base={B} {...left[i]} level={n.original} label={n.note} />
          ))}
          {dnaNotes.map((n, i) => (
            <NoteBar key={`r-${n.note}`} base={B} {...right[i]} level={n.rfaheya} label={n.note} />
          ))}
        </Panel>
      </div>

      <div className="container-x py-14 xl:hidden">
        <Eyebrow>Our DNA approach</Eyebrow>
        <h2 className="mt-4 font-serif text-[44px] font-semibold leading-[0.95] tracking-[-0.05em] uppercase sm:text-[60px]" style={{ color: INK }}>
          Same inspiration.
          <br />
          <span style={{ color: BROWN }}>A distinct experience.</span>
        </h2>
        <p className="mt-5 max-w-xl font-serif text-[18px] leading-[1.5]" style={{ color: INK }}>
          {dnaText.join(' ')}
        </p>
        <div className="mt-10 grid gap-10 md:grid-cols-2">
          {[
            { eyebrow: 'Original fragrance', name: 'Sauvage Elixir', brand: 'Dior', image: dnaOriginal, key: 'original' as const, caps: false },
            { eyebrow: 'Rfaheya interpretation', name: 'Elexerium', brand: 'Rfaheya', image: dnaRfaheya, key: 'rfaheya' as const, caps: true },
          ].map((c) => (
            <div key={c.key} className="text-center">
              <p className="font-sans text-[12px] font-semibold tracking-[0.22em] uppercase" style={{ color: BROWN }}>
                {c.eyebrow}
              </p>
              <p className={`mt-2 font-serif text-[34px] ${c.caps ? 'font-semibold uppercase' : 'font-medium'}`} style={{ color: INK }}>
                {c.name}
              </p>
              <p className="font-sans text-[11px] font-semibold tracking-[0.24em] uppercase" style={{ color: BROWN }}>
                {c.brand}
              </p>
              <img src={c.image} alt={`${c.name} by ${c.brand}`} loading="lazy" className="mx-auto mt-4 w-full max-w-md" />
              <ul className="mx-auto mt-4 max-w-sm space-y-3 text-left">
                {dnaNotes.map((n) => (
                  <li key={n.note}>
                    <p className="font-sans text-[11px] font-medium tracking-[0.14em] uppercase" style={{ color: SOFT }}>
                      {n.note}
                    </p>
                    <span className="mt-1 block h-2.5 w-full" style={{ border: `1px solid ${BROWN}` }}>
                      <span className="block h-full" style={{ width: `${n[c.key] * 100}%`, background: 'linear-gradient(90deg,#5a2c12,#86451e)' }} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Link
          to="/shop"
          className="mt-10 inline-flex h-12 items-center gap-3 rounded-full bg-[#1d130d] px-8 font-sans text-[12px] font-medium tracking-[0.3em] text-cream uppercase"
        >
          Explore products <ArrowRight className="size-4" strokeWidth={1.4} />
        </Link>
      </div>
    </section>
  )
}

export function About() {
  return (
    <div className="bg-[#f4ece1]">
      <Hero />
      <Why />
      <Values />
      <Standard />
      <Dna />
    </div>
  )
}
