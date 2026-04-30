import { articles } from '@/data'
import FeaturedCard from '@/components/article/FeaturedCard'
import CompactCard from '@/components/article/CompactCard'
import SectionHeading from '@/components/ui/SectionHeading'

export default function HeroSection() {
  const hero = articles[0]
  const recommendations = articles.slice(1, 5)

  return (
    <div
      className="fade-in"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 48,
        marginBottom: 52,
      }}
    >
      {/* Article of the Day */}
      <div style={{ minWidth: 0 }}>
        <SectionHeading style={{ marginBottom: 20 }}>Article of the day</SectionHeading>
        <FeaturedCard article={hero} />
      </div>

      {/* Top Recommendations */}
      <div style={{ minWidth: 0 }}>
        <SectionHeading style={{ marginBottom: 20 }}>Top Recommendations</SectionHeading>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0 24px'}}>
          {recommendations.map((article) => (
            <CompactCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </div>
  )
}
