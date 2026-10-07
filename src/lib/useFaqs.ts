import { fetchFaqs, useWp } from "../api/content";
import { isWoo } from "../api/wp";
import { faqs as demoFaqs } from "../data/faqs";

/** FAQs from WordPress (HTML answers) or the built-in ones (plain text). */
export function useFaqs(): { q: string; html?: string; text?: string }[] {
  const wpFaqs = useWp(isWoo ? "faqs" : null, fetchFaqs);
  return isWoo
    ? (wpFaqs.data ?? [])
    : demoFaqs.map((f) => ({ q: f.q, text: f.a }));
}
