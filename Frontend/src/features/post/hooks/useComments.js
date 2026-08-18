import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchComments } from '../api/comments'

export const commentsKey = postId => ['post-comments', postId]

export default function useComments(postId) {
  return useInfiniteQuery({
    queryKey: commentsKey(postId),
    queryFn: ({ pageParam }) => fetchComments({ postId, cursor: pageParam }),
    initialPageParam: null,
    getNextPageParam: lastPage => lastPage.meta.nextCursor || undefined,
    enabled: Boolean(postId),
  })
}
