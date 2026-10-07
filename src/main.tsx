import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { loadCatalog } from './api/catalog'
import { fetchPosts } from './api/content'
import { isWoo, type StoreSettings } from './api/wp'
import { applyStoreSettings } from './config'
import App from './App.tsx'
import { preloadRoute } from './routes'

const container = document.getElementById('root')!
const root = createRoot(container)

function Splash({ error }: { error?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-sand px-6 text-center">
      <p className="font-serif text-[40px] tracking-[0.02em] uppercase">Rfaheya</p>
      <p className="mt-1 text-[11px] tracking-[0.4em] text-muted uppercase">Speak your scent</p>
      {error ? (
        <>
          <p className="mt-8 max-w-sm text-ink-soft">We couldn’t load the store right now. Please check your connection and try again.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 h-12 rounded-[3px] bg-olive px-8 text-[12px] font-medium tracking-[0.12em] text-cream uppercase"
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

declare global {
  interface Window {
    /** Store settings put in the page by WordPress (rfaheya.php), so the first view already uses them */
    __rfSettings?: StoreSettings
  }
}

let failed = false

function render() {
  if (failed) return
  container.setAttribute('data-app', '')
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

const fail = (e: unknown) => {
  failed = true
  root.render(<Splash error={e instanceof Error ? e.message : String(e)} />)
}

// The hash-router preview keeps the path after "#".
const path = import.meta.env.VITE_HASH_ROUTER ? window.location.hash.replace(/^#/, '') || '/' : window.location.pathname
// The journal's posts download alongside, so its first render already has them.
if (isWoo && /^\/journal\/?$/.test(path)) fetchPosts().catch(() => undefined)
if (window.__rfSettings) applyStoreSettings(window.__rfSettings)
// The page shows as soon as its code is here; the products fill in when they arrive.
loadCatalog().catch(fail)
preloadRoute(path)
  .catch(() => undefined)
  .then(render)
