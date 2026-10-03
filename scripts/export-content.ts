/**
 * Exports the storefront's built-in content (journal, info pages, FAQs,
 * families, home texts) as the starter content WordPress imports
 * (Settings → Rfaheya Store → Import starter content).
 *
 * Built with Vite in SSR mode so TypeScript and image imports resolve:
 *   npm run export:content   →   wordpress/mu-plugins/rfaheya/content.json + media/
 */
import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { contentPages } from '../src/data/content'
import { families } from '../src/data/families'
import { faqs } from '../src/data/faqs'
import { articles } from '../src/data/journal'
import heroImage from '../src/assets/hero.webp'
import { DEFAULT_HOME } from '../src/config'

const root = process.cwd()
const built = join(root, '.export-content')
const target = join(root, 'wordpress/mu-plugins/rfaheya')
const mediaDir = join(target, 'media')

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Block editor markup, so the imported content opens as normal blocks in WordPress.
const h2 = (t: string) => `<!-- wp:heading -->\n<h2 class="wp-block-heading">${esc(t)}</h2>\n<!-- /wp:heading -->`
const p = (t: string) => `<!-- wp:paragraph -->\n<p>${esc(t)}</p>\n<!-- /wp:paragraph -->`
const ul = (items: string[]) =>
  `<!-- wp:list -->\n<ul class="wp-block-list">${items.map((t) => `<!-- wp:list-item -->\n<li>${esc(t)}</li>\n<!-- /wp:list-item -->`).join('')}</ul>\n<!-- /wp:list -->`

/** Copies a built asset (e.g. /assets/hero-abc123.webp) into media/ and returns its file name. */
function media(url: string): string {
  const file = basename(url)
  const name = file.replace(/-[A-Za-z0-9_-]{8}(\.\w+)$/, '$1')
  const from = join(built, 'assets', file)
  if (!existsSync(from)) throw new Error(`asset not found: ${from}`)
  copyFileSync(from, join(mediaDir, name))
  return name
}

rmSync(target, { recursive: true, force: true })
mkdirSync(mediaDir, { recursive: true })

const content = {
  version: 1,
  posts: articles.map((a) => ({
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    category: a.category,
    date: a.date,
    image: media(a.image),
    content: a.body.flatMap((s) => [...(s.heading ? [h2(s.heading)] : []), ...s.paragraphs.map(p)]).join('\n\n'),
  })),
  pages: contentPages.map((page) => ({
    slug: page.slug,
    title: page.title,
    eyebrow: page.eyebrow,
    excerpt: page.intro,
    content: page.sections.flatMap((s) => [h2(s.heading), ...(s.paragraphs ?? []).map(p), ...(s.list ? [ul(s.list)] : [])]).join('\n\n'),
  })),
  faqs: faqs.map((f) => ({ q: f.q, a: p(f.a) })),
  families: families.map((f) => ({ slug: f.slug, name: f.name, tagline: f.tagline, image: media(f.image) })),
  home: { ...DEFAULT_HOME, hero: { ...DEFAULT_HOME.hero, image: media(heroImage) } },
}

writeFileSync(join(target, 'content.json'), JSON.stringify(content, null, 2) + '\n')
// Logo for the My Account page shell.
copyFileSync(join(root, 'src/assets/logo.svg'), join(target, 'logo.svg'))
console.log(
  `wordpress/mu-plugins/rfaheya/content.json — ${content.posts.length} posts, ${content.pages.length} pages, ${content.faqs.length} FAQs, ${content.families.length} families`,
)
