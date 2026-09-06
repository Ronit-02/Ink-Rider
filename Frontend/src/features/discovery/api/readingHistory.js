import api from '@/app/api'

export async function fetchReadingHistory() {
  return (await api.get('/api/v1/reading-history')).data.data
}
