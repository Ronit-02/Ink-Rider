/* HorizontalCard — list row with image right, bookmark, smart click zones */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthorMeta from '@/components/ui/AuthorMeta'
import Tag from '@/components/ui/Tag'
import ImageBox from '@/components/ui/ImageBox'

function BookmarkIcon({ filled }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
    </svg>
  )
}

export default function HorizontalCard({ article }) {
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)

  return (
    <div
      className="flex gap-4 py-5 border-b border-[var(--color-border)] cursor-pointer rounded transition-all duration-150
        hover:bg-[var(--color-surface-hover)] group"
      onClick={() => navigate(`/post/${article.id}`)}
    >
      {/* Left: text */}
      <div className="flex-1 min-w-0">
        <AuthorMeta author={article.author} readTime={article.readTime} date={article.date} size="sm" />

        <h3
          className="font-bold text-[16px] text-[var(--color-text)] leading-[1.4] my-2 tracking-[-0.2px]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {article.title}
        </h3>

        <p className="text-[13px] text-[var(--color-text-secondary)] leading-[1.6] line-clamp-2">
          {article.excerpt}
        </p>

        <div className="flex items-center gap-2 mt-[10px]">
          {/* Clickable tags */}
          {article.tags?.length > 0 && (
            <div className="flex gap-[6px] flex-wrap">
              {article.tags.map(t => <Tag key={t} label={t} clickable />)}
            </div>
          )}

          {/* Bookmark */}
          <button
            onClick={e => { e.stopPropagation(); setSaved(v => !v) }}
            className={`ml-auto flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center
              border border-[var(--color-border)] transition-all duration-150 opacity-0 group-hover:opacity-100
              ${saved ? 'bg-[var(--color-accent)] text-[var(--color-text-inverted)]' : 'bg-transparent text-[var(--color-text-secondary)]'}`}
          >
            <BookmarkIcon filled={saved} />
          </button>
        </div>
      </div>

      {/* Right: image */}
      <ImageBox src={article.image} alt={article.title} height={110} style={{ width: 140, flexShrink: 0 }} />
    </div>
  )
}
