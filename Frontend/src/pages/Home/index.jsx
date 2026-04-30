import HeroSection from './HeroSection'
import CategoriesSection from './CategoriesSection'
import CollectionsSection from './CollectionsSection'

export default function HomePage() {
  return (
    <div style={{ maxWidth: 1200, margin: '0', padding: '48px 32px' }}>
      <HeroSection />
      <CategoriesSection />
      <CollectionsSection />
    </div>
  )
}
