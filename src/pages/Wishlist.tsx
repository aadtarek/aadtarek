import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { findProductById } from '../api/catalog'
import { EmptyState, PageHeader, ghostButton, primaryButton } from '../components/PageHeader'
import { ProductCard } from '../components/ProductCard'
import { useWishlist } from '../store/wishlist'

export function Wishlist() {
  const { ids } = useWishlist()
  const items = ids.map(findProductById).filter((p) => p !== undefined)

  return (
    <div className="pb-16">
      <PageHeader eyebrow="Saved for later" title="Your wishlist">
        {items.length > 0 && (
          <p className="mt-3 text-[15px] text-ink-soft">
            {items.length} {items.length === 1 ? 'fragrance' : 'fragrances'} you love, kept here for later.
          </p>
        )}
      </PageHeader>
      <div className="container-x mt-6 lg:mt-8">
        {items.length === 0 ? (
          <EmptyState icon={<Heart className="size-9" strokeWidth={1.2} />} title="Nothing saved yet" text="Tap the heart on any fragrance to keep it here.">
            <Link to="/shop" className={primaryButton}>
              Explore fragrances
            </Link>
            <Link to="/finder" className={ghostButton}>
              Take the quiz
            </Link>
          </EmptyState>
        ) : (
          <ul className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {items.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
