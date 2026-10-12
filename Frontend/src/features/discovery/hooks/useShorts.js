import { useSelector } from 'react-redux'
import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchShorts } from '../api/shorts'

export default function useShorts(sort) {
  const { user, isReady } = useSelector(state => state.auth)
  return useInfiniteQuery({
    enabled: isReady,
    queryKey: ['shorts', sort || 'latest', user || 'anonymous'],
    queryFn: ({ pageParam }) => fetchShorts({ sort, cursor: pageParam }),
    initialPageParam: null,
    getNextPageParam: page => page.meta.nextCursor || undefined,
  })
}
