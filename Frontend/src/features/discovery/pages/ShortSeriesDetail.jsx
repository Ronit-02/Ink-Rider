import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from '@/shared/components/ui/Button'
import { useShortSeriesDetail, useUpdateShortSeries } from '../hooks/useShortSeries'
import ShortReadModal from '../components/ShortReadModal'
import { ListSkeleton } from '@/shared/components/ui/Skeleton'
import PageFrame from '@/shared/components/layout/PageFrame'

export default function ShortSeriesDetail() {
  const { id } = useParams()
  const query = useShortSeriesDetail(id)
  const update = useUpdateShortSeries(id)
  const [entries, setEntries] = useState([])
  const [shortReadId, setShortReadId] = useState(null)
  useEffect(() => { if (query.data?.entries) setEntries(query.data.entries) }, [query.data])
  if (query.isPending) return <PageFrame><ListSkeleton count={4} label="Loading short series" /></PageFrame>
  if (query.isError) return <PageFrame><div><p role="alert" className="text-[13px] text-[var(--color-danger)]">This series could not be loaded.</p><Button variant="secondary" className="mt-4" onClick={() => query.refetch()}>Try again</Button></div></PageFrame>
  const series = query.data
  const move = (index, direction) => setEntries(current => { const next = [...current]; const target = index + direction; if (target < 0 || target >= next.length) return current; [next[index], next[target]] = [next[target], next[index]]; return next })
  const saveOrder = () => update.mutate({ title: series.title, description: series.description, visibility: series.visibility, postIds: entries.map(entry => entry.id) })
  return <PageFrame><Link to="/shorts" className="mb-7 inline-flex min-h-10 items-center rounded-full border border-[var(--color-border)] px-3 py-1.5 text-[12px] text-[var(--color-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 sm:min-h-0">← Short reads</Link><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-accent)]">Learning series</p><h1 className="mt-3 text-[clamp(32px,5vw,52px)] leading-[1.03] tracking-[-0.05em] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>{series.title}</h1><p className="mt-4 text-[14px] leading-7 text-[var(--color-text-secondary)]">{series.description}</p><p className="mt-3 text-[12px] text-[var(--color-text-muted)]">{series.entriesCount} parts · by {series.author.username}</p><ol className="mt-10 border-t border-[var(--color-border)]">{entries.map((entry, index) => <li key={entry.id} className="flex items-center gap-4 py-5 border-b border-[var(--color-border)]"><span className="w-8 text-[13px] font-semibold text-[var(--color-text-muted)]">{String(index + 1).padStart(2, '0')}</span><button type="button" onClick={() => setShortReadId(entry.id)} className="flex-1 text-left"><h2 className="text-[16px] font-semibold text-[var(--color-text)] hover:text-[var(--color-accent)]">{entry.title}</h2></button>{series.isOwner && <div className="flex gap-1"><button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move ${entry.title} earlier`} className="min-h-10 min-w-10 rounded-full border border-[var(--color-border)] disabled:opacity-30 sm:h-8 sm:w-8 sm:min-h-0 sm:min-w-0">↑</button><button type="button" onClick={() => move(index, 1)} disabled={index === entries.length - 1} aria-label={`Move ${entry.title} later`} className="min-h-10 min-w-10 rounded-full border border-[var(--color-border)] disabled:opacity-30 sm:h-8 sm:w-8 sm:min-h-0 sm:min-w-0">↓</button></div>}</li>)}</ol>{series.isOwner && <div className="mt-6 flex items-center gap-3"><Button className="min-h-10 sm:min-h-0" onClick={saveOrder} disabled={update.isPending}>{update.isPending ? 'Saving…' : 'Save reading order'}</Button>{update.isSuccess && <span className="text-[12px] text-[var(--color-text-secondary)]">Order saved</span>}{update.isError && <span className="text-[12px] text-[var(--color-danger)]">Could not save order</span>}</div>}{shortReadId && <ShortReadModal postId={shortReadId} onClose={() => setShortReadId(null)} />}</PageFrame>
}
