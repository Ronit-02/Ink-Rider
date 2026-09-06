import api from '@/app/api'

export default async function updateWriterFollow({ writerId, isFollowing }) {
  const response = await api.request({
    method: isFollowing ? 'put' : 'delete',
    url: `/api/writer/${writerId}/follow`,
  })
  return response.data
}
