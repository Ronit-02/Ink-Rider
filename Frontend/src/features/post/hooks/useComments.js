import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchComments } from '../api/comments'
import { useSelector } from 'react-redux'

export const commentsKey = (postId, viewer = 'anonymous', parentCommentId = null) => ['post-comments', postId, viewer, parentCommentId]

export default function useComments(postId, parentCommentId = null, enabled = true) {
  const { user, isReady } = useSelector(state => state.auth)
  return useInfiniteQuery({
    queryKey: commentsKey(postId, user || 'anonymous', parentCommentId),
    queryFn: ({ pageParam }) => fetchComments({ postId, cursor: pageParam, parentCommentId }),
    initialPageParam: null,
    getNextPageParam: lastPage => lastPage.meta.nextCursor || undefined,
    enabled: Boolean(postId) && isReady && enabled,
  })
}
