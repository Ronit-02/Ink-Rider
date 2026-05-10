/* TrendingTab — trending articles inside Explore */
import { useNavigate } from 'react-router-dom'
import { articles } from '@/data'
import HorizontalCard from '@/components/article/HorizontalCard'
import SectionHeading from '@/components/ui/SectionHeading'

export default function TrendingTab() {
  return (
    <div>
      <SectionHeading className="mb-6">Trending Now</SectionHeading>
      {articles.map(a => <HorizontalCard key={a.id} article={a} />)}
    </div>
  )
}
