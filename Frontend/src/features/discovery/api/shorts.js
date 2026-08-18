import api from '@/app/api'

export async function fetchShorts({ sort, cursor }) {
  const response = await api.get('/api/post/shorts', { params: { sort: sort || undefined, cursor: cursor || undefined, limit: 18 } })
  return response.data
}
