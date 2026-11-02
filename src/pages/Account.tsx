import { ChevronDown, LogOut, Package, Sparkles, UserRound } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { accountApi, type AccountDetails, type AccountMe, type AccountOrder } from '../api/account'
import { isWoo } from '../api/wp'
import heroImage from '../assets/hero.webp'
import accountImage from '../assets/about/value-2.webp'
import { PageHeader } from '../components/PageHeader'
import { GOVERNORATES } from '../config'
import { formatPrice } from '../lib/format'
import { useAccount } from '../store/account'
import { useRewards } from '../store/rewards'

/** What the page needs from an account backend: WooCommerce (live store) or this browser (demo). */
interface Backend {
  me: AccountMe | null
  login: (email: string, password: string) => Promise<void>
  register: (d: { firstName: string; lastName: string; email: string; phone: string; password: string }) => Promise<void>
  lostPassword: (email: string) => Promise<string>
  resetPassword: (d: { key: string; login: string; id: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  data: () => Promise<{ orders: AccountOrder[]; details: AccountDetails }>
  save: (d: AccountDetails & { currentPassword: string; newPassword: string }) => Promise<void>
}

function useWooBackend(): Backend {
  const [me, setMe] = useState<AccountMe | null>(null)
  const reload = useCallback(async () => setMe(await accountApi.me().catch(() => ({ loggedIn: false }) as AccountMe)), [])
  useEffect(() => {
    reload()
  }, [reload])
  const nonce = me?.accountNonce ?? ''
  return {
    me,
    login: async (email, password) => {
      await accountApi.login(email, password)
      await reload()
    },
    register: async (d) => {
      await accountApi.register(d)
      await reload()
    },
    lostPassword: async (email) => (await accountApi.lostPassword(email)).message,
    resetPassword: async (d) => {
      await accountApi.resetPassword(d)
      await reload()
    },
    logout: async () => {
      await accountApi.logout(nonce)
      await reload()
    },
    data: () => accountApi.data(nonce),
    save: async (d) => {
      await accountApi.save(nonce, d)
      await reload()
    },
  }
}

/** The demo store (no WordPress): accounts and orders kept in this browser. */
function useDemoBackend(): Backend {
  const account = useAccount()
  const c = account.customer
  const fail = (message: string | null) => {
    if (message) throw new Error(message)
  }
  return {
    me: c ? { loggedIn: true, firstName: c.firstName, lastName: c.lastName, email: c.email, social: [] } : { loggedIn: false, social: [] },
    login: async (email, password) => fail(account.login(email, password)),
    register: async (d) => fail(account.register(d)),
    lostPassword: async () => 'If an account exists for this email, a link to choose a new password is on its way.',
    resetPassword: async () => undefined,
    logout: async () => account.logout(),
    data: async () => ({
      orders: account.orders.map((o) => ({
        id: o.id,
        number: o.number,
        date: o.createdAt,
        status: o.status.charAt(0).toUpperCase() + o.status.slice(1),
        statusKey: o.status,
        total: o.total,
        shipping: o.shipping,
        discount: 0,
        payment: o.paymentMethod === 'cod' ? 'Cash on delivery' : o.paymentMethod,
        address: [o.shippingAddress.address, o.shippingAddress.city, o.shippingAddress.governorate].filter(Boolean).join(', '),
        items: o.items.map((i) => ({ name: `${i.name} — ${i.size}`, quantity: i.quantity, total: i.price * i.quantity, image: '' })),
      })),
      details: { firstName: c?.firstName ?? '', lastName: c?.lastName ?? '', email: c?.email ?? '', phone: '', address: '', area: '', governorate: '' },
    }),
    save: async () => undefined,
  }
}

const useBackend: () => Backend = isWoo ? useWooBackend : useDemoBackend

export function Account() {
  const backend = useBackend()
  useEffect(() => {
    document.title = 'My account — Rfaheya'
    return () => {
      document.title = 'Rfaheya — Speak Your Scent'
    }
  }, [])
  if (!backend.me) return <div className="min-h-[60vh]" aria-busy />
  return backend.me.loggedIn ? <Dashboard backend={backend} /> : <AuthPanel backend={backend} />
}

// ------------------------------------------------------------------ signed in

function Dashboard({ backend }: { backend: Backend }) {
  const me = backend.me!
  const rewards = useRewards()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'details' ? 'details' : 'orders'
  const [data, setData] = useState<{ orders: AccountOrder[]; details: AccountDetails } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { data: load } = backend

  useEffect(() => {
    load()
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Could not load your account.'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me.email])

  const points = rewards.me.loggedIn ? rewards.me.points : me.points
  const tabs: { key: 'orders' | 'details'; label: string; Icon: typeof Package }[] = [
    { key: 'orders', label: 'Orders', Icon: Package },
    { key: 'details', label: 'My details', Icon: UserRound },
  ]

  return (
    <div className="pb-16 lg:pb-20">
      <PageHeader eyebrow="My account" title={`Hello, ${me.firstName || 'there'}`} image={accountImage}>
        <p className="mt-3 text-[15px] text-ink-soft">{me.email}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {typeof points === 'number' && (
            <span className="rf-white inline-flex h-11 items-center gap-2 rounded-full pr-4 pl-1.5 text-[13px] font-semibold">
              <span className="grid size-8 place-items-center rounded-full bg-olive text-on-accent">
                <Sparkles className="size-4" strokeWidth={1.8} />
              </span>
              {points.toLocaleString('en')} points
            </span>
          )}
          <button
            type="button"
            onClick={() => backend.logout()}
            className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-[12px] font-semibold tracking-[0.1em] text-ink-soft uppercase shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition hover:text-ink"
          >
            <LogOut className="size-4" strokeWidth={1.6} />
            Sign out
          </button>
        </div>
      </PageHeader>

      <div className="container-x mt-4 lg:mt-5">
        <div role="tablist" aria-label="Account" className="flex w-max gap-1 rounded-full bg-chip p-[5px]">
          {tabs.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setParams(key === 'orders' ? {} : { tab: key }, { replace: true })}
              className={`inline-flex h-10 items-center gap-2 rounded-full px-5 text-[12.5px] font-semibold transition ${
                tab === key ? 'rf-white text-ink shadow-[0_4px_12px_-6px_rgba(60,40,10,0.3)]' : 'text-muted hover:text-ink'
              }`}
            >
              <Icon className="size-4" strokeWidth={1.6} />
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {error && <p className="rounded-[20px] bg-red-50 p-4 text-[14px] text-red-800">{error}</p>}
          {!data && !error && <div className="min-h-[240px] rounded-[28px] bg-chip/60" aria-busy />}
          {data && tab === 'orders' && <Orders orders={data.orders} open={Number(params.get('order')) || null} />}
          {data && tab === 'details' && <Details details={data.details} save={backend.save} onSaved={() => load().then(setData)} />}
        </div>
      </div>
    </div>
  )
}

const statusTone: Record<string, string> = {
  completed: 'bg-[#e4efd9] text-[#3e5a1f]',
  processing: 'bg-[#f3e3c9] text-[#8a5a1c]',
  'on-hold': 'bg-[#f3e3c9] text-[#8a5a1c]',
  pending: 'bg-chip text-ink-soft',
  cancelled: 'bg-red-50 text-red-800',
  refunded: 'bg-red-50 text-red-800',
  failed: 'bg-red-50 text-red-800',
}

function Orders({ orders, open: openId }: { orders: AccountOrder[]; open: number | null }) {
  const [open, setOpen] = useState<number | null>(openId ?? orders[0]?.id ?? null)
  if (orders.length === 0) {
    return (
      <div className="rf-white flex flex-col items-center rounded-[28px] px-6 py-14 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-chip text-gold">
          <Package className="size-7" strokeWidth={1.4} />
        </span>
        <p className="mt-4 font-serif text-[30px] leading-none">No orders yet</p>
        <p className="mt-2 text-[14.5px] text-ink-soft">When you order, it shows here with its status.</p>
        <Link to="/shop" className="mt-6 inline-flex h-12 items-center rounded-full bg-olive px-7 text-[12px] font-semibold tracking-[0.12em] text-on-accent uppercase hover:bg-olive-hover">
          Shop fragrances
        </Link>
      </div>
    )
  }
  return (
    <ul className="space-y-2">
      {orders.map((o) => {
        const on = open === o.id
        return (
          <li key={o.id} className="rf-white overflow-hidden rounded-[24px]">
            <button type="button" aria-expanded={on} onClick={() => setOpen(on ? null : o.id)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 p-4 text-left sm:p-5">
              <div className="flex -space-x-2">
                {o.items.slice(0, 3).map((i, k) =>
                  i.image ? (
                    <img key={k} src={i.image} alt="" className="size-11 rounded-full object-cover ring-2 ring-white" />
                  ) : (
                    <span key={k} className="grid size-11 place-items-center rounded-full bg-chip text-gold ring-2 ring-white">
                      <Package className="size-4" strokeWidth={1.6} />
                    </span>
                  ),
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-[22px] leading-none">Order {o.number}</p>
                <p className="mt-1 text-[12.5px] text-muted">
                  {o.date ? new Date(o.date).toLocaleDateString('en-GB', { dateStyle: 'medium' }) : ''} · {o.items.reduce((n, i) => n + i.quantity, 0)} items
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-[11.5px] font-semibold ${statusTone[o.statusKey] ?? 'bg-chip text-ink-soft'}`}>{o.status}</span>
              <span className="text-[15px] font-semibold tabular-nums">{formatPrice(o.total)}</span>
              <ChevronDown className={`size-5 text-muted transition ${on ? 'rotate-180' : ''}`} strokeWidth={1.6} />
            </button>
            {on && (
              <div className="grid gap-4 border-t border-line p-4 sm:grid-cols-[1fr_260px] sm:p-5">
                <ul className="space-y-2">
                  {o.items.map((i, k) => (
                    <li key={k} className="flex items-center gap-3 text-[14px]">
                      {i.image && <img src={i.image} alt="" className="size-12 rounded-[12px] object-cover" />}
                      <span className="flex-1">
                        {i.name} <span className="text-muted">× {i.quantity}</span>
                      </span>
                      <span className="font-medium tabular-nums">{formatPrice(i.total)}</span>
                    </li>
                  ))}
                </ul>
                <dl className="space-y-1.5 rounded-[18px] bg-sand p-4 text-[13px]">
                  {o.discount > 0 && <Row k="Discount" v={`− ${formatPrice(o.discount)}`} />}
                  <Row k="Delivery" v={o.shipping > 0 ? formatPrice(o.shipping) : 'Free'} />
                  <Row k="Total" v={formatPrice(o.total)} strong />
                  {o.payment && <Row k="Payment" v={o.payment} />}
                  {o.address && <Row k="Deliver to" v={o.address} />}
                </dl>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{k}</dt>
      <dd className={`text-right ${strong ? 'font-semibold' : ''}`}>{v}</dd>
    </div>
  )
}

function Details({ details, save, onSaved }: { details: AccountDetails; save: Backend['save']; onSaved: () => void }) {
  const [form, setForm] = useState({ ...details, currentPassword: '', newPassword: '' })
  const [state, setState] = useState<{ busy?: boolean; error?: string; done?: boolean }>({})
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setState({ busy: true })
    try {
      await save(form)
      setForm((f) => ({ ...f, currentPassword: '', newPassword: '' }))
      setState({ done: true })
      onSaved()
    } catch (err) {
      setState({ error: err instanceof Error ? err.message : 'Could not save. Please try again.' })
    }
  }

  return (
    <form onSubmit={submit} className="rf-white grid gap-6 rounded-[28px] p-5 sm:p-8 lg:grid-cols-2 lg:gap-10" noValidate>
      <fieldset className="grid content-start gap-3.5">
        <legend className="mb-1 font-serif text-[26px] leading-none">Your details</legend>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="First name">
            <input className={input} value={form.firstName} onChange={set('firstName')} autoComplete="given-name" />
          </Field>
          <Field label="Last name">
            <input className={input} value={form.lastName} onChange={set('lastName')} autoComplete="family-name" />
          </Field>
        </div>
        <Field label="Email">
          <input className={input} type="email" value={form.email} onChange={set('email')} autoComplete="email" />
        </Field>
        <Field label="WhatsApp number">
          <input className={input} type="tel" inputMode="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" placeholder="01x xxxx xxxx" />
        </Field>
        <p className="mt-3 font-serif text-[22px] leading-none">Change password</p>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="Current password">
            <input className={input} type="password" value={form.currentPassword} onChange={set('currentPassword')} autoComplete="current-password" />
          </Field>
          <Field label="New password">
            <input className={input} type="password" value={form.newPassword} onChange={set('newPassword')} autoComplete="new-password" />
          </Field>
        </div>
      </fieldset>
      <fieldset className="grid content-start gap-3.5">
        <legend className="mb-1 font-serif text-[26px] leading-none">Delivery address</legend>
        <Field label="Governorate">
          <select className={input} value={form.governorate} onChange={set('governorate')} autoComplete="address-level1">
            <option value="">Choose…</option>
            {GOVERNORATES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Area / city">
          <input className={input} value={form.area} onChange={set('area')} autoComplete="address-level2" />
        </Field>
        <Field label="Street, building, floor">
          <input className={input} value={form.address} onChange={set('address')} autoComplete="street-address" />
        </Field>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button type="submit" disabled={state.busy} className="h-12 rounded-full bg-olive px-8 text-[12px] font-semibold tracking-[0.12em] text-on-accent uppercase transition hover:bg-olive-hover disabled:opacity-60">
            {state.busy ? 'Saving…' : 'Save changes'}
          </button>
          {state.done && <span className="text-[13.5px] font-medium text-[#3e5a1f]">Saved ✓</span>}
          {state.error && (
            <span role="alert" className="text-[13.5px] text-red-700">
              {state.error}
            </span>
          )}
        </div>
      </fieldset>
    </form>
  )
}

// ------------------------------------------------------------------ signed out

const input = 'h-[50px] w-full rounded-full border-[1.5px] border-line bg-sand px-4 text-[15px] outline-none transition focus:border-olive'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-[11.5px] font-semibold text-muted">
      {label}
      {children}
    </label>
  )
}

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" className="size-5" aria-hidden>
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
)
const FacebookLogo = () => (
  <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
    <path fill="#1877F2" d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z" />
  </svg>
)

type Mode = 'login' | 'register' | 'forgot' | 'reset'

function AuthPanel({ backend }: { backend: Backend }) {
  const [params, setParams] = useSearchParams()
  const resetKey = params.get('reset') ?? ''
  const [mode, setMode] = useState<Mode>(resetKey ? 'reset' : 'login')
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', password: '' })
  const [error, setError] = useState<string | null>(params.get('error'))
  const [note, setNote] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const social = useMemo(() => backend.me?.social ?? [], [backend.me])

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const switchTo = (m: Mode) => {
    setMode(m)
    setError(null)
    setNote(null)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setNote(null)
    if (mode === 'register') {
      if (!form.fullName.trim()) return setError('Please enter your full name.')
      if (form.phone.replace(/\D/g, '').length < 10) return setError('Please enter your WhatsApp number.')
    }
    if (mode !== 'reset' && !/^\S+@\S+\.\S+$/.test(form.email)) return setError('Enter a valid email.')
    if (mode !== 'forgot' && form.password.length < 6) return setError('Password must be at least 6 characters.')
    setBusy(true)
    try {
      if (mode === 'login') await backend.login(form.email, form.password)
      if (mode === 'register') {
        const [firstName, ...rest] = form.fullName.trim().split(/\s+/)
        await backend.register({ firstName, lastName: rest.join(' '), email: form.email, phone: form.phone, password: form.password })
      }
      if (mode === 'forgot') setNote(await backend.lostPassword(form.email))
      if (mode === 'reset') {
        await backend.resetPassword({ key: resetKey, login: params.get('login') ?? '', id: params.get('id') ?? '', password: form.password })
        setParams({}, { replace: true })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const titles: Record<Mode, [string, string]> = {
    login: ['Welcome back', 'Sign in to see your orders, points and saved details.'],
    register: ['Create your account', 'Track orders, earn points and check out faster.'],
    forgot: ['Forgot your password?', 'Enter your email and we’ll send you a link to choose a new one.'],
    reset: ['Choose a new password', 'Pick a new password for your account.'],
  }
  const submitLabel: Record<Mode, string> = { login: 'Sign in', register: 'Create account', forgot: 'Send the link', reset: 'Save new password' }

  return (
    <div className="container-x pt-3 pb-16 lg:pt-4 lg:pb-20">
      <div className="grid gap-4 lg:grid-cols-[1fr_480px] lg:gap-5">
        <div className="relative hidden min-h-[600px] overflow-hidden rounded-[36px] bg-[#1c120b] lg:block">
          <img src={heroImage} alt="" className="absolute inset-0 size-full object-cover object-[70%_center]" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#140c07]/80 via-transparent to-transparent" />
          <div className="absolute inset-x-8 bottom-8 text-white">
            <p className="text-[11px] font-semibold tracking-[0.24em] text-[#f0c27a] uppercase">My account</p>
            <p className="mt-2 font-serif text-[48px] leading-[0.98]">
              Speak your <span className="text-[#f0c27a] italic">scent.</span>
            </p>
            <p className="mt-2 max-w-sm text-[14.5px] text-white/75">Your orders, your points and a faster checkout — all in one place.</p>
          </div>
        </div>

        <div className="rf-white rounded-[28px] px-5 pt-6 pb-8 sm:px-10 lg:rounded-[36px]">
          {(mode === 'login' || mode === 'register') && (
            <div role="tablist" className="grid grid-cols-2 rounded-full bg-chip p-[5px]">
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => switchTo(m)}
                  className={`rounded-full py-2.5 text-[12.5px] font-semibold transition ${mode === m ? 'rf-white text-ink shadow-[0_4px_12px_-6px_rgba(60,40,10,0.3)]' : 'text-muted hover:text-ink'}`}
                >
                  {m === 'login' ? 'Sign in' : 'Create account'}
                </button>
              ))}
            </div>
          )}
          <h1 className="mt-6 font-serif text-[40px] leading-none">{titles[mode][0]}</h1>
          <p className="mt-2 text-[14.5px] text-ink-soft">{titles[mode][1]}</p>

          {(mode === 'login' || mode === 'register') && social.length > 0 && (
            <>
              <div className="mt-6 grid gap-2.5">
                {social.map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    className="flex h-[50px] items-center justify-center gap-3 rounded-full text-[14.5px] font-medium shadow-[inset_0_0_0_1.5px_var(--color-line)] transition hover:shadow-[inset_0_0_0_1.5px_var(--color-ink)]"
                  >
                    {/google/i.test(s.name) ? <GoogleIcon /> : <FacebookLogo />}
                    Continue with {s.name}
                  </a>
                ))}
              </div>
              <p className="my-5 flex items-center gap-3.5 text-[12px] tracking-[0.14em] text-muted uppercase before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">or</p>
            </>
          )}

          <form onSubmit={submit} noValidate className="mt-6 grid gap-3.5">
            {mode === 'register' && (
              <>
                <Field label="Full name">
                  <input className={input} value={form.fullName} onChange={set('fullName')} autoComplete="name" />
                </Field>
                <Field label="WhatsApp number">
                  <input className={input} type="tel" inputMode="tel" placeholder="01x xxxx xxxx" value={form.phone} onChange={set('phone')} autoComplete="tel" />
                </Field>
              </>
            )}
            {mode !== 'reset' && (
              <Field label="Email">
                <input className={input} type="email" value={form.email} onChange={set('email')} autoComplete="email" />
              </Field>
            )}
            {mode !== 'forgot' && (
              <Field label={mode === 'reset' ? 'New password' : 'Password'}>
                <input className={input} type="password" value={form.password} onChange={set('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
              </Field>
            )}
            {mode === 'login' && (
              <button type="button" onClick={() => switchTo('forgot')} className="-mt-1 justify-self-end text-[13px] font-medium text-ink-soft underline-offset-4 hover:underline">
                Forgot password?
              </button>
            )}
            {error && (
              <p role="alert" className="rounded-[16px] bg-red-50 px-4 py-3 text-[13.5px] text-red-800">
                {error}
              </p>
            )}
            {note && <p className="rounded-[16px] bg-[#e4efd9] px-4 py-3 text-[13.5px] text-[#3e5a1f]">{note}</p>}
            <button
              type="submit"
              disabled={busy}
              className="mt-1 h-14 w-full rounded-full bg-olive text-[12.5px] font-semibold tracking-[0.12em] text-on-accent uppercase transition hover:bg-olive-hover disabled:opacity-60"
            >
              {busy ? 'Please wait…' : submitLabel[mode]}
            </button>
            {(mode === 'forgot' || mode === 'reset') && (
              <button type="button" onClick={() => switchTo('login')} className="text-center text-[14px] font-medium underline underline-offset-4">
                Back to sign in
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
