import { BestSellers } from '../components/BestSellers'
import { ExploreFamilies } from '../components/ExploreFamilies'
import { Hero } from '../components/Hero'
import { HeroSlider } from '../components/HeroSlider'
import { HERO_SLIDER } from '../config'
import { ReviewsSection } from '../components/ReviewsSection'
import { StandardSection } from '../components/StandardSection'
import { WearVideosSection } from '../components/WearVideos'

export function Home() {
  return (
    <>
      {HERO_SLIDER.enabled ? <HeroSlider /> : <Hero />}
      <BestSellers />
      <WearVideosSection />
      <ExploreFamilies />
      <StandardSection />
      <ReviewsSection />
    </>
  )
}
