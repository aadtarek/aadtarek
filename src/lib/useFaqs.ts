import { fetchFaqs, useWp } from '../api/content'
import { isWoo } from '../api/wp'
import { faqs as demoFaqs } from '../data/faqs'

/** FAQs from WordPress (HTML answers) or the built-in ones (plain text). */
export function useFaqs(): { q: string; html?: string; text?: string }[] {
  const wpFaqs = useWp(isWoo ? 'faqs' : null, fetchFaqs)
  const builtIn = demoFaqs.map((f) => ({ q: f.q, text: f.a }))
  // No FAQs written in the dashboard yet: the built-in ones, so the section is never empty.
  if (!isWoo) return builtIn
  return wpFaqs.data?.length ? wpFaqs.data : wpFaqs.data ? builtIn : []
}
