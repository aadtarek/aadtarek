import heroImg from '../assets/hero.webp'
import seasonsImg from '../assets/finder/season-all.webp'
import notesImg from '../assets/finder/note-vanilla.webp'

export interface Article {
  slug: string
  title: string
  excerpt: string
  category: string
  readMinutes: number
  date: string
  image: string
  body: { heading?: string; paragraphs: string[] }[]
}

export const articles: Article[] = [
  {
    slug: 'how-to-make-your-fragrance-last-longer',
    title: 'How to make your fragrance last longer',
    excerpt: 'Small habits that help a scent stay with you from morning to night.',
    category: 'Guides',
    readMinutes: 4,
    date: '2026-09-20',
    image: heroImg,
    body: [
      {
        paragraphs: [
          'Longevity depends on the fragrance itself — but also on your skin, the weather and how you apply it. A few simple habits make a noticeable difference.',
        ],
      },
      {
        heading: 'Apply to moisturized skin',
        paragraphs: [
          'Fragrance holds better on hydrated skin. Apply an unscented moisturizer first, then spray once it has absorbed.',
        ],
      },
      {
        heading: 'Choose your pulse points',
        paragraphs: [
          'Wrists, the base of the neck and behind the ears are warm areas that gently diffuse the scent through the day. Spray from around 15 cm away.',
        ],
      },
      {
        heading: 'Don’t rub',
        paragraphs: [
          'Rubbing your wrists together warms and breaks down the top notes faster. Let the fragrance settle on its own.',
        ],
      },
      {
        heading: 'A light mist on clothing',
        paragraphs: [
          'Fabric holds scent longer than skin. A single spray on a scarf or jacket extends the trail — test on an inconspicuous area first.',
        ],
      },
      {
        heading: 'Store it well',
        paragraphs: ['Keep bottles away from heat, humidity and direct sunlight. A drawer or cupboard is better than a bathroom shelf.'],
      },
    ],
  },
  {
    slug: 'top-heart-and-base-notes-explained',
    title: 'Top, heart and base notes, explained',
    excerpt: 'Why a fragrance smells different after ten minutes — and after five hours.',
    category: 'Fragrance 101',
    readMinutes: 5,
    date: '2026-09-08',
    image: notesImg,
    body: [
      {
        paragraphs: [
          'Every fragrance is built in layers that evaporate at different speeds. Understanding them helps you judge a scent properly — not just from the first spray.',
        ],
      },
      {
        heading: 'Top notes — the first impression',
        paragraphs: [
          'Light, bright ingredients such as citrus, bergamot and pink pepper. They greet you immediately and fade within the first half hour.',
        ],
      },
      {
        heading: 'Heart notes — the character',
        paragraphs: [
          'Florals, spices and aromatics like rose, lavender and saffron. They emerge as the top notes fade and define the personality of the fragrance for several hours.',
        ],
      },
      {
        heading: 'Base notes — the memory',
        paragraphs: [
          'Rich, heavy materials such as oud, amber, vanilla, musk and woods. They anchor the composition and linger the longest — often what people remember about you.',
        ],
      },
      {
        heading: 'Why we say “try 10 ML first”',
        paragraphs: [
          'Because a fragrance tells its full story over hours, a paper strip can’t tell you everything. Wearing a discovery size for a few days is the best way to know if it’s truly yours.',
        ],
      },
    ],
  },
  {
    slug: 'choosing-a-scent-for-every-season',
    title: 'Choosing a scent for every season',
    excerpt: 'How temperature changes the way fragrance behaves — and what to reach for.',
    category: 'Guides',
    readMinutes: 4,
    date: '2026-08-25',
    image: seasonsImg,
    body: [
      {
        paragraphs: ['Heat amplifies fragrance; cold quiets it. That’s why the same scent can feel very different in August and in January.'],
      },
      {
        heading: 'Spring & summer',
        paragraphs: [
          'Reach for fresh, aquatic and citrus compositions. They feel clean in the heat and won’t become heavy. One or two sprays is usually enough.',
        ],
      },
      {
        heading: 'Autumn & winter',
        paragraphs: [
          'Warm, oriental and gourmand scents — vanilla, amber, oud — come alive in cooler air and feel comforting and rich.',
        ],
      },
      {
        heading: 'All year',
        paragraphs: [
          'Balanced compositions with woody or musky bases travel well across seasons. Not sure? The Rfaheya Finder can help you choose.',
        ],
      },
    ],
  },
]

export function findArticle(slug: string) {
  return articles.find((a) => a.slug === slug)
}
