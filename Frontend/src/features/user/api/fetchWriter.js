import api from '@/app/api'

export default async function fetchWriter({ queryKey }) {
  const [, handle] = queryKey
  const response = await api.get(`/api/writer/${encodeURIComponent(handle)}`)
  return response.data.data
}
