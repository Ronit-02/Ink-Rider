import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createCollection, deleteCollection, fetchCollection, fetchCollectionEligiblePosts, fetchCollections, updateCollection, updateCollectionFollow, updateCollectionSave } from '../api/collections'
import useToast from '@/shared/hooks/useToast'

export const useCollections = (mine, sort) => useInfiniteQuery({
  queryKey: ['collections', mine ? 'mine' : 'public', sort || 'latest'],
  queryFn: ({ pageParam }) => fetchCollections({ mine, sort, cursor: pageParam }),
  initialPageParam: null,
  getNextPageParam: page => page.meta.nextCursor || undefined,
})

export const useSavedCollections = sort => useInfiniteQuery({
  queryKey: ['collections', 'saved', sort || 'latest'],
  queryFn: ({ pageParam }) => fetchCollections({ saved: true, sort, cursor: pageParam }),
  initialPageParam: null,
  getNextPageParam: page => page.meta.nextCursor || undefined,
})

export const useCollection = id => useQuery({ queryKey: ['collection', id], queryFn: () => fetchCollection(id), enabled: Boolean(id) })
export const useCollectionEligiblePosts = enabled => useQuery({ queryKey: ['collection-eligible-posts'], queryFn: fetchCollectionEligiblePosts, enabled })
export const useCreateCollection = () => {
  const client = useQueryClient()
  const { notify } = useToast()
  return useMutation({ mutationFn: createCollection, onSuccess: () => { client.invalidateQueries({ queryKey: ['collections'] }); notify('Collection created.') }, onError: () => notify('The collection could not be created.', { tone: 'error' }) })
}
export const useCollectionSave = collectionId => {
  const client = useQueryClient()
  const { notify } = useToast()
  return useMutation({ mutationFn: isSaved => updateCollectionSave({ collectionId, isSaved }), onSuccess: (_, isSaved) => {
    client.invalidateQueries({ queryKey: ['collection', collectionId] })
    client.invalidateQueries({ queryKey: ['collections'] })
    notify(isSaved ? 'Collection saved.' : 'Collection removed from saved.')
  }, onError: () => notify('The collection save could not be updated.', { tone: 'error' }) })
}
export const useUpdateCollection = collectionId => {
  const client = useQueryClient()
  const { notify } = useToast()
  return useMutation({ mutationFn: input => updateCollection({ collectionId, ...input }), onSuccess: () => {
    client.invalidateQueries({ queryKey: ['collection', collectionId] })
    client.invalidateQueries({ queryKey: ['collections'] })
    notify('Collection updated.')
  }, onError: () => notify('The collection could not be updated.', { tone: 'error' }) })
}
export const useDeleteCollection = collectionId => {
  const client = useQueryClient()
  const { notify } = useToast()
  return useMutation({ mutationFn: () => deleteCollection(collectionId), onSuccess: () => {
    client.invalidateQueries({ queryKey: ['collections'] })
    client.removeQueries({ queryKey: ['collection', collectionId] })
    notify('Collection deleted.')
  }, onError: () => notify('The collection could not be deleted.', { tone: 'error' }) })
}
export const useCollectionFollow = collectionId => {
  const client = useQueryClient()
  const { notify } = useToast()
  return useMutation({ mutationFn: isFollowing => updateCollectionFollow({ collectionId, isFollowing }), onSuccess: (_, isFollowing) => {
    client.invalidateQueries({ queryKey: ['collection', collectionId] })
    client.invalidateQueries({ queryKey: ['collections'] })
    notify(isFollowing ? 'Collection followed.' : 'Collection unfollowed.')
  }, onError: () => notify('The collection follow status could not be updated.', { tone: 'error' }) })
}
