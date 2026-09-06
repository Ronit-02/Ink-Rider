import { useQuery } from '@tanstack/react-query'
import fetchWriter from '../api/fetchWriter'

export const writerKey = handle => ['writer', handle]

export default function useWriter(handle) {
  return useQuery({
    queryKey: writerKey(handle),
    queryFn: fetchWriter,
    enabled: Boolean(handle),
    retry: (failureCount, error) => (
      error?.response?.status >= 500 && failureCount < 1
    ),
  })
}
