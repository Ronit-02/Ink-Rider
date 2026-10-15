import { useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PageFrame from '@/shared/components/layout/PageFrame'
import PageHeader from '@/shared/components/ui/PageHeader'
import Button from '@/shared/components/ui/Button'
import ModalHeader from '@/shared/components/ui/ModalHeader'
import ModalLayer from '@/shared/components/ui/ModalLayer'
import { ListSkeleton } from '@/shared/components/ui/Skeleton'
import useDialogFocus from '@/shared/hooks/useDialogFocus'
import useAuth from '@/features/auth/hooks/useAuth'
import retainRetryView from '@/shared/utils/retainRetryView'
import SeriesCard from '../components/SeriesCard'
import SeriesWritingPicker from '../components/SeriesWritingPicker'
import { useCreateShortSeries, useEligibleSeriesPosts, useShortSeriesList } from '../hooks/useShortSeries'

const TYPES = [{ id: 'article', label: 'Stories' }, { id: 'short', label: 'Shorts' }]

function CreateSeriesModal({ onClose, onCreated }) {
  const closeButtonRef = useRef(null)
  const dialogRef = useDialogFocus(onClose, closeButtonRef)
  const [type, setType] = useState(null)
  const eligible = useEligibleSeriesPosts(type, undefined, Boolean(type))
  const create = useCreateShortSeries()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [postIds, setPostIds] = useState([])
  const chooseType = nextType => {
    setType(nextType)
    setPostIds([])
    create.reset()
  }
  const backToType = () => {
    setType(null)
    setPostIds([])
    create.reset()
  }
  const submit = event => {
    event.preventDefault()
    if (title.trim().length < 2 || postIds.length < 2 || create.isPending) return
    create.mutate({ title, description, type, visibility: 'public', postIds }, { onSuccess: data => onCreated(data.seriesId) })
  }
  const noun = type === 'short' ? 'shorts' : 'posts'

  return <ModalLayer onDismiss={onClose} aria-labelledby="series-create-title" className="grid place-items-center p-4">
    <section ref={dialogRef} tabIndex={-1} className="w-full max-w-[540px] max-h-[calc(var(--overlay-height)-2rem)] overflow-y-auto rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <ModalHeader title={type ? `Create a ${type === 'short' ? 'short' : 'post'} series` : 'Create a series'} titleId="series-create-title" subtitle={type ? undefined : 'Choose the kind of writing this series will contain.'} onClose={onClose} closeLabel="Close" closeRef={closeButtonRef} className="-mx-6 -mt-6" />
      {!type ? <div className="mt-6">
        <p className="text-[13px] font-semibold text-[var(--color-text)]">What do you want to create a series for?</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => chooseType('article')} className="min-h-24 rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-4 text-left transition-colors hover:bg-[var(--color-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"><span className="block text-[15px] font-semibold text-[var(--color-text)]">Posts</span><span className="mt-1 block text-[12px] leading-5 text-[var(--color-text-secondary)]">Create an ordered series of full stories.</span></button>
          <button type="button" onClick={() => chooseType('short')} className="min-h-24 rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-4 text-left transition-colors hover:bg-[var(--color-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"><span className="block text-[15px] font-semibold text-[var(--color-text)]">Shorts</span><span className="mt-1 block text-[12px] leading-5 text-[var(--color-text-secondary)]">Create an ordered series of short reads.</span></button>
        </div>
      </div> : <form className="mt-6" onSubmit={submit}>
        <label htmlFor="series-title" className="mb-2 block text-[12px] font-semibold text-[var(--color-text)]">Title <span aria-hidden="true">(required)</span></label>
        <input id="series-title" required minLength={2} maxLength={100} value={title} aria-describedby="series-title-help" onChange={event => setTitle(event.target.value)} className="w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] px-3 py-2.5 text-[13px] text-[var(--color-text)]" />
        <p id="series-title-help" className="mt-1 text-right text-[11px] text-[var(--color-text-muted)]">At least 2 characters · {title.length}/100</p>
        <label htmlFor="series-description" className="mt-4 mb-2 block text-[12px] font-semibold text-[var(--color-text)]">Description <span className="font-normal text-[var(--color-text-muted)]">(optional)</span></label>
        <textarea id="series-description" maxLength={500} value={description} onChange={event => setDescription(event.target.value)} className="w-full min-h-20 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-3 text-[13px] text-[var(--color-text)]" />
        <p className="mt-5 mb-2 text-[12px] font-semibold text-[var(--color-text)]">Choose at least two published {noun} in reading order</p>
        {eligible.isPending && <p role="status" className="rounded-[10px] border border-[var(--color-border)] p-4 text-[12px]">Loading your {noun}…</p>}
        {eligible.isError && <div className="rounded-[10px] border border-[var(--color-border)] p-4"><p role="alert" className="text-[12px] text-[var(--color-danger)]">{eligible.error?.response?.data?.message || `Your published ${noun} could not be loaded.`}</p><Button type="button" variant="secondary" className="mt-3" disabled={eligible.isFetching} aria-busy={eligible.isFetching} onClick={() => eligible.refetch()}>Try again</Button></div>}
        {!eligible.isPending && !eligible.isError && eligible.data?.length > 0 && <SeriesWritingPicker options={eligible.data} selectedIds={postIds} onChange={setPostIds} format={type} disabled={create.isPending} />}
        {!eligible.isPending && !eligible.isError && eligible.data?.length === 0 && <p className="rounded-[10px] border border-[var(--color-border)] p-4 text-[12px] text-[var(--color-text-muted)]">Publish two {noun} to create a series.</p>}
        {create.isError && <p role="alert" className="mt-3 text-[12px] text-[var(--color-danger)]">{create.error?.response?.data?.message || 'Series could not be created.'}</p>}
        <div className="mt-5 flex flex-wrap justify-between gap-2"><Button type="button" variant="secondary" onClick={backToType}>Back</Button><span title={title.trim().length < 2 ? 'Title must be at least 2 characters.' : undefined} className={title.trim().length < 2 ? 'cursor-not-allowed [&>button]:pointer-events-none' : undefined}><Button type="submit" disabled={title.trim().length < 2 || postIds.length < 2 || eligible.isPending || eligible.isError || create.isPending} aria-busy={create.isPending}>Create series</Button></span></div>
      </form>}
    </section>
  </ModalLayer>
}

export default function SeriesPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { loggedIn, signIn } = useAuth()
  const type = params.get('type') === 'short' ? 'short' : 'article'
  const query = retainRetryView(useShortSeriesList(type))
  const series = query.data?.pages.flatMap(page => page.data) || []
  const [showCreate, setShowCreate] = useState(false)
  const setType = next => setParams(current => { const value = new URLSearchParams(current); if (next === 'article') value.delete('type'); else value.set('type', next); return value })
  const handleTabKeyDown = event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const next = event.key === 'Home' ? 'article' : event.key === 'End' ? 'short' : type === 'article' ? 'short' : 'article'
    setType(next)
    requestAnimationFrame(() => document.getElementById(`series-tab-${next}`)?.focus())
  }
  return <PageFrame><PageHeader eyebrow="Reading paths" title="Series" description="Follow stories or short reads in an order chosen by their writer." actions={<Button onClick={() => loggedIn ? setShowCreate(true) : signIn()}><span aria-hidden="true" className="mr-1 text-[17px] leading-none">+</span>Create a series</Button>} /><div role="tablist" aria-label="Series format" className="mb-7 flex gap-5 border-b border-[var(--color-border)]">{TYPES.map(item => <button key={item.id} id={`series-tab-${item.id}`} type="button" role="tab" aria-selected={type === item.id} aria-controls="series-panel" tabIndex={type === item.id ? 0 : -1} onClick={() => setType(item.id)} onKeyDown={handleTabKeyDown} className={`min-h-11 border-b-2 pb-3 text-[13px] font-semibold ${type === item.id ? 'border-[var(--color-accent)] text-[var(--color-text)]' : 'border-transparent text-[var(--color-text-secondary)]'}`}>{item.label}</button>)}</div><section id="series-panel" role="tabpanel" aria-labelledby={`series-tab-${type}`}>{query.isPending && <ListSkeleton count={4} label="Loading series" />}{query.isError && <div className="py-16 text-center"><p role="alert" className="text-[13px] text-[var(--color-danger)]">Series could not be loaded.</p><Button variant="secondary" className="mt-4" onClick={() => query.refetch()} disabled={query.isFetching} aria-busy={query.isFetching}>Try again</Button></div>}<div className="card-grid card-grid--series gap-4">{series.map(item => <SeriesCard key={item.id} series={item} />)}</div>{!query.isPending && !query.isError && !series.length && <p className="py-16 text-center text-[13px] text-[var(--color-text-muted)]">No {type === 'short' ? 'short' : 'story'} series yet.</p>}{query.hasNextPage && <div className="pt-9 text-center"><Button variant="secondary" onClick={() => query.fetchNextPage()} disabled={query.isFetchingNextPage} aria-busy={query.isFetchingNextPage}>Load more</Button></div>}</section>{showCreate && <CreateSeriesModal onClose={() => setShowCreate(false)} onCreated={id => navigate(`/series/${id}`)} />}</PageFrame>
}
