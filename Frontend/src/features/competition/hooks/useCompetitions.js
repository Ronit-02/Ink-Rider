import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchCompetition, fetchCompetitions, fetchEligiblePosts, submitEntry, updateEntryVote } from '../api/competitions'
import useToast from '@/shared/hooks/useToast'

export const useCompetitions = () => useQuery({ queryKey: ['competitions'], queryFn: fetchCompetitions })
export const useCompetition = id => useQuery({ queryKey: ['competition', id], queryFn: () => fetchCompetition(id), enabled: Boolean(id) })
export const useEligiblePosts = (id, enabled) => useQuery({ queryKey: ['competition-eligible-posts', id], queryFn: () => fetchEligiblePosts(id), enabled })
export const useSubmitEntry = id => { const client = useQueryClient(); const { notify } = useToast(); return useMutation({ mutationFn: body => submitEntry({ competitionId: id, ...body }), onSuccess: () => { client.invalidateQueries({ queryKey: ['competition', id] }); notify('Competition entry submitted.') }, onError: () => notify('The competition entry could not be submitted.', { tone: 'error' }) }) }
export const useEntryVote = id => { const client = useQueryClient(); const { notify } = useToast(); return useMutation({ mutationFn: input => updateEntryVote({ competitionId: id, ...input }), onSuccess: (_, input) => { client.invalidateQueries({ queryKey: ['competition', id] }); notify(input.isVoted ? 'Vote recorded.' : 'Vote removed.') }, onError: () => notify('The competition vote could not be updated.', { tone: 'error' }) }) }
