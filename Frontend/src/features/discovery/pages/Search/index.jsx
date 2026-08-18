import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Avatar from '@/shared/components/ui/Avatar'
import { SearchIcon } from '@/shared/icons'
import FilterPopover from '@/shared/components/ui/FilterPopover'
import DiscoveryPostCard from '../../components/DiscoveryPostCard'
import ShortCard from '../../components/ShortCard'
import ShortReadModal from '../../components/ShortReadModal'
import useDiscoverySearch from '../../hooks/useDiscoverySearch'
import { ListSkeleton, PostFeedSkeleton } from '@/shared/components/ui/Skeleton'

const TABS = [
  { id: 'posts', label: 'Posts' },
  { id: 'writers', label: 'Writers' },
  { id: 'shorts', label: 'Shorts' },
]

const TOPICS = [
  { id: 'all', label: 'All' },
  { id: 'travel', label: 'Travel' },
  { id: 'ai', label: 'AI' },
  { id: 'science', label: 'Science' },
  { id: 'entrepreneurship', label: 'Entrepreneurship' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'career', label: 'Career Education' },
]

const TIME_RANGES = [
  { id: 'any', label: 'Any time' },
  { id: 'day', label: 'Past 24 hours' },
  { id: 'week', label: 'Past week' },
  { id: 'month', label: 'Past month' },
  { id: 'year', label: 'Past year' },
]

const SORT_OPTIONS = [
  { id: 'relevance', label: 'Most relevant' },
  { id: 'latest', label: 'Latest' },
]

function SearchState({ title, detail, onRetry, isError = false }) {
  return (
    <div role={isError ? 'alert' : undefined} className="py-16 text-center border-y border-[var(--color-border)]">
      <h2 className="text-[17px] font-semibold text-[var(--color-text)]">{title}</h2>
      <p className="mt-2 text-[13px] text-[var(--color-text-secondary)]">{detail}</p>
      {onRetry && <button type="button" onClick={onRetry} className="mt-5 inline-flex min-h-10 items-center justify-center px-4 py-2 rounded-full bg-[var(--color-accent)] text-[var(--color-text-inverted)] text-[12px] font-semibold sm:min-h-0">Try again</button>}
    </div>
  )
}

function WriterResult({ writer }) {
  const writerPath = `/author/${writer.handle}`
  return (
    <article className="flex flex-wrap items-start gap-4 py-6 border-b border-[var(--color-border)]">
      <Link to={writerPath} aria-label={`View ${writer.displayName}'s profile`} className="shrink-0 rounded-full">
        <Avatar src={writer.avatarUrl} name={writer.displayName} size={52} />
      </Link>
      <div className="min-w-0 flex-1">
        <Link to={writerPath} className="text-left">
          <h2 className="text-[17px] font-semibold text-[var(--color-text)] hover:text-[var(--color-accent)]">{writer.displayName}</h2>
          <p className="mt-0.5 text-[12px] text-[var(--color-text-muted)]">@{writer.handle} · {writer.followersCount} followers</p>
        </Link>
        {writer.bio && <p className="mt-2 text-[13px] leading-6 text-[var(--color-text-secondary)] line-clamp-2">{writer.bio}</p>}
      </div>
      <Link to={writerPath} className="flex min-h-10 w-full shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] px-4 py-2 text-[12px] font-semibold text-[var(--color-text)] sm:ml-auto sm:w-auto sm:min-h-0">View profile</Link>
    </article>
  )
}

export default function SearchPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') || ''
  const [input, setInput] = useState(query)
  const [shortReadId, setShortReadId] = useState(null)
  const requestedTab = params.get('type')
  const activeTab = TABS.some(tab => tab.id === requestedTab) ? requestedTab : 'posts'
  const topic = params.get('topic') || 'all'
  const time = params.get('time') || 'any'
  const sort = params.get('sort') || 'relevance'
  const result = useDiscoverySearch(query, activeTab, { topic, time, sort })
  const items = result.data?.data?.[activeTab] || []

  useEffect(() => setInput(query), [query])

  const setActiveTab = nextTab => {
    const next = new URLSearchParams(params)
    if (nextTab === 'posts') next.delete('type')
    else next.set('type', nextTab)
    setParams(next)
  }

  const submit = event => {
    event.preventDefault()
    const nextQuery = input.trim()
    if (nextQuery.length >= 1) {
      const next = new URLSearchParams(params)
      next.set('q', nextQuery)
      setParams(next)
    }
  }

  const updateFilter = (key, value, defaultValue) => {
    const next = new URLSearchParams(params)
    if (value === defaultValue) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const activeFilterCount = [topic !== 'all', time !== 'any', sort !== 'relevance'].filter(Boolean).length
  const clearFilters = () => {
    const next = new URLSearchParams(params)
    next.delete('topic')
    next.delete('time')
    next.delete('sort')
    setParams(next, { replace: true })
  }

  const handleTabKeyDown = event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const currentIndex = TABS.findIndex(tab => tab.id === activeTab)
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? TABS.length - 1
        : (currentIndex + (event.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length
    const nextTab = TABS[nextIndex]
    setActiveTab(nextTab.id)
    requestAnimationFrame(() => document.getElementById(`search-tab-${nextTab.id}`)?.focus())
  }

  return (
    <main className="max-w-[920px] mx-auto px-5 md:px-8 pt-10 md:pt-12 pb-24">
      <header className="mb-7">
        <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
          <label htmlFor="discovery-search" className="sr-only">Search posts and writers</label>
          <div className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-[14px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 transition-colors focus-within:border-[var(--color-focus)] focus-within:ring-2 focus-within:ring-[var(--color-focus)]/15">
            <SearchIcon />
            <input id="discovery-search" value={input} onChange={event => setInput(event.target.value)} placeholder="Search articles, writers, or topics"
              className="min-w-0 flex-1 border-none bg-transparent text-[14px] text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)]" />
          </div>
          <button type="submit" disabled={input.trim().length < 1}
            className="h-12 w-full shrink-0 rounded-[14px] bg-[var(--color-accent)] px-5 text-[13px] font-semibold text-[var(--color-text-inverted)] transition-transform hover:opacity-90 active:translate-y-px disabled:opacity-40 sm:w-auto">Search</button>
        </form>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[21px] font-semibold tracking-[-0.025em] text-[var(--color-text)]">Search results</h1>
            {query.length >= 1 && <p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">Matching “{query}” across Ink Rider</p>}
          </div>
          <FilterPopover activeFilterCount={activeFilterCount} title="Refine results" description="Narrow the search without leaving the page." onClear={clearFilters}>
            <div className="mt-4"><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">Topic</p><div className="flex flex-wrap gap-2">{TOPICS.map(option => <button key={option.id} type="button" aria-pressed={topic === option.id} onClick={() => updateFilter('topic', option.id, 'all')} className={`min-h-11 rounded-full border px-3 py-2 text-[11px] transition-colors sm:min-h-0 ${topic === option.id ? 'border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-text-inverted)]' : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-secondary)]'}`}>{option.label}</button>)}</div></div>
            <div className="mt-4 grid grid-cols-2 gap-3"><label className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">Time<select value={time} onChange={event => updateFilter('time', event.target.value, 'any')} className="mt-2 block min-h-11 w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[12px] font-normal normal-case tracking-normal text-[var(--color-text)] outline-none focus:border-[var(--color-focus)] sm:min-h-0">{TIME_RANGES.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label><label className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">Sort<select value={sort} onChange={event => updateFilter('sort', event.target.value, 'relevance')} className="mt-2 block min-h-11 w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[12px] font-normal normal-case tracking-normal text-[var(--color-text)] outline-none focus:border-[var(--color-focus)] sm:min-h-0">{SORT_OPTIONS.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label></div>
          </FilterPopover>
        </div>
      </header>

      <div role="tablist" aria-label="Search result types" className="-mx-1 mb-7 flex max-w-full gap-5 overflow-x-auto border-b border-[var(--color-border)] px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map(tab => <button key={tab.id} id={`search-tab-${tab.id}`} type="button" role="tab" aria-selected={activeTab === tab.id} aria-controls="search-results-panel" tabIndex={activeTab === tab.id ? 0 : -1} onKeyDown={handleTabKeyDown} onClick={() => setActiveTab(tab.id)}
          className={`min-h-11 shrink-0 whitespace-nowrap pb-3 text-[13px] font-semibold border-b-2 ${activeTab === tab.id
            ? 'text-[var(--color-text)] border-[var(--color-accent)]'
            : 'text-[var(--color-text-muted)] border-transparent'}`}>{tab.label}</button>)}
      </div>

      <div id="search-results-panel" role="tabpanel" aria-labelledby={`search-tab-${activeTab}`}>
      {query.trim().length < 1 && <SearchState title="What are you curious about?" detail="Enter at least one character to search published stories and writer profiles." />}
      {result.isPending && query.trim().length >= 1 && (activeTab === 'writers' ? <ListSkeleton count={4} label="Loading writer results" /> : <PostFeedSkeleton count={3} label={`Loading ${activeTab === 'shorts' ? 'short-read' : 'article'} search results`} />)}
      {result.isError && <SearchState isError title="Search is unavailable" detail="Please check your connection and try again." onRetry={() => result.refetch()} />}
      {!result.isPending && !result.isError && query.trim().length >= 1 && items.length === 0 && (
        <SearchState title={`No ${activeTab} found`} detail="Try a broader phrase or a different spelling." />
      )}
      {items.length > 0 && <section aria-live="polite" className={activeTab === 'shorts' ? 'card-grid card-grid--short gap-4' : ''}>
        {activeTab === 'posts'
          ? items.map(post => <DiscoveryPostCard key={post.id} post={post} />)
          : activeTab === 'writers'
            ? items.map(writer => <WriterResult key={writer.id} writer={writer} />)
            : items.map(post => <ShortCard key={post.id} post={post} onOpen={short => setShortReadId(short.id)} />)}
      </section>}
      </div>
      {shortReadId && <ShortReadModal postId={shortReadId} onClose={() => setShortReadId(null)} />}
    </main>
  )
}
