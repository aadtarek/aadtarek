/**
 * Packages the WordPress theme after `vite build --mode wordpress`:
 * copies the logo/favicon and import images into wordpress/rfaheya and
 * writes release/rfaheya-theme.zip (+ the product CSV when SITE_URL is set).
 */
import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { zipSync } from 'fflate'

const root = new URL('..', import.meta.url).pathname
const theme = join(root, 'wordpress/rfaheya')
const seed = JSON.parse(readFileSync(join(root, 'src/data/catalog-seed.json'), 'utf8'))
const importName = (file) => file.replace(/^products\//, '').replace(/^reviews\/(.*)\.webp$/, '$1-portrait.webp')

copyFileSync(join(root, 'public/favicon.svg'), join(theme, 'favicon.svg'))
copyFileSync(join(root, 'src/assets/logo.svg'), join(theme, 'logo.svg'))
mkdirSync(join(theme, 'import'), { recursive: true })
for (const p of seed) for (const img of p.images) copyFileSync(join(root, 'src/assets', img.file), join(theme, 'import', importName(img.file)))

const files = {}
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full)
    else files[`rfaheya/${relative(theme, full)}`] = new Uint8Array(readFileSync(full))
  }
}
walk(theme)
mkdirSync(join(root, 'release'), { recursive: true })
writeFileSync(join(root, 'release/rfaheya-theme.zip'), zipSync(files, { level: 9 }))
console.log(`release/rfaheya-theme.zip — ${Object.keys(files).length} files`)

if (process.env.SITE_URL) {
  const csv = execFileSync('node', [join(root, 'scripts/products-csv.mjs'), process.env.SITE_URL])
  writeFileSync(join(root, 'release/rfaheya-products.csv'), csv)
  console.log(`release/rfaheya-products.csv — images from ${process.env.SITE_URL}`)
}
