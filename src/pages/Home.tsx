import { BestSellers } from '../components/BestSellers'
import { BundleBuilder } from '../components/BundleBuilder'
import { ExploreFamilies } from '../components/ExploreFamilies'
import { FeatureStrip } from '../components/FeatureStrip'
import { Hero } from '../components/Hero'
import { HeroSpotlight } from '../components/HeroSpotlight'
import { HERO_SLIDER } from '../config'
import { ReviewsSection } from '../components/ReviewsSection'
import { StandardSection } from '../components/StandardSection'
import { WearVideosSection } from '../components/WearVideos'

export function Home() {
  return (
    <>
      {HERO_SLIDER.enabled ? <HeroSpotlight /> : <Hero />}
      <FeatureStrip />
      <BestSellers />
      <BundleBuilder />
      <WearVideosSection />
      <ExploreFamilies />
      <StandardSection />
      <ReviewsSection />
    </>
  )
}
