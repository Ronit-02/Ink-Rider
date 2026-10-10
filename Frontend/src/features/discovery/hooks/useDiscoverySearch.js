import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { searchDiscovery } from '../api/search'

export default function useDiscoverySearch(query, type, filters = {}) {
  const normalizedQuery = query.trim()
  const { topic = 'all', time = 'any', sort = 'relevance' } = filters
  const isReady = useSelector(state => state.auth.isReady)
  const user = useSelector(state => state.auth.user)

  return useQuery({
    queryKey: ['discovery-search', normalizedQuery, type, topic, time, sort, type === 'questions' ? user || 'anonymous' : null],
    queryFn: () => searchDiscovery({ query: normalizedQuery, type, topic, time, sort }),
    enabled: normalizedQuery.length >= 1 && (type !== 'questions' || isReady),
    retry: false,
    staleTime: 30_000,
  })
}
