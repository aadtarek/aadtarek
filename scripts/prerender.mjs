/**
 * Pre-renders the static content pages to HTML for the WordPress page shell
 * (rfaheya.php shows it at once, before the app's JavaScript has run; the app
 * then renders the same page over it). Run after `npm run build:headless`:
 *
 *   node scripts/prerender.mjs   →   dist/prerender/<page>.html
 *
 * The pages are rendered by the demo build in Chromium (Playwright).
 */
import { execFileSync, spawn } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'

/** Pages whose content doesn't depend on the WooCommerce catalogue. */
const PAGES = ['about', 'our-standard', 'finder', 'contact', 'collections', 'faqs']

const root = new URL('..', import.meta.url).pathname
const build = join(root, '.prerender-build')
const out = join(root, 'dist', 'prerender')
const port = 4199

execFileSync('npx', ['vite', 'build', '--mode', 'production', '--outDir', build, '--emptyOutDir'], { cwd: root, stdio: 'ignore', env: { ...process.env, VITE_WP_URL: '' } })
const server = spawn('npx', ['vite', 'preview', '--outDir', build, '--port', String(port), '--strictPort'], { cwd: root, stdio: 'ignore' })
try {
  for (let i = 0; i < 60; i++) {
    if (await fetch(`http://localhost:${port}/`).then((r) => r.ok, () => false)) break
    await new Promise((r) => setTimeout(r, 250))
  }
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
  rmSync(out, { recursive: true, force: true })
  mkdirSync(out, { recursive: true })
  /** Index (in document order) of the image that is the page's largest paint at this screen width. */
  const largestImage = async (page, width, height) => {
    const tab = await browser.newPage({ viewport: { width, height } })
    await tab.addInitScript(() => {
      window.__lcp = null
      new PerformanceObserver((l) => l.getEntries().forEach((e) => (window.__lcp = e.element))).observe({ type: 'largest-contentful-paint', buffered: true })
    })
    await tab.goto(`http://localhost:${port}/${page}`, { waitUntil: 'networkidle' })
    await tab.waitForTimeout(300)
    const index = await tab.evaluate(() => [...document.querySelectorAll('#root img')].indexOf(window.__lcp))
    await tab.close()
    return index
  }

  for (const page of PAGES) {
    const lcp = [await largestImage(page, 412, 823), await largestImage(page, 1350, 940)].filter((i) => i >= 0)
    const tab = await browser.newPage({ viewport: { width: 1280, height: 900 } })
    await tab.emulateMedia({ reducedMotion: 'reduce' })
    await tab.goto(`http://localhost:${port}/${page}`, { waitUntil: 'networkidle' })
    await tab.waitForTimeout(300)
    const html = await tab.evaluate((lcp) => {
      // The largest images (phone and desktop) load first.
      const imgs = [...document.querySelectorAll('#root img')]
      lcp.forEach((i) => {
        imgs[i]?.setAttribute('fetchpriority', 'high')
        imgs[i]?.removeAttribute('loading')
      })
      // Hidden images and those well below the first screen are left out (inlined icons made the HTML heavy); the app shows them.
      const far = new Set(
        imgs.filter((img, i) => {
          const box = img.getBoundingClientRect()
          return !lcp.includes(i) && (box.width === 0 || box.top + scrollY > 1400)
        }),
      )
      far.forEach((img) => img.setAttribute('data-rf-far', ''))
      const r = document.getElementById('root').cloneNode(true)
      far.forEach((img) => img.removeAttribute('data-rf-far'))
      r.querySelectorAll('img[data-rf-far]').forEach((img) => {
        img.removeAttribute('data-rf-far')
        img.removeAttribute('src')
        img.removeAttribute('srcset')
      })
      // Snapshot only: no animations or open drawers, and nothing focusable twice.
      r.querySelectorAll('.scroll-reveal, .reveal-visible, .page-enter, .hero-copy').forEach((el) => el.classList.remove('scroll-reveal', 'reveal-visible', 'page-enter', 'hero-copy'))
      r.querySelectorAll('[role="dialog"]').forEach((el) => el.remove())
      return r.innerHTML
    }, lcp)
    writeFileSync(join(out, `${page}.html`), html)
    await tab.close()
  }
  await browser.close()
  console.log(`dist/prerender — ${PAGES.length} pages`)
} finally {
  server.kill()
  rmSync(build, { recursive: true, force: true })
}
