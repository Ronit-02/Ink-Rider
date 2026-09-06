import { useCallback, useEffect, useRef, useState } from 'react'
import Avatar from '@/shared/components/ui/Avatar'
import BookmarkIcon from '@/shared/icons/BookmarkIcon'
import ShareIcon from '@/shared/icons/ShareIcon'
import Button from '@/shared/components/ui/Button'
import Divider from '@/shared/components/ui/Divider'
import PostBody from '@/features/post/pages/PostBody'
import CommentsSection from '@/features/post/pages/CommentsSection'
import useFetchPost from '@/features/post/hooks/useFetchPost'
import usePostLike from '@/features/post/hooks/usePostLike'
import useBookmarkPost from '@/features/post/hooks/useBookmarkPost'
import useAuth from '@/features/auth/hooks/useAuth'
import useDialogFocus from '@/shared/hooks/useDialogFocus'
import { PostDetailSkeleton } from '@/shared/components/ui/Skeleton'
import useToast from '@/shared/hooks/useToast'

const HeartIcon = ({ filled }) => (
  <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
)

const CommentIcon = () => (
  <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.4 8.4 0 01-9 8.5 9.7 9.7 0 01-4-.8L3 21l1.3-4.1A8.3 8.3 0 013 11.5 8.5 8.5 0 0112 3a8.5 8.5 0 019 8.5z" />
  </svg>
)

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
  const [shareStatus, setShareStatus] = useState('')
  const { loggedIn, signIn, user } = useAuth()
  const { notify } = useToast()
  const postQuery = useFetchPost(postId)
  const likeMutation = usePostLike(postId)
  const bookmarkMutation = useBookmarkPost(postId)
  const post = postQuery.data
  const blocks = post ? parseBlocks(post.body) : null

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

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post._id}`
    try {
      await navigator.clipboard.writeText(url)
      setShareStatus('Link copied')
      notify('Short read link copied.')
      window.setTimeout(() => setShareStatus(''), 1800)
    } catch {
      setShareStatus('Copy unavailable')
      notify('The short read link could not be copied.', { tone: 'error' })
    }
  }

  const scrollToComments = () => {
    const comments = document.getElementById('short-read-comments')
    if (!comments) return
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    comments.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
  }

  return <div className="fixed inset-0 z-[300] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-5" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}>
    <section ref={dialogRef} role="dialog" aria-modal="true" aria-busy={postQuery.isPending} aria-labelledby={post && blocks ? 'short-read-title' : 'short-read-dialog-label'} tabIndex={-1} className="flex max-h-[94dvh] w-full max-w-[440px] flex-col overflow-hidden rounded-t-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_20px_70px_rgba(0,0,0,0.24)] sm:max-h-[88dvh] sm:rounded-[16px]">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--color-border)] px-5 py-4 sm:px-7">
        <div><p id="short-read-dialog-label" className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-accent)]">Short read</p><p className="mt-1 text-[11px] text-[var(--color-text-muted)]">A focused idea from the Ink Rider community</p></div>
        <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Close short read" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-alt)]">×</button>
      </header>

      <div className="min-h-0 overflow-y-auto px-5 py-6 sm:px-10 sm:py-8">
        {postQuery.isPending && <PostDetailSkeleton as="div" label="Loading short read" />}
        {postQuery.isError && <div className="py-16 text-center"><p role="alert" className="text-[13px] text-[var(--color-danger)]">This short read could not be loaded.</p><Button className="mt-4" variant="secondary" onClick={() => postQuery.refetch()}>Try again</Button></div>}
        {post && !blocks && <div className="py-16 text-center"><p role="alert" className="text-[13px] text-[var(--color-danger)]">This short read could not be displayed.</p><Button className="mt-4" variant="secondary" onClick={onClose}>Close</Button></div>}
        {post && blocks && <>
          {post.coverImage && <img src={post.coverImage} alt="" className="mx-auto mb-6 aspect-[4/5] w-full max-w-[320px] rounded-[10px] object-cover" />}
          <h2 id="short-read-title" className="text-[clamp(24px,5vw,34px)] font-bold leading-[1.12] tracking-[-0.045em] text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>{post.title}</h2>
          <div className="mt-4 flex items-center gap-3"><Avatar src={post.author?.picture} name={post.author?.username} size={34} /><div className="min-w-0"><p className="truncate text-[12px] font-semibold text-[var(--color-text)]">{post.author?.username}</p><p className="text-[11px] text-[var(--color-text-muted)]">{post.readTime || 'Short read'}</p></div></div>
          {(likeMutation.isError || bookmarkMutation.isError) && <p role="alert" className="mt-3 text-[12px] text-[var(--color-danger)]">We couldn't update this short read. Please try again.</p>}
          <Divider className="my-7" />
          <PostBody body={blocks} compact />
          <Divider className="my-8" />
          <div id="short-read-comments"><CommentsSection postId={postId} initialCount={post.commentsCount || 0} compact /></div>
          {loggedIn && <p className="sr-only">Commenting as {user || 'you'}</p>}
        </>}
      </div>
      {post && blocks && <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 sm:px-7">
        <button type="button" onClick={handleLike} disabled={likeMutation.isPending} aria-label={post.isLiked ? 'Remove appreciation' : 'Appreciate this short read'} aria-pressed={post.isLiked} className={`flex h-10 items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 text-[12px] transition-colors disabled:opacity-60 ${post.isLiked ? 'bg-[var(--color-accent)] text-[var(--color-text-inverted)]' : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]'}`}><HeartIcon filled={post.isLiked} /><span>{post.likesCount || 0}</span></button>
        <button type="button" onClick={handleBookmark} disabled={bookmarkMutation.isPending} aria-label={post.isBookmarked ? 'Remove short read from saved articles' : 'Save this short read'} aria-pressed={post.isBookmarked} className={`flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] transition-colors disabled:opacity-60 ${post.isBookmarked ? 'bg-[var(--color-accent)] text-[var(--color-text-inverted)]' : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]'}`}><BookmarkIcon filled={post.isBookmarked} /></button>
        <button type="button" onClick={scrollToComments} aria-label={`View ${post.commentsCount || 0} comments`} className="flex h-10 items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 text-[12px] text-[var(--color-text-secondary)]"><CommentIcon /><span>{post.commentsCount || 0}</span></button>
        <button type="button" onClick={handleShare} aria-label="Copy short read link" className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]"><ShareIcon /></button>
        {shareStatus && <span role="status" className="ml-auto text-[11px] text-[var(--color-text-muted)]">{shareStatus}</span>}
      </footer>}
    </section>
  </div>
}
