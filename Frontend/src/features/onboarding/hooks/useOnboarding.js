import { useMutation, useQuery } from '@tanstack/react-query'
import { fetchOnboarding, saveOnboarding } from '../api/onboarding'
import useToast from '@/shared/hooks/useToast'

export function useOnboardingOptions() {
  return useQuery({ queryKey: ['onboarding'], queryFn: fetchOnboarding })
}

export function useSaveOnboarding() {
  const { notify } = useToast()
  return useMutation({ mutationFn: saveOnboarding, onSuccess: () => notify('Interests saved.'), onError: () => notify('Your interests could not be saved.', { tone: 'error' }) })
}
