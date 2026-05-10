/* ArticleCard — grid card with smart click zones:
   author → author page, tags → search, bookmark btn, rest → post */
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

export default function ArticleCard({ article }) {
  const navigate   = useNavigate()
  const [saved, setSaved] = useState(false)

  return (
    <div
      className="hover-lift cursor-pointer overflow-hidden rounded-sm group relative"
      onClick={() => navigate(`/post/${article.id}`)}
    >
      {/* Cover image */}
      <ImageBox src={article.image} alt={article.title} height={180} radius="0" />

      {/* Bookmark button — top-right of image */}
      <button
        onClick={e => { e.stopPropagation(); setSaved(v => !v) }}
        className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center
          border border-[var(--color-border)] transition-all duration-150 opacity-0 group-hover:opacity-100
          ${saved ? 'bg-[var(--color-accent)] text-[var(--color-text-inverted)]' : 'bg-white/90 text-[var(--color-text-secondary)]'}`}
      >
        <BookmarkIcon filled={saved} />
      </button>

      {/* Text body */}
      <div className="pt-[14px] pb-2 px-2 flex flex-col gap-[6px]">
        {/* AuthorMeta handles author click internally */}
        <AuthorMeta author={article.author} readTime={article.readTime} />

        <h3 className="font-bold text-[14px] text-[var(--color-text)] leading-[1.45] mt-2
          tracking-[-0.15px] line-clamp-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {article.title}
        </h3>

        {/* Tags — each navigates to search */}
        {article.tags?.length > 0 && (
          <div className="flex gap-[6px] mt-2 flex-wrap">
            {article.tags.slice(0, 2).map(t => <Tag key={t} label={t} clickable />)}
          </div>
        )}
      </div>
    </div>
  )
}
