import api from '@/app/api'

export const fetchShortSeries = async (cursor, type = 'short') => (await api.get('/api/series', { params: { cursor: cursor || undefined, type } })).data
export const fetchOwnedSeries = async ({ cursor, type, postId }) => (await api.get('/api/series', { params: { cursor: cursor || undefined, type, mine: true, postId } })).data
export const fetchShortSeriesDetail = async id => (await api.get(`/api/short-series/${id}`)).data.data
export const fetchEligibleShorts = async () => (await api.get('/api/short-series/eligible-shorts')).data.data
export const fetchEligibleSeriesPosts = async (type, seriesId) => (await api.get('/api/short-series/eligible-posts', { params: { type, seriesId } })).data.data
export const createShortSeries = async input => (await api.post('/api/series', input)).data.data
export const updateShortSeries = async ({ id, ...input }) => (await api.put(`/api/series/${id}`, input)).data.data
export const deleteShortSeries = async id => (await api.delete(`/api/series/${id}`)).data.data
export const addPostToSeries = async ({ seriesId, postId }) => (await api.post(`/api/series/${seriesId}/items`, { postId })).data.data
