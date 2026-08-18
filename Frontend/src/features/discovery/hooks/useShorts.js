import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchShorts } from '../api/shorts'

export default function useShorts(sort) {
  return useInfiniteQuery({
    queryKey: ['shorts', sort || 'latest'],
    queryFn: ({ pageParam }) => fetchShorts({ sort, cursor: pageParam }),
    initialPageParam: null,
    getNextPageParam: page => page.meta.nextCursor || undefined,
  })
}
