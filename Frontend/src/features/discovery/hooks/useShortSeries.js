import { useSelector } from 'react-redux'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addPostToSeries, createShortSeries, deleteShortSeries, fetchEligibleSeriesPosts, fetchEligibleShorts, fetchOwnedSeries, fetchShortSeries, fetchShortSeriesDetail, updateShortSeries } from '../api/shortSeries'
import useToast from '@/shared/hooks/useToast'

export const useShortSeriesList = (type = 'short') => useInfiniteQuery({ queryKey: ['short-series', 'list', type], queryFn: ({ pageParam }) => fetchShortSeries(pageParam, type), initialPageParam: null, getNextPageParam: page => page.meta.nextCursor || undefined })
export const useOwnedSeries = (type, postId, enabled = true) => useInfiniteQuery({ queryKey: ['short-series', 'owned', type, postId], queryFn: ({ pageParam }) => fetchOwnedSeries({ cursor: pageParam, type, postId }), initialPageParam: null, getNextPageParam: page => page.meta.nextCursor || undefined, enabled })
export const useShortSeriesDetail = id => {
  const { user, isReady } = useSelector(state => state.auth)
  return useQuery({ queryKey: ['short-series', id, user || 'anonymous'], queryFn: () => fetchShortSeriesDetail(id), enabled: Boolean(id) && isReady })
}
export const useEligibleShorts = enabled => useQuery({ queryKey: ['eligible-shorts'], queryFn: fetchEligibleShorts, enabled })
export const useEligibleSeriesPosts = (type, seriesId, enabled = true) => useQuery({ queryKey: ['eligible-series-posts', type, seriesId], queryFn: () => fetchEligibleSeriesPosts(type, seriesId), enabled })
export const useCreateShortSeries = () => { const client = useQueryClient(); const { notify } = useToast(); return useMutation({ mutationFn: createShortSeries, onSuccess: () => { client.invalidateQueries({ queryKey: ['short-series'] }); client.invalidateQueries({ queryKey: ['eligible-series-posts'] }); notify('Series created.') }, onError: () => notify('The series could not be created.', { tone: 'error' }) }) }
export const useUpdateShortSeries = id => { const client = useQueryClient(); const { notify } = useToast(); return useMutation({ mutationFn: input => updateShortSeries({ id, ...input }), onSuccess: () => { client.invalidateQueries({ queryKey: ['short-series'] }); client.invalidateQueries({ queryKey: ['eligible-series-posts'] }); notify('Series saved.') }, onError: () => notify('The series could not be saved.', { tone: 'error' }) }) }
export const useDeleteShortSeries = id => { const client = useQueryClient(); const { notify } = useToast(); return useMutation({ mutationFn: () => deleteShortSeries(id), onSuccess: () => { client.removeQueries({ queryKey: ['short-series', id] }); client.invalidateQueries({ queryKey: ['short-series'] }); client.invalidateQueries({ queryKey: ['eligible-series-posts'] }); notify('Series deleted.') }, onError: () => notify('The series could not be deleted.', { tone: 'error' }) }) }
export const useAddPostToSeries = () => { const client = useQueryClient(); const { notify } = useToast(); return useMutation({ mutationFn: addPostToSeries, onSuccess: () => { client.invalidateQueries({ queryKey: ['short-series'] }); client.invalidateQueries({ queryKey: ['eligible-series-posts'] }); notify('Added to series.') }, onError: () => notify('The post could not be added to the series.', { tone: 'error' }) }) }
