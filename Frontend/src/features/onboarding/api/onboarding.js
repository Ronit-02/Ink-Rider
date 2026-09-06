import api from '@/app/api'

export async function fetchOnboarding() {
  const response = await api.get('/api/v1/onboarding')
  return response.data.data
}

export async function saveOnboarding(payload) {
  const response = await api.put('/api/v1/onboarding', payload)
  return response.data.data
}

export async function resetInferredInterests() {
  const response = await api.delete('/api/v1/interests/inferred')
  return response.data.data
}
