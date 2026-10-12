import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import fetchWriter from '../api/fetchWriter'

export const writerKey = (handle, viewer = 'anonymous') => ['writer', handle, viewer || 'anonymous']

export default function useWriter(handle) {
  const user = useSelector(state => state.auth.user)
  const isAuthReady = useSelector(state => state.auth.isReady)
  return useQuery({
    queryKey: writerKey(handle, user),
    queryFn: fetchWriter,
    enabled: Boolean(handle) && isAuthReady,
    retry: (failureCount, error) => (
      error?.response?.status >= 500 && failureCount < 1
    ),
  })
}
