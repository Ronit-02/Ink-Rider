import { useNavigate } from 'react-router-dom'
import { articles } from '@/shared/data'
import AuthorMeta from '@/shared/components/ui/AuthorMeta'

export default function ShortsTab() {
  const navigate = useNavigate()

  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
      {articles.slice(0, 9).map(a => (
        <div key={a.id}
          className="cursor-pointer bg-[var(--color-surface)] rounded-[14px] border border-[var(--color-border)]
            overflow-hidden hover:shadow-md transition-all"
          onClick={() => navigate(`/post/${a.id}`)}>
          <img src={a.image} alt={a.title} className="w-full h-[120px] object-cover block" />
          <div className="p-3">
            <AuthorMeta author={a.author} size="sm" />
            <p className="font-semibold text-[13px] text-[var(--color-text)] mt-2 leading-[1.4] line-clamp-2"
              style={{ fontFamily: 'var(--font-display)' }}>{a.title}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
