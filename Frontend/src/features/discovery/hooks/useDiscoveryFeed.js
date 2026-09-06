import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchDiscoveryFeed } from '../api/feed'

export default function useDiscoveryFeed(mode, sort) {
  return useInfiniteQuery({
    queryKey: ['discovery-feed', mode, sort || 'default'],
    queryFn: ({ pageParam }) => fetchDiscoveryFeed({ mode, sort, cursor: pageParam }),
    initialPageParam: null,
    getNextPageParam: page => page.meta.nextCursor || undefined,
  })
}
