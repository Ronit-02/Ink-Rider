import { useMutation, useQueryClient } from '@tanstack/react-query'
import updatePostLike from '../api/updatePostLike'
import useToast from '@/shared/hooks/useToast'
import { isPostCacheQuery, updatePostCaches } from './postCache'

export default function usePostLike(postId) {
  const queryClient = useQueryClient()
  const { notify } = useToast()

  return useMutation({
    mutationFn: isLiked => updatePostLike({ postId, isLiked }),
    onMutate: async isLiked => {
      const cacheFilter = { predicate: isPostCacheQuery }
      await queryClient.cancelQueries(cacheFilter)
      const previousCaches = queryClient.getQueriesData(cacheFilter)
      updatePostCaches(queryClient, postId, post => ({
        ...post,
        isLiked,
        likesCount: Math.max(0, (post.likesCount || 0) + (isLiked ? 1 : -1)),
      }))
      return { previousCaches }
    },
    onSuccess: (data, isLiked) => {
      const nextIsLiked = typeof data.isLiked === 'boolean' ? data.isLiked : data.liked
      updatePostCaches(queryClient, postId, post => ({
        ...post,
        isLiked: nextIsLiked,
        likesCount: data.likesCount ?? post.likesCount,
      }))
      queryClient.invalidateQueries({ queryKey: ['me', 'posts'] })
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
      notify(nextIsLiked ? 'Story appreciated.' : 'Appreciation removed.')
    },
    onError: (error, isLiked, context) => {
      context?.previousCaches?.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data))
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
      notify('The appreciation could not be updated.', { tone: 'error' })
    },
  })
}
