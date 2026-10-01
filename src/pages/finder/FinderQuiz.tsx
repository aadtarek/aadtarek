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

const stepIcons: LucideIcon[] = [UserRound, MapPin, Waves, Flower2, Sun, Waves, Clock]

export function FinderQuiz() {
  const [answers, setAnswers] = usePersistentState<FinderAnswers>('rfaheya.finder', emptyAnswers)
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
    <div className="min-h-screen bg-[#f2e9df] text-ink lg:grid lg:grid-cols-[minmax(0,36.5%)_1fr]">
      {/* ---------- Left still life ---------- */}
      <aside className="relative hidden lg:block">
        <div className="sticky top-0 h-screen overflow-hidden">
          <img key={step} src={panels[step]} alt="" className="size-full animate-fade-in object-cover object-[30%_center]" />
          <div aria-hidden className="absolute inset-y-0 right-0 w-24 bg-gradient-to-r from-transparent to-[#f2e9df]" />
          <Link to="/" aria-label="Rfaheya — home" className="absolute top-9 left-[16%] block h-[50px]">
            <img src={logo} alt="Rfaheya — Speak your scent" className="h-full w-auto invert" />
          </Link>
        </div>
      </aside>

      {/* ---------- Right: question ---------- */}
      <main className="flex min-h-screen flex-col px-4 pt-5 pb-8 sm:px-8 lg:px-[4.5%] lg:pt-9 xl:pr-[4%]">
        <div className="mb-5 flex items-center justify-between lg:hidden">
          <Link to="/" aria-label="Rfaheya — home" className="block h-9">
            <img src={logo} alt="Rfaheya" className="h-full w-auto" />
          </Link>
          <Link to="/finder" aria-label="Exit the finder" className="grid size-10 place-items-center rounded-full hover:bg-latte">
            <X className="size-5" strokeWidth={1.5} />
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[12.5px] tracking-[0.2em] uppercase sm:text-[14px]">Rfaheya Finder</p>
          <div className="flex items-center gap-4">
            <p className="text-[13px] tracking-[0.12em] text-muted uppercase sm:text-[15px]" aria-live="polite">
              {step + 1} of {TOTAL_STEPS}
            </p>
            <Link to="/finder" aria-label="Exit the finder" className="hidden size-10 place-items-center rounded-full hover:bg-latte lg:grid">
              <X className="size-5" strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        {/* progress */}
        <ol className="mt-4 grid grid-cols-7 gap-2 sm:gap-[10px]" aria-label="Progress">
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
                    className={`block h-[5px] rounded-full transition-colors ${
                      i < step || (i <= open && i !== step && i < open)
                        ? 'bg-espresso'
                        : i === step
                          ? 'bg-gradient-to-r from-espresso to-mocha'
                          : 'bg-[#e0d3c4]'
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
                  className="inline-flex h-10 items-center gap-2.5 rounded-full bg-latte/80 px-4 text-[12.5px] tracking-[0.08em] uppercase transition hover:bg-latte"
                >
                  <Icon className="size-4" strokeWidth={1.5} />
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
                  className="inline-flex h-[54px] flex-1 items-center justify-center gap-3 rounded-full border border-line-strong text-[13px] tracking-[0.14em] uppercase transition hover:bg-latte"
                >
                  Explore more notes
                  <ArrowRight className="size-4" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  disabled={answers.notes.length === 0}
                  onClick={() => next(answers)}
                  className="inline-flex h-[54px] flex-1 items-center justify-center gap-3 rounded-full bg-espresso text-[13px] tracking-[0.14em] text-cream uppercase transition hover:bg-espresso-hover disabled:cursor-not-allowed disabled:opacity-40"
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
              className="inline-flex h-12 items-center justify-center gap-2 px-2 text-[13px] tracking-[0.14em] text-ink-soft uppercase hover:text-ink sm:mr-auto"
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
                className="inline-flex h-[64px] flex-1 items-center justify-center gap-4 rounded-full border border-line-strong text-[14px] tracking-[0.14em] uppercase transition hover:bg-latte disabled:opacity-40 sm:max-w-[22rem]"
              >
                <SlidersHorizontal className="size-5" strokeWidth={1.4} />
                Review your choices
              </button>
              <button
                type="button"
                onClick={finish}
                disabled={!complete}
                className="inline-flex h-[64px] flex-1 items-center justify-center gap-4 rounded-full bg-espresso text-[14px] tracking-[0.14em] text-cream uppercase transition hover:bg-espresso-hover disabled:cursor-not-allowed disabled:opacity-40"
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
      <p className="text-[13px] tracking-[0.18em] uppercase">Step {step + 1}</p>
      <h1 id="step-title" className="mt-2 max-w-[32rem] font-serif text-[36px] leading-[1.02] sm:text-[52px] xl:max-w-[36rem] xl:text-[66px]">
        {title}
      </h1>
      <p className="mt-3 text-[15.5px] text-muted sm:text-[18px]">{subtitle}</p>
      <div className="mt-6 lg:mt-7">{children}</div>
    </>
  )
}

function Radio({ checked, dark = false }: { checked: boolean; dark?: boolean }) {
  return (
    <span
      aria-hidden
      className={`grid size-[30px] shrink-0 place-items-center rounded-full border-2 transition ${
        checked ? 'border-espresso bg-espresso text-cream' : dark ? 'border-white/90' : 'border-white/90 bg-black/10'
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
      className={`group relative aspect-[287/452] overflow-hidden rounded-lg text-left ring-offset-2 ring-offset-[#f2e9df] transition ${
        selected ? 'ring-3 ring-espresso' : 'hover:-translate-y-0.5 hover:shadow-xl'
      }`}
    >
      <img src={option.image} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <span className="absolute inset-0 bg-gradient-to-t from-[#140c07]/90 via-[#140c07]/10 to-transparent" />
      <span className="absolute inset-x-0 bottom-[8%] flex flex-col items-center text-cream">
        <span className="font-serif text-[20px] uppercase sm:text-[30px]">{option.label}</span>
        <span className="mt-3 block h-px w-8 bg-cream/60" />
      </span>
      {selected && (
        <span className="absolute top-3 right-3">
          <Radio checked />
        </span>
      )}
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
            className={`group relative overflow-hidden rounded-lg text-center ring-offset-2 ring-offset-[#f2e9df] transition ${
              i < 3 ? 'aspect-[290/275] sm:col-span-2' : 'sm:col-span-3 sm:aspect-[440/252]'
            } ${i === 3 ? 'aspect-[290/275]' : ''} ${i === 4 ? 'col-span-2 aspect-[440/220]' : ''} ${isSel ? 'ring-3 ring-espresso' : 'hover:shadow-xl'}`}
          >
            <img src={o.image} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <span className="absolute inset-0 bg-gradient-to-t from-[#140c07]/90 via-[#140c07]/25 to-transparent" />
            <span className="absolute inset-x-0 bottom-[9%] flex flex-col items-center px-2 text-cream">
              <span className="font-serif text-[17px] leading-tight uppercase sm:text-[24px]">{o.label}</span>
              {o.description && <span className="mt-1 hidden text-[13px] text-cream/85 sm:block sm:text-[15px]">{o.description}</span>}
              <span className="mt-3 grid size-9 place-items-center rounded-full border border-cream/80 transition group-hover:bg-cream group-hover:text-ink">
                {isSel ? <Check className="size-4" strokeWidth={2} /> : <ArrowRight className="size-4" strokeWidth={1.5} />}
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
      className={`group flex flex-col overflow-hidden rounded-lg border bg-[#f4ece2] text-left transition ${className} ${
        selected ? 'border-espresso ring-2 ring-espresso' : 'border-[#e3d6c7] hover:shadow-lg'
      }`}
    >
      <span className="relative block aspect-[290/178] w-full overflow-hidden">
        <img src={option.image} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <span className="absolute top-3 right-3">
          <Radio checked={selected} />
        </span>
      </span>
      <span className="flex-1 px-4 pt-3.5 pb-4 sm:px-5">
        <span className="block font-serif text-[18px] uppercase sm:text-[22px]">{option.label}</span>
        {kicker && <span className="mt-1 block text-[16px] text-mocha sm:text-[18px]">{kicker}</span>}
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
          className={`grid size-[34px] place-items-center rounded-full border-2 ${
            i < count ? 'border-espresso bg-espresso text-cream' : 'border-[#ddd0c1]'
          }`}
        >
          {i < count && <Check className="size-4" strokeWidth={2.5} />}
        </span>
      ))}
      <span className="ml-3 text-[16px] text-muted">
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
      className={`group overflow-hidden rounded-md border text-left transition disabled:cursor-not-allowed disabled:opacity-45 ${
        checked ? 'border-espresso ring-1 ring-espresso' : 'border-[#e3d6c7] hover:shadow-md'
      }`}
    >
      <span className="block aspect-[265/107] overflow-hidden">
        <img src={option.image} alt="" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </span>
      <span className="flex items-center justify-between bg-[#f6efe6] px-4 py-3.5">
        <span className="text-[14.5px] tracking-[0.1em] uppercase">{option.label}</span>
        <span
          aria-hidden
          className={`grid size-[24px] place-items-center rounded-full border-2 ${checked ? 'border-espresso bg-espresso text-cream' : 'border-ink-soft/70'}`}
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
  return (
    <Overlay onClose={onClose} label="Discover more scent notes">
      <div className="absolute inset-x-0 bottom-0 max-h-[94vh] overflow-y-auto rounded-t-2xl bg-[#f6eee5] p-5 shadow-2xl [animation:pop-in_.25s_ease-out] sm:inset-auto sm:top-1/2 sm:left-1/2 sm:w-[min(58rem,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[22px] sm:p-12">
        <img
          src={moreNotes[0].image}
          alt=""
          aria-hidden
          className="pointer-events-none absolute top-0 right-0 hidden h-[270px] w-[52%] rounded-tr-[22px] object-cover [mask-image:linear-gradient(to_left,black_40%,transparent),linear-gradient(to_top,transparent,black_40%)] [mask-composite:intersect] sm:block"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 grid size-12 place-items-center rounded-full bg-[#f6eee5] shadow-sm hover:bg-white sm:top-5 sm:right-5 sm:size-[60px]"
        >
          <X className="size-6" strokeWidth={1.3} />
        </button>
        <div className="relative">
          <p className="text-[12px] tracking-[0.28em] text-ink-soft uppercase sm:text-[14px]">Explore more notes</p>
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
        <div className="mt-5 border-t border-[#e0d3c4] pt-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
            {moreNotes.map((n) => (
              <NoteCard key={n.value} option={n} answers={answers} setAnswers={setAnswers} />
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-7 inline-flex h-[64px] w-full items-center justify-center gap-4 rounded-full bg-latte text-[14px] tracking-[0.2em] uppercase transition hover:bg-[#e3d3c0]"
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
      <div className="absolute inset-x-0 bottom-0 max-h-[94vh] overflow-y-auto rounded-t-2xl bg-[#f6eee5] px-4 pt-6 pb-5 shadow-2xl [animation:pop-in_.25s_ease-out] sm:inset-auto sm:top-1/2 sm:left-1/2 sm:w-[min(49rem,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[18px] sm:px-8 sm:pt-10 sm:pb-8">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute top-4 right-4 grid size-11 place-items-center rounded-full hover:bg-latte sm:top-6 sm:right-6">
          <X className="size-6" strokeWidth={1.3} />
        </button>
        <div className="px-2 sm:px-3">
          <p className="text-[12px] tracking-[0.2em] uppercase sm:text-[14px]">Rfaheya Finder</p>
          <h2 className="mt-2 font-serif text-[36px] leading-[1.05] sm:text-[52px]">Review Your Choices</h2>
          <p className="mt-2 max-w-xl text-[15px] text-muted sm:text-[17.5px]">
            Here’s what you selected. You can edit any preference before finding your perfect scent.
          </p>
        </div>
        <ul className="mt-5 space-y-2">
          {rows.map((r, i) => {
            const Icon = stepIcons[i]
            return (
              <li key={r.k} className="flex items-center overflow-hidden rounded-md bg-[#f9f4ee] shadow-[0_0_0_1px_rgba(74,42,23,0.05)]">
                {r.img && <img src={r.img} alt="" className="h-[64px] w-[90px] shrink-0 object-cover sm:w-[165px]" />}
                <Icon className="mx-3 size-5 shrink-0 sm:mx-6" strokeWidth={1.4} />
                <div className="min-w-0 flex-1 py-2">
                  <p className="text-[11px] tracking-[0.16em] text-muted uppercase sm:text-[12.5px]">{r.k}</p>
                  <p className="truncate font-serif text-[17px] sm:text-[22px]">{r.v}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onEdit(i)}
                  className="flex shrink-0 items-center gap-2 px-3 py-3 text-[14px] hover:text-mocha sm:px-5 sm:text-[15.5px]"
                >
                  Edit <ArrowRight className="size-4" strokeWidth={1.4} />
                  <span className="sr-only">{r.k}</span>
                </button>
              </li>
            )
          })}
        </ul>
        <button
          type="button"
          onClick={onFinish}
          className="mt-5 inline-flex h-[64px] w-full items-center justify-center gap-4 rounded-full bg-espresso text-[14px] tracking-[0.18em] text-cream uppercase transition hover:bg-espresso-hover sm:h-[74px] sm:text-[16px]"
        >
          Find my perfect scent
          <ArrowRight className="size-5" strokeWidth={1.3} />
        </button>
      </div>
    </Overlay>
  )
}
