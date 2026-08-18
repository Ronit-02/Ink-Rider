import { useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAnswerReport, useAnswerUpvote, useQuestion, useQuestionAnswer, useQuestionFollow, useQuestionReport, useQuestionUpvote } from '@/features/question/hooks/useQuestions'
import useAuth from '@/features/auth/hooks/useAuth'
import AuthorMeta from '@/shared/components/ui/AuthorMeta'
import Button from '@/shared/components/ui/Button'
import PageFrame from '@/shared/components/layout/PageFrame'
import { ListSkeleton } from '@/shared/components/ui/Skeleton'

const REPORT_REASONS = [
  ['spam', 'Spam'],
  ['harassment', 'Harassment'],
  ['hate', 'Hateful content'],
  ['misinformation', 'Misinformation'],
  ['other', 'Other'],
]

function AnswerReportForm({ questionId, answerId }) {
  const [reason, setReason] = useState('spam')
  const [details, setDetails] = useState('')
  const report = useAnswerReport()
  const submit = event => { event.preventDefault(); report.mutate({ questionId, answerId, reason, details }) }
  if (report.isSuccess) return <p className="mt-3 text-[12px] text-[var(--color-text-secondary)]">Thanks. Your answer report was sent for review.</p>
  return <form onSubmit={submit} className="mt-3 max-w-[520px] rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-4">
    <label htmlFor={`answer-report-reason-${answerId}`} className="block text-[11px] font-semibold text-[var(--color-text)]">Reason</label>
    <select id={`answer-report-reason-${answerId}`} value={reason} onChange={event => setReason(event.target.value)} className="mt-2 min-h-10 w-full rounded-[9px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[12px] text-[var(--color-text)]">{REPORT_REASONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
    <label htmlFor={`answer-report-details-${answerId}`} className="mt-3 block text-[11px] font-semibold text-[var(--color-text)]">Details <span className="font-normal text-[var(--color-text-muted)]">(optional)</span></label>
    <textarea id={`answer-report-details-${answerId}`} value={details} maxLength={1000} onChange={event => setDetails(event.target.value)} className="mt-2 min-h-20 w-full rounded-[9px] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-[12px] text-[var(--color-text)]" />
    {report.isError && <p role="alert" className="mt-2 text-[12px] text-[var(--color-danger)]">{report.error?.response?.data?.message || 'The report could not be submitted.'}</p>}
    <Button type="submit" className="mt-3" disabled={report.isPending}>{report.isPending ? 'Submitting…' : 'Submit report'}</Button>
  </form>
}

function Answer({ answer, questionId }) {
  const { loggedIn, signIn } = useAuth()
  const vote = useAnswerUpvote(questionId)
  const [reportOpen, setReportOpen] = useState(false)
  const toggleVote = () => loggedIn ? vote.mutate({ questionId, answerId: answer.id, isUpvoted: !answer.isUpvoted }) : signIn()
  return <article className="border-t border-[var(--color-border)] py-5">
    <AuthorMeta author={answer.author} date={answer.createdAt} size="sm" />
    <p className="mt-3 whitespace-pre-wrap text-[14px] leading-7 text-[var(--color-text)]">{answer.text}</p>
    <button type="button" onClick={toggleVote} disabled={vote.isPending} aria-pressed={answer.isUpvoted} aria-label={`${answer.isUpvoted ? 'Remove upvote from' : 'Upvote'} answer`} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--color-border)] px-3 text-[12px] text-[var(--color-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2">
      <span aria-hidden="true">▲</span>{answer.upvotesCount}
    </button>
    <button type="button" onClick={() => loggedIn ? setReportOpen(value => !value) : signIn()} className="ml-2 inline-flex min-h-10 items-center rounded-full px-3 text-[12px] text-[var(--color-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2">{reportOpen ? 'Hide report' : 'Report answer'}</button>
    {reportOpen && <AnswerReportForm questionId={questionId} answerId={answer.id} />}
  </article>
}

function ReportForm({ questionId }) {
  const [reason, setReason] = useState('spam')
  const [details, setDetails] = useState('')
  const report = useQuestionReport(questionId)
  const submit = event => { event.preventDefault(); report.mutate({ questionId, reason, details }) }
  if (report.isSuccess) return <p className="mt-3 text-[12px] text-[var(--color-text-secondary)]">Thanks. Your report was sent for review.</p>
  return <form onSubmit={submit} className="mt-4 max-w-[520px] rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-4">
    <label htmlFor="question-report-reason" className="block text-[11px] font-semibold text-[var(--color-text)]">Reason</label>
    <select id="question-report-reason" value={reason} onChange={event => setReason(event.target.value)} className="mt-2 min-h-10 w-full rounded-[9px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[12px] text-[var(--color-text)]">
      {REPORT_REASONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
    </select>
    <label htmlFor="question-report-details" className="mt-3 block text-[11px] font-semibold text-[var(--color-text)]">Details <span className="font-normal text-[var(--color-text-muted)]">(optional)</span></label>
    <textarea id="question-report-details" value={details} maxLength={1000} onChange={event => setDetails(event.target.value)} className="mt-2 min-h-20 w-full rounded-[9px] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-[12px] text-[var(--color-text)]" />
    {report.isError && <p role="alert" className="mt-2 text-[12px] text-[var(--color-danger)]">{report.error?.response?.data?.message || 'The report could not be submitted.'}</p>}
    <Button type="submit" className="mt-3" disabled={report.isPending}>{report.isPending ? 'Submitting…' : 'Submit report'}</Button>
  </form>
}

export default function QuestionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { loggedIn, signIn } = useAuth()
  const question = useQuestion(id)
  const answer = useQuestionAnswer(id)
  const follow = useQuestionFollow(id)
  const upvote = useQuestionUpvote('hot')
  const [text, setText] = useState('')
  const [reportOpen, setReportOpen] = useState(false)
  const answerRef = useRef(null)

  if (question.isPending) return <PageFrame><ListSkeleton count={4} label="Loading question" /></PageFrame>
  if (question.isError) return <PageFrame><div><p role="alert" className="text-[13px] text-[var(--color-danger)]">This question could not be loaded.</p><Button variant="secondary" className="mt-4" onClick={() => navigate('/explore/questions')}>Back to questions</Button></div></PageFrame>
  const item = question.data
  const submitAnswer = event => { event.preventDefault(); answer.mutate({ questionId: id, text }, { onSuccess: () => { setText(''); answerRef.current?.focus() } }) }
  return <PageFrame>
    <div>
      <Link to="/explore/questions" className="inline-flex min-h-10 items-center rounded-full border border-[var(--color-border)] px-4 text-[12px] font-semibold text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2">← Questions</Link>
      <article className="mt-8">
        <AuthorMeta author={item.author} date={item.createdAt} size="sm" />
        <h1 className="mt-4 max-w-[760px] text-[clamp(1.7rem,4vw,2.7rem)] leading-[1.12] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>{item.text}</h1>
        {item.context && <p className="mt-4 max-w-[700px] text-[15px] leading-7 text-[var(--color-text-secondary)]">{item.context}</p>}
        <div className="mt-4 flex flex-wrap gap-2">{item.tags.map(tag => <span key={tag} className="rounded-full bg-[var(--color-bg-alt)] px-2.5 py-1 text-[11px] text-[var(--color-text-secondary)]">#{tag}</span>)}</div>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => loggedIn ? upvote.mutate({ questionId: id, isUpvoted: !item.isUpvoted }) : signIn()} disabled={upvote.isPending} aria-pressed={item.isUpvoted} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--color-border)] px-4 text-[12px] font-semibold text-[var(--color-text)]">▲ {item.upvotesCount}</button>
          <Button variant="secondary" onClick={() => loggedIn ? follow.mutate({ questionId: id, isFollowing: !item.isFollowing }) : signIn()} disabled={follow.isPending}>{item.isFollowing ? 'Following question' : 'Follow question'}</Button>
          <Button variant="ghost" onClick={() => loggedIn ? setReportOpen(value => !value) : signIn()}>{reportOpen ? 'Hide report' : 'Report question'}</Button>
        </div>
        {reportOpen && <ReportForm questionId={id} />}
      </article>
      <section className="mt-12 max-w-[760px]" aria-labelledby="answers-title">
        <div className="flex items-baseline justify-between gap-4"><h2 id="answers-title" className="text-[20px] font-bold text-[var(--color-text)]">Answers ({item.answers.length})</h2><span className="text-[12px] text-[var(--color-text-muted)]">{item.followersCount} following</span></div>
        {item.answers.length ? <div className="mt-4">{item.answers.map(answerItem => <Answer key={answerItem.id} answer={answerItem} questionId={id} />)}</div> : <p className="mt-4 text-[13px] text-[var(--color-text-muted)]">No short answers yet. Add useful context for the writers who find this request.</p>}
        {loggedIn ? <form onSubmit={submitAnswer} className="mt-6 rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-4"><label htmlFor="question-answer" className="block text-[12px] font-semibold text-[var(--color-text)]">Add an answer</label><textarea ref={answerRef} id="question-answer" value={text} minLength={10} maxLength={1000} required onChange={event => setText(event.target.value)} className="mt-2 min-h-28 w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-[13px] text-[var(--color-text)]" aria-describedby="question-answer-help" /><p id="question-answer-help" className="mt-1 text-right text-[11px] text-[var(--color-text-muted)]">{text.length}/1,000 characters</p>{answer.isError && <p role="alert" className="mt-2 text-[12px] text-[var(--color-danger)]">{answer.error?.response?.data?.message || 'The answer could not be posted.'}</p>}<Button type="submit" className="mt-3" disabled={text.trim().length < 10 || answer.isPending}>{answer.isPending ? 'Posting…' : 'Post answer'}</Button></form> : <p className="mt-6 text-[13px] text-[var(--color-text-secondary)]"><button type="button" onClick={signIn} className="font-semibold text-[var(--color-accent)]">Sign in</button> to add an answer.</p>}
      </section>
      {item.responsePosts.length > 0 && <section className="mt-12 max-w-[760px]" aria-labelledby="response-posts-title"><h2 id="response-posts-title" className="text-[20px] font-bold text-[var(--color-text)]">Published responses</h2><div className="mt-4 space-y-2">{item.responsePosts.map(post => <Link key={post._id} to={`/post/${post._id}`} className="block rounded-[10px] border border-[var(--color-border)] p-4 text-[13px] font-semibold text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2">{post.title}</Link>)}</div></section>}
    </div>
  </PageFrame>
}
