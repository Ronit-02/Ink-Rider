import api from '@/app/api'

export const updatePost = async ({ postId, ...input }) => (await api.put(`/api/post/${postId}`, input)).data
