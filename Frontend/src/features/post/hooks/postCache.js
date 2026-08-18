const postCacheRoots = new Set([
  'post',
  'discovery-feed',
  'shorts',
  'discovery-search',
  'search-suggestions',
  'me',
  'collection',
])

export const isPostCacheQuery = query => postCacheRoots.has(query.queryKey[0])

const matchesPost = (item, postId) => String(item?.id ?? item?._id) === String(postId)

const updateList = (items, postId, updater) => Array.isArray(items)
  ? items.map(item => matchesPost(item, postId) ? updater(item) : item)
  : items

export function updatePostCacheValue(value, postId, updater) {
  if (!value) return value
  if (Array.isArray(value)) return updateList(value, postId, updater)
  if (Array.isArray(value.pages)) {
    return {
      ...value,
      pages: value.pages.map(page => ({
        ...page,
        data: updateList(page.data, postId, updater),
      })),
    }
  }
  if (matchesPost(value, postId)) return updater(value)
  if (Array.isArray(value.posts)) return { ...value, posts: updateList(value.posts, postId, updater) }
  if (Array.isArray(value.data)) return { ...value, data: updateList(value.data, postId, updater) }
  if (value.data && typeof value.data === 'object') {
    return {
      ...value,
      data: {
        ...value.data,
        posts: updateList(value.data.posts, postId, updater),
        shorts: updateList(value.data.shorts, postId, updater),
      },
    }
  }
  return value
}

export function updatePostCaches(queryClient, postId, updater) {
  queryClient.setQueriesData({ predicate: isPostCacheQuery }, value => updatePostCacheValue(value, postId, updater))
}
