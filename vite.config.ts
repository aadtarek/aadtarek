import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import { ROUTE_TABLE } from './src/routeTable.ts'

/**
 * Starts downloading the current page's code (and the chunks it needs) from
 * index.html, in parallel with the main script, instead of after it.
 */
function preloadCurrentPage(): Plugin {
  let base = '/'
  return {
    name: 'rfaheya-preload-page',
    apply: 'build',
    configResolved(config) {
      base = config.base
    },
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        if (!ctx.bundle) return
        const chunks = Object.values(ctx.bundle).filter((c) => c.type === 'chunk')
        const entry = chunks.find((c) => c.isEntry)
        const shared = new Set([entry?.fileName, ...(entry?.imports ?? [])])
        const filesFor = (module: string) => {
          const chunk = chunks.find((c) => c.facadeModuleId?.endsWith(module))
          if (!chunk) return []
          const out = new Set<string>()
          const walk = (name: string) => {
            if (out.has(name) || shared.has(name)) return
            out.add(name)
            const c = chunks.find((x) => x.fileName === name)
            c?.imports.forEach(walk)
          }
          walk(chunk.fileName)
          return [...out]
        }
        const table = ROUTE_TABLE.map(([pattern, module]) => [pattern, filesFor(module)])
        return [
          {
            tag: 'script',
            injectTo: 'head',
            children: `window.__rfPage=function(){var p=location.hash.charAt(1)==='/'?location.hash.slice(1):location.pathname,t=${JSON.stringify(table)};for(var i=0;i<t.length;i++)if(new RegExp(t[i][0]).test(p)){t[i][1].forEach(function(f){var l=document.createElement('link');l.rel='modulepreload';l.href=${JSON.stringify(base)}+f;document.head.appendChild(l)});break}};if(!window.__rfShell)__rfPage()`,
          },
        ]
      },
    },
  }
}

/**
 * The home page's first slider picture starts downloading while the HTML is still read
 * (it is the largest thing on screen). Skipped when the dashboard sets its own slides:
 * the WordPress page then preloads those (window.__rfOwnSlides).
 */
function preloadFirstSlide(): Plugin {
  let base = '/'
  return {
    name: 'rfaheya-preload-slide',
    apply: 'build',
    configResolved(config) {
      base = config.base
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) return
        // The storefront's code: started by the script below instead of static tags, so on a
        // phone's home page it starts right after the first screen is drawn (not competing with
        // its picture); everywhere else at once, as before.
        const main = html.match(/<script type="module" crossorigin src="([^"]+)"><\/script>\s*/)
        const pre = [...html.matchAll(/<link rel="modulepreload" crossorigin href="([^"]+)">\s*/g)]
        if (!main) return
        html = html.replace(main[0], '')
        for (const m of pre) html = html.replace(m[0], '')
        const go = `window.__rfGo=function(){if(window.__rfGo.d)return;window.__rfGo.d=1;var h=document.head;${JSON.stringify(pre.map((m) => m[1]))}.forEach(function(f){var l=document.createElement('link');l.rel='modulepreload';l.crossOrigin='';l.href=f;h.appendChild(l)});var s=document.createElement('script');s.type='module';s.crossOrigin='';s.src=${JSON.stringify(main[1])};h.appendChild(s);window.__rfPage&&__rfPage()};if(window.__rfShell)document.addEventListener('DOMContentLoaded',function(){requestAnimationFrame(function(){setTimeout(__rfGo,0)})});else __rfGo()`
        const assets = Object.values(ctx.bundle).filter((c) => c.type === 'asset')
        const file = (name: string) => {
          const a = assets.find((c) => (c as { names?: string[] }).names?.includes(name) || c.name === name)
          return a ? base + a.fileName : ''
        }
        const big = file('obsidian.webp')
        const sm = file('obsidian-945.webp')
        const mBig = file('obsidian-mobile.webp')
        const mSm = file('obsidian-mobile-740.webp')
        if (!big || !sm || !mBig || !mSm) return { html, tags: [{ tag: 'script', injectTo: 'head', children: go }] }
        const link = (href: string, set: string, sizes: string, media: string) =>
          `<link rel="preload" as="image" fetchpriority="high" href="${href}" imagesrcset="${set}" imagesizes="${sizes}" media="${media}">`
        const tags =
          link(sm, `${sm} 945w, ${big} 1890w`, '(min-width: 1024px) 66vw, 100vw', '(min-width: 768px)') +
          link(mSm, `${mSm} 740w, ${mBig} 1074w`, '100vw', '(max-width: 767px)')
        return { html, tags: [
          {
            tag: 'script',
            injectTo: 'head',
            // Also picks the picture of the phone's first screen (#rf-shell in index.html).
            children: `(function(){var o=window.__rfOwnSlides,d=document.documentElement,home=(location.pathname==='/'||location.pathname==='/index.html')&&!location.hash;if(!home)return;if(!o||(o!==1&&!o.img))document.head.insertAdjacentHTML('beforeend',${JSON.stringify(tags)});if(o===1||d.classList.contains('dark')||!matchMedia('(max-width: 767px)').matches)return;var s=o&&o.img?{src:o.img,set:o.set||''}:{src:${JSON.stringify(mSm)},set:${JSON.stringify(`${mSm} 740w, ${mBig} 1074w`)},pos:'62% 50%'};s.n=(o&&o.n)||3;window.__rfShell=s;d.classList.add('rf-shell-on')})()`,
          },
          { tag: 'script', injectTo: 'head', children: go },
        ] }
      },
    },
  }
}

/**
 * Each page's largest picture (its header image), started from index.html while the
 * storefront's code is still downloading: [path pattern, [picture, media query?][]].
 */
const ROUTE_IMAGES: [string, [string, string?][]][] = [
  ['^/about/?$', [['src/assets/about/hero-mobile.webp', '(max-width: 767px)'], ['src/assets/about/hero.webp', '(min-width: 768px)']]],
  ['^/our-standard', [['src/assets/standard-page/m-hero.webp', '(max-width: 767px)'], ['src/assets/standard-page/hero.webp', '(min-width: 768px)']]],
  ['^/reviews', [['src/assets/reviews/vanilla-oud.webp']]],
  ['^/contact', [['src/assets/standard-page/why.webp']]],
  ['^/faqs', [['src/assets/about/value-1.webp']]],
  ['^/wishlist', [['src/assets/headers/wishlist.webp']]],
  ['^/collections/?$', [['src/assets/standard/background-800.webp', '(max-width: 1023px)']]],
  ['^/journal/?$', [['src/assets/headers/journal-1200.webp']]],
  ['^/track-order', [['src/assets/about/value-3.webp']]],
  ['^/account', [['src/assets/about/value-2.webp']]],
  ['^/(privacy|terms|shipping|returns|refund)[^/]*/?$', [['src/assets/standard/background-800.webp']]],
]

function preloadRouteImages(): Plugin {
  let base = '/'
  return {
    name: 'rfaheya-preload-route-images',
    apply: 'build',
    configResolved(config) {
      base = config.base
    },
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        if (!ctx.bundle) return
        const assets = Object.values(ctx.bundle).filter((c) => c.type === 'asset') as { fileName: string; originalFileNames?: string[]; originalFileName?: string }[]
        const url = (src: string) => {
          const a = assets.find((c) => c.originalFileNames?.some((n) => n.endsWith(src)) || c.originalFileName?.endsWith(src))
          return a ? base + a.fileName : ''
        }
        // The page fonts, so text is drawn once in its own font (no reflow when they arrive later).
        const fonts = assets
          .filter((c) => /roboto-latin-wght-normal-[\w-]+\.woff2$/.test(c.fileName))
          .map((c) => ({ tag: 'link', injectTo: 'head' as const, attrs: { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: '', href: base + c.fileName } }))
        const table = ROUTE_IMAGES.map(([re, list]) => [re, list.map(([src, media]) => [url(src), media ?? '']).filter(([u]) => u)])
        return [
          ...fonts,
          {
            tag: 'script',
            injectTo: 'head',
            children: `(function(){var p=location.pathname,t=${JSON.stringify(table)};for(var i=0;i<t.length;i++)if(new RegExp(t[i][0]).test(p)){t[i][1].forEach(function(x){var l=document.createElement('link');l.rel='preload';l.as='image';l.href=x[0];if(x[1])l.media=x[1];l.setAttribute('fetchpriority','high');document.head.appendChild(l)});break}})()`,
          },
        ]
      },
    },
  }
}

export default defineConfig(({ mode, command }) => ({
  // Builds use react-router's production code (its package points at the development build,
  // with extra checks and warnings, unless asked for this one).
  ...(command === 'build'
    ? {
        resolve: {
          alias: [
            { find: /^react-router$/, replacement: fileURLToPath(new URL('./node_modules/react-router/dist/production/index.mjs', import.meta.url)) },
            { find: /^react-router\/dom$/, replacement: fileURLToPath(new URL('./node_modules/react-router/dist/production/dom-export.mjs', import.meta.url)) },
          ],
        },
      }
    : {}),
  plugins: [
    react(),
    tailwindcss(),
    preloadFirstSlide(),
    preloadRouteImages(),
    preloadCurrentPage(),
  ],
  // Pre-bundle every dependency at startup. Without this, Vite discovers them
  // after the first page load and force-reloads the page in dev.
  optimizeDeps: {
    include: ['react', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react-dom', 'react-dom/client', 'react-router-dom', 'lucide-react'],
  },
  // `npm run export:content` (scripts/export-content.ts): keep images as files.
  ...(mode === 'export' ? { build: { ssrEmitAssets: true, assetsInlineLimit: 0, outDir: '.export-content', emptyOutDir: true } } : {}),
}))
