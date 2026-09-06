import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createQuestion, createQuestionAnswer, declineQuestion, fetchQuestion, fetchQuestionOpportunities, fetchQuestions, reportAnswer, reportQuestion, suggestQuestions, updateAnswerUpvote, updateQuestionClaim, updateQuestionFollow, updateQuestionUpvote } from '../api/questions'
import useToast from '@/shared/hooks/useToast'

export function useQuestions(sort) {
  return useInfiniteQuery({
    queryKey: ['questions', sort],
    queryFn: ({ pageParam }) => fetchQuestions({ sort, cursor: pageParam }),
    initialPageParam: null,
    getNextPageParam: page => page.meta.nextCursor || undefined,
  })
}

export function useQuestion(questionId) {
  return useQuery({ queryKey: ['question', questionId], queryFn: () => fetchQuestion(questionId), enabled: Boolean(questionId) })
}

export function useQuestionOpportunities() {
  return useQuery({ queryKey: ['question-opportunities'], queryFn: fetchQuestionOpportunities, staleTime: 30_000 })
}

export function useQuestionClaim() {
  const queryClient = useQueryClient()
  const { notify } = useToast()
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['question-opportunities'] })
  return {
    claim: useMutation({ mutationFn: updateQuestionClaim, onSuccess: data => { refresh(); notify(data.isClaimed ? 'Question claimed.' : 'Question released.') }, onError: error => notify(error?.response?.data?.message || 'The claim could not be updated.', { tone: 'error' }) }),
    decline: useMutation({ mutationFn: declineQuestion, onSuccess: () => { refresh(); notify('Question removed from your opportunities.') }, onError: () => notify('The question could not be declined.', { tone: 'error' }) }),
  }
}

export function useQuestionSuggestions(query) {
  return useQuery({
    queryKey: ['question-suggestions', query.trim()],
    queryFn: () => suggestQuestions(query.trim()),
    enabled: query.trim().length >= 4,
    staleTime: 30_000,
  })
}

export function useCreateQuestion() {
  const queryClient = useQueryClient()
  const { notify } = useToast()
  return useMutation({
    mutationFn: createQuestion,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['questions'] }); notify('Question posted.') },
    onError: () => notify('The question could not be posted.', { tone: 'error' }),
  })
}

export function useQuestionUpvote(sort) {
  const queryClient = useQueryClient()
  const { notify } = useToast()
  return useMutation({
    mutationFn: updateQuestionUpvote,
    onMutate: async ({ questionId, isUpvoted }) => {
      const key = ['questions', sort]
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData(key)
      queryClient.setQueryData(key, old => old ? {
        ...old,
        pages: old.pages.map(page => ({ ...page, data: page.data.map(question => question.id === questionId ? {
          ...question, isUpvoted, upvotesCount: Math.max(0, question.upvotesCount + (isUpvoted ? 1 : -1)),
        } : question) })),
      } : old)
      return { previous, key }
    },
    onSuccess: (data, { questionId, isUpvoted }, context) => {
      queryClient.setQueryData(context.key, old => old ? {
        ...old,
        pages: old.pages.map(page => ({ ...page, data: page.data.map(question => question.id === questionId ? { ...question, ...data } : question) })),
      } : old)
      queryClient.invalidateQueries({ queryKey: ['question', questionId] })
      notify(isUpvoted ? 'Question upvoted.' : 'Question upvote removed.')
    },
    onError: (error, variables, context) => { if (context?.previous) queryClient.setQueryData(context.key, context.previous); notify('The question vote could not be updated.', { tone: 'error' }) },
  })
}

export function useQuestionAnswer(questionId) {
  const queryClient = useQueryClient()
  const { notify } = useToast()
  return useMutation({
    mutationFn: createQuestionAnswer,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['question', questionId] }); queryClient.invalidateQueries({ queryKey: ['questions'] }); notify('Answer posted.') },
    onError: error => notify(error?.response?.data?.message || 'The answer could not be posted.', { tone: 'error' }),
  })
}

export function useAnswerUpvote(questionId) {
  const queryClient = useQueryClient()
  const { notify } = useToast()
  return useMutation({
    mutationFn: updateAnswerUpvote,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['question', questionId] }),
    onError: () => notify('The answer vote could not be updated.', { tone: 'error' }),
  })
}

export function useQuestionFollow(questionId) {
  const queryClient = useQueryClient()
  const { notify } = useToast()
  return useMutation({
    mutationFn: updateQuestionFollow,
    onSuccess: data => { queryClient.setQueryData(['question', questionId], old => old ? { ...old, ...data } : old); notify(data.isFollowing ? 'Question followed.' : 'Question unfollowed.') },
    onError: () => notify('The question follow state could not be updated.', { tone: 'error' }),
  })
}

export function useQuestionReport(questionId) {
  const { notify } = useToast()
  return useMutation({ mutationFn: reportQuestion, onSuccess: data => notify(data.alreadyReported ? 'You already reported this question.' : 'Question report submitted.'), onError: error => notify(error?.response?.data?.message || 'The question report could not be submitted.', { tone: 'error' }) })
}

export function useAnswerReport() {
  const { notify } = useToast()
  return useMutation({ mutationFn: reportAnswer, onSuccess: data => notify(data.alreadyReported ? 'You already reported this answer.' : 'Answer report submitted.'), onError: error => notify(error?.response?.data?.message || 'The answer report could not be submitted.', { tone: 'error' }) })
}
