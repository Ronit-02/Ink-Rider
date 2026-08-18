import api from '@/app/api'

export default async function updatePostLike({ postId, isLiked }) {
  const response = await api.request({
    method: isLiked ? 'put' : 'delete',
    url: `/api/post/${postId}/like`,
  })

  return response.data
}
