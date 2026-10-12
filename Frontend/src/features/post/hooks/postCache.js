const postCacheRoots = new Set([
  'post',
  'discovery-feed',
  'shorts',
  'discovery-search',
  'search-suggestions',
  'me',
  'collection',
  'writer',
  'reading-history',
  'early-access',
  'short-series',
  'competition',
  'competitions',
  'question',
  'questions',
])

export const isPostCacheQuery = query => postCacheRoots.has(query.queryKey[0])

const matchesPost = (item, postId) => String(item?.id ?? item?._id) === String(postId)

export function updatePostCacheValue(value, postId, updater) {
  if (!value || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(item => updatePostCacheValue(item, postId, updater))
  // Competition entries have their own vote count; only their nested post is a story.
  if (value.post) return { ...value, post: updatePostCacheValue(value.post, postId, updater) }
  if (matchesPost(value, postId)) return updater(value)
  let result = value
  for (const key of ['pages', 'data', 'posts', 'shorts', 'history', 'continueReading', 'responsePosts', 'entries']) {
    if (value[key] && typeof value[key] === 'object') {
      result = { ...result, [key]: updatePostCacheValue(value[key], postId, updater) }
    }
  }
  return result
}

export function updatePostCaches(queryClient, postId, updater) {
  queryClient.setQueriesData({ predicate: isPostCacheQuery }, value => updatePostCacheValue(value, postId, updater))
}
