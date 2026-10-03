import { useEffect, type RefObject } from 'react'

/** Animate sections once, keeping their content visible and keyboard accessible. */
export function useScrollReveal(root: RefObject<HTMLElement | null>, route: string) {
  useEffect(() => {
    const element = root.current
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!element || preference.matches || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('reveal-visible')
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.08 })
    const sections = Array.from(element.querySelectorAll('section'))
      .filter((section) => !section.parentElement?.closest('section'))
    sections.forEach((section) => {
      section.classList.add('scroll-reveal')
      if (section.getBoundingClientRect().top < window.innerHeight) section.classList.add('reveal-visible')
      else observer.observe(section)
    })
    const stopMotion = () => {
      if (!preference.matches) return
      observer.disconnect()
      sections.forEach((section) => section.classList.remove('scroll-reveal', 'reveal-visible'))
    }
    preference.addEventListener('change', stopMotion)
    return () => {
      observer.disconnect()
      preference.removeEventListener('change', stopMotion)
      sections.forEach((section) => section.classList.remove('scroll-reveal', 'reveal-visible'))
    }
  }, [root, route])
}
