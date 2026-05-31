import { useNavigate } from 'react-router-dom'

export default function CompactCard({ article }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/post/${article.id}`)}
      className="flex gap-3 py-3 cursor-pointer border-b border-[var(--color-border-light)]
        transition-opacity duration-150 hover:opacity-70"
    >
      {/* Author avatar — click goes to author page */}
      <button
        onClick={e => { e.stopPropagation(); navigate('/author') }}
        className="p-0 border-none bg-transparent cursor-pointer flex-shrink-0"
      >
        <img
          src={article.author.avatar}
          alt={article.author.name}
          loading="lazy"
          className="w-11 h-11 rounded-[10px] object-cover"
        />
      </button>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-2 mb-1">
          <button
            onClick={e => { e.stopPropagation(); navigate('/author') }}
            className="text-[12px] text-[var(--color-text-secondary)] font-medium bg-transparent border-none cursor-pointer p-0
              hover:text-[var(--color-text)] transition-colors"
          >
            {article.author.name}
          </button>
          <span className="text-[12px] text-[var(--color-text-muted)] whitespace-nowrap">{article.readTime}</span>
        </div>
        <p className="text-[14px] font-semibold text-[var(--color-text)] leading-[1.35] line-clamp-2">
          {article.title}
        </p>
      </div>
    </div>
  )
}
