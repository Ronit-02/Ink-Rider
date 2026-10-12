import retainRetryView from '@/shared/utils/retainRetryView'
import ShortCard from '@/features/discovery/components/ShortCard'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from '@/shared/components/ui/Button'
import { useShortSeriesDetail, useUpdateShortSeries } from '../hooks/useShortSeries'

import { ListSkeleton } from '@/shared/components/ui/Skeleton'
import MissingResourceState from '@/shared/components/ui/MissingResourceState'
import isMissingResourceError from '@/shared/errors/isMissingResourceError'
import PageFrame from '@/shared/components/layout/PageFrame'

export default function ShortSeriesDetail() {
  const { id } = useParams()
  const query = retainRetryView(useShortSeriesDetail(id))
  const update = useUpdateShortSeries(id)
  const [entryOverrides, setEntries] = useState([])

  if (query.isPending) return <PageFrame><ListSkeleton count={4} label="Loading short series" /></PageFrame>
  if (query.isError && isMissingResourceError(query.error)) return <MissingResourceState eyebrow="Short series unavailable" title="This short series is no longer available" detail="It may have been removed, made private, or the link may be incorrect. Explore other short reads instead." recoveryTo="/shorts" recoveryLabel="Explore short reads" />
  if (query.isError) return <PageFrame><div><p role="alert" className="text-[13px] text-[var(--color-danger)]">This series could not be loaded.</p><Button variant="secondary" className="mt-4" onClick={() => query.refetch()} aria-busy={query.isFetching} disabled={query.isFetching}>Try again</Button></div></PageFrame>
  const series = query.data
  const entries = entryOverrides.length ? entryOverrides.map(item => series.entries.find(entry => entry.id === item.id)).filter(Boolean) : series.entries
  const move = (index, direction) => setEntries(current => { const next = [...(current.length ? current : series.entries)]; const target = index + direction; if (target < 0 || target >= next.length) return current; [next[index], next[target]] = [next[target], next[index]]; return next })
  const saveOrder = () => update.mutate({ title: series.title, description: series.description, visibility: series.visibility, postIds: entries.map(entry => entry.id) })
  return <PageFrame><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-accent)]">Learning series</p><h1 className="mt-3 text-[clamp(32px,5vw,52px)] leading-[1.03] tracking-[-0.05em] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>{series.title}</h1><p className="mt-4 text-[14px] leading-7 text-[var(--color-text-secondary)]">{series.description}</p><p className="mt-3 text-[12px] text-[var(--color-text-muted)]">{series.entriesCount} parts · by {series.author.username}</p><ol className="mt-10 border-t border-[var(--color-border)]">{entries.map((entry, index) => <li key={entry.id} className="flex flex-wrap items-center gap-4 py-5 border-b border-[var(--color-border)]"><span className="w-8 text-[13px] font-semibold text-[var(--color-text-muted)]">{String(index + 1).padStart(2, '0')}</span><div className="min-w-0 flex-1 basis-[240px]"><ShortCard post={{ ...entry, format: 'short', author: entry.author || series.author }} /></div>{series.isOwner && <div className="ml-auto flex gap-1"><button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move ${entry.title} earlier`} className="button-target min-h-11 min-w-11 rounded-full border border-[var(--color-border)] disabled:opacity-30 h-11 w-11 sm:min-h-0 sm:min-w-0">↑</button><button type="button" onClick={() => move(index, 1)} disabled={index === entries.length - 1} aria-label={`Move ${entry.title} later`} className="button-target min-h-11 min-w-11 rounded-full border border-[var(--color-border)] disabled:opacity-30 h-11 w-11 sm:min-h-0 sm:min-w-0">↓</button></div>}</li>)}</ol>{series.isOwner && <div className="mt-6 flex items-center gap-3"><Button className="min-h-10 sm:min-h-0" onClick={saveOrder} disabled={update.isPending} aria-busy={update.isPending}>{'Save reading order'}</Button>{update.isSuccess && <span className="text-[12px] text-[var(--color-text-secondary)]">Order saved</span>}{update.isError && <span className="text-[12px] text-[var(--color-danger)]">Could not save order</span>}</div>}</PageFrame>
}
