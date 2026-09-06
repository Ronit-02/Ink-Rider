import api from '@/app/api'

export const googleLogin = async credential => (await api.post('/api/auth/google', { credential })).data
