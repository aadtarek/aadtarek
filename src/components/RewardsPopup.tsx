import { Check, Copy, Gift, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { wp } from '../api/wp'
import { LOYALTY } from '../config'
import { readStorage, usePersistentState, writeStorage } from '../lib/storage'
import { useCart } from '../store/cart'
import { useRewards } from '../store/rewards'

const INVITE_KEY = 'rfaheya.inviteShownAt'
const INVITE_EVERY = 3 * 24 * 60 * 60 * 1000

/**
 * The welcome discount pop-ups: guests are invited to sign in for it (once every few
 * days, after a little browsing); signed-in customers see it unlocked once, with the code.
 */
export function RewardsPopup() {
  const { me, ready } = useRewards()
  const cart = useCart()
  const { pathname } = useLocation()
  const [celebrated, setCelebrated] = usePersistentState<string[]>('rfaheya.welcomeShown', [])
  const [open, setOpen] = useState<'invite' | 'welcome' | null>(null)
  const quiet = /^\/(checkout|account)/.test(pathname)

  // Signed in with an unused welcome discount: show it once.
  const code = me.loggedIn && me.welcome && !me.welcome.used ? me.welcome.code : null
  useEffect(() => {
    if (!code || celebrated.includes(code)) return
    const id = window.setTimeout(() => setOpen('welcome'), 900)
    return () => window.clearTimeout(id)
  }, [code, celebrated])

  // Guests: after some browsing (time or scroll), at most once every three days.
  useEffect(() => {
    if (!ready || me.loggedIn || !LOYALTY.welcome || quiet) return
    if (Date.now() - readStorage(INVITE_KEY, 0) < INVITE_EVERY) return
    const show = () => {
      writeStorage(INVITE_KEY, Date.now())
      setOpen((o) => o ?? 'invite')
      cleanup()
    }
    const onScroll = () => {
      if (window.scrollY > document.documentElement.scrollHeight * 0.45 - window.innerHeight) show()
    }
    const id = window.setTimeout(show, 15000)
    window.addEventListener('scroll', onScroll, { passive: true })
    const cleanup = () => {
      window.clearTimeout(id)
      window.removeEventListener('scroll', onScroll)
    }
    return cleanup
  }, [ready, me.loggedIn, quiet])

  if (!open) return null
  const close = () => {
    if (open === 'welcome' && code) setCelebrated((c) => [...c, code])
    setOpen(null)
  }
  const percent = me.welcome?.percent ?? LOYALTY.welcomePercent

  return createPortal(
    <div className="fixed inset-0 z-[70] grid place-items-center p-4" role="dialog" aria-modal="true" aria-labelledby="rf-reward-title">
      <div className="absolute inset-0 animate-fade-in bg-ink/50 backdrop-blur-[2px]" onClick={close} />
      <div className="relative w-full max-w-[430px] overflow-hidden rounded-[28px] bg-cream text-center shadow-2xl [animation:rf-reward-in_.75s_cubic-bezier(.34,1.45,.64,1)]">
        <button type="button" onClick={close} aria-label="Close" className="absolute top-3 right-3 z-10 grid size-9 place-items-center rounded-full text-ink hover:bg-chip">
          <X className="size-5" strokeWidth={1.5} />
        </button>

        <div className="relative overflow-hidden bg-gradient-to-b from-latte to-cream px-6 pt-10 pb-4">
          {[
            'top-6 left-10 size-3 [animation-delay:.1s]',
            'top-14 right-12 size-4 [animation-delay:.5s]',
            'top-24 left-20 size-2.5 [animation-delay:.9s]',
            'top-8 right-28 size-2 [animation-delay:1.3s]',
            'top-28 right-16 size-3 [animation-delay:.3s]',
          ].map((c) => (
            <Sparkles key={c} aria-hidden className={`absolute text-gold opacity-0 [animation:rf-twinkle_2.6s_ease-in-out_infinite] motion-reduce:hidden ${c}`} strokeWidth={1.5} />
          ))}
          <span className="relative mx-auto grid size-[86px] place-items-center rounded-full bg-cream shadow-[0_10px_30px_-12px_rgba(138,106,51,0.6)] ring-1 ring-gold/30 [animation:rf-float_3.2s_ease-in-out_infinite]">
            <span aria-hidden className="absolute inset-0 rounded-full ring-2 ring-gold/40 [animation:rf-ring_2.4s_cubic-bezier(.16,1,.3,1)_infinite]" />
            <Gift className="size-9 text-olive" strokeWidth={1.3} />
          </span>
          <p className="mt-5 font-serif text-[64px] leading-none text-ink">
            {percent}
            <span className="text-gold italic">%</span>
            <span className="ml-2 align-middle font-sans text-[13px] font-semibold tracking-[0.3em] text-ink-soft uppercase">off</span>
          </p>
        </div>

        <div className="px-7 pt-2 pb-7">
          {open === 'invite' ? (
            <>
              <h2 id="rf-reward-title" className="font-serif text-[30px] leading-tight">A little welcome gift.</h2>
              <p className="mx-auto mt-2 max-w-[300px] text-[14.5px] leading-relaxed text-ink-soft">
                Sign in or create your account and get {percent}% off your order — plus points on everything you buy.
              </p>
              {wp ? (
                <a href={wp.myAccountUrl} className="mt-6 inline-flex h-[52px] w-full items-center justify-center rounded-full bg-olive text-[12.5px] font-medium tracking-[0.14em] text-cream uppercase transition hover:bg-olive-hover">
                  Sign in &amp; get {percent}% off
                </a>
              ) : (
                <Link to="/account" onClick={close} className="mt-6 inline-flex h-[52px] w-full items-center justify-center rounded-full bg-olive text-[12.5px] font-medium tracking-[0.14em] text-cream uppercase transition hover:bg-olive-hover">
                  Sign in &amp; get {percent}% off
                </Link>
              )}
              <button type="button" onClick={close} className="mt-3 text-[13px] text-muted underline-offset-4 hover:text-ink hover:underline">
                Maybe later
              </button>
            </>
          ) : (
            <>
              <h2 id="rf-reward-title" className="font-serif text-[30px] leading-tight">
                Welcome{me.firstName ? `, ${me.firstName}` : ''}.
              </h2>
              <p className="mx-auto mt-2 max-w-[310px] text-[14.5px] leading-relaxed text-ink-soft">
                Your {percent}% welcome discount is ready.{' '}
                {cart.lines.length ? 'It’s already applied to your cart.' : 'It’s applied to your cart as soon as you add a fragrance.'}
              </p>
              {code && <CodeChip code={code} />}
              {LOYALTY.enabled && (
                <p className="mt-4 text-[13px] text-muted">
                  You also earn {LOYALTY.earn === 1 ? '1 point' : `${LOYALTY.earn} points`} for every 1 EGP — {LOYALTY.min} points take{' '}
                  {Math.floor(LOYALTY.min * LOYALTY.value)} EGP off.
                </p>
              )}
              <Link
                to={cart.lines.length ? '/checkout' : '/shop'}
                onClick={close}
                className="mt-6 inline-flex h-[52px] w-full items-center justify-center rounded-full bg-olive text-[12.5px] font-medium tracking-[0.14em] text-cream uppercase transition hover:bg-olive-hover"
              >
                {cart.lines.length ? 'Go to checkout' : 'Start shopping'}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

function CodeChip({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(code).then(() => setCopied(true), () => undefined)
      }}
      className="relative mx-auto mt-5 flex items-center gap-3 overflow-hidden rounded-xl border border-dashed border-gold/70 bg-chip px-5 py-3 font-mono text-[15px] tracking-[0.12em]"
    >
      <span aria-hidden className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent [animation:rf-shine_2.8s_ease-in-out_infinite]" />
      {code}
      {copied ? <Check className="size-4 text-olive" /> : <Copy className="size-4 text-muted" />}
    </button>
  )
}
