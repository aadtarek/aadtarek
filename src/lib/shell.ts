/**
 * index.html draws the phone's first screen (bar, logo, first slide picture) before the
 * storefront has started; it is faded out once the real page is on screen.
 */
export function hideShell() {
  ;(window as { __rfShellOff?: () => void }).__rfShellOff?.()
}
