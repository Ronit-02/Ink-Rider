/* CompetitionWinnerSection — teaser for competitions page */
import { useNavigate } from 'react-router-dom'
import { articles } from '@/shared/data'
import SectionHeading from '@/shared/components/ui/SectionHeading'
import Button from '@/shared/components/ui/Button'
import AuthorMeta from '@/shared/components/ui/AuthorMeta'

export default function CompetitionWinnerSection() {
  const navigate = useNavigate()
  const winner   = articles[11] // "The Hidden Life of Fungi" — winner of Science Sunday

  return (
    <div className="fade-in fade-in-2 mb-13">

      {/* Competition Heading */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <SectionHeading>Competition Winner</SectionHeading>
          <p className="text-[13px] text-(--color-text-secondary) mt-1">
            The winning post from our latest competition
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/explore/competitions')}>
          View Competitions →
        </Button>
      </div>

      {/* Winner card */}
      <div className="flex gap-5 p-5 bg-(--color-bg-alt) rounded-[20px] border border-(--color-border) cursor-pointer hover:bg-(--color-surface-hover) transition-all group"
        onClick={() => navigate(`/post/${winner.id}`)}>
        <div className="relative shrink-0">
          <img src={winner.image} alt={winner.title} className="w-50 h-35 object-cover rounded-[14px] block" />
          <span className="absolute top-2 left-2 text-[20px]">🥇</span>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-semibold text-(--color-text-muted) uppercase tracking-[0.06em]">
            Science Sunday Vol. 2
          </span>
          <h3 className="font-bold text-[20px] text-(--color-text) leading-[1.35] my-2"
            style={{ fontFamily: 'var(--font-display)' }}>
            {winner.title}
          </h3>
          <p className="text-[13px] text-(--color-text-secondary) leading-[1.6] line-clamp-2 mb-3">
            {winner.excerpt}
          </p>
          <AuthorMeta author={winner.author} readTime={winner.readTime} date={winner.date} size="sm" />
        </div>
      </div>

    </div>
  )
}
