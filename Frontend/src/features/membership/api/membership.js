import api from '@/app/api'

export const fetchEntitlements = async () => {
  const response = await api.get('/api/v1/me/entitlements')
  return response.data.data
}

export const fetchPostSummary = async postId => {
  const response = await api.get(`/api/v1/posts/${postId}/summary`)
  return response.data.data
}

export const startMembershipCheckout = async () => (await api.post('/api/v1/billing/checkout')).data.data
export const openBillingPortal = async () => (await api.post('/api/v1/billing/portal')).data.data
