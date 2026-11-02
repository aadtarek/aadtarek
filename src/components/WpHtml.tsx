import { useMemo, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'

const DROP = 'script,style,iframe:not([src^="https://www.youtube.com/"]):not([src^="https://www.youtube-nocookie.com/"]):not([src^="https://player.vimeo.com/"]),object,embed,form,input,button,textarea,select,meta,link,base,frame,frameset'

/**
 * Keeps only safe markup: no scripts, event handlers, forms or `javascript:` links, and
 * iframes only from YouTube / Vimeo. The editor's content should already be clean; this
 * makes sure a compromised or careless edit can't run code in a customer's browser.
 */
export function cleanHtml(html: string) {
  if (typeof DOMParser === 'undefined') return ''
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html')
  doc.body.querySelectorAll(DROP).forEach((el) => el.remove())
  doc.body.querySelectorAll('*').forEach((el) => {
    for (const { name, value } of [...el.attributes]) {
      const n = name.toLowerCase()
      const v = value.replace(/[\s\u0000-\u001f]/g, '').toLowerCase()
      if (n.startsWith('on') || n === 'srcdoc' || n === 'formaction') el.removeAttribute(name)
      else if (['href', 'src', 'xlink:href', 'action', 'poster', 'data'].includes(n) && /^(javascript|vbscript|data:(?!image\/(png|jpe?g|gif|webp|avif);))/.test(v)) el.removeAttribute(name)
      else if (n === 'style' && /expression\(|url\(\s*['"]?\s*javascript/i.test(value)) el.removeAttribute(name)
    }
    if (el.tagName === 'A' && el.getAttribute('target') === '_blank') el.setAttribute('rel', 'noopener noreferrer')
  })
  return doc.body.innerHTML
}

/**
 * Content written in the WordPress editor (posts, pages, FAQ answers),
 * styled by `.wp-content` in index.css. Links to storefront pages open
 * without a full page load.
 */
export function WpHtml({ html, className = '' }: { html: string; className?: string }) {
  const navigate = useNavigate()
  const safe = useMemo(() => cleanHtml(html), [html])

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

  return <div className={`wp-content ${className}`} onClick={onClick} dangerouslySetInnerHTML={{ __html: safe }} />
}

export function PageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center" role="status" aria-label="Loading">
      <span className="block h-[3px] w-24 overflow-hidden rounded-full bg-line">
        <span className="block h-full w-1/3 animate-[splash_1.1s_ease-in-out_infinite] rounded-full bg-olive" />
      </span>
    </div>
  )
}
