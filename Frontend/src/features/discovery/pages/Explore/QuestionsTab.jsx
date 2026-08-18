import { useDeferredValue, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import AuthorMeta from '@/shared/components/ui/AuthorMeta'
import Button from '@/shared/components/ui/Button'
import Pill from '@/shared/components/ui/Pill'
import useAuth from '@/features/auth/hooks/useAuth'
import { useCreateQuestion, useQuestions, useQuestionSuggestions, useQuestionUpvote } from '@/features/question/hooks/useQuestions'
import PageHeader from '@/shared/components/ui/PageHeader'
import { ListSkeleton } from '@/shared/components/ui/Skeleton'
import FilterBar from '@/shared/components/ui/FilterBar'
import useDialogFocus from '@/shared/hooks/useDialogFocus'
import { searchDiscovery } from '@/features/discovery/api/search'

function QuestionCard({ question, sort }) {
  const { loggedIn, signIn } = useAuth()
  const vote = useQuestionUpvote(sort)
  const toggleVote = () => loggedIn
    ? vote.mutate({ questionId: question.id, isUpvoted: !question.isUpvoted })
    : signIn()

  return (
    <article className="py-6 border-b border-[var(--color-border)]">
      <div className="flex gap-4 items-start">
        <button type="button" onClick={toggleVote} disabled={vote.isPending} aria-pressed={question.isUpvoted} aria-label={`${question.isUpvoted ? 'Remove upvote from' : 'Upvote'} question`}
          className={`shrink-0 min-w-12 px-2 py-2 rounded-[12px] border text-center ${question.isUpvoted ? 'bg-[var(--color-accent)] text-[var(--color-text-inverted)] border-[var(--color-accent)]' : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}>
          <span aria-hidden="true" className="block text-[11px]">▲</span><span className="block text-[12px] font-semibold">{question.upvotesCount}</span>
        </button>
        <div className="min-w-0 flex-1">
          <AuthorMeta author={question.author} date={question.createdAt} size="sm" />
          <h2 className="mt-3 text-[18px] leading-[1.35] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}><Link to={`/explore/questions/${question.id}`} className="rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2">{question.text}</Link></h2>
          {question.context && <p className="mt-2 text-[13px] leading-6 text-[var(--color-text-secondary)] line-clamp-2">{question.context}</p>}
          <div className="mt-3 flex flex-wrap gap-2">{question.tags.map(tag => <span key={tag} className="px-2 py-1 rounded-full bg-[var(--color-bg-alt)] text-[11px] text-[var(--color-text-secondary)]">#{tag}</span>)}</div>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-[12px]">
            <span className="text-[var(--color-text-muted)]">{question.answersCount} short answers · {question.responsePosts.length} article responses</span>
            {loggedIn ? <Link to={`/write?question=${question.id}`} className="rounded-[4px] font-semibold text-[var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2">Write an article response</Link> : <button type="button" onClick={signIn} className="rounded-[4px] font-semibold text-[var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2">Write an article response</button>}
          </div>
          {question.responsePosts.length > 0 && <div className="mt-4 border-l-2 border-[var(--color-accent)] pl-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">Published responses</p>
            {question.responsePosts.map(post => <Link key={post._id} to={`/post/${post._id}`} className="block rounded-[4px] py-1 text-left text-[13px] font-semibold text-[var(--color-text)] hover:text-[var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2">{post.title}</Link>)}
          </div>}
        </div>
      </div>
    </article>
  )
}

function AskModal({ onClose }) {
  const closeButtonRef = useRef(null)
  const dialogRef = useDialogFocus(onClose, closeButtonRef)
  const [text, setText] = useState('')
  const [context, setContext] = useState('')
  const [tagText, setTagText] = useState('')
  const [targetWriterText, setTargetWriterText] = useState('')
  const [targetWriters, setTargetWriters] = useState([])
  const deferredText = useDeferredValue(text)
  const deferredTargetWriterText = useDeferredValue(targetWriterText)
  const suggestions = useQuestionSuggestions(deferredText)
  const writerSuggestions = useQuery({
    queryKey: ['question-target-writers', deferredTargetWriterText.trim()],
    queryFn: () => searchDiscovery({ query: deferredTargetWriterText.trim(), type: 'writers', limit: 5 }),
    enabled: deferredTargetWriterText.trim().length >= 2,
    staleTime: 30_000,
  })
  const create = useCreateQuestion()

  const submit = event => {
    event?.preventDefault()
    create.mutate({
    text,
    context,
    tags: tagText.split(',').map(tag => tag.trim()).filter(Boolean),
    targetWriterIds: targetWriters.map(writer => writer.id),
    })
  }

  return <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/45" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}>
    <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="ask-title" tabIndex={-1} className="w-full max-w-[560px] max-h-[90vh] overflow-y-auto rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_16px_48px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between gap-4"><h2 id="ask-title" className="text-[19px] font-bold text-[var(--color-text)]">Ask the community</h2><button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Close" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)]">×</button></div>
      {create.isSuccess ? <div className="py-8"><h3 className="text-[17px] font-semibold text-[var(--color-text)]">{create.data.mergedExisting ? 'Your upvote was added to the existing question.' : 'Your question is now open to writers.'}</h3><Button className="mt-5" onClick={onClose}>Done</Button></div> : <form onSubmit={submit}>
        <label htmlFor="question-text" className="block mt-6 mb-2 text-[12px] font-semibold text-[var(--color-text)]">Question</label>
        <textarea id="question-text" value={text} minLength={10} maxLength={180} required onChange={event => setText(event.target.value)} placeholder="What would you like a writer to explore?" className="w-full min-h-24 rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-3 text-[14px] text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]" />
        {suggestions.data?.length > 0 && <div className="mt-3 rounded-[12px] border border-[var(--color-border)] p-3"><p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Similar questions</p>{suggestions.data.map(item => <button key={item.id} type="button" onClick={() => setText(item.text)} className="block w-full py-2 text-left text-[12px] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">{item.text} · {item.upvotesCount} upvotes {item.exact ? '· exact match' : ''}</button>)}</div>}
        <label htmlFor="question-context" className="block mt-4 mb-2 text-[12px] font-semibold text-[var(--color-text)]">Context <span className="font-normal text-[var(--color-text-muted)]">(optional)</span></label>
        <textarea id="question-context" value={context} maxLength={1000} onChange={event => setContext(event.target.value)} className="w-full min-h-20 rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-3 text-[13px] text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]" />
        <label htmlFor="question-tags" className="block mt-4 mb-2 text-[12px] font-semibold text-[var(--color-text)]">Tags <span className="font-normal text-[var(--color-text-muted)]">(comma separated, up to five)</span></label>
        <input id="question-tags" value={tagText} onChange={event => setTagText(event.target.value)} className="w-full rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] px-3 py-2.5 text-[13px] text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]" />
        <label htmlFor="question-target-writers" className="block mt-4 mb-2 text-[12px] font-semibold text-[var(--color-text)]">Target writers <span className="font-normal text-[var(--color-text-muted)]">(optional, up to five)</span></label>
        <input id="question-target-writers" value={targetWriterText} onChange={event => setTargetWriterText(event.target.value)} placeholder="Search by writer name or handle" className="w-full rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] px-3 py-2.5 text-[13px] text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]" />
        {targetWriters.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{targetWriters.map(writer => <button key={writer.id} type="button" onClick={() => setTargetWriters(current => current.filter(item => item.id !== writer.id))} className="min-h-10 rounded-full bg-[var(--color-text)] px-3 text-[11px] text-[var(--color-text-inverted)]">{writer.displayName} ×</button>)}</div>}
        {writerSuggestions.data?.data?.writers?.filter(writer => !targetWriters.some(selected => selected.id === writer.id)).length > 0 && <div className="mt-2 rounded-[12px] border border-[var(--color-border)] p-2">{writerSuggestions.data.data.writers.filter(writer => !targetWriters.some(selected => selected.id === writer.id)).map(writer => <button key={writer.id} type="button" disabled={targetWriters.length >= 5} onClick={() => { setTargetWriters(current => [...current, writer]); setTargetWriterText('') }} className="block min-h-10 w-full rounded-[8px] px-2 text-left text-[12px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)] disabled:opacity-50">{writer.displayName} <span className="text-[var(--color-text-muted)]">@{writer.handle}</span></button>)}</div>}
        {create.isError && <p role="alert" className="mt-3 text-[12px] text-[var(--color-danger)]">{create.error?.response?.data?.message || 'The question could not be posted.'}</p>}
        <div className="mt-5 flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" disabled={text.trim().length < 10 || create.isPending}>{create.isPending ? 'Posting…' : 'Post question'}</Button></div>
      </form>}
    </section>
  </div>
}

export default function QuestionsTab() {
  const [params, setParams] = useSearchParams()
  const requestedSort = params.get('questionSort')
  const requestedTopic = params.get('questionTopic')
  const sort = ['hot', 'newest'].includes(requestedSort) ? requestedSort : 'hot'
  const topic = ['all', 'science', 'career', 'wellness'].includes(requestedTopic) ? requestedTopic : 'all'
  const [showAsk, setShowAsk] = useState(false)
  const { loggedIn, signIn } = useAuth()
  const query = useQuestions(sort)
  const questions = query.data?.pages.flatMap(page => page.data) || []
  const filteredQuestions = topic === 'all' ? questions : questions.filter(question => (question.tags || []).some(tag => tag.toLowerCase() === topic))

  const updateFilter = (key, value, defaultValue) => {
    setParams(current => {
      const next = new URLSearchParams(current)
    if (value === defaultValue) next.delete(key)
    else next.set(key, value)
      return next
    })
  }

  return <div>
    <PageHeader eyebrow="Reader demand" title="What should writers explore next?" description="Ask for the article you wish existed. Duplicate requests become upvotes, helping writers see real demand." actions={<Button onClick={() => loggedIn ? setShowAsk(true) : signIn()}><span aria-hidden="true" className="mr-1 text-[17px] leading-none">+</span>Ask a question</Button>} />
    <div className="mb-6 flex justify-end"><FilterBar label="Topic" value={topic} onChange={value => updateFilter('questionTopic', value, 'all')} options={[{ id: 'all', label: 'All' }, { id: 'science', label: 'Science' }, { id: 'career', label: 'Career' }, { id: 'wellness', label: 'Wellness' }]} sortOptions={[{ id: 'hot', label: 'Most upvoted' }, { id: 'newest', label: 'Newest' }]} sortValue={sort} onSortChange={value => updateFilter('questionSort', value, 'hot')} /></div>
    {query.isPending && <ListSkeleton count={4} label="Loading reader questions" />}
    {query.isError && <div role="alert" className="py-12 text-center"><p className="text-[13px] text-[var(--color-danger)]">Questions could not be loaded.</p><Button className="mt-4" variant="secondary" onClick={() => query.refetch()}>Try again</Button></div>}
    {!query.isPending && !query.isError && filteredQuestions.length === 0 && <p className="py-12 text-center text-[13px] text-[var(--color-text-muted)]">No questions match this topic.</p>}
    {filteredQuestions.map(question => <QuestionCard key={question.id} question={question} sort={sort} />)}
    {query.hasNextPage && <div className="pt-8 text-center"><Button variant="secondary" onClick={() => query.fetchNextPage()} disabled={query.isFetchingNextPage}>{query.isFetchingNextPage ? 'Loading…' : 'Load more'}</Button></div>}
    {showAsk && <AskModal onClose={() => setShowAsk(false)} />}
  </div>
}
