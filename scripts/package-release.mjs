/**
 * Packages a headless release after `npm run build:headless`:
 *
 *   release/rfaheya-headless.zip    WordPress plugin (Plugins → Add New → Upload)
 *   release/rfaheya-products.csv    WooCommerce product import
 *   release/rfaheya-storefront.zip  the built storefront (dist/) for any static host
 *
 * The WordPress address comes from VITE_WP_URL in .env.headless (or SITE_URL).
 */
import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { zipSync } from 'fflate'

const root = new URL('..', import.meta.url).pathname
const plugin = join(root, 'wordpress/rfaheya-headless')
const dist = join(root, 'dist')
/** Same naming as scripts/products-csv.mjs. */
const importName = (file) => file.replace(/^products\//, '').replace(/^reviews\/(.*)\.webp$/, '$1-portrait.webp')
const seed = JSON.parse(readFileSync(join(root, 'src/data/catalog-seed.json'), 'utf8'))

const envFile = join(root, '.env.headless')
const fromEnv = existsSync(envFile) ? /^VITE_WP_URL=(.*)$/m.exec(readFileSync(envFile, 'utf8'))?.[1]?.trim() : undefined
const site = (process.env.SITE_URL || fromEnv || '').replace(/\/+$/, '')
if (!site) throw new Error('Set VITE_WP_URL in .env.headless (or SITE_URL)')
if (!existsSync(join(dist, 'index.html'))) throw new Error('dist/ is missing: run npm run build:headless first')

// Product images ship inside the plugin so the CSV import can fetch them.
rmSync(join(plugin, 'import'), { recursive: true, force: true })
mkdirSync(join(plugin, 'import'), { recursive: true })
for (const p of seed) for (const img of p.images) copyFileSync(join(root, 'src/assets', img.file), join(plugin, 'import', importName(img.file)))

function zipDir(dir, prefix) {
  const files = {}
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const full = join(d, name)
      if (statSync(full).isDirectory()) walk(full)
      else files[prefix + relative(dir, full)] = new Uint8Array(readFileSync(full))
    }
  }
  walk(dir)
  return files
}

mkdirSync(join(root, 'release'), { recursive: true })

const pluginFiles = zipDir(plugin, 'rfaheya-headless/')
writeFileSync(join(root, 'release/rfaheya-headless.zip'), zipSync(pluginFiles, { level: 9 }))
console.log(`release/rfaheya-headless.zip — ${Object.keys(pluginFiles).length} files`)

const csv = execFileSync('node', [join(root, 'scripts/products-csv.mjs'), site])
writeFileSync(join(root, 'release/rfaheya-products.csv'), csv)
console.log(`release/rfaheya-products.csv — images from ${site}`)

const siteFiles = zipDir(dist, '')
writeFileSync(join(root, 'release/rfaheya-storefront.zip'), zipSync(siteFiles, { level: 9 }))
console.log(`release/rfaheya-storefront.zip — ${Object.keys(siteFiles).length} files, connected to ${site}`)
