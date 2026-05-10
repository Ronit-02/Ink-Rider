/* CollectionsPage — browse + filter collections, create popup */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collections, articles, authors } from '@/data'
import SectionHeading from '@/components/ui/SectionHeading'
import Button from '@/components/ui/Button'
import Pill from '@/components/ui/Pill'

// ─── Extended seed data ────────────────────────────────────────────────────────
export const ALL_COLLECTIONS = [
  ...collections.map(c => ({ ...c, createdAt: 'Dec 1, 2024', author: authors[0] })),
  { id: 3, title: 'AI & the Creative Mind', description: 'The best thinking on what AI means for writers and the creative process.', stories: 18, image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80', curator: null, recommended: true, tag: "Editor's Pick", createdAt: 'Nov 28, 2024', author: null },
  { id: 4, title: 'The Science of Everything', description: 'Approachable science writing that doesn\'t dumb anything down.', stories: 24, image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80', curator: null, recommended: true, tag: 'Trending', createdAt: 'Nov 20, 2024', author: null },
  { id: 5, title: 'Remote Work Diaries', description: 'Stories from writers who took their work on the road.', stories: 11, image: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=600&q=80', curator: { name: 'Inu Etc', avatar: authors[5].avatar }, createdAt: 'Nov 10, 2024', author: authors[5] },
  { id: 6, title: 'Slow Philosophy', description: 'Long-form essays on ideas worth sitting with.', stories: 9, image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80', curator: { name: 'Mill Hoorneat', avatar: authors[8].avatar }, createdAt: 'Oct 30, 2024', author: authors[8] },
]

const FILTERS = ['All', "Editor's Pick", 'By Authors', 'Trending']

// ─── Collection Card ───────────────────────────────────────────────────────────
function CollectionCard({ collection }) {
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)

  return (
    <div className="hover-lift bg-[var(--color-surface)] rounded-[20px] border border-[var(--color-border)]
      overflow-hidden cursor-pointer flex flex-col"
      onClick={() => navigate(`/collections/${collection.id}`)}>
      {/* Image */}
      <div className="relative">
        <img src={collection.image} alt={collection.title} className="w-full h-[160px] object-cover block" />
        {collection.tag && (
          <span className="absolute top-3 left-3 px-[10px] py-[3px] rounded-full text-[10px] font-semibold
            bg-black/60 text-white">{collection.tag}</span>
        )}
        <button onClick={e => { e.stopPropagation(); setSaved(v => !v) }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center border
            border-[var(--color-border)] transition-all cursor-pointer
            ${saved ? 'bg-[var(--color-accent)] text-[var(--color-text-inverted)]' : 'bg-white/90 text-[var(--color-text-secondary)]'}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col">
        {collection.curator ? (
          <div className="flex items-center gap-2 mb-[10px]">
            <img src={collection.curator.avatar} alt={collection.curator.name}
              className="w-6 h-6 rounded-full object-cover" />
            <span className="text-[12px] text-[var(--color-text-secondary)] font-medium">
              by {collection.curator.name}
            </span>
          </div>
        ) : (
          <div className="mb-[10px]">
            <span className="text-[10px] px-2 py-[2px] rounded-full bg-[var(--color-bg-alt)]
              text-[var(--color-text-muted)] font-medium">✦ Recommended by Ink Rider</span>
          </div>
        )}
        <h3 className="font-bold text-[16px] text-[var(--color-text)] leading-[1.35] mb-2"
          style={{ fontFamily: 'var(--font-display)' }}>{collection.title}</h3>
        <p className="text-[12px] text-[var(--color-text-secondary)] leading-[1.6] flex-1 line-clamp-3">
          {collection.description}
        </p>
        <div className="mt-3 flex justify-between items-center">
          <span className="text-[12px] text-[var(--color-text-muted)] font-medium">{collection.stories} stories</span>
          <span className="text-[12px] text-[var(--color-accent)] font-semibold">View →</span>
        </div>
      </div>
    </div>
  )
}

// ─── Create Collection popup ───────────────────────────────────────────────────
function CreateModal({ onClose }) {
  const [title, setTitle]   = useState('')
  const [desc,  setDesc]    = useState('')
  const [selected, setSelected] = useState([])

  const togglePost = id =>
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-[var(--color-surface)] rounded-[20px] border border-[var(--color-border)]
        p-6 w-full max-w-[540px] shadow-[0_16px_48px_rgba(0,0,0,0.15)] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-[18px] text-[var(--color-text)]"
            style={{ fontFamily: 'var(--font-display)' }}>New Collection</h3>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full border border-[var(--color-border)] bg-transparent
              text-[var(--color-text-muted)] flex items-center justify-center cursor-pointer text-[18px]">×</button>
        </div>

        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Collection title"
          className="w-full px-[14px] py-[10px] border border-[var(--color-border)] rounded-[10px]
            bg-[var(--color-bg-alt)] text-[13px] text-[var(--color-text)] mb-3 outline-none"
        />
        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="What is this collection about?"
          className="w-full px-[14px] py-[10px] border border-[var(--color-border)] rounded-[10px]
            bg-[var(--color-bg-alt)] text-[13px] text-[var(--color-text)] resize-none h-[80px]
            font-[inherit] outline-none mb-5"
        />

        <p className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.06em] mb-3">
          Select from your posts
        </p>
        <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto mb-5">
          {articles.slice(0, 6).map(a => (
            <label key={a.id}
              className="flex items-center gap-3 p-3 rounded-[10px] border border-[var(--color-border)]
                cursor-pointer hover:bg-[var(--color-bg-alt)] transition-colors">
              <input type="checkbox" checked={selected.includes(a.id)} onChange={() => togglePost(a.id)}
                className="w-4 h-4 cursor-pointer" />
              <img src={a.image} alt={a.title} className="w-10 h-10 rounded-[6px] object-cover flex-shrink-0" />
              <span className="text-[13px] text-[var(--color-text)] font-medium line-clamp-1">{a.title}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onClose} disabled={!title.trim() || !selected.length}>
            Create Collection
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Collections Page ──────────────────────────────────────────────────────────
export default function CollectionsPage() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [showCreate,   setShowCreate]   = useState(false)

  const filtered = ALL_COLLECTIONS.filter(col => {
    if (activeFilter === 'All')          return true
    if (activeFilter === "Editor's Pick") return col.recommended && col.tag === "Editor's Pick"
    if (activeFilter === 'Trending')     return col.tag === 'Trending'
    if (activeFilter === 'By Authors')   return !!col.curator
    return true
  })

  return (
    <div className="max-w-[1200px] px-8 pt-12 pb-20">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-9 gap-6 flex-wrap">
        <div>
          <SectionHeading className="mb-2">Collections</SectionHeading>
          <p className="text-[13px] text-[var(--color-text-secondary)] max-w-[480px]">
            Curated sets of articles — handpicked by authors you love, or recommended by Ink Rider.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowCreate(true)}>+ Create Collection</Button>
      </div>

      {/* ── Filters ── */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {FILTERS.map(f => <Pill key={f} label={f} active={activeFilter === f} onClick={() => setActiveFilter(f)} />)}
      </div>

      {/* ── Grid ── */}
      <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {filtered.map(col => <CollectionCard key={col.id} collection={col} />)}
      </div>

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}
