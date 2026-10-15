import Select from '@/shared/components/ui/Select'
import ModalHeader from '@/shared/components/ui/ModalHeader'
import retainRetryView from '@/shared/utils/retainRetryView'
import ModalLayer from '@/shared/components/ui/ModalLayer'
import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Button from '@/shared/components/ui/Button'
import PageHeader from '@/shared/components/ui/PageHeader'
import useAuth from '@/features/auth/hooks/useAuth'
import { useCollections, useCreateCollection } from '../hooks/useCollections'
import { PostCardSkeleton } from '@/shared/components/ui/Skeleton'
import PageFrame from '@/shared/components/layout/PageFrame'
import FilterBar from '@/shared/components/ui/FilterBar'
import { availableFilterOptions } from '@/shared/utils/availableFilterOptions'
import CollectionCard from '../components/CollectionCard'
import useDialogFocus from '@/shared/hooks/useDialogFocus'

function CreateCollectionModal({ onClose }) {
  const closeButtonRef = useRef(null)
  const dialogRef = useDialogFocus(onClose, closeButtonRef)
  const create = useCreateCollection()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState('public')
  const submit = event => {
    event.preventDefault()
    if (title.trim().length < 2 || create.isPending) return
    create.mutate({ title, description, visibility, postIds: [] }, { onSuccess: onClose })
  }
  return <ModalLayer onDismiss={onClose} aria-labelledby="create-collection-title" className="grid place-items-center p-4"><section ref={dialogRef} tabIndex={-1} className="w-full max-w-[560px] max-h-[calc(var(--overlay-height)-2rem)] overflow-y-auto rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6"><ModalHeader title="Create a collection" titleId="create-collection-title" onClose={onClose} closeLabel="Close" closeRef={closeButtonRef} className="-mx-6 -mt-6" /><form className="mt-6" onSubmit={submit}><label htmlFor="collection-title" className="mb-2 block text-[12px] font-semibold text-[var(--color-text)]">Title <span aria-hidden="true">(required)</span></label><input id="collection-title" required minLength={2} value={title} maxLength={100} aria-describedby="collection-title-help" onChange={event => setTitle(event.target.value)} className="w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] px-3 py-2.5 text-[13px] text-[var(--color-text)]" /><p id="collection-title-help" className="mt-1 text-right text-[11px] text-[var(--color-text-muted)]">At least 2 characters · {title.length}/100</p><label htmlFor="collection-description" className="mt-4 mb-2 block text-[12px] font-semibold text-[var(--color-text)]">Description <span className="font-normal text-[var(--color-text-muted)]">(optional)</span></label><textarea id="collection-description" value={description} maxLength={500} aria-describedby="collection-description-help" onChange={event => setDescription(event.target.value)} className="w-full min-h-20 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-3 text-[13px] text-[var(--color-text)]" /><p id="collection-description-help" className="mt-1 text-right text-[11px] text-[var(--color-text-muted)]">{description.length}/500 characters</p><div className="mt-4"><Select id="collection-visibility" label="Visibility" value={visibility} options={[{ value: 'public', label: 'Public' }, { value: 'unlisted', label: 'Unlisted' }, { value: 'private', label: 'Private' }]} onChange={setVisibility} className="max-w-none" /></div>{create.isError && <p role="alert" className="mt-3 text-[12px] text-[var(--color-danger)]">{create.error?.response?.data?.message || 'Collection could not be created.'}</p>}<div className="mt-5 flex justify-end gap-2"><span title={title.trim().length < 2 ? 'Title must be at least 2 characters.' : undefined} className={title.trim().length < 2 ? 'cursor-not-allowed [&>button]:pointer-events-none' : undefined}><Button type="submit" disabled={title.trim().length < 2 || create.isPending} aria-busy={create.isPending}>{'Create collection'}</Button></span></div></form></section></ModalLayer>
}

export default function CollectionsPage() {
  const { loggedIn, signIn } = useAuth()
  const [params, setParams] = useSearchParams()
  const sort = ['latest', 'popular'].includes(params.get('collectionSort')) ? params.get('collectionSort') : 'latest'
  const [showCreate, setShowCreate] = useState(false)
  const query = retainRetryView(useCollections(false, sort))
  const collections = query.data?.pages.flatMap(page => page.data) || []
  const visibilityOptions = availableFilterOptions([{ id: 'all', label: 'All' }, { id: 'public', label: 'Public' }, { id: 'unlisted', label: 'Unlisted' }, { id: 'private', label: 'Private' }], collections, item => [item.visibility], params.get('collectionVisibility'), query.hasNextPage)
  const visibility = visibilityOptions.some(option => option.id === params.get('collectionVisibility')) ? params.get('collectionVisibility') : 'all'
  const filteredCollections = visibility === 'all' ? collections : collections.filter(collection => collection.visibility === visibility)
  const updateFilter = (key, value, defaultValue) => {
    setParams(current => {
      const next = new URLSearchParams(current)
    if (value === defaultValue) next.delete(key)
    else next.set(key, value)
      return next
    })
  }
  const resetFilters = () => {
    const next = new URLSearchParams(params)
    next.delete('collectionVisibility')
    next.delete('collectionSort')
    setParams(next)
  }
  return <PageFrame><PageHeader eyebrow="Curated reading" title="Collections" description="Reading paths for stories worth keeping together." actions={<Button onClick={() => loggedIn ? setShowCreate(true) : signIn()}><span aria-hidden="true" className="mr-1 text-[17px] leading-none">+</span>Create collection</Button>} /><div className="mb-8 flex flex-wrap items-center justify-end gap-4">{collections.length > 0 && <FilterBar label="Visibility" value={visibility} onChange={value => updateFilter('collectionVisibility', value, 'all')} onReset={resetFilters} options={visibilityOptions.length > 2 || visibility !== 'all' ? visibilityOptions : []} sortOptions={[{ id: 'latest', label: 'Latest' }, { id: 'popular', label: 'Most saved' }]} sortValue={sort} onSortChange={value => updateFilter('collectionSort', value, 'latest')} />}</div><div>{query.isPending && <div role="status" aria-label="Loading collections"><div className="card-grid card-grid--collection gap-5">{Array.from({ length: 6 }, (_, index) => <PostCardSkeleton key={index} compact />)}</div></div>}{query.isError && <div role="alert" className="py-16 text-center"><p className="text-[13px] text-[var(--color-danger)]">Collections could not be loaded.</p><Button className="mt-4" variant="secondary" onClick={() => query.refetch()} aria-busy={query.isFetching} disabled={query.isFetching}>Try again</Button></div>}{!query.isPending && !query.isError && filteredCollections.length === 0 && <p className="py-16 text-center text-[13px] text-[var(--color-text-muted)]">No collections match this filter.</p>}<section className="card-grid card-grid--collection gap-5">{filteredCollections.map(collection => <CollectionCard key={collection.id} collection={collection} />)}</section>{query.hasNextPage && <div className="pt-9 text-center"><Button variant="secondary" onClick={() => query.fetchNextPage()} disabled={query.isFetchingNextPage} aria-busy={query.isFetchingNextPage}>{'Load more'}</Button></div>}</div>{showCreate && <CreateCollectionModal onClose={() => setShowCreate(false)} />}</PageFrame>
}
