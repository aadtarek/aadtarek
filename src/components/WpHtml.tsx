import type { MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Content written in the WordPress editor (posts, pages, FAQ answers),
 * styled by `.wp-content` in index.css. Links to storefront pages open
 * without a full page load.
 */
export function WpHtml({ html, className = '' }: { html: string; className?: string }) {
  const navigate = useNavigate()

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const a = (e.target as HTMLElement).closest('a')
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return
    const url = new URL(a.href, window.location.href)
    // WordPress-owned URLs (uploads, admin, account) load normally.
    if (url.origin !== window.location.origin || /^\/(wp-|my-account)/.test(url.pathname)) return
    e.preventDefault()
    navigate(url.pathname + url.search + url.hash)
  }

  return <div className={`wp-content ${className}`} onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />
}

export function PageLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Loading">
      <span className="block h-[3px] w-24 overflow-hidden rounded-full bg-line">
        <span className="block h-full w-1/3 animate-[splash_1.1s_ease-in-out_infinite] rounded-full bg-olive" />
      </span>
    </div>
  )
}
