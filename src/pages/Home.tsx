import { BestSellers } from '../components/BestSellers'
import { Deferred } from '../components/Deferred'
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
      {/* Below the first screen: built and laid out only when they come near. */}
      <Deferred height={760}>
        <WearVideosSection />
      </Deferred>
      <Deferred height={900}>
        <ExploreFamilies />
      </Deferred>
      <Deferred height={700}>
        <StandardSection />
      </Deferred>
      <Deferred height={620}>
        <ReviewsSection />
      </Deferred>
    </>
  )
}
