/**
 * Builds a WooCommerce product import CSV from src/data/catalog-seed.json.
 *
 *   node scripts/products-csv.mjs https://your-site.com > rfaheya-products.csv
 *
 * Images are referenced from the Rfaheya Headless plugin's /import folder on
 * that site, so install the plugin before running the import.
 */
import { readFileSync } from 'node:fs'

const site = (process.argv[2] || 'https://example.com').replace(/\/$/, '')
const seed = JSON.parse(readFileSync(new URL('../src/data/catalog-seed.json', import.meta.url), 'utf8'))
const imageBase = `${site}/wp-content/plugins/rfaheya-headless/import/`

const LABELS = {
  gender: { men: 'Men', women: 'Women', unisex: 'Unisex' },
  occasion: { everyday: 'Everyday', work: 'Work', date: 'Date Night', special: 'Special Occasions', club: 'Club Vibe' },
  season: { spring: 'Spring', summer: 'Summer', autumn: 'Autumn', winter: 'Winter', all: 'All Year' },
  presence: { soft: 'Soft', balanced: 'Balanced', bold: 'Bold' },
  longevity: { standard: 'Standard', extended: 'Extended', eternal: 'Eternal' },
  family: { fresh: 'Fresh', oriental: 'Oriental', floral: 'Floral', fruity: 'Fruity', sweet: 'Sweet' },
}

/** Image file in the plugin's import folder for a seed image path. */
export const importName = (file) => file.replace(/^products\//, '').replace(/^reviews\/(.*)\.webp$/, '$1-portrait.webp')

const ATTRS = ['Size', 'Accords', 'Notes', 'Inspired By', 'For', 'Occasion', 'Season', 'Presence', 'Longevity']
const base = [
  'Type', 'SKU', 'Name', 'Published', 'Is featured?', 'Visibility in catalog', 'Short description', 'Description',
  'Tax status', 'In stock?', 'Allow customer reviews?', 'Regular price', 'Categories', 'Images', 'Parent', 'Position',
]
const header = [...base, ...ATTRS.flatMap((_, i) => [`Attribute ${i + 1} name`, `Attribute ${i + 1} value(s)`, `Attribute ${i + 1} visible`, `Attribute ${i + 1} global`])]

const csvCell = (v) => {
  const s = v == null ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

const rows = []
const ranked = [...seed].sort((a, b) => b.totalSales - a.totalSales)
for (const p of ranked) {
  const sku = `RF-${p.slug.toUpperCase()}`
  const values = [
    p.sizes.map((s) => s.size),
    p.accords,
    p.notes.map((n) => n.name),
    [p.inspiredBy],
    [LABELS.gender[p.profile.gender]],
    p.profile.occasions.map((o) => LABELS.occasion[o]),
    p.profile.seasons.map((s) => LABELS.season[s]),
    [LABELS.presence[p.profile.presence]],
    [LABELS.longevity[p.profile.longevity]],
  ]
  const parent = {
    Type: 'variable',
    SKU: sku,
    Name: p.name,
    Published: 1,
    'Is featured?': 0,
    'Visibility in catalog': 'visible',
    'Short description': p.tagline,
    Description: p.description,
    'Tax status': 'taxable',
    'In stock?': 1,
    'Allow customer reviews?': 1,
    Categories: p.families.map((f) => LABELS.family[f]).join(', '),
    Images: p.images.map((i) => imageBase + importName(i.file)).join(', '),
    Position: ranked.indexOf(p),
  }
  ATTRS.forEach((name, i) => {
    parent[`Attribute ${i + 1} name`] = name
    parent[`Attribute ${i + 1} value(s)`] = values[i].join(', ')
    parent[`Attribute ${i + 1} visible`] = 1
    parent[`Attribute ${i + 1} global`] = 1
  })
  rows.push(parent)
  for (const s of p.sizes) {
    rows.push({
      Type: 'variation',
      SKU: `${sku}-${s.size.replace(/\s+/g, '')}`,
      Name: `${p.name} - ${s.size}`,
      Published: 1,
      'Tax status': 'taxable',
      'In stock?': 1,
      'Regular price': s.price,
      Parent: sku,
      'Attribute 1 name': 'Size',
      'Attribute 1 value(s)': s.size,
      'Attribute 1 global': 1,
    })
  }
}

process.stdout.write('﻿' + [header, ...rows.map((r) => header.map((h) => r[h]))].map((r) => r.map(csvCell).join(',')).join('\n') + '\n')
