import { Languages } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { APP_NAME } from '../config'
import { useI18n } from '../i18n'

export function Logo() {
  const { lang } = useI18n()
  return (
    <Link to="/" className="flex items-center gap-2 font-black text-slate-900">
      <img src="./favicon.svg" alt="" className="h-8 w-8" />
      <span className="text-lg">{APP_NAME[lang]}</span>
    </Link>
  )
}

export function LangToggle({ className = '' }: { className?: string }) {
  const { lang, setLang, t } = useI18n()
  return (
    <button
      onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 ${className}`}
    >
      <Languages size={16} /> {t('language')}
    </button>
  )
}

export function Layout({ children }: { children: ReactNode }) {
  const { t } = useI18n()
  const nav = [
    ['/new', t('toolDesign')],
    ['/cv', t('toolCv')],
    ['/remove-bg', t('toolBg')],
    ['/pdf', t('toolPdf')],
  ] as const
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
          <Logo />
          <nav className="hidden flex-1 items-center gap-1 md:flex">
            {nav.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 text-sm font-semibold ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="ms-auto">
            <LangToggle />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
