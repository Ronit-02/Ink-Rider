import ModalHeader from '@/shared/components/ui/ModalHeader'
import { AddToCollectionDialog } from '@/features/collection'
import retainRetryView from '@/shared/utils/retainRetryView'
import ModalLayer from '@/shared/components/ui/ModalLayer'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '@/shared/components/ui/Avatar'
import Tag from '@/shared/components/ui/Tag'
import BookmarkIcon from '@/shared/icons/BookmarkIcon'
import ShareIcon from '@/shared/icons/ShareIcon'
import ShareMenu from '@/shared/components/ui/ShareMenu'
import Button from '@/shared/components/ui/Button'
import Divider from '@/shared/components/ui/Divider'
import PostBody from '@/features/post/pages/PostBody'
import CommentsSection from '@/features/post/pages/CommentsSection'
import useFetchPost from '@/features/post/hooks/useFetchPost'
import usePostLike from '@/features/post/hooks/usePostLike'
import AppreciationButton from '@/features/post/components/AppreciationButton'
import useAuth from '@/features/auth/hooks/useAuth'
import useDialogFocus from '@/shared/hooks/useDialogFocus'
import { PostDetailSkeleton } from '@/shared/components/ui/Skeleton'
import { createInteractionEvent, recordInteractionEvents } from '../api/events'
import { motion, useAnimationControls, useReducedMotion } from 'framer-motion'

const parseBlocks = body => {
  try {
    const blocks = JSON.parse(body)
    return Array.isArray(blocks) ? blocks : null
  } catch {
    return null
  }
}

export default function ShortReadModal({ postId, onClose, onNavigate, onNavigateAway, listIds = [], inSeriesView = false }) {
  const returnFocusRef = useRef(document.activeElement instanceof HTMLElement ? document.activeElement : null)
  const lastGestureRef = useRef(0)
  const [selection, setSelection] = useState({ source: postId, id: postId })
  const [direction, setDirection] = useState(1)
  const activeId = selection.source === postId ? selection.id : postId
  const navigate = (id, requestedDirection) => {
    const currentIndex = listIds.indexOf(activeId)
    const nextIndex = listIds.indexOf(id)
    setDirection(requestedDirection || (currentIndex >= 0 && nextIndex >= 0 && nextIndex < currentIndex ? -1 : 1))
    if (onNavigate) onNavigate(id)
    else setSelection({ source: postId, id })
  }
  const listIndex = listIds.indexOf(activeId)
  const navigateList = (direction, gesture = false) => {
    const nextId = listIds[listIndex + direction]
    if (!nextId || (gesture && Date.now() - lastGestureRef.current < 900)) return
    if (gesture) lastGestureRef.current = Date.now()
    navigate(nextId, direction)
  }
  return <ShortReader returnFocusRef={returnFocusRef} postId={activeId} onClose={onClose} onNavigate={navigate} onNavigateAway={onNavigateAway} listPosition={listIndex} listCount={listIds.length} onNavigateList={navigateList} transitionDirection={direction} inSeriesView={inSeriesView} />
}

function ShortReader({ postId, onClose, onNavigate, onNavigateAway, returnFocusRef, listPosition, listCount, onNavigateList, transitionDirection, inSeriesView }) {
  const closeButtonRef = useRef(null)
  const touchStartRef = useRef(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [saveOpen, setSaveOpen] = useState(false)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const shareTriggerRef = useRef(null)
  const saveTriggerRef = useRef(null)
  const previousPostRef = useRef(postId)
  const transitionControls = useAnimationControls()
  const reducedMotion = useReducedMotion()
  const { loggedIn, signIn, user } = useAuth()
  const postQuery = retainRetryView(useFetchPost(postId))
  const likeMutation = usePostLike(postId)
  const post = postQuery.data
  const blocks = post ? parseBlocks(post.body) : null
  const authorHandle = post?.author?.handle || post?.author?.username?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

  const handleClose = useCallback(() => onClose(), [onClose])
  const dialogRef = useDialogFocus(handleClose, closeButtonRef)

  useEffect(() => {
    if (previousPostRef.current === postId) return
    previousPostRef.current = postId
    setCommentsOpen(false)
    if (reducedMotion) {
      transitionControls.set({ y: 0, opacity: 1 })
      return
    }
    transitionControls.set({ y: transitionDirection > 0 ? '100%' : '-100%', opacity: 0.72 })
    transitionControls.start({ y: 0, opacity: 1, transition: { duration: 0.52, ease: [0.16, 1, 0.3, 1] } })
  }, [postId, reducedMotion, transitionControls, transitionDirection])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    return () => { document.body.style.overflow = previousOverflow }
  }, [])

  const recordedOpen = useRef(false)
  useEffect(() => {
    if (!post?._id || recordedOpen.current) return
    recordedOpen.current = true
    recordInteractionEvents([createInteractionEvent({ eventType: 'open', postId: post._id, writerId: post.author?._id, surface: 'article' })]).catch(() => {})
  }, [post])

  const handleLike = () => {
    if (!loggedIn) return signIn()
    likeMutation.mutate(!post.isLiked)
  }

  const handleBookmark = () => {
    if (!loggedIn) return signIn()
    setSaveOpen(true)
  }

  const atEdge = (element, direction) => direction > 0
    ? element.scrollTop + element.clientHeight >= element.scrollHeight - 2
    : element.scrollTop <= 2
  const interactiveTarget = target => target instanceof Element && Boolean(target.closest('a, button, input, textarea, select, [contenteditable="true"]'))
  const handleWheel = event => {
    if (listPosition < 0 || event.ctrlKey || Math.abs(event.deltaY) < 4 || interactiveTarget(event.target)) return
    const direction = Math.sign(event.deltaY)
    if (atEdge(event.currentTarget, direction)) onNavigateList(direction, true)
  }
  const handleOverlayWheel = event => {
    if (listPosition < 0 || event.ctrlKey || Math.abs(event.deltaY) < 4 || interactiveTarget(event.target)) return
    if (event.target instanceof Element && event.target.closest('[data-short-scroll], [data-short-comments-scroll]')) return
    onNavigateList(Math.sign(event.deltaY), true)
  }
  const handleTouchStart = event => {
    const touch = event.touches[0]
    touchStartRef.current = touch && !interactiveTarget(event.target)
      ? { x: touch.clientX, y: touch.clientY, atTop: atEdge(event.currentTarget, -1), atBottom: atEdge(event.currentTarget, 1) }
      : null
  }
  const handleTouchEnd = event => {
    const start = touchStartRef.current
    touchStartRef.current = null
    if (!start || listPosition < 0) return
    const touch = event.changedTouches[0]
    const deltaY = start.y - touch.clientY
    if (Math.abs(deltaY) < 70 || Math.abs(deltaY) < Math.abs(start.x - touch.clientX)) return
    if (deltaY > 0 && start.atBottom) onNavigateList(1, true)
    if (deltaY < 0 && start.atTop) onNavigateList(-1, true)
  }

  return <ModalLayer returnFocusRef={returnFocusRef} onDismiss={onClose} onWheel={handleOverlayWheel} aria-busy={postQuery.isPending} aria-labelledby={post && blocks ? 'short-read-title' : 'short-read-dialog-label'} className="flex items-end justify-center p-0 backdrop:backdrop-blur-[2px] sm:items-center sm:p-5">
    <div className="relative w-full max-w-[440px]">
    <section ref={dialogRef} tabIndex={-1} className="flex h-[calc(var(--overlay-height)*0.94)] w-full flex-col overflow-hidden rounded-t-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_20px_70px_rgba(0,0,0,0.24)] sm:h-[calc(var(--overlay-height)*0.88)] sm:rounded-[16px]">
      <motion.div animate={transitionControls} className="flex min-h-0 flex-1 flex-col">
      <ModalHeader title="Short read" titleId="short-read-dialog-label" subtitle="A focused idea from the Ink Rider community" onClose={onClose} closeLabel="Close short read" closeRef={closeButtonRef} />

      <div data-short-scroll className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-10 sm:py-8" onWheel={handleWheel} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {postQuery.isPending && <PostDetailSkeleton as="div" label="Loading short read" />}
        {postQuery.isError && <div className="py-16 text-center"><p role="alert" className="text-[13px] text-[var(--color-danger)]">This short read could not be loaded.</p><Button className="mt-4" variant="secondary" onClick={() => postQuery.refetch()} aria-busy={postQuery.isFetching} disabled={postQuery.isFetching}>Try again</Button></div>}
        {post && !blocks && <div className="py-16 text-center"><p role="alert" className="text-[13px] text-[var(--color-danger)]">This short read could not be displayed.</p><Button className="mt-4" variant="secondary" onClick={onClose}>Close</Button></div>}
        {post && blocks && <>
          {post.coverImage && <img src={post.coverImage} alt="" className="mx-auto mb-6 aspect-[4/5] w-full max-w-[320px] rounded-[10px] object-cover" />}
          <h2 id="short-read-title" className="text-[clamp(24px,5vw,34px)] font-bold leading-[1.12] tracking-[-0.045em] text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>{post.title}</h2>
          <div className="mt-4 flex items-center gap-3">
            {authorHandle ? <Link to={`/author/${encodeURIComponent(authorHandle)}`} onClick={onNavigateAway || onClose} aria-label={`Open writer profile for ${post.author.username}`} className="shrink-0 rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"><Avatar src={post.author?.picture} name={post.author?.username} size={34} /></Link> : <Avatar src={post.author?.picture} name={post.author?.username} size={34} />}
            <div className="min-w-0">
              {authorHandle ? <Link to={`/author/${encodeURIComponent(authorHandle)}`} onClick={onNavigateAway || onClose} aria-label={`View ${post.author.username}'s profile`} className="block w-fit max-w-full rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"><p className="truncate text-[12px] font-semibold text-[var(--color-text)]">{post.author?.username}</p></Link> : <p className="truncate text-[12px] font-semibold text-[var(--color-text)]">{post.author?.username}</p>}
              <p className="text-[11px] text-[var(--color-text-muted)]">{post.readTime || 'Short read'}</p>
            </div>
          </div>
          {post.tags?.length > 0 && <div aria-label="Short read tags" className="mt-4 flex flex-wrap gap-2">{post.tags.map(tag => <Tag key={tag} label={tag} clickable />)}</div>}
          {likeMutation.isError && <p role="alert" className="mt-3 text-[12px] text-[var(--color-danger)]">We couldn't update this short read. Please try again.</p>}
          <Divider className="my-7" />
          {post.depthContext?.deeper && <aside className="mb-7 rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">Go deeper</p>
            <p className="mt-1 text-[13px] font-semibold">{post.depthContext.deeper.title}</p>
            <Link to={`/post/${post.depthContext.deeper.id}`} onClick={onNavigateAway || onClose} className="button-target mt-3 inline-flex min-h-10 items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-[18px] py-2 text-[13px]">Read full article →</Link>
          </aside>}
          <PostBody body={blocks} compact />
        </>}
      </div>
      {post && blocks && post.seriesContext && (post.seriesContext.next || inSeriesView) && <nav aria-label="Series progression" className="shrink-0 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-2 sm:px-7">
        {post.seriesContext.next
          ? <button type="button" onClick={() => onNavigate(post.seriesContext.next.id)} aria-label={`Next short in the series: ${post.seriesContext.next.title}`} className="button-target flex min-h-11 w-full min-w-0 flex-col items-start gap-1 rounded-[8px] px-2 py-1 text-left text-[var(--color-text)] transition-colors hover:bg-[var(--color-bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] min-[376px]:flex-row min-[376px]:items-center min-[376px]:gap-3">
            <span className="block w-full min-w-0 min-[376px]:flex-1"><span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Next{Number.isInteger(post.seriesContext.position) && Number.isInteger(post.seriesContext.total) ? ` · Part ${post.seriesContext.position + 2} of ${post.seriesContext.total}` : ' in series'}</span><span data-series-next-title className="block truncate whitespace-nowrap text-[14px] font-semibold leading-5">{post.seriesContext.next.title}</span></span><span data-series-next-action aria-hidden="true" className="shrink-0 whitespace-nowrap text-[12px] font-semibold text-[var(--color-accent)] min-[376px]:text-[18px]"><span className="min-[376px]:hidden">Read next →</span><span className="hidden min-[376px]:inline">→</span></span>
          </button>
          : <Link to={`/series/${post.seriesContext.id}`} onClick={onNavigateAway || onClose} aria-label="View the series" className="button-target flex min-h-11 min-w-0 flex-col items-start gap-1 rounded-[8px] px-2 py-1 text-[var(--color-text)] transition-colors hover:bg-[var(--color-bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] min-[376px]:flex-row min-[376px]:items-center min-[376px]:gap-3"><span className="block w-full min-w-0 min-[376px]:flex-1"><span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Series complete</span><span className="block truncate whitespace-nowrap text-[14px] font-semibold">View the full series</span></span><span aria-hidden="true" className="shrink-0 whitespace-nowrap text-[12px] font-semibold text-[var(--color-accent)] min-[376px]:text-[18px]"><span className="min-[376px]:hidden">View series →</span><span className="hidden min-[376px]:inline">→</span></span></Link>}
      </nav>}
      {post && blocks && <footer className="shrink-0 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 sm:px-7">
        <div id="short-read-comments" data-short-comments-scroll hidden={!commentsOpen} className="max-h-[35vh] overflow-y-auto border-b border-[var(--color-border)] pb-2"><CommentsSection postId={postId} initialCount={post.commentsCount || 0} compact collapsible expanded={commentsOpen} onExpandedChange={setCommentsOpen} hideHeading /></div>
        {loggedIn && <p className="sr-only">Commenting as {user || 'you'}</p>}
        <div role="group" aria-label="Short read actions" className="grid grid-cols-4 items-center gap-1">
          <AppreciationButton isLiked={post.isLiked} count={post.likesCount} label={post.isLiked ? 'Remove appreciation' : 'Appreciate this short read'} disabled={likeMutation.isPending} onClick={handleLike} showLikeText />
          <button type="button" onClick={() => setCommentsOpen(value => !value)} aria-label={`Comments (${post.commentsCount || 0})`} aria-expanded={commentsOpen} aria-controls="short-read-comments" className="button-target flex min-w-0 items-center justify-center gap-1 border-0 bg-transparent px-1 text-[12px] font-medium text-[var(--color-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"><svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.7 9.7 0 0 1-4-.8L3 21l1.3-4.1A8.3 8.3 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z" /></svg><span className="min-[376px]:hidden">{post.commentsCount || 0}</span><span className="hidden min-[376px]:inline">Comment</span></button>
          <button ref={saveTriggerRef} type="button" onClick={handleBookmark} aria-label={post.isBookmarked ? 'Manage saved short read' : 'Save this short read'} aria-haspopup="dialog" aria-pressed={post.isBookmarked} className={`button-target flex min-w-0 items-center justify-center gap-1 border-0 bg-transparent px-1 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] ${post.isBookmarked ? 'text-[var(--color-text)]' : 'text-[var(--color-text-secondary)]'}`}><BookmarkIcon filled={post.isBookmarked} /><span>{post.isBookmarked ? 'Saved' : 'Save'}</span></button>
          <button ref={shareTriggerRef} type="button" onClick={() => setShareOpen(true)} aria-label="Share this short read" aria-haspopup="dialog" aria-expanded={shareOpen} aria-controls={shareOpen ? `short-share-${postId}` : undefined} className="button-target flex min-w-0 items-center justify-center gap-1 border-0 bg-transparent px-1 text-[12px] font-medium text-[var(--color-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"><ShareIcon /><span>Share</span></button>
        </div>
      </footer>}
      </motion.div>
    </section>
    {listPosition >= 0 && listCount > 1 && <div role="group" aria-label="Browse short reads" className="absolute left-[calc(100%+16px)] top-1/2 hidden -translate-y-1/2 flex-col gap-3 md:flex">
      <button type="button" onClick={() => onNavigateList(-1)} disabled={listPosition === 0} aria-label="Previous short" className="button-target flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] shadow-[var(--shadow-float)] transition-colors hover:bg-[var(--color-bg-alt)] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"><span aria-hidden="true" className="text-[20px] leading-none">↑</span></button>
      <button type="button" onClick={() => onNavigateList(1)} disabled={listPosition === listCount - 1} aria-label="Next short" className="button-target flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] shadow-[var(--shadow-float)] transition-colors hover:bg-[var(--color-bg-alt)] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"><span aria-hidden="true" className="text-[20px] leading-none">↓</span></button>
    </div>}
    </div>
    {shareOpen && post && <ShareMenu anchorRef={shareTriggerRef} id={`short-share-${postId}`} label="Share short read" contentName="Short read" url={`${window.location.origin}/post/${post._id || postId}`} onClose={({ restoreFocus = false } = {}) => { setShareOpen(false); if (restoreFocus) requestAnimationFrame(() => shareTriggerRef.current?.focus()) }} />}
    {saveOpen && post && <AddToCollectionDialog postId={postId} title={post.title} isBookmarked={Boolean(post.isBookmarked)} saveMode returnFocusRef={saveTriggerRef} onClose={() => setSaveOpen(false)} />}
  </ModalLayer>
}
