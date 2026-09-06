import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import useDiscoveryFeed from '../../hooks/useDiscoveryFeed'
import DiscoveryPostCard from '../../components/DiscoveryPostCard'
import { createInteractionEvent, recordInteractionEvents } from '../../api/events'
import useAuth from '@/features/auth/hooks/useAuth'
import HomeSections from './HomeSections'
import { PostFeedSkeleton } from '@/shared/components/ui/Skeleton'
import PageFrame from '@/shared/components/layout/PageFrame'

const FEEDS = [
  { id: 'for-you', label: 'For You', description: 'An explainable mix shaped by your interests and follows' },
  { id: 'latest', label: 'Latest', description: 'Fresh stories from across Ink Rider' },
  { id: 'popular', label: 'Popular', description: 'Stories readers are responding to' },
  { id: 'day', label: 'Past 24 hours', description: 'What is gaining attention today' },
]

function FeedState({ title, detail, action, isError = false }) {
  return (
    <div role={isError ? 'alert' : undefined} className="py-20 text-center border-y border-[var(--color-border)]">
      <h2 className="text-[18px] font-semibold text-[var(--color-text)]">{title}</h2>
      <p className="mt-2 text-[13px] text-[var(--color-text-secondary)]">{detail}</p>
      {action}
    </div>
  )
}

export default function HomePage() {
  const { loggedIn } = useAuth()
  const [params, setParams] = useSearchParams()
  const [hiddenPostIds, setHiddenPostIds] = useState([])
  const availableFeeds = loggedIn ? FEEDS : FEEDS.filter(item => item.id !== 'for-you')
  const requestedMode = params.get('feed')
  const mode = availableFeeds.some(item => item.id === requestedMode)
    ? requestedMode
    : loggedIn ? 'for-you' : 'latest'
  const feed = useDiscoveryFeed(mode)
  const posts = (feed.data?.pages.flatMap(page => page.data) || []).filter(post => !hiddenPostIds.includes(post.id))
  const selectedFeed = FEEDS.find(item => item.id === mode) || FEEDS[1]
  const recordedRequests = useRef(new Set())
  const feedSentinelRef = useRef(null)

  const setFeedMode = nextMode => {
    const next = new URLSearchParams(params)
    if ((loggedIn && nextMode === 'for-you') || (!loggedIn && nextMode === 'latest')) next.delete('feed')
    else next.set('feed', nextMode)
    setParams(next)
  }

  const handleFeedKeyDown = event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const currentIndex = availableFeeds.findIndex(item => item.id === mode)
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? availableFeeds.length - 1
        : (currentIndex + (event.key === 'ArrowRight' ? 1 : -1) + availableFeeds.length) % availableFeeds.length
    const nextFeed = availableFeeds[nextIndex]
    setFeedMode(nextFeed.id)
    requestAnimationFrame(() => document.getElementById(`home-feed-tab-${nextFeed.id}`)?.focus())
  }

  useEffect(() => {
    if (!feed.data?.pages) return
    let offset = 0
    for (const page of feed.data.pages) {
      const requestId = page.meta.recommendationRequestId
      if (requestId && !recordedRequests.current.has(requestId)) {
        recordedRequests.current.add(requestId)
        const events = page.data.map((post, index) => createInteractionEvent({
          eventType: 'impression',
          postId: post.id,
          writerId: post.author.id,
          surface: 'home',
          position: offset + index,
          recommendationRequestId: requestId,
        }))
        recordInteractionEvents(events).catch(() => recordedRequests.current.delete(requestId))
      }
      offset += page.data.length
    }
  }, [feed.data])

  useEffect(() => {
    const node = feedSentinelRef.current
    if (!node || !('IntersectionObserver' in window)) return undefined
    const root = node.closest('[data-app-scroll]')
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && feed.hasNextPage && !feed.isFetchingNextPage) feed.fetchNextPage()
    }, { root, rootMargin: '520px 0px' })
    observer.observe(node)
    return () => observer.disconnect()
  }, [feed.fetchNextPage, feed.hasNextPage, feed.isFetchingNextPage])

  const hidePost = post => {
    setHiddenPostIds(current => [...new Set([...current, post.id])])
    recordInteractionEvents([createInteractionEvent({
      eventType: 'hide',
      postId: post.id,
      writerId: post.author.id,
      surface: 'home',
      recommendationRequestId: post.recommendationRequestId,
    })]).catch(() => {})
  }

  return (
    <PageFrame>
      <header className="max-w-[760px] mb-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">Discover writing worth your time</p>
        <h1 className="mt-4 text-[clamp(34px,6vw,68px)] leading-[0.98] tracking-[-0.055em] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
          Ideas, stories, and answers from curious people.
        </h1>
        <p className="mt-5 text-[15px] leading-7 text-[var(--color-text-secondary)] max-w-[620px]">
          Follow what matters, discover emerging writers, and help shape what gets written next.
        </p>
      </header>

      <div role="tablist" aria-label="Discovery feeds" className="-mx-1 mb-8 flex max-w-full gap-1 overflow-x-auto border-b border-[var(--color-border)] px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {availableFeeds.map(feedOption => (
          <button key={feedOption.id} id={`home-feed-tab-${feedOption.id}`} type="button" role="tab" aria-selected={mode === feedOption.id} aria-controls="home-feed-panel" tabIndex={mode === feedOption.id ? 0 : -1} onKeyDown={handleFeedKeyDown} onClick={() => setFeedMode(feedOption.id)}
            className={`min-h-11 shrink-0 whitespace-nowrap px-1 mr-4 pb-3 text-[13px] font-semibold border-b-2 transition-colors ${mode === feedOption.id
              ? 'text-[var(--color-text)] border-[var(--color-accent)]'
              : 'text-[var(--color-text-muted)] border-transparent hover:text-[var(--color-text)]'}`}>
            {feedOption.label}
          </button>
        ))}
      </div>

      <section id="home-feed-panel" role="tabpanel" aria-labelledby={`home-feed-tab-${mode}`}>
      <div className="mb-7">
        <h2 className="text-[22px] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>{selectedFeed.label}</h2>
        <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">{selectedFeed.description}</p>
      </div>

      {feed.isPending && <PostFeedSkeleton count={4} label={`Loading ${selectedFeed.label.toLowerCase()} stories`} />}
      {feed.isError && <FeedState isError title="The feed could not be loaded" detail="Please check your connection and try again."
        action={<button type="button" onClick={() => feed.refetch()} className="mt-5 inline-flex min-h-10 items-center justify-center px-4 py-2 rounded-full bg-[var(--color-accent)] text-[var(--color-text-inverted)] text-[12px] font-semibold sm:min-h-0">Try again</button>} />}
      {!feed.isPending && !feed.isError && posts.length === 0 && (
        <FeedState title="No stories here yet" detail={mode === 'day' ? 'Nothing has been published in the past 24 hours.' : 'The first published story will appear here.'} />
      )}
      {posts.length > 0 && <section aria-live="polite" aria-busy={feed.isFetchingNextPage}>
        {posts.map((post, index) => <div key={post.id} className="stream-line" style={{ animationDelay: `${Math.min(index % 8, 5) * 45}ms` }}>
          <DiscoveryPostCard post={post} comfortable onHide={hidePost} />
          {index === 3 && <HomeSections type="writerPicks" posts={posts.slice(0, index + 1)} />}
          {index === 7 && <HomeSections type="categories" posts={posts.slice(0, index + 1)} />}
          {index === 11 && <HomeSections type="collections" posts={posts.slice(0, index + 1)} />}
          {index === 15 && <HomeSections type="topAuthors" posts={posts.slice(0, index + 1)} />}
        </div>)}
      </section>}
      <div ref={feedSentinelRef} aria-hidden="true" className="h-1" />
      {feed.isFetchingNextPage && <div className="fade-in mt-8 mb-4"><PostFeedSkeleton count={2} /></div>}
      {feed.hasNextPage && <div className="flex justify-center pt-10">
        <button type="button" onClick={() => feed.fetchNextPage()} disabled={feed.isFetchingNextPage}
          className="px-5 py-2.5 rounded-full border border-[var(--color-border)] text-[13px] font-semibold text-[var(--color-text)] disabled:opacity-50">
          {feed.isFetchingNextPage ? 'Loading…' : 'Load more stories'}
        </button>
      </div>}
      {!feed.hasNextPage && posts.length > 0 && posts.length < 16 && (
        <HomeSections
          type={posts.length < 4 ? 'writerPicks' : posts.length < 8 ? 'categories' : posts.length < 12 ? 'collections' : 'topAuthors'}
          posts={posts}
        />
      )}
      </section>
    </PageFrame>
  )
}
