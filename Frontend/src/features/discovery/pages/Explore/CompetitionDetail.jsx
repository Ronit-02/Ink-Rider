/* CompetitionDetail — full competition page */
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { articles } from '@/shared/data'
import Button from '@/shared/components/ui/Button'
import AuthorMeta from '@/shared/components/ui/AuthorMeta'
import Divider from '@/shared/components/ui/Divider'
import { COMPETITIONS } from './CompetitionsTab'

const HeartIcon = ({ f }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill={f ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
)

const ENTRIES = [
  { id: 1, article: articles[0], likes: 48, liked: false },
  { id: 2, article: articles[2], likes: 32, liked: false },
  { id: 3, article: articles[4], likes: 27, liked: false },
]

function EntryCard({ entry, rank }) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(entry.likes)
  const medals = ['🥇', '🥈', '🥉']
  return (
    <div className="bg-[var(--color-surface)] rounded-[20px] border border-[var(--color-border)] overflow-hidden flex flex-col">
      <div className="relative">
        <img src={entry.article.image} alt={entry.article.title} className="w-full h-[160px] object-cover block" />
        {rank <= 3 && <div className="absolute top-[10px] left-[10px] bg-black/60 rounded-full px-[10px] py-1 text-[14px]">{medals[rank-1]}</div>}
      </div>
      <div className="p-4 flex-1">
        <AuthorMeta author={entry.article.author} readTime={entry.article.readTime} size="sm" />
        <h3 className="font-bold text-[14px] text-[var(--color-text)] leading-[1.4] mt-2 mb-3 line-clamp-2"
          style={{ fontFamily: 'var(--font-display)' }}>{entry.article.title}</h3>
        <div className="flex justify-between items-center">
          <button onClick={() => { setLiked(v => !v); setLikes(n => liked ? n-1 : n+1) }}
            className={`flex items-center gap-[6px] px-3 py-[5px] rounded-full border text-[12px] font-medium cursor-pointer transition-all
              ${liked ? 'bg-[var(--color-accent)] text-[var(--color-text-inverted)] border-[var(--color-accent)]'
                      : 'bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border)]'}`}>
            <HeartIcon f={liked} /> {likes}
          </button>
          <span className="text-[12px] text-[var(--color-accent)] font-medium cursor-pointer">Read →</span>
        </div>
      </div>
    </div>
  )
}

function EnterModal({ compTitle, onClose }) {
  const [note, setNote]   = useState('')
  const [post, setPost]   = useState('')
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={e => { if(e.target===e.currentTarget) onClose() }}>
      <div className="bg-[var(--color-surface)] rounded-[20px] border border-[var(--color-border)] p-6 w-full max-w-[520px]
        shadow-[0_16px_48px_rgba(0,0,0,0.15)] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-[18px] text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
            Enter: {compTitle}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full border border-[var(--color-border)] bg-transparent
            text-[var(--color-text-muted)] flex items-center justify-center cursor-pointer text-[18px]">×</button>
        </div>
        <p className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.06em] mb-2">Select a post</p>
        <select value={post} onChange={e => setPost(e.target.value)}
          className="w-full px-[14px] py-[10px] border border-[var(--color-border)] rounded-[10px]
            bg-[var(--color-bg-alt)] text-[13px] text-[var(--color-text)] mb-4 outline-none cursor-pointer">
          <option value="">— Choose one of your posts —</option>
          {articles.slice(0,4).map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
        </select>
        <p className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.06em] mb-2">Author's note (optional)</p>
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Tell the judges what makes this piece special…"
          className="w-full px-[14px] py-[10px] border border-[var(--color-border)] rounded-[10px]
            bg-[var(--color-bg-alt)] text-[13px] text-[var(--color-text)] resize-none h-[80px] font-[inherit] outline-none mb-5"
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!post} onClick={onClose}>Submit Entry</Button>
        </div>
      </div>
    </div>
  )
}

export default function CompetitionDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const comp     = COMPETITIONS.find(c => c.id === Number(id)) ?? COMPETITIONS[0]
  const [entered,   setEntered]   = useState(false)
  const [showModal, setShowModal] = useState(false)
  const isOpen = comp.status === 'open'

  return (
    <div className="max-w-[800px] px-6 pt-8 pb-20">
      <button onClick={() => navigate(-1)}
        className="inline-flex items-center gap-[6px] bg-[var(--color-bg-alt)] border border-[var(--color-border)]
          text-[var(--color-text-secondary)] text-[13px] cursor-pointer mb-7 px-[14px] py-[6px]
          rounded-full transition-all hover:bg-[var(--color-border)]">
        ← Back
      </button>

      <img src={comp.image} alt={comp.title} className="w-full h-[240px] object-cover rounded-[20px] block mb-6" />

      <div className="flex gap-2 mb-4 flex-wrap">
        <span className={`px-[10px] py-[3px] rounded-full text-[11px] font-semibold
          ${isOpen ? 'bg-[#FFF3CD] text-[#856404]' : 'bg-[var(--color-bg-alt)] text-[var(--color-text-muted)]'}`}>
          {isOpen ? '🏆 Open' : '✓ Closed'} · {comp.closes}
        </span>
        <span className="px-[10px] py-[3px] bg-[var(--color-bg-alt)] rounded-full text-[11px] text-[var(--color-text-secondary)]">{comp.entries} participants</span>
        <span className="px-[10px] py-[3px] bg-[var(--color-bg-alt)] rounded-full text-[11px] text-[var(--color-text-secondary)]">Prize pool: {comp.prizePool}</span>
        <span className="px-[10px] py-[3px] bg-[var(--color-bg-alt)] rounded-full text-[11px] text-[var(--color-text-secondary)]">Results: {comp.resultsDate}</span>
      </div>

      <h1 className="font-bold text-[28px] text-[var(--color-text)] leading-[1.3] mb-3"
        style={{ fontFamily: 'var(--font-display)' }}>{comp.title}</h1>
      <p className="text-[14px] text-[var(--color-text-secondary)] leading-[1.7] mb-6">{comp.description}</p>

      <div className="flex gap-3 mb-8 flex-wrap">
        {comp.prizes.map(p => (
          <div key={p.rank} className="flex-1 min-w-[100px] p-3 bg-[var(--color-bg-alt)] rounded-[10px] text-center border border-[var(--color-border)]">
            <p className="text-[12px] font-semibold text-[var(--color-text)] mb-1">{p.rank}</p>
            <p className="text-[11px] text-[var(--color-text-secondary)]">{p.amount}</p>
          </div>
        ))}
      </div>

      {isOpen && !entered && (
        <div className="mb-10">
          <Button variant="primary" onClick={() => setShowModal(true)}>Enter Competition</Button>
        </div>
      )}
      {entered && (
        <p className="text-[13px] text-[var(--color-text-secondary)] mb-10">
          ✓ You've entered. Submit before {comp.closes}.
        </p>
      )}

      <Divider className="mb-8" />
      <p className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.08em] mb-4">
        Current Entries — vote for your favourite
      </p>
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))' }}>
        {ENTRIES.map((e,i) => <EntryCard key={e.id} entry={e} rank={i+1} />)}
      </div>

      {showModal && <EnterModal compTitle={comp.title} onClose={() => { setShowModal(false); setEntered(true) }} />}
    </div>
  )
}
