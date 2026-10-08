import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import fetchWriter from '../api/fetchWriter'

export const writerKey = (handle, authenticated = false) => ['writer', handle, authenticated ? 'authenticated' : 'anonymous']

export default function useWriter(handle) {
  const token = useSelector(state => state.auth.token)
  const isAuthReady = useSelector(state => state.auth.isReady)
  return useQuery({
    queryKey: writerKey(handle, Boolean(token)),
    queryFn: fetchWriter,
    enabled: Boolean(handle) && isAuthReady,
    retry: (failureCount, error) => (
      error?.response?.status >= 500 && failureCount < 1
    ),
  })
}
