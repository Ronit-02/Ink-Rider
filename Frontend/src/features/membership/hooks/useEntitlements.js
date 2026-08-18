import { useQuery } from '@tanstack/react-query'
import { fetchEntitlements } from '../api/membership'

export const entitlementKey = ['me', 'entitlements']

export default function useEntitlements(enabled = true) {
  return useQuery({
    queryKey: entitlementKey,
    queryFn: fetchEntitlements,
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}
