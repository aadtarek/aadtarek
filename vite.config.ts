import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { ROUTE_TABLE } from './src/routeTable.ts'

/**
 * Paints the page's main image straight from index.html, before the app's
 * JavaScript has run (the app then renders the same image in its place).
 * `kind`: 'hero' (home), 'product' (product photo, phones/tablets) or 'banner' (shop).
 */
const PAINT = `window.__rfPaint=function(kind,src,set){var r=document.getElementById('root');if(!r||!src||r.getAttribute('data-app'))return;var w=innerWidth,img=new Image(),s=img.style,box=document.createElement('div');if(kind==='product'&&w>=1024)return;img.alt='';img.fetchPriority='high';if(set){img.srcset=set;img.sizes=kind==='hero'?'(max-width: 767px) 250vw, 100vw':'100vw'}img.src=src;s.display='block';s.width='100%';s.objectFit='cover';box.style.cssText='min-height:100vh;background:#f6f1eb;padding-top:36px';if(kind==='hero'){s.height=(w>=768?Math.min(780,Math.max(560,w*0.4)):w>=640?460:w>=400?380:340)+4+'px';s.objectPosition=w>=768?'right center':'78% center'}else if(kind==='product'){box.style.padding='118px 14px 0';s.aspectRatio='4/3';s.borderRadius='8px'}else{box.style.paddingTop=(w>=1024?'122px':'100px');s.height=(w>=640?170:150)+'px';s.objectPosition='right center'}box.appendChild(img);r.innerHTML='';r.appendChild(box)}`

/**
 * With WordPress connected, start the catalogue request (rfaheya/v1/bootstrap)
 * from index.html so it downloads while the JavaScript does, and paint the
 * home hero / product photo as soon as it arrives.
 */
function bootstrapEarly(wpUrl: string): Plugin {
  const base = wpUrl === '/' ? '' : wpUrl.replace(/\/+$/, '')
  return {
    name: 'rfaheya-bootstrap-early',
    transformIndexHtml: () => [
      {
        tag: 'script',
        injectTo: 'head-prepend',
        children: `window.__rfBoot=window.__rfBoot||fetch(${JSON.stringify(`${base}/wp-json/rfaheya/v1/bootstrap`)},{credentials:'omit',headers:{Accept:'application/json'}}).then(function(r){return r.ok?r.json():null}).then(function(d){var p=location.pathname,h=d&&d.settings&&d.settings.home&&d.settings.home.hero;if(p==='/'&&window.__rfPaint)__rfPaint('hero',h&&h.image||window.__rfHero,h&&h.image?h.srcset:'');var m=new RegExp('^/product/([^/]+)').exec(p);if(m&&d&&d.products&&window.__rfPaint)for(var i=0;i<d.products.length;i++)if(d.products[i].slug===m[1]&&d.products[i].images[0]){__rfPaint('product',d.products[i].images[0].src,d.products[i].images[0].srcset);break}return d}).catch(function(){return null})`,
      },
    ],
  }
}

/** Defines __rfPaint and the bundled hero / shop banner URLs; without WordPress, paints them right away. */
function paintEarly(withWordPress: boolean): Plugin {
  let base = '/'
  return {
    name: 'rfaheya-paint-early',
    apply: 'build',
    configResolved(config) {
      base = config.base
    },
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        if (!ctx.bundle) return
        const asset = (file: string) => {
          const a = Object.values(ctx.bundle!).find((x) => x.type === 'asset' && x.originalFileNames?.some((n) => n.endsWith(file)))
          return a ? base + a.fileName : ''
        }
        const hero = asset('src/assets/hero.webp')
        const banner = asset('src/assets/shop-banner.webp')
        const path = `location.hash.charAt(1)==='/'?location.hash.slice(1):location.pathname`
        return [
          { tag: 'script', injectTo: 'head', children: `${PAINT};window.__rfHero=${JSON.stringify(hero)}` },
          {
            tag: 'script',
            injectTo: 'body',
            children: `(function(){var p=${path};if(/^\\/shop/.test(p))__rfPaint('banner',${JSON.stringify(banner)});${withWordPress ? '' : `if(p==='/')__rfPaint('hero',${JSON.stringify(hero)});`}})()`,
          },
        ]
      },
    },
  }
}

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
            // Right after the first frame is painted, so the page shows first.
            children: `window.__rfPage=function(){var p=location.hash.charAt(1)==='/'?location.hash.slice(1):location.pathname,t=${JSON.stringify(table)};for(var i=0;i<t.length;i++)if(new RegExp(t[i][0]).test(p)){t[i][1].forEach(function(f){var l=document.createElement('link');l.rel='modulepreload';l.href=${JSON.stringify(base)}+f;document.head.appendChild(l)});break}};requestAnimationFrame(function(){setTimeout(function(){if(!document.querySelector('.rf-pre'))__rfPage()},0)})`,
          },
        ]
      },
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    preloadCurrentPage(),
    paintEarly(Boolean(loadEnv(mode, process.cwd()).VITE_WP_URL)),
    ...(loadEnv(mode, process.cwd()).VITE_WP_URL ? [bootstrapEarly(loadEnv(mode, process.cwd()).VITE_WP_URL)] : []),
  ],
  // Pre-bundle every dependency at startup. Without this, Vite discovers them
  // after the first page load and force-reloads the page in dev.
  optimizeDeps: {
    include: ['react', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react-dom', 'react-dom/client', 'react-router-dom', 'lucide-react'],
  },
  // `npm run export:content` (scripts/export-content.ts): keep images as files.
  ...(mode === 'export' ? { build: { ssrEmitAssets: true, assetsInlineLimit: 0, outDir: '.export-content', emptyOutDir: true } } : {}),
}))
