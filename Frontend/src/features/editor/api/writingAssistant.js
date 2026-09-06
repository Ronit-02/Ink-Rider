import api from '@/app/api'

export const requestWritingAssistance = async input => (await api.post('/api/v1/writing-assistant', input)).data
