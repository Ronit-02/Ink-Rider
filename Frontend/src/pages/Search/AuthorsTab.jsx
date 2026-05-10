/* AuthorsTab — author search results with follow toggle */
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authors } from '@/data'
import Button from '@/components/ui/Button'

function AuthorRow({ author }) {
  const navigate  = useNavigate()
  const [following, setFollowing] = useState(false)

  return (
    <div className="flex items-center justify-between py-[14px] border-b border-[var(--color-border)]">
      {/* Author info — click → author page */}
      <div className="flex items-center gap-3 cursor-pointer"
        onClick={() => navigate('/author')}>
        <img src={author.avatar} alt={author.name}
          className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
        <div>
          <p className="font-semibold text-[14px] mb-0.5 text-[var(--color-text)]">{author.name}</p>
          <p className="text-[12px] text-[var(--color-text-muted)]">{author.bio?.slice(0, 80)}…</p>
        </div>
      </div>
      <Button variant={following ? 'secondary' : 'primary'}
        onClick={() => setFollowing(v => !v)}
        className="text-[12px] flex-shrink-0 ml-4">
        {following ? 'Following' : 'Follow'}
      </Button>
    </div>
  )
}

export default function AuthorsTab() {
  const [params]  = useSearchParams()
  const query     = params.get('q') || ''
  const filtered  = query
    ? authors.filter(a => a.name.toLowerCase().includes(query.toLowerCase()))
    : authors

  if (!filtered.length)
    return <p className="text-[13px] text-[var(--color-text-muted)] mt-8">No authors found for "{query}".</p>

  return <div>{filtered.map(a => <AuthorRow key={a.id} author={a} />)}</div>
}
