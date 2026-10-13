import { Fragment } from 'react'
import PageFrame from '@/shared/components/layout/PageFrame'
import retainRetryView from '@/shared/utils/retainRetryView'
import { useSearchParams } from 'react-router-dom'
import Button from '@/shared/components/ui/Button'
import PageHeader from '@/shared/components/ui/PageHeader'
import FilterBar from '@/shared/components/ui/FilterBar'
import Pill from '@/shared/components/ui/Pill'
import ReadingHistoryCard from '../components/ReadingHistoryCard'
import ShortCard from '../components/ShortCard'
import useReadingHistory from '../hooks/useReadingHistory'
import { ListSkeleton } from '@/shared/components/ui/Skeleton'

function HistoryRow({ item }) {
  if (item.format === 'short') return <div className="py-5"><ShortCard post={item} fluid /><p className="mt-2 text-[11px] text-[var(--color-text-muted)]">{item.completed ? 'Completed' : item.progress ? `${item.progress}% read` : 'Opened'}</p></div>
  return <ReadingHistoryCard item={item} />
}

export default function ReadingHistoryPage({ embedded = false }) {
  const Frame = embedded ? Fragment : PageFrame
  const query = retainRetryView(useReadingHistory())
  const [params, setParams] = useSearchParams()
  const status = ['in-progress', 'completed', 'opened'].includes(params.get('historyStatus')) ? params.get('historyStatus') : 'all'
  const sort = params.get('historySort') === 'oldest' ? 'oldest' : 'recent'
  const format = params.get('historyFormat') === 'short' ? 'short' : 'article'
  const formats = ['article', 'short']
  const updateFilter = (key, value, defaultValue) => setParams(current => {
    const next = new URLSearchParams(current)
    if (value === defaultValue) next.delete(key)
    else next.set(key, value)
    return next
  })
  const resetFilters = () => setParams(current => {
    const next = new URLSearchParams(current)
    next.delete('historyStatus')
    next.delete('historySort')
    return next
  })
  const handleFormatKeyDown = event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : (formats.indexOf(format) + 1) % 2
    updateFilter('historyFormat', formats[nextIndex], 'article')
    requestAnimationFrame(() => document.querySelectorAll('[role="tab"][aria-controls="history-format-tabpanel"]')[nextIndex]?.focus())
  }
  const filterHistory = items => items.filter(item => (item.format || 'article') === format && (status === 'all' || (status === 'completed' ? item.completed : status === 'in-progress' ? !item.completed && item.progress > 0 : !item.completed && !item.progress))).sort((left, right) => {
    const difference = new Date(right.lastReadAt).getTime() - new Date(left.lastReadAt).getTime()
    return sort === 'oldest' ? -difference : difference
  })
  const history = filterHistory(query.data?.history || [])
  const continueReading = filterHistory(query.data?.continueReading || [])
  return <Frame>
    {!embedded && <PageHeader title="Reading history" description="Continue unfinished stories or revisit what you have read." />}
    <div className="mb-8 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex max-w-full gap-2 overflow-x-auto pb-1" role="tablist" aria-label="History formats">
        {formats.map(item => <Pill key={item} label={item === 'article' ? 'Stories' : 'Shorts'} role="tab" ariaControls="history-format-tabpanel" tabIndex={format === item ? 0 : -1} active={format === item} onKeyDown={handleFormatKeyDown} onClick={() => updateFilter('historyFormat', item, 'article')} />)}
      </div>
      <FilterBar label="Reading status" options={[{ id: 'all', label: 'All reads' }, { id: 'in-progress', label: 'In progress' }, { id: 'completed', label: 'Completed' }, { id: 'opened', label: 'Opened' }]} value={status} onChange={value => updateFilter('historyStatus', value, 'all')} sortOptions={[{ id: 'recent', label: 'Recently read' }, { id: 'oldest', label: 'Oldest read first' }]} sortValue={sort} onSortChange={value => updateFilter('historySort', value, 'recent')} onReset={resetFilters} />
    </div>
    <div id="history-format-tabpanel" role="tabpanel" aria-label={`${format === 'article' ? 'Stories' : 'Shorts'} history`}>
    {query.isPending ? <div role="status" aria-label="Loading reading history"><ListSkeleton count={5} role={undefined} /></div> : query.isError ? <div><p role="alert" className="text-[13px] text-[var(--color-danger)]">Reading history could not be loaded.</p><Button className="mt-4" onClick={() => query.refetch()} aria-busy={query.isFetching} disabled={query.isFetching}>Try again</Button></div> : <>
      {continueReading.length > 0 && <section className="mb-12"><h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">Continue reading</h2><div className={format === 'short' ? 'card-grid card-grid--short gap-4' : undefined}>{continueReading.map(item => <HistoryRow key={item.id} item={item} />)}</div></section>}
      <section><h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">{sort === 'recent' ? 'Recent history' : 'Reading history'}</h2><div className={format === 'short' ? 'card-grid card-grid--short gap-4' : undefined}>{history.map(item => <HistoryRow key={item.id} item={item} />)}</div>{history.length === 0 && <p className="py-12 text-[13px] text-[var(--color-text-muted)]">{status === 'all' ? `${format === 'article' ? 'Stories' : 'Shorts'} you open will appear here.` : 'No reading history matches this status.'}</p>}</section>
    </>}
    </div>
  </Frame>
}
