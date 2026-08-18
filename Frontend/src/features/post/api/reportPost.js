import api from '@/app/api'

export default async function reportPost({ postId, reason, details }) {
  const response = await api.post(`/api/post/${postId}/reports`, {
    reason,
    details,
  })
  return response.data
}
