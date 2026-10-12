import api from '@/app/api'

export type TagOption = { value: string; label: string }

export default async function fetchTagOptions(query: string): Promise<TagOption[]> {
  return (await api.get('/api/v1/tags', { params: { q: query } })).data.data
}
