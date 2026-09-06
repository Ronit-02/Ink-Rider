import api from '@/app/api'

export async function searchDiscovery({ query, type, suggestions = false, limit = 18, topic = 'all', time = 'any', sort = 'relevance' }) {
  const response = await api.get('/api/search', {
    params: { q: query, type, limit, topic, time, sort, ...(suggestions ? { suggestions: 'true' } : {}) },
  })
  return response.data
}
