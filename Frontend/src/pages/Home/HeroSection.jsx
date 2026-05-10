/* HeroSection — article of the day + top recommendations */
import { articles } from '@/data'
import FeaturedCard from '@/components/article/FeaturedCard'
import CompactCard from '@/components/article/CompactCard'
import SectionHeading from '@/components/ui/SectionHeading'

export default function HeroSection() {
  const hero            = articles[0]
  const recommendations = articles.slice(1, 5)

  return (
    <div className="grid gap-12 mb-13 fade-in max-sm:grid-cols-1"
      style={{ gridTemplateColumns: '1fr 1fr' }}>
      
      {/* Article of the Day */}
      <div className="min-w-0">
        <SectionHeading className="mb-5">Article of the day</SectionHeading>
        <FeaturedCard article={hero} />
      </div>
      
      {/* Top Recommendations */}
      <div className="min-w-0">
        <SectionHeading className="mb-5">Top Recommendations</SectionHeading>
        <div className="grid gap-x-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))' }}>
          {recommendations.map(a => <CompactCard key={a.id} article={a} />)}
        </div>
      </div>

    </div>
  )
}
