import api from '@/app/api'

export default async function fetchDepthOptions() {
  return (await api.get('/api/post/depth-options')).data.data
}
