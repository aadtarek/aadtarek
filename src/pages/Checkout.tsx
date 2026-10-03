import { CheckCircle2 } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { PAYMENT_LABELS, placeWooOrder, updateCustomer } from '../api/checkout'
import { isWoo, money } from '../api/wp'
import { Field, TextInput, inputClass } from '../components/Field'
import { PageHeader } from '../components/PageHeader'
import { CONTACT, GOVERNORATES, shippingCost } from '../config'
import { formatPrice } from '../lib/format'
import { useAccount } from '../store/account'
import { useCart } from '../store/cart'
import type { Order, ShippingAddress } from '../types'

type Errors = Partial<Record<keyof ShippingAddress, string>>

function validate(a: ShippingAddress): Errors {
  const e: Errors = {}
  if (!a.firstName.trim()) e.firstName = 'Required'
  if (!a.lastName.trim()) e.lastName = 'Required'
  if (!/^(\+?20)?0?1[0125]\d{8}$/.test(a.phone.replace(/[\s-]/g, ''))) e.phone = 'Enter a valid Egyptian mobile number'
  // WooCommerce requires a billing email; the demo store doesn't.
  if ((isWoo || a.email) && !/^\S+@\S+\.\S+$/.test(a.email)) e.email = 'Enter a valid email'
  if (!a.governorate) e.governorate = 'Required'
  if (!a.city.trim()) e.city = 'Required'
  if (a.address.trim().length < 6) e.address = 'Enter your full street address'
  return e
}

export function Checkout() {
  const cart = useCart()
  const account = useAccount()
  const [placed, setPlaced] = useState<Order | null>(null)
  const [payment, setPayment] = useState<string>('cod')
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [quoting, setQuoting] = useState(false)
  const [address, setAddress] = useState<ShippingAddress>({
    firstName: account.customer?.firstName ?? '',
    lastName: account.customer?.lastName ?? '',
    phone: '',
    email: account.customer?.email ?? '',
    governorate: 'Cairo',
    city: '',
    address: '',
    notes: '',
  })

  const woo = cart.woo
  const wooCart = woo?.cart ?? null
  const apply = woo?.apply

  // WooCommerce calculates shipping from the address: send it whenever the governorate/city changes.
  useEffect(() => {
    if (!isWoo || !apply || cart.lines.length === 0) return
    let cancelled = false
    setQuoting(true)
    const t = window.setTimeout(() => {
      updateCustomer(address)
        .then((c) => !cancelled && apply(c))
        .catch(() => undefined)
        .finally(() => !cancelled && setQuoting(false))
    }, 350)
    return () => {
      cancelled = true
      window.clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address.governorate, address.city, apply, cart.lines.length])

  const minor = wooCart?.totals.currency_minor_unit ?? 2
  const subtotal = wooCart ? money(wooCart.totals.total_items, minor) : cart.subtotal
  const shipping = wooCart ? money(wooCart.totals.total_shipping ?? '0', minor) : shippingCost(cart.subtotal, address.governorate)
  const total = wooCart ? money(wooCart.totals.total_price, minor) : subtotal + shipping
  const noDelivery = Boolean(wooCart?.needs_shipping && wooCart.shipping_rates.every((p) => p.shipping_rates.length === 0))
  const methods = isWoo ? (wooCart?.payment_methods ?? []) : ['cod', 'instapay']

  useEffect(() => {
    if (methods.length && !methods.includes(payment)) setPayment(methods[0])
  }, [methods, payment])

  const set = (key: keyof ShippingAddress) => (e: { target: { value: string } }) => {
    setAddress((a) => ({ ...a, [key]: e.target.value }))
    if (errors[key]) setErrors((x) => ({ ...x, [key]: undefined }))
  }

  const finish = (order: Omit<Order, 'id' | 'number' | 'createdAt' | 'status'>, number?: string) => {
    const saved = account.placeOrder(order, number)
    cart.clear()
    setPlaced(saved)
    window.scrollTo(0, 0)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    const found = validate(address)
    setErrors(found)
    if (Object.keys(found).length) {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      return
    }
    const items = cart.lines.map((l) => ({
      productId: l.productId,
      variationId: l.variationId,
      name: l.product.name,
      size: l.variation.size,
      price: l.variation.price,
      quantity: l.quantity,
      giftMessage: l.giftMessage,
    }))
    const order = { items, subtotal, shipping, total, paymentMethod: payment, shippingAddress: address }

    if (!isWoo) return finish(order)

    const gifts = cart.lines.filter((l) => l.giftMessage).map((l) => `Gift message for ${l.product.name} (${l.variation.size}): ${l.giftMessage}`)
    const note = [address.notes.trim(), ...gifts].filter(Boolean).join('\n\n')
    setSubmitting(true)
    try {
      const result = await placeWooOrder(address, payment, note)
      if (result.payment_result?.payment_status === 'failure') throw new Error('Payment failed. Please try another method.')
      const redirect = result.payment_result?.redirect_url
      // Online gateways (e.g. card payments) send the customer to their payment page.
      if (redirect && !['cod', 'bacs'].includes(payment) && !redirect.includes('order-received')) {
        window.location.assign(redirect)
        return
      }
      finish(order, `#${result.order_id}`)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'We couldn’t place your order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (placed) {
    return (
      <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <CheckCircle2 className="size-12 text-olive" strokeWidth={1.2} />
        <h1 className="mt-4 font-serif text-[40px] sm:text-[48px]">Thank you, {placed.shippingAddress.firstName}.</h1>
        <p className="mt-2 text-ink-soft">
          Your order <strong>{placed.number}</strong> has been received. We’ll call you on {placed.shippingAddress.phone} to confirm delivery.
        </p>
        {placed.paymentMethod === 'instapay' || placed.paymentMethod === 'bacs' ? (
          <div className="mt-6 max-w-md rounded-lg bg-card p-5 text-left shadow-[0_0_0_1px_rgba(60,45,20,0.06)]">
            <p className="text-[13px] font-semibold tracking-[0.12em] uppercase">Complete your InstaPay transfer</p>
            <p className="mt-2 text-[15px] text-ink-soft">
              Send <strong className="text-ink">{formatPrice(placed.total)}</strong> to <strong className="text-ink">{CONTACT.instapay}</strong> and
              include your order number <strong className="text-ink">{placed.number}</strong> in the note. We’ll confirm once it arrives.
            </p>
          </div>
        ) : (
          <p className="mt-1 text-ink-soft">
            Total due on delivery: <strong>{formatPrice(placed.total)}</strong>
          </p>
        )}
        <Link
          to="/shop"
          className="mt-8 inline-flex h-12 items-center rounded-[3px] bg-olive px-8 text-[12px] font-medium tracking-[0.12em] text-cream uppercase hover:bg-olive-hover"
        >
          Continue shopping
        </Link>
      </div>
    )
  }

  if (cart.lines.length === 0) {
    return (
      <div className="container-x flex min-h-[55vh] flex-col items-center justify-center py-16 text-center">
        <h1 className="font-serif text-[40px]">Your cart is empty.</h1>
        <Link
          to="/shop"
          className="mt-6 inline-flex h-12 items-center rounded-[3px] bg-olive px-8 text-[12px] font-medium tracking-[0.12em] text-cream uppercase hover:bg-olive-hover"
        >
          Shop fragrances
        </Link>
      </div>
    )
  }

  const err = (k: keyof ShippingAddress) => ({ 'aria-invalid': Boolean(errors[k]) })

  return (
    <div className="pb-16">
      <PageHeader eyebrow="Almost yours" title="Checkout." />
      <form onSubmit={submit} noValidate className="container-x grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-14">
        <div className="space-y-8">
          <fieldset>
            <legend className="mb-4 text-[13px] font-semibold tracking-[0.14em] uppercase">Contact & delivery</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" error={errors.firstName}>
                <TextInput value={address.firstName} onChange={set('firstName')} autoComplete="given-name" {...err('firstName')} />
              </Field>
              <Field label="Last name" error={errors.lastName}>
                <TextInput value={address.lastName} onChange={set('lastName')} autoComplete="family-name" {...err('lastName')} />
              </Field>
              <Field label="Mobile number" error={errors.phone}>
                <TextInput type="tel" inputMode="tel" placeholder="01X XXXX XXXX" value={address.phone} onChange={set('phone')} autoComplete="tel" {...err('phone')} />
              </Field>
              <Field label={isWoo ? 'Email' : 'Email (optional)'} error={errors.email}>
                <TextInput type="email" value={address.email} onChange={set('email')} autoComplete="email" {...err('email')} />
              </Field>
              <Field label="Governorate" error={errors.governorate}>
                <select value={address.governorate} onChange={set('governorate')} className={inputClass} {...err('governorate')}>
                  {GOVERNORATES.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </Field>
              <Field label="City / Area" error={errors.city}>
                <TextInput value={address.city} onChange={set('city')} autoComplete="address-level2" {...err('city')} />
              </Field>
              <Field label="Street address" error={errors.address} className="sm:col-span-2">
                <TextInput
                  value={address.address}
                  onChange={set('address')}
                  placeholder="Building, street, floor, apartment"
                  autoComplete="street-address"
                  {...err('address')}
                />
              </Field>
              <Field label="Order notes (optional)" className="sm:col-span-2">
                <textarea value={address.notes} onChange={set('notes')} rows={3} className={`${inputClass} h-auto py-3`} />
              </Field>
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-4 text-[13px] font-semibold tracking-[0.14em] uppercase">Payment</legend>
            <div className="space-y-3" role="radiogroup" aria-label="Payment method">
              {methods.length === 0 && <p className="text-[14px] text-muted">Loading payment options…</p>}
              {methods.map((m) => {
                const info = PAYMENT_LABELS[m] ?? { title: m, text: '' }
                return (
                  <label
                    key={m}
                    className={`flex cursor-pointer items-center gap-3 rounded-[3px] border bg-card p-4 transition ${
                      payment === m ? 'border-olive ring-1 ring-olive' : 'border-line-strong hover:border-ink'
                    }`}
                  >
                    <input type="radio" name="payment" checked={payment === m} onChange={() => setPayment(m)} className="size-4 accent-olive" />
                    <span>
                      <span className="block text-[14px] font-medium">{info.title}</span>
                      {info.text && <span className="block text-[12.5px] text-muted">{info.text}</span>}
                    </span>
                  </label>
                )
              })}
              {!isWoo && <p className="text-[12.5px] text-muted">Card, Meeza and valU payments will be available soon.</p>}
            </div>
          </fieldset>
        </div>

        <aside className="h-fit rounded-lg bg-card p-5 shadow-[0_0_0_1px_rgba(60,45,20,0.06)] lg:sticky lg:top-24">
          <h2 className="text-[13px] font-semibold tracking-[0.14em] uppercase">Order summary</h2>
          <ul className="mt-4 divide-y divide-line">
            {cart.lines.map((l) => (
              <li key={l.key} className="flex items-center gap-3 py-3">
                <div className="relative shrink-0">
                  <img src={l.product.images[0].src} alt="" className="size-14 rounded object-cover" />
                  <span className="absolute -top-2 -right-2 grid size-5 place-items-center rounded-full bg-ink text-[10px] text-cream">{l.quantity}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-[15px] uppercase">{l.product.name}</p>
                  <p className="text-[12px] text-muted">
                    {l.variation.size}
                    {l.giftMessage && ' · Gift'}
                  </p>
                </div>
                <p className="text-[14px] font-medium">{formatPrice(l.lineTotal)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-2 border-t border-line pt-4 text-[14px]">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>{quoting ? 'Calculating…' : noDelivery ? '—' : shipping === 0 ? 'Free' : formatPrice(shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-[17px] font-semibold">
              <dt>Total</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>
          {noDelivery && (
            <p className="mt-4 text-[13px] text-red-800">We don’t deliver to {address.governorate} yet. Please contact us.</p>
          )}
          {formError && (
            <p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-[13px] text-red-800">
              {formError}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting || quoting || noDelivery}
            className="mt-5 h-[52px] w-full rounded-[3px] bg-olive text-[12.5px] font-medium tracking-[0.12em] text-cream uppercase transition hover:bg-olive-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Placing order…' : 'Place order'}
          </button>
        </aside>
      </form>
    </div>
  )
}
