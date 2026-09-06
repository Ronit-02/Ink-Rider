import { useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Button from '@/shared/components/ui/Button'
import useShorts from '../../hooks/useShorts'
import useAuth from '@/features/auth/hooks/useAuth'
import { useCreateShortSeries, useEligibleShorts, useShortSeriesList } from '../../hooks/useShortSeries'
import ShortReadModal from '../../components/ShortReadModal'
import PageHeader from '@/shared/components/ui/PageHeader'
import { PostCardSkeleton } from '@/shared/components/ui/Skeleton'
import PageFrame from '@/shared/components/layout/PageFrame'
import ShortCard from '../../components/ShortCard'
import FilterBar from '@/shared/components/ui/FilterBar'
import useDialogFocus from '@/shared/hooks/useDialogFocus'

const SHORT_FILTERS = [{ id: 'all', label: 'All' }, { id: 'science', label: 'Science' }, { id: 'career', label: 'Career' }, { id: 'wellness', label: 'Wellness' }]

function CreateSeriesModal({ onClose, onCreated }) {
  const closeButtonRef = useRef(null)
  const dialogRef = useDialogFocus(onClose, closeButtonRef)
  const eligible = useEligibleShorts(true)
  const create = useCreateShortSeries()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [postIds, setPostIds] = useState([])
  const toggle = id => setPostIds(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id])
  const submit = event => {
    event.preventDefault()
    if (title.trim().length < 2 || postIds.length < 2 || create.isPending) return
    create.mutate({ title, description, visibility: 'public', postIds }, { onSuccess: data => onCreated(data.seriesId) })
  }
  return <div className="fixed inset-0 z-[300] grid place-items-center p-4 bg-black/45" onMouseDown={event => event.target === event.currentTarget && onClose()}><section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="series-create-title" tabIndex={-1} className="w-full max-w-[540px] max-h-[90vh] overflow-y-auto rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6"><div className="flex justify-between"><h2 id="series-create-title" className="text-[19px] font-bold text-[var(--color-text)]">Create a short series</h2><button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Close">×</button></div><form className="mt-6" onSubmit={submit}><label htmlFor="series-title" className="mb-2 block text-[12px] font-semibold text-[var(--color-text)]">Title <span aria-hidden="true">(required)</span></label><input id="series-title" required minLength={2} value={title} maxLength={100} aria-describedby="series-title-help" onChange={event => setTitle(event.target.value)} className="w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] px-3 py-2.5 text-[13px] text-[var(--color-text)]" /><p id="series-title-help" className="mt-1 text-right text-[11px] text-[var(--color-text-muted)]">{title.length}/100 characters</p><label htmlFor="series-description" className="mt-4 mb-2 block text-[12px] font-semibold text-[var(--color-text)]">Description <span className="font-normal text-[var(--color-text-muted)]">(optional)</span></label><textarea id="series-description" value={description} maxLength={500} aria-describedby="series-description-help" onChange={event => setDescription(event.target.value)} className="w-full min-h-20 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-3 text-[13px] text-[var(--color-text)]" /><p id="series-description-help" className="mt-1 text-right text-[11px] text-[var(--color-text-muted)]">{description.length}/500 characters</p><p id="series-posts-help" className="mt-5 mb-2 text-[12px] font-semibold text-[var(--color-text)]">Select at least two shorts in reading order <span aria-hidden="true">(required)</span></p><div className="max-h-56 overflow-y-auto rounded-[10px] border border-[var(--color-border)]" aria-describedby="series-posts-help">{eligible.data?.map(post => <label key={post.id} className="flex gap-3 border-b border-[var(--color-border)] p-3 last:border-0"><input type="checkbox" checked={postIds.includes(post.id)} onChange={() => toggle(post.id)} /><span className="text-[13px] text-[var(--color-text)]">{post.title}</span></label>)}{eligible.data?.length === 0 && <p className="p-4 text-[12px] text-[var(--color-text-muted)]">Publish at least two unassigned short reads first.</p>}</div>{create.isError && <p role="alert" className="mt-3 text-[12px] text-[var(--color-danger)]">{create.error?.response?.data?.message || 'Series could not be created.'}</p>}<div className="mt-5 flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" disabled={title.trim().length < 2 || postIds.length < 2 || create.isPending}>{create.isPending ? 'Creating…' : 'Create series'}</Button></div></form></section></div>
}

export default function ShortsTab() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { loggedIn, signIn } = useAuth()
  const seriesQuery = useShortSeriesList()
  const [showCreate, setShowCreate] = useState(false)
  const [shortReadId, setShortReadId] = useState(null)
  const requestedTopic = params.get('shortTopic')
  const requestedSort = params.get('shortSort')
  const topic = SHORT_FILTERS.some(option => option.id === requestedTopic) ? requestedTopic : 'all'
  const sort = ['latest', 'popular'].includes(requestedSort) ? requestedSort : 'latest'
  const query = useShorts(sort)
  const shorts = query.data?.pages.flatMap(page => page.data) || []
  const filteredShorts = topic === 'all' ? shorts : shorts.filter(post => (post.tags || []).some(tag => tag.toLowerCase() === topic))
  const series = seriesQuery.data?.pages.flatMap(page => page.data) || []
  const updateFilter = (key, value, defaultValue) => {
    setParams(current => {
      const next = new URLSearchParams(current)
    if (value === defaultValue) next.delete(key)
    else next.set(key, value)
      return next
    })
  }
  return <PageFrame><PageHeader eyebrow="Fast learning" title="Short reads" description="Focused ideas under 500 words." actions={<Button variant="primary" onClick={() => loggedIn ? setShowCreate(true) : signIn()}><span aria-hidden="true" className="mr-1 text-[17px] leading-none">+</span>Create a series</Button>} />{series.length > 0 && <section className="mb-12"><h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">Learning series</h2><div className="card-grid card-grid--post gap-4">{series.map(item => <Link key={item.id} to={`/shorts/series/${item.id}`} className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2"><p className="text-[10px] uppercase tracking-[0.08em] text-[var(--color-accent)]">{item.entriesCount} parts</p><h3 className="mt-2 text-[17px] font-bold text-[var(--color-text)]">{item.title}</h3><p className="mt-2 text-[12px] text-[var(--color-text-secondary)] line-clamp-2">{item.description}</p></Link>)}</div></section>}<div className="mb-5 flex items-center justify-between gap-4"><h2 className="mb-0 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">Latest short reads</h2><FilterBar label="Topic" options={SHORT_FILTERS} value={topic} onChange={value => updateFilter('shortTopic', value, 'all')} sortOptions={[{ id: 'latest', label: 'Latest' }, { id: 'popular', label: 'Most appreciated' }]} sortValue={sort} onSortChange={value => updateFilter('shortSort', value, 'latest')} /></div>{query.isPending && <div role="status" aria-label="Loading short reads" className="card-grid card-grid--short gap-4"><PostCardSkeleton compact /><PostCardSkeleton compact /><PostCardSkeleton compact /><PostCardSkeleton compact /></div>}{query.isError && <div className="py-16 text-center"><p role="alert" className="text-[13px] text-[var(--color-danger)]">Short reads could not be loaded.</p><Button className="mt-4" variant="secondary" onClick={() => query.refetch()}>Try again</Button></div>}<section className="card-grid card-grid--short gap-4">{filteredShorts.map(post => <ShortCard key={post.id} post={post} onOpen={short => setShortReadId(short.id)} />)}</section>{!query.isPending && !query.isError && filteredShorts.length === 0 && <p className="py-16 text-center text-[13px] text-[var(--color-text-muted)]">No short reads match this topic.</p>}{query.hasNextPage && <div className="pt-9 text-center"><Button variant="secondary" onClick={() => query.fetchNextPage()} disabled={query.isFetchingNextPage}>{query.isFetchingNextPage ? 'Loading…' : 'Load more'}</Button></div>}{showCreate && <CreateSeriesModal onClose={() => setShowCreate(false)} onCreated={seriesId => navigate(`/shorts/series/${seriesId}`)} />}{shortReadId && <ShortReadModal postId={shortReadId} onClose={() => setShortReadId(null)} />}</PageFrame>
}
