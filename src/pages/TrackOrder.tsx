import { useState, type FormEvent } from 'react'
import { Field, TextInput } from '../components/Field'
import { PageHeader } from '../components/PageHeader'
import { formatPrice } from '../lib/format'
import { useAccount } from '../store/account'
import type { Order } from '../types'

const digits = (s: string) => s.replace(/\D/g, '').slice(-10)

export function TrackOrder() {
  const { orders } = useAccount()
  const [number, setNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [result, setResult] = useState<Order | null | undefined>(undefined)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const match = orders.find(
      (o) => o.number.toLowerCase() === number.trim().toLowerCase() && digits(o.shippingAddress.phone) === digits(phone),
    )
    setResult(match ?? null)
  }

  return (
    <div className="pb-16">
      <PageHeader eyebrow="Help" title="Track your order." />
      <div className="container-x grid gap-10 lg:grid-cols-[28rem_1fr]">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Order number">
            <TextInput value={number} onChange={(e) => setNumber(e.target.value)} placeholder="RF-123456" required />
          </Field>
          <Field label="Mobile number">
            <TextInput type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01X XXXX XXXX" required />
          </Field>
          <button
            type="submit"
            className="h-[52px] w-full rounded-[3px] bg-olive text-[12.5px] font-medium tracking-[0.12em] text-cream uppercase transition hover:bg-olive-hover"
          >
            Track order
          </button>
        </form>

        <div aria-live="polite">
          {result === null && (
            <p className="rounded-lg border border-line bg-card p-6 text-ink-soft">
              We couldn’t find an order with those details. Please check the order number and mobile number.
            </p>
          )}
          {result && (
            <div className="rounded-lg border border-line bg-card p-6">
              <p className="text-[12px] tracking-[0.14em] text-muted uppercase">Order {result.number}</p>
              <ol className="mt-5 grid grid-cols-4 gap-2 text-center text-[12px] tracking-[0.06em] uppercase">
                {['Received', 'Processing', 'Shipped', 'Delivered'].map((step, i) => (
                  <li key={step}>
                    <span className={`mx-auto block h-1.5 rounded-full ${i <= 1 ? 'bg-olive' : 'bg-line'}`} />
                    <span className={`mt-2 block ${i <= 1 ? 'text-ink' : 'text-muted'}`}>{step}</span>
                  </li>
                ))}
              </ol>
              <ul className="mt-6 divide-y divide-line text-[14px]">
                {result.items.map((i) => (
                  <li key={`${i.productId}-${i.variationId}`} className="flex justify-between py-2">
                    <span>
                      {i.name} ({i.size}) × {i.quantity}
                    </span>
                    <span>{formatPrice(i.price * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 flex justify-between border-t border-line pt-3 font-semibold">
                <span>Total</span>
                <span>{formatPrice(result.total)}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
