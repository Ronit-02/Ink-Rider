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

const parseBlocks = body => {
  try {
    const blocks = JSON.parse(body)
    return Array.isArray(blocks) ? blocks : null
  } catch {
    return null
  }
}

export default function ShortReadModal({ postId, onClose, onNavigate, onNavigateAway }) {
  const returnFocusRef = useRef(document.activeElement instanceof HTMLElement ? document.activeElement : null)
  const [selection, setSelection] = useState({ source: postId, id: postId })
  const activeId = selection.source === postId ? selection.id : postId
  const navigate = id => onNavigate ? onNavigate(id) : setSelection({ source: postId, id })
  return <ShortReader key={activeId} returnFocusRef={returnFocusRef} postId={activeId} onClose={onClose} onNavigate={navigate} onNavigateAway={onNavigateAway} />
}

function ShortReader({ postId, onClose, onNavigate, onNavigateAway, returnFocusRef }) {
  const closeButtonRef = useRef(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [saveOpen, setSaveOpen] = useState(false)
  const shareTriggerRef = useRef(null)
  const saveTriggerRef = useRef(null)
  const { loggedIn, signIn, user } = useAuth()
  const postQuery = retainRetryView(useFetchPost(postId))
  const likeMutation = usePostLike(postId)
  const post = postQuery.data
  const blocks = post ? parseBlocks(post.body) : null
  const authorHandle = post?.author?.handle || post?.author?.username?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

  const handleClose = useCallback(() => onClose(), [onClose])
  const dialogRef = useDialogFocus(handleClose, closeButtonRef)

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

  return <ModalLayer returnFocusRef={returnFocusRef} onDismiss={onClose} aria-busy={postQuery.isPending} aria-labelledby={post && blocks ? 'short-read-title' : 'short-read-dialog-label'} className="flex items-end justify-center p-0 sm:items-center sm:p-5">
    <section ref={dialogRef} tabIndex={-1} className="flex max-h-[calc(var(--overlay-height)*0.94)] w-full max-w-[440px] flex-col overflow-hidden rounded-t-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_20px_70px_rgba(0,0,0,0.24)] sm:max-h-[calc(var(--overlay-height)*0.88)] sm:rounded-[16px]">
      <ModalHeader title="Short read" titleId="short-read-dialog-label" subtitle="A focused idea from the Ink Rider community" onClose={onClose} closeLabel="Close short read" closeRef={closeButtonRef} />

      <div className="min-h-0 overflow-y-auto px-5 py-6 sm:px-10 sm:py-8">
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
          {post.seriesContext && <nav aria-label="Short series progression" className="mb-7 rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-4">
            <Link to={`/shorts/series/${post.seriesContext.id}`} onClick={onNavigateAway || onClose} className="text-[12px] font-semibold">{post.seriesContext.title}</Link>
            <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">Part {post.seriesContext.position + 1} of {post.seriesContext.total}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {post.seriesContext.previous && <Button variant="secondary" onClick={() => onNavigate(post.seriesContext.previous.id)}>← Previous</Button>}
              {post.seriesContext.next && <Button onClick={() => onNavigate(post.seriesContext.next.id)}>Next →</Button>}
            </div>
          </nav>}
          {post.depthContext?.deeper && <aside className="mb-7 rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">Go deeper</p>
            <p className="mt-1 text-[13px] font-semibold">{post.depthContext.deeper.title}</p>
            <Link to={`/post/${post.depthContext.deeper.id}`} onClick={onNavigateAway || onClose} className="button-target mt-3 inline-flex min-h-10 items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-[18px] py-2 text-[13px]">Read full article →</Link>
          </aside>}
          <PostBody body={blocks} compact />
          <Divider className="my-8" />
          <div id="short-read-comments"><CommentsSection postId={postId} initialCount={post.commentsCount || 0} compact collapsible /></div>
          {loggedIn && <p className="sr-only">Commenting as {user || 'you'}</p>}
        </>}
      </div>
      {post && blocks && <footer className="shrink-0 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 sm:px-7">
        <div role="group" aria-label="Short read actions" className="grid grid-cols-3 items-center gap-1">
          <AppreciationButton isLiked={post.isLiked} count={post.likesCount} label={post.isLiked ? 'Remove appreciation' : 'Appreciate this short read'} disabled={likeMutation.isPending} onClick={handleLike} showLikeText />
          <button ref={saveTriggerRef} type="button" onClick={handleBookmark} aria-label={post.isBookmarked ? 'Manage saved short read' : 'Save this short read'} aria-haspopup="dialog" aria-pressed={post.isBookmarked} className={`button-target flex min-w-0 items-center justify-center gap-1 border-0 bg-transparent px-1 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] ${post.isBookmarked ? 'text-[var(--color-text)]' : 'text-[var(--color-text-secondary)]'}`}><BookmarkIcon filled={post.isBookmarked} /><span>{post.isBookmarked ? 'Saved' : 'Save'}</span></button>
          <button ref={shareTriggerRef} type="button" onClick={() => setShareOpen(true)} aria-label="Share this short read" aria-haspopup="dialog" aria-expanded={shareOpen} aria-controls={shareOpen ? `short-share-${postId}` : undefined} className="button-target flex min-w-0 items-center justify-center gap-1 border-0 bg-transparent px-1 text-[12px] font-medium text-[var(--color-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"><ShareIcon /><span>Share</span></button>
        </div>
      </footer>}
    </section>
    {shareOpen && post && <ShareMenu anchorRef={shareTriggerRef} id={`short-share-${postId}`} label="Share short read" contentName="Short read" url={`${window.location.origin}/post/${post._id || postId}`} onClose={({ restoreFocus = false } = {}) => { setShareOpen(false); if (restoreFocus) requestAnimationFrame(() => shareTriggerRef.current?.focus()) }} />}
    {saveOpen && post && <AddToCollectionDialog postId={postId} title={post.title} isBookmarked={Boolean(post.isBookmarked)} saveMode returnFocusRef={saveTriggerRef} onClose={() => setSaveOpen(false)} />}
  </ModalLayer>
}
