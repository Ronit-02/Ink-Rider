import api from '@/app/api'

export const fetchShortSeries = async cursor => (await api.get('/api/short-series', { params: { cursor: cursor || undefined } })).data
export const fetchShortSeriesDetail = async id => (await api.get(`/api/short-series/${id}`)).data.data
export const fetchEligibleShorts = async () => (await api.get('/api/short-series/eligible-shorts')).data.data
export const createShortSeries = async input => (await api.post('/api/short-series', input)).data.data
export const updateShortSeries = async ({ id, ...input }) => (await api.put(`/api/short-series/${id}`, input)).data.data
