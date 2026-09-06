import { useMutation, useQueryClient } from "@tanstack/react-query";
import bookmarkPost from "../api/bookmarkPost";
import { createInteractionEvent, recordInteractionEvents } from '@/features/discovery/api/events'
import useToast from '@/shared/hooks/useToast'
import { isPostCacheQuery, updatePostCaches } from './postCache'

export default function useBookmarkPost(postId) {
    const queryClient = useQueryClient();
    const { notify } = useToast()

    return useMutation({
        mutationFn: (isBookmarked) => bookmarkPost({ postId, isBookmarked }),
        onMutate: async (isBookmarked) => {
            const cacheFilter = { predicate: isPostCacheQuery }
            await queryClient.cancelQueries(cacheFilter)
            const previousCaches = queryClient.getQueriesData(cacheFilter)
            updatePostCaches(queryClient, postId, post => ({ ...post, isBookmarked }))
            return { previousCaches };
        },
        onSuccess: (data) => {
            updatePostCaches(queryClient, postId, post => ({ ...post, isBookmarked: data.isBookmarked }))
            queryClient.invalidateQueries({ queryKey: ['me', 'bookmarks'] })
            queryClient.invalidateQueries({ queryKey: ['post', postId] })
            if (data.isBookmarked) {
                recordInteractionEvents([createInteractionEvent({ eventType: 'save', postId, surface: 'article' })]).catch(() => {})
            }
            notify(data.isBookmarked ? 'Story saved.' : 'Story removed from saved.')
        },
        onError: (error, isBookmarked, context) => {
            context?.previousCaches?.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data))
            queryClient.invalidateQueries({ queryKey: ['post', postId] })
            notify('The saved status could not be updated.', { tone: 'error' })
        }
    })
}
