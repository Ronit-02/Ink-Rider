import { useQuery } from '@tanstack/react-query'
import { searchDiscovery } from '../api/search'

export default function useDiscoverySearch(query, type, filters = {}) {
  const normalizedQuery = query.trim()
  const { topic = 'all', time = 'any', sort = 'relevance' } = filters

  return useQuery({
    queryKey: ['discovery-search', normalizedQuery, type, topic, time, sort],
    queryFn: () => searchDiscovery({ query: normalizedQuery, type, topic, time, sort }),
    enabled: normalizedQuery.length >= 1,
    retry: false,
    staleTime: 30_000,
  })
}
