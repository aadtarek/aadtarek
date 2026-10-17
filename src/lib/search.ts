import { getAllProducts, getFamilies } from '../api/catalog'
import { collections } from '../data/collections'
import { contentPages } from '../data/content'
import { faqs as demoFaqs } from '../data/faqs'
import { articles as demoArticles } from '../data/journal'
import type { FamilySlug, Product } from '../types'
import { GENDERS, OCCASIONS, SEASONS } from './profile'

/**
 * Site search: products, notes, DNA, families, occasions, seasons, collections,
 * pages, FAQs and journal posts in one index. Every word is matched exactly, by
 * its beginning (results while typing) or with typos ("vanila", "oudd"), in
 * English and Arabic, and results are ranked by how well and where they match.
 */

export type HitKind = 'product' | 'dna' | 'note' | 'family' | 'occasion' | 'season' | 'gender' | 'collection' | 'page' | 'faq' | 'post'

export interface SearchDoc {
  id: string
  kind: HitKind
  title: string
  subtitle: string
  to: string
  image?: string
  product?: Product
  /** Text to search with its weight (name 3, aliases 2.5 … body text 0.5). */
  fields: [string | string[], number][]
  /** Small extra rank, e.g. best sellers first. */
  boost?: number
}

export interface SearchHit {
  doc: SearchDoc
  score: number
}

export interface SearchResult {
  hits: SearchHit[]
  /** The query with misspelt words replaced by the closest known word, when different. */
  corrected?: string
}

export interface ExtraContent {
  posts?: { slug: string; title: string; excerpt: string; category: string; image: string; text?: string }[]
  faqs?: { q: string; text?: string; html?: string }[]
}

// ------------------------------------------------------------------ text

const ARABIC_FORMS: [RegExp, string][] = [
  [/[أإآٱ]/g, 'ا'],
  [/ة/g, 'ه'],
  [/ى/g, 'ي'],
  [/ؤ/g, 'و'],
  [/ئ/g, 'ي'],
  [/[ًٌٍَُِّْـ]/g, ''],
]

export function normalize(text: string): string {
  let s = text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  for (const [from, to] of ARABIC_FORMS) s = s.replace(from, to)
  return s.replace(/[^a-z0-9ء-ي]+/g, ' ').trim()
}

/** Words that say nothing about what to find. */
const STOP = new Set(
  'a an the of for and or to in on with my me i im is are am be what which how where your you by from at it its this that do does can could some any please show find want need looking look get give like just very really ل في من علي عن مع او و انا عايز عايزه عاوز عاوزه ابغي ابي اريد بدي ممكن ايه اي هو هي ده دي اللي يا لو'.split(' '),
)
/** Words every fragrance matches: ignored when the query has other words. */
const GENERIC = new Set('perfume perfumes fragrance fragrances scent scents parfum cologne smell عطر عطور برفان بارفان برفيوم ريحه ريحة'.split(' ').map(normalize))

function tokens(text: string): string[] {
  return normalize(text)
    .split(' ')
    .filter(Boolean)
    .map((t) => (t.length > 4 && t.startsWith('ال') ? t.slice(2) : t))
}

/** Optimal string alignment distance (Levenshtein + swapped letters), stopping early past `max`. */
function distance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1
  const rows: number[][] = [Array.from({ length: b.length + 1 }, (_, j) => j)]
  for (let i = 1; i <= a.length; i++) {
    const row = [i]
    let best = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      let v = Math.min(rows[i - 1][j] + 1, row[j - 1] + 1, rows[i - 1][j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, rows[i - 2][j - 2] + 1)
      row.push(v)
      best = Math.min(best, v)
    }
    if (best > max) return max + 1
    rows.push(row)
  }
  return rows[a.length][b.length]
}

const typoAllowance = (q: string) => (q.length <= 3 ? 0 : q.length <= 5 ? 1 : 2)

/** How well one query word matches one indexed word (0 = not at all, 1 = exactly). */
function wordScore(q: string, t: string, last: boolean): { score: number; exact: boolean } {
  if (t === q) return { score: 1, exact: true }
  // The word being typed: match the beginning of longer words.
  if (t.startsWith(q) && (last || q.length >= 3)) return { score: Math.max(0.7, 0.93 - 0.02 * (t.length - q.length)), exact: true }
  if (q.length >= 4 && t.includes(q)) return { score: 0.6, exact: true }
  const max = typoAllowance(q)
  if (max) {
    const d = distance(q, t, max)
    if (d <= max) return { score: 0.82 - 0.14 * d, exact: false }
    // A typo inside the word being typed: "vanl" → "vanilla".
    if (last && t.length > q.length) {
      const p = distance(q, t.slice(0, q.length), 1)
      if (p <= 1) return { score: 0.55, exact: false }
    }
  }
  return { score: 0, exact: false }
}

// ------------------------------------------------------------------ index

interface Indexed {
  doc: SearchDoc
  words: Map<string, number>
  title: string
}

let cache: { key: string; docs: Indexed[]; vocab: Map<string, number> } | undefined

/** English and Arabic names people use for the common notes. */
const NOTE_ALIASES: Record<string, string> = {
  vanilla: 'فانيليا فانيلا',
  oud: 'عود oudh agarwood',
  rose: 'ورد وردة روز roses',
  amber: 'عنبر',
  musk: 'مسك musks',
  musks: 'مسك musk',
  jasmine: 'ياسمين فل',
  sandalwood: 'صندل',
  lemon: 'ليمون',
  bergamot: 'برغموت',
  saffron: 'زعفران',
  patchouli: 'باتشولي',
  lavender: 'لافندر خزامى',
  leather: 'جلد',
  tobacco: 'تبغ دخان',
  coffee: 'قهوه بن',
  caramel: 'كراميل',
  orange: 'برتقال',
  apple: 'تفاح',
  mint: 'نعناع',
  cinnamon: 'قرفه',
  pepper: 'فلفل',
  'pink pepper': 'فلفل وردي',
  incense: 'بخور',
  cedar: 'ارز',
  cedarwood: 'ارز خشب',
  'tonka bean': 'تونكا',
  'sea notes': 'بحر بحري marine aquatic ocean',
  berries: 'توت',
  honey: 'عسل',
  vetiver: 'فيتيفر',
  iris: 'سوسن',
}

const FAMILY_ALIASES: Record<FamilySlug, string> = {
  fresh: 'فريش منعش انتعاش clean citrus aquatic light',
  oriental: 'شرقي شرقيه warm spicy oud amber',
  floral: 'ورد زهري زهور ورود flowers flower',
  fruity: 'فواكه فاكهي فاكهه fruit',
  sweet: 'حلو مسكر سكري gourmand',
}

const OCCASION_ALIASES: Record<string, string> = {
  everyday: 'daily day casual يومي يوميا كل يوم',
  work: 'office job business شغل مكتب جامعه',
  date: 'date romantic dinner evening night سهره خروجه رومانسي',
  special: 'wedding party event formal فرح مناسبه مناسبات خطوبه',
  club: 'party club night out nightlife سهره نايت',
}

const SEASON_ALIASES: Record<string, string> = {
  spring: 'ربيع',
  summer: 'صيف صيفي hot',
  autumn: 'fall خريف',
  winter: 'شتا شتاء شتوي cold',
  all: 'all year anytime كل السنه',
}

const GENDER_ALIASES: Record<string, string> = {
  men: 'man male him his guy gentleman masculine رجالي رجال راجل للرجال',
  women: 'woman female her she lady ladies feminine حريمي ستات بنات نسائي للنساء',
  unisex: 'both everyone shared للجنسين يونيسكس',
}

const SITE_PAGES: { to: string; title: string; subtitle: string; words: string }[] = [
  {
    to: '/about',
    title: 'Our Story',
    subtitle: 'About Rfaheya',
    words: 'about us story who we are brand company best perfume company best fragrance brand rfaheya رفاهيه من نحن قصتنا الشركه افضل شركه عطور افضل براند',
  },
  { to: '/our-standard', title: 'Rfaheya Standard™', subtitle: 'How we judge a fragrance', words: 'standard quality evaluation longevity projection جوده معايير ثبات فوحان' },
  { to: '/finder', title: 'Rfaheya Finder', subtitle: 'Find your scent in a few questions', words: 'finder quiz test recommend recommendation which perfume suits me help me choose اختبار ساعدني اختار يناسبني' },
  { to: '/reviews', title: 'Reviews', subtitle: 'What our customers say', words: 'reviews ratings opinions feedback testimonials آراء تقييمات رأي' },
  { to: '/track-order', title: 'Track your order', subtitle: 'Order status', words: 'track order tracking status where is my order shipment تتبع الاوردر الطلب فين' },
  { to: '/contact', title: 'Contact us', subtitle: 'Phone, WhatsApp and email', words: 'contact phone whatsapp email call support help تواصل رقم واتساب كلمنا' },
  { to: '/faqs', title: 'FAQs', subtitle: 'Frequently asked questions', words: 'faq faqs questions help اسئله' },
  { to: '/journal', title: 'Journal', subtitle: 'Guides and stories', words: 'journal blog articles posts guides tips مقالات مدونه' },
  { to: '/shop?sort=best-sellers', title: 'Best sellers', subtitle: 'Most loved fragrances', words: 'best sellers bestseller popular top most loved trending الاكثر مبيعا الافضل' },
  { to: '/shop?sort=newest', title: 'New arrivals', subtitle: 'The latest fragrances', words: 'new arrivals latest newest جديد' },
  { to: '/shop?sort=price-asc', title: 'Lowest prices', subtitle: 'Fragrances by price', words: 'cheap cheapest price prices affordable budget offer offers sale رخيص سعر اسعار عروض' },
]

const COLLECTION_ALIASES: Record<string, string> = {
  'discovery-sets': 'sample samples tester testers 5ml 5 ml mini travel trial عينه عينات تستر تجربه',
  'gift-boxes': 'gift gifts present box wrapping هديه هدايا بوكس تغليف',
  ledger: 'men رجالي',
  serenity: 'women حريمي',
  'perfume-lab': 'inspired dupe alternative بديل',
}

const strip = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ')

function buildDocs(extra: ExtraContent): SearchDoc[] {
  const products = getAllProducts()
  const families = getFamilies()
  const familyName = (slug: FamilySlug) => families.find((f) => f.slug === slug)?.name ?? slug
  const maxSales = Math.max(1, ...products.map((p) => p.totalSales))
  const docs: SearchDoc[] = []

  for (const p of products) {
    const chips = [
      GENDERS[p.profile.gender]?.label,
      p.families[0] && familyName(p.families[0]),
      p.profile.occasions[0] && OCCASIONS[p.profile.occasions[0]]?.label,
      p.profile.seasons[0] && SEASONS[p.profile.seasons[0]]?.label,
    ].filter(Boolean)
    docs.push({
      id: `product:${p.id}`,
      kind: 'product',
      title: p.name,
      subtitle: chips.join(' • '),
      to: `/product/${p.slug}`,
      image: p.images[0]?.src,
      product: p,
      boost: (p.totalSales / maxSales) * 0.3,
      fields: [
        [p.name, 3],
        [p.inspiredBy, 2.2],
        [p.notes.map((n) => n.name), 1.8],
        [p.notes.map((n) => NOTE_ALIASES[n.name.toLowerCase()] ?? ''), 1.5],
        [[...p.composition.opening, ...p.composition.heart, ...p.composition.drydown], 1.2],
        [p.accords, 1.5],
        [p.families.map((f) => `${familyName(f)} ${FAMILY_ALIASES[f] ?? ''}`), 1.4],
        [p.profile.occasions.map((o) => `${OCCASIONS[o]?.label ?? ''} ${OCCASION_ALIASES[o] ?? ''}`), 1.2],
        [p.profile.seasons.map((s) => `${SEASONS[s]?.label ?? ''} ${SEASON_ALIASES[s] ?? ''}`), 1.1],
        [`${GENDERS[p.profile.gender]?.label ?? ''} ${GENDER_ALIASES[p.profile.gender] ?? ''}`, 1.1],
        [p.tagline, 1],
        [p.categories, 0.8],
        [[p.description, ...p.story].join(' '), 0.4],
      ],
    })
    if (p.inspiredBy) {
      docs.push({
        id: `dna:${p.id}`,
        kind: 'dna',
        title: p.inspiredBy,
        subtitle: `DNA · Rfaheya ${p.name}`,
        to: `/product/${p.slug}`,
        image: p.dnaImage || p.images[0]?.src,
        product: p,
        fields: [[p.inspiredBy, 3], ['dna inspired by original', 0.6]],
      })
    }
  }

  const notes = new Map<string, { image: string; count: number }>()
  for (const p of products) {
    for (const n of p.notes) {
      const entry = notes.get(n.name) ?? { image: n.image, count: 0 }
      entry.count++
      notes.set(n.name, entry)
    }
  }
  for (const [name, { image, count }] of notes) {
    docs.push({
      id: `note:${name}`,
      kind: 'note',
      title: name,
      subtitle: `Fragrance note · in ${count} fragrance${count === 1 ? '' : 's'}`,
      to: `/shop?q=${encodeURIComponent(name)}`,
      image,
      boost: Math.min(0.3, count * 0.05),
      fields: [[name, 3], [NOTE_ALIASES[name.toLowerCase()] ?? '', 2.6], ['note notes ingredient', 0.4]],
    })
  }

  for (const f of families) {
    docs.push({
      id: `family:${f.slug}`,
      kind: 'family',
      title: f.name,
      subtitle: `Fragrance family · ${f.tagline}`,
      to: `/shop?family=${f.slug}`,
      image: f.image,
      fields: [[f.name, 3], [FAMILY_ALIASES[f.slug] ?? '', 2.4], [f.keywords, 1.8], [f.tagline, 1], ['family families', 0.4]],
    })
  }
  for (const [key, o] of Object.entries(OCCASIONS)) {
    docs.push({ id: `occasion:${key}`, kind: 'occasion', title: o.label, subtitle: 'Occasion', to: `/shop?occasion=${key}`, fields: [[o.label, 3], [OCCASION_ALIASES[key] ?? '', 2.4], ['occasion', 0.4]] })
  }
  for (const [key, s] of Object.entries(SEASONS)) {
    docs.push({ id: `season:${key}`, kind: 'season', title: s.label, subtitle: 'Season', to: `/shop?season=${key}`, fields: [[s.label, 3], [SEASON_ALIASES[key] ?? '', 2.4], ['season', 0.4]] })
  }
  for (const [key, g] of Object.entries(GENDERS)) {
    docs.push({ id: `gender:${key}`, kind: 'gender', title: `For ${g.label.toLowerCase() === 'unisex' ? 'everyone' : g.label.toLowerCase()}`, subtitle: g.label === 'Unisex' ? 'Unisex fragrances' : `${g.label}’s fragrances`, to: `/shop?gender=${key}`, fields: [[g.label, 3], [GENDER_ALIASES[key] ?? '', 2.4]] })
  }
  for (const c of collections) {
    docs.push({
      id: `collection:${c.slug}`,
      kind: 'collection',
      title: c.name,
      subtitle: `Collection · ${c.tagline}`,
      to: `/collections/${c.slug}`,
      image: c.image,
      fields: [[c.name, 3], [COLLECTION_ALIASES[c.slug] ?? '', 2.4], [c.tagline, 1.2], [c.description, 0.6]],
    })
  }
  for (const page of SITE_PAGES) {
    docs.push({ id: `page:${page.to}`, kind: 'page', title: page.title, subtitle: page.subtitle, to: page.to, fields: [[page.title, 3], [page.words, 2.2], [page.subtitle, 1]] })
  }
  for (const page of contentPages) {
    const body = page.sections.map((s) => [s.heading, ...(s.paragraphs ?? []), ...(s.list ?? [])].join(' ')).join(' ')
    docs.push({
      id: `page:/${page.slug}`,
      kind: 'page',
      title: page.title,
      subtitle: page.intro,
      to: `/${page.slug}`,
      fields: [[page.title, 3], [page.sections.map((s) => s.heading), 1.5], [page.intro, 1], [body, 0.5]],
    })
  }
  const faqList: { q: string; text?: string; html?: string }[] = extra.faqs ?? demoFaqs.map((x) => ({ q: x.q, text: x.a }))
  for (const [i, f] of faqList.entries()) {
    const answer = f.text ?? strip(f.html ?? '')
    docs.push({ id: `faq:${i}`, kind: 'faq', title: f.q, subtitle: answer.slice(0, 90) + (answer.length > 90 ? '…' : ''), to: '/faqs', fields: [[f.q, 2.4], [answer, 0.6]] })
  }
  const posts =
    extra.posts ??
    demoArticles.map((a) => ({ ...a, text: a.body.map((b) => [b.heading, ...b.paragraphs].join(' ')).join(' ') }))
  for (const post of posts) {
    docs.push({
      id: `post:${post.slug}`,
      kind: 'post',
      title: post.title,
      subtitle: `Journal · ${post.category}`,
      to: `/journal/${post.slug}`,
      image: post.image,
      fields: [[post.title, 3], [post.category, 1.4], [post.excerpt, 1.2], [(post.text ?? '').slice(0, 4000), 0.5], ['journal blog article post', 0.3]],
    })
  }
  return docs
}

function index(extra: ExtraContent, key: string) {
  if (cache?.key === key) return cache
  const vocab = new Map<string, number>()
  const docs = buildDocs(extra).map((doc) => {
    const words = new Map<string, number>()
    for (const [value, weight] of doc.fields) {
      for (const word of tokens(Array.isArray(value) ? value.join(' ') : value)) {
        if (STOP.has(word)) continue
        if ((words.get(word) ?? 0) < weight) words.set(word, weight)
        vocab.set(word, Math.max(vocab.get(word) ?? 0, weight))
      }
    }
    return { doc, words, title: normalize(doc.title) }
  })
  cache = { key, docs, vocab }
  return cache
}

// ------------------------------------------------------------------ search

/** The closest known word for each misspelt word of the query. */
function correct(words: string[], vocab: Map<string, number>): string | undefined {
  let changed = false
  const fixed = words.map((q, i) => {
    if (vocab.has(q)) return q
    const last = i === words.length - 1
    for (const word of vocab.keys()) if (word.startsWith(q) && (last || q.length >= 3)) return q
    const max = typoAllowance(q)
    if (!max) return q
    let best = q
    let bestScore = Infinity
    for (const [word, weight] of vocab) {
      if (weight < 1) continue
      const d = distance(q, word, max)
      const score = d - weight * 0.01
      if (d <= max && score < bestScore) {
        best = word
        bestScore = score
      }
    }
    if (best !== q) changed = true
    return best
  })
  return changed ? fixed.join(' ') : undefined
}

export function search(query: string, extra: ExtraContent = {}, key = 'default'): SearchResult {
  const all = tokens(query).filter((t) => !STOP.has(t))
  const specific = all.filter((t) => !GENERIC.has(t))
  const words = specific.length ? specific : all
  if (!words.length) return { hits: [] }
  const { docs, vocab } = index(extra, key)
  const phrase = normalize(query)
  const needed = words.length <= 2 ? words.length : Math.ceil(words.length * 0.6)
  const hits: SearchHit[] = []
  for (const entry of docs) {
    let total = 0
    let matched = 0
    let exactAll = true
    words.forEach((q, i) => {
      let best = 0
      let exact = false
      for (const [word, weight] of entry.words) {
        const m = wordScore(q, word, i === words.length - 1)
        if (m.score * weight > best) {
          best = m.score * weight
          exact = m.exact
        }
      }
      if (best > 0) matched++
      if (!exact) exactAll = false
      total += best
    })
    if (matched < needed) continue
    let score = (total / words.length) * (0.55 + 0.45 * (matched / words.length)) + (entry.doc.boost ?? 0)
    if (entry.title === phrase) score += 3
    else if (entry.title.startsWith(phrase)) score += 1.5
    else if (phrase.length > 3 && entry.title.includes(phrase)) score += 0.8
    if (exactAll) score += 0.2
    hits.push({ doc: entry.doc, score })
  }
  hits.sort((a, b) => b.score - a.score)
  // Leave out passing mentions (a word deep in a description) when there are strong matches.
  const floor = Math.max(0.35, (hits[0]?.score ?? 0) * 0.22)
  return { hits: hits.filter((h) => h.score >= floor), corrected: correct(words, vocab) }
}

/** Products matching a query (shop page "?q="), best matches first. */
export function searchProducts(query: string, extra: ExtraContent = {}, key = 'default'): Product[] {
  const seen = new Set<number>()
  const out: Product[] = []
  for (const hit of search(query, extra, key).hits) {
    const p = hit.doc.product
    if (p && (hit.doc.kind === 'product' || hit.doc.kind === 'dna') && !seen.has(p.id)) {
      seen.add(p.id)
      out.push(p)
    }
  }
  return out
}
