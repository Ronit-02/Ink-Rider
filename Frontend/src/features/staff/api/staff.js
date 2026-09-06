import api from '@/app/api'

export const fetchReports = async status => (await api.get('/api/staff/reports', { params: { status } })).data.data
export const reviewReport = async ({ reportId, ...input }) => (await api.post(`/api/staff/reports/${reportId}/reviews`, input)).data.data
export const createCompetition = async input => (await api.post('/api/competition', input)).data.data
export const scoreCompetitionEntry = async ({ competitionId, entryId, ...input }) => (await api.put(`/api/competition/${competitionId}/entries/${entryId}/score`, input)).data.data
export const publishCompetitionResults = async ({ competitionId, winnerEntryIds }) => (await api.post(`/api/competition/${competitionId}/results`, { winnerEntryIds })).data.data
export const fetchCompetitionFraudSignals = async minutes => (await api.get('/api/staff/competition-fraud', { params: { minutes } })).data
export const reviewCompetitionFraudSignal = async input => (await api.post('/api/staff/competition-fraud/reviews', input)).data.data
