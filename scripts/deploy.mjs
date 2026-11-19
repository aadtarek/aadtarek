/**
 * Puts release/rfaheya-storefront.zip in place on the live site through its Claude connection
 * (Tools → Claude connection ✦, Admin on), the same as Plugins → Upload → Replace.
 *
 *   node scripts/deploy.mjs https://example.com            key from the environment's network secret (Bearer)
 *   RFAHEYA_MCP_KEY=… node scripts/deploy.mjs https://example.com
 *
 * Uses curl (it goes through the session's proxy, which adds the saved key).
 */
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const site = (process.argv[2] || '').replace(/\/+$/, '')
if (!/^https?:\/\//.test(site)) throw new Error('Usage: node scripts/deploy.mjs https://your-site')
const zipPath = process.argv[3] || new URL('../release/rfaheya-storefront.zip', import.meta.url).pathname
const endpoint = `${site}/wp-json/rfaheya/v1/mcp`
const tmp = mkdtempSync(join(tmpdir(), 'rf-deploy-'))
let id = 0

function rpc(method, params) {
  const body = join(tmp, 'body.json')
  writeFileSync(body, JSON.stringify({ jsonrpc: '2.0', id: ++id, method, params }))
  const args = ['-sS', '--fail-with-body', '-m', '300', '-X', 'POST', endpoint, '-H', 'Content-Type: application/json', '-H', 'Accept: application/json, text/event-stream', '--data-binary', `@${body}`]
  if (process.env.RFAHEYA_MCP_KEY) args.push('-H', `Authorization: Bearer ${process.env.RFAHEYA_MCP_KEY}`)
  const out = JSON.parse(execFileSync('curl', args, { encoding: 'utf8', maxBuffer: 64 << 20 }))
  if (out.error) throw new Error(out.error.message || JSON.stringify(out.error))
  return out.result
}
function tool(name, args) {
  const r = rpc('tools/call', { name, arguments: args })
  const text = r.content?.[0]?.text ?? ''
  if (r.isError) throw new Error(`${name}: ${text}`)
  return JSON.parse(text)
}

const info = rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'rfaheya-deploy', version: '1' } })
console.log('Connected:', info.serverInfo.title)
const zip = readFileSync(zipPath)
const md5 = createHash('md5').update(zip).digest('hex')
const size = 1.5 * 1024 * 1024
const upload = `deploy${Date.now()}`
let n = 0
for (let i = 0; i < zip.length; i += size) {
  tool('upload_chunk', { upload_id: upload, index: n++, base64: zip.subarray(i, i + size).toString('base64') })
  process.stdout.write(`\rUploading ${Math.min(100, Math.round(((i + size) / zip.length) * 100))}%`)
}
console.log(`\nInstalling ${(zip.length / 1048576).toFixed(1)} MB in ${n} pieces…`)
console.log(tool('install_zip', { upload_id: upload, md5 }))
console.log(tool('refresh_store', {}))
