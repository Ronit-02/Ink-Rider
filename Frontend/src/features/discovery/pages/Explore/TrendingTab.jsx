import { articles } from '@/shared/data'
import HorizontalCard from '@/features/posts/components/HorizontalCard'
import SectionHeading from '@/shared/components/ui/SectionHeading'

export default function TrendingTab() {
  return (
    <div>
      <SectionHeading className="mb-6">Trending Now</SectionHeading>
      {articles.map(a => <HorizontalCard key={a.id} article={a} />)}
    </div>
  )
}
