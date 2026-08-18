import { useId, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Button from '@/shared/components/ui/Button'
import Avatar from '@/shared/components/ui/Avatar'
import useAuth from '@/features/auth/hooks/useAuth'
import { createComment } from '../api/comments'
import useComments, { commentsKey } from '../hooks/useComments'
import { updatePostCaches } from '../hooks/postCache'
import { ListSkeleton } from '@/shared/components/ui/Skeleton'
import useToast from '@/shared/hooks/useToast'

const formatCommentDate = value => new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
}).format(new Date(value))

function Comment({ comment, compact = false }) {
  return (
    <article className={compact ? 'py-3 border-b border-[var(--color-border)]' : 'py-5 border-b border-[var(--color-border)]'}>
      <div className="flex items-start gap-3">
        <Avatar src={comment.author?.avatar} name={comment.author?.name || 'Former member'} size={compact ? 30 : 36} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-[6px]">
            <span className={compact ? 'font-semibold text-[12px] text-[var(--color-text)]' : 'font-semibold text-[13px] text-[var(--color-text)]'}>
              {comment.author?.name || 'Former member'}
            </span>
            <time dateTime={comment.createdAt} className={compact ? 'text-[10px] text-[var(--color-text-muted)]' : 'text-[11px] text-[var(--color-text-muted)]'}>
              {formatCommentDate(comment.createdAt)}
            </time>
          </div>
          <p className={compact ? 'text-[12px] text-[var(--color-text)] leading-[1.6] whitespace-pre-wrap' : 'text-[13px] text-[var(--color-text)] leading-[1.6] whitespace-pre-wrap'}>
            {comment.content}
          </p>
        </div>
      </div>
    </article>
  )
}

export default function CommentsSection({ postId, initialCount = 0, compact = false }) {
  const [text, setText] = useState('')
  const idPrefix = useId()
  const commentsHeadingId = `${idPrefix}-comments-heading`
  const commentInputId = `${idPrefix}-new-comment`
  const commentCountId = `${idPrefix}-comment-count`
  const queryClient = useQueryClient()
  const { loggedIn, signIn, user } = useAuth()
  const commentsQuery = useComments(postId)
  const { notify } = useToast()

  const comments = commentsQuery.data?.pages.flatMap(page => page.data) || []
  const count = Math.max(initialCount, comments.length)

  const commentMutation = useMutation({
    mutationFn: content => createComment({ postId, text: content }),
    onSuccess: comment => {
      queryClient.setQueryData(commentsKey(postId), previous => {
        if (!previous) return previous
        const [firstPage, ...remainingPages] = previous.pages
        return {
          ...previous,
          pages: [
            { ...firstPage, data: [comment, ...firstPage.data] },
            ...remainingPages,
          ],
        }
      })
      updatePostCaches(queryClient, postId, post => ({
        ...post,
        commentsCount: (post.commentsCount || 0) + 1,
      }))
      setText('')
      notify('Comment posted.')
    },
    onError: () => notify("We couldn't post your comment.", { tone: 'error' }),
  })

  const handleSubmit = event => {
    event?.preventDefault()
    const content = text.trim()
    if (!content || commentMutation.isPending) return
    commentMutation.mutate(content)
  }

  return (
    <section aria-labelledby={commentsHeadingId}>
      <h2 id={commentsHeadingId} className={`font-bold ${compact ? 'text-[17px] mb-4' : 'text-[22px] mb-6'} text-[var(--color-text)]`}
        style={{ fontFamily: 'var(--font-display)' }}>
        Comments ({count})
      </h2>

      <div data-comment-composer="true" className={`bg-[var(--color-bg-alt)] border border-[var(--color-border)] focus-within:border-[var(--color-focus)] focus-within:ring-2 focus-within:ring-[var(--color-focus)]/15 ${compact ? 'rounded-[12px] p-3 mb-5' : 'rounded-[20px] p-5 mb-8'}`}>
        {loggedIn ? (
          <div className="flex gap-3 items-start">
            <Avatar name={user || 'You'} size={compact ? 30 : 36} />
            <form className="flex-1" onSubmit={handleSubmit}>
              <label htmlFor={commentInputId} className="mb-2 block text-[12px] font-semibold text-[var(--color-text)]">Add a comment</label>
              <textarea
                id={commentInputId}
                value={text}
                maxLength={1000}
                required
                aria-describedby={commentCountId}
                onChange={event => setText(event.target.value)}
                placeholder="Add your comment…"
                className={`w-full border-none bg-transparent text-[13px] text-[var(--color-text)]
                  ${compact ? 'min-h-[56px]' : 'min-h-[80px]'}
                  leading-[1.6] resize-none font-[inherit] outline-none`}
              />
              <div className="flex items-center justify-between gap-3 mt-[10px]">
                <span id={commentCountId} className="text-[11px] text-[var(--color-text-muted)]">{text.length}/1000</span>
                {text.trim() && (
                  <div className="flex justify-end gap-2">
                    <Button className="min-h-10 sm:min-h-0" variant="secondary" onClick={() => setText('')} disabled={commentMutation.isPending}>Cancel</Button>
                    <Button className="min-h-10 sm:min-h-0" type="submit" variant="primary" disabled={commentMutation.isPending}>
                      {commentMutation.isPending ? 'Posting…' : 'Comment'}
                    </Button>
                  </div>
                )}
              </div>
              {commentMutation.isError && (
                <p role="alert" className="text-[12px] text-[var(--color-danger)] mt-2">
                  We couldn't post your comment. Please try again.
                </p>
              )}
            </form>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-[13px] text-[var(--color-text-secondary)]">Sign in to join the conversation.</p>
            <Button className="min-h-10 sm:min-h-0" variant="primary" onClick={signIn}>Sign in</Button>
          </div>
        )}
      </div>

      {commentsQuery.isLoading && (
        <ListSkeleton count={3} label="Loading comments" />
      )}
      {commentsQuery.isError && (
        <div className="py-6">
          <p role="alert" className="text-[13px] text-[var(--color-danger)] mb-3">We couldn't load the comments.</p>
          <Button className="min-h-10 sm:min-h-0" variant="secondary" onClick={() => commentsQuery.refetch()}>Try again</Button>
        </div>
      )}
      {!commentsQuery.isLoading && !commentsQuery.isError && comments.length === 0 && (
        <p className="text-[13px] text-[var(--color-text-muted)] py-6">No comments yet. Start the conversation.</p>
      )}
      {comments.map(comment => <Comment key={comment.id} comment={comment} compact={compact} />)}

      {commentsQuery.hasNextPage && (
        <div className="pt-6">
          <Button
            className="min-h-10 sm:min-h-0"
            variant="secondary"
            onClick={() => commentsQuery.fetchNextPage()}
            disabled={commentsQuery.isFetchingNextPage}
          >
            {commentsQuery.isFetchingNextPage ? 'Loading…' : 'Load more comments'}
          </Button>
        </div>
      )}
    </section>
  )
}
