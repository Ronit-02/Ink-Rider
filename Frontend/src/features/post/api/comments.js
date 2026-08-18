import api from '@/app/api'

export async function fetchComments({ postId, cursor }) {
  const response = await api.get(`/api/post/${postId}/comments`, {
    params: cursor ? { cursor } : undefined,
  })
  return response.data
}

export async function createComment({ postId, text }) {
  const response = await api.post(`/api/post/${postId}/comments`, { text })
  return response.data.data
}
