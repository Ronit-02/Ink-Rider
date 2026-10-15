import retainRetryView from '@/shared/utils/retainRetryView'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Button from '@/shared/components/ui/Button'
import useShorts from '../../hooks/useShorts'
import ShortReadModal from '../../components/ShortReadModal'
import PageHeader from '@/shared/components/ui/PageHeader'
import { PostCardSkeleton } from '@/shared/components/ui/Skeleton'
import PageFrame from '@/shared/components/layout/PageFrame'
import ShortCard from '../../components/ShortCard'
import FilterBar from '@/shared/components/ui/FilterBar'
import { tagFilterOptions } from '@/shared/utils/availableFilterOptions'

export default function ShortsTab() {
  const [params, setParams] = useSearchParams()
  const [shortReadId, setShortReadId] = useState(null)
  const requestedTopic = params.get('shortTopic')
  const requestedSort = params.get('shortSort')
  const sort = ['latest', 'popular'].includes(requestedSort) ? requestedSort : 'latest'
  const query = retainRetryView(useShorts(sort))
  const shorts = query.data?.pages.flatMap(page => page.data) || []
  const topicOptions = tagFilterOptions(shorts, requestedTopic, query.hasNextPage)
  const topic = topicOptions.some(option => option.id === requestedTopic) ? requestedTopic : 'all'
  const filteredShorts = topic === 'all' ? shorts : shorts.filter(post => (post.tags || []).some(tag => tag.toLowerCase() === topic))
  const updateFilter = (key, value, defaultValue) => {
    setParams(current => {
      const next = new URLSearchParams(current)
    if (value === defaultValue) next.delete(key)
    else next.set(key, value)
      return next
    })
  }
  const resetFilters = () => setParams(current => {
    const next = new URLSearchParams(current)
    next.delete('shortTopic')
    next.delete('shortSort')
    return next
  })
  return <PageFrame><PageHeader eyebrow="Fast learning" title="Short reads" description="Focused ideas under 500 words." actions={<Link to="/series?type=short" className="button-target inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-border)] px-4 py-2 text-[13px] font-medium text-[var(--color-text)]">Browse series</Link>} /><div className="mb-5 flex items-center justify-between gap-4"><h2 className="mb-0 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">Latest short reads</h2>{shorts.length > 0 && <FilterBar label="Topic" options={topicOptions} value={topic} onChange={value => updateFilter('shortTopic', value, 'all')} sortOptions={[{ id: 'latest', label: 'Latest' }, { id: 'popular', label: 'Most appreciated' }]} sortValue={sort} onSortChange={value => updateFilter('shortSort', value, 'latest')} onReset={resetFilters} />}</div>{query.isPending && <div role="status" aria-label="Loading short reads" className="card-grid card-grid--short gap-4"><PostCardSkeleton compact /><PostCardSkeleton compact /><PostCardSkeleton compact /><PostCardSkeleton compact /></div>}{query.isError && <div className="py-16 text-center"><p role="alert" className="text-[13px] text-[var(--color-danger)]">Short reads could not be loaded.</p><Button className="mt-4" variant="secondary" onClick={() => query.refetch()} aria-busy={query.isFetching} disabled={query.isFetching}>Try again</Button></div>}<section className="card-grid card-grid--short gap-4">{filteredShorts.map(post => <ShortCard key={post.id} post={post} fluid onOpen={short => setShortReadId(short.id)} />)}</section>{!query.isPending && !query.isError && filteredShorts.length === 0 && <p className="py-16 text-center text-[13px] text-[var(--color-text-muted)]">No short reads match this topic.</p>}{query.hasNextPage && <div className="pt-9 text-center"><Button variant="secondary" onClick={() => query.fetchNextPage()} disabled={query.isFetchingNextPage} aria-busy={query.isFetchingNextPage}>{'Load more'}</Button></div>}{shortReadId && <ShortReadModal postId={shortReadId} onClose={() => setShortReadId(null)} listIds={filteredShorts.map(post => post.id)} />}</PageFrame>
}
