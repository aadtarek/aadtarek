import { Component, type ErrorInfo, type ReactNode } from 'react'
import { clearSiteStorage } from '../lib/storage'

interface State {
  error: Error | null
}

/**
 * Last line of defence: if a page throws while rendering, show a helpful
 * screen (with the error text, so it can be reported) instead of a blank page.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Rfaheya page error:', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand px-4 py-16 text-center">
        <div className="max-w-lg">
          <p className="text-[12px] tracking-[0.3em] text-ink-soft uppercase">Rfaheya</p>
          <h1 className="mt-3 font-serif text-[40px] leading-tight">Something went wrong.</h1>
          <p className="mt-3 text-ink-soft">
            This page couldn’t load. Resetting the saved data usually fixes it — your cart and wishlist will be cleared.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                clearSiteStorage()
                window.location.assign('/')
              }}
              className="h-12 rounded-[3px] bg-olive px-8 text-[12px] font-medium tracking-[0.12em] text-cream uppercase hover:bg-olive-hover"
            >
              Reset and reload
            </button>
            <button
              type="button"
              onClick={() => window.location.assign('/')}
              className="h-12 rounded-[3px] border border-ink/70 px-8 text-[12px] font-medium tracking-[0.12em] uppercase hover:bg-ink hover:text-cream"
            >
              Back to home
            </button>
          </div>
          <pre className="mt-8 overflow-x-auto rounded-md bg-card p-4 text-left text-[12px] whitespace-pre-wrap text-muted">
            {error.name}: {error.message}
          </pre>
        </div>
      </div>
    )
  }
}
