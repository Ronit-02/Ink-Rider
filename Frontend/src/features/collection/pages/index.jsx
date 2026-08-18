import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Button from '@/shared/components/ui/Button'
import Pill from '@/shared/components/ui/Pill'
import PageHeader from '@/shared/components/ui/PageHeader'
import useAuth from '@/features/auth/hooks/useAuth'
import { useCollectionEligiblePosts, useCollections, useCreateCollection } from '../hooks/useCollections'
import { PostCardSkeleton } from '@/shared/components/ui/Skeleton'
import PageFrame from '@/shared/components/layout/PageFrame'
import FilterBar from '@/shared/components/ui/FilterBar'
import CollectionCard from '../components/CollectionCard'
import useDialogFocus from '@/shared/hooks/useDialogFocus'

function CreateCollectionModal({ onClose }) {
  const closeButtonRef = useRef(null)
  const dialogRef = useDialogFocus(onClose, closeButtonRef)
  const posts = useCollectionEligiblePosts(true)
  const create = useCreateCollection()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState('public')
  const [postIds, setPostIds] = useState([])
  const toggle = id => setPostIds(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id])
  const submit = event => {
    event.preventDefault()
    if (title.trim().length < 2 || create.isPending) return
    create.mutate({ title, description, visibility, postIds }, { onSuccess: onClose })
  }
  return <div className="fixed inset-0 z-[300] grid place-items-center p-4 bg-black/45" onMouseDown={event => event.target === event.currentTarget && onClose()}><section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="create-collection-title" tabIndex={-1} className="w-full max-w-[560px] max-h-[90vh] overflow-y-auto rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6"><div className="flex justify-between gap-4"><h2 id="create-collection-title" className="text-[19px] font-bold text-[var(--color-text)]">Create a collection</h2><button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Close">×</button></div><form className="mt-6" onSubmit={submit}><label htmlFor="collection-title" className="mb-2 block text-[12px] font-semibold text-[var(--color-text)]">Title <span aria-hidden="true">(required)</span></label><input id="collection-title" required minLength={2} value={title} maxLength={100} aria-describedby="collection-title-help" onChange={event => setTitle(event.target.value)} className="w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] px-3 py-2.5 text-[13px] text-[var(--color-text)]" /><p id="collection-title-help" className="mt-1 text-right text-[11px] text-[var(--color-text-muted)]">{title.length}/100 characters</p><label htmlFor="collection-description" className="mt-4 mb-2 block text-[12px] font-semibold text-[var(--color-text)]">Description <span className="font-normal text-[var(--color-text-muted)]">(optional)</span></label><textarea id="collection-description" value={description} maxLength={500} aria-describedby="collection-description-help" onChange={event => setDescription(event.target.value)} className="w-full min-h-20 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-3 text-[13px] text-[var(--color-text)]" /><p id="collection-description-help" className="mt-1 text-right text-[11px] text-[var(--color-text-muted)]">{description.length}/500 characters</p><label htmlFor="collection-visibility" className="mt-4 mb-2 block text-[12px] font-semibold text-[var(--color-text)]">Visibility</label><select id="collection-visibility" value={visibility} onChange={event => setVisibility(event.target.value)} className="w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-3 text-[13px] text-[var(--color-text)]"><option value="public">Public</option><option value="unlisted">Unlisted</option><option value="private">Private</option></select><p className="mt-5 mb-2 text-[12px] font-semibold text-[var(--color-text)]">Choose your published stories in reading order</p><div className="max-h-56 overflow-y-auto rounded-[10px] border border-[var(--color-border)]">{posts.data?.map(post => <label key={post.id} className="flex items-center gap-3 border-b border-[var(--color-border)] p-3 last:border-0 cursor-pointer"><input type="checkbox" checked={postIds.includes(post.id)} onChange={() => toggle(post.id)} /><span className="text-[13px] text-[var(--color-text)]">{post.title}</span></label>)}{posts.data?.length === 0 && <p className="p-4 text-[12px] text-[var(--color-text-muted)]">Publish an article before creating a collection.</p>}</div>{create.isError && <p role="alert" className="mt-3 text-[12px] text-[var(--color-danger)]">{create.error?.response?.data?.message || 'Collection could not be created.'}</p>}<div className="mt-5 flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" disabled={title.trim().length < 2 || create.isPending}>{create.isPending ? 'Creating…' : 'Create collection'}</Button></div></form></section></div>
}

export default function CollectionsPage() {
  const { loggedIn, signIn } = useAuth()
  const [params, setParams] = useSearchParams()
  const mine = loggedIn && params.get('collectionView') === 'mine'
  const collectionViews = loggedIn ? ['discover', 'mine'] : ['discover']
  const visibility = ['all', 'public', 'unlisted', 'private'].includes(params.get('collectionVisibility')) ? params.get('collectionVisibility') : 'all'
  const sort = ['latest', 'popular'].includes(params.get('collectionSort')) ? params.get('collectionSort') : 'latest'
  const [showCreate, setShowCreate] = useState(false)
  const query = useCollections(mine, sort)
  const collections = query.data?.pages.flatMap(page => page.data) || []
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
  const handleViewKeyDown = event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const currentIndex = collectionViews.indexOf(mine ? 'mine' : 'discover')
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? collectionViews.length - 1
        : (currentIndex + (event.key === 'ArrowRight' ? 1 : -1) + collectionViews.length) % collectionViews.length
    const nextView = collectionViews[nextIndex]
    updateFilter('collectionView', nextView, 'discover')
    requestAnimationFrame(() => document.querySelectorAll('[role="tab"][aria-controls="collections-tabpanel"]')[nextIndex]?.focus())
  }
  return <PageFrame><PageHeader eyebrow="Curated reading" title="Collections" description="Reading paths for stories worth keeping together." actions={<Button onClick={() => loggedIn ? setShowCreate(true) : signIn()}><span aria-hidden="true" className="mr-1 text-[17px] leading-none">+</span>Create collection</Button>} /><div className="mb-8 flex items-center justify-between gap-4"><div className="flex gap-2" role="tablist" aria-label="Collection views"><Pill label="Discover" role="tab" ariaControls="collections-tabpanel" tabIndex={!mine ? 0 : -1} active={!mine} onKeyDown={handleViewKeyDown} onClick={() => updateFilter('collectionView', 'discover', 'discover')} />{loggedIn && <Pill label="My collections" role="tab" ariaControls="collections-tabpanel" tabIndex={mine ? 0 : -1} active={mine} onKeyDown={handleViewKeyDown} onClick={() => updateFilter('collectionView', 'mine', 'discover')} />}</div><FilterBar label="Topic" value={visibility} onChange={value => updateFilter('collectionVisibility', value, 'all')} onReset={resetFilters} options={[{ id: 'all', label: 'All' }, { id: 'public', label: 'Public' }, { id: 'unlisted', label: 'Unlisted' }, { id: 'private', label: 'Private' }]} sortOptions={[{ id: 'latest', label: 'Latest' }, { id: 'popular', label: 'Most saved' }]} sortValue={sort} onSortChange={value => updateFilter('collectionSort', value, 'latest')} /></div><div id="collections-tabpanel" role="tabpanel" aria-label={`${mine ? 'My collections' : 'Discover'} content`}>{query.isPending && <div role="status" aria-label="Loading collections"><div className="card-grid card-grid--collection gap-5">{Array.from({ length: 6 }, (_, index) => <PostCardSkeleton key={index} compact />)}</div></div>}{query.isError && <div role="alert" className="py-16 text-center"><p className="text-[13px] text-[var(--color-danger)]">Collections could not be loaded.</p><Button className="mt-4" variant="secondary" onClick={() => query.refetch()}>Try again</Button></div>}{!query.isPending && !query.isError && filteredCollections.length === 0 && <p className="py-16 text-center text-[13px] text-[var(--color-text-muted)]">{mine ? 'You have not created a collection yet.' : 'No collections match this filter.'}</p>}<section className="card-grid card-grid--collection gap-5">{filteredCollections.map(collection => <CollectionCard key={collection.id} collection={collection} />)}</section>{query.hasNextPage && <div className="pt-9 text-center"><Button variant="secondary" onClick={() => query.fetchNextPage()} disabled={query.isFetchingNextPage}>{query.isFetchingNextPage ? 'Loading…' : 'Load more'}</Button></div>}</div>{showCreate && <CreateCollectionModal onClose={() => setShowCreate(false)} />}</PageFrame>
}
