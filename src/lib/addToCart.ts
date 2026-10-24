import type { useCart } from '../store/cart'
import type { Product } from '../types'
import { flyToCart } from './fx'

type Cart = ReturnType<typeof useCart>

/** Adds to the cart with the flight to the cart button, then opens the cart. */
export function addWithFlight(cart: Cart, from: EventTarget | null, product: Product, variationId: number, quantity = 1) {
  cart.add(product.id, variationId, quantity, { open: false })
  flyToCart(from instanceof HTMLElement ? from : null, product.images[0]?.src).then(cart.open)
}
