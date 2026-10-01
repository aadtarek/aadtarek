import { BestSellers } from '../components/BestSellers'
import { FeatureStrip } from '../components/FeatureStrip'
import { Hero } from '../components/Hero'

export function Home() {
  return (
    <>
      <Hero />
      <FeatureStrip />
      <BestSellers />
    </>
  )
}
