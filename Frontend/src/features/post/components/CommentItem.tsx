import { useId, useLayoutEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Avatar from '@/shared/components/ui/Avatar'
import Button from '@/shared/components/ui/Button'
import useAuth from '@/features/auth/hooks/useAuth'
import useToast from '@/shared/hooks/useToast'
import useComments from '../hooks/useComments'
import { createComment, editComment, deleteComment, setCommentLike } from '../api/comments'
import { updatePostCaches } from '../hooks/postCache'

type CommentData = {
  id: string
  content: string
  createdAt: string
  author?: { name?: string; avatar?: string } | null
  canEdit?: boolean
  canDelete?: boolean
  isLiked?: boolean
  likesCount?: number
  repliesCount?: number
  isDeleted?: boolean
}
type Props = { comment: CommentData; postId: string; compact?: boolean; depth?: number }
type Action = { kind: 'edit' | 'reply'; text: string } | { kind: 'like'; liked: boolean } | { kind: 'delete' }

export default function CommentItem({ comment, postId, compact = false, depth = 0 }: Props) {
  const [mode, setMode] = useState<'edit' | 'reply' | null>(null)
  const [text, setText] = useState('')
  const [showReplies, setShowReplies] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const inputId = useId()
  const { loggedIn, signIn } = useAuth()
  const { notify } = useToast()
  const queryClient = useQueryClient()
  const repliesQuery = useComments(postId, comment.id, showReplies)
  const replies: CommentData[] = repliesQuery.data?.pages.flatMap(page => page.data) || []
  const mutation = useMutation({
    mutationFn: (action: Action) => {
      if (action.kind === 'delete') return deleteComment({ postId, commentId: comment.id })
      if (action.kind === 'like') return setCommentLike({ postId, commentId: comment.id, liked: action.liked })
      if (action.kind === 'edit') return editComment({ postId, commentId: comment.id, text: action.text })
      return createComment({ postId, text: action.text, parentCommentId: comment.id })
    },
    onSuccess: async (result, action) => {
      if (action.kind === 'delete' && result.deleted) updatePostCaches(queryClient, postId, post => ({ ...post, commentsCount: Math.max(0, (post.commentsCount || 0) - 1) }))
      if (action.kind === 'reply') {
        setShowReplies(true)
        updatePostCaches(queryClient, postId, post => ({ ...post, commentsCount: (post.commentsCount || 0) + 1 }))
      }
      await queryClient.invalidateQueries({ queryKey: ['post-comments', postId] })
      if (action.kind !== 'like') {
        setConfirmDelete(false)
        setMode(null)
        setText('')
        notify(action.kind === 'delete' ? 'Comment deleted.' : action.kind === 'edit' ? 'Comment updated.' : 'Reply posted.')
      }
    },
    onError: () => notify("We couldn't update the comment. Please try again.", { tone: 'error' }),
  })
  const start = (nextMode: 'edit' | 'reply') => {
    if (!loggedIn) return signIn()
    mutation.reset()
    setMode(nextMode)
    setText(nextMode === 'edit' ? comment.content : '')
  }

  return (
    <article className="pt-3 pb-1 border-b border-[var(--color-border)]">
      <div className="flex items-start gap-3">
        <Avatar src={comment.author?.avatar} name={comment.isDeleted ? 'Deleted comment' : comment.author?.name || 'Former member'} size={compact ? 30 : 36} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-1 mb-2">
            <span className="text-[13px] font-semibold text-[var(--color-text)] break-words min-w-0">
              {comment.isDeleted ? 'Deleted comment' : comment.author?.name || 'Former member'}
            </span>
            <time dateTime={comment.createdAt} className="text-[12px] text-[var(--color-text-secondary)]">
              {new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(comment.createdAt))}
            </time>
          </div>
          <CommentContent key={comment.isDeleted ? 'deleted' : comment.content} content={comment.isDeleted ? 'Comment deleted.' : comment.content} compact={compact} />
          <div className="flex flex-wrap gap-0 -ml-2">
            {!comment.isDeleted && <Button variant="action" data-comment-like="true" className="!min-h-11 !px-2 !items-start !pt-1 !pb-0 !leading-5 gap-1.5" aria-label={`${comment.isLiked ? 'Unlike' : 'Like'} (${comment.likesCount || 0})`} aria-pressed={Boolean(comment.isLiked)} disabled={mutation.isPending} aria-busy={mutation.isPending && mutation.variables?.kind === 'like'}
              onClick={() => loggedIn ? mutation.mutate({ kind: 'like', liked: !comment.isLiked }) : signIn()}>
              <svg className="mt-0.5" aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill={comment.isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
              <span>{comment.likesCount || 0}</span>
            </Button>}
            <Button variant="ghost" className="!min-h-11 !px-2 !items-start !pt-1 !pb-0 !leading-5" disabled={mutation.isPending} onClick={() => start('reply')}>Reply</Button>
            {comment.canEdit && loggedIn && <Button variant="ghost" className="!min-h-11 !px-2 !items-start !pt-1 !pb-0 !leading-5" disabled={mutation.isPending} onClick={() => start('edit')}>Edit</Button>}
            {comment.canDelete && loggedIn && <Button variant="ghost" className="!min-h-11 !px-2 !items-start !pt-1 !pb-0 !leading-5" disabled={mutation.isPending} onClick={() => { setConfirmDelete(true); setMode(null); mutation.reset() }}>Delete</Button>}
          </div>
          {confirmDelete && <div className="mt-2">
            <p className="text-[12px] text-[var(--color-text-secondary)]">Delete this comment? Replies will remain visible.</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Button variant="primary" className="!min-h-11" disabled={mutation.isPending} aria-busy={mutation.isPending} onClick={() => mutation.mutate({ kind: 'delete' })}>Delete comment</Button>
              <Button variant="secondary" className="!min-h-11" disabled={mutation.isPending} onClick={() => { setConfirmDelete(false); mutation.reset() }}>Cancel delete</Button>
            </div>
          </div>}
          {mode && (
            <form className="mt-3" onSubmit={event => {
              event.preventDefault()
              if (text.trim() && !mutation.isPending) mutation.mutate({ kind: mode, text: text.trim() })
            }}>
              <label htmlFor={inputId} className="block text-[12px] font-semibold mb-2">{mode === 'edit' ? 'Edit comment' : `Reply to ${comment.author?.name || 'comment'}`}</label>
              <textarea id={inputId} autoFocus required maxLength={1000} value={text} disabled={mutation.isPending} onChange={event => setText(event.target.value)}
                className="w-full min-h-20 p-3 rounded-[12px] bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[13px] text-[var(--color-text)]" />
              <div className="flex flex-wrap gap-2 mt-2">
                <Button variant="primary" className="!min-h-11" type="submit" disabled={!text.trim() || mutation.isPending} aria-busy={mutation.isPending}>{mode === 'edit' ? 'Save comment' : 'Post reply'}</Button>
                <Button variant="secondary" className="!min-h-11" disabled={mutation.isPending} onClick={() => { setMode(null); mutation.reset() }}>Cancel</Button>
              </div>
            </form>
          )}
          {mutation.isError && <p role="alert" className="text-[12px] text-[var(--color-danger)] mt-2">We couldn't update the comment. Please try again.</p>}
          {(Boolean(comment.repliesCount) || showReplies) && <Button variant="ghost" className="!min-h-11" aria-expanded={showReplies} onClick={() => setShowReplies(!showReplies)}>{showReplies ? 'Hide replies' : `View replies (${comment.repliesCount})`}</Button>}
        </div>
      </div>
      {showReplies && <div className={depth === 0 ? 'ml-3 pl-3 border-l border-[var(--color-border)]' : ''}>
        {repliesQuery.isLoading && <p role="status" className="text-[12px] py-3">Loading replies…</p>}
        {repliesQuery.isError && <div><p role="alert" className="text-[12px] text-[var(--color-danger)]">We couldn't load replies.</p><Button variant="secondary" onClick={() => repliesQuery.refetch()} aria-busy={repliesQuery.isFetching}>Try again</Button></div>}
        {replies.map(reply => <CommentItem key={reply.id} comment={reply} postId={postId} compact={compact} depth={depth + 1} />)}
        {repliesQuery.hasNextPage && <Button variant="secondary" className="!min-h-11" onClick={() => repliesQuery.fetchNextPage()} aria-busy={repliesQuery.isFetchingNextPage} disabled={repliesQuery.isFetchingNextPage}>Load more replies</Button>}
      </div>}
    </article>
  )
}

function CommentContent({ content, compact }: { content: string; compact: boolean }) {
  const contentId = useId()
  const contentRef = useRef<HTMLParagraphElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [hasOverflow, setHasOverflow] = useState(false)

  useLayoutEffect(() => {
    const paragraph = contentRef.current
    if (!paragraph) return
    let active = true
    const measure = () => {
      if (!active) return
      const lineHeight = parseFloat(getComputedStyle(paragraph).lineHeight)
      setHasOverflow(paragraph.scrollHeight > lineHeight * 4 + 1)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(paragraph)
    document.fonts.ready.then(measure)
    return () => { active = false; observer.disconnect() }
  }, [content, compact])

  return <>
    <p id={contentId} ref={contentRef} data-comment-content="true" className={`${compact ? 'text-[13px]' : 'text-[14px]'} ${expanded ? '' : 'line-clamp-4'} text-[var(--color-text)] leading-[1.6] break-words whitespace-pre-wrap`}>{content}</p>
    {hasOverflow && <Button variant="ghost" className="!min-h-11 !px-0 !py-0" aria-expanded={expanded} aria-controls={contentId} onClick={() => setExpanded(value => !value)}>{expanded ? 'Show less' : 'Read more'}</Button>}
  </>
}
