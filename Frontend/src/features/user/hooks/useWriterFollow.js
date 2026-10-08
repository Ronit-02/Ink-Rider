import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import updateWriterFollow from '../api/updateWriterFollow'
import { writerKey } from './useWriter'
import { createInteractionEvent, recordInteractionEvents } from '@/features/discovery/api/events'
import useToast from '@/shared/hooks/useToast'

export default function useWriterFollow({ writerId, handle }) {
  const token = useSelector(state => state.auth.token)
  const queryKey = writerKey(handle, Boolean(token))
  const queryClient = useQueryClient()
  const { notify } = useToast()

  return useMutation({
    mutationFn: isFollowing => updateWriterFollow({ writerId, isFollowing }),
    onMutate: async isFollowing => {
      await queryClient.cancelQueries({ queryKey })
      const previousWriter = queryClient.getQueryData(queryKey)
      queryClient.setQueryData(queryKey, writer => {
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
      queryClient.setQueryData(queryKey, writer => (
        writer ? { ...writer, ...data } : writer
      ))
      if (data.isFollowing) {
        recordInteractionEvents([createInteractionEvent({ eventType: 'follow', writerId, surface: 'writer' })]).catch(() => {})
      }
      notify(data.isFollowing ? 'Writer followed.' : 'Writer unfollowed.')
    },
    onError: (error, isFollowing, context) => {
      if (context?.previousWriter) {
        queryClient.setQueryData(queryKey, context.previousWriter)
      }
      notify('The follow status could not be updated.', { tone: 'error' })
    },
  })
}
