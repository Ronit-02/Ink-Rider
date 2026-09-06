import { useMutation } from '@tanstack/react-query'
import reportPost from '../api/reportPost'
import { createInteractionEvent, recordInteractionEvents } from '@/features/discovery/api/events'
import useToast from '@/shared/hooks/useToast'

export default function useReportPost(postId) {
  const { notify } = useToast()
  return useMutation({
    mutationFn: input => reportPost({ postId, ...input }),
    onSuccess: () => {
      recordInteractionEvents([createInteractionEvent({ eventType: 'report', postId, surface: 'article' })]).catch(() => {})
      notify('Report submitted for review.')
    },
    onError: () => notify('The report could not be submitted.', { tone: 'error' }),
  })
}
