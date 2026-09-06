import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Avatar from '@/shared/components/ui/Avatar'
import Button from '@/shared/components/ui/Button'
import DiscoveryPostCard from '@/features/discovery/components/DiscoveryPostCard'
import useAuth from '@/features/auth/hooks/useAuth'
import { useCollection, useCollectionFollow, useCollectionSave, useUpdateCollection } from '../hooks/useCollections'
import { ListSkeleton, Skeleton } from '@/shared/components/ui/Skeleton'
import PageFrame from '@/shared/components/layout/PageFrame'
import ImageBox from '@/shared/components/ui/ImageBox'
import useToast from '@/shared/hooks/useToast'

export default function CollectionDetail() {
  const { id } = useParams()
  const { loggedIn, signIn } = useAuth()
  const { notify } = useToast()
  const query = useCollection(id)
  const save = useCollectionSave(id)
  const update = useUpdateCollection(id)
  const follow = useCollectionFollow(id)
  const [shareStatus, setShareStatus] = useState('')
  const [orderedPosts, setOrderedPosts] = useState([])
  useEffect(() => { if (query.data?.posts) setOrderedPosts(query.data.posts) }, [query.data])
  if (query.isPending) return <PageFrame><div role="status" aria-label="Loading collection"><Skeleton className="h-8 w-24 rounded-full" /><Skeleton className="mt-7 h-[clamp(180px,32vw,300px)] w-full rounded-[20px]" /><Skeleton className="mt-7 h-10 w-3/5" /><Skeleton className="mt-4 h-4 w-full max-w-2xl" /><div className="mt-10"><ListSkeleton count={4} role={undefined} /></div></div></PageFrame>
  if (query.isError) return <PageFrame><div role="alert"><p className="text-[13px] text-[var(--color-danger)]">{query.error?.response?.status === 404 ? 'This collection is private or no longer exists.' : 'Collection could not be loaded.'}</p><Link to="/collections" className="mt-4 inline-flex min-h-10 items-center rounded-full border border-[var(--color-border)] px-4 py-2 text-[12px] font-semibold text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 sm:min-h-0">Back to collections</Link></div></PageFrame>
  const collection = query.data
  const toggleSave = () => loggedIn ? save.mutate(!collection.isSaved) : signIn()
  const move = (index, direction) => setOrderedPosts(current => { const next = [...current]; const target = index + direction; if (target < 0 || target >= next.length) return current; [next[index], next[target]] = [next[target], next[index]]; return next })
  const saveOrder = () => update.mutate({ postIds: orderedPosts.map(post => post.id) })
  const shareCollection = async () => {
    try {
      if (navigator.share) await navigator.share({ title: collection.title, url: window.location.href })
      else await navigator.clipboard.writeText(window.location.href)
      setShareStatus('Shared')
      notify('Collection link shared.')
    } catch { setShareStatus(''); notify('The collection link could not be shared.', { tone: 'error' }) }
  }
  return <PageFrame><Link to="/collections" className="mb-7 inline-flex min-h-10 items-center rounded-full border border-[var(--color-border)] px-3 py-1.5 text-[12px] text-[var(--color-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 sm:min-h-0">← Collections</Link><ImageBox src={collection.coverImage} alt="" height="clamp(180px, 32vw, 300px)" radius="20px" placeholderLabel="Reading collection" style={{ marginBottom: '1.75rem' }} /><div className="flex items-start justify-between gap-5 flex-wrap"><div className="max-w-[680px]"><span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-accent)]">{collection.visibility} collection</span><h1 className="mt-3 text-[clamp(30px,5vw,48px)] leading-[1.05] tracking-[-0.045em] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>{collection.title}</h1><p className="mt-4 text-[14px] leading-7 text-[var(--color-text-secondary)]">{collection.description}</p></div><div className="flex gap-2">{!collection.isOwner && <><Button variant={collection.isSaved ? 'primary' : 'secondary'} onClick={toggleSave} disabled={save.isPending}>{collection.isSaved ? 'Saved' : 'Save'}</Button><Button variant={collection.isFollowing ? 'primary' : 'secondary'} onClick={() => loggedIn ? follow.mutate(!collection.isFollowing) : signIn()} disabled={follow.isPending}>{collection.isFollowing ? 'Following' : 'Follow'}</Button></>}<Button variant="secondary" onClick={shareCollection}>{shareStatus || 'Share'}</Button></div></div><div className="mt-7 flex items-center gap-3"><Avatar src={collection.author.picture} name={collection.author.username} size={32} /><div><p className="text-[12px] font-semibold text-[var(--color-text)]">Curated by {collection.author.username}</p><p className="text-[11px] text-[var(--color-text-muted)]">{collection.postsCount} stories · {collection.savedCount} saves · {collection.followersCount} followers</p></div></div>{(save.isError || follow.isError) && <p role="alert" className="mt-3 text-[12px] text-[var(--color-danger)]">The collection action could not be updated.</p>}<section className="mt-10 border-t border-[var(--color-border)] pt-8"><div className="mb-7 flex items-center justify-between gap-4"><h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">Reading order</h2>{collection.isOwner && <div className="flex items-center gap-3"><Button variant="secondary" onClick={saveOrder} disabled={update.isPending}>{update.isPending ? 'Saving…' : 'Save order'}</Button>{update.isSuccess && <span className="text-[11px] text-[var(--color-text-muted)]">Saved</span>}</div>}</div>{orderedPosts.map((post, index) => <div key={post.id} className="relative"><DiscoveryPostCard post={post} />{collection.isOwner && <div className="absolute right-0 top-5 z-10 flex gap-1"><button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move ${post.title} earlier`} className="min-h-10 min-w-10 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 sm:h-8 sm:w-8 sm:min-h-0 sm:min-w-0">↑</button><button type="button" onClick={() => move(index, 1)} disabled={index === orderedPosts.length - 1} aria-label={`Move ${post.title} later`} className="min-h-10 min-w-10 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 sm:h-8 sm:w-8 sm:min-h-0 sm:min-w-0">↓</button></div>}</div>)}{orderedPosts.length === 0 && <p className="py-10 text-[13px] text-[var(--color-text-muted)]">This collection is empty.</p>}{update.isError && <p role="alert" className="mt-4 text-[12px] text-[var(--color-danger)]">The reading order could not be saved.</p>}</section></PageFrame>
}
