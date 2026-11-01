import type { Layer, Psd, Color } from 'ag-psd'
import { hasArabic, matchFont } from './fonts'

// Converts a Photoshop file into editable Fabric objects:
//  - pixel layers  -> images (keeping position, opacity, blend mode, visibility)
//  - text layers   -> editable text, plus the original rendering as a hidden image
//  - groups        -> flattened, children named "Group / Layer"
// Known limits: layer effects are baked into pixels, adjustment layers / clipping masks
// are not re-created. A hidden "PSD preview" image of the full composite is added at the
// bottom so the user can always compare with the original.

export interface PsdImportResult {
  width: number
  height: number
  objects: Record<string, unknown>[]
}

const BLEND: Record<string, string> = {
  multiply: 'multiply',
  screen: 'screen',
  overlay: 'overlay',
  darken: 'darken',
  lighten: 'lighten',
  'color dodge': 'color-dodge',
  'color burn': 'color-burn',
  'hard light': 'hard-light',
  'soft light': 'soft-light',
  difference: 'difference',
  exclusion: 'exclusion',
  hue: 'hue',
  saturation: 'saturation',
  color: 'color',
  luminosity: 'luminosity',
}

function colorToCss(c?: Color): string | undefined {
  if (!c) return undefined
  const a = c as unknown as Record<string, number>
  const to = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  if ('r' in a) return `rgb(${to(a.r)},${to(a.g)},${to(a.b)})`
  if ('fr' in a) return `rgb(${to(a.fr * 255)},${to(a.fg * 255)},${to(a.fb * 255)})`
  if ('k' in a && 'c' in a) {
    const k = a.k / 100
    return `rgb(${to(255 * (1 - a.c / 100) * (1 - k))},${to(255 * (1 - a.m / 100) * (1 - k))},${to(255 * (1 - a.y / 100) * (1 - k))})`
  }
  return undefined
}

function canvasToUrl(c: HTMLCanvasElement) {
  return c.toDataURL('image/png')
}

export async function importPsd(buffer: ArrayBuffer, previewName = 'PSD preview'): Promise<PsdImportResult> {
  const { readPsd } = await import('ag-psd')
  const psd: Psd = readPsd(buffer, { skipThumbnail: true })
  const objects: Record<string, unknown>[] = []

  if (psd.canvas) {
    objects.push({
      type: 'Image',
      src: canvasToUrl(psd.canvas),
      left: 0,
      top: 0,
      name: previewName,
      visible: !psd.children?.length,
    })
  }

  const walk = (layers: Layer[] | undefined, prefix: string, parentOpacity: number, parentHidden: boolean) => {
    if (!layers) return
    // ag-psd lists layers bottom -> top, which matches Fabric's stacking order.
    for (const layer of layers) {
      const name = (prefix ? prefix + ' / ' : '') + (layer.name || 'Layer')
      const opacity = (layer.opacity ?? 1) * parentOpacity
      const hidden = parentHidden || !!layer.hidden
      if (layer.children) {
        walk(layer.children, name, opacity, hidden)
        continue
      }
      const blend = layer.blendMode ? BLEND[layer.blendMode] : undefined
      const base = {
        left: layer.left ?? 0,
        top: layer.top ?? 0,
        opacity,
        visible: !hidden,
        globalCompositeOperation: blend ?? 'source-over',
      }
      const hasPixels = layer.canvas && layer.canvas.width > 0 && layer.canvas.height > 0

      if (layer.text?.text) {
        if (hasPixels) {
          objects.push({ type: 'Image', src: canvasToUrl(layer.canvas!), ...base, name: name + ' (image)', visible: false })
        }
        objects.push(textLayerToObject(layer, name, base))
      } else if (hasPixels) {
        objects.push({ type: 'Image', src: canvasToUrl(layer.canvas!), ...base, name })
      }
    }
  }
  walk(psd.children, '', 1, false)
  return { width: psd.width, height: psd.height, objects }
}

function textLayerToObject(layer: Layer, name: string, baseIn: Record<string, unknown>) {
  const base = { ...baseIn }
  const t = layer.text!
  const text = t.text.replace(/\r\n?/g, '\n').replace(/\u0003/g, '\n')
  const style = t.styleRuns?.[0]?.style ?? t.style ?? {}
  const tr = t.transform ?? [1, 0, 0, 1, 0, 0]
  const scaleY = Math.hypot(tr[2], tr[3]) || 1
  const scaleX = Math.hypot(tr[0], tr[1]) || 1
  const fontSize = Math.max(4, (style.fontSize ?? 24) * scaleY)
  const just = t.paragraphStyleRuns?.[0]?.style?.justification ?? t.paragraphStyle?.justification ?? 'left'
  const arabic = hasArabic(text)
  const textAlign = just === 'center' ? 'center' : just === 'right' ? 'right' : just.startsWith('justify') ? 'justify' : arabic ? 'right' : 'left'
  const fontName = style.font?.name
  const bold = !!style.fauxBold || /bold|black|heavy/i.test(fontName || '')
  const family = matchFont(fontName, text)
  // Some files have no pixel bounds for text layers; fall back to the text transform and measured width.
  const hasBounds = (layer.right ?? 0) > (layer.left ?? 0)
  const measured = measureText(text, family, fontSize, bold)
  const width = Math.max(hasBounds ? (layer.right ?? 0) - (layer.left ?? 0) : 0, measured) + fontSize * 0.3
  if (!hasBounds) {
    base.left = textAlign === 'center' ? tr[4] - width / 2 : textAlign === 'right' ? tr[4] - width : tr[4]
    base.top = tr[5] - fontSize
  }
  const angle = (Math.atan2(tr[1], tr[0]) * 180) / Math.PI
  return {
    type: 'Textbox',
    text,
    ...base,
    left: (base.left as number) - (hasBounds && textAlign === 'right' ? fontSize * 0.3 : 0),
    width,
    angle: Math.abs(angle) > 0.5 ? angle : 0,
    scaleX: scaleX / scaleY > 1.02 || scaleX / scaleY < 0.98 ? scaleX / scaleY : 1,
    fontFamily: family,
    fontSize,
    fontWeight: bold ? 'bold' : 'normal',
    fontStyle: style.fauxItalic || /italic/i.test(fontName || '') ? 'italic' : 'normal',
    underline: !!style.underline,
    linethrough: !!style.strikethrough,
    fill: colorToCss(style.fillColor) ?? '#000000',
    textAlign,
    direction: arabic ? 'rtl' : 'ltr',
    lineHeight: style.leading && !style.autoLeading ? Math.max(0.6, style.leading / (style.fontSize || 1)) : 1.2,
    charSpacing: arabic ? 0 : Math.round(style.tracking ?? 0),
    name,
  }
}

let measureCtx: CanvasRenderingContext2D | null = null
function measureText(text: string, family: string, size: number, bold: boolean) {
  measureCtx ??= document.createElement('canvas').getContext('2d')
  if (!measureCtx) return text.length * size * 0.6
  measureCtx.font = `${bold ? 'bold' : 'normal'} ${size}px "${family}"`
  return Math.max(...text.split('\n').map((l) => measureCtx!.measureText(l).width)) * 1.08
}
