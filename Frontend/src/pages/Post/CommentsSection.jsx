/* CommentsSection — comments list with like + compose form */
import { useState } from 'react'
import { authors } from '@/data'
import Button from '@/components/ui/Button'

const HeartIcon = ({ f }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill={f ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
)

const SEEDS = [
  { id: 1, author: authors[1], date: 'Dec 14', text: 'Beautifully written. The Simone Weil reference landed perfectly — attention as generosity is such a precise way to describe what you are doing here.', likes: 12, liked: false },
  { id: 2, author: authors[3], date: 'Dec 14', text: 'This resonated deeply. I grew up in a small harbour town too, and I know exactly that quality of afternoon light you describe.', likes: 8, liked: false },
  { id: 3, author: authors[5], date: 'Dec 13', text: 'The "habit of not looking" line stopped me cold.', likes: 24, liked: false },
]

function Comment({ comment, onLike }) {
  return (
    <div className="py-5 border-b border-[var(--color-border)]">
      <div className="flex items-start gap-3">
        <img src={comment.author.avatar} alt={comment.author.name}
          className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-[6px]">
            <span className="font-semibold text-[13px] text-[var(--color-text)]">{comment.author.name}</span>
            <span className="text-[12px] text-[var(--color-text-muted)]">{comment.date}</span>
          </div>
          <p className="text-[13px] text-[var(--color-text)] leading-[1.6] mb-[10px]">{comment.text}</p>
          <button onClick={() => onLike(comment.id)}
            className={`inline-flex items-center gap-[5px] border-none bg-transparent text-[12px]
              font-medium cursor-pointer transition-all p-0
              ${comment.liked ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}`}>
            <HeartIcon f={comment.liked} /> {comment.likes}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CommentsSection({ articleId }) {
  const [comments, setComments] = useState(SEEDS)
  const [text, setText]         = useState('')

  const handleLike = id =>
    setComments(prev => prev.map(c =>
      c.id === id ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 } : c
    ))

  const handleSubmit = () => {
    if (!text.trim()) return
    setComments(prev => [{ id: Date.now(), author: authors[0], date: 'Just now', text: text.trim(), likes: 0, liked: false }, ...prev])
    setText('')
  }

  return (
    <div>
      {/* Header */}
      <h3 className="font-bold text-[22px] mb-6 text-[var(--color-text)]"
        style={{ fontFamily: 'var(--font-display)' }}>
        Comments ({comments.length})
      </h3>

      {/* Compose box */}
      <div className="bg-[var(--color-bg-alt)] rounded-[20px] border border-[var(--color-border)] p-5 mb-8">
        <div className="flex gap-3 items-start">
          <img src="https://i.pravatar.cc/36?img=47" alt="you"
            className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
          <div className="flex-1">
            <textarea value={text} onChange={e => setText(e.target.value)}
              placeholder="Add your comment…"
              className="w-full min-h-[80px] border-none bg-transparent text-[13px] text-[var(--color-text)]
                leading-[1.6] resize-none font-[inherit] outline-none"
            />
            {text.trim() && (
              <div className="flex justify-end gap-2 mt-[10px]">
                <Button variant="secondary" onClick={() => setText('')}>Cancel</Button>
                <Button variant="primary"   onClick={handleSubmit}>Comment</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comments list */}
      {comments.map(c => <Comment key={c.id} comment={c} onLike={handleLike} />)}
    </div>
  )
}
