import api from '@/app/api'

export const fetchCompetitions = async () => (await api.get('/api/competition')).data.data
export const fetchCompetition = async id => (await api.get(`/api/competition/${id}`)).data.data
export const fetchEligiblePosts = async id => (await api.get(`/api/competition/${id}/eligible-posts`)).data.data
export const submitEntry = async ({ competitionId, ...body }) => (await api.post(`/api/competition/${competitionId}/entries`, body)).data.data
export const updateEntryVote = async ({ competitionId, entryId, isVoted }) => (await api({ method: isVoted ? 'put' : 'delete', url: `/api/competition/${competitionId}/entries/${entryId}/vote` })).data.data
