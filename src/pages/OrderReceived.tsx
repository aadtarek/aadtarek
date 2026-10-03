import { CheckCircle2 } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCart } from '../store/cart'

/** Where WooCommerce payment gateways return customers after paying. */
export function OrderReceived() {
  const { id = '' } = useParams()
  const cart = useCart()
  const { clear } = cart
  useEffect(() => {
    clear()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <CheckCircle2 className="size-12 text-olive" strokeWidth={1.2} />
      <h1 className="mt-4 font-serif text-[40px] sm:text-[48px]">Thank you for your order.</h1>
      <p className="mt-2 text-ink-soft">
        Order <strong>#{id}</strong> has been received. A confirmation is on its way to your email.
      </p>
      <Link
        to="/shop"
        className="mt-8 inline-flex h-12 items-center rounded-[3px] bg-olive px-8 text-[12px] font-medium tracking-[0.12em] text-cream uppercase hover:bg-olive-hover"
      >
        Continue shopping
      </Link>
    </div>
  )
}
