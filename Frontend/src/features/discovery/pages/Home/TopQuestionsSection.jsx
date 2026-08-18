/* TopQuestionsSection — teaser showing hot questions, drives curiosity */
import { Link } from 'react-router-dom'
import SectionHeading from '@/shared/components/ui/SectionHeading'
import Button from '@/shared/components/ui/Button'
import { useQuestions } from '@/features/question/hooks/useQuestions'
import { ListSkeleton } from '@/shared/components/ui/Skeleton'

export default function TopQuestionsSection() {
  const query = useQuestions('hot')
  const questions = query.data?.pages.flatMap(page => page.data).slice(0, 4) || []

  return (
    <div className="fade-in fade-in-3 mb-13">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <SectionHeading>
            Hot Questions
          </SectionHeading>
          <p className="text-[13px] text-(--color-text-secondary) mt-1">
            What the writing community is curious about right now
          </p>
        </div>
        <Link to="/explore/questions" className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-[18px] py-2 text-[13px] font-medium text-[var(--color-text)] transition-all duration-150 hover:bg-[var(--color-bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 sm:min-h-0">
          See all →
        </Link>
      </div>

      {query.isPending && <ListSkeleton count={3} label="Loading reader questions" />}
      {query.isError && <div role="alert" className="py-8"><p className="text-[13px] text-[var(--color-danger)]">Questions could not be loaded.</p><Button className="mt-3" variant="secondary" onClick={() => query.refetch()}>Try again</Button></div>}
      {!query.isPending && !query.isError && questions.length === 0 && <p className="py-8 text-[13px] text-[var(--color-text-muted)]">No open questions yet.</p>}
      <div className="grid gap-0">
        {questions.map(q => (
          <Link key={q.id} to="/explore/questions"
            className="flex items-start gap-4 py-4 border-b border-[var(--color-border-light)]
              hover:bg-[var(--color-surface-hover)] -mx-2 px-2 rounded transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2">
            {/* Upvote count */}
            <div className="flex-shrink-0 w-10 text-center">
              <p className="font-bold text-[16px] text-[var(--color-text)]">{q.upvotesCount}</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">votes</p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[14px] text-[var(--color-text)] leading-[1.45]">{q.text}</p>
              <p className="text-[12px] text-[var(--color-text-muted)] mt-1">{q.answersCount} answers</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
