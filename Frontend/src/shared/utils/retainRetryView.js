// A failed no-data query resets to pending during refetch. Keep its existing
// recovery view mounted so the Retry control can communicate that request.
// Query data, cache state, refetch promises, and first-load skeletons are intact.
export default function retainRetryView(query) {
  if (!query.isPending || !query.isFetching || !query.errorUpdatedAt) return query
  return { ...query, isPending: false, isLoading: false, isError: true }
}
