import ModalHeader from '@/shared/components/ui/ModalHeader'
import retainRetryView from '@/shared/utils/retainRetryView'
import ModalLayer from '@/shared/components/ui/ModalLayer'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '@/shared/components/ui/Avatar'
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
import useBookmarkPost from '@/features/post/hooks/useBookmarkPost'
import useAuth from '@/features/auth/hooks/useAuth'
import useDialogFocus from '@/shared/hooks/useDialogFocus'
import { PostDetailSkeleton } from '@/shared/components/ui/Skeleton'

const parseBlocks = body => {
  try {
    const blocks = JSON.parse(body)
    return Array.isArray(blocks) ? blocks : null
  } catch {
    return null
  }
}

export default function ShortReadModal({ postId, onClose }) {
  const closeButtonRef = useRef(null)
  const [shareOpen, setShareOpen] = useState(false)
  const shareTriggerRef = useRef(null)
  const { loggedIn, signIn, user } = useAuth()
  const postQuery = retainRetryView(useFetchPost(postId))
  const likeMutation = usePostLike(postId)
  const bookmarkMutation = useBookmarkPost(postId)
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

  const handleLike = () => {
    if (!loggedIn) return signIn()
    likeMutation.mutate(!post.isLiked)
  }

  const handleBookmark = () => {
    if (!loggedIn) return signIn()
    bookmarkMutation.mutate(!post.isBookmarked)
  }

  return <ModalLayer onDismiss={onClose} aria-busy={postQuery.isPending} aria-labelledby={post && blocks ? 'short-read-title' : 'short-read-dialog-label'} className="flex items-end justify-center p-0 sm:items-center sm:p-5">
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
            {authorHandle ? <Link to={`/author/${encodeURIComponent(authorHandle)}`} onClick={onClose} aria-label={`Open writer profile for ${post.author.username}`} className="shrink-0 rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"><Avatar src={post.author?.picture} name={post.author?.username} size={34} /></Link> : <Avatar src={post.author?.picture} name={post.author?.username} size={34} />}
            <div className="min-w-0">
              {authorHandle ? <Link to={`/author/${encodeURIComponent(authorHandle)}`} onClick={onClose} aria-label={`View ${post.author.username}'s profile`} className="block w-fit max-w-full rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"><p className="truncate text-[12px] font-semibold text-[var(--color-text)]">{post.author?.username}</p></Link> : <p className="truncate text-[12px] font-semibold text-[var(--color-text)]">{post.author?.username}</p>}
              <p className="text-[11px] text-[var(--color-text-muted)]">{post.readTime || 'Short read'}</p>
            </div>
          </div>
          {(likeMutation.isError || bookmarkMutation.isError) && <p role="alert" className="mt-3 text-[12px] text-[var(--color-danger)]">We couldn't update this short read. Please try again.</p>}
          <Divider className="my-7" />
          <PostBody body={blocks} compact />
          <Divider className="my-8" />
          <div id="short-read-comments"><CommentsSection postId={postId} initialCount={post.commentsCount || 0} compact /></div>
          {loggedIn && <p className="sr-only">Commenting as {user || 'you'}</p>}
        </>}
      </div>
      {post && blocks && <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 sm:px-7">
        <AppreciationButton isLiked={post.isLiked} count={post.likesCount} label={post.isLiked ? 'Remove appreciation' : 'Appreciate this short read'} disabled={likeMutation.isPending} onClick={handleLike} />
        <button type="button" onClick={handleBookmark} disabled={bookmarkMutation.isPending} aria-label={post.isBookmarked ? 'Remove short read from saved articles' : 'Save this short read'} aria-pressed={post.isBookmarked} className={`flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] transition-colors disabled:opacity-60 ${post.isBookmarked ? 'bg-[var(--color-accent)] text-[var(--color-text-inverted)]' : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]'}`} aria-busy={bookmarkMutation.isPending}><BookmarkIcon filled={post.isBookmarked} /></button>
        <button ref={shareTriggerRef} type="button" onClick={() => setShareOpen(true)} aria-label="Share this short read" aria-haspopup="dialog" aria-expanded={shareOpen} aria-controls={shareOpen ? `short-share-${postId}` : undefined} className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]"><ShareIcon /></button>
      </footer>}
    </section>
    {shareOpen && post && <ShareMenu anchorRef={shareTriggerRef} id={`short-share-${postId}`} label="Share short read" contentName="Short read" url={`${window.location.origin}/post/${post._id || postId}`} onClose={({ restoreFocus = false } = {}) => { setShareOpen(false); if (restoreFocus) requestAnimationFrame(() => shareTriggerRef.current?.focus()) }} />}
  </ModalLayer>
}
