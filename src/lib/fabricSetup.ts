import { FabricObject, InteractiveFabricObject, StaticCanvas, type FabricObject as FO } from 'fabric'
import { ensureFontsForJson } from './fonts'

// Positions everywhere are top-left based (like design tools & PSD files).
FabricObject.ownDefaults.originX = 'left'
FabricObject.ownDefaults.originY = 'top'
InteractiveFabricObject.ownDefaults.cornerStyle = 'circle'
InteractiveFabricObject.ownDefaults.cornerColor = '#ffffff'
InteractiveFabricObject.ownDefaults.cornerStrokeColor = '#7c3aed'
InteractiveFabricObject.ownDefaults.borderColor = '#7c3aed'
InteractiveFabricObject.ownDefaults.transparentCorners = false
InteractiveFabricObject.ownDefaults.cornerSize = 12
InteractiveFabricObject.ownDefaults.borderScaleFactor = 2
InteractiveFabricObject.ownDefaults.padding = 2

/** Extra properties we store with every object. */
export const EXTRA_PROPS = [
  'name',
  'locked',
  'selectable',
  'evented',
  'hasControls',
  'lockMovementX',
  'lockMovementY',
  'lockScalingX',
  'lockScalingY',
  'lockRotation',
  'visible',
]

export type Obj = FO & { name?: string; locked?: boolean }

export function setLocked(o: Obj, locked: boolean) {
  o.set({
    locked,
    lockMovementX: locked,
    lockMovementY: locked,
    lockScalingX: locked,
    lockScalingY: locked,
    lockRotation: locked,
    hasControls: !locked,
  } as Partial<Obj>)
}

/** Render a serialized page to an image data URL using an off-screen canvas. */
export async function renderPage(
  json: Record<string, unknown> | null,
  width: number,
  height: number,
  opts: { multiplier?: number; format?: 'png' | 'jpeg'; quality?: number; transparent?: boolean } = {},
): Promise<string> {
  const el = document.createElement('canvas')
  const sc = new StaticCanvas(el, { width, height, enableRetinaScaling: false, renderOnAddRemove: false })
  if (json) {
    await ensureFontsForJson(json)
    await sc.loadFromJSON(json)
  } else {
    sc.backgroundColor = '#ffffff'
  }
  if (opts.transparent) {
    sc.backgroundColor = ''
    sc.backgroundImage = undefined
  } else if (!sc.backgroundColor && opts.format === 'jpeg') {
    sc.backgroundColor = '#ffffff'
  }
  sc.renderAll()
  const url = sc.toDataURL({
    format: opts.format ?? 'png',
    quality: opts.quality ?? 0.92,
    multiplier: opts.multiplier ?? 1,
  })
  sc.dispose()
  return url
}
