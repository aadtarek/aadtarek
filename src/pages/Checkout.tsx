import { Banknote, Check, CheckCircle2, ChevronDown, CreditCard, Lock, ShieldCheck, Smartphone, Truck, X } from 'lucide-react'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PAYMENT_LABELS, placeWooOrder, updateCustomer } from '../api/checkout'
import { isWoo, money } from '../api/wp'
import { Field, TextInput } from '../components/Field'
import { OfferBar } from '../components/OfferBar'
import { PointsPanel } from '../components/PointsPanel'
import { CONTACT, GOVERNORATES, SPEND_OFFER, shippingCost } from '../config'
import { formatPrice } from '../lib/format'
import { confetti, haptic } from '../lib/fx'
import { useAccount } from '../store/account'
import { useCart } from '../store/cart'
import { useRewards } from '../store/rewards'
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
  const rewards = useRewards()
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

  // Phones: the order bar takes the tab bar's place on this page.
  useEffect(() => {
    const root = document.documentElement
    root.dataset.stickyBuy = ''
    return () => {
      delete root.dataset.stickyBuy
    }
  }, [])

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
  const discount = cart.discount
  const offerDiscount = cart.offerDiscount
  const shipping = wooCart ? money(wooCart.totals.total_shipping ?? '0', minor) : shippingCost(cart.subtotal - discount, address.governorate)
  const wrapOn = cart.giftWrap.available && cart.giftWrap.on
  // WooCommerce's total already has the gift wrap (it's a hidden product in the cart).
  const total = wooCart
    ? money(wooCart.totals.total_price, minor)
    : Math.max(0, subtotal - discount - offerDiscount - rewards.couponTotal) + shipping + (wrapOn ? cart.giftWrap.price : 0)

  // Signed in: fill in the customer's details (orders are linked to the account by email).
  const { me } = rewards
  useEffect(() => {
    if (!me.loggedIn) return
    setAddress((a) => ({
      ...a,
      firstName: a.firstName || me.firstName || '',
      lastName: a.lastName || me.lastName || '',
      email: a.email || me.email || '',
      phone: a.phone || me.phone || '',
    }))
  }, [me.loggedIn, me.firstName, me.lastName, me.email, me.phone])
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
    rewards.orderPlaced()
    cart.clear()
    setPlaced(saved)
    confetti()
    haptic([12, 60, 18])
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

    const gifts = cart.lines.filter((l) => l.giftMessage).map((l) => `${l.product.name} (${l.variation.size}): ${l.giftMessage}`)
    const note = [address.notes.trim(), ...gifts].filter(Boolean).join('\n\n')
    setSubmitting(true)
    try {
      const result = await placeWooOrder(address, payment, note)
      if (result.payment_result?.payment_status === 'failure') throw new Error('Payment failed. Please try another method.')
      // Signed in: the order belongs to the account (points, first-order discount), whatever email was typed.
      await rewards.claimOrder(result.order_id, result.order_key)
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
          className="mt-8 inline-flex h-12 items-center rounded-full bg-olive px-8 text-[12px] font-medium tracking-[0.12em] text-on-accent uppercase hover:bg-olive-hover"
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
          className="mt-6 inline-flex h-12 items-center rounded-full bg-olive px-8 text-[12px] font-medium tracking-[0.12em] text-on-accent uppercase hover:bg-olive-hover"
        >
          Shop fragrances
        </Link>
      </div>
    )
  }

  const err = (k: keyof ShippingAddress) => ({ 'aria-invalid': Boolean(errors[k]) })
  const wrapAmount = wrapOn ? cart.giftWrap.price : 0
  // WooCommerce counts the gift wrap among the items; it shows on its own line here.
  const itemsTotal = wooCart ? subtotal - wrapAmount : subtotal
  const grandTotal = total
  const QUICK_GOVERNORATES = ['Cairo', 'Giza', 'Alexandria']
  const otherGov = !QUICK_GOVERNORATES.includes(address.governorate)
  const pickGov = (g: string) => set('governorate')({ target: { value: g } })
  const placeLabel = submitting ? 'Placing order…' : `Place order · ${formatPrice(grandTotal)}`
  const blocked = submitting || quoting || noDelivery

  return (
    <div className="container-x pb-28 lg:pb-20">
      <div className="pt-6 lg:pt-8">
        <p className="text-[11px] font-semibold tracking-[0.24em] text-gold uppercase">Almost yours</p>
        <h1 className="mt-2.5 font-serif text-[44px] leading-[0.95] sm:text-[64px]">Checkout</h1>
        <ol className="mt-5 flex flex-wrap gap-2 text-[12px] font-semibold" aria-label="Steps">
          <li className="flex items-center gap-2 rounded-full bg-chip py-1.5 pr-4 pl-1.5 text-muted">
            <span className="grid size-[26px] place-items-center rounded-full bg-olive text-white">
              <Check className="size-3.5" strokeWidth={2.4} />
            </span>
            Bag
          </li>
          <li aria-current="step" className="flex items-center gap-2 rounded-full bg-[#14110d] py-1.5 pr-4 pl-1.5 text-white">
            <span className="grid size-[26px] place-items-center rounded-full bg-white text-[#14110d]">2</span>
            Details
          </li>
          <li className="flex items-center gap-2 rounded-full bg-chip py-1.5 pr-4 pl-1.5 text-muted">
            <span className="grid size-[26px] place-items-center rounded-full bg-white">3</span>
            Payment
          </li>
        </ol>
      </div>

      <form id="checkout-form" onSubmit={submit} noValidate className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start lg:gap-7">
        <div className="space-y-3.5">
          <Box num={1} title="Contact">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Mobile number" error={errors.phone}>
                <TextInput type="tel" inputMode="tel" placeholder="01X XXXX XXXX" value={address.phone} onChange={set('phone')} autoComplete="tel" {...err('phone')} />
              </Field>
              <Field label={isWoo ? 'Email' : 'Email (optional)'} error={errors.email}>
                <TextInput type="email" placeholder="For your receipt" value={address.email} onChange={set('email')} autoComplete="email" {...err('email')} />
              </Field>
            </div>
          </Box>

          <Box num={2} title="Delivery">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="First name" error={errors.firstName}>
                <TextInput value={address.firstName} onChange={set('firstName')} autoComplete="given-name" {...err('firstName')} />
              </Field>
              <Field label="Last name" error={errors.lastName}>
                <TextInput value={address.lastName} onChange={set('lastName')} autoComplete="family-name" {...err('lastName')} />
              </Field>
            </div>
            <div className="mt-4" role="radiogroup" aria-label="Governorate">
              <p className="mb-2 text-[11.5px] font-semibold text-muted">Governorate</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_GOVERNORATES.map((g) => (
                  <button
                    key={g}
                    type="button"
                    role="radio"
                    aria-checked={address.governorate === g}
                    onClick={() => pickGov(g)}
                    className={`h-10 rounded-full px-[18px] text-[13px] font-medium transition ${address.governorate === g ? 'bg-[#14110d] text-white' : 'bg-sand text-ink-soft hover:bg-chip'}`}
                  >
                    {g}
                  </button>
                ))}
                <label className={`relative rounded-full transition ${otherGov ? 'bg-[#14110d] text-white' : 'bg-sand text-ink-soft hover:bg-chip'}`}>
                  <span className="sr-only">Other governorate</span>
                  <select
                    value={otherGov ? address.governorate : ''}
                    onChange={(e) => e.target.value && pickGov(e.target.value)}
                    className="h-10 cursor-pointer appearance-none rounded-full bg-transparent pr-9 pl-[18px] text-[13px] font-medium outline-none"
                  >
                    <option value="" disabled>
                      Other…
                    </option>
                    {GOVERNORATES.filter((g) => !QUICK_GOVERNORATES.includes(g)).map((g) => (
                      <option key={g} value={g} className="text-ink">
                        {g}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" strokeWidth={1.6} />
                </label>
              </div>
              {errors.governorate && <p className="mt-1 text-[12px] text-red-700">{errors.governorate}</p>}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="City / area" error={errors.city}>
                <TextInput value={address.city} onChange={set('city')} autoComplete="address-level2" {...err('city')} />
              </Field>
              <Field label="Street, building, floor" error={errors.address}>
                <TextInput value={address.address} onChange={set('address')} placeholder="Building, street, floor, apartment" autoComplete="street-address" {...err('address')} />
              </Field>
            </div>
            <Field label="Notes for the courier (optional)" className="mt-4">
              <TextInput value={address.notes} onChange={set('notes')} placeholder="Landmark, best time to call…" />
            </Field>
          </Box>

          <Box num={3} title="Payment">
            <div className="space-y-2.5" role="radiogroup" aria-label="Payment method">
              {methods.length === 0 && <p className="text-[14px] text-muted">Loading payment options…</p>}
              {methods.map((m) => {
                const info = PAYMENT_LABELS[m] ?? { title: m, text: '' }
                const Icon = m === 'cod' ? Banknote : m === 'instapay' || m === 'bacs' ? Smartphone : CreditCard
                return (
                  <label
                    key={m}
                    className={`flex cursor-pointer items-center gap-3.5 rounded-[18px] border-[1.5px] p-4 transition ${
                      payment === m ? 'border-ink bg-sand' : 'border-line-strong hover:border-ink'
                    }`}
                  >
                    <input type="radio" name="payment" checked={payment === m} onChange={() => setPayment(m)} className="size-[18px] accent-[#e49b2d]" />
                    <Icon className="size-[22px] shrink-0 text-gold" strokeWidth={1.4} />
                    <span>
                      <span className="block text-[14.5px] font-semibold">{info.title}</span>
                      {info.text && <span className="block text-[12.5px] text-muted">{info.text}</span>}
                    </span>
                  </label>
                )
              })}
              {!isWoo && (
                <div className="flex items-center gap-3.5 rounded-[18px] border-[1.5px] border-line-strong p-4 opacity-45">
                  <span className="size-[18px] rounded-full border-[1.5px] border-line-strong" />
                  <CreditCard className="size-[22px] text-gold" strokeWidth={1.4} />
                  <span>
                    <span className="block text-[14.5px] font-semibold">Card · Meeza · valU</span>
                    <span className="block text-[12.5px] text-muted">Coming soon</span>
                  </span>
                </div>
              )}
            </div>
          </Box>
        </div>

        <aside className="rf-white order-first rounded-[26px] border border-line p-5 sm:p-6 lg:sticky lg:top-24 lg:order-none lg:rounded-[28px]">
          <h2 className="flex items-baseline justify-between font-serif text-[26px] leading-none">
            Order summary
            <span className="font-sans text-[12.5px] text-muted">
              {cart.count} {cart.count === 1 ? 'item' : 'items'}
            </span>
          </h2>
          <OfferBar amount={itemsTotal - discount} className="mt-4 rounded-2xl bg-sand px-3.5 pt-3 [--rf-offer-ring:var(--color-sand)]" />
          <ul className="mt-2">
            {cart.lines.map((l) => (
              <li key={l.key} className="flex items-center gap-3 py-2.5">
                <div className="relative shrink-0">
                  <img src={l.product.images[0].src} alt="" className="size-14 rounded-[14px] object-cover" />
                  <span className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-[#14110d] text-[10.5px] font-semibold text-white">{l.quantity}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-serif text-[19px] leading-tight">{l.product.name}</p>
                  <p className="text-[12px] text-muted">
                    {l.variation.size.replace(/\s*ML$/i, ' ml')}
                    {l.giftMessage && ' · Gift'}
                  </p>
                </div>
                <p className="text-[14px] font-semibold">{formatPrice(l.lineTotal)}</p>
              </li>
            ))}
          </ul>

          <PromoCode />

          <dl className="mt-3 space-y-1.5 text-[14px]">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd>{formatPrice(itemsTotal)}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-gold">
                <dt>Bundle discount</dt>
                <dd>−{formatPrice(discount)}</dd>
              </div>
            )}
            {offerDiscount > 0 && (
              <div className="flex justify-between font-medium text-gold">
                <dt>
                  {SPEND_OFFER.percent}% off over {formatPrice(SPEND_OFFER.min)}
                </dt>
                <dd>−{formatPrice(offerDiscount)}</dd>
              </div>
            )}
            {rewards.coupons.map((c) => (
              <div key={c.code} className="flex items-center justify-between gap-2 text-[#55662a]">
                <dt className="flex items-center gap-1.5">
                  {c.label}
                  <button
                    type="button"
                    onClick={() => rewards.removeCoupon(c.code)}
                    aria-label={`Remove ${c.label}`}
                    className="grid size-5 place-items-center rounded-full text-muted hover:bg-chip hover:text-ink"
                  >
                    <X className="size-3.5" />
                  </button>
                </dt>
                <dd>−{formatPrice(c.amount)}</dd>
              </div>
            ))}
            {wrapAmount > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted">Gift wrap</dt>
                <dd>{formatPrice(wrapAmount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted">Shipping · {address.governorate}</dt>
              <dd className={shipping === 0 && !quoting && !noDelivery ? 'text-[#55662a]' : ''}>
                {quoting ? 'Calculating…' : noDelivery ? '—' : shipping === 0 ? 'Free' : formatPrice(shipping)}
              </dd>
            </div>
            <div className="mt-2 flex items-baseline justify-between border-t border-line pt-3">
              <dt className="text-[17px] font-semibold">Total</dt>
              <dd key={grandTotal} className="rf-num-pop text-[21px] font-semibold">
                {formatPrice(grandTotal)}
              </dd>
            </div>
          </dl>
          <PointsPanel total={Math.max(0, grandTotal - shipping)} className="mt-4" />
          {noDelivery && <p className="mt-4 text-[13px] text-red-800">We don’t deliver to {address.governorate} yet. Please contact us.</p>}
          {formError && (
            <p role="alert" className="mt-4 rounded-2xl bg-red-50 p-3 text-[13px] text-red-800">
              {formError}
            </p>
          )}
          <button
            type="submit"
            disabled={blocked}
            className="rf-magnetic mt-5 hidden h-14 w-full items-center justify-center gap-2 rounded-full bg-olive text-[13px] font-semibold tracking-[0.1em] text-white uppercase transition hover:bg-olive-hover disabled:cursor-not-allowed disabled:opacity-60 lg:flex"
          >
            <Lock className="size-4" strokeWidth={1.6} />
            {placeLabel}
          </button>
          <p className="mt-3 hidden justify-center gap-4 text-[11.5px] text-muted lg:flex">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5" strokeWidth={1.6} /> Zero-risk returns
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="size-3.5" strokeWidth={1.6} /> 2–4 days
            </span>
          </p>
        </aside>
      </form>

      {/* Phones: the total and the order button stay at the bottom of the screen. */}
      <div className="fixed inset-x-0 bottom-0 z-30 px-3 pb-[calc(0.6rem+env(safe-area-inset-bottom))] lg:hidden">
        <div className="rf-shop-bar flex items-center gap-3 rounded-full border border-line py-2 pr-2 pl-5">
          <p className="min-w-0 flex-1">
            <span className="block text-[11px] text-muted">Total</span>
            <span className="block text-[17px] font-semibold">{formatPrice(grandTotal)}</span>
          </p>
          <button
            type="submit"
            form="checkout-form"
            disabled={blocked}
            className="flex h-12 shrink-0 items-center gap-1.5 rounded-full bg-olive px-[22px] text-[12px] font-semibold tracking-[0.1em] text-white uppercase disabled:opacity-60"
          >
            <Lock className="size-[15px]" strokeWidth={1.6} />
            {submitting ? 'Placing…' : 'Place order'}
          </button>
        </div>
      </div>
    </div>
  )
}

/** A numbered part of the form, on a white card. */
function Box({ num, title, children }: { num: number; title: string; children: ReactNode }) {
  return (
    <fieldset className="rf-white rounded-[24px] border border-line p-[18px] sm:rounded-[28px] sm:p-6">
      <legend className="sr-only">{title}</legend>
      <p aria-hidden className="mb-4 flex items-center gap-2.5 font-serif text-[26px] leading-none">
        <span className="grid size-7 place-items-center rounded-full bg-chip font-sans text-[12px] font-semibold text-gold">{num}</span>
        {title}
      </p>
      {children}
    </fieldset>
  )
}

/** The promo code box: a WooCommerce coupon, applied to the cart. */
function PromoCode() {
  const rewards = useRewards()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const apply = async () => {
    if (!code.trim()) return
    setBusy(true)
    setError(null)
    try {
      await rewards.applyPromo(code)
      setCode('')
    } catch (e) {
      setError(e instanceof Error ? e.message.replace(/<[^>]+>/g, '') : 'This code can’t be used.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="mt-3">
      <div className="flex gap-2">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Promo code</span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                apply()
              }
            }}
            placeholder="Promo code"
            autoCapitalize="characters"
            className="h-11 w-full rounded-full border-[1.5px] border-line bg-sand px-4 text-[14px] uppercase outline-none placeholder:normal-case focus:border-olive"
          />
        </label>
        <button
          type="button"
          onClick={apply}
          disabled={busy || !code.trim()}
          className="h-11 shrink-0 rounded-full bg-chip px-[18px] text-[12px] font-semibold transition hover:bg-[#14110d] hover:text-white disabled:opacity-50"
        >
          {busy ? '…' : 'Apply'}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-1.5 px-2 text-[12px] text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}
