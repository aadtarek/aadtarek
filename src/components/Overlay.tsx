import { useEffect, type ReactNode } from 'react'

/** Backdrop + Escape handling + scroll lock shared by drawers and modals. */
export function Overlay({
  onClose,
  children,
  label,
  leaving = false,
}: {
  onClose: () => void
  children: ReactNode
  label: string
  /** Fades the backdrop out while the panel animates away. */
  leaving?: boolean
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={label}>
      <div className={`absolute inset-0 bg-ink/45 backdrop-blur-[3px] ${leaving ? 'rf-backdrop-leave' : 'animate-fade-in'}`} onClick={onClose} />
      {children}
    </div>
  )
}
