import api from '@/app/api'

export async function fetchComments({ postId, cursor, parentCommentId }) {
  const response = await api.get(`/api/post/${postId}/comments`, {
    params: { ...(cursor ? { cursor } : {}), ...(parentCommentId ? { parentCommentId } : {}) },
  })
  return response.data
}

export async function createComment({ postId, text, parentCommentId }) {
  const response = await api.post(`/api/post/${postId}/comments`, { text, ...(parentCommentId ? { parentCommentId } : {}) })
  return response.data.data
}

export async function editComment({ postId, commentId, text }) {
  const response = await api.patch(`/api/v1/posts/${postId}/comments/${commentId}`, { text })
  return response.data.data
}

export async function deleteComment({ postId, commentId }) {
  const response = await api.delete(`/api/v1/posts/${postId}/comments/${commentId}`)
  return response.data.data
}

export async function setCommentLike({ postId, commentId, liked }) {
  const url = `/api/v1/posts/${postId}/comments/${commentId}/like`
  const response = await (liked ? api.put(url) : api.delete(url))
  return response.data.data
}
