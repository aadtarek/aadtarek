import { useEffect } from 'react'
import { usePersistentState } from './storage'

export type Theme = 'light' | 'dark'

/** Light / dark theme; index.html applies the saved choice before the first paint. */
export function useTheme() {
  const [theme, setTheme] = usePersistentState<Theme>('rfaheya.theme', 'light', (raw) => (raw === 'dark' || raw === 'light' ? raw : undefined))
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.background = theme === 'dark' ? '#14120f' : ''
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#14120f' : '#2a2f1b')
  }, [theme])
  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))] as const
}
