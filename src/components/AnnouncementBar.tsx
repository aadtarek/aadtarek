import { Badge, ChevronLeft, ChevronRight, FlaskConical, Truck, type LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { HOME } from '../config'

/** Icon for a message, picked from its wording. */
function iconFor(text: string): LucideIcon {
  if (/ship|deliver/i.test(text)) return Truck
  if (/\b\d+\s*ml\b|sample|try/i.test(text)) return FlaskConical
  return Badge
}


export function AnnouncementBar() {
  const messages = HOME.announcements.map((text) => ({ icon: iconFor(text), text }))
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const step = (dir: number) => setIndex((i) => (i + dir + messages.length) % messages.length)

  // Auto-rotate on small screens where only one message is visible.
  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setIndex((i) => (i + 1) % messages.length), 5000)
    return () => clearInterval(t)
  }, [paused, messages.length])

  // On desktop all three are shown; the arrows rotate their order.
  const ordered = messages.map((_, i) => messages[(index + i) % messages.length])

  return (
    <div
      className="bg-olive text-[10px] font-medium tracking-[0.05em] text-cream uppercase"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex h-9 items-center px-3 sm:px-8">
        <button
          type="button"
          aria-label="Previous announcement"
          onClick={() => step(-1)}
          className="-m-2 p-2 opacity-90 transition hover:opacity-100"
        >
          <ChevronLeft className="size-4" strokeWidth={1.75} />
        </button>

        {/* mobile: single rotating message */}
        <div className="flex min-w-0 flex-1 justify-center lg:hidden" aria-live="polite">
          <Message key={index} {...messages[index]} animate />
        </div>

        {/* desktop: three columns with dividers */}
        <div className="hidden flex-1 items-center lg:flex">
          {ordered.map((m, i) => (
            <div key={m.text} className="flex flex-1 items-center">
              {i > 0 && <span className="h-3.5 w-px bg-cream/60" aria-hidden />}
              <div className="flex flex-1 justify-center">
                <Message {...m} />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          aria-label="Next announcement"
          onClick={() => step(1)}
          className="-m-2 p-2 opacity-90 transition hover:opacity-100"
        >
          <ChevronRight className="size-4" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  )
}

function Message({ icon: Icon, text, animate = false }: { icon: LucideIcon; text: string; animate?: boolean }) {
  return (
    <p className={`flex items-center gap-2.5 truncate ${animate ? 'animate-fade-in' : ''}`}>
      <Icon className="size-4 shrink-0" strokeWidth={1.5} />
      <span className="truncate">{text}</span>
    </p>
  )
}
