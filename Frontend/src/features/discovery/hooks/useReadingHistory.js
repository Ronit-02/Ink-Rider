import { useSelector } from 'react-redux'
import { useQuery } from '@tanstack/react-query'
import { fetchReadingHistory } from '../api/readingHistory'

export default function useReadingHistory() {
  const { user, isReady } = useSelector(state => state.auth)
  return useQuery({ queryKey: ['reading-history', user], queryFn: fetchReadingHistory, enabled: isReady && Boolean(user) })
}
