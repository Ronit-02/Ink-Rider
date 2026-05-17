/* TrendingSection — numbered trending list */
import { useNavigate } from 'react-router-dom'
import { articles } from '@/shared/data'
import SectionHeading from '@/shared/components/ui/SectionHeading'
import AuthorMeta from '@/shared/components/ui/AuthorMeta'

function TrendingCard({ article, rank }) {
  const navigate = useNavigate()
  return (
    <div onClick={() => navigate(`/post/${article.id}`)}
      className="hover-lift flex gap-[14px] cursor-pointer py-3 border-b border-[var(--color-border-light)]">
      <span className="text-[32px] font-extrabold text-[var(--color-border-light)] leading-none
        flex-shrink-0 w-9 text-right" style={{ fontFamily: 'var(--font-display)' }}>
        {String(rank).padStart(2, '0')}
      </span>
      <div className="flex-1 min-w-0">
        <AuthorMeta author={article.author} size="sm" />
        <h3 className="font-bold text-[14px] text-[var(--color-text)] leading-[1.4] my-[5px] line-clamp-2"
          style={{ fontFamily: 'var(--font-display)' }}>{article.title}</h3>
        <p className="text-[12px] text-[var(--color-text-muted)]">{article.readTime}</p>
      </div>
    </div>
  )
}

export default function TrendingSection() {
  return (
    <div className="fade-in fade-in-1 mb-[52px]">
      <SectionHeading className="mb-6">Trending Today</SectionHeading>
      <div className="grid gap-x-10" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))' }}>
        {articles.slice(0, 6).map((a, i) => <TrendingCard key={a.id} article={a} rank={i + 1} />)}
      </div>
    </div>
  )
}
