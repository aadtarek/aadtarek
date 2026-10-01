import { Link } from 'react-router-dom'
import { findProductById } from '../api/catalog'
import { PageHeader } from '../components/PageHeader'
import { ProductCard } from '../components/ProductCard'
import { useWishlist } from '../store/wishlist'

export function Wishlist() {
  const { ids } = useWishlist()
  const items = ids.map(findProductById).filter((p) => p !== undefined)

  return (
    <div className="pb-16">
      <PageHeader eyebrow="Saved for later" title="Your Wishlist." />
      <div className="container-x">
        {items.length === 0 ? (
          <div className="border-t border-line py-16 text-center">
            <p className="font-serif text-3xl">No favorites yet.</p>
            <p className="mt-2 text-muted">Tap the heart on any fragrance to save it here.</p>
            <Link
              to="/shop"
              className="mt-6 inline-flex h-12 items-center rounded-[3px] bg-olive px-8 text-[12px] font-medium tracking-[0.12em] text-cream uppercase hover:bg-olive-hover"
            >
              Explore fragrances
            </Link>
          </div>
        ) : (
          <ul className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
