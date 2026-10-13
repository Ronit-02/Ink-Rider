import api from '@/app/api'

export async function saveReadingState(postId, progress, completed = false) {
  return (await api.put(`/api/v1/reading-state/${postId}`, { progress, completed })).data.data
}
