import retainRetryView from '@/shared/utils/retainRetryView'
import { useRef, useState } from 'react'
import ShareMenu from '@/shared/components/ui/ShareMenu'
import { Link, useParams } from 'react-router-dom'
import Avatar from '@/shared/components/ui/Avatar'
import Button from '@/shared/components/ui/Button'
import Select from '@/shared/components/ui/Select'
import ModalHeader from '@/shared/components/ui/ModalHeader'
import ModalLayer from '@/shared/components/ui/ModalLayer'
import useDialogFocus from '@/shared/hooks/useDialogFocus'
import { BookmarkIcon, ShareIcon } from '@/shared/icons'
import DiscoveryPostCard from '@/features/discovery/components/DiscoveryPostCard'
import ShortCard from '@/features/discovery/components/ShortCard'
import useAuth from '@/features/auth/hooks/useAuth'
import { useAddCollectionPost, useCollection, useCollectionEligiblePosts, useCollectionSave, useUpdateCollection } from '../hooks/useCollections'
import { ListSkeleton, Skeleton } from '@/shared/components/ui/Skeleton'
import MissingResourceState from '@/shared/components/ui/MissingResourceState'
import isMissingResourceError from '@/shared/errors/isMissingResourceError'
import PageFrame from '@/shared/components/layout/PageFrame'
import ImageBox from '@/shared/components/ui/ImageBox'

function AddStoryDialog({ collectionId, collectionTitle, onClose, returnFocusRef, onAdded }) {
  const closeRef = useRef(null)
  const [postId, setPostId] = useState('')
  const posts = retainRetryView(useCollectionEligiblePosts(true))
  const add = useAddCollectionPost()
  const close = () => { if (!add.isPending) onClose() }
  const dialogRef = useDialogFocus(close, closeRef)
  const submit = async () => {
    if (!postId || add.isPending) return
    try { await add.mutateAsync({ collectionId, postId }); onAdded(); onClose() } catch { /* Keep selection for retry. */ }
  }
  return <ModalLayer onDismiss={close} returnFocusRef={returnFocusRef} aria-labelledby="collection-add-story-title" className="grid place-items-center p-4">
    <section ref={dialogRef} tabIndex={-1} className="w-full max-w-[560px] overflow-y-auto rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <ModalHeader title="Add to collection" titleId="collection-add-story-title" subtitle={collectionTitle} onClose={close} closeRef={closeRef} closeLabel="Close add to collection" className="-mx-6 -mt-6" />
      <div className="mt-6">
        {posts.isPending && <p role="status" className="text-[13px] text-[var(--color-text-secondary)]">Loading your published stories…</p>}
        {posts.isError && <div><p role="alert" className="text-[13px] text-[var(--color-danger)]">Published stories could not be loaded.</p><Button variant="secondary" className="mt-3" onClick={() => posts.refetch()} disabled={posts.isFetching} aria-busy={posts.isFetching}>Try again</Button></div>}
        {!posts.isPending && !posts.isError && (posts.data?.length ? <Select id="collection-add-story" label="Choose a published story" value={postId} onChange={setPostId} disabled={add.isPending} options={posts.data.map(post => ({ value: post.id, label: post.title }))} className="max-w-none" /> : <p className="text-[13px] text-[var(--color-text-secondary)]">You have no published stories to add.</p>)}
        {add.isError && <p role="alert" className="mt-3 text-[13px] text-[var(--color-danger)]">The story could not be added. Try again.</p>}
        <div className="mt-5 flex justify-end"><Button onClick={submit} disabled={!postId || add.isPending} aria-busy={add.isPending}>Add to collection</Button></div>
      </div>
    </section>
  </ModalLayer>
}

export default function CollectionDetail() {
  const { id } = useParams()
  const { loggedIn, signIn } = useAuth()
  const [showShare, setShowShare] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const addTriggerRef = useRef(null)
  const shareTriggerRef = useRef(null)
  const closeShareMenu = ({ restoreFocus = false } = {}) => {
    setShowShare(false)
    if (restoreFocus) requestAnimationFrame(() => shareTriggerRef.current?.focus())
  }
  const query = retainRetryView(useCollection(id))
  const save = useCollectionSave(id)
  const update = useUpdateCollection(id)
  const [orderedPostOverrides, setOrderedPosts] = useState([])
  if (query.isPending) return <PageFrame><div role="status" aria-label="Loading collection"><Skeleton className="h-8 w-24 rounded-full" /><Skeleton className="mt-7 h-[clamp(180px,32vw,300px)] w-full rounded-[20px]" /><Skeleton className="mt-7 h-10 w-3/5" /><Skeleton className="mt-4 h-4 w-full max-w-2xl" /><div className="mt-10"><ListSkeleton count={4} role={undefined} /></div></div></PageFrame>
  if (query.isError && isMissingResourceError(query.error)) return <MissingResourceState eyebrow="Collection unavailable" title="This collection is no longer available" detail="It may have been removed, made private, or the link may be incorrect. Explore other collections instead." recoveryTo="/collections" recoveryLabel="Explore collections" />
  if (query.isError) return <PageFrame><div role="alert"><p className="text-[13px] text-[var(--color-danger)]">Collection could not be loaded.</p><Button className="mt-4" variant="secondary" onClick={() => query.refetch()} aria-busy={query.isFetching} disabled={query.isFetching}>Try again</Button></div></PageFrame>
  const collection = query.data
  const saveLabel = collection.isSaved ? 'Remove from saved collections' : 'Save this collection'
  const toggleSave = () => { if (!save.isPending) loggedIn ? save.mutate(!collection.isSaved) : signIn() }
  const orderedPosts = orderedPostOverrides.length ? orderedPostOverrides : collection.posts
  const move = (postId, direction) => setOrderedPosts(current => {
    const next = [...(current.length ? current : collection.posts)]
    const index = next.findIndex(post => post.id === postId)
    const isShort = next[index]?.format === 'short'
    const groupIndices = next.flatMap((post, position) => (post.format === 'short') === isShort ? [position] : [])
    const target = groupIndices[groupIndices.indexOf(index) + direction]
    if (target === undefined) return current
    ;[next[index], next[target]] = [next[target], next[index]]
    return next
  })
  const groups = [
    { id: 'articles', title: 'Full articles', posts: orderedPosts.filter(post => post.format !== 'short') },
    { id: 'shorts', title: 'Short reads', posts: orderedPosts.filter(post => post.format === 'short') },
  ]
  const saveOrder = () => update.mutate({ postIds: orderedPosts.map(post => post.id) })
  return <PageFrame><ImageBox src={collection.coverImage} alt="" height="clamp(180px, 32vw, 300px)" radius="20px" placeholderLabel="Reading collection" style={{ marginBottom: '1.75rem' }} /><div className="flex items-start justify-between gap-5 flex-wrap"><div className="max-w-[680px]"><span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-accent)]">{collection.visibility} collection</span><h1 className="mt-3 text-[clamp(30px,5vw,48px)] leading-[1.05] tracking-[-0.045em] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>{collection.title}</h1><p className="mt-4 text-[14px] leading-7 text-[var(--color-text-secondary)]">{collection.description}</p></div><div className="flex gap-2">{!collection.isOwner && <button type="button" onClick={toggleSave} disabled={save.isPending} aria-label={saveLabel} aria-busy={save.isPending} aria-pressed={Boolean(collection.isSaved)} title={saveLabel} className={`flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] transition-all duration-150 disabled:opacity-60 ${collection.isSaved ? 'bg-[var(--color-accent)] text-[var(--color-text-inverted)]' : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]'}`}><span aria-hidden="true"><BookmarkIcon filled={collection.isSaved} /></span></button>}<button ref={shareTriggerRef} type="button" onClick={() => setShowShare(value => !value)} aria-expanded={showShare} aria-haspopup="dialog" aria-controls={showShare ? 'collection-share-menu' : undefined} aria-label="Share this collection" title="Share this collection" className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] transition-all"><ShareIcon /></button>{showShare && <ShareMenu anchorRef={shareTriggerRef} onClose={closeShareMenu} id="collection-share-menu" label="Share collection" contentName="Collection" url={`${window.location.origin}/collections/${id}`} />}</div></div><Link to={collection.author.handle ? `/author/${encodeURIComponent(collection.author.handle)}` : '/author'} aria-label={`View ${collection.author.username}'s profile`} className="mt-7 flex items-center gap-3 rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2"><Avatar src={collection.author.picture} name={collection.author.username} size={32} /><div><p className="text-[12px] font-semibold text-[var(--color-text)]">Curated by {collection.author.username}</p><p className="text-[11px] text-[var(--color-text-muted)]">{collection.postsCount} stories · {collection.savedCount} saves · {collection.followersCount} followers</p></div></Link>{save.isError && <p role="alert" className="mt-3 text-[12px] text-[var(--color-danger)]">The collection action could not be updated.</p>}<section className="mt-10 border-t border-[var(--color-border)] pt-8"><div className="mb-7 flex items-center justify-between gap-4"><h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">Reading order</h2>{collection.isOwner && <div className="flex items-center gap-3"><Button ref={addTriggerRef} variant="secondary" onClick={() => setShowAdd(true)}>Add to collection</Button><Button variant="secondary" onClick={saveOrder} disabled={update.isPending} aria-busy={update.isPending}>{'Save order'}</Button>{update.isSuccess && <span className="text-[11px] text-[var(--color-text-muted)]">Saved</span>}</div>}</div>{groups.map(group => group.posts.length > 0 && <section key={group.id} aria-labelledby={`collection-${group.id}-title`} className="mb-8">
      <h3 id={`collection-${group.id}-title`} className="mb-5 text-[18px] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>{group.title}</h3>
      <div className={group.id === 'shorts' ? 'card-grid card-grid--short items-start gap-4' : undefined}>
        {group.posts.map((post, index) => <div key={post.id} className="relative min-w-0">
          {group.id === 'shorts' ? <ShortCard post={post} fluid /> : <DiscoveryPostCard post={post} flushTop={index === 0} />}
          {collection.isOwner && <div className={group.id === 'shorts' ? 'mt-2 flex justify-end gap-1' : 'absolute right-0 top-5 z-10 flex gap-1'}>
            <button type="button" onClick={() => move(post.id, -1)} disabled={index === 0 || update.isPending} aria-label={`Move ${post.title} earlier`} className="button-target min-h-11 min-w-11 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 h-11 w-11 sm:min-h-0 sm:min-w-0">↑</button>
            <button type="button" onClick={() => move(post.id, 1)} disabled={index === group.posts.length - 1 || update.isPending} aria-label={`Move ${post.title} later`} className="button-target min-h-11 min-w-11 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 h-11 w-11 sm:min-h-0 sm:min-w-0">↓</button>
          </div>}
        </div>)}
      </div>
    </section>)} {orderedPosts.length === 0 && <p className="py-10 text-[13px] text-[var(--color-text-muted)]">This collection is empty.</p>}{update.isError && <p role="alert" className="mt-4 text-[12px] text-[var(--color-danger)]">The reading order could not be saved.</p>}</section>{showAdd && <AddStoryDialog collectionId={id} collectionTitle={collection.title} returnFocusRef={addTriggerRef} onClose={() => setShowAdd(false)} onAdded={() => setOrderedPosts([])} />}</PageFrame>
}
