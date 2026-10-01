import { useParams } from 'react-router-dom'
import { collections, infoPages } from '../data/pages'
import { ComingSoon } from './ComingSoon'
import { NotFound } from './NotFound'

export function InfoPage() {
  const { page = '' } = useParams()
  const title = infoPages[page]
  return title ? <ComingSoon title={title} /> : <NotFound />
}

export function CollectionPage() {
  const { slug = '' } = useParams()
  const title = collections[slug]
  return title ? <ComingSoon title={title} /> : <NotFound />
}
