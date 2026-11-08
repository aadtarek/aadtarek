import { BestSellers } from '../components/BestSellers'
import { Deferred } from '../components/Deferred'
import { Hero } from '../components/Hero'
import { HeroSlider } from '../components/HeroSlider'
import { HERO_SLIDER } from '../config'
import { lazy } from 'react'

// Below the first screen: downloaded only when the visitor scrolls near them.
const WearVideosSection = lazy(() => import('../components/WearVideos').then((m) => ({ default: m.WearVideosSection })))
const BundleBuilder = lazy(() => import('../components/BundleBuilder').then((m) => ({ default: m.BundleBuilder })))
const ExploreFamilies = lazy(() => import('../components/ExploreFamilies').then((m) => ({ default: m.ExploreFamilies })))
const StandardSection = lazy(() => import('../components/StandardSection').then((m) => ({ default: m.StandardSection })))
const ReviewsSection = lazy(() => import('../components/ReviewsSection').then((m) => ({ default: m.ReviewsSection })))

export function Home() {
  return (
    <>
      {HERO_SLIDER.enabled ? <HeroSlider /> : <Hero />}
      <BestSellers />
      {/* Below the first screen: built and laid out only when they come near. */}
      <Deferred height={760}>
        <WearVideosSection />
      </Deferred>
      <Deferred height={820}>
        <BundleBuilder />
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
