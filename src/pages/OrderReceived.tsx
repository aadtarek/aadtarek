import { Check } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState, ghostButton, primaryButton } from '../components/PageHeader'
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
    <div className="container-x py-8 lg:py-12">
      <EmptyState
        icon={<Check className="size-9" strokeWidth={1.4} />}
        title="Thank you for your order"
        text={
          <>
            Order <strong className="text-ink">#{id}</strong> has been received. A confirmation is on its way to your email.
          </>
        }
      >
        <Link to="/shop" className={primaryButton}>
          Continue shopping
        </Link>
        <Link to="/track-order" className={ghostButton}>
          Track your order
        </Link>
      </EmptyState>
    </div>
  )
}
