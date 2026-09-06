import api from '@/app/api'

export const fetchMyProfile = async () => (await api.get('/api/user/me')).data.data
export const fetchMyPosts = async () => (await api.get('/api/user/me/posts')).data.data
export const fetchBookmarks = async () => (await api.get('/api/user/bookmarks')).data
export const fetchWriterAnalytics = async () => (await api.get('/api/user/analytics')).data.data
export const updateMyProfile = async input => (await api.put('/api/user/profile', input)).data.profile
export const setPostPublication = async ({ postId, status }) => (await api.patch(`/api/post/${postId}/publication`, { status })).data.data
