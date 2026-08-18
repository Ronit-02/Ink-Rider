import api from '@/app/api'

export const fetchNotifications = async () => (await api.get('/api/v1/notifications')).data
export const markNotificationRead = async notificationId => api.put(`/api/v1/notifications/${notificationId}/read`)
export const markAllNotificationsRead = async () => api.put('/api/v1/notifications/read-all')
