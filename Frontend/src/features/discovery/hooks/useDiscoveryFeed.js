import { useSelector } from 'react-redux'
import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchDiscoveryFeed } from '../api/feed'

export default function useDiscoveryFeed(mode, sort) {
  const { user, isReady } = useSelector(state => state.auth)
  return useInfiniteQuery({
    enabled: isReady,
    queryKey: ['discovery-feed', mode, sort || 'default', user || 'anonymous'],
    queryFn: ({ pageParam }) => fetchDiscoveryFeed({ mode, sort, cursor: pageParam }),
    initialPageParam: null,
    getNextPageParam: page => page.meta.nextCursor || undefined,
  })
}
