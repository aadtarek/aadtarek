/**
 * Packages a headless release after `npm run build:headless`:
 *
 *   release/dist.zip              the storefront: extract in public_html → public_html/dist
 *   release/htaccess.txt          public_html/.htaccess (routes the storefront and WordPress)
 *   release/rfaheya.php           mu-plugin: upload to wp-content/mu-plugins/
 *   release/rfaheya-products.csv  WooCommerce product import (images from /dist/import)
 *
 * The site address for the CSV comes from SITE_URL (environment or .env.headless).
 */
import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { zipSync } from 'fflate'

const root = new URL('..', import.meta.url).pathname
const dist = join(root, 'dist')
const release = join(root, 'release')
/** Same naming as scripts/products-csv.mjs. */
const importName = (file) => file.replace(/^products\//, '').replace(/^reviews\/(.*)\.webp$/, '$1-portrait.webp')
const seed = JSON.parse(readFileSync(join(root, 'src/data/catalog-seed.json'), 'utf8'))

const envFile = join(root, '.env.headless')
const fromEnv = existsSync(envFile) ? /^SITE_URL=(.*)$/m.exec(readFileSync(envFile, 'utf8'))?.[1]?.trim() : undefined
const site = (process.env.SITE_URL || fromEnv || '').replace(/\/+$/, '')
if (!site) throw new Error('Set SITE_URL in .env.headless (or the environment)')
if (!existsSync(join(dist, 'index.html'))) throw new Error('dist/ is missing: run npm run build:headless first')

// Files for static hosts don't belong in the WordPress upload; the root .htaccess does the routing.
for (const f of ['.htaccess', '_redirects']) rmSync(join(dist, f), { force: true })

// Product images for the CSV import, served from /dist/import.
mkdirSync(join(dist, 'import'), { recursive: true })
for (const p of seed) for (const img of p.images) copyFileSync(join(root, 'src/assets', img.file), join(dist, 'import', importName(img.file)))

const files = {}
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full)
    else files[`dist/${relative(dist, full)}`] = new Uint8Array(readFileSync(full))
  }
}
walk(dist)

rmSync(release, { recursive: true, force: true })
mkdirSync(release, { recursive: true })
writeFileSync(join(release, 'dist.zip'), zipSync(files, { level: 9 }))
console.log(`release/dist.zip — ${Object.keys(files).length} files`)

copyFileSync(join(root, 'wordpress/htaccess'), join(release, 'htaccess.txt'))
copyFileSync(join(root, 'wordpress/mu-plugins/rfaheya.php'), join(release, 'rfaheya.php'))
console.log('release/htaccess.txt, release/rfaheya.php')

writeFileSync(join(release, 'rfaheya-products.csv'), execFileSync('node', [join(root, 'scripts/products-csv.mjs'), site]))
console.log(`release/rfaheya-products.csv — images from ${site}/dist/import/`)
