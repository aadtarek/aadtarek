import { useEffect } from 'react'

const DEFAULT = 'Rfaheya — Speak Your Scent'

/** The browser tab's title while a page is open (the server sends the same one on first load). */
export function usePageTitle(title?: string) {
  useEffect(() => {
    if (!title) return
    document.title = title
    return () => {
      document.title = DEFAULT
    }
  }, [title])
}
