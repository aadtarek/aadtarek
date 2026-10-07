import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
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
            children: `window.__rfPage=function(){var p=location.hash.charAt(1)==='/'?location.hash.slice(1):location.pathname,t=${JSON.stringify(table)};for(var i=0;i<t.length;i++)if(new RegExp(t[i][0]).test(p)){t[i][1].forEach(function(f){var l=document.createElement('link');l.rel='modulepreload';l.href=${JSON.stringify(base)}+f;document.head.appendChild(l)});break}};__rfPage()`,
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
  ],
  // Pre-bundle every dependency at startup. Without this, Vite discovers them
  // after the first page load and force-reloads the page in dev.
  optimizeDeps: {
    include: ['react', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react-dom', 'react-dom/client', 'react-router-dom', 'lucide-react'],
  },
  // `npm run export:content` (scripts/export-content.ts): keep images as files.
  ...(mode === 'export' ? { build: { ssrEmitAssets: true, assetsInlineLimit: 0, outDir: '.export-content', emptyOutDir: true } } : {}),
}))
