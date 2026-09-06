import { useMutation, useQueryClient } from '@tanstack/react-query'
import updateWriterFollow from '../api/updateWriterFollow'
import { writerKey } from './useWriter'
import { createInteractionEvent, recordInteractionEvents } from '@/features/discovery/api/events'
import useToast from '@/shared/hooks/useToast'

export default function useWriterFollow({ writerId, handle }) {
  const queryClient = useQueryClient()
  const { notify } = useToast()

  return useMutation({
    mutationFn: isFollowing => updateWriterFollow({ writerId, isFollowing }),
    onMutate: async isFollowing => {
      await queryClient.cancelQueries({ queryKey: writerKey(handle) })
      const previousWriter = queryClient.getQueryData(writerKey(handle))
      queryClient.setQueryData(writerKey(handle), writer => {
        if (!writer) return writer
        return {
          ...writer,
          isFollowing,
          followersCount: Math.max(0, writer.followersCount + (isFollowing ? 1 : -1)),
        }
      })
      return { previousWriter }
    },
    onSuccess: data => {
      queryClient.setQueryData(writerKey(handle), writer => (
        writer ? { ...writer, ...data } : writer
      ))
      if (data.isFollowing) {
        recordInteractionEvents([createInteractionEvent({ eventType: 'follow', writerId, surface: 'writer' })]).catch(() => {})
      }
      notify(data.isFollowing ? 'Writer followed.' : 'Writer unfollowed.')
    },
    onError: (error, isFollowing, context) => {
      if (context?.previousWriter) {
        queryClient.setQueryData(writerKey(handle), context.previousWriter)
      }
      notify('The follow status could not be updated.', { tone: 'error' })
    },
  })
}
