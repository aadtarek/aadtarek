// Background removal that runs fully in the browser (no server).
// Models (both permissively licensed):
//  - fast: Xenova/modnet (Apache-2.0), tuned for portraits, ~7 MB
//  - best: onnx-community/BiRefNet_lite-ONNX (MIT), general objects, ~115 MB
// Models are downloaded from the Hugging Face CDN once and cached by the browser.

export type BgModel = 'fast' | 'best'

const MODELS: Record<BgModel, string> = {
  fast: 'Xenova/modnet',
  best: 'onnx-community/BiRefNet_lite-ONNX',
}

type Remover = (img: string) => Promise<{ toCanvas: () => HTMLCanvasElement | OffscreenCanvas }>
const cache = new Map<BgModel, Promise<Remover>>()

async function hasWebGPU() {
  try {
    const gpu = (navigator as Navigator & { gpu?: { requestAdapter: () => Promise<unknown> } }).gpu
    return !!(gpu && (await gpu.requestAdapter()))
  } catch {
    return false
  }
}

function getRemover(model: BgModel, onProgress?: (pct: number) => void): Promise<Remover> {
  let p = cache.get(model)
  if (!p) {
    p = (async () => {
      const { pipeline } = await import('@huggingface/transformers')
      const files = new Map<string, { loaded: number; total: number }>()
      const progress_callback = (e: { status: string; file?: string; loaded?: number; total?: number }) => {
        if (e.status === 'progress' && e.file && e.total) {
          files.set(e.file, { loaded: e.loaded ?? 0, total: e.total })
          let l = 0
          let t = 0
          files.forEach((f) => {
            l += f.loaded
            t += f.total
          })
          onProgress?.(t ? Math.round((l / t) * 100) : 0)
        }
      }
      let opts: Record<string, unknown>
      if (model === 'fast') opts = { dtype: 'q8', device: 'wasm' }
      else opts = (await hasWebGPU()) ? { dtype: 'fp16', device: 'webgpu' } : { dtype: 'fp32', device: 'wasm' }
      const pipe = await pipeline('background-removal', MODELS[model], { ...opts, progress_callback } as never)
      return pipe as unknown as Remover
    })()
    cache.set(model, p)
    p.catch(() => cache.delete(model))
  }
  return p
}

/** Returns a PNG data URL of the image with a transparent background. */
export async function removeBackground(
  imageUrl: string,
  model: BgModel = 'fast',
  onProgress?: (stage: 'download' | 'process', pct?: number) => void,
): Promise<string> {
  const remover = await getRemover(model, (pct) => onProgress?.('download', pct))
  onProgress?.('process')
  const out = await remover(imageUrl)
  const c = out.toCanvas()
  if (c instanceof HTMLCanvasElement) return c.toDataURL('image/png')
  const blob = await (c as OffscreenCanvas).convertToBlob({ type: 'image/png' })
  return await new Promise<string>((resolve) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.readAsDataURL(blob)
  })
}
