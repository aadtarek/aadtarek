import { useEffect, useState, type FormEvent } from 'react'
import { wp } from '../api/wp'
import { Field, TextInput } from '../components/Field'
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

function AuthForms() {
  const { login, register } = useAccount()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [error, setError] = useState<string | null>(null)

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Enter a valid email.')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    if (mode === 'register' && (!form.firstName.trim() || !form.lastName.trim())) return setError('Please enter your name.')
    setError(mode === 'login' ? login(form.email, form.password) : register(form))
  }

  return (
    <div className="pb-16">
      <PageHeader eyebrow="My account" title={mode === 'login' ? 'Welcome back.' : 'Create an account.'} />
      <div className="container-x">
        <form onSubmit={submit} noValidate className="max-w-md space-y-4">
          {mode === 'register' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name">
                <TextInput value={form.firstName} onChange={set('firstName')} autoComplete="given-name" />
              </Field>
              <Field label="Last name">
                <TextInput value={form.lastName} onChange={set('lastName')} autoComplete="family-name" />
              </Field>
            </div>
          )}
          <Field label="Email">
            <TextInput type="email" value={form.email} onChange={set('email')} autoComplete="email" />
          </Field>
          <Field label="Password">
            <TextInput
              type="password"
              value={form.password}
              onChange={set('password')}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </Field>
          {error && (
            <p role="alert" className="text-[13px] text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="h-[52px] w-full rounded-[3px] bg-olive text-[12.5px] font-medium tracking-[0.12em] text-cream uppercase transition hover:bg-olive-hover"
          >
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
          <p className="text-center text-[14px] text-muted">
            {mode === 'login' ? 'New to Rfaheya?' : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login')
                setError(null)
              }}
              className="font-medium text-ink underline underline-offset-4"
            >
              {mode === 'login' ? 'Create an account' : 'Sign in'}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
