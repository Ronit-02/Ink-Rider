import api from '@/app/api'

export async function fetchDiscoveryFeed({ mode, sort, cursor }) {
  const response = await api.get('/api/post/feed', {
    params: { mode, sort: sort || undefined, cursor: cursor || undefined, limit: 12 },
  })
  return response.data
}
