import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import heroBg from '../assets/standard-page/hero.webp'
import heroMobile from '../assets/standard-page/m-hero.webp'
import whyBg from '../assets/standard-page/why.webp'
import { BROWN, INK, Panel, Rule, T, VRule, unit } from '../components/ArtPanel'
import { dimensions, EVOLUTION_MOBILE_SECOND, type Dimension, type PanelLayout } from '../data/standard'

/**
 * The Rfaheya Standard™ page, built from the design comps: hero, why we
 * created it, the six dimensions, and a viewer that walks through each
 * dimension (tabs + previous/next). Large screens use the comps as art
 * panels; phones use the phone comps.
 */

const NUM = '#9c7559'
const TAB_NUM = '#967258'
const ACTIVE = '#3e1f07'
const NOTE = '#8a7f75'
const MID = '#a4886f'
const DARK_BTN = '#4f280a'
const GOLD = 'linear-gradient(180deg, #e2c08c 0%, #c99a5d 100%)'

// ---------------------------------------------------------------- hero

function scrollToViewer() {
  document.getElementById('dimension-viewer')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function Hero({ onPick }: { onPick: (i: number) => void }) {
  const B = 1600
  const list = (
    base: number,
    x: number,
    y: number,
    size: number,
    gap: number,
  ) => {
    const u = unit(base)
    return (
      <ul className="absolute flex items-center font-sans font-medium uppercase" style={{ left: u(x), top: u(y), fontSize: u(size), letterSpacing: '0.3em', gap: u(gap), color: '#d6cabd' }}>
        {dimensions.map((d, i) => (
          <li key={d.slug} className="flex items-center" style={{ gap: u(gap) }}>
            {i > 0 && <span aria-hidden>·</span>}
            <button type="button" onClick={() => onPick(i)} className="uppercase transition hover:text-white" style={{ letterSpacing: 'inherit' }}>
              {d.title}
            </button>
          </li>
        ))}
      </ul>
    )
  }
  return (
    <section aria-labelledby="standard-hero-title" className="bg-[#2b1f14]">
      <div className="hidden md:block">
        <Panel image={heroBg} w={1600} h={900}>
          <T base={B} x={79} y={228.6} size={16.5} ls={0.36} font="sans" weight={500} color="#e6dccf" as="p">
            THE RFAHEYA STANDARD™
          </T>
          <Rule base={B} x={443} y={235} w={153} color="#cdb9a0" opacity={0.8} />
          <h1 id="standard-hero-title">
            <T base={B} x={76} y={259} size={116} ls={0.005} color="#f2eae0">
              MORE THAN
            </T>
            <T base={B} x={76} y={373} size={116} ls={0.005} style={{ background: GOLD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
              A FRAGRANCE.
            </T>
          </h1>
          {['A fragrance is more than its first impression.', 'We look at how it feels, how it performs,', 'and how it evolves over time.'].map((line, i) => (
            <T key={line} base={B} x={78} y={523.4 + i * 36} size={26.9} color="#e2d7ca" as="p">
              {line}
            </T>
          ))}
          <Rule base={B} x={78} y={795} w={66} color="#cdb9a0" opacity={0.8} />
          {list(B, 78, 831.6, 13, 20.6)}
        </Panel>
      </div>
      <div className="md:hidden">
        <Panel image={heroMobile} w={738} h={1380}>
          <T base={738} x={58} y={814} size={19.5} ls={0.36} font="sans" weight={500} color="#e6dccf" as="p">
            THE RFAHEYA STANDARD™
          </T>
          <Rule base={738} x={470} y={822} w={150} color="#cdb9a0" opacity={0.8} />
          <h1>
            <T base={738} x={55} y={858} size={98} ls={-0.01} color="#f2eae0">
              MORE THAN
            </T>
            <T base={738} x={55} y={950} size={98} ls={-0.01} style={{ background: GOLD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
              A FRAGRANCE.
            </T>
          </h1>
          {['A fragrance is more than its first impression.', 'We look at how it feels, how it performs,', 'and how it evolves over time.'].map((line, i) => (
            <T key={line} base={738} x={58} y={1073 + i * 41} size={28.5} color="#e2d7ca" as="p">
              {line}
            </T>
          ))}
          {list(738, 54, 1265, 11, 11)}
        </Panel>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- why we created it + overview

const whyCopy = {
  title: ['NOT JUST', 'HOW IT SMELLS.'],
  text: [
    'A fragrance is personal. Performance is experienced.',
    'That’s why we created the Rfaheya Standard™ —',
    'a framework designed to evaluate the complete',
    'fragrance experience.',
  ],
  aside: ['A FRAGRANCE', 'SHOULD DO MORE', 'THAN SMELL GOOD.'],
  claim: ['FROM THE FIRST SPRAY', 'TO THE LAST TRACE.'],
}

function Why() {
  const B = 1600
  return (
    <section aria-labelledby="why-standard-title">
      <div className="hidden xl:block">
        <Panel image={whyBg} w={1600} h={565}>
          <T base={B} x={97} y={125.3} size={16.5} ls={0.3} font="sans" weight={500} color="#2c1d10" as="p">
            WHY WE CREATED IT
          </T>
          <Rule base={B} x={365} y={133} w={138} />
          <h2 id="why-standard-title">
            {whyCopy.title.map((line, i) => (
              <T key={line} base={B} x={95} y={[157.6, 249][i]} size={89} ls={-0.035} weight={500}>
                {line}
              </T>
            ))}
          </h2>
          {whyCopy.text.map((line, i) => (
            <T key={line} base={B} x={98} y={[367.2, 403.2, 438.2, 473.2][i]} size={25.8} as="p">
              {line}
            </T>
          ))}
          {whyCopy.aside.map((line, i) => (
            <T key={line} base={B} x={909} y={176.4 + i * 29} size={15.4} ls={0.26} font="sans" weight={500} color="#3c2a1c" as="p">
              {line}
            </T>
          ))}
          {whyCopy.claim.map((line, i) => (
            <T key={line} base={B} x={910} y={[317.6, 371.6][i]} size={51} ls={-0.045} weight={600} color="#5a2d0c" as="p">
              {line}
            </T>
          ))}
        </Panel>
      </div>
      <div className="relative overflow-hidden bg-[#efe4d6] xl:hidden">
        <img src={whyBg} alt="" className="absolute inset-0 h-full w-full object-cover object-right opacity-60" />
        <div className="container-x relative py-14">
          <p className="flex items-center gap-4 font-sans text-[12px] font-medium tracking-[0.3em] uppercase" style={{ color: '#2c1d10' }}>
            Why we created it <span aria-hidden className="h-px w-16" style={{ background: BROWN, opacity: 0.7 }} />
          </p>
          <h2 className="mt-4 font-serif text-[46px] font-medium leading-[0.98] tracking-[-0.035em] sm:text-[64px]" style={{ color: INK }}>
            NOT JUST
            <br />
            HOW IT SMELLS.
          </h2>
          <p className="mt-5 max-w-xl font-serif text-[19px] leading-[1.45]" style={{ color: INK }}>
            {whyCopy.text.join(' ')}
          </p>
          <p className="mt-8 font-sans text-[12px] font-medium leading-[2] tracking-[0.3em]" style={{ color: '#3c2a1c' }}>
            {whyCopy.aside.join(' ')}
          </p>
          <p className="mt-3 font-serif text-[30px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[40px]" style={{ color: '#5a2d0c' }}>
            {whyCopy.claim[0]}
            <br />
            {whyCopy.claim[1]}
          </p>
        </div>
      </div>
    </section>
  )
}

function Star({ style }: { style?: CSSProperties }) {
  return (
    <span aria-hidden className="absolute flex items-center" style={style}>
      <span className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, #b58a5f)' }} />
      <span className="mx-[0.6em] text-[1em] leading-none" style={{ color: '#a06a3c' }}>
        ✦
      </span>
      <span className="h-px flex-1" style={{ background: 'linear-gradient(90deg, #b58a5f, transparent)' }} />
    </span>
  )
}

function Overview({ onPick }: { onPick: (i: number) => void }) {
  const B = 1600
  const u = unit(B)
  const centers = [172, 424, 676, 925, 1178, 1431]
  return (
    <section aria-labelledby="six-dimensions-title" className="bg-[#f2e9e0]">
      <div className="hidden xl:block">
        <div className="relative w-full" style={{ aspectRatio: '1600 / 336', containerType: 'inline-size' }}>
          <T base={B} x={97} y={34.6} size={15.4} ls={0.3} font="sans" weight={600} color="#3b2312" as="h2">
            <span id="six-dimensions-title">THE SIX DIMENSIONS</span>
          </T>
          <Rule base={B} x={344} y={41} w={124} />
          {[300, 551, 801, 1051, 1304].map((x) => (
            <VRule key={x} base={B} x={x} y0={95} y1={250} opacity={0.3} />
          ))}
          {dimensions.map((d, i) => (
            <button
              key={d.slug}
              type="button"
              onClick={() => onPick(i)}
              aria-label={`${d.title}: ${d.summary.join(' ')}`}
              className="group absolute rounded-md transition hover:bg-white/30"
              style={{ left: u(centers[i] - 118), top: u(80), width: u(236), height: u(185) }}
            >
              <T base={B} x={118} y={4.2} size={66} color="#c3b09d" center>
                {d.num}
              </T>
              <T base={B} x={118} y={85.6} size={26.4} ls={-0.02} center className="group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                {d.title.toUpperCase()}
              </T>
              <Star style={{ left: u(73), top: u(128), width: u(90), fontSize: u(11) }} />
              {d.summary.map((line, j) => (
                <T key={line} base={B} x={118} y={155.6 + j * 24} size={14.2} ls={0.18} font="sans" weight={500} color="#5d5045" center>
                  {line.toUpperCase()}
                </T>
              ))}
            </button>
          ))}
        </div>
      </div>
      <div className="container-x py-12 xl:hidden">
        <h2 className="flex items-center gap-4 font-sans text-[12px] font-semibold tracking-[0.3em] uppercase" style={{ color: '#3b2312' }}>
          The six dimensions <span aria-hidden className="h-px w-16" style={{ background: BROWN, opacity: 0.7 }} />
        </h2>
        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
          {dimensions.map((d, i) => (
            <li key={d.slug}>
              <button type="button" onClick={() => onPick(i)} className="flex w-full flex-col items-center text-center">
                <span className="font-serif text-[44px] leading-none" style={{ color: '#c3b09d' }}>
                  {d.num}
                </span>
                <span className="mt-2 font-serif text-[20px] tracking-[-0.02em] uppercase" style={{ color: INK }}>
                  {d.title}
                </span>
                <span aria-hidden className="mt-2 text-[10px]" style={{ color: '#a06a3c' }}>
                  ✦
                </span>
                <span className="mt-2 font-sans text-[11px] font-medium tracking-[0.2em] uppercase" style={{ color: '#5d5045' }}>
                  {d.summary.join(' ')}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- dimension viewer

function Tabs({ L, active, onPick, phone }: { L: PanelLayout; active: number; onPick: (i: number) => void; phone: boolean }) {
  const u = unit(L.w)
  const t = L.tabs
  return (
    <>
      <T base={L.w} x={phone ? 37 : L.w === 1146 ? 47 : 98} y={t.eyebrowY} size={t.eyebrowSize} ls={0.3} font="sans" weight={600} color={ACTIVE} as="p" minPx={8}>
        THE SIX DIMENSIONS
      </T>
      <Rule base={L.w} x={phone ? 197 : L.w === 1146 ? 330 : 338} y={t.eyebrowY + t.eyebrowSize * 0.45} w={phone ? 100 : 100} />
      {t.dividers.map((x) => (
        <VRule key={x} base={L.w} x={x} y0={t.divY[0]} y1={t.divY[1]} opacity={0.3} />
      ))}
      <div role="tablist" aria-label="The six dimensions">
        {dimensions.map((d, i) => {
          const on = i === active
          return (
            <button
              key={d.slug}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls="dimension-panel"
              onClick={() => onPick(i)}
              className="group absolute"
              style={{ left: u(t.centers[i] - (t.centers[1] - t.centers[0]) / 2), top: u(t.divY[0] - 6), width: u(t.centers[1] - t.centers[0]), height: u(t.underlineY - t.divY[0] + 18) }}
            >
              <T base={L.w} x={(t.centers[1] - t.centers[0]) / 2} y={t.numY - t.divY[0] + 6 - t.numSize * 0.2} size={t.numSize} color={on ? ACTIVE : TAB_NUM} center>
                {d.num}
              </T>
              <T base={L.w} x={(t.centers[1] - t.centers[0]) / 2} y={t.labelY - t.divY[0] + 6 - t.labelSize * 0.2} size={t.labelSize} ls={-0.01} color={INK} center className={on ? '' : 'opacity-90 group-hover:opacity-100'} minPx={phone ? 6 : 0}>
                {d.title.toUpperCase()}
              </T>
              {on && (
                <span aria-hidden className="absolute" style={{ left: '50%', top: u(t.underlineY - t.divY[0] + 6), width: u(t.underlineW), transform: 'translateX(-50%)' }}>
                  <span className="block h-px w-full" style={{ background: ACTIVE }} />
                  <span className="absolute left-1/2 block rotate-45" style={{ top: u(-3.5), width: u(8), height: u(8), marginLeft: u(-4), background: ACTIVE }} />
                </span>
              )}
            </button>
          )
        })}
      </div>
    </>
  )
}

function ScaleRow({ L, labels }: { L: PanelLayout; labels: [string, string, string] }) {
  const s = L.scale
  if (!s) return null
  const u = unit(L.w)
  const size = 18.6
  return (
    <>
      {labels.map((label, i) => {
        const a = s.labels[i]
        return (
          <T key={label} base={L.w} x={a.x} y={s.labelY - size * 0.15} size={size} ls={0.2} font="sans" weight={600} color={i === 1 ? MID : INK} center={a.align === 'center'} right={a.align === 'right'} minPx={L.w === 759 ? 7 : 0}>
            {label.toUpperCase()}
          </T>
        )
      })}
      <span aria-hidden className="absolute h-px" style={{ left: u(s.dots[0]), top: u(s.lineY), width: u(s.dots[2] - s.dots[0]), background: '#7a5a40', opacity: 0.8 }} />
      {s.dots.map((x, i) => (
        <span
          key={x}
          aria-hidden
          className="absolute rounded-full"
          style={{
            left: u(x),
            top: u(s.lineY),
            width: u(L.w === 759 ? 15 : 19),
            height: u(L.w === 759 ? 15 : 19),
            transform: 'translate(-50%, -50%)',
            background: ['#fbf7f1', '#a48468', DARK_BTN][i],
            border: i === 0 ? `max(1px, ${u(1.6)}) solid ${INK}` : undefined,
          }}
        />
      ))}
    </>
  )
}

function DimensionPanel({ d, L, phone, active, onPick }: { d: Dimension; L: PanelLayout; phone: boolean; active: number; onPick: (i: number) => void }) {
  const B = L.w
  const q = phone ? d.mQuestion : d.question
  const desc = phone ? d.mDesc : d.desc
  const note = phone ? d.mNote : d.note
  const isEvolutionPhone = phone && d.slug === 'evolution'
  const small = phone ? 7 : 0
  const ruleW = phone ? 36 : L.w === 1146 ? 43 : 38
  const lineGap = phone ? 22 : 23
  return (
    <Panel image={L.image} w={L.w} h={L.h}>
      <Tabs L={L} active={active} onPick={onPick} phone={phone} />

      <div id="dimension-panel" role="tabpanel" aria-label={d.title}>
        <T base={B} x={phone ? 41 : L.w === 1146 ? 48 : 98} y={L.eyebrowY} size={phone ? (isEvolutionPhone ? 13.4 : 14.6) : L.w === 1146 ? 13.6 : 14.6} ls={0.3} font="sans" weight={600} color={ACTIVE} as="p" minPx={small}>
          THE RFAHEYA STANDARD™
        </T>
        <Rule base={B} x={phone ? (isEvolutionPhone ? 236 : 331) : L.w === 1146 ? 312 : 392} y={L.eyebrowY + 6} w={phone ? (isEvolutionPhone ? 100 : 127) : 156} />

        <p className="sr-only">{`Dimension ${d.num} of 06`}</p>
        <T base={B} x={L.numX} y={L.numY - L.numSize * 0.2} size={L.numSize} ls={-0.04} color={NUM} as="span" style={{ background: 'linear-gradient(180deg,#b38b6c,#94694c)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
          {d.num}
        </T>
        <VRule base={B} x={L.divX} y0={L.numY + 2} y1={L.numY + L.numSize * 0.72} color={INK} opacity={0.55} />
        <h3>
          <T base={B} x={L.titleX} y={L.titleY - L.titleSize * 0.2} size={L.titleSize} ls={-0.035} weight={600}>
            {d.title.toUpperCase()}
          </T>
        </h3>
        <T base={B} x={L.titleX} y={L.subY - L.subSize * 0.2} size={L.subSize} ls={-0.005} as="p">
          {d.subtitle}
        </T>

        {q.map((line, i) => (
          <T key={line} base={B} x={phone ? 50 : L.w === 1146 ? 50 : 98} y={L.qY[i] - L.qSize * 0.2} size={L.qSize} as="p">
            {line}
          </T>
        ))}
        {desc.map((line, i) => (
          <T key={line} base={B} x={phone ? 50 : L.w === 1146 ? 51 : 98} y={L.descY[i] - L.descSize * 0.2} size={L.descSize} as="p">
            {line}
          </T>
        ))}
        {note.map((line, i) => (
          <T key={line} base={B} x={phone ? 50 : L.w === 1146 ? 51 : 99} y={L.noteY[i] - L.noteSize * 0.15} size={L.noteSize} ls={L.w === 1536 ? 0.1 : 0.02} font="sans" weight={300} color={NOTE} as="p" minPx={small}>
            {line}
          </T>
        ))}

        {d.scale && <ScaleRow L={L} labels={d.scale} />}

        {L.dividers.xs.map((x) => (
          <VRule key={x} base={B} x={x} y0={L.dividers.y0} y1={L.dividers.y1} opacity={0.35} />
        ))}
        {isEvolutionPhone && <Rule base={B} x={78} y={EVOLUTION_MOBILE_SECOND.lineY} w={596} opacity={0.35} />}

        {d.levels.map((lv, i) => {
          const cx = L.centers[i]
          const rows = L.rows[i]
          const nameY = isEvolutionPhone && i === 1 ? EVOLUTION_MOBILE_SECOND.nameY : L.nameY
          const ruleY = isEvolutionPhone && i === 1 ? EVOLUTION_MOBILE_SECOND.ruleY : L.ruleY
          const lead = phone ? (lv.mLead ?? lv.lead) : lv.lead
          const text = phone ? (lv.mText ?? lv.text) : lv.text
          return (
            <div key={lv.name}>
              <T base={B} x={cx} y={nameY - L.nameSize * 0.15} size={L.nameSize} ls={0.22} font="sans" weight={600} center as="p" minPx={small}>
                {lv.name.toUpperCase()}
              </T>
              <Rule base={B} x={cx - ruleW / 2} y={ruleY} w={ruleW} color={INK} opacity={0.6} />
              {lead.map((line, j) => (
                <T key={line} base={B} x={cx} y={(rows.lead[j] ?? rows.lead[0] + j * lineGap) - L.leadSize * 0.2} size={L.leadSize} center as="p" minPx={small}>
                  {line}
                </T>
              ))}
              {text.map((line, j) => (
                <T key={line} base={B} x={cx} y={(rows.text[j] ?? rows.text[0] + j * lineGap) - L.textSize * 0.15} size={L.textSize} ls={0.02} font="sans" weight={300} color={NOTE} center as="p" minPx={small}>
                  {line}
                </T>
              ))}
            </div>
          )
        })}
      </div>

      <Pager L={L} active={active} onPick={onPick} />
    </Panel>
  )
}

function Pager({ L, active, onPick }: { L: PanelLayout; active: number; onPick: (i: number) => void }) {
  const u = unit(L.w)
  const p = L.pager
  const btn = (c: [number, number], dir: -1 | 1, children: ReactNode) => (
    <button
      type="button"
      aria-label={dir < 0 ? 'Previous dimension' : 'Next dimension'}
      onClick={() => onPick((active + dir + dimensions.length) % dimensions.length)}
      className="absolute grid place-items-center rounded-full transition hover:scale-105"
      style={{
        left: u(c[0] - p.r),
        top: u(c[1] - p.r),
        width: u(p.r * 2),
        height: u(p.r * 2),
        background: dir > 0 ? DARK_BTN : 'transparent',
        color: dir > 0 ? '#f6efe6' : DARK_BTN,
        border: dir < 0 ? `max(1px, ${u(1.3)}) solid ${DARK_BTN}` : undefined,
      }}
    >
      {children}
    </button>
  )
  return (
    <>
      <span aria-hidden className="absolute h-px" style={{ left: u(L.w === 1536 ? 93 : 0), top: u(p.ruleY), width: u(L.w === 1536 ? 1347 : L.w), background: '#7a5a40', opacity: 0.45 }} />
      <p className="absolute font-serif leading-none whitespace-nowrap" style={{ left: u(p.numX), top: u(p.numY - p.numSize * 0.2), fontSize: u(p.numSize), color: INK }}>
        {dimensions[active].num}
        <span className="font-sans" style={{ fontSize: u(p.numSize * 0.52), color: '#a07a5e', marginLeft: u(p.numSize * 0.3) }}>
          / 06
        </span>
      </p>
      {btn(p.prev, -1, <ArrowLeft style={{ width: u(p.r * 0.95), height: u(p.r * 0.95) }} strokeWidth={1.3} />)}
      {btn(p.next, 1, <ArrowRight style={{ width: u(p.r * 0.95), height: u(p.r * 0.95) }} strokeWidth={1.3} />)}
    </>
  )
}

function Viewer({ active, onPick }: { active: number; onPick: (i: number) => void }) {
  const d = dimensions[active]
  // Preload the other dimensions' artwork so switching is instant.
  useEffect(() => {
    for (const x of dimensions) for (const src of [x.desk.image, x.mob.image]) new Image().src = src
  }, [])
  return (
    <section id="dimension-viewer" aria-label="The Rfaheya Standard dimensions" className="scroll-mt-16 bg-[#efe4d6]">
      <div key={`d-${d.slug}`} className="hidden animate-fade-in lg:block">
        <DimensionPanel d={d} L={d.desk} phone={false} active={active} onPick={onPick} />
      </div>
      <div key={`m-${d.slug}`} className="animate-fade-in lg:hidden">
        <DimensionPanel d={d} L={d.mob} phone active={active} onPick={onPick} />
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- page

export function OurStandard() {
  const [params, setParams] = useSearchParams()
  const fromUrl = dimensions.findIndex((d) => d.slug === params.get('dimension'))
  const [active, setActive] = useState(Math.max(0, fromUrl))
  const firstRender = useRef(true)

  useEffect(() => {
    document.title = 'The Rfaheya Standard™ — Rfaheya'
    return () => {
      document.title = 'Rfaheya — Speak Your Scent'
    }
  }, [])

  // Keep ?dimension= in the address so a dimension can be shared or reloaded.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    setParams({ dimension: dimensions[active].slug }, { replace: true })
  }, [active, setParams])

  const pick = (i: number) => {
    setActive(i)
    scrollToViewer()
  }

  return (
    <div className="bg-[#efe4d6] [font-variant-numeric:lining-nums]">
      <Hero onPick={pick} />
      <Why />
      <Overview onPick={pick} />
      <Viewer active={active} onPick={setActive} />
    </div>
  )
}
