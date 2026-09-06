import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthorMeta from '@/shared/components/ui/AuthorMeta'
import Tag from '@/shared/components/ui/Tag'
import ImageBox from '@/shared/components/ui/ImageBox'

function BookmarkIcon({ filled }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
    </svg>
  )
}

export default function FeaturedCard({ article }) {
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)

  return (
    <div
      className="hover-lift cursor-pointer bg-[var(--color-surface)] rounded-sm overflow-hidden group relative"
      onClick={() => navigate(`/post/${article.id}`)}
    >
      <ImageBox src={article.image} alt={article.title} height={220} radius="0" />

      {/* Bookmark overlay */}
      <button
        onClick={e => { e.stopPropagation(); setSaved(v => !v) }}
        type="button"
        aria-label={saved ? `Remove ${article.title} from saved articles` : `Save ${article.title}`}
        aria-pressed={saved}
        className={`absolute top-2 right-2 min-h-10 min-w-10 rounded-full flex items-center justify-center
          border border-[var(--color-border)] transition-all duration-150 opacity-0 group-hover:opacity-100
          focus-visible:opacity-100
          ${saved ? 'bg-[var(--color-accent)] text-[var(--color-text-inverted)]' : 'bg-white/90 text-[var(--color-text-secondary)]'}`}
      >
        <BookmarkIcon filled={saved} />
      </button>

      <div className="pt-4 pb-2 px-2 flex flex-col gap-2">
        <AuthorMeta author={article.author} readTime={article.readTime} date={article.date} />
        <h3
          className="font-bold text-[16px] text-[var(--color-text)] leading-[1.4] mt-[10px] tracking-[-0.2px]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {article.title}
        </h3>
        {article.tags?.length > 0 && (
          <div className="flex gap-[6px] mt-[10px] flex-wrap">
            {article.tags.map(t => <Tag key={t} label={t} clickable />)}
          </div>
        )}
      </div>
    </div>
  )
}
