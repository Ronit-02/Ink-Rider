import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createShortSeries, fetchEligibleShorts, fetchShortSeries, fetchShortSeriesDetail, updateShortSeries } from '../api/shortSeries'
import useToast from '@/shared/hooks/useToast'

export const useShortSeriesList = () => useInfiniteQuery({ queryKey: ['short-series'], queryFn: ({ pageParam }) => fetchShortSeries(pageParam), initialPageParam: null, getNextPageParam: page => page.meta.nextCursor || undefined })
export const useShortSeriesDetail = id => useQuery({ queryKey: ['short-series', id], queryFn: () => fetchShortSeriesDetail(id), enabled: Boolean(id) })
export const useEligibleShorts = enabled => useQuery({ queryKey: ['eligible-shorts'], queryFn: fetchEligibleShorts, enabled })
export const useCreateShortSeries = () => { const client = useQueryClient(); const { notify } = useToast(); return useMutation({ mutationFn: createShortSeries, onSuccess: () => { client.invalidateQueries({ queryKey: ['short-series'] }); notify('Short series created.') }, onError: () => notify('The short series could not be created.', { tone: 'error' }) }) }
export const useUpdateShortSeries = id => { const client = useQueryClient(); const { notify } = useToast(); return useMutation({ mutationFn: input => updateShortSeries({ id, ...input }), onSuccess: () => { client.invalidateQueries({ queryKey: ['short-series', id] }); notify('Series order saved.') }, onError: () => notify('The series order could not be saved.', { tone: 'error' }) }) }
