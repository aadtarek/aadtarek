import { useEffect, useState, type FormEvent } from 'react'
import { wp } from '../api/wp'
import heroImage from '../assets/hero.webp'
import { PageHeader } from '../components/PageHeader'
import { formatPrice } from '../lib/format'
import { useAccount } from '../store/account'

export function Account() {
  const account = useAccount()
  // With WordPress connected, sign-in, registration and order history live in WooCommerce's My Account.
  useEffect(() => {
    if (wp) window.location.assign(wp.myAccountUrl)
  }, [])
  if (wp) return <div className="min-h-[50vh]" />
  if (!account.customer) return <AuthForms />

  return (
    <div className="pb-16">
      <PageHeader eyebrow="My account" title={`Hello, ${account.customer.firstName}.`}>
        <button
          type="button"
          onClick={account.logout}
          className="mt-3 text-[12px] tracking-[0.1em] text-muted uppercase underline-offset-4 hover:text-ink hover:underline"
        >
          Sign out
        </button>
      </PageHeader>
      <div className="container-x">
        <h2 className="border-b border-line pb-3 text-[13px] font-semibold tracking-[0.14em] uppercase">Orders</h2>
        {account.orders.length === 0 ? (
          <p className="py-8 text-muted">You haven’t placed any orders yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {account.orders.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-4 text-[14px]">
                <div>
                  <p className="font-semibold">{o.number}</p>
                  <p className="text-[12px] text-muted">{new Date(o.createdAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })}</p>
                </div>
                <p className="text-ink-soft">{o.items.map((i) => `${i.name} (${i.size}) × ${i.quantity}`).join(', ')}</p>
                <span className="rounded-full bg-chip px-3 py-1 text-[11px] tracking-[0.08em] uppercase">{o.status}</span>
                <p className="font-semibold">{formatPrice(o.total)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
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

/** Demo sign in / create account (the live store uses WooCommerce's My Account with the same layout). */
function AuthForms() {
  const { login, register } = useAccount()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const switchTo = (m: 'login' | 'register') => {
    setMode(m)
    setError(null)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (mode === 'register') {
      if (!form.fullName.trim()) return setError('Please enter your full name.')
      if (form.phone.replace(/\D/g, '').length < 10) return setError('Please enter your WhatsApp number.')
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Enter a valid email.')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    if (mode === 'login') return setError(login(form.email, form.password))
    const [firstName, ...rest] = form.fullName.trim().split(/\s+/)
    setError(register({ firstName, lastName: rest.join(' '), email: form.email, password: form.password }))
  }

  const input = 'h-[50px] w-full rounded-md border border-line-strong bg-white px-3.5 text-[15px] outline-none focus:border-olive focus:ring-3 focus:ring-olive/10'
  const label = 'grid gap-1.5 text-[13px] font-medium text-ink-soft'

  return (
    <div className="container-x py-8 lg:py-12">
      <div className="mx-auto grid max-w-[1040px] gap-8 md:grid-cols-[1fr_460px]">
        <div className="relative hidden min-h-[560px] overflow-hidden rounded-[14px] md:block">
          <img src={heroImage} alt="" className="absolute inset-0 size-full object-cover object-[70%_center]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink/55" />
          <p className="absolute bottom-7 left-8 font-serif text-[38px] leading-[1.05] text-cream">Speak your scent.</p>
        </div>
        <div className="rounded-[14px] border border-line bg-card px-5 pt-7 pb-8 shadow-[0_20px_50px_-30px_rgba(40,30,20,0.35)] sm:px-10">
          <div role="tablist" className="grid grid-cols-2 rounded-full bg-chip p-1">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => switchTo(m)}
                className={`rounded-full py-2.5 text-[13px] font-medium tracking-[0.08em] uppercase transition ${mode === m ? 'bg-olive text-cream' : 'text-ink-soft'}`}
              >
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>
          <h1 className="mt-6 font-serif text-[34px] leading-[1.1]">{mode === 'login' ? 'Welcome back.' : 'Create your account.'}</h1>
          <p className="mt-1.5 text-[15px] text-muted">
            {mode === 'login' ? 'Sign in to see your orders and saved details.' : 'Track orders, save your favourites and check out faster.'}
          </p>

          <div className="mt-6 grid gap-2.5">
            {[
              { name: 'Google', Icon: GoogleIcon },
              { name: 'Facebook', Icon: FacebookLogo },
            ].map(({ name, Icon }) => (
              <button
                key={name}
                type="button"
                onClick={() => setNote(`${name} sign-in works on the live store once its keys are added in WordPress.`)}
                className="flex h-[50px] items-center justify-center gap-3 rounded-md border border-line-strong bg-white text-[15px] font-medium transition hover:border-ink hover:shadow-[0_4px_14px_-8px_rgba(0,0,0,0.3)]"
              >
                <Icon />
                Continue with {name}
              </button>
            ))}
            {note && <p className="text-[13px] text-muted">{note}</p>}
          </div>
          <p className="my-5 flex items-center gap-3.5 text-[13px] tracking-[0.14em] text-muted uppercase before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">
            or
          </p>

          <form onSubmit={submit} noValidate className="grid gap-3.5">
            {mode === 'register' && (
              <>
                <label className={label}>
                  Full name
                  <input className={input} value={form.fullName} onChange={set('fullName')} autoComplete="name" />
                </label>
                <label className={label}>
                  WhatsApp number
                  <input className={input} type="tel" inputMode="tel" placeholder="01x xxxx xxxx" value={form.phone} onChange={set('phone')} autoComplete="tel" />
                </label>
              </>
            )}
            <label className={label}>
              Email
              <input className={input} type="email" value={form.email} onChange={set('email')} autoComplete="email" />
            </label>
            <label className={label}>
              Password
              <input
                className={input}
                type="password"
                value={form.password}
                onChange={set('password')}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </label>
            {error && (
              <p role="alert" className="text-[13px] text-red-700">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="mt-1 h-[54px] w-full rounded-md bg-olive text-[13px] font-medium tracking-[0.12em] text-cream uppercase transition hover:bg-olive-hover"
            >
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
            <p className="text-center text-[14px] text-muted">
              {mode === 'login' ? 'New to Rfaheya?' : 'Already have an account?'}{' '}
              <button type="button" onClick={() => switchTo(mode === 'login' ? 'register' : 'login')} className="font-medium text-ink underline underline-offset-4">
                {mode === 'login' ? 'Create an account' : 'Sign in'}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
