import api from '@/app/api'

export async function fetchCollections({ mine, saved, sort, cursor }) {
  const response = await api.get('/api/collection', { params: { mine: mine || undefined, saved: saved || undefined, sort: sort || undefined, cursor: cursor || undefined, limit: 12 } })
  return response.data
}

export async function fetchCollection(id) {
  return (await api.get(`/api/collection/${id}`)).data.data
}

export async function fetchCollectionEligiblePosts() {
  return (await api.get('/api/collection/eligible-posts')).data.data
}

export async function createCollection(input) {
  return (await api.post('/api/collection', input)).data.data
}

export async function updateCollection({ collectionId, ...input }) {
  return (await api.put(`/api/collection/${collectionId}`, input)).data.data
}

export async function deleteCollection(collectionId) {
  return (await api.delete(`/api/collection/${collectionId}`)).data.data
}

export async function updateCollectionSave({ collectionId, isSaved }) {
  return (await api({ method: isSaved ? 'put' : 'delete', url: `/api/collection/${collectionId}/save` })).data.data
}

export async function updateCollectionFollow({ collectionId, isFollowing }) {
  return (await api({ method: isFollowing ? 'put' : 'delete', url: `/api/collection/${collectionId}/follow` })).data.data
}
