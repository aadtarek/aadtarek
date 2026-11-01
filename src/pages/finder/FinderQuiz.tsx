import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Flower2,
  MapPin,
  Pencil,
  SlidersHorizontal,
  Sun,
  UserRound,
  Waves,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import logo from '../../assets/logo.svg'
import { Overlay } from '../../components/Overlay'
import {
  allNotes,
  emptyAnswers,
  firstOpenStep,
  fromSearch,
  genderOptions,
  label,
  longevityOptions,
  mainNotes,
  MAX_NOTES,
  moreNotes,
  occasionOptions,
  panels,
  presenceOptions,
  seasonOptions,
  STEPS,
  styleOptions,
  toSearch,
  TOTAL_STEPS,
  type FinderAnswers,
  type Option,
} from '../../finder/data'
import { usePersistentState } from '../../lib/storage'
import { useSwipeClose } from '../../lib/useSwipeClose'

const stepIcons: LucideIcon[] = [UserRound, MapPin, Waves, Flower2, Sun, Waves, Clock]

export function FinderQuiz() {
  const [answers, setAnswers] = usePersistentState<FinderAnswers>('rfaheya.finder', emptyAnswers, (raw) =>
    raw && typeof raw === 'object'
      ? fromSearch(
          new URLSearchParams(
            toSearch({ ...(raw as FinderAnswers), notes: Array.isArray((raw as FinderAnswers).notes) ? (raw as FinderAnswers).notes : [] }),
          ),
        )
      : undefined,
  )
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const [reviewOpen, setReviewOpen] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [returnToReview, setReturnToReview] = useState(false)

  const open = firstOpenStep(answers)
  const requested = Number(params.get('step'))
  // Never let the URL skip past the first unanswered step.
  const step = Math.min(Number.isInteger(requested) && requested >= 1 ? requested - 1 : open, open, TOTAL_STEPS - 1)
  const complete = open === TOTAL_STEPS

  useEffect(() => {
    document.title = `Rfaheya Finder · Step ${step + 1} of ${TOTAL_STEPS}`
    window.scrollTo(0, 0)
    return () => {
      document.title = 'Rfaheya — Speak Your Scent'
    }
  }, [step])

  const goTo = (i: number) => setParams({ step: String(i + 1) })
  const finish = () => navigate(`/finder/result?${toSearch(answers)}`)

  const next = (updated: FinderAnswers) => {
    if (returnToReview && firstOpenStep(updated) === TOTAL_STEPS) {
      setReturnToReview(false)
      goTo(TOTAL_STEPS - 1)
      setReviewOpen(true)
      return
    }
    if (step < TOTAL_STEPS - 1) goTo(step + 1)
  }

  const choose = <K extends keyof FinderAnswers>(key: K, value: FinderAnswers[K]) => {
    const updated = { ...answers, [key]: value }
    setAnswers(updated)
    // brief pause so the selection is visible before moving on
    window.setTimeout(() => next(updated), 260)
  }

  const edit = (i: number) => {
    setReviewOpen(false)
    setReturnToReview(complete)
    goTo(i)
  }

  const chips = useMemo(
    () =>
      [
        { i: 0, icon: UserRound, text: label(genderOptions, answers.for) },
        { i: 1, icon: MapPin, text: label(occasionOptions, answers.occasion) },
        { i: 2, icon: Waves, text: label(styleOptions, answers.style) },
        { i: 3, icon: Flower2, text: answers.notes.length ? `${answers.notes.length} ${answers.notes.length === 1 ? 'note' : 'notes'}` : '' },
        { i: 4, icon: Sun, text: label(seasonOptions, answers.season) },
        { i: 5, icon: Waves, text: label(presenceOptions, answers.presence) },
        { i: 6, icon: Clock, text: label(longevityOptions, answers.longevity) },
      ].filter((c) => c.text && c.i !== step),
    [answers, step],
  )

  return (
    <div className="min-h-screen bg-sand text-ink lg:grid lg:grid-cols-[minmax(0,36%)_1fr]">
      {/* ---------- Left: a photo island for the question ---------- */}
      <aside className="relative hidden lg:block">
        <div className="sticky top-0 h-screen p-4">
          <div className="relative size-full overflow-hidden rounded-[36px] bg-[#1c120b]">
            <img key={step} src={panels[step]} alt="" className="size-full animate-fade-in object-cover" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#140c07]/55 via-transparent to-[#140c07]/70" />
            <Link to="/" aria-label="Rfaheya — home" className="absolute top-8 left-8 block h-[44px]">
              <img src={logo} alt="Rfaheya — Speak your scent" className="h-full w-auto invert" />
            </Link>
            <div className="absolute inset-x-6 bottom-6 rounded-[24px] bg-white/15 p-5 text-white backdrop-blur-xl">
              <p className="text-[11px] font-semibold tracking-[0.24em] text-[#f0c27a] uppercase">
                Step {step + 1} of {TOTAL_STEPS}
              </p>
              <p className="mt-1.5 font-serif text-[30px] leading-none">{STEPS[step]}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ---------- Right: question ---------- */}
      <main className="flex min-h-screen flex-col px-4 pt-4 pb-8 sm:px-8 lg:px-[4.5%] lg:pt-9 xl:pr-[4%]">
        <div className="mb-5 flex items-center justify-between lg:hidden">
          <Link to="/" aria-label="Rfaheya — home" className="block h-9">
            <img src={logo} alt="Rfaheya" className="h-full w-auto" />
          </Link>
          <Link to="/finder" aria-label="Exit the finder" className="rf-white grid size-10 place-items-center rounded-full shadow-[inset_0_0_0_1px_var(--color-line)]">
            <X className="size-5" strokeWidth={1.5} />
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-gold uppercase sm:text-[12px]">Rfaheya Finder</p>
          <div className="flex items-center gap-4">
            <p className="rf-white rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold tabular-nums shadow-[inset_0_0_0_1px_var(--color-line)]" aria-live="polite">
              {step + 1} <span className="text-muted">/ {TOTAL_STEPS}</span>
            </p>
            <Link to="/finder" aria-label="Exit the finder" className="rf-white hidden size-10 place-items-center rounded-full shadow-[inset_0_0_0_1px_var(--color-line)] lg:grid">
              <X className="size-5" strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        {/* progress */}
        <ol className="mt-4 grid grid-cols-7 gap-1.5 sm:gap-2" aria-label="Progress">
          {STEPS.map((name, i) => {
            const reachable = i <= open
            return (
              <li key={name}>
                <button
                  type="button"
                  disabled={!reachable}
                  onClick={() => goTo(i)}
                  aria-label={`Step ${i + 1}: ${name}`}
                  aria-current={i === step ? 'step' : undefined}
                  className="block w-full py-2 disabled:cursor-default"
                >
                  <span
                    className={`block h-[6px] rounded-full transition-colors duration-500 ${
                      i === step ? 'bg-olive shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-olive)_25%,transparent)]' : i < open ? 'bg-olive/60' : 'bg-line-strong/60'
                    }`}
                  />
                </button>
              </li>
            )
          })}
        </ol>

        {/* answered chips */}
        {chips.length > 0 && (
          <ul className="no-scrollbar relative -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Your answers">
            {chips.map(({ i, icon: Icon, text }) => (
              <li key={i} className="shrink-0">
                <button
                  type="button"
                  onClick={() => edit(i)}
                  className="rf-white inline-flex h-10 items-center gap-2 rounded-full pr-3.5 pl-1.5 text-[12.5px] font-semibold shadow-[inset_0_0_0_1px_var(--color-line)] transition hover:shadow-[inset_0_0_0_1px_var(--color-olive)]"
                >
                  <span className="grid size-7 place-items-center rounded-full bg-[#f3e3c9] text-gold">
                    <Icon className="size-3.5" strokeWidth={1.8} />
                  </span>
                  {text}
                  <Pencil className="size-3.5 text-muted" strokeWidth={1.5} />
                  <span className="sr-only">Edit {STEPS[i]}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <section key={step} className="mt-7 flex-1 animate-fade-in lg:mt-8" aria-labelledby="step-title">
          {step === 0 && (
            <StepHead step={0} title="Who are you shopping for?" subtitle="Choose to get the most relevant recommendations.">
              <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
                {genderOptions.map((o) => (
                  <TallCard key={o.value} option={o} selected={answers.for === o.value} onSelect={() => choose('for', o.value)} />
                ))}
              </div>
            </StepHead>
          )}

          {step === 1 && (
            <StepHead step={1} title="Where will you wear your fragrance most?" subtitle="Choose the moment that fits you best.">
              <OverlayGrid options={occasionOptions} selected={answers.occasion} onSelect={(v) => choose('occasion', v)} />
            </StepHead>
          )}

          {step === 2 && (
            <StepHead step={2} title="What kind of scent speaks to you?" subtitle="Choose the fragrance style that feels most like you.">
              <OverlayGrid options={styleOptions} selected={answers.style} onSelect={(v) => choose('style', v)} />
            </StepHead>
          )}

          {step === 3 && (
            <StepHead step={3} title="Which notes do you love?" subtitle={`Pick up to ${MAX_NOTES} notes you’re drawn to.`}>
              <NotesCounter count={answers.notes.length} />
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                {mainNotes.map((n) => (
                  <NoteCard key={n.value} option={n} answers={answers} setAnswers={setAnswers} />
                ))}
                {answers.notes
                  .filter((v) => moreNotes.some((m) => m.value === v))
                  .map((v) => (
                    <NoteCard key={v} option={moreNotes.find((m) => m.value === v)!} answers={answers} setAnswers={setAnswers} />
                  ))}
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setNotesOpen(true)}
                  className="rf-white inline-flex h-[54px] flex-1 items-center justify-center gap-3 rounded-full text-[12.5px] font-semibold tracking-[0.12em] uppercase shadow-[inset_0_0_0_1.5px_var(--color-line-strong)] transition hover:shadow-[inset_0_0_0_1.5px_var(--color-olive)]"
                >
                  Explore more notes
                  <ArrowRight className="size-4" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  disabled={answers.notes.length === 0}
                  onClick={() => next(answers)}
                  className="inline-flex h-[54px] flex-1 items-center justify-center gap-3 rounded-full bg-olive text-on-accent shadow-[0_14px_28px_-16px_rgba(160,100,20,0.9)] transition hover:bg-olive-hover text-[12.5px] font-semibold tracking-[0.12em] uppercase disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Continue
                  <ArrowRight className="size-4" strokeWidth={1.5} />
                </button>
              </div>
            </StepHead>
          )}

          {step === 4 && (
            <StepHead step={4} title="When will you wear it most?" subtitle="Choose the season that fits you best.">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-6 sm:gap-4">
                {seasonOptions.map((o, i) => (
                  <TopCard
                    key={o.value}
                    option={o}
                    className={i < 3 ? 'sm:col-span-2' : 'sm:col-span-3'}
                    selected={answers.season === o.value}
                    onSelect={() => choose('season', o.value)}
                  />
                ))}
              </div>
            </StepHead>
          )}

          {step === 5 && (
            <StepHead step={5} title="How noticeable should it be?" subtitle="Choose the presence that suits your style.">
              <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
                {presenceOptions.map((o) => (
                  <TopCard key={o.value} option={o} selected={answers.presence === o.value} onSelect={() => choose('presence', o.value)} />
                ))}
              </div>
            </StepHead>
          )}

          {step === 6 && (
            <StepHead step={6} title="How long do you want your fragrance to last?" subtitle="Choose the longevity that suits your needs.">
              <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
                {longevityOptions.map((o) => (
                  <TopCard
                    key={o.value}
                    option={{ ...o, description: o.description }}
                    kicker={o.hours}
                    selected={answers.longevity === o.value}
                    onSelect={() => {
                      const updated = { ...answers, longevity: o.value }
                      setAnswers(updated)
                      if (firstOpenStep(updated) === TOTAL_STEPS) window.setTimeout(() => setReviewOpen(true), 260)
                    }}
                  />
                ))}
              </div>
            </StepHead>
          )}
        </section>

        {/* footer nav */}
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
          {step > 0 && (
            <button
              type="button"
              onClick={() => goTo(step - 1)}
              className="rf-white inline-flex h-12 items-center justify-center gap-2 rounded-full px-5 text-[12px] font-semibold tracking-[0.12em] text-ink-soft uppercase shadow-[inset_0_0_0_1px_var(--color-line)] hover:text-ink sm:mr-auto"
            >
              <ArrowLeft className="size-4" strokeWidth={1.5} />
              Back
            </button>
          )}
          {step === TOTAL_STEPS - 1 && (
            <>
              <button
                type="button"
                onClick={() => setReviewOpen(true)}
                disabled={!complete}
                className="rf-white inline-flex h-[58px] flex-1 items-center justify-center gap-3 rounded-full text-[12.5px] font-semibold tracking-[0.12em] uppercase shadow-[inset_0_0_0_1.5px_var(--color-line-strong)] transition hover:shadow-[inset_0_0_0_1.5px_var(--color-olive)] disabled:opacity-40 sm:max-w-[22rem]"
              >
                <SlidersHorizontal className="size-5" strokeWidth={1.4} />
                Review your choices
              </button>
              <button
                type="button"
                onClick={finish}
                disabled={!complete}
                className="inline-flex h-[58px] flex-1 items-center justify-center gap-3 rounded-full bg-olive text-on-accent shadow-[0_14px_28px_-16px_rgba(160,100,20,0.9)] transition hover:bg-olive-hover text-[12.5px] font-semibold tracking-[0.12em] uppercase disabled:cursor-not-allowed disabled:opacity-40"
              >
                Find my perfect scent
                <ArrowRight className="size-5" strokeWidth={1.4} />
              </button>
            </>
          )}
        </div>
      </main>

      {notesOpen && <MoreNotesModal answers={answers} setAnswers={setAnswers} onClose={() => setNotesOpen(false)} />}
      {reviewOpen && <ReviewModal answers={answers} onEdit={edit} onClose={() => setReviewOpen(false)} onFinish={finish} />}
    </div>
  )
}

function StepHead({ step, title, subtitle, children }: { step: number; title: string; subtitle: string; children: ReactNode }) {
  return (
    <>
      <p className="text-[11px] font-semibold tracking-[0.24em] text-gold uppercase">Question {String(step + 1).padStart(2, '0')}</p>
      <h1 id="step-title" className="mt-2.5 max-w-[34rem] font-serif text-[38px] leading-[0.98] sm:text-[54px] xl:max-w-[38rem] xl:text-[64px]">
        {title}
      </h1>
      <p className="mt-3 text-[15px] text-ink-soft sm:text-[17px]">{subtitle}</p>
      <div className="mt-6 lg:mt-7">{children}</div>
    </>
  )
}

function Radio({ checked, dark = false }: { checked: boolean; dark?: boolean }) {
  return (
    <span
      aria-hidden
      className={`grid size-[30px] shrink-0 place-items-center rounded-full border-2 transition ${
        checked ? 'border-olive bg-olive text-on-accent' : dark ? 'border-white/90' : 'border-white/90 bg-black/10'
      }`}
    >
      {checked && <Check className="size-4" strokeWidth={2.5} />}
    </span>
  )
}

function TallCard<V extends string>({ option, selected, onSelect }: { option: Option<V>; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`group relative aspect-[287/452] overflow-hidden rounded-[22px] text-left ring-offset-[3px] ring-offset-sand transition duration-300 sm:rounded-[28px] ${
        selected ? 'ring-[2.5px] ring-olive' : 'hover:-translate-y-1 hover:shadow-[0_24px_40px_-24px_rgba(60,40,10,0.6)]'
      }`}
    >
      <img src={option.image} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <span className="absolute inset-x-1.5 bottom-1.5 flex items-center justify-between gap-1 rounded-[16px] bg-white/85 py-2 pr-1.5 pl-3 text-[#14110d] backdrop-blur-xl sm:inset-x-3 sm:bottom-3 sm:rounded-[20px] sm:py-3 sm:pr-2.5 sm:pl-5">
        <span className="font-serif text-[18px] leading-none sm:text-[28px]">{option.label}</span>
        <span className={`grid size-7 shrink-0 place-items-center rounded-full transition sm:size-9 ${selected ? 'bg-olive text-on-accent' : 'bg-[#14110d] text-white group-hover:bg-olive'}`}>
          {selected ? <Check className="size-4" strokeWidth={2.4} /> : <ArrowRight className="size-4" strokeWidth={1.6} />}
        </span>
      </span>
    </button>
  )
}

function OverlayGrid<V extends string>({ options, selected, onSelect }: { options: Option<V>[]; selected?: V; onSelect: (v: V) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-6 sm:gap-4">
      {options.map((o, i) => {
        const isSel = selected === o.value
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onSelect(o.value)}
            aria-pressed={isSel}
            className={`group relative overflow-hidden rounded-[22px] text-left ring-offset-[3px] ring-offset-sand transition duration-300 sm:rounded-[26px] ${
              i < 3 ? 'aspect-[290/275] sm:col-span-2' : 'sm:col-span-3 sm:aspect-[440/252]'
            } ${i === 3 ? 'aspect-[290/275]' : ''} ${i === 4 ? 'col-span-2 aspect-[440/220]' : ''} ${isSel ? 'ring-[2.5px] ring-olive' : 'hover:-translate-y-1 hover:shadow-[0_24px_40px_-24px_rgba(60,40,10,0.6)]'}`}
          >
            <img src={o.image} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <span className="absolute inset-x-1.5 bottom-1.5 flex items-center justify-between gap-2 rounded-[16px] bg-white/85 py-2 pr-1.5 pl-3 text-[#14110d] backdrop-blur-xl sm:inset-x-2.5 sm:bottom-2.5 sm:rounded-[20px] sm:py-2.5 sm:pr-2 sm:pl-4">
              <span className="min-w-0">
                <span className="block font-serif text-[17px] leading-tight sm:text-[23px]">{o.label}</span>
                {o.description && <span className="mt-0.5 hidden truncate text-[12.5px] text-[#5b5145] sm:block">{o.description}</span>}
              </span>
              <span className={`grid size-7 shrink-0 place-items-center rounded-full transition sm:size-9 ${isSel ? 'bg-olive text-on-accent' : 'bg-[#14110d] text-white group-hover:bg-olive'}`}>
                {isSel ? <Check className="size-4" strokeWidth={2.4} /> : <ArrowRight className="size-4" strokeWidth={1.6} />}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

function TopCard<V extends string>({
  option,
  selected,
  onSelect,
  className = '',
  kicker,
}: {
  option: Option<V>
  selected: boolean
  onSelect: () => void
  className?: string
  kicker?: string
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`rf-white group flex flex-col overflow-hidden rounded-[22px] p-1.5 text-left transition duration-300 sm:rounded-[26px] ${className} ${
        selected ? 'shadow-[inset_0_0_0_2.5px_var(--color-olive)]' : 'shadow-[inset_0_0_0_1px_var(--color-line)] hover:-translate-y-1 hover:shadow-[0_24px_40px_-26px_rgba(60,40,10,0.55)]'
      }`}
    >
      <span className="relative block aspect-[290/178] w-full overflow-hidden rounded-[17px] sm:rounded-[20px]">
        <img src={option.image} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <span className="absolute top-3 right-3">
          <Radio checked={selected} />
        </span>
      </span>
      <span className="flex-1 px-3 pt-3 pb-3 sm:px-4 sm:pb-4">
        <span className="block font-serif text-[19px] leading-tight sm:text-[24px]">{option.label}</span>
        {kicker && <span className="mt-1 inline-block rounded-full bg-[#f3e3c9] px-2.5 py-0.5 text-[12.5px] font-semibold text-gold">{kicker}</span>}
        {option.description && <span className="mt-1.5 block text-[13.5px] leading-snug text-muted sm:text-[15px]">{option.description}</span>}
      </span>
    </button>
  )
}

function NotesCounter({ count }: { count: number }) {
  const left = MAX_NOTES - count
  return (
    <div className="flex items-center gap-2" aria-live="polite">
      {Array.from({ length: MAX_NOTES }, (_, i) => (
        <span
          key={i}
          className={`grid size-[32px] place-items-center rounded-full transition duration-300 ${
            i < count ? 'scale-100 bg-olive text-on-accent' : 'rf-white shadow-[inset_0_0_0_1.5px_var(--color-line-strong)]'
          }`}
        >
          {i < count && <Check className="size-4" strokeWidth={2.5} />}
        </span>
      ))}
      <span className="ml-2 text-[14.5px] font-medium text-ink-soft">
        {left === 0 ? 'All set' : `${left} ${left === 1 ? 'choice' : 'choices'} remaining`}
      </span>
    </div>
  )
}

function toggleNote(answers: FinderAnswers, value: string): FinderAnswers {
  const has = answers.notes.includes(value)
  if (has) return { ...answers, notes: answers.notes.filter((n) => n !== value) }
  if (answers.notes.length >= MAX_NOTES) return answers
  return { ...answers, notes: [...answers.notes, value] }
}

function NoteCard({
  option,
  answers,
  setAnswers,
}: {
  option: (typeof allNotes)[number]
  answers: FinderAnswers
  setAnswers: (a: FinderAnswers) => void
}) {
  const checked = answers.notes.includes(option.value)
  const full = !checked && answers.notes.length >= MAX_NOTES
  return (
    <button
      type="button"
      onClick={() => setAnswers(toggleNote(answers, option.value))}
      aria-pressed={checked}
      disabled={full}
      className={`rf-white group overflow-hidden rounded-[20px] p-1.5 text-left transition duration-300 disabled:cursor-not-allowed disabled:opacity-45 ${
        checked ? 'shadow-[inset_0_0_0_2.5px_var(--color-olive)]' : 'shadow-[inset_0_0_0_1px_var(--color-line)] hover:shadow-[inset_0_0_0_1px_var(--color-olive)]'
      }`}
    >
      <span className="block aspect-[265/107] overflow-hidden rounded-[15px]">
        <img src={option.image} alt="" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </span>
      <span className="flex items-center justify-between px-2.5 pt-2.5 pb-1.5">
        <span className="font-serif text-[18px] leading-none sm:text-[20px]">{option.label}</span>
        <span
          aria-hidden
          className={`grid size-[26px] place-items-center rounded-full transition ${checked ? 'bg-olive text-on-accent' : 'shadow-[inset_0_0_0_1.5px_var(--color-line-strong)]'}`}
        >
          {checked && <Check className="size-3.5" strokeWidth={2.5} />}
        </span>
      </span>
    </button>
  )
}

function MoreNotesModal({
  answers,
  setAnswers,
  onClose,
}: {
  answers: FinderAnswers
  setAnswers: (a: FinderAnswers) => void
  onClose: () => void
}) {
  const swipe = useSwipeClose<HTMLDivElement>(onClose)
  return (
    <Overlay onClose={onClose} label="Discover more scent notes">
      <div ref={swipe} className="absolute inset-x-0 bottom-0 max-h-[94vh] overflow-y-auto rounded-t-[28px] bg-sand p-5 shadow-2xl [animation:slide-up_.55s_cubic-bezier(.16,1,.3,1)] sm:inset-auto sm:top-1/2 sm:left-1/2 sm:w-[min(58rem,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[32px] sm:p-10 sm:[animation:pop-in_.5s_cubic-bezier(.16,1,.3,1)]">
        <span aria-hidden className="mx-auto -mt-2 mb-3 block h-[5px] w-11 rounded-full bg-line-strong sm:hidden" />
        <img
          src={moreNotes[0].image}
          alt=""
          aria-hidden
          className="pointer-events-none absolute top-0 right-0 hidden h-[270px] w-[52%] rounded-tr-[32px] object-cover [mask-image:linear-gradient(to_left,black_40%,transparent),linear-gradient(to_top,transparent,black_40%)] [mask-composite:intersect] sm:block"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rf-white absolute top-4 right-4 z-10 grid size-11 place-items-center rounded-full shadow-sm sm:top-5 sm:right-5 sm:size-12"
        >
          <X className="size-6" strokeWidth={1.3} />
        </button>
        <div className="relative">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-gold uppercase">Explore more notes</p>
          <h2 className="mt-3 font-serif text-[36px] leading-[1.02] sm:text-[52px]">
            Discover more
            <br />
            scent notes
          </h2>
          <p className="mt-3 text-[15px] text-muted sm:text-[17px]">Choose from more notes to personalize your results.</p>
          <div className="mt-5">
            <NotesCounter count={answers.notes.length} />
          </div>
        </div>
        <div className="mt-5 border-t border-line pt-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
            {moreNotes.map((n) => (
              <NoteCard key={n.value} option={n} answers={answers} setAnswers={setAnswers} />
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-7 inline-flex h-[58px] w-full items-center justify-center gap-3 rounded-full bg-olive text-on-accent shadow-[0_14px_28px_-16px_rgba(160,100,20,0.9)] transition hover:bg-olive-hover text-[12.5px] font-semibold tracking-[0.14em] uppercase"
        >
          Done
          <ArrowRight className="size-5" strokeWidth={1.3} />
        </button>
      </div>
    </Overlay>
  )
}

function ReviewModal({
  answers,
  onEdit,
  onClose,
  onFinish,
}: {
  answers: FinderAnswers
  onEdit: (step: number) => void
  onClose: () => void
  onFinish: () => void
}) {
  const swipe = useSwipeClose<HTMLDivElement>(onClose)
  const noteNames = answers.notes.map((n) => allNotes.find((o) => o.value === n)?.label).filter(Boolean)
  const firstNote = allNotes.find((o) => o.value === answers.notes[0])
  const longevity = longevityOptions.find((o) => o.value === answers.longevity)
  const rows = [
    { k: 'For', v: label(genderOptions, answers.for), img: genderOptions.find((o) => o.value === answers.for)?.image },
    { k: 'Occasion', v: label(occasionOptions, answers.occasion), img: occasionOptions.find((o) => o.value === answers.occasion)?.image },
    { k: 'Scent style', v: label(styleOptions, answers.style), img: styleOptions.find((o) => o.value === answers.style)?.image },
    { k: 'Notes', v: noteNames.join(' · '), img: firstNote?.image },
    { k: 'Season', v: label(seasonOptions, answers.season), img: seasonOptions.find((o) => o.value === answers.season)?.image },
    { k: 'Presence', v: label(presenceOptions, answers.presence), img: presenceOptions.find((o) => o.value === answers.presence)?.image },
    { k: 'Longevity', v: longevity ? `${longevity.label} · ${longevity.hours}` : '', img: longevity?.image },
  ]
  return (
    <Overlay onClose={onClose} label="Review your choices">
      <div ref={swipe} className="absolute inset-x-0 bottom-0 max-h-[94vh] overflow-y-auto rounded-t-[28px] bg-sand px-4 pt-5 pb-5 shadow-2xl [animation:slide-up_.55s_cubic-bezier(.16,1,.3,1)] sm:inset-auto sm:top-1/2 sm:left-1/2 sm:w-[min(49rem,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[32px] sm:px-8 sm:pt-10 sm:pb-8 sm:[animation:pop-in_.5s_cubic-bezier(.16,1,.3,1)]">
        <span aria-hidden className="mx-auto -mt-1 mb-3 block h-[5px] w-11 rounded-full bg-line-strong sm:hidden" />
        <button type="button" onClick={onClose} aria-label="Close" className="rf-white absolute top-4 right-4 grid size-11 place-items-center rounded-full shadow-sm sm:top-6 sm:right-6">
          <X className="size-6" strokeWidth={1.3} />
        </button>
        <div className="px-2 sm:px-3">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-gold uppercase">Rfaheya Finder</p>
          <h2 className="mt-2 font-serif text-[36px] leading-[1.02] sm:text-[50px]">
            Review your <span className="text-gold italic">choices.</span>
          </h2>
          <p className="mt-2 max-w-xl text-[14.5px] text-ink-soft sm:text-[16px]">
            Here’s what you selected. You can edit any preference before finding your perfect scent.
          </p>
        </div>
        <ul className="mt-5 space-y-2">
          {rows.map((r, i) => {
            const Icon = stepIcons[i]
            return (
              <li key={r.k} className="rf-white flex items-center gap-3 overflow-hidden rounded-[20px] p-1.5 shadow-[inset_0_0_0_1px_var(--color-line)]">
                {r.img && <img src={r.img} alt="" className="h-[56px] w-[72px] shrink-0 rounded-[15px] object-cover sm:w-[120px]" />}
                <span className="hidden size-9 shrink-0 place-items-center rounded-full bg-[#f3e3c9] text-gold sm:grid">
                  <Icon className="size-4" strokeWidth={1.8} />
                </span>
                <div className="min-w-0 flex-1 py-2">
                  <p className="text-[10.5px] font-semibold tracking-[0.16em] text-muted uppercase sm:text-[11.5px]">{r.k}</p>
                  <p className="truncate font-serif text-[18px] leading-tight sm:text-[22px]">{r.v}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onEdit(i)}
                  className="mr-1 flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-chip px-3.5 text-[12.5px] font-semibold transition hover:bg-olive hover:text-on-accent"
                >
                  Edit <ArrowRight className="size-3.5" strokeWidth={1.6} />
                  <span className="sr-only">{r.k}</span>
                </button>
              </li>
            )
          })}
        </ul>
        <button
          type="button"
          onClick={onFinish}
          className="mt-5 inline-flex h-[60px] w-full items-center justify-center gap-3 rounded-full bg-olive text-on-accent shadow-[0_14px_28px_-16px_rgba(160,100,20,0.9)] transition hover:bg-olive-hover text-[13px] font-semibold tracking-[0.14em] uppercase sm:h-[64px]"
        >
          Find my perfect scent
          <ArrowRight className="size-5" strokeWidth={1.3} />
        </button>
      </div>
    </Overlay>
  )
}
