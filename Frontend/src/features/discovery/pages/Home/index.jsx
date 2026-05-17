/* HomePage — main feed with multiple sections */
import HeroSection           from './HeroSection'
import TrendingSection       from './TrendingSection'
import CategoriesSection     from './CategoriesSection'
import CollectionsSection    from './CollectionsSection'
import WritersPickSection    from './WritersPickSection'
import CompetitionWinnerSection from './CompetitionWinnerSection'
import TopQuestionsSection   from './TopQuestionsSection'

export default function HomePage() {
  return (
    <div className="max-w-300 px-8 pt-12 pb-20">
      <HeroSection />
      <TrendingSection />
      <CategoriesSection />
      <CompetitionWinnerSection />
      <CollectionsSection />
      <TopQuestionsSection />
      <WritersPickSection />
    </div>
  )
}
