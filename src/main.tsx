import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { loadCatalog } from './api/catalog'
import { isWoo } from './api/wp'

const root = createRoot(document.getElementById('root')!)

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

// App is imported after the WordPress settings are applied, so modules that
// read contact details or social links at load time see the real values.
async function render() {
  const { default: App } = await import('./App.tsx')
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

const fail = (e: unknown) => root.render(<Splash error={e instanceof Error ? e.message : String(e)} />)

if (isWoo) {
  root.render(<Splash />)
  loadCatalog().then(render).catch(fail)
} else {
  render().catch(fail)
}
