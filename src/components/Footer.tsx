import { ArrowRight, Box, Check, ChevronDown, Gift, Truck } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import cta from '../assets/cta.webp'
import wordmark from '../assets/logo-wordmark.svg'
import flag from '../assets/payments/egypt-flag.webp'
import instapay from '../assets/payments/instapay.png'
import mastercard from '../assets/payments/mastercard.png'
import meeza from '../assets/payments/meeza.png'
import valu from '../assets/payments/valu.png'
import visa from '../assets/payments/visa.png'
import { SOCIAL_LINKS } from '../config'
import { usePersistentState } from '../lib/storage'
import { FacebookIcon, InstagramIcon, TikTokIcon, YouTubeIcon } from './SocialIcons'

const columns: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: 'Shop',
    links: [
      { label: 'All Fragrances', to: '/shop' },
      { label: 'New Arrivals', to: '/shop?sort=newest' },
      { label: 'Best Sellers', to: '/shop?sort=best-sellers' },
      { label: 'Perfume Lab (Inspired)', to: '/collections/perfume-lab' },
      { label: 'Ledger (Men)', to: '/collections/ledger' },
      { label: 'Serenity (Women)', to: '/collections/serenity' },
      { label: 'Discovery Sets', to: '/collections/discovery-sets' },
      { label: 'Gift Boxes', to: '/collections/gift-boxes' },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'Our Story', to: '/about' },
      { label: 'Rfaheya Standard™', to: '/our-standard' },
      { label: 'Ingredients & Quality', to: '/ingredients' },
      { label: 'Sustainability', to: '/sustainability' },
      { label: 'Blog', to: '/journal' },
      { label: 'Contact Us', to: '/contact' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'FAQs', to: '/faqs' },
      { label: 'Shipping & Delivery', to: '/shipping' },
      { label: 'Returns & Refunds', to: '/returns' },
      { label: 'Track Your Order', to: '/track-order' },
      { label: 'Size Guide', to: '/size-guide' },
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms & Conditions', to: '/terms' },
    ],
  },
]

// Read when rendering: the links come from the WordPress settings loaded at start-up.
const socials = () => [
  { label: 'Instagram', href: SOCIAL_LINKS.instagram, Icon: InstagramIcon },
  { label: 'TikTok', href: SOCIAL_LINKS.tiktok, Icon: TikTokIcon },
  { label: 'YouTube', href: SOCIAL_LINKS.youtube, Icon: YouTubeIcon },
  { label: 'Facebook', href: SOCIAL_LINKS.facebook, Icon: FacebookIcon },
]

const payments = [
  { src: visa, alt: 'Visa', h: 'h-[21px]', w: 168, hh: 63 },
  { src: mastercard, alt: 'Mastercard', h: 'h-[30px]', w: 144, hh: 90 },
  { src: meeza, alt: 'Meeza', h: 'h-[31px]', w: 156, hh: 93 },
  { src: instapay, alt: 'InstaPay', h: 'h-[30px]', w: 180, hh: 90 },
  { src: valu, alt: 'valU', h: 'h-[30px]', w: 180, hh: 90 },
]

export function Footer({ showCta = true }: { showCta?: boolean }) {
  return (
    <footer className="bg-footer">
      {showCta && <CtaBanner />}
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-[45px]">
        <div className="h-px bg-line-strong/50" />
        <div className="grid gap-10 py-10 md:grid-cols-2 xl:grid-cols-[minmax(0,0.85fr)_1px_minmax(0,1.45fr)_1px_minmax(0,1fr)] xl:gap-0 xl:pt-[47px] xl:pb-[40px]">
          <BrandColumn />
          <span aria-hidden className="hidden bg-line-strong/60 xl:block" />
          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-[1.05fr_1fr_1fr] md:order-last md:col-span-2 xl:order-none xl:col-span-1 xl:gap-4 xl:pr-4 xl:pl-[41px]">
            {columns.map((c) => (
              <div key={c.title}>
                <h2 className="text-[15px] font-medium tracking-[0.15em] uppercase">{c.title}</h2>
                <ul className="mt-[13px] space-y-[7px]">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <Link to={l.to} className="text-[15.5px] leading-[21.5px] text-ink-soft transition hover:text-ink hover:underline hover:underline-offset-4">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          <span aria-hidden className="hidden bg-line-strong/60 xl:block" />
          <Newsletter />
        </div>
        <div className="h-px bg-line-strong/50" />
        <BottomBar />
      </div>
    </footer>
  )
}

function CtaBanner() {
  return (
    <section aria-labelledby="cta-title" className="relative flex flex-col overflow-hidden">
      <img
        src={cta}
        alt="Rfaheya Vanilla Oud on a stone plinth with vanilla, amber and oud wood"
        loading="lazy"
        className="order-2 h-56 w-full object-cover object-[78%_center] xs:h-64 md:absolute md:inset-0 md:order-none md:h-full md:object-right"
      />
      <div className="relative mx-auto flex w-full max-w-[1600px] flex-col justify-center px-4 pt-10 pb-6 sm:px-6 md:min-h-[347px] md:py-10 lg:px-[100px]">
        <p className="text-[12px] tracking-[0.3em] text-ink-soft uppercase sm:text-[16px]">Speak your scent</p>
        <h2 id="cta-title" className="mt-3 max-w-[9.5em] font-serif text-[38px] leading-[1.04] sm:text-[56px] lg:mt-[10px] lg:text-[62px]">
          Find the fragrance that feels like you.
        </h2>
        <Link
          to="/shop"
          className="group mt-6 inline-flex h-[56px] items-center gap-4 self-start rounded-[4px] bg-olive px-[58px] text-[14px] font-medium tracking-[0.15em] text-cream uppercase transition hover:bg-olive-hover sm:text-[15.5px] lg:mt-[22px]"
        >
          Shop fragrances
          <ArrowRight className="size-[19px] transition group-hover:translate-x-1" strokeWidth={1.5} />
        </Link>
      </div>
    </section>
  )
}

function BrandColumn() {
  return (
    <div className="xl:pr-8 xl:pl-[50px]">
      <Link to="/" aria-label="Rfaheya — home" className="block w-[192px]">
        <img src={wordmark} alt="Rfaheya" width={1098} height={223} loading="lazy" className="h-auto w-full" />
      </Link>
      <p className="mt-[22px] text-[15px] tracking-[0.42em] text-muted uppercase">Speak your scent</p>
      <p className="mt-[24px] max-w-[302px] text-[16px] leading-[1.45] text-ink-soft">
        Inspired fragrances with high performance and honest craftsmanship. Created for people who appreciate great scents,
        every day.
      </p>
      <ul className="mt-[22px] flex gap-[22px]">
        {socials().map(({ label, href, Icon }) => (
          <li key={label}>
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={`Rfaheya on ${label}`}
              className="grid size-[44px] place-items-center rounded-full border border-line-strong text-ink transition hover:border-olive hover:bg-olive hover:text-cream"
            >
              <Icon className="size-[20px]" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Newsletter() {
  const [email, setEmail] = useState('')
  const [subscribers, setSubscribers] = usePersistentState<string[]>('rfaheya.newsletter', [])
  const [status, setStatus] = useState<'idle' | 'invalid' | 'done' | 'exists'>('idle')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const value = email.trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(value)) return setStatus('invalid')
    if (subscribers.includes(value)) return setStatus('exists')
    setSubscribers([...subscribers, value])
    setEmail('')
    setStatus('done')
  }

  const perks = [
    { Icon: Truck, text: ['Free Shipping', 'over 1,000 EGP'] },
    { Icon: Box, text: ['Easy Returns', 'Even If Used'] },
    { Icon: Gift, text: ['Exclusive Offers', '& Early Access'] },
  ]

  return (
    <div className="xl:pr-[25px] xl:pl-[55px]">
      <h2 className="text-[15px] font-medium tracking-[0.15em] uppercase">Join our scent circle</h2>
      <p className="mt-[12px] max-w-[330px] text-[15.5px] leading-[1.5] text-ink-soft">
        Be the first to know about new releases, exclusive offers, and fragrance insights.
      </p>
      <form onSubmit={submit} noValidate className="mt-[14px]">
        <div className="flex h-[45px] items-center rounded-full border border-line-strong bg-footer pl-[17px] focus-within:border-olive">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setStatus('idle')
            }}
            placeholder="Your email address"
            autoComplete="email"
            aria-invalid={status === 'invalid'}
            className="min-w-0 flex-1 bg-transparent text-[14.5px] outline-none placeholder:text-muted"
          />
          <button
            type="submit"
            aria-label="Subscribe"
            className="-mr-px grid size-[47px] shrink-0 place-items-center rounded-full bg-olive text-cream transition hover:bg-olive-hover"
          >
            <ArrowRight className="size-[18px]" strokeWidth={1.5} />
          </button>
        </div>
        <p aria-live="polite" className={`mt-2 min-h-[18px] text-[12.5px] ${status === 'invalid' ? 'text-red-700' : 'text-olive'}`}>
          {status === 'invalid' && 'Please enter a valid email address.'}
          {status === 'done' && 'Welcome to the scent circle — check your inbox soon.'}
          {status === 'exists' && 'You’re already subscribed.'}
        </p>
      </form>
      <ul className="mt-1 grid grid-cols-3 gap-2 text-center">
        {perks.map(({ Icon, text }) => (
          <li key={text[0]} className="flex flex-col items-center">
            <Icon className="size-[38px] text-ink-soft" strokeWidth={1.1} />
            <span className="mt-[8px] text-[13.5px] leading-[1.5] text-ink-soft">
              {text[0]}
              <br />
              {text[1]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function BottomBar() {
  return (
    <div className="flex flex-col gap-5 py-6 sm:flex-row sm:items-center sm:justify-between lg:h-[82px] lg:py-0 lg:pl-[45px]">
      <p className="text-[14px] text-ink-soft">© {new Date().getFullYear()} Rfaheya. All rights reserved.</p>
      <div className="flex flex-wrap items-center gap-x-[20px] gap-y-3">
        <ul className="flex flex-wrap items-center gap-[20px]" aria-label="Accepted payment methods">
          {payments.map((p) => (
            <li key={p.alt}>
              <img src={p.src} alt={p.alt} width={p.w} height={p.hh} className={`${p.h} w-auto`} loading="lazy" />
            </li>
          ))}
        </ul>
        <CurrencyPicker />
      </div>
    </div>
  )
}

function CurrencyPicker() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <div ref={ref} className="relative ml-auto sm:ml-[48px]">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-[10px] rounded px-1 py-1 text-[15px]"
      >
        <img src={flag} alt="" width={30} height={30} loading="lazy" className="size-[30px]" />
        EGP
        <ChevronDown className={`size-4 transition ${open ? 'rotate-180' : ''}`} strokeWidth={1.5} />
      </button>
      {open && (
        <ul role="listbox" className="absolute right-0 bottom-full mb-2 w-56 animate-fade-in rounded-lg border border-line bg-card p-1.5 shadow-xl">
          <li role="option" aria-selected className="flex items-center gap-3 rounded-md bg-chip px-3 py-2 text-[14px]">
            <img src={flag} alt="" width={20} height={20} loading="lazy" className="size-5" />
            <span className="flex-1">EGP — Egyptian Pound</span>
            <Check className="size-4" />
          </li>
        </ul>
      )}
    </div>
  )
}
