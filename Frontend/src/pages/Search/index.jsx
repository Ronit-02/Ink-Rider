/* SearchPage — posts, authors, shorts, collections tabs + filters */
import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { articles, authors } from '@/data'
import { ALL_COLLECTIONS } from '@/pages/Collections/index'
import Pill from '@/components/ui/Pill'
import HorizontalCard from '@/components/article/HorizontalCard'
import AuthorsTab from './AuthorsTab'
import ShortsTab from './ShortsTab'

const TABS = [
  { id: 'posts',       label: 'Posts' },
  { id: 'authors',     label: 'Authors' },
  { id: 'collections', label: 'Collections' },
  { id: 'shorts',      label: 'Shorts' },
]

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'newest',    label: 'Newest' },
  { value: 'oldest',    label: 'Oldest' },
]

const DATE_OPTIONS = [
  { value: '',      label: 'Any time' },
  { value: 'week',  label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'year',  label: 'This year' },
]

const CATEGORIES = ['Travel', 'AI', 'Science', 'Entrepreneurship', 'Lifestyle', 'Career Education']

function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="px-3 py-[6px] rounded-full border border-[var(--color-border)] bg-[var(--color-bg-alt)]
        text-[12px] text-[var(--color-text)] cursor-pointer outline-none">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

function CollectionRow({ col }) {
  const navigate = useNavigate()
  return (
    <div className="flex gap-4 py-5 border-b border-[var(--color-border)] cursor-pointer
      hover:bg-[var(--color-surface-hover)] rounded transition-all"
      onClick={() => navigate(`/collections/${col.id}`)}>
      <img src={col.image} alt={col.title} className="w-[80px] h-[60px] object-cover rounded-[10px] flex-shrink-0" />
      <div className="flex-1 min-w-0">
        {col.curator && (
          <p className="text-[11px] text-[var(--color-text-muted)] mb-1">by {col.curator.name}</p>
        )}
        <h3 className="font-bold text-[15px] text-[var(--color-text)] mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          {col.title}
        </h3>
        <p className="text-[12px] text-[var(--color-text-secondary)] line-clamp-1">{col.description}</p>
        <p className="text-[11px] text-[var(--color-text-muted)] mt-1">{col.stories} stories</p>
      </div>
    </div>
  )
}

export default function SearchPage() {
  const [params]                       = useSearchParams()
  const [activeTab,      setActiveTab] = useState('posts')
  const [sortBy,         setSortBy]    = useState('relevance')
  const [dateFilter,     setDateFilter]= useState('')
  const [categoryFilter, setCategory]  = useState('')
  const [filteredPosts,  setPosts]     = useState([])
  const [filteredCols,   setCols]      = useState([])
  const query = params.get('q') || ''

  // ── Filter logic runs locally (API fallback) ──
  useEffect(() => {
    const q = query.toLowerCase()

    // Posts
    let posts = q
      ? articles.filter(a =>
          a.title.toLowerCase().includes(q) ||
          a.author.name.toLowerCase().includes(q) ||
          a.tags?.some(t => t.toLowerCase().includes(q)) ||
          a.category?.toLowerCase().includes(q)
        )
      : articles.slice()

    if (categoryFilter) posts = posts.filter(a => a.category === categoryFilter)
    if (sortBy === 'newest') posts = [...posts].sort((a, b) => b.id - a.id)
    if (sortBy === 'oldest') posts = [...posts].sort((a, b) => a.id - b.id)
    setPosts(posts)

    // Collections
    let cols = q
      ? ALL_COLLECTIONS.filter(c =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.curator?.name.toLowerCase().includes(q)
        )
      : ALL_COLLECTIONS.slice()
    setCols(cols)
  }, [query, categoryFilter, sortBy, dateFilter])

  return (
    <div className="max-w-[1200px] px-8 pt-10 pb-20">

      {/* ── Header ── */}
      {query && (
        <div className="mb-6">
          <h1 className="font-bold text-[22px] text-[var(--color-text)] mb-1">Results for "{query}"</h1>
          <p className="text-[13px] text-[var(--color-text-secondary)]">
            {filteredPosts.length} posts · {filteredCols.length} collections
          </p>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {TABS.map(t => <Pill key={t.id} label={t.label} active={activeTab === t.id} onClick={() => setActiveTab(t.id)} />)}
      </div>

      {/* ── Posts filters ── */}
      {activeTab === 'posts' && (
        <div className="flex gap-[10px] mb-7 flex-wrap items-center p-3 px-4 bg-[var(--color-bg-alt)]
          rounded-[14px] border border-[var(--color-border)]">
          <span className="text-[11px] text-[var(--color-text-muted)] font-semibold uppercase tracking-[0.06em]">Filter:</span>

          {/* Category pills */}
          <div className="flex gap-[6px] flex-wrap">
            {['All', ...CATEGORIES].map(cat => (
              <button key={cat}
                onClick={() => setCategory(cat === 'All' ? '' : cat)}
                className={`px-3 py-[4px] rounded-full text-[11px] font-medium border transition-all cursor-pointer
                  ${(cat === 'All' ? !categoryFilter : categoryFilter === cat)
                    ? 'bg-[var(--color-accent)] text-[var(--color-text-inverted)] border-[var(--color-accent)]'
                    : 'bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border)]'
                  }`}>{cat}</button>
            ))}
          </div>

          <div className="ml-auto flex gap-2">
            <Select value={dateFilter} onChange={setDateFilter} options={DATE_OPTIONS} />
            <Select value={sortBy}     onChange={setSortBy}     options={SORT_OPTIONS} />
          </div>
        </div>
      )}

      {/* ── Tab content ── */}
      {activeTab === 'posts' && (
        filteredPosts.length > 0
          ? filteredPosts.map(a => <HorizontalCard key={a.id} article={a} />)
          : <p className="text-[13px] text-[var(--color-text-muted)] mt-8">No posts found{query ? ` for "${query}"` : ''}.</p>
      )}
      {activeTab === 'authors'     && <AuthorsTab />}
      {activeTab === 'shorts'      && <ShortsTab />}
      {activeTab === 'collections' && (
        filteredCols.length > 0
          ? filteredCols.map(c => <CollectionRow key={c.id} col={c} />)
          : <p className="text-[13px] text-[var(--color-text-muted)] mt-8">No collections found.</p>
      )}
    </div>
  )
}
