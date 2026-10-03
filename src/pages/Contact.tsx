import { CheckCircle2, Clock, Mail, MapPin, MessageCircle, Phone, type LucideIcon } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AccordionItem } from '../components/Accordion'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { Field, TextInput, inputClass } from '../components/Field'
import { FacebookIcon, InstagramIcon, TikTokIcon, YouTubeIcon } from '../components/SocialIcons'
import { CONTACT, SOCIAL_LINKS } from '../config'
import { fetchFaqs, useWp } from '../api/content'
import { isWoo } from '../api/wp'
import { WpHtml } from '../components/WpHtml'
import { faqs as demoFaqs } from '../data/faqs'
import { usePersistentState } from '../lib/storage'

const topics = ['Question about a fragrance', 'My order', 'Returns & exchanges', 'Wholesale & gifting', 'Something else']

interface Message {
  name: string
  email: string
  phone: string
  orderNumber: string
  topic: string
  message: string
}

const empty: Message = { name: '', email: '', phone: '', orderNumber: '', topic: topics[0], message: '' }

function validate(m: Message) {
  const e: Partial<Record<keyof Message, string>> = {}
  if (!m.name.trim()) e.name = 'Please tell us your name'
  if (!/^\S+@\S+\.\S+$/.test(m.email)) e.email = 'Enter a valid email'
  if (m.phone && !/^(\+?20)?0?1[0125]\d{8}$/.test(m.phone.replace(/[\s-]/g, ''))) e.phone = 'Enter a valid Egyptian mobile number'
  if (m.message.trim().length < 10) e.message = 'Please write a little more (at least 10 characters)'
  return e
}

export function Contact() {
  const [form, setForm] = useState<Message>(empty)
  const [errors, setErrors] = useState<ReturnType<typeof validate>>({})
  const [sentTo, setSentTo] = useState<string | null>(null)
  // Stand-in for a WordPress form endpoint (e.g. Contact Form 7 REST API).
  const [, setInbox] = usePersistentState<(Message & { date: string })[]>('rfaheya.contact', [])

  const set = (k: keyof Message) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }))
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length) {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      return
    }
    setInbox((prev) => [...prev, { ...form, date: new Date().toISOString() }])
    setSentTo(form.name.split(' ')[0])
    setForm(empty)
  }

  const err = (k: keyof Message) => ({ 'aria-invalid': Boolean(errors[k]) })

  const methods: { Icon: LucideIcon; label: string; value: string; href?: string }[] = [
    { Icon: MessageCircle, label: 'WhatsApp', value: 'Chat with us', href: `https://wa.me/${CONTACT.whatsapp}` },
    { Icon: Mail, label: 'Email', value: CONTACT.email, href: `mailto:${CONTACT.email}` },
    { Icon: Phone, label: 'Phone', value: CONTACT.phone, href: `tel:${CONTACT.phone.replace(/\s/g, '')}` },
    { Icon: Clock, label: 'Hours', value: CONTACT.hours },
    { Icon: MapPin, label: 'Based in', value: CONTACT.location },
  ]

  return (
    <div className="pb-16 lg:pb-24">
      <section className="container-x pt-6 lg:pt-8">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Contact Us' }]} />
        <div className="mt-8 max-w-3xl lg:mt-10">
          <p className="text-[12px] tracking-[0.3em] text-ink-soft uppercase sm:text-[14px]">Contact us</p>
          <h1 className="mt-2 font-serif text-[44px] leading-[1] sm:text-[64px]">We’d love to hear from you.</h1>
          <p className="mt-5 max-w-xl text-[17px] leading-[1.7] text-ink-soft">
            Need help choosing a scent, have a question about an order, or just want to talk fragrance? Our team replies within
            one working day.
          </p>
        </div>
      </section>

      <section className="container-x mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[minmax(0,380px)_1fr] lg:gap-14">
        {/* Methods */}
        <aside className="space-y-[13px]">
          {methods.map(({ Icon, label, value, href }) => {
            const body = (
              <>
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-chip">
                  <Icon className="size-5" strokeWidth={1.4} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[12px] font-semibold tracking-[0.12em] uppercase">{label}</span>
                  <span className="block truncate text-[15.5px] text-ink-soft">{value}</span>
                </span>
              </>
            )
            const cls = 'flex items-center gap-4 rounded-lg border border-line bg-card p-4'
            return href ? (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className={`${cls} transition hover:border-line-strong hover:shadow-[0_10px_24px_-14px_rgba(60,45,20,0.3)]`}
              >
                {body}
              </a>
            ) : (
              <div key={label} className={cls}>
                {body}
              </div>
            )
          })}
          <div className="rounded-lg bg-olive p-6 text-cream">
            <p className="text-[12px] font-semibold tracking-[0.14em] uppercase">Follow the scent</p>
            <ul className="mt-4 flex gap-3">
              {[
                { label: 'Instagram', href: SOCIAL_LINKS.instagram, Icon: InstagramIcon },
                { label: 'TikTok', href: SOCIAL_LINKS.tiktok, Icon: TikTokIcon },
                { label: 'YouTube', href: SOCIAL_LINKS.youtube, Icon: YouTubeIcon },
                { label: 'Facebook', href: SOCIAL_LINKS.facebook, Icon: FacebookIcon },
              ].map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Rfaheya on ${label}`}
                    className="grid size-11 place-items-center rounded-full border border-cream/40 transition hover:bg-cream hover:text-olive"
                  >
                    <Icon className="size-5" />
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[14px] text-cream/75">
              Looking for an order?{' '}
              <Link to="/track-order" className="text-cream underline underline-offset-4">
                Track it here
              </Link>
              .
            </p>
          </div>
        </aside>

        {/* Form */}
        <div className="rounded-lg bg-card p-6 shadow-[0_0_0_1px_rgba(60,45,20,0.06)] sm:p-8 lg:p-10">
          {sentTo ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center" role="status">
              <CheckCircle2 className="size-12 text-olive" strokeWidth={1.2} />
              <h2 className="mt-4 font-serif text-[36px] leading-tight">Thank you, {sentTo}.</h2>
              <p className="mt-2 max-w-md text-ink-soft">Your message is on its way. We’ll get back to you within one working day.</p>
              <button
                type="button"
                onClick={() => setSentTo(null)}
                className="mt-8 inline-flex h-12 items-center rounded-[3px] border border-ink/80 px-8 text-[12px] font-medium tracking-[0.12em] uppercase transition hover:bg-ink hover:text-cream"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <h2 className="font-serif text-[30px] leading-tight sm:text-[36px]">Send us a message</h2>
              <p className="mt-1 text-[14.5px] text-muted">Fields marked * are required.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field label="Full name *" error={errors.name}>
                  <TextInput value={form.name} onChange={set('name')} autoComplete="name" {...err('name')} />
                </Field>
                <Field label="Email *" error={errors.email}>
                  <TextInput type="email" value={form.email} onChange={set('email')} autoComplete="email" {...err('email')} />
                </Field>
                <Field label="Mobile (optional)" error={errors.phone}>
                  <TextInput type="tel" value={form.phone} onChange={set('phone')} placeholder="01X XXXX XXXX" autoComplete="tel" {...err('phone')} />
                </Field>
                <Field label="Order number (optional)">
                  <TextInput value={form.orderNumber} onChange={set('orderNumber')} placeholder="RF-123456" />
                </Field>
                <Field label="Topic" className="sm:col-span-2">
                  <select value={form.topic} onChange={set('topic')} className={inputClass}>
                    {topics.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Message *" error={errors.message} className="sm:col-span-2">
                  <textarea
                    value={form.message}
                    onChange={set('message')}
                    rows={6}
                    placeholder="How can we help?"
                    className={`${inputClass} h-auto py-3`}
                    {...err('message')}
                  />
                </Field>
              </div>
              <button
                type="submit"
                className="mt-6 h-[52px] w-full rounded-[3px] bg-olive text-[12.5px] font-medium tracking-[0.12em] text-cream uppercase transition hover:bg-olive-hover sm:w-auto sm:px-12"
              >
                Send message
              </button>
            </form>
          )}
        </div>
      </section>

      <FaqSection />
    </div>
  )
}

export function FaqSection({ asPage = false }: { asPage?: boolean }) {
  const wpFaqs = useWp(isWoo ? 'faqs' : null, fetchFaqs)
  // WordPress answers are HTML from the editor; the demo answers are plain text.
  const faqs: { q: string; html?: string; text?: string }[] = isWoo ? (wpFaqs.data ?? []) : demoFaqs.map((f) => ({ q: f.q, text: f.a }))
  const Heading = asPage ? 'h1' : 'h2'
  return (
    <section className="container-x mt-16 grid gap-8 lg:mt-24 lg:grid-cols-[minmax(0,380px)_1fr] lg:gap-14" aria-labelledby="faq-title">
      <div>
        <p className="text-[12px] tracking-[0.3em] text-ink-soft uppercase sm:text-[14px]">FAQs</p>
        <Heading id="faq-title" className="mt-2 font-serif text-[38px] leading-[1.05] sm:text-[48px]">
          Good to know.
        </Heading>
        <p className="mt-3 text-[15.5px] leading-[1.65] text-ink-soft">
          Can’t find your answer?{' '}
          <Link to="/contact" className="text-ink underline underline-offset-4">
            Get in touch
          </Link>
          .
        </p>
      </div>
      <div className="border-t border-line">
        {faqs.map((f, i) => (
          <AccordionItem key={f.q} title={f.q} open={i === 0}>
            {f.html !== undefined ? <WpHtml html={f.html} /> : <p>{f.text}</p>}
          </AccordionItem>
        ))}
      </div>
    </section>
  )
}
