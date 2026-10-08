import retainRetryView from '@/shared/utils/retainRetryView'
import useOverlayViewport from '@/shared/hooks/useOverlayViewport'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'framer-motion'
import Avatar from '@/shared/components/ui/Avatar'
import { SearchIcon } from '@/shared/icons'
import useDialogFocus from '@/shared/hooks/useDialogFocus'
import { searchDiscovery } from '../api/search'
import { fetchDiscoveryFeed } from '../api/feed'

type PostSuggestion = { id: string; title: string; image?: string; author?: { username?: string } }
type WriterSuggestion = { id: string; handle: string; displayName: string; avatarUrl?: string }
type SearchResponse = { data: { posts: PostSuggestion[]; writers: WriterSuggestion[] } }
type PopularResponse = { data: PostSuggestion[] }
type Suggestion = { kind: 'post'; item: PostSuggestion } | { kind: 'writer'; item: WriterSuggestion }
type Props = {
  initialQuery: string
  origin: { left: number; width: number }
  onClose: () => void
}

const suggestedTopics = ['Travel', 'AI', 'Science', 'Entrepreneurship', 'Lifestyle', 'Career']

export default function MobileSearchDialog({ initialQuery, origin, onClose }: Props) {
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()
  const viewportStyle = useOverlayViewport()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [expandedWidth, setExpandedWidth] = useState(() => window.innerWidth - 32)
  const [closing, setClosing] = useState(false)
  const requestClose = useCallback(() => setClosing(true), [])
  const focusDialogRef = useDialogFocus(requestClose, inputRef)
  const [input, setInput] = useState(initialQuery)
  const [query, setQuery] = useState(initialQuery.trim())
  const [activeIndex, setActiveIndex] = useState(-1)
  const listId = useId()
  const popular = retainRetryView(useQuery<PopularResponse>({
    queryKey: ['mobile-search-popular-stories'],
    queryFn: () => fetchDiscoveryFeed({ mode: 'popular', sort: 'popular', cursor: null }),
    enabled: !input.trim(),
    staleTime: 60_000,
    retry: false,
  }))
  const trendingSearches = [...new Set((popular.data?.data || []).map(post => post.title))].slice(0, 4)
  const result = retainRetryView(useQuery<SearchResponse>({
    queryKey: ['search-suggestions', query, 'all'],
    queryFn: () => searchDiscovery({ query, type: 'all', suggestions: true, limit: 6 }),
    enabled: query.length > 0,
    staleTime: 30_000,
    retry: false,
  }))
  const waiting = input.trim() !== query
  const items: Suggestion[] = waiting ? [] : [
    ...(result.data?.data.posts || []).map(item => ({ kind: 'post' as const, item })),
    ...(result.data?.data.writers || []).map(item => ({ kind: 'writer' as const, item })),
  ].slice(0, 6)

  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()
    inputRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Return to the navbar on desktop resize rather than leave a hidden modal.
    const media = window.matchMedia('(min-width: 768px)')
    const handleResize = () => { if (media.matches) onClose() }
    const updateWidth = () => setExpandedWidth(window.innerWidth - 32)
    media.addEventListener('change', handleResize)
    window.addEventListener('resize', updateWidth)
    return () => {
      media.removeEventListener('change', handleResize)
      window.removeEventListener('resize', updateWidth)
      document.body.style.overflow = previousOverflow
      dialog?.close()
    }
  }, [onClose])

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(input.trim()), 250)
    return () => window.clearTimeout(timer)
  }, [input])

  const search = (value = input.trim()) => {
    if (!value) return
    onClose()
    navigate(`/search?q=${encodeURIComponent(value)}`)
  }
  const openSuggestion = (suggestion: Suggestion) => {
    onClose()
    navigate(suggestion.kind === 'post' ? `/post/${suggestion.item.id}` : `/author/${suggestion.item.handle}`)
  }

  return createPortal(
    <motion.dialog style={viewportStyle} ref={element => { dialogRef.current = element; focusDialogRef.current = element }} aria-label="Search Ink Rider" onCancel={event => { event.preventDefault(); requestClose() }} className="mobile-search-dialog"
      initial={false} animate={{ opacity: closing ? 0 : 1 }} transition={{ duration: reducedMotion ? 0 : 0.28, ease: [0.2, 0, 0, 1] }} onAnimationComplete={() => { if (closing) onClose() }}>
      <div className="sticky top-0 border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2">
        <motion.form role="search" onSubmit={event => {
          event.preventDefault()
          const active = items[activeIndex]
          if (active) openSuggestion(active)
          else search()
        }} initial={reducedMotion ? false : { x: origin.left - 16, width: origin.width, height: 38 }} animate={closing ? { x: origin.left - 16, width: origin.width, height: 38 } : { x: 0, width: expandedWidth, height: 46 }} transition={{ duration: reducedMotion ? 0 : 0.28, ease: [0.2, 0, 0, 1] }}
          className="flex items-center gap-2 overflow-hidden rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] pl-[14px] pr-1 focus-within:border-[var(--color-focus)]">
          <span aria-hidden="true" className="shrink-0"><SearchIcon /></span>
          <input ref={inputRef} type="text" enterKeyHint="search" autoComplete="off" maxLength={100} value={input} placeholder="Search posts and writers…" aria-label="Search posts and writers" role="combobox" aria-autocomplete="list" aria-controls={listId} aria-expanded={input.trim().length > 0} aria-activedescendant={activeIndex >= 0 && items[activeIndex] ? `${listId}-${activeIndex}` : undefined}
            onChange={event => { setInput(event.target.value); setActiveIndex(-1) }}
            onKeyDown={event => {
              if (event.key === 'Escape') {
                event.preventDefault()
                event.stopPropagation()
                requestClose()
                return
              }
              if (!items.length || !['ArrowDown', 'ArrowUp'].includes(event.key)) return
              event.preventDefault()
              setActiveIndex(current => current < 0 ? (event.key === 'ArrowDown' ? 0 : items.length - 1) : (current + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length)
            }}
            className="mobile-search-input min-w-0 flex-1 border-none bg-transparent py-2 text-[16px] text-[var(--color-text)] outline-none" />
          <button type="button" onClick={requestClose} aria-label="Close search" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)]">
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
          <button type="button" disabled={!input.trim() || closing} onClick={() => search()} aria-label="Search" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--color-accent)] hover:bg-[var(--color-bg-alt)] disabled:opacity-40">
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16m-6-6 6 6-6 6" /></svg>
          </button>
        </motion.form>
      </div>
      <motion.div className="mobile-search-content px-4 py-6" initial={reducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: closing ? 0 : 1, y: closing ? 8 : 0 }} transition={{ duration: reducedMotion ? 0 : 0.2 }}>
        {!input.trim() ? <>
        <section aria-labelledby={`${listId}-trending`} className="mb-7">
          <h2 id={`${listId}-trending`} className="text-[15px] font-semibold">Trending searches</h2>
          <p className="mt-2 text-[12px] text-[var(--color-text-secondary)]">Suggestions from popular stories on Ink Rider.</p>
          {popular.isPending ? <p role="status" className="py-4 text-[13px] text-[var(--color-text-muted)]">Loading suggestions…</p>
            : popular.isError ? <div className="py-4 text-[13px] text-[var(--color-text-muted)]"><p>Trending suggestions are unavailable.</p><button type="button" onClick={() => popular.refetch()} className="min-h-11 underline underline-offset-2" aria-busy={popular.isFetching} disabled={popular.isFetching}>Try again</button></div>
              : !trendingSearches.length ? <p className="py-4 text-[13px] text-[var(--color-text-muted)]">Explore a topic below while popular stories build up.</p>
                : <ul aria-label="Trending searches" className="mt-3 list-none p-0">{trendingSearches.map(title => <li key={title}><button type="button" onClick={() => { setInput(title.slice(0, 100)); setActiveIndex(-1); inputRef.current?.focus() }} className="flex min-h-11 w-full items-center gap-3 border-b border-[var(--color-border-light)] py-3 text-left text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"><span aria-hidden="true" className="shrink-0"><SearchIcon /></span><span>{title}</span></button></li>)}</ul>}
        </section>
        <section aria-labelledby={`${listId}-topics`}>
          <h2 id={`${listId}-topics`} className="text-[15px] font-semibold">What are you curious about?</h2>
          <p className="mt-2 text-[13px] text-[var(--color-text-secondary)]">Try a topic, or search for a story or writer.</p>
          <ul aria-label="Suggested topics" className="mt-3 list-none p-0">{suggestedTopics.map(topic => <li key={topic}><button type="button" onClick={() => { setInput(topic); setActiveIndex(-1); inputRef.current?.focus() }} className="flex min-h-11 w-full items-center border-b border-[var(--color-border-light)] py-3 text-left text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]">{topic}</button></li>)}</ul>
        </section></> : <>
          <h2 className="mb-3 text-[15px] font-semibold">Suggestions</h2>
          <div role="status" aria-live="polite" className="text-[13px] text-[var(--color-text-secondary)]">
            {waiting || result.isPending ? <p className="py-5">Searching…</p> : result.isError ? <p className="py-5">Suggestions are unavailable. You can still view all results or try again.</p> : !items.length ? <p className="py-5">No matching stories or writers. Try another phrase.</p> : <span className="sr-only">{items.length} suggestions available</span>}
          </div>
          <div id={listId} role="listbox" aria-label="Search suggestions">
            {items.map((suggestion, index) => <button key={`${suggestion.kind}-${suggestion.item.id}`} id={`${listId}-${index}`} type="button" role="option" aria-selected={activeIndex === index} tabIndex={-1} onMouseDown={event => event.preventDefault()} onClick={() => openSuggestion(suggestion)}
              className={`flex min-h-16 w-full items-center gap-3 border-b border-[var(--color-border-light)] py-3 text-left ${activeIndex === index ? 'bg-[var(--color-bg-alt)]' : 'hover:bg-[var(--color-surface-hover)]'}`}>
              {suggestion.kind === 'writer' ? <Avatar src={suggestion.item.avatarUrl} name={suggestion.item.displayName} size={40} /> : <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[var(--color-bg-alt)]"><SearchIcon /></span>}
              <span className="min-w-0 flex-1"><span className="block text-[14px] font-semibold">{suggestion.kind === 'post' ? suggestion.item.title : suggestion.item.displayName}</span><span className="mt-1 block text-[12px] text-[var(--color-text-muted)]">{suggestion.kind === 'post' ? suggestion.item.author?.username : `@${suggestion.item.handle}`}</span></span>
              <span className="shrink-0 text-[11px] text-[var(--color-text-muted)]">{suggestion.kind === 'post' ? 'Article' : 'Writer'}</span>
            </button>)}
          </div>
          {result.isError && <button type="button" onClick={() => result.refetch()} className="mt-4 min-h-11 text-[13px] underline underline-offset-2" aria-busy={result.isFetching} disabled={result.isFetching}>Try again</button>}
        </>}
      </motion.div>
    </motion.dialog>, document.body,
  )
}
