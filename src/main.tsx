import { createRoot } from 'react-dom/client'
import './index.css'
import { loadCatalog, markCatalogReady, restoreCatalog } from './api/catalog'
import { fetchPosts } from './api/content'
import { isWoo } from './api/wp'
import App from './App.tsx'
import { applyStoreSettings } from './config'
import { NO_PRODUCTS } from './routeTable'
import { preloadRoute } from './routes'

const container = document.getElementById('root')!
const root = createRoot(container)

function Splash({ error }: { error?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-sand px-6 text-center">
      <p className="font-serif text-[40px] tracking-[0.02em]">Rfaheya</p>
      <p className="mt-1 text-[11px] tracking-[0.4em] text-gold uppercase">Speak your scent</p>
      {error ? (
        <>
          <p className="mt-8 max-w-sm text-ink-soft">We couldn’t load the store right now. Please check your connection and try again.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 h-12 rounded-full bg-olive px-8 text-[12px] font-medium tracking-[0.12em] text-on-accent uppercase"
          >
            Try again
          </button>
          <p className="mt-6 text-[12px] text-muted">{error}</p>
        </>
      ) : (
        <span aria-label="Loading" className="mt-8 block h-[3px] w-24 overflow-hidden rounded-full bg-line">
          <span className="block h-full w-1/3 animate-[splash_1.1s_ease-in-out_infinite] rounded-full bg-olive" />
        </span>
      )}
    </div>
  )
}

const fail = (e: unknown) => root.render(<Splash error={e instanceof Error ? e.message : String(e)} />)

// The hash-router preview keeps the path after "#".
const path = import.meta.env.VITE_HASH_ROUTER ? window.location.hash.replace(/^#/, '') || '/' : window.location.pathname
// The dashboard settings (logo size, announcements…) before the first view, so nothing changes after.
if (window.__rfSettings) applyStoreSettings(window.__rfSettings)

function start() {
  // The journal's posts download alongside, so its first render already has them.
  if (isWoo && /^\/journal\/?$/.test(path)) fetchPosts().catch(() => undefined)
  // The storefront shows straight away (with a short placeholder, App.tsx); the pages follow once the products are in.
  container.setAttribute('data-app', '')
  // A page that opens without the products: its code first (already downloading), so the first
  // view is the page itself — a loading placeholder would be held on screen for a moment.
  if (NO_PRODUCTS.test(path)) preloadRoute(path).catch(() => undefined).then(() => root.render(<App />))
  else root.render(<App />)
  if (isWoo && !window.__rfBoot && restoreCatalog()) {
    // A returning visitor: the shop shows from the browser's copy right away; the fresh catalogue
    // replaces it once downloaded (a failed download keeps the copy).
    preloadRoute(path)
      .catch(() => undefined)
      .then(markCatalogReady)
    loadCatalog()
      .then(markCatalogReady)
      .catch(() => undefined)
  } else if (NO_PRODUCTS.test(path)) {
    // This page opens without the products: they are read once it is on screen.
    // (On the visitor's first touch, scroll or key, or a couple of seconds after the page has loaded.)
    preloadRoute(path).catch(() => undefined)
    let started = false
    const later = () => {
      if (started) return
      started = true
      loadCatalog().then(markCatalogReady).catch(fail)
    }
    for (const type of ['pointerdown', 'keydown', 'scroll', 'touchstart']) window.addEventListener(type, later, { once: true, passive: true })
    const wait = () => setTimeout(later, 2500)
    if (document.readyState === 'complete') wait()
    else window.addEventListener('load', wait, { once: true })
  } else {
    Promise.all([loadCatalog(), preloadRoute(path).catch(() => undefined)])
      .then(markCatalogReady)
      .catch(fail)
  }
}

// The shop data (window.__rfBoot) is at the end of the page: wait until the page is read
// (this file can be started early, before the first screen is drawn — see vite.config.ts).
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true })
else start()
