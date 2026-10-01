import { BestSellers } from '../components/BestSellers'
import { ExploreFamilies } from '../components/ExploreFamilies'
import { FeatureStrip } from '../components/FeatureStrip'
import { Hero } from '../components/Hero'
import { ReviewsSection } from '../components/ReviewsSection'
import { StandardSection } from '../components/StandardSection'

export function Home() {
  return (
    <>
      <Hero />
      <FeatureStrip />
      <BestSellers />
      <ExploreFamilies />
      <StandardSection />
      <ReviewsSection />
    </>
  )
}
