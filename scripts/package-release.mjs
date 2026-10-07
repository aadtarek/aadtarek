/**
 * Packages a headless release after `npm run build:headless` as ONE zip that
 * mirrors public_html. Extract it in public_html (File Manager → Extract):
 *
 *   index.html  assets/  import/ …          the storefront
 *   .htaccess                               routes the storefront and WordPress
 *   wp-content/mu-plugins/rfaheya.php       store settings, FAQs, product details box, content import
 *   wp-content/mu-plugins/rfaheya-admin/    styles and scripts for the product / notes / videos screens
 *   wp-content/mu-plugins/rfaheya/          starter content for the import (npm run export:content)
 *   rfaheya-setup/rfaheya-products.csv      WooCommerce product import
 *   rfaheya-setup/README.txt                the steps
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

// Product images for the CSV import, served from /import.
mkdirSync(join(dist, 'import'), { recursive: true })
for (const p of seed) for (const img of p.images) copyFileSync(join(root, 'src/assets', img.file), join(dist, 'import', importName(img.file)))

const files = {}
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full)
    else files[relative(dist, full)] = new Uint8Array(readFileSync(full))
  }
}
walk(dist)

files['.htaccess'] = new Uint8Array(readFileSync(join(root, 'wordpress/htaccess')))
files['wp-content/mu-plugins/rfaheya.php'] = new Uint8Array(readFileSync(join(root, 'wordpress/mu-plugins/rfaheya.php')))
for (const f of readdirSync(join(root, 'wordpress/mu-plugins/rfaheya-admin'))) {
  files[`wp-content/mu-plugins/rfaheya-admin/${f}`] = new Uint8Array(readFileSync(join(root, 'wordpress/mu-plugins/rfaheya-admin', f)))
}
const starter = join(root, 'wordpress/mu-plugins/rfaheya')
if (!existsSync(join(starter, 'content.json'))) throw new Error('Starter content missing: run npm run export:content first')
for (const f of readdirSync(starter)) {
  if (f === 'media') continue
  files[`wp-content/mu-plugins/rfaheya/${f}`] = new Uint8Array(readFileSync(join(starter, f)))
}
for (const f of readdirSync(join(starter, 'media'))) {
  files[`wp-content/mu-plugins/rfaheya/media/${f}`] = new Uint8Array(readFileSync(join(starter, 'media', f)))
}
files['rfaheya-setup/rfaheya-products.csv'] = new Uint8Array(execFileSync('node', [join(root, 'scripts/products-csv.mjs'), site]))
files['rfaheya-setup/README.txt'] = new Uint8Array(readFileSync(join(root, 'wordpress/README.txt')))

rmSync(release, { recursive: true, force: true })
mkdirSync(release, { recursive: true })
writeFileSync(join(release, 'rfaheya-public_html.zip'), zipSync(files, { level: 9 }))
console.log(`release/rfaheya-public_html.zip — ${Object.keys(files).length} files, product images from ${site}/import/`)
