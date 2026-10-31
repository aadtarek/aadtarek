import { Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState, ghostButton, primaryButton } from '../components/PageHeader'

export function NotFound() {
  return (
    <div className="container-x py-8 lg:py-12">
      <EmptyState icon={<Compass className="size-9" strokeWidth={1.2} />} title="Page not found" text="The page you’re looking for doesn’t exist or has moved.">
        <Link to="/shop" className={primaryButton}>
          Shop fragrances
        </Link>
        <Link to="/" className={ghostButton}>
          Back to home
        </Link>
      </EmptyState>
    </div>
  )
}
