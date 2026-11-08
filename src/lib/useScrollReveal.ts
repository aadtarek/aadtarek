import { useEffect, type RefObject } from 'react'

const STAGGER_MS = 90

/**
 * Sleek-style reveals: sections below the fold and each product card fade up softly the
 * first time they scroll into view; cards arriving together follow one another.
 * Content already on screen when the page opens is left as it is.
 */
export function useScrollReveal(root: RefObject<HTMLElement | null>, route: string) {
  useEffect(() => {
    const element = root.current
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!element || preference.matches || !('IntersectionObserver' in window)) return
    const tracked = new Set<Element>()
    const observer = new IntersectionObserver((entries) => {
      let order = 0
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const target = entry.target as HTMLElement
        if (target.classList.contains('rf-card')) target.style.setProperty('--rf-d', `${Math.min(order++, 5) * STAGGER_MS}ms`)
        target.classList.add('reveal-visible')
        observer.unobserve(target)
      })
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' })
    // Where each one is when it first appears, read by the browser with its own layout
    // (measuring every section here would force extra layouts while the page starts).
    const firstSight = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        firstSight.unobserve(entry.target)
        if (entry.isIntersecting) return
        entry.target.classList.add('scroll-reveal')
        observer.observe(entry.target)
      })
    })
    let started = false
    const track = (target: Element) => {
      if (tracked.has(target)) return
      tracked.add(target)
      // Cards that mount later (filters, more products) fade in even when on screen.
      if (started && target.classList.contains('rf-card')) {
        target.classList.add('scroll-reveal')
        observer.observe(target)
        return
      }
      firstSight.observe(target)
    }
    const scan = () => {
      element.querySelectorAll('section').forEach((section) => {
        if (!section.parentElement?.closest('section')) track(section)
      })
      element.querySelectorAll('.rf-card').forEach(track)
    }
    scan()
    started = true
    const mutations = new MutationObserver(scan)
    mutations.observe(element, { childList: true, subtree: true })
    const clear = () => {
      observer.disconnect()
      firstSight.disconnect()
      mutations.disconnect()
      tracked.forEach((target) => {
        target.classList.remove('scroll-reveal', 'reveal-visible')
        ;(target as HTMLElement).style.removeProperty('--rf-d')
      })
    }
    const stopMotion = () => {
      if (preference.matches) clear()
    }
    preference.addEventListener('change', stopMotion)
    return () => {
      preference.removeEventListener('change', stopMotion)
      clear()
    }
  }, [root, route])
}
