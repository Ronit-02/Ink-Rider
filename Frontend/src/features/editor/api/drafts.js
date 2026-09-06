import api from '@/app/api'

export const fetchDraft = async draftId => (await api.get(`/api/drafts/${draftId}`)).data.data
export const fetchDrafts = async () => (await api.get('/api/drafts')).data.data
export const createDraft = async input => (await api.post('/api/drafts', input)).data.data
export const updateDraft = async ({ draftId, ...input }) => (await api.put(`/api/drafts/${draftId}`, input)).data.data
export const deleteDraft = async draftId => api.delete(`/api/drafts/${draftId}`)
