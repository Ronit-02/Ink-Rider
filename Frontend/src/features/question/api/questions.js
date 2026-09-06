import api from '@/app/api'

export async function fetchQuestions({ sort, cursor }) {
  const response = await api.get('/api/question', { params: { sort, cursor: cursor || undefined, limit: 12 } })
  return response.data
}

export async function fetchQuestion(questionId) {
  const response = await api.get(`/api/question/${questionId}`)
  return response.data.data
}

export async function fetchQuestionOpportunities() {
  const response = await api.get('/api/question/opportunities')
  return response.data
}

export async function suggestQuestions(query) {
  const response = await api.get('/api/question/suggest', { params: { q: query } })
  return response.data.data
}

export async function createQuestion(input) {
  const response = await api.post('/api/question', input)
  return response.data.data
}

export async function updateQuestionUpvote({ questionId, isUpvoted }) {
  const response = await api({ method: isUpvoted ? 'put' : 'delete', url: `/api/question/${questionId}/upvote` })
  return response.data.data
}

export async function createQuestionAnswer({ questionId, text }) {
  const response = await api.post(`/api/question/${questionId}/answers`, { text })
  return response.data.data
}

export async function updateAnswerUpvote({ questionId, answerId, isUpvoted }) {
  const response = await api({ method: isUpvoted ? 'put' : 'delete', url: `/api/question/${questionId}/answers/${answerId}/upvote` })
  return response.data.data
}

export async function updateQuestionFollow({ questionId, isFollowing }) {
  const response = await api({ method: isFollowing ? 'put' : 'delete', url: `/api/question/${questionId}/follow` })
  return response.data.data
}

export async function updateQuestionClaim({ questionId, isClaimed }) {
  const response = await api({ method: isClaimed ? 'put' : 'delete', url: `/api/question/${questionId}/claim` })
  return response.data.data
}

export async function declineQuestion({ questionId }) {
  const response = await api.post(`/api/question/${questionId}/decline`)
  return response.data.data
}

export async function reportQuestion({ questionId, reason, details }) {
  const response = await api.post(`/api/question/${questionId}/reports`, { reason, details })
  return response.data.data
}

export async function reportAnswer({ questionId, answerId, reason, details }) {
  const response = await api.post(`/api/question/${questionId}/answers/${answerId}/reports`, { reason, details })
  return response.data.data
}
