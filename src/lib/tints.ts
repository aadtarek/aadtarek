import type { FamilySlug, Product } from '../types'

/** Each fragrance takes a soft colour from its family (tint = background, ink = small text). */
export const TINTS: Record<FamilySlug, { tint: string; ink: string }> = {
  oriental: { tint: '#f3e3c9', ink: '#8a5a1c' },
  floral: { tint: '#f6dcdc', ink: '#8f2f3a' },
  fresh: { tint: '#e6ecd2', ink: '#55662a' },
  sweet: { tint: '#f8e2cf', ink: '#94511f' },
  fruity: { tint: '#fadcd2', ink: '#a43f2a' },
}
export const DEFAULT_TINT = { tint: '#f1eadf', ink: '#74695b' }

export function tintFor(product: Product) {
  return (product.families[0] && TINTS[product.families[0]]) || DEFAULT_TINT
}
