import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { saveReadingState } from '../api/readingState'

const CHECKPOINT_STEP = 10
const CHECKPOINT_INTERVAL = 10000

export default function usePersistReadingProgress(postId, progress, enabled) {
  const queryClient = useQueryClient()
  const lastSent = useRef(null)
  const lastSentAt = useRef(0)
  const latest = useRef({ postId, progress })

  useEffect(() => { latest.current = { postId, progress } }, [postId, progress])

  useEffect(() => {
    if (!enabled || !postId) return undefined
    const checkpoint = (force = false) => {
      const current = latest.current
      const value = Math.min(100, Math.max(0, Math.floor(current.progress / CHECKPOINT_STEP) * CHECKPOINT_STEP))
      if (!force && (value === lastSent.current || Date.now() - lastSentAt.current < CHECKPOINT_INTERVAL)) return
      if (value === lastSent.current) return
      lastSent.current = value
      lastSentAt.current = Date.now()
      saveReadingState(current.postId, value, value >= 90).then(saved => {
        queryClient.setQueriesData({ queryKey: ['reading-history'] }, history => {
          if (!history) return history
          const update = item => String(item.id) === String(current.postId)
            ? { ...item, progress: saved.progress, completed: saved.completed, lastReadAt: saved.lastReadAt }
            : item
          return {
            ...history,
            history: (history.history || []).map(update),
            continueReading: (history.continueReading || []).map(update),
          }
        })
      }).catch(() => { lastSent.current = null })
    }
    const onVisibilityChange = () => { if (document.visibilityState === 'hidden') checkpoint(true) }
    const onPageHide = () => checkpoint(true)
    const interval = window.setInterval(() => checkpoint(), CHECKPOINT_INTERVAL)
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('pagehide', onPageHide)
    return () => { checkpoint(true); window.clearInterval(interval); document.removeEventListener('visibilitychange', onVisibilityChange); window.removeEventListener('pagehide', onPageHide) }
  }, [enabled, postId, queryClient])
}
