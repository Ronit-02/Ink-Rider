import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import useDiscoveryFeed from '../../hooks/useDiscoveryFeed'
import DiscoveryPostCard from '../../components/DiscoveryPostCard'
import PageHeader from '@/shared/components/ui/PageHeader'
import ImageBox from '@/shared/components/ui/ImageBox'
import { PostFeedSkeleton } from '@/shared/components/ui/Skeleton'
import useAuth from '@/features/auth/hooks/useAuth'
import useBookmarkPost from '@/features/post/hooks/useBookmarkPost'
import usePostLike from '@/features/post/hooks/usePostLike'
import FilterBar from '@/shared/components/ui/FilterBar'

function ArticleDayMenu({ post }) {
  const { loggedIn, signIn } = useAuth()
  const save = useBookmarkPost(post.id)
  const like = usePostLike(post.id)
  const ref = useRef(null)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const [open, setOpen] = useState(false)
  const menuId = `article-day-menu-${post.id}`
  const closeMenu = ({ restoreFocus = false } = {}) => {
    setOpen(false)
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus())
  }
  useEffect(() => {
    if (!open) return undefined
    menuRef.current?.querySelector('[role="menuitem"]')?.focus()
    const close = event => { if (!ref.current?.contains(event.target)) closeMenu() }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])
  const auth = action => loggedIn ? action() : signIn()
  const finishAction = action => event => {
    event.stopPropagation()
    auth(action)
    closeMenu({ restoreFocus: true })
  }
  const share = async event => { event.stopPropagation(); try { await navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`) } catch { /* clipboard is optional */ }; closeMenu({ restoreFocus: true }) }
  const handleMenuKeyDown = event => {
    const items = [...menuRef.current?.querySelectorAll('[role="menuitem"]') || []]
    const index = items.indexOf(document.activeElement)
    if (event.key === 'Escape') {
      event.preventDefault()
      closeMenu({ restoreFocus: true })
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const offset = event.key === 'ArrowDown' ? 1 : -1
      items[(index + offset + items.length) % items.length]?.focus()
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      items[event.key === 'Home' ? 0 : items.length - 1]?.focus()
    } else if (event.key === 'Tab' && ((event.shiftKey && index === 0) || (!event.shiftKey && index === items.length - 1))) {
      setOpen(false)
    }
  }
  return <div ref={ref} className="absolute right-3 top-3 z-10">
    <button ref={triggerRef} type="button" aria-label={`More options for ${post.title}`} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? menuId : undefined} onClick={event => { event.preventDefault(); event.stopPropagation(); setOpen(value => !value) }} className="flex h-10 w-10 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/90 text-[var(--color-text-secondary)]"><span aria-hidden="true" className="-mt-2 text-[20px] leading-none">…</span></button>
    {open && <div ref={menuRef} id={menuId} role="menu" aria-label={`Options for ${post.title}`} onKeyDown={handleMenuKeyDown} className="absolute right-0 top-10 w-52 rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-[var(--shadow-menu)]">
       <button type="button" role="menuitem" onClick={finishAction(() => like.mutate(!post.isLiked))} className="min-h-10 sm:min-h-0 block w-full rounded-[8px] px-3 py-2 text-left text-[12px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]">{post.isLiked ? 'Remove appreciation' : 'Appreciate story'}</button>
       <button type="button" role="menuitem" onClick={finishAction(() => save.mutate(!post.isBookmarked))} className="min-h-10 sm:min-h-0 block w-full rounded-[8px] px-3 py-2 text-left text-[12px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]">{post.isBookmarked ? 'Remove from saved' : 'Save story'}</button>
       <button type="button" role="menuitem" onClick={share} className="min-h-10 sm:min-h-0 block w-full rounded-[8px] px-3 py-2 text-left text-[12px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]">Share link</button>
    </div>}
  </div>
}

export default function TrendingTab() {
  const [params, setParams] = useSearchParams()
  const requestedSort = params.get('trendingSort')
  const sort = ['popular', 'latest'].includes(requestedSort) ? requestedSort : 'popular'
  const feed = useDiscoveryFeed('popular', sort)
  const requestedTopic = params.get('trendingTopic')
  const topic = ['all', 'science', 'design', 'wellness', 'career'].includes(requestedTopic) ? requestedTopic : 'all'
  const posts = feed.data?.pages.flatMap(page => page.data) || []
  const filteredPosts = topic === 'all' ? posts : posts.filter(post => (post.tags || []).some(tag => tag.toLowerCase() === topic))
  const articleOfDay = posts[0]
  const updateFilter = (key, value, defaultValue) => {
    setParams(current => {
      const next = new URLSearchParams(current)
    if (value === defaultValue) next.delete(key)
    else next.set(key, value)
      return next
    })
  }
  return (
    <section aria-labelledby="trending-heading">
      <PageHeader headingId="trending-heading" eyebrow="Explore" title="Trending now" description="Stories readers are responding to." />
      {articleOfDay && <section className="mb-12"><div className="relative"><ArticleDayMenu post={articleOfDay} /><Link to={`/post/${articleOfDay.id}`} className="group grid overflow-hidden rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] md:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]"><div className="self-center"><ImageBox src={articleOfDay.image} alt="" height={280} radius="0" /></div><div className="flex flex-col justify-between p-5 md:p-7"><div><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Article of the day</p><h3 className="mt-4 text-[clamp(24px,3vw,36px)] font-bold leading-[1.1] tracking-[-0.04em] text-[var(--color-text)] group-hover:text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-display)' }}>{articleOfDay.title}</h3>{articleOfDay.excerpt && <p className="mt-4 line-clamp-3 text-[13px] leading-6 text-[var(--color-text-secondary)]">{articleOfDay.excerpt}</p>}</div><div className="mt-7 flex items-center justify-between gap-3 text-[12px] text-[var(--color-text-muted)]"><span>{articleOfDay.author?.username}</span><span>{articleOfDay.readTime || 'Read now'}</span></div></div></Link></div></section>}<div className="mt-5 flex justify-end"><FilterBar label="Topic" value={topic} onChange={value => updateFilter('trendingTopic', value, 'all')} options={[{ id: 'all', label: 'All' }, { id: 'science', label: 'Science' }, { id: 'design', label: 'Design' }, { id: 'wellness', label: 'Wellness' }, { id: 'career', label: 'Career' }]} sortOptions={[{ id: 'popular', label: 'Most appreciated' }, { id: 'latest', label: 'Latest' }]} sortValue={sort} onSortChange={value => updateFilter('trendingSort', value, 'popular')} /></div>
      {feed.isPending && <PostFeedSkeleton count={3} label="Loading trending stories" />}
      {feed.isError && <div role="alert" className="py-12"><p className="text-[13px] text-[var(--color-danger)]">Popular stories are unavailable.</p><button type="button" onClick={() => feed.refetch()} className="mt-3 inline-flex min-h-10 items-center text-[12px] font-semibold underline sm:min-h-0">Try again</button></div>}
      {!feed.isPending && !feed.isError && posts.length === 0 && <p className="py-12 text-[13px] text-[var(--color-text-muted)]">Popular stories will appear as readers begin responding.</p>}
      {filteredPosts.filter(post => post.id !== articleOfDay?.id).map(post => <DiscoveryPostCard key={post.id} post={post} />)}
      {feed.hasNextPage && <button type="button" onClick={() => feed.fetchNextPage()} disabled={feed.isFetchingNextPage} className="mt-8 px-5 py-2.5 rounded-full border border-[var(--color-border)] text-[12px] font-semibold disabled:opacity-50">{feed.isFetchingNextPage ? 'Loading…' : 'Load more'}</button>}
    </section>
  )
}
