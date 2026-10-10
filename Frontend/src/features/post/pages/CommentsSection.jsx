import retainRetryView from '@/shared/utils/retainRetryView'
import { useId, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Button from '@/shared/components/ui/Button'
import Avatar from '@/shared/components/ui/Avatar'
import useAuth from '@/features/auth/hooks/useAuth'
import { createComment } from '../api/comments'
import CommentItem from '../components/CommentItem'
import useComments, { commentsKey } from '../hooks/useComments'
import { updatePostCaches } from '../hooks/postCache'
import { ListSkeleton } from '@/shared/components/ui/Skeleton'
import useToast from '@/shared/hooks/useToast'

export default function CommentsSection({ postId, initialCount = 0, compact = false }) {
  const [text, setText] = useState('')
  const idPrefix = useId()
  const commentsHeadingId = `${idPrefix}-comments-heading`
  const commentInputId = `${idPrefix}-new-comment`
  const commentCountId = `${idPrefix}-comment-count`
  const queryClient = useQueryClient()
  const { loggedIn, signIn, user } = useAuth()
  const commentsQuery = retainRetryView(useComments(postId))
  const { notify } = useToast()

  const comments = commentsQuery.data?.pages.flatMap(page => page.data) || []
  const count = commentsQuery.data?.pages[0]?.meta.totalCount ?? Math.max(initialCount, comments.length)

  const commentMutation = useMutation({
    mutationFn: content => createComment({ postId, text: content }),
    onSuccess: comment => {
      queryClient.setQueryData(commentsKey(postId, user || 'anonymous'), previous => {
        if (!previous) return previous
        const [firstPage, ...remainingPages] = previous.pages
        return {
          ...previous,
          pages: [
            { ...firstPage, data: [comment, ...firstPage.data], meta: { ...firstPage.meta, ...(firstPage.meta.totalCount !== undefined ? { totalCount: firstPage.meta.totalCount + 1 } : {}) } },
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

      <div data-comment-composer="true" className={`bg-[var(--color-surface)] border border-[var(--color-border)] focus-within:border-[var(--color-focus)] focus-within:ring-2 focus-within:ring-[var(--color-focus)]/15 rounded-[14px] ${compact ? 'p-3 mb-5' : 'p-4 mb-6'}`}>
        {loggedIn ? (
          <div className="flex gap-3 items-start">
            <Avatar name={user || 'You'} size={compact ? 30 : 36} />
            <form className="min-w-0 flex-1" onSubmit={handleSubmit}>
              <label htmlFor={commentInputId} className="mb-2 block text-[13px] font-semibold text-[var(--color-text)]">Add a comment</label>
              <textarea
                id={commentInputId}
                value={text}
                maxLength={1000}
                required
                aria-describedby={commentCountId}
                onChange={event => setText(event.target.value)}
                placeholder="Add your comment…"
                className={`block w-full border-none bg-transparent p-0 text-[14px] text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)]
                  ${compact ? 'min-h-[56px]' : 'min-h-[64px]'}
                  leading-[1.6] resize-y font-[inherit] !outline-none !shadow-none`}
              />
              <div className="flex items-center justify-between flex-wrap gap-2 mt-3 pt-3 border-t border-[var(--color-border)]">
                <span id={commentCountId} className="text-[12px] tabular-nums text-[var(--color-text-secondary)]">{text.length}/1000</span>
                <div className="ml-auto flex justify-end flex-wrap gap-2">
                  {text.trim() && <Button className="!min-h-11 !px-3" variant="ghost" onClick={() => setText('')} disabled={commentMutation.isPending}>Cancel</Button>}
                  <Button className="!min-h-11 !px-4" type="submit" variant="primary" disabled={!text.trim() || commentMutation.isPending} aria-busy={commentMutation.isPending}>
                    Comment
                  </Button>
                </div>
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
            <Button className="!min-h-11" variant="primary" onClick={signIn}>Sign in</Button>
          </div>
        )}
      </div>

      {commentsQuery.isLoading && (
        <ListSkeleton count={3} label="Loading comments" />
      )}
      {commentsQuery.isError && (
        <div className="py-6">
          <p role="alert" className="text-[13px] text-[var(--color-danger)] mb-3">We couldn't load the comments.</p>
          <Button className="min-h-10 sm:min-h-0" variant="secondary" onClick={() => commentsQuery.refetch()} aria-busy={commentsQuery.isFetching} disabled={commentsQuery.isFetching}>Try again</Button>
        </div>
      )}
      {!commentsQuery.isLoading && !commentsQuery.isError && comments.length === 0 && (
        <p className="text-[13px] text-[var(--color-text-secondary)] py-6">No comments yet. Start the conversation.</p>
      )}
      {comments.map(comment => <CommentItem key={comment.id} comment={comment} postId={postId} compact={compact} />)}

      {commentsQuery.hasNextPage && (
        <div className="pt-6">
          <Button
            className="min-h-10 sm:min-h-0"
            variant="secondary"
            onClick={() => commentsQuery.fetchNextPage()}
            disabled={commentsQuery.isFetchingNextPage}
           aria-busy={commentsQuery.isFetchingNextPage}>
            {'Load more comments'}
          </Button>
        </div>
      )}
    </section>
  )
}
